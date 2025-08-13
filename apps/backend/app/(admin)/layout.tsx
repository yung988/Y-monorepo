import type React from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import "@/app/globals.css";
import type { Metadata } from "next";
import { requireAdminOrEditor } from "@/lib/supabase-auth";

export const metadata: Metadata = {
  title: "Yeezuz Store Admin",
  description: "Admin panel pro Yeezuz Store",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Ověř roli před renderem admin UI
  await requireAdminOrEditor();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-y-auto p-6 w-full">
              <div className="w-full max-w-none">{children}</div>
            </main>
          </div>
        </div>
      </SidebarProvider>
      <Toaster />
    </ThemeProvider>
  );
}
