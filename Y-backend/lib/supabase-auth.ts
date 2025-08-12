import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function requireAdminOrEditor() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      redirect("/auth/login");
    }

    // Dočasně vypneme kontrolu role pro testování
    // TODO: Zapnout až bude databáze připravena
    /*
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (!userData || (userData.role !== 'admin' && userData.role !== 'editor')) {
      redirect('/unauthorized');
    }
    
    return { ...user, role: userData.role };
    */

    return { ...user, role: "admin" }; // Dočasné
  } catch (error) {
    console.error("Auth error:", error);
    redirect("/auth/login");
  }
}
