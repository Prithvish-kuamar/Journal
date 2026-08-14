import { LoginForm } from "@/components/login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const params = await searchParams;
  const next = params.next?.startsWith("/") && !params.next.startsWith("//") && !params.next.includes("://") ? params.next : "/";
  return <main className="login-page"><section className="card login-card"><p className="eyebrow">Evidence Ledger</p><h1>Owner sign in</h1><p className="muted">Private strategy journal access.</p><LoginForm next={next} unauthorized={params.error === "unauthorized"} /></section></main>;
}
