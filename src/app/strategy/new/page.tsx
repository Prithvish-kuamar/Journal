import Link from "next/link";
import { Shell } from "@/components/shell";
import { createStrategy } from "@/app/actions";
import { guardPage } from "@/lib/supabase/page-guard";

export const dynamic = "force-dynamic";

export default async function NewStrategyPage() {
  await guardPage();
  return <Shell><div className="title-row"><div><p className="eyebrow">Strategy Library</p><h1>Create Strategy</h1><p className="muted">Create an empty owner-configured strategy. No trading doctrine is invented or seeded.</p></div><Link className="secondary" href="/strategy">Cancel</Link></div><section className="card"><form action={createStrategy}><label className="field">Strategy name<input required name="name" autoFocus placeholder="e.g. LTA Strategy" /></label><label className="field">Description<textarea name="description" placeholder="Describe the strategy purpose and scope." /></label><p className="notice">The first version starts as a draft. Configure its gates, rulebook, grading categories and entry models before publishing.</p><button>Create strategy</button></form></section></Shell>;
}
