import { describe, expect, it } from "vitest";
import { gateOutcome } from "./domain";
import { ENTRY_TIMEFRAMES, INSTRUMENT_OPTIONS, JOURNAL_OPTION_LIBRARY, noEntryModel } from "./journal-options";
import { calculateNetPnl, formatDuration, tradeDurationSeconds } from "./pnl";

describe("journal field expansion", () => {
  it("uses 14 mandatory gates in new strategy versions and keeps 2R optional", () => {
    const gates = Array.from({ length: 14 }, (_, index) => `G${index + 1}`);
    expect(gateOutcome(gates.map((gateKey) => ({ gateKey, answer: true })), gates).result).toBe("PASSED");
  });
  it("does not allow optional confluences to affect gate validity", () => expect(gateOutcome([{ gateKey: "G01", answer: true }], ["G01"]).result).toBe("PASSED"));
  it("seeds every supplied symbol including currency futures", () => {
    const labels = INSTRUMENT_OPTIONS.map((option) => option.label);
    expect(labels).toEqual(expect.arrayContaining(["XAU/USD", "MGC", "6A", "6B", "6C", "6E", "6J", "6N", "6S"]));
  });
  it("keeps No-EM choices distinct", () => { expect(noEntryModel("No EM — I just jumped in")).toBe(true); expect(noEntryModel("EM1")).toBe(false); });
  it("provides all supplied multi-select categories", () => {
    for (const category of ["SUPPLY_DEMAND", "ENTRY_CONFLUENCE", "MACRO_BIAS", "SETUP_TYPE", "TARGET", "OPTIONAL_CONFLUENCE"]) expect(JOURNAL_OPTION_LIBRARY.some((option) => option.category === category)).toBe(true);
  });
  it("has the supplied timeframe library", () => expect(ENTRY_TIMEFRAMES).toEqual(expect.arrayContaining(["1m", "5m", "1H", "4H", "1D", "Custom"])));
  it("calculates futures PnL only with tick metadata", () => {
    expect(calculateNetPnl({ direction: "LONG", entryPrice: 100, exitPrice: 102, quantity: 2, metadata: { tradingFormat: "FUTURES", tickSize: 0.5, tickValue: 10 } })).toMatchObject({ available: true, grossPnl: 80 });
    expect(calculateNetPnl({ direction: "LONG", entryPrice: 100, exitPrice: 102, quantity: 2, metadata: { tradingFormat: "FUTURES" } })).toMatchObject({ available: false });
  });
  it("does not calculate PnL when instrument metadata is explicitly unsupported", () => {
    expect(calculateNetPnl({ direction: "LONG", entryPrice: 100, exitPrice: 102, quantity: 2, metadata: { tradingFormat: "FUTURES", calculationSupported: false, tickSize: 0.5, tickValue: 10 } })).toEqual({ available: false, missing: ["calculation-supported metadata"] });
  });
  it("calculates duration and rejects a negative duration", () => { expect(formatDuration(tradeDurationSeconds(new Date("2026-01-01T00:00:00Z"), new Date("2026-01-01T01:05:00Z")))).toBe("1h 5m"); expect(() => tradeDurationSeconds(new Date("2026-01-02"), new Date("2026-01-01"))).toThrow(); });
});
