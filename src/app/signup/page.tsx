import Link from "next/link";
import { SignupForm } from "@/components/signup-form";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  return <main className="login-page"><section className="card login-card">
    <p className="eyebrow">Evidence Ledger</p>
    <h1>Create account</h1>
    <p className="muted">Your journal, strategy versions, and trades are private to your account.</p>
    <SignupForm />
    <p className="muted auth-alt">Already have an account? <Link href="/login">Sign in</Link></p>
  </section></main>;
}
