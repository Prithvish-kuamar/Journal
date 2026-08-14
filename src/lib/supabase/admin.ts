import "server-only";

import { createClient } from "@supabase/supabase-js";
import { parseAppEnv } from "@/lib/env";

const _env = parseAppEnv();
let _admin: ReturnType<typeof createClient> | null = null;

export function storageAdmin() {
  if (!_admin) _admin = createClient(_env.NEXT_PUBLIC_SUPABASE_URL, _env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  return _admin;
}

export function storageBucketName() { return _env.SUPABASE_STORAGE_BUCKET; }
