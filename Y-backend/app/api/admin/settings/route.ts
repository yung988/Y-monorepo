import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireAdminOrEditor } from "@/lib/api-auth";
import { revalidatePath } from "next/cache";

// GET /api/admin/settings
// Returns a flat map of settings: { [key]: value }
export async function GET(request: NextRequest) {
  const authResult = await requireAdminOrEditor(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("settings")
      .select("key, value, category, description, is_public")
      .order("key", { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    const map: Record<string, any> = {};
    for (const row of data || []) {
      map[row.key] = row.value;
    }

    return NextResponse.json({ success: true, data: map });
  } catch (err) {
    console.error("Error fetching settings:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/admin/settings
// Upserts provided key/value pairs into settings table.
// Body: { updates: Record<string, any>, category?: string }
export async function PUT(request: NextRequest) {
  const authResult = await requireAdminOrEditor(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const supabase = await createClient();
    const body = await request.json();

    const updates: Record<string, any> | undefined = body?.updates;
    const category: string | undefined = body?.category;

    if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
      return NextResponse.json({ success: false, error: "Neplatná data (updates)" }, { status: 400 });
    }

    const rows = Object.entries(updates).map(([key, value]) => ({
      key,
      value,
      category: category || null,
      updated_at: new Date().toISOString(),
    }));

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: "Žádné položky k uložení" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("settings")
      .upsert(rows, { onConflict: "key" })
      .select("key, value");

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    // Revalidate admin settings page
    revalidatePath("/settings");

    const result: Record<string, any> = {};
    for (const row of data || []) {
      result[row.key] = row.value;
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error("Error updating settings:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

