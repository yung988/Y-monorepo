export const runtime = "nodejs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { createPacketaShipment } from "@/lib/packeta";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Authenticate admin request
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const supabase = await createClient();
    const { id: orderId } = await params;

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Objednávka nenalezena" }, { status: 404 });
    }

    // Check if shipment already exists
    if (order.packeta_label_id) {
      return NextResponse.json({ error: "Zásilka již byla vytvořena" }, { status: 400 });
    }

    // Check if order has Packeta pickup point
    if (!order.packeta_pickup_point_id) {
      return NextResponse.json(
        { error: "Objednávka nemá vybrané výdejní místo Zásilkovny" },
        { status: 400 },
      );
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
      weight: 1.0, // Default weight - could be calculated from order items
      cashOnDelivery: 0, // For prepaid orders
    };

    console.log("Creating Packeta shipment with data:", orderData);

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
      .eq("id", orderId);

    if (updateError) {
      console.error("Failed to update order with Packeta data:", updateError);
      return NextResponse.json({ error: "Chyba při aktualizaci objednávky" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Zásilka byla úspěšně vytvořena",
      packetaId: packetaResult.id,
      trackingNumber: packetaResult.barcode || packetaResult.id,
    });
  } catch (error: unknown) {
    console.error("Error creating Packeta shipment:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Chyba při vytváření zásilky",
        details: message,
      },
      { status: 500 },
    );
  }
}
