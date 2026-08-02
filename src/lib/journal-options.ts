export type OptionSeed = { category: string; value: string; label: string; colour: string };

const options = (category: string, values: readonly string[], colour: string): OptionSeed[] => values.map((label) => ({ category, value: label.toUpperCase().replaceAll(/[^A-Z0-9]+/g, "_"), label, colour }));

export const INSTRUMENT_OPTIONS: OptionSeed[] = [
  ...options("INSTRUMENT", ["XAU/USD", "XAG/USD", "EUR/USD", "EUR/CAD", "EUR/NZD", "EUR/JPY"], "#3f8068"),
  ...options("INSTRUMENT", ["GBP/USD", "GBP/JPY", "GBP/AUD", "GBP/NZD"], "#77558c"),
  ...options("INSTRUMENT", ["USD/JPY", "USD/CHF", "USD/CAD"], "#aa5d57"),
  ...options("INSTRUMENT", ["NZD/USD", "NZD/CHF", "NZD/CAD", "NZD/JPY"], "#9b754f"),
  ...options("INSTRUMENT", ["BTC/USD", "MGC", "6B", "6E", "6A", "6C", "6J", "6N", "6S"], "#567ba4")
];

export const ENTRY_TIMEFRAMES = ["1m", "2m", "3m", "5m", "15m", "30m", "1H", "2H", "4H", "8H", "12H", "1D", "Custom"] as const;
export const timeframeSeconds: Record<string, number> = { "1m": 60, "2m": 120, "3m": 180, "5m": 300, "15m": 900, "30m": 1800, "1H": 3600, "2H": 7200, "4H": 14400, "8H": 28800, "12H": 43200, "1D": 86400 };

export const JOURNAL_OPTION_LIBRARY: OptionSeed[] = [
  ...INSTRUMENT_OPTIONS,
  ...options("ENTRY_MODEL", ["EM1", "EM2", "EM3", "EM4"], "#3f8068"),
  ...options("ENTRY_MODEL", ["No EM — I just jumped in", "No EM — Limit order"], "#aa5d57"),
  ...options("SUPPLY_DEMAND", ["12H Demand Created", "12H Demand Retested", "12H Supply Created", "12H Supply Retested", "8H Demand Created", "8H Demand Retested", "8H Supply Created", "8H Supply Retested", "Bullish — Demand/Buyers in control", "Bearish — Supply/Sellers in control", "Daily Demand Created", "Daily Demand Retested", "Daily Supply Created", "Daily Supply Retested", "Monthly Supply Retested", "Monthly Supply Created", "Monthly Demand Retested", "Monthly Demand Created", "Weekly Demand", "Neutral / Ranging"], "#5c7e9f"),
  ...options("ENTRY_CONFLUENCE", ["SVI DIV LTF", "SVI DIV HTF", "Undervalued in an uptrend — 4H", "Overvalued in an uptrend — 4H", "Undervalued in an uptrend — 1H", "Overvalued in an uptrend — 1H", "Overvalued in a downtrend — 4H", "Negative correlation with Dollar", "Dollar pushing Down", "Dollar pushing Up", "- CC with Dollar"], "#80604e"),
  ...options("MACRO_BIAS", ["Bullish", "Bearish", "Large Speculators Bullish Extreme", "Large Speculators Bearish Extreme", "Commercials Bullish Extreme", "Commercials Bearish Extreme", "Retail Bearish Extreme", "Retail Bullish Extreme", "SVI Daily Overvaluation", "SVI Daily Undervaluation", "Open Interest Rising", "Open Interest Decreasing", "SVI Daily Reaching Overvaluation"], "#527ba4"),
  ...options("SETUP_TYPE", ["External", "Internal", "Intra-day Trend", "CME", "CERC", "Retest", "Macro Continuation", "Macro Countertrend", "Macro Reversal", "Micro Trendfollowing", "Micro Countertrend", "Micro Reversal — at 8H–12H Supply/Demand"], "#826051"),
  ...options("OPTIONAL_CONFLUENCE", ["Intra-day trend", "Check SVI on D / 4H / 1H", "Realistic 2R available"], "#3f8068"),
  ...options("TARGET", ["No target — just 2:1 RR", "PDH", "PDL", "3R", "4R", "Daily Demand", "Daily Supply", "12H Demand", "12H Supply", "8H Demand", "8H Supply", "No target", "Asian Low", "DOL", "Equal Lows"], "#806f50")
];

export const noEntryModel = (value?: string | null) => value === "No EM — I just jumped in" || value === "No EM — Limit order";
