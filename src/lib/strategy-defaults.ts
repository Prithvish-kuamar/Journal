export const EXECUTION_INSTRUMENTS = ["XAUUSD", "EURUSD", "GBPUSD", "USDJPY", "USDCHF", "USDCAD", "AUDUSD", "NZDUSD", "GC", "MGC", "ES", "MES", "NQ", "MNQ"] as const;
export const SESSION_LABELS = ["Asia", "London", "New York AM"] as const;
export { EMOTIONAL_READINESS_QUESTIONS } from "@/lib/emotional-readiness";

export const GATE_TITLES = [
  "Is the macro direction sufficiently clear?",
  "Is the setup at a meaningful macro location?",
  "Have you identified whether this is contrarian or momentum?",
  "Does the chosen archetype fit current market conditions?",
  "Has intraday structure become actionable?",
  "Has the market entered the execution phase?",
  "Has a valid profile level been reached?",
  "Has one complete entry model formed?",
  "Has the required confirmation candle closed?",
  "Is the entry still near the planned level?",
  "Is structural invalidation clear?",
  "Is position size calculated correctly?",
  "Is total exposure within the limit?",
  "Is the trader emotionally capable of following the plan?"
] as const;

export const GRADE_CATEGORIES = [
  "Macro fundamentals",
  "Higher-timeframe technical location",
  "Market archetype",
  "Intraday structure",
  "Entry-model quality",
  "Risk and tradeability"
] as const;

export const ENTRY_MODEL_SHELLS = ["EM1", "EM2", "EM3", "EM4", "No EM — I just jumped in", "No EM — Limit order"] as const;

export const defaultStrategyConfiguration = {
  permittedInstruments: [...EXECUTION_INSTRUMENTS],
  analysisOnlyInstruments: ["DXY", "GC futures", "Currency indices"],
  sessionLabels: [...SESSION_LABELS],
  standardRiskPercent: 2,
  reducedRiskPercent: 1,
  riskBasis: null,
  preferredRewardRisk: 2,
  maximumTradeThesesPerDay: 2,
  maximumTotalWorstCaseRiskPercent: 2,
  maximumCorrelatedExposure: null,
  consecutiveLossLimit: 2,
  permissions: { A_PLUS: "PERMITTED", A: "PERMITTED", B: "JOURNAL_ONLY", C: "PROHIBITED", REJECTED: "PROHIBITED" },
  screenshotPolicy: "Owner configuration required",
  notes: "Session labels are manual analytics classifications; no session time windows are enforced. Realistic 2R is an optional execution confluence, not a mandatory rejection gate. Account-risk basis must be selected before risk-amount calculations."
};

export const reducedRiskReasons = ["Contrarian/countertrend", "High volatility", "Holiday/thin liquidity", "Near funded-account drawdown limit", "Other (owner configuration required)"];
