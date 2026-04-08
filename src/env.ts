/**
 * Validate required environment variables at module load time so that a
 * missing variable crashes loudly at startup instead of failing silently
 * deep inside a service call.
 *
 * Import this file at the top of `src/app/layout.tsx` (server component)
 * so it runs once on every cold start.
 */
import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),

  // NextAuth
  NEXTAUTH_SECRET: z
    .string()
    .min(16, "NEXTAUTH_SECRET must be at least 16 characters"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL").optional(),

  // Email (Resend)
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM: z.string().email("RESEND_FROM must be a valid email").optional(),

  // Payments
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  CMI_WEBHOOK_SECRET: z.string().optional(),

  // Rate limiting (Upstash)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Error tracking
  SENTRY_DSN: z.string().url().optional(),

  // Cron jobs
  CRON_SECRET: z.string().optional(),

  // File storage (Vercel Blob)
  BLOB_READ_WRITE_TOKEN: z.string().optional(),

  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _parsed = envSchema.safeParse(process.env as any);

if (!_parsed.success) {
  const formatted = _parsed.error.flatten().fieldErrors;
  const lines = Object.entries(formatted)
    .map(([k, v]) => `  ${k}: ${(v ?? []).join(", ")}`)
    .join("\n");
  throw new Error(`❌ Invalid environment variables:\n${lines}`);
}

export const env = _parsed.data;
