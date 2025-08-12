import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { orderIds } = await request.json();

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: "Order IDs jsou povinné" }, { status: 400 });
    }

    const supabase = await createClient();

    // Označ objednávky jako vytištěné
    const { error } = await supabase
      .from("orders")
      .update({
        packeta_printed: true,
        packeta_printed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .in("id", orderIds);

    if (error) {
      console.error("Chyba při označování objednávek jako vytištěných:", error);
      return NextResponse.json({ error: "Chyba při označování objednávek" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `${orderIds.length} objednávek bylo označeno jako vytištěno`,
    });
  } catch (error: unknown) {
    console.error("Chyba při označování objednávek:", error);
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: `Chyba při označování objednávek: ${details}`,
      },
      { status: 500 },
    );
  }
}
