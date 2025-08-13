import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const supabase = await createClient();
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        product_variants (*),
        product_images (*)
      `,
      )
      .eq("slug", slug)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // This code means no rows were found
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
