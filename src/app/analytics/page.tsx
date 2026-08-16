import Link from "next/link";
import { Shell } from "@/components/shell";
import { MetricCell, MetricStrip, StatusBadge } from "@/components/ledger-ui";
import { prisma } from "@/lib/prisma";
import { guardPage } from "@/lib/supabase/page-guard";
import styles from "./analytics.module.css";

export const dynamic = "force-dynamic";

// ─── Date helpers ────────────────────────────────────────────────────────────

function parseDate(raw: string | undefined): Date {
  if (!raw) return utcToday();
  const d = new Date(raw + "T00:00:00Z");
  return isNaN(d.getTime()) ? utcToday() : d;
}

function utcToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function weekStart(d: Date): Date {
  const day = d.getUTCDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  const m = new Date(d);
  m.setUTCDate(m.getUTCDate() + diff);
  return m;
}

function monthStart(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setUTCDate(r.getUTCDate() + n);
  return r;
}

function addMonths(d: Date, n: number): Date {
  const r = new Date(d);
  r.setUTCMonth(r.getUTCMonth() + n);
  return r;
}

function toParam(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function fmtDay(d: Date): string {
  return d.toLocaleDateString("en-IN", { timeZone: "UTC", day: "2-digit", month: "short", year: "numeric" });
}

function fmtMonth(d: Date): string {
  return d.toLocaleDateString("en-IN", { timeZone: "UTC", month: "long", year: "numeric" });
}

function fmtR(v: number | null | undefined): string {
  if (v == null) return "—";
  return `${v >= 0 ? "+" : ""}${v.toFixed(2)}R`;
}

function fmtPct(n: number | null): string {
  return n == null ? "—" : `${n}%`;
}

// ─── Metric calculations ─────────────────────────────────────────────────────

type TradeFull = Awaited<ReturnType<typeof fetchRange>>["trades"][number];

function metrics(trades: TradeFull[]) {
  const closed = trades.filter((t) => t.status === "CLOSED");
  const totalR = closed.reduce((s, t) => s + (t.executedR ?? 0), 0);
  const reviewed = closed.filter((t) => t.review?.status === "COMPLETE");
  const valid = reviewed.filter((t) => t.review?.classification?.startsWith("Valid"));
  const invalid = reviewed.filter((t) => t.review?.classification?.startsWith("Invalid"));
  const validR = valid.reduce((s, t) => s + (t.executedR ?? 0), 0);
  const invalidR = invalid.reduce((s, t) => s + (t.executedR ?? 0), 0);
  const accuracy = reviewed.length ? Math.round((valid.length / reviewed.length) * 100) : null;
  const reviewPct = closed.length ? Math.round((reviewed.length / closed.length) * 100) : null;
  const withMistake = reviewed.filter((t) => t.review?.primaryMistake && t.review.primaryMistake !== "NONE");
  const mistakeCounts = withMistake.reduce<Record<string, number>>((acc, t) => {
    const m = t.review!.primaryMistake!;
    acc[m] = (acc[m] ?? 0) + 1;
    return acc;
  }, {});
  const topMistake = Object.entries(mistakeCounts).sort((a, b) => b[1] - a[1])[0];
  return { closed, totalR, reviewed, valid, invalid, validR, invalidR, accuracy, reviewPct, withMistake, mistakeCounts, topMistake };
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function fetchRange(start: Date, end: Date) {
  const [plans, candidates, trades] = await Promise.all([
    prisma.dailyPlan.findMany({
      where: { planDate: { gte: start, lt: end } },
      include: { instruments: true },
      orderBy: { planDate: "asc" },
    }),
    prisma.setupCandidate.findMany({
      where: { createdAt: { gte: start, lt: end } },
      include: { grade: true, trade: { include: { review: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.trade.findMany({
      where: { entryTimestamp: { gte: start, lt: end } },
      include: { review: true },
      orderBy: { entryTimestamp: "asc" },
    }),
  ]);
  return { plans, candidates, trades };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RCell({ value, label }: { value: string; label: string }) {
  const tone = value.startsWith("+") ? "success" : value.startsWith("-") ? "danger" : "neutral";
  return <MetricCell label={label} value={value} tone={tone} />;
}

function PlanPanel({ plan }: { plan: Awaited<ReturnType<typeof fetchRange>>["plans"][number] | null; }) {
  if (!plan) {
    return (
      <div className={styles.empty}>
        <h3>No daily plan for this date</h3>
        <p>Create a daily plan before reviewing execution quality.</p>
        <div className={styles.actions}>
          <Link className="new" href="/plan">Create Daily Plan</Link>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.planCard}>
      <header>
        <h3>{plan.objective || "Daily Plan"}</h3>
        <StatusBadge tone={plan.status === "ACTIVE" ? "success" : plan.status === "COMPLETED" ? "neutral" : "warning"}>{plan.status}</StatusBadge>
      </header>
      <dl className={styles.planMeta}>
        <div><dt>Account</dt><dd>{plan.account}</dd></div>
        <div><dt>Session</dt><dd>{plan.sessionLabels}</dd></div>
        <div><dt>Risk mode</dt><dd>{plan.riskMode}</dd></div>
        {plan.maxRisk != null && <div><dt>Max risk</dt><dd>{plan.maxRisk}%</dd></div>}
        <div><dt>Max theses</dt><dd>{plan.maxTradeTheses}</dd></div>
        {plan.reducedRiskReason && <div><dt>Reduced-risk reason</dt><dd>{plan.reducedRiskReason}</dd></div>}
      </dl>
      {plan.readinessNotes && <p className="muted" style={{ fontSize: "0.8125rem", margin: "0 0 0.5rem" }}><strong>Readiness:</strong> {plan.readinessNotes}</p>}
      <div className={styles.planActions}>
        <Link href="/plan" className={styles.tab} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius, 6px)" }}>Open Daily Plan</Link>
      </div>
    </div>
  );
}

function TradesTable({ trades }: { trades: TradeFull[] }) {
  if (!trades.length) return <p className="muted" style={{ fontSize: "0.8125rem", padding: "0.75rem 0" }}>No trades for this period.</p>;
  return (
    <div className={styles.tableWrap}>
      <table>
        <thead>
          <tr>
            <th>Instrument</th>
            <th>Dir</th>
            <th>Model</th>
            <th>Grade</th>
            <th>Validity</th>
            <th>Executed R</th>
            <th>Close</th>
            <th>Review</th>
            <th>Mistake</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => {
            const validity = t.review?.classification?.startsWith("Valid") ? "Valid" : t.review?.classification?.startsWith("Invalid") ? "Invalid" : "—";
            const rTone = (t.executedR ?? 0) >= 0 ? styles.positive : styles.negative;
            return (
              <tr key={t.id}>
                <td><strong>{t.instrument}</strong></td>
                <td>{t.direction}</td>
                <td>{t.entryModel ?? "—"}</td>
                <td>{t.gradeLetter ?? "—"}</td>
                <td>
                  {validity !== "—"
                    ? <StatusBadge tone={validity === "Valid" ? "success" : "danger"}>{validity}</StatusBadge>
                    : <span className="muted">—</span>}
                </td>
                <td className={rTone}>{fmtR(t.executedR)}</td>
                <td>{t.closeStatus ?? "—"}</td>
                <td>
                  <StatusBadge tone={t.review?.status === "COMPLETE" ? "success" : t.review?.status === "IN_PROGRESS" ? "warning" : "neutral"}>
                    {t.review?.status ?? "NO REVIEW"}
                  </StatusBadge>
                </td>
                <td>{t.review?.primaryMistake && t.review.primaryMistake !== "NONE" ? t.review.primaryMistake : "—"}</td>
                <td><Link href={`/journal/${t.candidateId}`} style={{ fontSize: "0.75rem", color: "var(--text-2)" }}>Open →</Link></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CandidatesTable({ candidates }: { candidates: Awaited<ReturnType<typeof fetchRange>>["candidates"] }) {
  if (!candidates.length) return <p className="muted" style={{ fontSize: "0.8125rem", padding: "0.75rem 0" }}>No setup candidates for this period.</p>;
  return (
    <div className={styles.tableWrap}>
      <table>
        <thead>
          <tr>
            <th>Instrument</th>
            <th>Direction</th>
            <th>Lifecycle</th>
            <th>Disposition</th>
            <th>Grade</th>
            <th>Model</th>
            <th>Executed R</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c) => (
            <tr key={c.id}>
              <td><strong>{c.instrument}</strong></td>
              <td>{c.direction}</td>
              <td>
                <StatusBadge tone={c.lifecycle === "QUALIFIED" ? "success" : c.lifecycle === "REJECTED" ? "danger" : "neutral"}>{c.lifecycle}</StatusBadge>
              </td>
              <td>
                <StatusBadge tone={c.disposition === "TRADED" ? "success" : c.disposition === "MISSED" ? "warning" : c.disposition === "CORRECT_NO_TRADE" ? "neutral" : "neutral"}>{c.disposition}</StatusBadge>
              </td>
              <td>{c.grade?.letter ?? "—"}</td>
              <td>{c.entryModel ?? "—"}</td>
              <td className={(c.trade?.executedR ?? 0) >= 0 ? styles.positive : styles.negative}>{fmtR(c.trade?.executedR)}</td>
              <td><Link href={`/journal/${c.id}`} style={{ fontSize: "0.75rem", color: "var(--text-2)" }}>Open →</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MistakeTable({ mistakeCounts }: { mistakeCounts: Record<string, number> }) {
  const ranked = Object.entries(mistakeCounts).sort((a, b) => b[1] - a[1]);
  if (!ranked.length) return <p className="muted" style={{ fontSize: "0.8125rem" }}>No mistakes recorded for this period.</p>;
  const total = ranked.reduce((s, [, n]) => s + n, 0);
  return (
    <div className={styles.tableWrap}>
      <table className={styles.mistakeRank}>
        <thead><tr><th>Mistake</th><th>Count</th><th>% of reviewed</th></tr></thead>
        <tbody>
          {ranked.map(([code, count]) => (
            <tr key={code}>
              <td>{code}</td>
              <td>{count}</td>
              <td>{Math.round((count / total) * 100)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function PeriodicLogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await guardPage();
  const sp = await searchParams;
  const rawPeriod = typeof sp.period === "string" ? sp.period : "daily";
  const period = ["daily", "weekly", "monthly"].includes(rawPeriod) ? rawPeriod : "daily";
  const rawDate = typeof sp.date === "string" ? sp.date : undefined;

  // Compute anchor date and range
  const today = utcToday();
  const anchor = parseDate(rawDate);

  let rangeStart: Date;
  let rangeEnd: Date;
  let prevDate: Date;
  let nextDate: Date;
  let dateLabel: string;

  if (period === "daily") {
    rangeStart = anchor;
    rangeEnd = addDays(anchor, 1);
    prevDate = addDays(anchor, -1);
    nextDate = addDays(anchor, 1);
    dateLabel = fmtDay(anchor);
  } else if (period === "weekly") {
    rangeStart = weekStart(anchor);
    rangeEnd = addDays(rangeStart, 7);
    prevDate = addDays(rangeStart, -7);
    nextDate = addDays(rangeStart, 7);
    const wEnd = addDays(rangeEnd, -1);
    dateLabel = `${rangeStart.toLocaleDateString("en-IN", { timeZone: "UTC", day: "2-digit", month: "short" })} – ${wEnd.toLocaleDateString("en-IN", { timeZone: "UTC", day: "2-digit", month: "short", year: "numeric" })}`;
  } else {
    rangeStart = monthStart(anchor);
    rangeEnd = addMonths(rangeStart, 1);
    prevDate = addMonths(rangeStart, -1);
    nextDate = addMonths(rangeStart, 1);
    dateLabel = fmtMonth(rangeStart);
  }

  const isToday =
    period === "daily"
      ? toParam(anchor) === toParam(today)
      : period === "weekly"
        ? toParam(weekStart(today)) === toParam(rangeStart)
        : toParam(monthStart(today)) === toParam(rangeStart);

  const { plans, candidates, trades } = await fetchRange(rangeStart, rangeEnd);

  const m = metrics(trades);
  const hasData = trades.length > 0 || candidates.length > 0 || plans.length > 0;

  // Tab hrefs
  const tabHref = (p: string) => `?period=${p}&date=${toParam(p === "weekly" ? weekStart(anchor) : p === "monthly" ? monthStart(anchor) : anchor)}`;

  return (
    <Shell>
      <div className={styles.logs}>
        {/* Header */}
        <div className="title-row">
          <div>
            <p className="eyebrow">Journaling</p>
            <h1>Periodic Logs</h1>
            <p className="muted">Review daily, weekly and monthly execution patterns.</p>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <span className="muted" style={{ fontSize: "0.75rem", padding: "0.375rem 0.75rem", border: "1px solid var(--border)", borderRadius: "var(--radius, 6px)" }} title="Export is not available in the current phase.">Export Periodic Log</span>
          </div>
        </div>

        {/* Toolbar: tabs + date nav */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            {/* Period tabs */}
            <div className={styles.tabs} role="tablist" aria-label="Period">
              {(["daily", "weekly", "monthly"] as const).map((p) => (
                <Link
                  key={p}
                  href={tabHref(p)}
                  role="tab"
                  aria-selected={period === p}
                  className={`${styles.tab} ${period === p ? styles.tabActive : ""}`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Link>
              ))}
            </div>

            {/* Date navigation */}
            <div className={styles.dateNav}>
              <Link href={`?period=${period}&date=${toParam(prevDate)}`} aria-label="Previous period">‹</Link>
              <span className={styles.dateLabel}>{dateLabel}</span>
              <Link href={`?period=${period}&date=${toParam(nextDate)}`} aria-label="Next period">›</Link>
              {!isToday && (
                <Link
                  href={`?period=${period}&date=${toParam(today)}`}
                  className={`${styles.tab} ${styles.todayBtn}`}
                  style={{ border: "1px solid var(--border)", borderRadius: "var(--radius, 6px)" }}
                >
                  Today
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Metric strip — always visible */}
        <MetricStrip columns={6}>
          <RCell value={fmtR(m.totalR)} label="Executed R" />
          <MetricCell label="Valid R" value={fmtR(m.validR)} detail={`${m.valid.length} valid trade${m.valid.length === 1 ? "" : "s"}`} tone={m.validR >= 0 ? "success" : "danger"} />
          <MetricCell label="Invalid R" value={fmtR(m.invalidR)} detail={`${m.invalid.length} invalid trade${m.invalid.length === 1 ? "" : "s"}`} tone={m.invalidR < 0 ? "danger" : "neutral"} />
          <MetricCell label="Execution accuracy" value={fmtPct(m.accuracy)} detail={m.reviewed.length ? `${m.valid.length} of ${m.reviewed.length} reviewed` : "No completed reviews"} tone={m.accuracy != null && m.accuracy >= 70 ? "success" : m.accuracy != null ? "danger" : "neutral"} />
          <MetricCell label="Review completion" value={fmtPct(m.reviewPct)} detail={`${m.reviewed.length} of ${m.closed.length} closed`} />
          <MetricCell label="Mistakes" value={m.withMistake.length ? String(m.withMistake.length) : "—"} detail={m.topMistake ? `Top: ${m.topMistake[0]}` : m.reviewed.length ? "None recorded" : "No reviews"} />
        </MetricStrip>

        {/* No-data state */}
        {!hasData ? (
          <div className={styles.empty}>
            <h3>No journal data for this period</h3>
            <p>Create a plan, qualify a setup, or record a review to build this log.</p>
            <div className={styles.actions}>
              <Link className="new" href="/plan">Create Daily Plan</Link>
              <Link className="new" href="/journal/new">New Setup</Link>
              <Link href="/" className={styles.tab} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius, 6px)" }}>Open Dashboard</Link>
            </div>
          </div>
        ) : period === "daily" ? (
          <DailyView plan={plans[0] ?? null} trades={trades} candidates={candidates} />
        ) : period === "weekly" ? (
          <WeeklyView rangeStart={rangeStart} trades={trades} candidates={candidates} plans={plans} m={m} />
        ) : (
          <MonthlyView rangeStart={rangeStart} trades={trades} candidates={candidates} plans={plans} m={m} />
        )}
      </div>
    </Shell>
  );
}

// ─── Daily view ───────────────────────────────────────────────────────────────

function DailyView({
  plan,
  trades,
  candidates,
}: {
  plan: Awaited<ReturnType<typeof fetchRange>>["plans"][number] | null;
  trades: TradeFull[];
  candidates: Awaited<ReturnType<typeof fetchRange>>["candidates"];
}) {
  const qualified = candidates.filter((c) => c.lifecycle === "QUALIFIED");
  const rejected = candidates.filter((c) => c.lifecycle === "REJECTED");
  const executed = candidates.filter((c) => c.disposition === "TRADED");
  const missed = candidates.filter((c) => c.disposition === "MISSED");
  const correctNT = candidates.filter((c) => c.disposition === "CORRECT_NO_TRADE");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Daily objective */}
      <section>
        <div className={styles.sectionHead}><h2>Daily Objective</h2><small>Plan</small></div>
        <PlanPanel plan={plan} />
      </section>

      {/* Execution summary */}
      <section className="card">
        <h2 style={{ fontSize: "0.9375rem", marginBottom: "0.75rem" }}>Daily Execution Summary</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "0.75rem" }}>
          {[
            ["Candidates", candidates.length],
            ["Qualified", qualified.length],
            ["Rejected", rejected.length],
            ["Traded", executed.length],
            ["Missed", missed.length],
            ["No-trade", correctNT.length],
          ].map(([label, val]) => (
            <div key={label as string} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.375rem", fontWeight: 700 }}>{val}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-2)" }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Trade table */}
      <section>
        <div className={styles.sectionHead}><h2>Trades</h2><small>{trades.length} trade{trades.length === 1 ? "" : "s"}</small></div>
        <TradesTable trades={trades} />
      </section>

      {/* Setup activity */}
      <section>
        <div className={styles.sectionHead}><h2>Setup Activity</h2><small>{candidates.length} candidate{candidates.length === 1 ? "" : "s"}</small></div>
        <CandidatesTable candidates={candidates} />
      </section>
    </div>
  );
}

// ─── Weekly view ──────────────────────────────────────────────────────────────

function WeeklyView({
  rangeStart,
  trades,
  candidates,
  plans,
  m,
}: {
  rangeStart: Date;
  trades: TradeFull[];
  candidates: Awaited<ReturnType<typeof fetchRange>>["candidates"];
  plans: Awaited<ReturnType<typeof fetchRange>>["plans"];
  m: ReturnType<typeof metrics>;
}) {
  const today = utcToday();
  const days = Array.from({ length: 7 }, (_, i) => addDays(rangeStart, i));

  const dayData = days.map((day) => {
    const dayEnd = addDays(day, 1);
    const dayTrades = trades.filter((t) => t.entryTimestamp >= day && t.entryTimestamp < dayEnd);
    const dayCandidates = candidates.filter((c) => c.createdAt >= day && c.createdAt < dayEnd);
    const plan = plans.find((p) => p.planDate >= day && p.planDate < dayEnd);
    const dm = metrics(dayTrades);
    const reviewed = dayTrades.filter((t) => t.review?.status === "COMPLETE");
    const topMistake = dm.topMistake;
    return { day, dayTrades, dayCandidates, plan, dm, reviewed, topMistake };
  });

  const ranked = Object.entries(m.mistakeCounts).sort((a, b) => b[1] - a[1]);
  const totalReviewed = m.reviewed.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Weekly breakdown */}
      <section>
        <div className={styles.sectionHead}><h2>Weekly Breakdown</h2><small>Click a day to view daily log</small></div>
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Executed R</th>
                <th>Trades</th>
                <th>Valid</th>
                <th>Invalid</th>
                <th>Reviews</th>
                <th>Top mistake</th>
                <th>Plan</th>
              </tr>
            </thead>
            <tbody>
              {dayData.map(({ day, dayTrades, dm, reviewed, topMistake, plan }) => {
                const isToday = toParam(day) === toParam(today);
                const rTone = dm.totalR >= 0 ? styles.positive : styles.negative;
                return (
                  <tr key={toParam(day)} className={isToday ? styles.dayRowToday : styles.dayRow}>
                    <td>
                      <Link href={`?period=daily&date=${toParam(day)}`} style={{ fontWeight: 600, color: "var(--text-1)" }}>
                        {day.toLocaleDateString("en-IN", { timeZone: "UTC", weekday: "short", day: "2-digit", month: "short" })}
                      </Link>
                    </td>
                    <td className={rTone}>{dayTrades.length ? fmtR(dm.totalR) : "—"}</td>
                    <td>{dayTrades.length || "—"}</td>
                    <td>{dm.valid.length || "—"}</td>
                    <td>{dm.invalid.length || "—"}</td>
                    <td>{reviewed.length ? `${reviewed.length}/${dayTrades.filter((t) => t.status === "CLOSED").length}` : "—"}</td>
                    <td>{topMistake ? topMistake[0] : "—"}</td>
                    <td>{plan ? <StatusBadge tone={plan.status === "ACTIVE" ? "success" : "neutral"}>{plan.status}</StatusBadge> : <span className="muted">—</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Mistake ranking */}
      <div className={styles.twoCol}>
        <section>
          <div className={styles.sectionHead}><h2>Mistake Ranking</h2><small>{m.withMistake.length} mistake{m.withMistake.length === 1 ? "" : "s"} this week</small></div>
          {ranked.length ? (
            <div className={styles.tableWrap}>
              <table>
                <thead><tr><th>Mistake</th><th>Count</th><th>% reviewed</th></tr></thead>
                <tbody>
                  {ranked.map(([code, count]) => (
                    <tr key={code}>
                      <td>{code}</td>
                      <td>{count}</td>
                      <td>{totalReviewed ? Math.round((count / totalReviewed) * 100) + "%" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="muted" style={{ fontSize: "0.8125rem" }}>No mistakes recorded this week.</p>}
        </section>

        <section>
          <div className={styles.sectionHead}><h2>Trade Activity</h2></div>
          <TradesTable trades={trades} />
        </section>
      </div>
    </div>
  );
}

// ─── Monthly view ─────────────────────────────────────────────────────────────

function MonthlyView({
  rangeStart,
  trades,
  candidates,
  plans,
  m,
}: {
  rangeStart: Date;
  trades: TradeFull[];
  candidates: Awaited<ReturnType<typeof fetchRange>>["candidates"];
  plans: Awaited<ReturnType<typeof fetchRange>>["plans"];
  m: ReturnType<typeof metrics>;
}) {
  const today = utcToday();
  const daysInMonth = new Date(rangeStart.getUTCFullYear(), rangeStart.getUTCMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => addDays(rangeStart, i));

  // Group by instrument
  const byInstrument: Record<string, TradeFull[]> = {};
  for (const t of trades) {
    (byInstrument[t.instrument] ??= []).push(t);
  }

  // Group by grade
  const byGrade: Record<string, TradeFull[]> = {};
  for (const t of trades) {
    const g = t.gradeLetter ?? "UNGRADED";
    (byGrade[g] ??= []).push(t);
  }

  const avgR = m.closed.length ? m.totalR / m.closed.length : null;

  // Best/worst day
  const dayTotals = days.map((day) => {
    const dayEnd = addDays(day, 1);
    const dayTrades = trades.filter((t) => t.entryTimestamp >= day && t.entryTimestamp < dayEnd);
    const r = dayTrades.reduce((s, t) => s + (t.executedR ?? 0), 0);
    return { day, r, count: dayTrades.length };
  });
  const tradingDays = dayTotals.filter((d) => d.count > 0);
  const bestDay = tradingDays.reduce<(typeof dayTotals)[number] | null>((best, d) => (!best || d.r > best.r ? d : best), null);
  const worstDay = tradingDays.reduce<(typeof dayTotals)[number] | null>((worst, d) => (!worst || d.r < worst.r ? d : worst), null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Monthly summary cards */}
      <section>
        <div className={styles.sectionHead}><h2>Monthly Summary</h2><small>{fmtMonth(rangeStart)}</small></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem" }}>
          {[
            ["Total executed R", fmtR(m.totalR)],
            ["Average R", fmtR(avgR)],
            ["Trade theses", String(m.closed.length)],
            ["Valid rate", fmtPct(m.accuracy)],
            ["Review completion", fmtPct(m.reviewPct)],
            ["Mistakes", String(m.withMistake.length) || "—"],
            ["Best day", bestDay ? fmtR(bestDay.r) : "—"],
            ["Worst day", worstDay ? fmtR(worstDay.r) : "—"],
            ["Plans created", String(plans.length)],
          ].map(([label, val]) => (
            <div key={label as string} className={styles.planCard} style={{ padding: "0.75rem 1rem" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-2)", marginBottom: "0.25rem" }}>{label}</div>
              <div style={{ fontSize: "1.125rem", fontWeight: 700 }}>{val}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Day grid */}
      <section>
        <div className={styles.sectionHead}><h2>Daily Grid</h2><small>Click a day to open daily log</small></div>
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr><th>Date</th><th>Executed R</th><th>Trades</th><th>Valid</th><th>Reviews done</th><th>Plan</th></tr>
            </thead>
            <tbody>
              {dayTotals.map(({ day, r, count }) => {
                const dayEnd = addDays(day, 1);
                const dayTrades = trades.filter((t) => t.entryTimestamp >= day && t.entryTimestamp < dayEnd);
                const dm = metrics(dayTrades);
                const plan = plans.find((p) => p.planDate >= day && p.planDate < dayEnd);
                const isToday = toParam(day) === toParam(today);
                if (!count && !plan) return null;
                return (
                  <tr key={toParam(day)} className={isToday ? styles.dayRowToday : ""}>
                    <td>
                      <Link href={`?period=daily&date=${toParam(day)}`} style={{ fontWeight: 500, color: "var(--text-1)" }}>
                        {day.toLocaleDateString("en-IN", { timeZone: "UTC", weekday: "short", day: "2-digit", month: "short" })}
                      </Link>
                    </td>
                    <td className={r >= 0 ? styles.positive : styles.negative}>{count ? fmtR(r) : "—"}</td>
                    <td>{count || "—"}</td>
                    <td>{dm.valid.length || "—"}</td>
                    <td>{dm.reviewed.length ? `${dm.reviewed.length}/${dm.closed.length}` : "—"}</td>
                    <td>{plan ? <StatusBadge tone={plan.status === "ACTIVE" ? "success" : "neutral"}>{plan.status}</StatusBadge> : <span className="muted">—</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Breakdown by instrument */}
      <div className={styles.twoCol}>
        <section>
          <div className={styles.sectionHead}><h2>By Instrument</h2></div>
          <div className={styles.tableWrap}>
            <table>
              <thead><tr><th>Instrument</th><th>Trades</th><th>Valid</th><th>Total R</th><th>Avg R</th></tr></thead>
              <tbody>
                {Object.entries(byInstrument).map(([inst, ts]) => {
                  const im = metrics(ts);
                  const iAvg = im.closed.length ? im.totalR / im.closed.length : null;
                  return (
                    <tr key={inst}>
                      <td><strong>{inst}</strong></td>
                      <td>{ts.length}</td>
                      <td>{im.valid.length}</td>
                      <td className={im.totalR >= 0 ? styles.positive : styles.negative}>{fmtR(im.totalR)}</td>
                      <td className={iAvg != null && iAvg >= 0 ? styles.positive : styles.negative}>{fmtR(iAvg)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <div className={styles.sectionHead}><h2>Mistake Ranking</h2></div>
          <MistakeTable mistakeCounts={m.mistakeCounts} />
        </section>
      </div>

      {/* By grade */}
      <section>
        <div className={styles.sectionHead}><h2>By Setup Grade</h2></div>
        <div className={styles.tableWrap}>
          <table>
            <thead><tr><th>Grade</th><th>Trades</th><th>Valid</th><th>Win rate</th><th>Total R</th><th>Avg R</th></tr></thead>
            <tbody>
              {(["A_PLUS", "A", "B", "C", "UNGRADED"] as const).map((grade) => {
                const ts = byGrade[grade];
                if (!ts?.length) return null;
                const gm = metrics(ts);
                const wins = ts.filter((t) => t.closeStatus === "WIN").length;
                const winRate = ts.length ? Math.round((wins / ts.length) * 100) : null;
                const gAvg = gm.closed.length ? gm.totalR / gm.closed.length : null;
                return (
                  <tr key={grade}>
                    <td><strong>{grade}</strong></td>
                    <td>{ts.length}</td>
                    <td>{gm.valid.length}</td>
                    <td>{winRate != null ? `${winRate}%` : "—"}</td>
                    <td className={gm.totalR >= 0 ? styles.positive : styles.negative}>{fmtR(gm.totalR)}</td>
                    <td className={gAvg != null && gAvg >= 0 ? styles.positive : styles.negative}>{fmtR(gAvg)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
