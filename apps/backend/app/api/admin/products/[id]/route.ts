import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireAdminOrEditor } from "@/lib/api-auth";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Authenticate admin/editor request
  const authResult = await requireAdminOrEditor(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

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
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Authenticate admin/editor request
  const authResult = await requireAdminOrEditor(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from("products")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    // Revalidate product pages
    revalidatePath("/products");
    revalidatePath(`/products/${id}`);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Authenticate admin/editor request
  const authResult = await requireAdminOrEditor(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await params;
    const supabase = await createClient();

    // Nejprve smažeme všechny obrázky produktu
    const { error: imageDeleteError } = await supabase
      .from("product_images")
      .delete()
      .eq("product_id", id);

    if (imageDeleteError) {
      console.error("Error deleting product images:", imageDeleteError);
      // Pokračujeme i přes chybu, protože chceme smazat i produkt
    }

    // Nejprve smažeme všechny varianty produktu
    const { error: variantDeleteError } = await supabase
      .from("product_variants")
      .delete()
      .eq("product_id", id);

    if (variantDeleteError) {
      console.error("Error deleting product variants:", variantDeleteError);
      // Pokračujeme i přes chybu, protože chceme smazat i produkt
    }

    // Poté smažeme samotný produkt
    const { error: productDeleteError } = await supabase.from("products").delete().eq("id", id);

    if (productDeleteError) {
      return NextResponse.json({ success: false, error: productDeleteError.message }, { status: 400 });
    }

    // Revalidate
    revalidatePath("/products");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
