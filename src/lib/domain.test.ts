import { describe, expect, it } from "vitest";
import { canCreateAddOn, canDeleteStrategyVersion, canGrade, canModifyGrade, dailyThesisDecision, gateOutcome, gradeForScores, isLateEvidence, plannedRewardRisk, rMeasurements, tradePermission } from "./domain";

describe("Phase 1 business rules", () => {
  const gates = ["G01", "G02"];
  it("first mandatory No rejects and diagnostics cannot restore Passed", () => {
    expect(gateOutcome([{ gateKey: "G01", answer: false }, { gateKey: "G02", answer: true }], gates)).toEqual({ result: "REJECTED", diagnosticCompletion: "COMPLETE", firstFailedGateKey: "G01" });
  });
  it("requires all gates before passing", () => expect(gateOutcome([{ gateKey: "G01", answer: true }], gates).result).toBe("IN_PROGRESS"));
  it("does not allow a rejected setup to be graded", () => expect(canGrade("REJECTED")).toBe(false));
  it("calculates all grade bands and restricts B", () => {
    expect(gradeForScores([2, 2, 2, 2, 2, 2])).toEqual({ total: 12, letter: "A_PLUS" });
    expect(gradeForScores([1, 1, 1, 1, 1, 1])).toEqual({ total: 6, letter: "C" });
    expect(tradePermission("B")).toBe("JOURNAL_ONLY");
  });
  it("blocks a losing or over-risk add-on", () => {
    expect(canCreateAddOn({ planned: true, positionSecured: false, thesisInvalidated: false, combinedWorstCaseRiskPercent: 1.5, requiresNewModel: false, hasEntryModel: false }).allowed).toBe(false);
    expect(canCreateAddOn({ planned: true, positionSecured: true, thesisInvalidated: false, combinedWorstCaseRiskPercent: 2.1, requiresNewModel: false, hasEntryModel: false }).allowed).toBe(false);
  });
  it("locks grade when a trade has been created", () => expect(canModifyGrade(new Date())).toBe(false));
  it("counts only separate trade theses and flags the third", () => {
    expect(dailyThesisDecision(2, false)).toEqual({ allowed: false, countsTowardDailyLimit: true, restrictedHistoricalOnly: true });
    expect(dailyThesisDecision(2, true)).toEqual({ allowed: true, countsTowardDailyLimit: false });
  });
  it("marks screenshots late from capture time rather than upload optimism", () => expect(isLateEvidence(new Date("2026-08-02T10:01:00Z"), new Date("2026-08-02T10:00:00Z"))).toBe(true));
  it("keeps the three R measurements separate", () => expect(rMeasurements({ netResult: 200, executedRisk: 100, plannedCapitalRisk: 200, maximumRisk: 400 })).toEqual({ executedR: 2, plannedCapitalR: 1, maximumRiskR: 0.5 }));
  it("does not fabricate planned R", () => expect(plannedRewardRisk(100, 100, 120)).toBeNull());
  it("does not allow referenced historical versions to be deleted", () => { expect(canDeleteStrategyVersion(1)).toBe(false); expect(canDeleteStrategyVersion(0)).toBe(true); });
  it("canGrade admits only a passed gate assessment", () => {
    expect(canGrade("PASSED")).toBe(true);
    expect(canGrade("IN_PROGRESS")).toBe(false);
  });
  it("grade cannot be changed once locked — combined lifecycle check", () => {
    expect(canGrade("PASSED") && canModifyGrade(null)).toBe(true);
    expect(canGrade("PASSED") && canModifyGrade(new Date())).toBe(false);
    expect(canGrade("IN_PROGRESS") && canModifyGrade(null)).toBe(false);
  });
  it("add-on is always allowed regardless of thesis count", () => {
    expect(dailyThesisDecision(5, true)).toEqual({ allowed: true, countsTowardDailyLimit: false });
  });
});
