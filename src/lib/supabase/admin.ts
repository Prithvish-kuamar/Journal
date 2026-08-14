import "server-only";

import { createClient } from "@supabase/supabase-js";
import { parseAppEnv } from "@/lib/env";

const _env = parseAppEnv();
let _admin: ReturnType<typeof createClient> | null = null;

export function storageAdmin() {
  if (!_admin) {
    const secret = process.env.SUPABASE_SECRET_KEY;
    if (!secret) throw new Error("Supabase Storage administration is not configured.");
    _admin = createClient(_env.NEXT_PUBLIC_SUPABASE_URL, secret, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  }
  return _admin;
}

export function storageBucketName() { return _env.SUPABASE_STORAGE_BUCKET; }
