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

export function MiniChart({ values, tone = "success", label }: { values: number[]; tone?: "success" | "danger" | "info"; label: string }) {
  const safe = values.length ? values : [0, 0];
  const min = Math.min(...safe); const max = Math.max(...safe); const range = max - min || 1;
  const points = safe.map((value, index) => `${(index / Math.max(safe.length - 1, 1)) * 100},${42 - ((value - min) / range) * 34}`).join(" ");
  return <figure className={styles.chart} aria-label={label}><svg viewBox="0 0 100 46" preserveAspectRatio="none" role="img"><title>{label}</title><path d="M0 42H100" className={styles.gridLine}/><path d="M0 24H100" className={styles.gridLine}/><polyline points={points} className={styles[tone]} /></svg><figcaption>{safe.length ? `${safe.length} recorded trade${safe.length === 1 ? "" : "s"}` : "No recorded trades"}</figcaption></figure>;
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
