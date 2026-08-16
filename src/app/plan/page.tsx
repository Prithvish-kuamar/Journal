import Link from "next/link";
import { Shell } from "@/components/shell";
import { StatusBadge } from "@/components/ledger-ui";
import { saveDailyPlan, upsertInstrumentPlan, deleteInstrumentPlan, saveEndOfDay } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { reducedRiskReasons, SESSION_LABELS } from "@/lib/strategy-defaults";
import { guardPage } from "@/lib/supabase/page-guard";
import styles from "./plan.module.css";

export const dynamic = "force-dynamic";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayUtcRange(): [Date, Date] {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return [start, end];
}

function parseConfig(raw: string): Record<string, unknown> {
  try { return JSON.parse(raw) as Record<string, unknown>; } catch { return {}; }
}

function asList(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PlanPage() {
  await guardPage();
  const [todayStart, todayEnd] = todayUtcRange();

  const [strategy, todayPlan, recentPlans] = await Promise.all([
    prisma.strategyVersion.findFirst({ where: { status: "PUBLISHED" }, orderBy: { versionNumber: "desc" } }),
    prisma.dailyPlan.findFirst({ where: { planDate: { gte: todayStart, lt: todayEnd } }, include: { instruments: true }, orderBy: { createdAt: "desc" } }),
    prisma.dailyPlan.findMany({ orderBy: { planDate: "desc" }, take: 12, include: { strategyVersion: true } }),
  ]);

  const config = strategy ? parseConfig(strategy.configuration) : {};
  const permittedInstruments = asList(config.permittedInstruments);

  return (
    <Shell>
      <div className={styles.planPage}>
        <div className="title-row">
          <div>
            <p className="eyebrow">Plan</p>
            <h1>Daily Plan</h1>
            <p className="muted">Capture your intent before the market opens.</p>
          </div>
        </div>

        {/* ── Today's plan or create form ── */}
        {todayPlan ? (
          <ActivePlan plan={todayPlan} permittedInstruments={permittedInstruments} />
        ) : strategy ? (
          <CreatePlanForm strategyVersionId={strategy.id} permittedInstruments={permittedInstruments} />
        ) : (
          <p className="notice">No published strategy. <Link href="/strategy">Open Strategy Library</Link> to publish one.</p>
        )}

        {/* ── Recent plans ── */}
        <section className={styles.section}>
          <div className={styles.sectionHead}><h2>Recent Plans</h2></div>
          {recentPlans.length === 0 ? (
            <p className="muted">No plans yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Date</th><th>Account</th><th>Version</th><th>Session</th><th>Risk</th><th>Status</th><th>Objective</th></tr>
                </thead>
                <tbody>
                  {recentPlans.map((p) => (
                    <tr key={p.id}>
                      <td>{p.planDate.toLocaleDateString("en-IN", { timeZone: "UTC", day: "2-digit", month: "short", year: "numeric" })}</td>
                      <td>{p.account}</td>
                      <td>v{p.strategyVersion.versionNumber}</td>
                      <td>{asList(JSON.parse(p.sessionLabels)).join(", ")}</td>
                      <td>{p.riskMode}</td>
                      <td><StatusBadge tone={p.status === "ACTIVE" ? "success" : p.status === "COMPLETED" ? "neutral" : "warning"}>{p.status}</StatusBadge></td>
                      <td className="muted">{p.objective || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </Shell>
  );
}

// ─── Create plan form ─────────────────────────────────────────────────────────

function CreatePlanForm({ strategyVersionId }: { strategyVersionId: string; permittedInstruments: string[] }) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}><h2>Create Plan</h2></div>
      <form action={saveDailyPlan} className={styles.createForm}>
        <input type="hidden" name="strategyVersionId" value={strategyVersionId} />
        <div className="grid three">
          <label className="field">Date<input required type="date" name="planDate" defaultValue={today} /></label>
          <label className="field">Account<input required name="account" defaultValue="Primary account" /></label>
          <label className="field">Session<select name="sessionLabel">{SESSION_LABELS.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label className="field">Risk mode
            <select name="riskMode">
              <option value="STANDARD">Standard · 2%</option>
              <option value="REDUCED">Reduced · 1%</option>
            </select>
          </label>
          <label className="field">Reduced-risk reason
            <select name="reducedRiskReason">
              <option value="">Not applicable</option>
              {reducedRiskReasons.map((r) => <option key={r}>{r}</option>)}
            </select>
          </label>
          <label className="field">Daily objective<input name="objective" placeholder="What am I focused on today?" /></label>
        </div>
        <label className="field">Personal readiness<textarea name="readinessNotes" placeholder="Energy, focus, emotional state — am I ready to trade?" rows={2} /></label>
        <label className="field">No-trade conditions<textarea name="noTradeConditions" placeholder={"Conditions where I will NOT trade today:\n— Price between major levels\n— Macro bias unclear\n— High-impact news risk"} rows={4} /></label>
        <p className="muted" style={{ fontSize: "0.8125rem" }}>Session is a manual classification. Account risk basis is set in Strategy.</p>
        <button>Activate daily plan</button>
      </form>
    </section>
  );
}

// ─── Active plan view ─────────────────────────────────────────────────────────

type PlanWithInstruments = NonNullable<Awaited<ReturnType<typeof prisma.dailyPlan.findFirst<{ include: { instruments: true } }>>>>;

function ActivePlan({ plan, permittedInstruments }: { plan: PlanWithInstruments; permittedInstruments: string[] }) {
  const sessions = asList(JSON.parse(plan.sessionLabels));
  const isCompleted = plan.status === "COMPLETED";

  return (
    <div className={styles.activePlan}>
      {/* Plan header */}
      <div className={styles.planHeader}>
        <div className={styles.planHeaderLeft}>
          <StatusBadge tone={plan.status === "ACTIVE" ? "success" : plan.status === "COMPLETED" ? "neutral" : "warning"}>{plan.status}</StatusBadge>
          <h2 className={styles.planObjective}>{plan.objective || "Daily Plan"}</h2>
        </div>
        <div className={styles.planMeta}>
          <span><small>Account</small>{plan.account}</span>
          <span><small>Session</small>{sessions.join(", ")}</span>
          <span><small>Risk</small>{plan.riskMode}{plan.reducedRiskReason ? ` · ${plan.reducedRiskReason}` : ""}</span>
          <span><small>Theses</small>max {plan.maxTradeTheses}</span>
        </div>
      </div>

      {/* Readiness */}
      {plan.readinessNotes && (
        <div className={styles.card}>
          <strong style={{ fontSize: "0.8125rem" }}>Readiness</strong>
          <p className="muted" style={{ fontSize: "0.8125rem", margin: "0.25rem 0 0", whiteSpace: "pre-wrap" }}>{plan.readinessNotes}</p>
        </div>
      )}

      {/* No-trade conditions */}
      {plan.noTradeConditions && (
        <div className={styles.card}>
          <strong style={{ fontSize: "0.8125rem" }}>No-trade conditions</strong>
          <p className="muted" style={{ fontSize: "0.8125rem", margin: "0.25rem 0 0", whiteSpace: "pre-wrap" }}>{plan.noTradeConditions}</p>
        </div>
      )}

      {/* Instrument plans */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>Instrument Plans</h2>
          <small>{plan.instruments.length} instrument{plan.instruments.length === 1 ? "" : "s"}</small>
        </div>

        {plan.instruments.map((ip) => (
          <InstrumentCard key={ip.id} ip={ip} planId={plan.id} />
        ))}

        {!isCompleted && (
          <AddInstrumentForm planId={plan.id} permittedInstruments={permittedInstruments} existing={plan.instruments.map((i) => i.instrument)} />
        )}
      </section>

      {/* End of day */}
      <section className={styles.section}>
        <div className={styles.sectionHead}><h2>End of Day</h2></div>
        {isCompleted ? (
          <div className={styles.card}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <strong style={{ fontSize: "0.8125rem" }}>Plan followed?</strong>
              <StatusBadge tone={plan.wasFollowed === true ? "success" : plan.wasFollowed === false ? "danger" : "neutral"}>
                {plan.wasFollowed === true ? "Yes" : plan.wasFollowed === false ? "No" : "Not recorded"}
              </StatusBadge>
            </div>
            {plan.endOfDayNotes && <p className="muted" style={{ fontSize: "0.8125rem", margin: 0, whiteSpace: "pre-wrap" }}>{plan.endOfDayNotes}</p>}
          </div>
        ) : (
          <form action={saveEndOfDay} className={styles.eodForm}>
            <input type="hidden" name="planId" value={plan.id} />
            <label className="field" style={{ flexDirection: "row", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "0.8125rem" }}>Plan followed?</span>
              <select name="wasFollowed" style={{ width: "auto" }}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </label>
            <label className="field">End-of-day notes<textarea name="endOfDayNotes" placeholder={"What happened? Did you follow your no-trade conditions?\nMain lesson from today:"} rows={4} /></label>
            <button>Complete day</button>
          </form>
        )}
      </section>
    </div>
  );
}

// ─── Instrument card ──────────────────────────────────────────────────────────

type InstrumentPlanRow = PlanWithInstruments["instruments"][number];

function InstrumentCard({ ip, planId }: { ip: InstrumentPlanRow; planId: string }) {
  const biasTone = ip.bias === "Bullish" ? "success" : ip.bias === "Bearish" ? "danger" : "neutral";
  return (
    <div className={styles.instrumentCard}>
      <div className={styles.instrumentCardHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <strong>{ip.instrument}</strong>
          <StatusBadge tone={biasTone}>{ip.bias}</StatusBadge>
          {ip.confidence && <span className="muted" style={{ fontSize: "0.75rem" }}>Confidence: {ip.confidence}</span>}
        </div>
        <form action={deleteInstrumentPlan} style={{ display: "inline" }}>
          <input type="hidden" name="instrumentPlanId" value={ip.id} />
          <button className={styles.deleteBtn} type="submit">Remove</button>
        </form>
      </div>

      <form action={upsertInstrumentPlan} className={styles.instrumentForm}>
        <input type="hidden" name="dailyPlanId" value={planId} />
        <input type="hidden" name="instrumentPlanId" value={ip.id} />
        <input type="hidden" name="instrument" value={ip.instrument} />

        <div className="grid three">
          <label className="field">Bias
            <select name="bias" defaultValue={ip.bias}>
              {["Bullish", "Bearish", "Neutral", "Conflicting", "No trade"].map((b) => <option key={b}>{b}</option>)}
            </select>
          </label>
          <label className="field">Confidence
            <select name="confidence" defaultValue={ip.confidence ?? ""}>
              <option value="">—</option>
              {["Low", "Medium", "High"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
        </div>

        <label className="field">Bias rationale
          <textarea name="macroNarrative" defaultValue={ip.macroNarrative ?? ""} placeholder="Brief macro/HTF reason for the directional bias" rows={2} />
        </label>

        <label className="field">Key levels <span className="muted" style={{ fontSize: "0.75rem", fontWeight: 400 }}>one per line: price — description</span>
          <textarea name="profileLevels" defaultValue={ip.profileLevels ?? ""} placeholder={"2380.00 — Weekly demand zone\n2425.00 — Previous week high (liquidity)\n2450.00 — Monthly supply boundary"} rows={5} style={{ fontFamily: "monospace", fontSize: "0.8125rem" }} />
        </label>

        <label className="field">Session scenario
          <textarea name="scenarios" defaultValue={ip.scenarios ?? ""} placeholder="What do I expect to happen this session? Where does price go first, what confirms my setup, where do I execute?" rows={4} />
        </label>

        <label className="field">Invalidation
          <textarea name="invalidation" defaultValue={ip.invalidation ?? ""} placeholder="What would cancel this plan? (e.g. price breaks and closes above X, HTF structure shifts)" rows={2} />
        </label>

        <button style={{ alignSelf: "flex-start" }}>Save</button>
      </form>
    </div>
  );
}

// ─── Add instrument form ──────────────────────────────────────────────────────

function AddInstrumentForm({ planId, permittedInstruments, existing }: { planId: string; permittedInstruments: string[]; existing: string[] }) {
  const available = permittedInstruments.filter((i) => !existing.includes(i));
  if (permittedInstruments.length === 0 && existing.length === 0) {
    return <p className="muted" style={{ fontSize: "0.8125rem" }}>Configure permitted instruments in <Link href="/strategy/edit">Strategy</Link> to add instrument plans.</p>;
  }
  return (
    <form action={upsertInstrumentPlan} className={styles.addInstrumentForm}>
      <input type="hidden" name="dailyPlanId" value={planId} />
      <input type="hidden" name="bias" value="Neutral" />
      <input type="hidden" name="scenarios" value="" />
      {available.length > 0 ? (
        <>
          <select name="instrument" required>
            <option value="">Select instrument…</option>
            {available.map((i) => <option key={i}>{i}</option>)}
          </select>
          <button type="submit">+ Add instrument</button>
        </>
      ) : (
        <p className="muted" style={{ fontSize: "0.8125rem", margin: 0 }}>
          {permittedInstruments.length > 0 ? "All permitted instruments are already planned." : "No permitted instruments configured in Strategy."}
        </p>
      )}
    </form>
  );
}
