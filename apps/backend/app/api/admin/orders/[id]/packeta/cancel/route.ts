import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireAdminOrEditor } from "@/lib/api-auth";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Authenticate admin request
  const authResult = await requireAdminOrEditor(request);
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

    // Check if shipment exists
    if (!order.packeta_label_id) {
      return NextResponse.json({ error: "Zásilka nebyla vytvořena" }, { status: 400 });
    }

    // Check if already printed (cannot cancel printed shipments)
    if (order.packeta_printed) {
      return NextResponse.json({ error: "Nelze zrušit vytištěnou zásilku" }, { status: 400 });
    }

    // Update order in database - remove Packeta data
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        packeta_label_id: null,
        packeta_tracking_number: null,
        packeta_printed: false,
        packeta_printed_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Failed to cancel Packeta shipment:", updateError);
      return NextResponse.json({ error: "Chyba při rušení zásilky" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Zásilka byla úspěšně zrušena",
    });
  } catch (error: unknown) {
    console.error("Error canceling Packeta shipment:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Chyba při rušení zásilky",
        details: message,
      },
      { status: 500 },
    );
  }
}
