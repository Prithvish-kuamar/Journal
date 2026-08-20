import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { safeReturnPath } from "@/lib/supabase/auth-utils";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const params = await searchParams;
  return <main className="login-page"><section className="card login-card">
    <p className="eyebrow">Evidence Ledger</p>
    <h1>Sign in</h1>
    <p className="muted">Strategy-first trading journal.</p>
    <LoginForm next={safeReturnPath(params.next)} unauthorized={params.error === "unauthorized"} />
    <p className="muted auth-alt">No account yet? <Link href="/signup">Create one</Link></p>
  </section></main>;
}
