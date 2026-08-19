"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeReturnPath, normalizeEmail } from "@/lib/supabase/auth-utils";

type LoginState = { error: string };

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  const email = normalizeEmail(String(formData.get("email") || ""));
  const password = String(formData.get("password") || "");
  const next = safeReturnPath(String(formData.get("next") || null));
  if (!email || !password) return { error: "Unable to sign in with those credentials." };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || normalizeEmail(user.email) !== normalizeEmail(process.env.OWNER_EMAIL ?? "")) {
    await supabase.auth.signOut();
    return { error: "Unable to sign in with those credentials." };
  }
  revalidatePath("/", "layout");
  redirect(next);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
