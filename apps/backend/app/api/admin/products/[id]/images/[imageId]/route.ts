import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireAdminOrEditor } from "@/lib/api-auth";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  // Authenticate admin/editor request
  const authResult = await requireAdminOrEditor(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

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
      return NextResponse.json({ success: false, error: "Obrázek nenalezen" }, { status: 404 });
    }

    // Smažeme obrázek z databáze
    const { error: deleteError } = await supabase.from("product_images").delete().eq("id", imageId);

    if (deleteError) {
      return NextResponse.json({ success: false, error: deleteError.message }, { status: 400 });
    }

    // Smažeme soubor z úložiště (Supabase Storage)
    if (image.url) {
      const fileName = image.url.split("/").pop();
      if (fileName) {
        await supabase.storage.from("product-images").remove([fileName]);
      }
    }

    revalidatePath(`/products/${id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json({ success: false, error: "Chyba při mazání obrázku" }, { status: 500 });
  }
}
