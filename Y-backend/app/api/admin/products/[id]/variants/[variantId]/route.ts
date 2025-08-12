import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireAdminOrEditor } from "@/lib/api-auth";
import { createClient } from "@/utils/supabase/server";

// PATCH /api/admin/products/[id]/variants/[variantId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> },
) {
  const authResult = await requireAdminOrEditor(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id: productId, variantId } = await params;
    const body = await request.json();

    const supabase = await createClient();

    // Only allow updating allowed fields
    const update: Record<string, any> = {};
    if (typeof body.size === "string") update.size = body.size;
    if (typeof body.sku === "string") update.sku = body.sku;
    if (body.stock_quantity !== undefined) {
      const qty = Number.parseInt(String(body.stock_quantity));
      if (Number.isNaN(qty) || qty < 0) {
        return NextResponse.json(
          { success: false, error: "'stock_quantity' musí být nezáporné číslo" },
          { status: 400 },
        );
      }
      update.stock_quantity = qty;
    }
    if (body.price_override !== undefined) {
      const po = body.price_override === null ? null : Number.parseInt(String(body.price_override));
      if (po !== null && (Number.isNaN(po) || po < 0)) {
        return NextResponse.json(
          { success: false, error: "'price_override' musí být nezáporné číslo nebo null" },
          { status: 400 },
        );
      }
      update.price_override = po;
    }

    const { data, error } = await supabase
      .from("product_variants")
      .update(update)
      .eq("id", variantId)
      .eq("product_id", productId)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error("Error updating variant:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id]/variants/[variantId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> },
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id: productId, variantId } = await params;
    const supabase = await createClient();

    const { error } = await supabase
      .from("product_variants")
      .delete()
      .eq("id", variantId)
      .eq("product_id", productId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting variant:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

