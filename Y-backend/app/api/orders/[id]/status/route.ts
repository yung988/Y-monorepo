import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: "Chybí ID objednávky nebo nový stav" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id,status")
      .single();

    if (error) {
      console.error("Chyba při změně stavu:", error);
      return NextResponse.json({ error: "Nepodařilo se změnit stav" }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: data });
  } catch (err: any) {
    console.error("PATCH /api/orders/[id]/status:", err);
    return NextResponse.json({ error: err?.message || "Neznámá chyba" }, { status: 500 });
  }
}
