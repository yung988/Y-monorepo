import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireAdminOrEditor } from "@/lib/api-auth";
import { createClient } from "@/utils/supabase/server";

// POST /api/admin/products/[id]/variants
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Authenticate admin/editor
  const authResult = await requireAdminOrEditor(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id: productId } = await params;
    const body = await request.json();

    const { size, sku, stock_quantity, price_override } = body || {};

    if (!size || typeof size !== "string") {
      return NextResponse.json({ success: false, error: "Pole 'size' je povinné" }, { status: 400 });
    }

    const stockQty = Number.parseInt(String(stock_quantity ?? 0));
    if (Number.isNaN(stockQty) || stockQty < 0) {
      return NextResponse.json(
        { success: false, error: "Pole 'stock_quantity' musí být nezáporné číslo" },
        { status: 400 },
      );
    }

    const priceOverride =
      price_override === null || price_override === undefined
        ? null
        : Number.parseInt(String(price_override));
    if (priceOverride !== null && (Number.isNaN(priceOverride) || priceOverride < 0)) {
      return NextResponse.json(
        { success: false, error: "Pole 'price_override' musí být nezáporné číslo nebo null" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Create variant
    const { data: variant, error } = await supabase
      .from("product_variants")
      .insert({
        product_id: productId,
        size,
        sku: sku || null,
        stock_quantity: stockQty,
        price_override: priceOverride,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating product variant:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: variant }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error in create variant:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

