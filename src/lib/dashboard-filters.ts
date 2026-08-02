export type DashboardTab = "journal" | "comparison" | "analysis";
export type JournalSource = "all" | "verified" | "demo";
export type DateRangeKey = "today" | "week" | "last-week" | "month" | "last-month" | "30d" | "90d" | "year" | "all" | "custom";
export type AnalysisGroup = "day" | "week" | "month" | "year";
export type DashboardFilters = { tab: DashboardTab; source: JournalSource; account?: string; strategy?: string; version?: string; instrument?: string; setupType?: string; entryModel?: string; grade?: string; validity?: string; direction?: string; session?: string; closeStatus?: string; mistake?: string; range: DateRangeKey; start?: string; end?: string; month: string; group: AnalysisGroup };

const safe = <T extends string>(value: string | undefined, allowed: readonly T[], fallback: T) => value && (allowed as readonly string[]).includes(value) ? value as T : fallback;
export function dashboardFilters(params: Record<string, string | string[] | undefined>, now = new Date()): DashboardFilters {
  const one = (key: string) => typeof params[key] === "string" ? params[key] : undefined;
  const month = /^\d{4}-\d{2}$/.test(one("month") ?? "") ? one("month")! : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const start = one("start"); const end = one("end");
  return { tab: safe(one("tab"), ["journal", "comparison", "analysis"] as const, "journal"), source: safe(one("source"), ["all", "verified", "demo"] as const, "all"), account: one("account") || undefined, strategy: one("strategy") || undefined, version: one("version") || undefined, instrument: one("instrument") || undefined, setupType: one("setupType") || undefined, entryModel: one("entryModel") || undefined, grade: one("grade") || undefined, validity: safe(one("validity"), ["all", "valid", "invalid"] as const, "all"), direction: safe(one("direction"), ["all", "LONG", "SHORT"] as const, "all"), session: one("session") || undefined, closeStatus: one("closeStatus") || undefined, mistake: one("mistake") || undefined, range: safe(one("range"), ["today", "week", "last-week", "month", "last-month", "30d", "90d", "year", "all", "custom"] as const, "week"), start: /^\d{4}-\d{2}-\d{2}$/.test(start ?? "") ? start : undefined, end: /^\d{4}-\d{2}-\d{2}$/.test(end ?? "") ? end : undefined, month, group: safe(one("group"), ["day", "week", "month", "year"] as const, "week") };
}

export function dateRange(filters: DashboardFilters, now = new Date()) {
  const day = new Date(now); day.setHours(0, 0, 0, 0);
  const endDay = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate() + 1);
  if (filters.range === "all") return { start: undefined, end: undefined, valid: true };
  if (filters.range === "custom") { const start = filters.start ? new Date(`${filters.start}T00:00:00`) : undefined; const end = filters.end ? endDay(new Date(`${filters.end}T00:00:00`)) : undefined; return { start, end, valid: Boolean(start && end && start <= end) }; }
  if (filters.range === "today") return { start: day, end: endDay(day), valid: true };
  if (filters.range === "week" || filters.range === "last-week") { const start = new Date(day); start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - (filters.range === "last-week" ? 7 : 0)); return { start, end: endDay(new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6)), valid: true }; }
  if (filters.range === "month" || filters.range === "last-month") { const offset = filters.range === "last-month" ? -1 : 0; const start = new Date(day.getFullYear(), day.getMonth() + offset, 1); return { start, end: new Date(day.getFullYear(), day.getMonth() + offset + 1, 1), valid: true }; }
  if (filters.range === "year") return { start: new Date(day.getFullYear(), 0, 1), end: new Date(day.getFullYear() + 1, 0, 1), valid: true };
  const days = filters.range === "30d" ? 30 : 90; const start = new Date(day); start.setDate(start.getDate() - days + 1); return { start, end: endDay(day), valid: true };
}

export const filteredQuery = (filters: DashboardFilters) => { const query = new URLSearchParams(); Object.entries({ tab: filters.tab, source: filters.source, account: filters.account, strategy: filters.strategy, version: filters.version, instrument: filters.instrument, setupType: filters.setupType, entryModel: filters.entryModel, grade: filters.grade, validity: filters.validity === "all" ? undefined : filters.validity, direction: filters.direction === "all" ? undefined : filters.direction, session: filters.session, closeStatus: filters.closeStatus, mistake: filters.mistake, range: filters.range, start: filters.start, end: filters.end, month: filters.month, group: filters.group }).forEach(([key, value]) => { if (value) query.set(key, value); }); return query.toString(); };
