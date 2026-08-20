"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signup } from "@/app/auth-actions";

function Submit() { const { pending } = useFormStatus(); return <button disabled={pending}>{pending ? "Creating account…" : "Create account"}</button>; }

export function SignupForm() {
  const [state, action] = useActionState(signup, { error: "" });
  return <form action={action} className="login-form">
    <label className="field">Email<input required name="email" type="email" autoComplete="email" /></label>
    <label className="field">Password<input required name="password" type="password" minLength={8} autoComplete="new-password" /></label>
    <label className="field">Confirm password<input required name="confirm" type="password" minLength={8} autoComplete="new-password" /></label>
    {state.error && <p className="notice" role="alert">{state.error}</p>}
    {state.notice && <p className="notice" role="status">{state.notice}</p>}
    <Submit />
  </form>;
}
