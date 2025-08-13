import { createBrowserClient as createBrowserClientLib } from "@supabase/ssr";

// Factory for browser client (exported API expected elsewhere)
export function createBrowserClient() {
  return createBrowserClientLib(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// Optional singleton if needed
export const supabase = createBrowserClient();
