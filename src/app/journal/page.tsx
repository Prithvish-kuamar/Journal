import Link from "next/link";
import { Shell } from "@/components/shell";
import { prisma } from "@/lib/prisma";
import { guardPage } from "@/lib/supabase/page-guard";

export const dynamic = "force-dynamic";

export default async function JournalPage({ searchParams }: { searchParams: Promise<{ date?: string; month?: string }> }) {
  await guardPage();
  const scope = await searchParams;
  const candidates = await prisma.setupCandidate.findMany({ include: { gateAssessment: true, grade: true, trade: true, strategyVersion: true }, orderBy: { updatedAt: "desc" } });
  const visible = scope.date ? candidates.filter((item) => item.createdAt.toISOString().slice(0, 10) === scope.date) : scope.month && /^\d{4}-\d{2}$/.test(scope.month) ? candidates.filter((item) => item.createdAt.toISOString().slice(0, 7) === scope.month) : candidates;
  const label = scope.date ? `Daily journal · ${scope.date}` : scope.month ? `Journal cards · ${scope.month}` : "Setup candidates and trades";
  return <Shell><div className="title-row"><div><p className="eyebrow">Journal</p><h1>{label}</h1><p className="muted">Lifecycle and disposition are deliberately separate.</p></div><Link className="new" href="/journal/new">New Setup</Link></div><section className="card"><div className="table-wrap"><table><thead><tr><th>Setup</th><th>Version</th><th>Lifecycle</th><th>Gate</th><th>Grade</th><th>Disposition</th><th></th></tr></thead><tbody>{visible.map((item) => <tr key={item.id}><td><strong>{item.instrument} {item.direction}</strong><br/><span className="muted">{item.thesis || "No thesis recorded"}</span></td><td>v{item.strategyVersion.versionNumber}</td><td>{item.lifecycle}</td><td>{item.gateAssessment?.result ?? "—"}</td><td>{item.grade?.letter ?? (item.gateAssessment?.result === "REJECTED" ? "Rejected" : "—")}</td><td>{item.disposition}</td><td><Link href={`/journal/${item.id}`}>Open workflow →</Link></td></tr>)}</tbody></table>{visible.length === 0 && <p className="coming">No setup candidates match this journal date. Return to the dashboard to change the selected month or record a new setup.</p>}</div></section></Shell>;
}
