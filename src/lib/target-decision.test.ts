import { describe, expect, it } from "vitest";
import { hasTargetDecision, targetDecisionError, validateTargetDecision } from "./target-decision";

describe("target decision validation", () => {
  it("blocks trade recording when no target decision exists", () => { expect(hasTargetDecision([])).toBe(false); expect(targetDecisionError([])).toBe("Add a target or select No target before recording this trade."); });
  it("allows a defined target", () => { expect(hasTargetDecision([{ label: "PDH" }])).toBe(true); expect(targetDecisionError([{ label: "PDH" }])).toBeNull(); });
  it("allows an explicit No target decision", () => { expect(hasTargetDecision([{ label: "No target" }])).toBe(true); });
  it("validates defined labels and positive optional prices", () => { expect(validateTargetDecision("DEFINED", "", undefined)).toEqual({ targetLabel: "Enter a target label." }); expect(validateTargetDecision("DEFINED", "PDH", -1)).toEqual({ targetPrice: "Target price must be positive." }); expect(validateTargetDecision("DEFINED", "PDH", undefined)).toEqual({}); expect(validateTargetDecision("NO_TARGET", "", -1)).toEqual({}); });
});
