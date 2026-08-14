import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1).refine((value) => value.startsWith("postgresql://") || value.startsWith("postgres://"), "DATABASE_URL must be a PostgreSQL connection URL."),
  DIRECT_URL: z.string().min(1).refine((value) => value.startsWith("postgresql://") || value.startsWith("postgres://"), "DIRECT_URL must be a PostgreSQL connection URL."),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_SECRET_KEY: z.string().min(1),
  SUPABASE_STORAGE_BUCKET: z.string().min(1).default("evidence-private"),
  OWNER_EMAIL: z.string().email(),
  APP_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  UPLOAD_DIR: z.string().min(1).default("uploads")
});

export type AppEnv = z.infer<typeof schema>;

export function parseAppEnv(input: NodeJS.ProcessEnv = process.env): AppEnv {
  const result = schema.safeParse(input);
  if (!result.success) {
    const details = result.error.issues.map((issue) => `${issue.path.join(".") || "environment"}: ${issue.message}`).join("; ");
    throw new Error(`Invalid production environment configuration. ${details}`);
  }
  return result.data;
}

// This is intentionally callable by startup/deployment checks. It is not imported into browser components,
// so SUPABASE_SERVICE_ROLE_KEY can never be bundled into client code.
export function assertProductionEnv(input: NodeJS.ProcessEnv = process.env): AppEnv {
  return parseAppEnv(input);
}
