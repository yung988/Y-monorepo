import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireAdminOrEditor } from "@/lib/api-auth";
import { createClient } from "@/utils/supabase/server";
import { generatePacketaLabel } from "@/lib/packeta";

export async function GET(request: NextRequest) {
  // Authenticate admin request
  const authResult = await requireAdminOrEditor(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    // Získat objednávku z databáze
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    if (!order.packeta_label_id) {
      return NextResponse.json({ success: false, error: "No Packeta label available" }, { status: 404 });
    }

    // Získat štítek z Packeta API přes SOAP helper
    const label = await generatePacketaLabel(order.packeta_label_id);
    const pdfBase64 = (label as any).pdf as string;
    const pdfBuffer = Buffer.from(pdfBase64, "base64");

    // Vrátit PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="packeta-${order.order_number || order.id}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error fetching Packeta label:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch label" }, { status: 500 });
  }
}
