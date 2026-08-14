import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { parseAppEnv } from "@/lib/env";
import { normalizeEmail } from "@/lib/supabase/auth-utils";

const _env = parseAppEnv();

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(_env.NEXT_PUBLIC_SUPABASE_URL, _env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(values) {
        try { values.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch { /* Server components cannot always write cookies. */ }
      }
    }
  });
}

export type OwnerAuth =
  | { user: { id: string; email?: string | null }; status: "ok" }
  | { user: null; status: "unauthenticated" | "forbidden" };

export async function requireOwner(): Promise<OwnerAuth> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, status: "unauthenticated" };
  return normalizeEmail(user.email) === normalizeEmail(_env.OWNER_EMAIL)
    ? { user, status: "ok" }
    : { user: null, status: "forbidden" };
}
