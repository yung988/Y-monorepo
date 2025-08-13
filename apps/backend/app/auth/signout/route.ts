import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Chyba při odhlašování:", error);
    return NextResponse.redirect(new URL("/auth/error", process.env.NEXT_PUBLIC_SITE_URL));
  }

  return NextResponse.redirect(new URL("/auth/login", process.env.NEXT_PUBLIC_SITE_URL));
}
