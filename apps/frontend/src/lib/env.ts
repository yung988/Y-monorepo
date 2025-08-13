import { z } from "zod";

const EnvSchema = z.object({
  // Public env vars for frontend
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(10),
  NEXT_PUBLIC_ADMIN_API_URL: z.string().url(),
});

export type FrontendEnv = z.infer<typeof EnvSchema>;

export function getPublicEnv(): FrontendEnv {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const formatted = parsed.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("\n");
    throw new Error(`Missing/invalid NEXT_PUBLIC_* variables for frontend:\n${formatted}`);
  }
  return parsed.data;
}

