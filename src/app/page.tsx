import Link from "next/link";
import { Shell } from "@/components/shell";
import { AnalyticsGrid, AnalyticsPanel, EmptyState, JournalCalendar, LedgerScorePanel, MetricCell, MetricStrip, MiniChart, ProgressLine, StatusBadge } from "@/components/ledger-ui";
import { PerformanceDashboard } from "@/components/performance-dashboard";
import { DashboardControls } from "@/components/dashboard-controls";
import { AnalysisDashboard } from "@/components/analysis-dashboard";
import { unstable_cache } from "next/cache";
import { dashboardFilters, dateRange } from "@/lib/dashboard-filters";
import { prisma } from "@/lib/prisma";
import { guardPage } from "@/lib/supabase/page-guard";
import styles from "./home.module.css";

export const dynamic = "force-dynamic";

// Strategies and versions rarely change — cache for 2 minutes.
const cachedStrategy = unstable_cache(
  () => prisma.strategyVersion.findFirst({ where: { status: "PUBLISHED" }, orderBy: { versionNumber: "desc" } }),
  ["dash-strategy"], { revalidate: 120 }
);
const cachedDrafts = unstable_cache(
  () => prisma.strategyVersion.count({ where: { status: "DRAFT" } }),
  ["dash-drafts"], { revalidate: 120 }
);
const cachedVersions = unstable_cache(
  () => prisma.strategyVersion.findMany({ include: { strategy: true }, orderBy: { versionNumber: "desc" } }),
  ["dash-versions"], { revalidate: 120 }
);
// Trades: 1-year rolling window, cached 30 s so rapid refreshes don't hammer the DB.
// unstable_cache serialises to JSON, turning Dates into ISO strings. Re-hydrate them on the way out.
const _cachedTradesRaw = unstable_cache(
  () => {
    const since = new Date();
    since.setFullYear(since.getFullYear() - 1);
    return prisma.trade.findMany({ where: { createdAt: { gte: since } }, orderBy: { createdAt: "asc" }, include: { candidate: { include: { optionSelections: true } }, review: true, strategyVersion: { include: { strategy: true } } } });
  },
  ["dash-trades-v2"], { revalidate: 30 }
);
const cachedTrades = async () => {
  const rows = await _cachedTradesRaw();
  return rows.map(t => ({
    ...t,
    createdAt: new Date(t.createdAt),
    entryTimestamp: new Date(t.entryTimestamp),
    candidate: { ...t.candidate, createdAt: new Date(t.candidate.createdAt), updatedAt: new Date(t.candidate.updatedAt) },
  }));
};

const title = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const safeJson = <T,>(value: string | null | undefined, fallback: T): T => { try { return value ? JSON.parse(value) as T : fallback; } catch { return fallback; } };
const formatR = (value: number | null | undefined) => value == null ? "—" : `${value >= 0 ? "+" : ""}${value.toFixed(2)}R`;
const stamp = (value: Date) => new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(value);

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await guardPage();
  const now = new Date();
  const filters = dashboardFilters(await searchParams, now); const selectedRange = dateRange(filters, now);
  const [strategy, plans, candidates, allTrades, audits, drafts, versions] = await Promise.all([
    cachedStrategy(),
    prisma.dailyPlan.findMany({ where: { status: "ACTIVE" }, orderBy: { updatedAt: "desc" }, include: { instruments: true } }),
    prisma.setupCandidate.findMany({ orderBy: { updatedAt: "desc" }, take: 20, include: { gateAssessment: true, grade: true, trade: true, evidence: true } }),
    cachedTrades(),
    prisma.auditEvent.findMany({ orderBy: { timestamp: "desc" }, take: 7 }),
    cachedDrafts(),
    cachedVersions(),
  ]);
  const plan = plans.find((item) => (!filters.account || item.account === filters.account) && (!filters.version || item.strategyVersionId === filters.version)) ?? plans[0];
  const filterTrade = (trade: typeof allTrades[number]) => {
    const setupTypes = trade.candidate.optionSelections.filter((item) => item.category === "SETUP_TYPE").map((item) => item.labelSnapshot);
    const valid = trade.review?.classification?.startsWith("Valid") ? "valid" : trade.review?.classification?.startsWith("Invalid") ? "invalid" : undefined;
    return (!filters.account || trade.account === filters.account) && (!filters.strategy || trade.strategyVersion.strategy.id === filters.strategy) && (!filters.version || trade.strategyVersionId === filters.version) && (!filters.instrument || trade.instrument === filters.instrument) && (!filters.setupType || setupTypes.includes(filters.setupType)) && (!filters.entryModel || trade.entryModel === filters.entryModel) && (!filters.grade || trade.gradeLetter === filters.grade) && (filters.validity === "all" || !filters.validity || valid === filters.validity) && (filters.direction === "all" || !filters.direction || trade.direction === filters.direction) && (!filters.session || trade.candidate.sessionLabel === filters.session) && (!filters.closeStatus || trade.closeStatus === filters.closeStatus) && (!filters.mistake || trade.review?.primaryMistake === filters.mistake) && (!selectedRange.start || trade.createdAt >= selectedRange.start) && (!selectedRange.end || trade.createdAt < selectedRange.end) && (filters.source !== "verified" || trade.review?.status === "COMPLETE") && (filters.source !== "demo" || trade.candidate.thesis?.startsWith("DEMO:"));
  };
  const weeklyTrades = selectedRange.valid ? allTrades.filter(filterTrade) : [];
  const selectedMonth = new Date(`${filters.month}-01T00:00:00`);
  const monthTrades = allTrades.filter(filterTrade).filter((trade) => trade.createdAt.getFullYear() === selectedMonth.getFullYear() && trade.createdAt.getMonth() === selectedMonth.getMonth());
  const pendingReviews = weeklyTrades.filter((trade) => !trade.review).slice(-4).reverse();

  const planInstrument = plan?.instruments[0];
  const planCandidates = candidates.filter((candidate) => candidate.dailyPlanId === plan?.id);
  const tradeTheses = planCandidates.filter((candidate) => candidate.trade).length;
  const reviewed = weeklyTrades.filter((trade) => trade.review?.status === "COMPLETE");
  const valid = reviewed.filter((trade) => trade.review?.classification?.startsWith("Valid"));
  const invalid = reviewed.filter((trade) => trade.review?.classification?.startsWith("Invalid"));
  const executionAccuracy = reviewed.length ? Math.round((valid.length / reviewed.length) * 100) : null;
  const executedValues = weeklyTrades.map((trade) => trade.executedR).filter((value): value is number => value != null);
  const averageR = executedValues.length ? executedValues.reduce((sum, value) => sum + value, 0) / executedValues.length : null;
  const winning = executedValues.filter((value) => value > 0); const losing = executedValues.filter((value) => value < 0);
  const validR = weeklyTrades.filter((trade) => trade.review?.classification?.startsWith("Valid")).reduce((sum, trade) => sum + (trade.executedR ?? 0), 0);
  const invalidR = weeklyTrades.filter((trade) => trade.review?.classification?.startsWith("Invalid")).reduce((sum, trade) => sum + (trade.executedR ?? 0), 0);
  const recentOutcomes = weeklyTrades.slice().reverse(); let consecutiveLosses = 0; let consecutiveWins = 0;
  for (const trade of recentOutcomes) { if ((trade.netResult ?? 0) < 0 && consecutiveWins === 0) consecutiveLosses++; else if ((trade.netResult ?? 0) > 0 && consecutiveLosses === 0) consecutiveWins++; else break; }
  const selectivity = weeklyTrades.length ? Math.round((weeklyTrades.filter((trade) => trade.gradeLetter === "A" || trade.gradeLetter === "A_PLUS").length / weeklyTrades.length) * 100) : null;
  const reviewCompletion = weeklyTrades.length ? Math.round((reviewed.length / weeklyTrades.length) * 100) : null;
  const qualificationDurations = weeklyTrades.map((trade) => trade.entryTimestamp.getTime() - trade.candidate.createdAt.getTime()).filter((value) => value >= 0);
  const averageQualificationMinutes = qualificationDurations.length ? Math.round(qualificationDurations.reduce((sum, value) => sum + value, 0) / qualificationDurations.length / 60000) : null;
  const cumulative: number[] = [];
  for (const trade of weeklyTrades) cumulative.push((cumulative.at(-1) ?? 0) + (trade.executedR ?? 0));
  const drawdown: number[] = [];
  let runningPeak = 0;
  for (const point of cumulative) { runningPeak = Math.max(runningPeak, point); drawdown.push(Math.min(0, point - runningPeak)); }
  const validCurve: number[] = [];
  for (const trade of weeklyTrades) validCurve.push((validCurve.at(-1) ?? 0) + (trade.review?.classification?.startsWith("Valid") ? (trade.executedR ?? 0) : 0));
  const incompleteDiagnostics = candidates.filter((candidate) => candidate.gateAssessment?.result === "REJECTED" && candidate.gateAssessment.diagnosticCompletion === "PARTIAL");
  const missingEvidence = candidates.filter((candidate) => candidate.evidence.length === 0).slice(0, 2);
  const config = strategy ? safeJson<{ riskBasis?: string | null }>(strategy.configuration, {}) : null;

  // Performance dashboard metrics
  const grossWins = winning.reduce((s, v) => s + v, 0);
  const grossLosses = Math.abs(losing.reduce((s, v) => s + v, 0));
  const profitFactorValue = grossLosses > 0 ? grossWins / grossLosses : null;
  const avgWin = winning.length ? grossWins / winning.length : null;
  const avgLoss = losing.length ? grossLosses / losing.length : null;
  const winRateRaw = executedValues.length ? winning.length / executedValues.length * 100 : null;
  const maxDD = drawdown.length ? Math.min(...drawdown) : 0;
  const totalR = cumulative.at(-1) ?? 0;
  const recoveryFactor = maxDD < 0 ? totalR / Math.abs(maxDD) : null;
  const mean = averageR ?? 0;
  const variance = executedValues.length > 1 ? executedValues.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / executedValues.length : 0;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = executedValues.length > 1 && stdDev > 0 ? mean / stdDev : null;
  const downsideDev = Math.sqrt(executedValues.filter(v => v < 0).reduce((s, v) => s + v * v, 0) / Math.max(executedValues.length, 1));
  const sortino = executedValues.length > 1 && downsideDev > 0 ? mean / downsideDev : null;
  const cv = mean !== 0 && stdDev > 0 ? stdDev / Math.abs(mean) : 1;
  const consistencyScore = Math.max(0, Math.min(100, Math.round(100 - cv * 30)));
  const currentDrawdown = drawdown.at(-1) ?? 0;
  const tradeDates = weeklyTrades.map(t => new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(t.createdAt));
  const reviewQueue = [
    ...pendingReviews.map((trade) => ({ id: trade.id, kind: "Review", title: `${trade.instrument} needs post-trade review`, detail: trade.candidate.thesis || "Closed trade awaiting review", href: "/review", tone: "warning" as const, time: stamp(trade.createdAt) })),
    ...incompleteDiagnostics.map((candidate) => ({ id: candidate.id, kind: "Gate", title: `${candidate.instrument} diagnostics incomplete`, detail: `First failed ${candidate.gateAssessment?.firstFailedGateKey ?? "gate"}`, href: `/journal/${candidate.id}`, tone: "danger" as const, time: stamp(candidate.updatedAt) })),
    ...missingEvidence.map((candidate) => ({ id: `${candidate.id}-evidence`, kind: "Evidence", title: `${candidate.instrument} lacks evidence`, detail: "Attach the pre-entry screenshot.", href: `/journal/${candidate.id}`, tone: "info" as const, time: stamp(candidate.updatedAt) }))
  ].slice(0, 5);
  const alerts = [
    !strategy ? ["warning", "No published strategy", "Publish a strategy version before qualifying new setups.", "/strategy"] : null,
    config?.riskBasis == null ? ["warning", "Risk basis unconfigured", "Risk amounts require an owner-selected account basis.", "/strategy"] : null,
    plan && tradeTheses >= plan.maxTradeTheses ? ["danger", "Daily thesis limit reached", "A further thesis must remain a restricted historical record.", "/journal"] : null,
    drafts ? ["info", "Strategy draft awaiting review", `${drafts} unpublished draft${drafts === 1 ? "" : "s"} in the strategy library.`, "/strategy"] : null
  ].filter(Boolean) as ["warning" | "danger" | "info", string, string, string][];

  return <Shell hideNewSetup>
    <div className={styles.dashboard}>
      <DashboardControls tab={filters.tab} source={filters.source} account={filters.account} strategy={filters.strategy} version={filters.version} instrument={filters.instrument} setupType={filters.setupType} entryModel={filters.entryModel} grade={filters.grade} validity={filters.validity} direction={filters.direction} session={filters.session} closeStatus={filters.closeStatus} mistake={filters.mistake} range={filters.range} start={filters.start} end={filters.end} group={filters.group} accounts={[...new Set([...allTrades.map((trade) => trade.account), ...plans.map((item) => item.account)])].map((value) => ({ value, label: value.includes("Demo") ? `${value} · demo` : value }))} strategies={[...new Map(versions.map((item) => [item.strategy.id, { value: item.strategy.id, label: item.strategy.name }])).values()]} versions={versions.map((item) => ({ value: item.id, label: `${item.strategy.name} · v${item.versionNumber} · ${item.status}` }))} instruments={[...new Set(allTrades.map((trade) => trade.instrument))].map((value) => ({ value, label: value }))} setupTypes={[...new Set(allTrades.flatMap((trade) => trade.candidate.optionSelections.filter((item) => item.category === "SETUP_TYPE").map((item) => item.labelSnapshot)))].map((value) => ({ value, label: value }))} entryModels={[...new Set(allTrades.map((trade) => trade.entryModel).filter((value): value is string => Boolean(value)))].map((value) => ({ value, label: value }))} mistakes={[...new Set(allTrades.map((trade) => trade.review?.primaryMistake).filter((value): value is string => Boolean(value && value !== "NONE")))].map((value) => ({ value, label: value }))} />
      {!selectedRange.valid && <p className={styles.rangeError} role="alert">Custom start date must be before the end date.</p>}

      {filters.tab === "journal" && <section className={styles.operationBar} aria-label="Today’s operating state">
        <div><small>ACTIVE PLAN</small><strong>{plan ? `${planInstrument?.instrument ?? "Daily plan"} · Active` : "No active plan"}</strong></div>
        <div><small>SESSION</small><strong>{plan ? safeJson<string[]>(plan.sessionLabels, []).join(", ") : "Not set"}</strong></div>
        <div><small>RISK MODE</small><strong>{plan?.riskMode === "REDUCED" ? "Reduced · 1%" : plan ? "Standard · 2%" : "Not set"}</strong></div>
        <div><small>TRADE THESES</small><strong>{tradeTheses} of {plan?.maxTradeTheses ?? 2}</strong></div>
        <div><small>WEEKLY OBJECTIVE</small><strong>{plan?.objective || "Not set"}</strong></div>
        <Link href={plan ? "/plan" : "/plan"}>{plan ? "Open plan" : "Create plan"}</Link>
      </section>}

      {filters.tab === "journal" && <><MetricStrip columns={5}>
        <MetricCell label="Execution accuracy" value={executionAccuracy == null ? "—" : `${executionAccuracy}%`} detail={reviewed.length ? `${valid.length} valid · ${invalid.length} invalid` : "No completed reviews"}><ProgressLine value={executionAccuracy ?? 0} label="Reviewed execution quality" /></MetricCell>
        <MetricCell label="Average executed R" value={formatR(averageR)} detail={executedValues.length ? `Win avg ${formatR(winning.length ? winning.reduce((sum, value) => sum + value, 0) / winning.length : null)} · loss avg ${formatR(losing.length ? losing.reduce((sum, value) => sum + value, 0) / losing.length : null)}` : "No closed trades"} />
        <MetricCell label="Validity performance" value={formatR(validR)} detail={`Valid trade R · invalid ${formatR(invalidR)}`}><ProgressLine value={Math.abs(validR) + Math.abs(invalidR) ? Math.abs(validR) / (Math.abs(validR) + Math.abs(invalidR)) * 100 : 0} label="Valid share" /></MetricCell>
        <MetricCell label="Execution streaks" value={`${consecutiveWins}W · ${consecutiveLosses}L`} detail={`Two-loss rule: ${consecutiveLosses >= 2 ? "triggered" : "clear"}`} />
        <MetricCell label="Qualification to entry" value={averageQualificationMinutes == null ? "—" : `${averageQualificationMinutes}m`} detail={averageQualificationMinutes == null ? "No elapsed records" : "Average recorded duration"} />
      </MetricStrip>

      <AnalyticsGrid>
        <LedgerScorePanel adherence={executionAccuracy ?? 0} selectivity={selectivity ?? 0} completion={reviewCompletion ?? 0} />
        <AnalyticsPanel label="Cumulative Executed R" value={formatR(cumulative.at(-1) ?? null)} detail="This week"><MiniChart values={cumulative} label="Cumulative executed R this week" /></AnalyticsPanel>
        <AnalyticsPanel label="Drawdown" value={formatR(drawdown.at(-1) ?? null)} detail="Current R"><MiniChart values={drawdown} tone="danger" label="Drawdown in R this week" /></AnalyticsPanel>
        <AnalyticsPanel label="Valid-trade R" value={formatR(validCurve.at(-1) ?? null)} detail="Reviewed valid trades"><MiniChart values={validCurve} tone="info" label="Cumulative R from valid trades this week" /></AnalyticsPanel>
      </AnalyticsGrid>

      <JournalCalendar trades={monthTrades} month={selectedMonth} />

      <div className={styles.lowerGrid}>
        <section className={styles.panel}><header><div><small>PREPARATION</small><h2>Active plan</h2></div>{plan && <StatusBadge tone="success">Active</StatusBadge>}</header>{plan ? <><div className={styles.planDetails}><div><small>Instrument</small><b>{planInstrument?.instrument ?? "Not specified"}</b></div><div><small>Bias</small><b>{planInstrument ? title(planInstrument.bias) : "Not specified"}</b></div><div><small>Archetype</small><b>{planInstrument?.archetype ?? "Not specified"}</b></div><div><small>Entry models</small><b>{planInstrument ? safeJson<string[]>(planInstrument.permittedModels, []).join(", ") : "Not specified"}</b></div></div><p className={styles.narrative}>{planInstrument?.macroNarrative || "No macro narrative recorded."}</p><footer><Link href="/plan">Open full plan</Link><Link href="/journal/new">Create setup from plan</Link></footer></> : <EmptyState title="No active plan" text="Prepare direction, scenarios, and risk conditions before qualifying a setup." action={{ href: "/plan", label: "Create Daily Plan" }} />}</section>
        <section className={styles.panel}><header><div><small>LEDGER</small><h2>Recent activity</h2></div><Link href="/journal">View journal</Link></header>{audits.length ? <div className={styles.activityTable} role="table" aria-label="Recent journal activity"><div role="row" className={styles.activityHead}><span>Record</span><span>Event</span><span>Status</span><span>Time</span></div>{audits.map((event) => <Link role="row" href={event.entityType === "StrategyVersion" ? "/strategy" : event.entityType === "TradeReview" ? "/review" : "/journal"} key={event.id}><span>{title(event.entityType)}</span><b>{title(event.action)}</b><StatusBadge tone={event.action.includes("REJECT") ? "danger" : event.action.includes("RESTRICT") ? "warning" : "info"}>{event.action.includes("REJECT") ? "Rejected" : event.action.includes("RESTRICT") ? "Restricted" : "Recorded"}</StatusBadge><time>{stamp(event.timestamp)}</time></Link>)}</div> : <EmptyState title="No journal activity" text="Start a daily plan, then capture a setup before outcome is known." />}</section>
        <aside className={styles.rightRail}><section className={styles.panel}><header><div><small>ATTENTION REQUIRED</small><h2>Review queue</h2></div><StatusBadge tone={reviewQueue.length ? "warning" : "success"}>{reviewQueue.length}</StatusBadge></header>{reviewQueue.length ? <ul className={styles.queue}>{reviewQueue.map((item) => <li key={item.id}><StatusBadge tone={item.tone}>{item.kind}</StatusBadge><div><b>{item.title}</b><p>{item.detail}</p><small>{item.time}</small></div><Link href={item.href}>Open</Link></li>)}</ul> : <EmptyState title="Review queue clear" text="No unresolved reviews or evidence requirements." />}</section><section className={styles.panel}><header><div><small>SYSTEM WATCH</small><h2>Alerts</h2></div></header>{alerts.length ? <ul className={styles.alerts}>{alerts.map(([tone, heading, message, href]) => <li key={heading}><StatusBadge tone={tone}>{tone === "danger" ? "Critical" : tone === "warning" ? "Attention" : "Info"}</StatusBadge><div><b>{heading}</b><p>{message}</p></div><Link href={href}>Open</Link></li>)}</ul> : <EmptyState title="No active alerts" text="The current strategy and daily journal state have no integrity warnings." />}</section></aside>
      </div>
      <p className={styles.demoLabel}>All displayed records are demo data where labelled and do not represent real trading history.</p></>}
      {filters.tab === "comparison" && (weeklyTrades.length === 0 ? <EmptyState title="No trades in selection" text="Adjust the date range or filters to include trades." action={{ href: "/?tab=journal", label: "Go to Journal" }} /> : <PerformanceDashboard data={{ tradeCount: weeklyTrades.length, winCount: winning.length, lossCount: losing.length, totalR, averageR, grossWins, grossLosses, avgWin, avgLoss, winRate: winRateRaw, profitFactor: profitFactorValue, sharpeRatio, sortino, maxDrawdown: maxDD, currentDrawdown, recoveryFactor, consistencyScore, cumulativeCurve: cumulative, tradeDates, executionAccuracy }} />)}
      {filters.tab === "analysis" && <><div className={styles.analysisHeader}><div><p className="eyebrow">Performance intelligence</p><h1>Analysis</h1><p className="muted">Review performance, execution quality, setup behaviour, and recurring mistakes.</p></div></div><AnalysisDashboard trades={weeklyTrades.map((trade) => ({ id: trade.id, createdAt: trade.createdAt, executedR: trade.executedR, instrument: trade.instrument, direction: trade.direction, account: trade.account, entryModel: trade.entryModel, gradeLetter: trade.gradeLetter, session: trade.candidate.sessionLabel, setupType: trade.candidate.optionSelections.find((item) => item.category === "SETUP_TYPE")?.labelSnapshot ?? "Unspecified", closeStatus: trade.closeStatus, strategy: trade.strategyVersion.strategy.name, version: trade.strategyVersion.versionNumber, review: trade.review ? { status: trade.review.status, classification: trade.review.classification, primaryMistake: trade.review.primaryMistake } : null }))} group={filters.group} /></>}
    </div>
  </Shell>;
}
