import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import slugify from "slugify";
import { requireAdminOrEditor } from "@/lib/api-auth";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  // Authenticate admin/editor request
  const authResult = await requireAdminOrEditor(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        product_variants (*),
        product_images (*)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Authenticate admin/editor request
  const authResult = await requireAdminOrEditor(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const supabase = await createClient();
    const body = await request.json();

    // Validace požadovaných polí
    if (!body.name || body.price == null) {
      return NextResponse.json({ success: false, error: "Název a cena jsou povinné" }, { status: 400 });
    }

    // Příprava dat pro vložení
    const slug = slugify(body.name, { lower: true, strict: true });

    const price = Number.isFinite(Number(body.price)) ? Number(body.price) : 0;

    const productData = {
      name: body.name,
      slug: slug,
      description: body.description || null,
      price: Math.round(price), // očekáváme haléře
      category: body.category || null,
      sku: body.sku || null,
      status: body.status || "active",
    };

    // Vytvoření produktu
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert(productData)
      .select()
      .single();

    if (productError) {
      return NextResponse.json({ success: false, error: productError.message }, { status: 400 });
    }

    // Vytvoření variant pokud jsou poskytnuty
    if (body.variants && Array.isArray(body.variants) && body.variants.length > 0) {
      const variants = body.variants.map(
        (variant: { size: string; sku?: string; stock: string; price_override?: string }) => ({
          product_id: product.id,
          size: variant.size,
          sku: variant.sku || `${product.sku || product.id}-${variant.size}`,
          stock_quantity: parseInt(variant.stock) || 0,
          price_override: variant.price_override ? parseInt(variant.price_override) : null,
        }),
      );

      const { error: variantsError } = await supabase.from("product_variants").insert(variants);

      if (variantsError) {
        console.error("Error creating variants:", variantsError);
        // Nebudeme mazat produkt, jen zalogujeme chybu
      }
    }

    // Načtení kompletního produktu s variantami
    const { data: completeProduct, error: fetchError } = await supabase
      .from("products")
      .select(`
        *,
        product_variants (*),
        product_images (*)
      `)
      .eq("id", product.id)
      .single();

    if (fetchError) {
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 400 });
    }

    // Revalidate products list and product detail
    revalidatePath("/products");
    revalidatePath(`/products/${product.id}`);

    return NextResponse.json({ success: true, data: completeProduct }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ success: false, error: "Chyba při vytváření produktu" }, { status: 500 });
  }
}
