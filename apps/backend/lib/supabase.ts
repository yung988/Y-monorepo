import { createBrowserClient } from "@supabase/ssr";

// Create a single supabase client instance for browser use
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
