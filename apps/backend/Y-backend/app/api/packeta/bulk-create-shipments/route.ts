import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { createPacketaShipment } from "@/lib/packeta";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  // Authenticate admin request
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { orderIds, weight, width, height, depth } = await request.json();

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: "Order IDs jsou povinné" }, { status: 400 });
    }

    if (!weight || weight <= 0) {
      return NextResponse.json({ error: "Váha je povinná a musí být větší než 0" }, { status: 400 });
    }

    const supabase = await createClient();

    // Získej všechny objednávky
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .in("id", orderIds);

    if (ordersError || !orders) {
      console.error("Chyba při načítání objednávek:", ordersError);
      return NextResponse.json({ error: "Chyba při načítání objednávek" }, { status: 500 });
    }

    const results = {
      successCount: 0,
      errorCount: 0,
      errors: [] as string[],
    };

    // Zpracuj každou objednávku
    for (const order of orders) {
      try {
        // Kontroly
        if (order.packeta_label_id) {
          results.errors.push(`Objednávka ${order.order_number || order.id.slice(0, 8)}: Zásilka již existuje`);
          results.errorCount++;
          continue;
        }

        if (!order.packeta_pickup_point_id && order.shipping_method !== "Packeta") {
          results.errors.push(`Objednávka ${order.order_number || order.id.slice(0, 8)}: Nemá vybrané výdejní místo Packeta`);
          results.errorCount++;
          continue;
        }

        // Parse customer name
        const nameParts = (order.customer_name || "").split(" ");
        const customerName = nameParts[0] || "Unknown";
        const customerSurname = nameParts.slice(1).join(" ") || "Customer";

        // Prepare order data for Packeta
        const orderData = {
          orderNumber: order.order_number || order.id.slice(0, 8),
          customerName,
          customerSurname,
          customerEmail: order.customer_email,
          customerPhone: order.customer_phone || "",
          pickupPointId: order.packeta_pickup_point_id,
          orderValue: order.total_amount / 100, // Convert cents to koruny
          weight: weight,
          width: width || undefined,
          height: height || undefined,
          depth: depth || undefined,
          cashOnDelivery: 0, // For prepaid orders
        };

        console.log(`Creating Packeta shipment for order ${order.id}:`, orderData);

        // Create shipment in Packeta
        const packetaResult = await createPacketaShipment(orderData);

        if (!packetaResult?.id) {
          throw new Error("Packeta nevrátila ID zásilky");
        }

        // Update order in database
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            packeta_label_id: packetaResult.id,
            packeta_tracking_number: packetaResult.barcode || packetaResult.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);

        if (updateError) {
          console.error(`Failed to update order ${order.id} with Packeta data:`, updateError);
          results.errors.push(`Objednávka ${order.order_number || order.id.slice(0, 8)}: Chyba při aktualizaci databáze`);
          results.errorCount++;
          continue;
        }

        results.successCount++;
        console.log(`✅ Zásilka vytvořena pro objednávku ${order.id}: ${packetaResult.id}`);

      } catch (error: any) {
        console.error(`Error creating shipment for order ${order.id}:`, error);
        results.errors.push(`Objednávka ${order.order_number || order.id.slice(0, 8)}: ${error.message}`);
        results.errorCount++;
      }
    }

    // Prepare response
    const response = {
      success: results.successCount > 0,
      successCount: results.successCount,
      errorCount: results.errorCount,
      totalCount: orders.length,
      message: `Vytvořeno ${results.successCount} zásilek z ${orders.length} objednávek`,
    };

    // Add errors if any
    if (results.errors.length > 0) {
      (response as any).errors = results.errors;
    }

    return NextResponse.json(response);

  } catch (error: unknown) {
    console.error("Error in bulk create shipments:", error);
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: "Chyba při hromadném vytváření zásilek",
        details,
      },
      { status: 500 },
    );
  }
}
