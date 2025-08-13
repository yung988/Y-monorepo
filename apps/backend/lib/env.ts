import { z } from "zod";

const EnvSchema = z.object({
  // Supabase server
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),

  // Public Supabase for SSR/CSR (backend také používá klienta s anon klíčem na SSR)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(10),
  STRIPE_WEBHOOK_SECRET: z.string().min(10).optional(),

  // Resend
  RESEND_API_KEY: z.string().min(10),
  EMAIL_FROM: z.string().email().or(z.string().min(3)),

  // Admin URLs
  NEXT_PUBLIC_ADMIN_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),

  // Packeta
  PACKETA_BASE_URL: z.string().url().optional(),
  PACKETA_API_PASSWORD: z.string().optional(),
  PACKETA_SENDER_LABEL: z.string().optional(),
});

export type AppEnv = z.infer<typeof EnvSchema>;

export function getEnv(): AppEnv {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const formatted = parsed.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("\n");
    throw new Error(`Missing/invalid ENV variables:\n${formatted}`);
  }
  return parsed.data;
}

