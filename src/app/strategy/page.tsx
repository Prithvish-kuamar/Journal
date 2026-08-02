import Link from "next/link";
import { Shell } from "@/components/shell";
import { createDraftVersion, publishStrategyVersion } from "@/app/actions";
import { FilterToken, MetricCell, MetricStrip, PageToolbar, ProgressLine, StatusBadge } from "@/components/ledger-ui";
import { prisma } from "@/lib/prisma";
import styles from "./strategy.module.css";

export const dynamic = "force-dynamic";

const asList = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
const r = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(2)}R`;

export default async function StrategyPage() {
  const versions = await prisma.strategyVersion.findMany({
    include: { strategy: true, rules: { orderBy: { displayOrder: "asc" } }, gates: { orderBy: { displayOrder: "asc" } }, gradeCategories: { orderBy: { displayOrder: "asc" } }, entryModels: { orderBy: { code: "asc" } }, trades: { include: { review: true } } },
    orderBy: { versionNumber: "desc" }
  });
  const current = versions[0];
  if (!current) return <Shell><div className={styles.empty}><h1>Strategy Library</h1><p>No strategy exists yet. Run the documented demo seed command to load clearly labelled local data.</p></div></Shell>;
  const currentConfig = JSON.parse(current.configuration) as Record<string, unknown>;
  const allTrades = versions.flatMap((version) => version.trades);
  const totalR = allTrades.reduce((sum, trade) => sum + (trade.executedR ?? 0), 0);
  const reviewed = allTrades.filter((trade) => trade.review?.status === "COMPLETE");
  const validReviewed = reviewed.filter((trade) => trade.review?.classification?.startsWith("Valid"));
  const accuracy = reviewed.length ? Math.round(validReviewed.length / reviewed.length * 100) : null;
  const expectancy = allTrades.filter((trade) => trade.executedR != null).length ? totalR / allTrades.filter((trade) => trade.executedR != null).length : null;
  const ranked = versions.map((version) => { const trades = version.trades; const reviewedTrades = trades.filter((trade) => trade.review?.status === "COMPLETE"); const valid = reviewedTrades.filter((trade) => trade.review?.classification?.startsWith("Valid")); const executedR = trades.reduce((sum, trade) => sum + (trade.executedR ?? 0), 0); return { version, trades, executedR, accuracy: reviewedTrades.length ? Math.round(valid.length / reviewedTrades.length * 100) : null }; }).sort((a, b) => b.executedR - a.executedR);
  const permitted = asList(currentConfig.permittedInstruments);
  const modelCards = current.entryModels.map((model) => { const trades = current.trades.filter((trade) => trade.entryModel === model.code); const modelR = trades.reduce((sum, trade) => sum + (trade.executedR ?? 0), 0); const modelReviewed = trades.filter((trade) => trade.review?.status === "COMPLETE"); const modelValid = modelReviewed.filter((trade) => trade.review?.classification?.startsWith("Valid")); return { model, trades, modelR, modelAccuracy: modelReviewed.length ? Math.round(modelValid.length / modelReviewed.length * 100) : null }; });

  return <Shell>
    <div className={styles.strategy}>
      <PageToolbar actions={<><span className={styles.strategyCount}>{versions.length} version{versions.length === 1 ? "" : "s"}</span><Link className={styles.secondary} href="/strategy/edit">Edit draft</Link>{current.status === "PUBLISHED" && <form action={createDraftVersion}><input type="hidden" name="versionId" value={current.id}/><button className="new">+ Create draft</button></form>}{current.status === "DRAFT" && <form className={styles.publish} action={publishStrategyVersion}><input type="hidden" name="versionId" value={current.id}/><input name="changeSummary" placeholder="Change summary" aria-label="Change summary"/><button className="new">Publish version</button></form>}</>}>
        <label className={styles.search} title="Strategy-library filtering is not available in the current phase."><span aria-hidden="true">⌕</span><input type="search" placeholder="Search strategies" aria-label="Search strategies unavailable in the current phase" disabled /></label><FilterToken label="Status" value="All status" /><FilterToken label="Archetype" value="All types" /><FilterToken label="Rank by" value="Total R" />
      </PageToolbar>

      <MetricStrip columns={4}>
        <MetricCell label="Strategies" value={String(new Set(versions.map((version) => version.strategyId)).size)} detail={`${versions.filter((version) => version.status === "PUBLISHED").length} published version${versions.filter((version) => version.status === "PUBLISHED").length === 1 ? "" : "s"}`} />
        <MetricCell label="Total executed R" value={r(totalR)} detail={`${allTrades.length} closed trade${allTrades.length === 1 ? "" : "s"}`} tone={totalR >= 0 ? "success" : "danger"} />
        <MetricCell label="Best execution accuracy" value={accuracy == null ? "—" : `${accuracy}%`} detail={reviewed.length ? `${validReviewed.length} valid of ${reviewed.length} reviewed` : "No completed reviews"}><ProgressLine value={accuracy ?? 0} label="Reviewed execution" /></MetricCell>
        <MetricCell label="Expectancy" value={expectancy == null ? "—" : r(expectancy)} detail="Average Executed R per closed trade" tone={expectancy == null ? "neutral" : expectancy >= 0 ? "success" : "danger"} />
      </MetricStrip>

      <section className={styles.ranking}><header><div><small>RANKED STRATEGY VERSIONS</small><h1>Top strategies</h1></div><span>Ranked by real Executed R</span></header>{ranked.length ? <ol>{ranked.map(({ version, executedR, accuracy: versionAccuracy }, index) => <li key={version.id}><b className={index < 3 ? styles[`rank${index + 1}`] : ""}>{index + 1}</b><div><strong>{version.strategy.name} <span>· v{version.versionNumber}</span></strong><small>{version.status === "PUBLISHED" ? "Published immutable version" : "Draft change set"}</small></div><ProgressLine value={Math.min(100, Math.abs(executedR) / Math.max(1, Math.abs(ranked[0].executedR)) * 100)} tone={executedR >= 0 ? "warning" : "danger"} /><em className={executedR >= 0 ? styles.positive : styles.negative}>{r(executedR)}</em><span className={styles.rankAccuracy}>{versionAccuracy == null ? "No reviews" : `${versionAccuracy}% accuracy`}</span></li>)}</ol> : <p className={styles.noData}>No ranked strategy data is available.</p>}</section>

      <section className={styles.sectionHead}><div><small>STRATEGY VERSIONS</small><h2>Strategy library</h2></div><p>Versions retain their own historical references and are never recalculated.</p></section>
      <div className={styles.cardGrid}>{versions.map((version) => { const config = JSON.parse(version.configuration) as Record<string, unknown>; const versionR = version.trades.reduce((sum, trade) => sum + (trade.executedR ?? 0), 0); const completed = version.trades.filter((trade) => trade.review?.status === "COMPLETE"); const valid = completed.filter((trade) => trade.review?.classification?.startsWith("Valid")); const versionAccuracy = completed.length ? Math.round(valid.length / completed.length * 100) : null; return <article className={styles.strategyCard} key={version.id}><header><StatusBadge tone={version.status === "PUBLISHED" ? "success" : version.status === "DRAFT" ? "warning" : "neutral"}>{version.status}</StatusBadge><Link href="/strategy/edit" aria-label={`Open version ${version.versionNumber}`}>›</Link></header><h3>{version.strategy.name}</h3><p>{version.changeSummary || "Owner-configurable strategy template"}</p><div className={styles.tags}>{asList(config.permittedInstruments).slice(0, 4).map((instrument) => <span key={instrument}>{instrument}</span>)}</div><dl><div><dt>Version</dt><dd>v{version.versionNumber}</dd></div><div><dt>Executed R</dt><dd className={versionR >= 0 ? styles.positive : styles.negative}>{r(versionR)}</dd></div><div><dt>Accuracy</dt><dd>{versionAccuracy == null ? "—" : `${versionAccuracy}%`}</dd></div><div><dt>Trades</dt><dd>{version.trades.length}</dd></div></dl><ProgressLine value={versionAccuracy ?? 0} label="Reviewed execution accuracy" /><footer><span>Risk {String(config.standardRiskPercent ?? "—")}%</span><Link href="/strategy/edit">Open version</Link></footer></article>; })}</div>

      <section className={styles.sectionHead}><div><small>ENTRY MODELS</small><h2>Configured model library</h2></div><p>Models use existing owner-configured shells; unknown doctrine remains unfilled.</p></section>
      <div className={styles.modelGrid}>{modelCards.map(({ model, trades, modelR, modelAccuracy }) => <article className={styles.modelCard} key={model.id}><header><StatusBadge tone={model.active ? "success" : "neutral"}>{model.active ? "Active" : "Inactive"}</StatusBadge><span>{model.code}</span></header><h3>{model.name}</h3><p>{model.shortDescription || "Owner configuration required"}</p><div className={styles.modelStats}><span><small>Executed R</small><b className={modelR >= 0 ? styles.positive : styles.negative}>{r(modelR)}</b></span><span><small>Accuracy</small><b>{modelAccuracy == null ? "—" : `${modelAccuracy}%`}</b></span><span><small>Trades</small><b>{trades.length}</b></span></div><ProgressLine value={modelAccuracy ?? 0} label="Reviewed execution accuracy" /><Link href="/strategy/edit">Open model configuration</Link></article>)}</div>

      <section className={styles.configGrid}><article><header><small>ACTIVE CONFIGURATION</small><h2>Global operating rules</h2></header><dl><div><dt>Permitted instruments</dt><dd>{permitted.join(", ") || "Owner configuration required"}</dd></div><div><dt>Session labels</dt><dd>{asList(currentConfig.sessionLabels).join(", ") || "Owner configuration required"}</dd></div><div><dt>Risk</dt><dd>{String(currentConfig.standardRiskPercent ?? "—")}% standard · {String(currentConfig.reducedRiskPercent ?? "—")}% reduced</dd></div><div><dt>Minimum R</dt><dd>{String(currentConfig.minimumRewardRisk ?? "—")}R before technical obstruction</dd></div></dl><Link href="/strategy/edit">Open full rulebook</Link></article><article><header><small>VERSION HISTORY</small><h2>Immutable record</h2></header><ul>{versions.map((version) => <li key={version.id}><StatusBadge tone={version.status === "PUBLISHED" ? "success" : "warning"}>v{version.versionNumber}</StatusBadge><span>{version.changeSummary || "Initial template"}</span><time>{(version.publishedAt ?? version.createdAt).toLocaleDateString("en-IN")}</time></li>)}</ul></article></section>
    </div>
  </Shell>;
}
