import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireAdminOrEditor } from "@/lib/api-auth";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Authenticate admin/editor request
  const authResult = await requireAdminOrEditor(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await params;
    const supabase = await createClient();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const altText = formData.get("altText") as string;

    if (!file) {
      return NextResponse.json({ success: false, error: "Soubor nenalezen" }, { status: 400 });
    }

    // Validace typu souboru
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "Soubor musí být obrázek" }, { status: 400 });
    }

    // Získáme aktuální počet obrázků pro určení sort_order
    const { data: existingImages, error: countError } = await supabase
      .from("product_images")
      .select("sort_order")
      .eq("product_id", id)
      .order("sort_order", { ascending: false })
      .limit(1);

    if (countError) {
      return NextResponse.json({ success: false, error: countError.message }, { status: 400 });
    }

    const nextSortOrder = existingImages?.length > 0 ? existingImages[0].sort_order + 1 : 0;

    // Vytvoříme jedinečné jméno souboru
    const fileExt = file.name.split(".").pop();
    const fileName = `${id}_${Date.now()}.${fileExt}`;

    // Nahrajeme soubor do Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { success: false, error: `Chyba při nahrávání souboru: ${uploadError.message}` },
        { status: 500 },
      );
    }

    // Získáme veřejnou URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(fileName);

    // Uložíme záznam do databáze
    const { data: imageData, error: insertError } = await supabase
      .from("product_images")
      .insert({
        product_id: id,
        url: publicUrl,
        alt_text: altText || null,
        sort_order: nextSortOrder,
      })
      .select()
      .single();

    if (insertError) {
      // Pokud se nepodaří uložit do databáze, smažeme soubor
      await supabase.storage.from("product-images").remove([fileName]);

      return NextResponse.json({ success: false, error: insertError.message }, { status: 400 });
    }

    // Revalidate product detail
    revalidatePath(`/products/${id}`);

    return NextResponse.json({ success: true, data: imageData });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json({ success: false, error: "Chyba při nahrávání obrázku" }, { status: 500 });
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

    const { images } = await request.json();

    if (!Array.isArray(images)) {
      return NextResponse.json({ success: false, error: "Neplatná data" }, { status: 400 });
    }

    // Aktualizujeme pořadí obrázků
    const updatePromises = images.map((image: { id: string; sort_order: number }) =>
      supabase
        .from("product_images")
        .update({ sort_order: image.sort_order })
        .eq("id", image.id)
        .eq("product_id", id),
    );

    const results = await Promise.all(updatePromises);

    // Zkontrolujeme, zda nedošlo k chybě
    const hasError = results.some((result) => result.error);
    if (hasError) {
      return NextResponse.json({ success: false, error: "Chyba při aktualizaci pořadí" }, { status: 400 });
    }

    revalidatePath(`/products/${id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating image order:", error);
    return NextResponse.json({ success: false, error: "Chyba při aktualizaci pořadí" }, { status: 500 });
  }
}
