import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { ensureWorkspace } from "@/lib/workspace";

/**
 * Guards a page and returns the signed-in user's id. Every query on the page
 * must be scoped by this value — it is the ownerId column on the root tables.
 */
export async function guardPage(): Promise<string> {
  const auth = await requireUser();
  if (auth.status !== "ok") redirect("/login");
  await ensureWorkspace(auth.user.id);
  return auth.user.id;
}
