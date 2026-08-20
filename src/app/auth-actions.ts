"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeReturnPath, normalizeEmail } from "@/lib/supabase/auth-utils";

type AuthState = { error: string; notice?: string };

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = normalizeEmail(String(formData.get("email") || ""));
  const password = String(formData.get("password") || "");
  const next = safeReturnPath(String(formData.get("next") || null));
  if (!email || !password) return { error: "Unable to sign in with those credentials." };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  // Deliberately generic: a distinct "no such account" message would let an
  // anonymous visitor enumerate which emails are registered.
  if (error) return { error: "Unable to sign in with those credentials." };
  revalidatePath("/", "layout");
  redirect(next);
}

export async function signup(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = normalizeEmail(String(formData.get("email") || ""));
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  if (!email || !password) return { error: "Enter an email address and a password." };
  if (password.length < 8) return { error: "Use a password of at least 8 characters." };
  if (password !== confirm) return { error: "Those passwords do not match." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };

  // With email confirmation enabled Supabase returns a user but no session,
  // so there is nothing to redirect into yet.
  if (!data.session) return { error: "", notice: "Check your inbox to confirm your address, then sign in." };

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
