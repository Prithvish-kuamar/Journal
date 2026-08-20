import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { parseAppEnv } from "@/lib/env";

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

export type UserAuth =
  | { user: { id: string; email?: string | null }; status: "ok" }
  | { user: null; status: "unauthenticated" };

/**
 * The signed-in user. Their Supabase auth id is the ownerId every row is
 * scoped by, so callers must pass it into every query rather than trusting
 * a record id from the request.
 */
export async function requireUser(): Promise<UserAuth> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ? { user, status: "ok" } : { user: null, status: "unauthenticated" };
}
