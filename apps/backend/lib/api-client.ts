// lib/api-client.ts
import { createClient } from "@/lib/supabase/client";

// Vytvoříme instanci Supabase klienta na straně klienta
const supabase = createClient();

/**
 * Obal (wrapper) pro standardní `fetch` funkci, který automaticky přidává
 * JWT token pro autentizaci do všech API requestů.
 */
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  // Získáme aktuální session od Supabase
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Připravíme hlavičky. Začneme s hlavičkami, které přišly v `options`.
  const headers = new Headers(options.headers);

  // Pokud máme platnou session (a tedy i token), přidáme Authorization hlavičku.
  if (session) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  // Implementuj no-store pro aktuální data, pokud uživatel neoverridnul
  if (!("cache" in options)) {
    (options as any).cache = "no-store";
  }

  // Pokud v původních `options` nebylo 'Content-Type', a máme tělo (body),
  // nastavíme ho na 'application/json'. U FormData necháme nastavit boundary prohlížečem.
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!headers.has("Content-Type") && options.body && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  // Sestavíme finální URL a options pro `fetch`
  const fullUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL
    ? `${process.env.NEXT_PUBLIC_ADMIN_API_URL}${url}`
    : url;

  // Zavoláme původní `fetch` s upravenými hlavičkami a options.
  return fetch(fullUrl, {
    ...options,
    headers,
  });
}

// Vytvoříme a exportujeme klienta, který obsahuje metody pro GET, POST, atd.
export const apiClient = {
  get: (url: string, options?: RequestInit) => fetchWithAuth(url, { ...options, method: "GET" }),
  post: (url: string, body: any, options?: RequestInit) =>
    fetchWithAuth(url, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: (url: string, body: any, options?: RequestInit) =>
    fetchWithAuth(url, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: (url: string, body: any, options?: RequestInit) =>
    fetchWithAuth(url, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: (url: string, options?: RequestInit) => fetchWithAuth(url, { ...options, method: "DELETE" }),
};
