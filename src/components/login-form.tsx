"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login } from "@/app/auth-actions";

function Submit() { const { pending } = useFormStatus(); return <button disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>; }

export function LoginForm({ next, unauthorized }: { next: string; unauthorized: boolean }) {
  const [state, action] = useActionState(login, { error: unauthorized ? "Unable to sign in with those credentials." : "" });
  return <form action={action} className="login-form"><input type="hidden" name="next" value={next}/><label className="field">Email<input required name="email" type="email" autoComplete="email" /></label><label className="field">Password<input required name="password" type="password" autoComplete="current-password" /></label>{state.error && <p className="notice" role="alert">{state.error}</p>}<Submit /></form>;
}
