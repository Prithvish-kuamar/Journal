export type GateAnswer = { gateKey: string; answer: boolean };
export type GateState = { result: "IN_PROGRESS" | "PASSED" | "REJECTED"; diagnosticCompletion: "PARTIAL" | "COMPLETE"; firstFailedGateKey?: string };

export function gateOutcome(responses: GateAnswer[], activeGateKeys: string[], optionalGateKeys: string[] = []): GateState {
  const firstNo = responses.find((response) => !response.answer && !optionalGateKeys.includes(response.gateKey));
  const complete = activeGateKeys.every((key) => responses.some((response) => response.gateKey === key));
  return {
    result: firstNo ? "REJECTED" : complete ? "PASSED" : "IN_PROGRESS",
    diagnosticCompletion: complete ? "COMPLETE" : "PARTIAL",
    firstFailedGateKey: firstNo?.gateKey
  };
}

export function gradeForScores(scores: number[]): { total: number; letter: "C" | "B" | "A" | "A_PLUS" } {
  if (scores.length !== 6 || scores.some((score) => score !== 1 && score !== 2)) throw new Error("A passed setup requires exactly six scores of 1 or 2.");
  const total = scores.reduce((sum, score) => sum + score, 0);
  if (total === 6) return { total, letter: "C" };
  if (total <= 8) return { total, letter: "B" };
  if (total <= 10) return { total, letter: "A" };
  return { total, letter: "A_PLUS" };
}

export function tradePermission(letter: "C" | "B" | "A" | "A_PLUS" | "REJECTED") {
  return letter === "A" || letter === "A_PLUS" ? "PERMITTED" : letter === "B" ? "JOURNAL_ONLY" : "PROHIBITED";
}

export function canCreateAddOn(input: { planned: boolean; positionSecured: boolean; thesisInvalidated: boolean; combinedWorstCaseRiskPercent: number; requiresNewModel: boolean; hasEntryModel: boolean }) {
  if (!input.planned) return { allowed: false, reason: "Unplanned add-on is a process violation." };
  if (!input.positionSecured) return { allowed: false, reason: "Original position must be breakeven or otherwise secured." };
  if (input.thesisInvalidated) return { allowed: false, reason: "Cannot add after thesis invalidation." };
  if (input.combinedWorstCaseRiskPercent > 2) return { allowed: false, reason: "Combined maximum worst-case risk exceeds 2%." };
  if (input.requiresNewModel && !input.hasEntryModel) return { allowed: false, reason: "This strategy requires an entry model for each add-on." };
  return { allowed: true };
}

export function rMeasurements(input: { netResult?: number; executedRisk?: number; plannedCapitalRisk?: number; maximumRisk?: number }) {
  const divide = (denominator?: number) => input.netResult === undefined || !denominator || denominator <= 0 ? null : input.netResult / denominator;
  return { executedR: divide(input.executedRisk), plannedCapitalR: divide(input.plannedCapitalRisk), maximumRiskR: divide(input.maximumRisk) };
}

export function plannedRewardRisk(entry?: number, stop?: number, target?: number) {
  if (entry === undefined || stop === undefined || target === undefined || entry === stop) return null;
  return Math.abs(target - entry) / Math.abs(entry - stop);
}

export function canGrade(gateResult: GateState["result"]) { return gateResult === "PASSED"; }
export function canModifyGrade(lockedAt?: Date | null) { return !lockedAt; }
export function dailyThesisDecision(executedTheses: number, isAddOn: boolean) {
  if (isAddOn) return { allowed: true, countsTowardDailyLimit: false };
  return { allowed: executedTheses < 2, countsTowardDailyLimit: true, restrictedHistoricalOnly: executedTheses >= 2 };
}
export function isLateEvidence(capturedAt: Date | undefined, intendedEventAt: Date) { return !capturedAt || capturedAt.getTime() > intendedEventAt.getTime(); }
export function canDeleteStrategyVersion(historicalReferenceCount: number) { return historicalReferenceCount === 0; }
