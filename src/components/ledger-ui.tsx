import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./ledger-ui.module.css";

export function StatusBadge({ tone = "neutral", children }: { tone?: "neutral" | "success" | "warning" | "danger" | "info"; children: ReactNode }) {
  return <span className={`${styles.badge} ${styles[tone]}`}><span aria-hidden="true">●</span>{children}</span>;
}

export function PageToolbar({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  return <div className={styles.toolbar}><div className={styles.toolbarFilters}>{children}</div>{actions && <div className={styles.toolbarActions}>{actions}</div>}</div>;
}

export function FilterToken({ label, value }: { label: string; value: string }) {
  return <span className={styles.filterToken}><small>{label}</small>{value}<span aria-hidden="true">⌄</span></span>;
}

export function MetricStrip({ children, columns = 5 }: { children: ReactNode; columns?: 3 | 4 | 5 }) {
  return <section className={`${styles.metricStrip} ${styles[`columns${columns}`]}`} aria-label="Journal metrics">{children}</section>;
}

export function MetricCell({ label, value, detail, tone = "neutral", children }: { label: string; value: string; detail?: string; tone?: "neutral" | "success" | "warning" | "danger"; children?: ReactNode }) {
  return <article className={styles.metricCell}><p>{label}</p><strong className={styles[tone]}>{value}</strong>{detail && <small>{detail}</small>}{children}</article>;
}

export function ProgressLine({ value, tone = "success", label }: { value: number; tone?: "success" | "danger" | "warning" | "info"; label?: string }) {
  const width = Math.max(0, Math.min(100, value));
  return <div className={styles.progressWrap}>{label && <span>{label}</span>}<div className={styles.progressTrack} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(width)}><i className={styles[tone]} style={{ width: `${width}%` }} /></div></div>;
}

export function AnalyticsPanel({ label, value, detail, children }: { label: string; value: string; detail?: string; children: ReactNode }) {
  return <section className={styles.analyticsPanel}><header><small>{label}</small><strong>{value}</strong>{detail && <span>{detail}</span>}</header>{children}</section>;
}

export function AnalyticsGrid({ children }: { children: ReactNode }) {
  return <div className={styles.analyticsGrid}>{children}</div>;
}

export function LedgerScorePanel({ adherence, selectivity, completion }: { adherence: number; selectivity: number; completion: number }) {
  const score = Math.round((adherence + selectivity + completion) / 3);
  const hasData = adherence > 0 || selectivity > 0 || completion > 0;
  const cx = 40; const cy = 46; const r = 28; const sin60 = 0.866;
  const ov = [[cx, cy - r], [cx + r * sin60, cy + r * 0.5], [cx - r * sin60, cy + r * 0.5]];
  const sc = (v: number) => Math.max(0.04, v / 100);
  const dv = ov.map(([x, y], i) => { const vals = [adherence, selectivity, completion]; return [cx + (x - cx) * sc(vals[i]), cy + (y - cy) * sc(vals[i])]; });
  const pts = (arr: number[][]) => arr.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const metrics = [{ label: "Adherence", value: adherence }, { label: "Selectivity", value: selectivity }, { label: "Completion", value: completion }];
  return (
    <section className={styles.ledgerScore}>
      <div className={styles.ledgerScoreHead}>
        <small>EVIDENCE LEDGER SCORE</small>
        <div className={styles.scoreBadge}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true"><path d="M1.5 8.5A5 5 0 1 1 9.5 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M5.5 8L7 4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>
          <b>{hasData ? score : "—"}</b><span>/100</span>
        </div>
      </div>
      <div className={styles.ledgerBody}>
        <figure className={styles.triangleWrap} aria-hidden="true">
          <svg viewBox="0 0 80 86" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points={pts(ov)} className={styles.triangleOuter}/>
            <polygon points={pts(dv)} className={styles.triangleData}/>
            {ov.map(([x, y], i) => <line key={i} x1={cx} y1={cy} x2={x} y2={y} className={styles.triangleAxis}/>)}
            <text x={cx} y={cy - r - 5} textAnchor="middle" className={styles.triLabel}>Adh.</text>
            <text x={cx + r * sin60} y={cy + r * 0.5 + 11} textAnchor="middle" className={styles.triLabel}>Sel.</text>
            <text x={cx - r * sin60} y={cy + r * 0.5 + 11} textAnchor="middle" className={styles.triLabel}>Rev.</text>
          </svg>
        </figure>
        <div className={styles.ledgerMetrics}>
          {metrics.map(({ label, value }) => (
            <div key={label} className={styles.ledgerRow}>
              <span>{label}</span>
              <div className={styles.ledgerBarTrack}><div className={styles.ledgerBarFill} style={{ width: `${value}%` }}/></div>
              <b>{value}</b>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.ledgerFoot}><div className={styles.ledgerFootFill} style={{ width: `${hasData ? score : 0}%` }}/></div>
    </section>
  );
}

export function MiniChart({ values, tone = "success", label }: { values: number[]; tone?: "success" | "danger" | "info"; label: string }) {
  const safe = values.length ? values : [0, 0];
  const min = Math.min(...safe); const max = Math.max(...safe); const range = max - min || 1;
  const points = safe.map((value, index) => `${(index / Math.max(safe.length - 1, 1)) * 100},${42 - ((value - min) / range) * 34}`).join(" ");
  return <figure className={styles.chart} aria-label={label}><svg viewBox="0 0 100 46" preserveAspectRatio="none" role="img"><title>{label}</title><path d="M0 42H100" className={styles.gridLine}/><path d="M0 24H100" className={styles.gridLine}/><polyline points={points} className={styles[tone]} /></svg><figcaption>{values.length ? `${values.length} recorded trade${values.length === 1 ? "" : "s"}` : "No recorded trades"}</figcaption></figure>;
}

type CalendarTrade = { id: string; createdAt: Date; executedR: number | null; review?: { status: string; classification: string | null } | null; candidate: { disposition: string } };
export function JournalCalendar({ trades, month }: { trades: CalendarTrade[]; month: Date }) {
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const cells = Array.from({ length: Math.ceil((start.getDay() + end.getDate()) / 7) * 7 }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index - start.getDay() + 1));
  const keyFor = (date: Date) => date.toISOString().slice(0, 10);
  const byDay = new Map<string, CalendarTrade[]>();
  trades.forEach((trade) => { const key = keyFor(trade.createdAt); byDay.set(key, [...(byDay.get(key) ?? []), trade]); });
  const today = keyFor(new Date());
  const previous = new Date(month.getFullYear(), month.getMonth() - 1, 1); const next = new Date(month.getFullYear(), month.getMonth() + 1, 1); const monthValue = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  return <section className={styles.calendar} aria-labelledby="calendar-heading"><header className={styles.calendarHead}><div><small>JOURNALING</small><h2 id="calendar-heading">Evidence Ledger Journal Calendar</h2></div><div><Link className={styles.calendarButton} href={`/?month=${monthValue(previous)}`} aria-label="Previous month">‹</Link><strong>{month.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</strong><Link className={styles.calendarButton} href={`/?month=${monthValue(next)}`} aria-label="Next month">›</Link><Link className={styles.calendarAction} href={`/journal?month=${monthValue(month)}`}>Journal cards</Link></div></header><div className={styles.calendarScroll}><div className={styles.calendarGrid}>{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div className={styles.dayName} key={day}>{day}</div>)}{cells.map((date) => { const key = keyFor(date); const dayTrades = byDay.get(key) ?? []; const totalR = dayTrades.reduce((sum, trade) => sum + (trade.executedR ?? 0), 0); const reviewed = dayTrades.every((trade) => trade.review?.status === "COMPLETE"); const inMonth = date.getMonth() === month.getMonth(); return <Link href={`/journal?date=${key}`} key={key} className={`${styles.dayCell} ${!inMonth ? styles.outside : ""} ${key === today ? styles.today : ""}`} aria-label={`${date.toLocaleDateString("en-IN")}${dayTrades.length ? `: ${dayTrades.length} trades, ${totalR.toFixed(2)} R` : ": no trades"}`}><time>{date.getDate()}</time>{dayTrades.length > 0 && <div><b className={totalR >= 0 ? styles.positive : styles.negative}>{totalR >= 0 ? "+" : ""}{totalR.toFixed(2)}R</b><small>{dayTrades.length} trade{dayTrades.length === 1 ? "" : "s"} · {reviewed ? "reviewed" : "review due"}</small></div>}</Link>; })}</div></div><footer><span>R shown before currency · based on Executed R</span><Link href={`/journal?month=${monthValue(month)}`}>Open Journal</Link></footer></section>;
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: { href: string; label: string } }) {
  return <div className={styles.emptyState}><span aria-hidden="true">∅</span><div><h3>{title}</h3><p>{text}</p>{action && <Link href={action.href}>{action.label}</Link>}</div></div>;
}
