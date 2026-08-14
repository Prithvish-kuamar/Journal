"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, requireOwner } from "@/lib/supabase/server";
import { safeReturnPath } from "@/lib/supabase/auth-utils";

type LoginState = { error: string };

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const next = safeReturnPath(String(formData.get("next") || null));
  if (!email || !password) return { error: "Unable to sign in with those credentials." };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Unable to sign in with those credentials." };
  const owner = await requireOwner();
  if (owner.status !== "ok") { await supabase.auth.signOut(); return { error: "Unable to sign in with those credentials." }; }
  revalidatePath("/", "layout");
  redirect(next);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
