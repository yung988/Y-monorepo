import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  return user;
}

export async function getUserOrNull() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

// Pro budoucí použití s rolemi
export async function requireAdmin() {
  const user = await getUser();

  // TODO: Přidat kontrolu rolí z databáze
  // const supabase = await createClient()
  // const { data: profile } = await supabase
  //   .from('profiles')
  //   .select('role')
  //   .eq('id', user.id)
  //   .single()
  //
  // if (!profile || (profile.role !== 'admin' && profile.role !== 'editor')) {
  //   redirect('/unauthorized')
  // }

  return user;
}
