import { NextRequest, NextResponse } from "next/server";
import { sendOrderStatusUpdateEmail } from "@/lib/email/sendEmail";
import { createPacketaShipment } from "@/lib/packeta";
import { createClient } from "@/utils/supabase/server";
import { requireAdminOrEditor } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  // Admin ochrana
  const authResult = await requireAdminOrEditor(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { orderId, weight, width, height, depth } = await request.json();

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID je povinné" }, { status: 400 });
    }

    const supabase = await createClient();

    // Získej data objednávky ze Supabase
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      console.error("Chyba při načítání objednávky:", error);
      return NextResponse.json({ success: false, error: "Objednávka nenalezena" }, { status: 404 });
    }

    if (!order.packeta_pickup_point_id) {
      return NextResponse.json(
        { success: false, error: "Objednávka nemá vybrané výdejní místo Packeta" },
        { status: 400 },
      );
    }

    if (order.packeta_label_id) {
      return NextResponse.json({ success: false, error: "Zásilka už byla vytvořena" }, { status: 400 });
    }

    // Rozdělení jména na jméno a příjmení
    const nameParts = order.customer_name?.split(" ") || ["", ""];
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Výpočet váhy z objednávky, pokud není dodána
    let finalWeight = Number(weight) || Number(order.total_weight) || 0;
    if (!finalWeight || finalWeight <= 0) {
      try {
        const { data: items } = await supabase
          .from("order_items")
          .select("product_id, variant_id, quantity")
          .eq("order_id", order.id);

        const variantIds = (items || []).map((it: any) => it.variant_id).filter((v: any) => !!v);
        const productIds = (items || []).map((it: any) => it.product_id).filter((p: any) => !!p);

        const { data: variants } = variantIds.length
          ? await supabase.from("product_variants").select("id, weight, product_id").in("id", variantIds)
          : { data: [] as any[] } as any;
        const { data: products } = productIds.length
          ? await supabase.from("products").select("id, weight").in("id", productIds)
          : { data: [] as any[] } as any;

        const vMap = new Map((variants || []).map((v: any) => [v.id, v]));
        const pMap = new Map((products || []).map((p: any) => [p.id, p]));
        for (const it of items || []) {
          const v = it.variant_id ? vMap.get(it.variant_id) : undefined;
          const p = it.product_id ? pMap.get(it.product_id) : undefined;
          const w = (v?.weight ?? p?.weight ?? 0.25) as number;
          finalWeight += (Number(w) || 0.25) * (it.quantity || 1);
        }
      } catch (wErr) {
        console.warn("Failed to compute weight for Packeta, default 1kg:", wErr);
        finalWeight = 1.0;
      }
    }

    // Vytvoř zásilku v Packeta
    const shipment = await createPacketaShipment({
      orderNumber: order.order_number || order.id,
      customerName: firstName,
      customerSurname: lastName,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone || "",
      pickupPointId: order.packeta_pickup_point_id,
      cashOnDelivery: 0, // Dobírka se řeší jinde, zde 0
      orderValue: (order.total_amount || 0) / 100, // posílat v Kč
      weight: finalWeight,
      width: width,
      height: height,
      depth: depth,
    });

    // Ulož tracking info do Supabase
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        packeta_label_id: shipment.id,
        packeta_tracking_number: shipment.barcode || shipment.id,
        status: order.status === "pending" ? "processing" : order.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Chyba při aktualizaci objednávky:", updateError);
      return NextResponse.json({ success: false, error: "Chyba při ukládání tracking informací" }, { status: 500 });
    }

    // Send shipping notification (neblokující)
    try {
      await sendOrderStatusUpdateEmail({
        to: order.customer_email,
        orderNumber: order.order_number || order.id.toString(),
        customerName: order.customer_name,
        newStatus: "processing",
        message: "Vaše objednávka byla odeslána.",
      });
      console.log("Shipping notification email sent successfully");
    } catch (emailError) {
      console.error("Failed to send shipping notification email:", emailError);
      // Nezastavujeme flow
    }

    return NextResponse.json({
      success: true,
      data: { shipment },
      message: "Zásilka byla úspěšně vytvořena",
    });
  } catch (error: unknown) {
    console.error("Chyba při vytváření zásilky:", error);
    const err: any = error;
    return NextResponse.json(
      {
        success: false,
        error: `Chyba při vytváření zásilky: ${err?.message || "Neznámá chyba"}`,
      },
      { status: 500 },
    );
  }
}
