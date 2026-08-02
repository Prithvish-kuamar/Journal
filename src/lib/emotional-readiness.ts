export const EMOTIONAL_READINESS_QUESTIONS = [
  "Am I calm, focused, and able to make decisions without urgency?",
  "Am I taking this trade because it meets the strategy—not to recover a previous loss?",
  "Am I free from FOMO and willing to let the setup go if the entry is missed?",
  "Am I avoiding boredom, overtrading, or forcing a setup?",
  "Can I genuinely accept the full planned loss without interfering with the trade?",
  "Am I willing to follow the planned entry, stop, target, and management rules exactly?",
  "Is my risk unchanged by recent wins, losses, frustration, or overconfidence?",
  "Have I stayed within the two-trade and two-loss limits?",
  "Am I free from a need to prove myself, hit a target quickly, or make money today?",
  "Am I sufficiently alert and undistracted to monitor and manage the trade properly?"
] as const;

export type EmotionalAnswer = { questionId: string; answer: boolean };

export function emotionalOutcome(responses: EmotionalAnswer[], activeQuestionIds: string[]) {
  const firstNo = responses.find((response) => !response.answer);
  const answered = activeQuestionIds.filter((questionId) => responses.some((response) => response.questionId === questionId));
  const passedQuestions = activeQuestionIds.filter((questionId) => responses.some((response) => response.questionId === questionId && response.answer)).length;
  const failedQuestions = activeQuestionIds.filter((questionId) => responses.some((response) => response.questionId === questionId && !response.answer)).length;
  const complete = answered.length === activeQuestionIds.length;
  return {
    result: firstNo ? "REJECTED" as const : complete ? "PASSED" as const : "IN_PROGRESS" as const,
    diagnosticCompletion: complete ? "COMPLETE" as const : "PARTIAL" as const,
    totalQuestions: activeQuestionIds.length,
    answeredQuestions: answered.length,
    passedQuestions,
    failedQuestions,
    firstFailedQuestionId: firstNo?.questionId ?? null
  };
}

export function emotionalReadinessLabel(summary: { result: "IN_PROGRESS" | "PASSED" | "REJECTED"; totalQuestions: number; answeredQuestions: number; passedQuestions: number }) {
  if (summary.result === "PASSED") return `Ready — ${summary.passedQuestions}/${summary.totalQuestions} passed`;
  if (summary.result === "REJECTED") return `Not ready — ${summary.passedQuestions}/${summary.totalQuestions} passed`;
  return `Incomplete — ${summary.answeredQuestions}/${summary.totalQuestions} answered`;
}

export function emotionalHardLimitFailure(input: { executedTradeTheses: number; consecutiveLosingTheses: number }) {
  return input.executedTradeTheses >= 2 || input.consecutiveLosingTheses >= 2;
}
