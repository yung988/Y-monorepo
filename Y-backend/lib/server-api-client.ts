// lib/server-api-client.ts
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:3001";

/**
 * Server-side fetch wrapper that automatically adds the JWT token from cookies.
 */
async function fetchFromServer(url: string, options: RequestInit = {}): Promise<Response> {
  // V Next.js 15 musíme použít await pro cookies()
  const cookieStore = await cookies();

  // Místo složitého dekódování cookies použijeme Supabase client,
  // který už ví, jak správně získat session
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const headers = new Headers(options.headers);

    if (session?.access_token) {
      headers.set("Authorization", `Bearer ${session.access_token}`);
    }

    if (!headers.has("Content-Type") && options.body) {
      headers.set("Content-Type", "application/json");
    }

    const fullUrl = `${ADMIN_API_URL}${url}`;

    return fetch(fullUrl, {
      ...options,
      headers,
      // Přidáme cache: 'no-store' pro dynamické načítání na serveru
      cache: "no-store",
    });
  } catch (error) {
    console.error("Error in fetchFromServer:", error);
    // Pokud selže získání session, pokračujeme bez tokenu
    const headers = new Headers(options.headers);
    if (!headers.has("Content-Type") && options.body) {
      headers.set("Content-Type", "application/json");
    }

    const fullUrl = `${ADMIN_API_URL}${url}`;

    return fetch(fullUrl, {
      ...options,
      headers,
      cache: "no-store",
    });
  }
}

export const serverApiClient = {
  get: (url: string, options?: RequestInit) => fetchFromServer(url, { ...options, method: "GET" }),
  post: (url: string, body: any, options?: RequestInit) =>
    fetchFromServer(url, { ...options, method: "POST", body: JSON.stringify(body) }),
  patch: (url: string, body: any, options?: RequestInit) =>
    fetchFromServer(url, { ...options, method: "PATCH", body: JSON.stringify(body) }),
  delete: (url: string, options?: RequestInit) =>
    fetchFromServer(url, { ...options, method: "DELETE" }),
};
