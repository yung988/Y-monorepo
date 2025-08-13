import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  try {
    const { id, imageId } = await params;
    const supabase = await createClient();

    // Nejprve zkontrolujeme, zda obrázek patří k tomuto produktu
    const { data: image, error: fetchError } = await supabase
      .from("product_images")
      .select("*")
      .eq("id", imageId)
      .eq("product_id", id)
      .single();

    if (fetchError || !image) {
      return NextResponse.json({ error: "Obrázek nenalezen" }, { status: 404 });
    }

    // Smažeme obrázek z databáze
    const { error: deleteError } = await supabase.from("product_images").delete().eq("id", imageId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    // TODO: Zde bychom měli smazat i soubor z úložiště (Supabase Storage)
    // if (image.url) {
    //   const fileName = image.url.split('/').pop();
    //   if (fileName) {
    //     await supabase.storage.from('product-images').remove([fileName]);
    //   }
    // }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json({ error: "Chyba při mazání obrázku" }, { status: 500 });
  }
}
