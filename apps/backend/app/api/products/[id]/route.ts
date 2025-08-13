import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Public API for single product (no authentication required)
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        product_variants (*),
        product_images (*)
      `)
      .eq("id", id)
      .eq("status", "active")
      .single();

    if (error) {
      console.error("Error fetching product:", error);
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH method not allowed for public API
export async function PATCH(_request: NextRequest) {
  return NextResponse.json(
    { error: "Method not allowed. Use admin API for updating products." },
    { status: 405 },
  );
}
