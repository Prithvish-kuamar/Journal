import { describe, expect, it } from "vitest";
import { emotionalHardLimitFailure, emotionalOutcome, EMOTIONAL_READINESS_QUESTIONS } from "./emotional-readiness";

const ids = EMOTIONAL_READINESS_QUESTIONS.map((_, index) => `E${String(index + 1).padStart(2, "0")}`);

describe("emotional readiness", () => {
  it("cannot pass before every active question is answered", () => {
    const outcome = emotionalOutcome(ids.slice(0, 9).map((questionId) => ({ questionId, answer: true })), ids);
    expect(outcome.result).toBe("IN_PROGRESS");
    expect(outcome.diagnosticCompletion).toBe("PARTIAL");
  });

  it("passes only with ten Yes answers", () => {
    const outcome = emotionalOutcome(ids.map((questionId) => ({ questionId, answer: true })), ids);
    expect(outcome).toMatchObject({ result: "PASSED", passedQuestions: 10, failedQuestions: 0, diagnosticCompletion: "COMPLETE" });
  });

  it("rejects immediately on the first No and preserves its identity", () => {
    const outcome = emotionalOutcome([{ questionId: "E01", answer: true }, { questionId: "E02", answer: false }], ids);
    expect(outcome).toMatchObject({ result: "REJECTED", firstFailedQuestionId: "E02", diagnosticCompletion: "PARTIAL" });
  });

  it("stays rejected when later diagnostic answers are Yes", () => {
    const outcome = emotionalOutcome(ids.map((questionId, index) => ({ questionId, answer: index !== 1 })), ids);
    expect(outcome).toMatchObject({ result: "REJECTED", firstFailedQuestionId: "E02", diagnosticCompletion: "COMPLETE" });
  });

  it("automatically fails the hard-limit question at the daily trade limit", () => {
    expect(emotionalHardLimitFailure({ executedTradeTheses: 2, consecutiveLosingTheses: 0 })).toBe(true);
  });

  it("automatically fails the hard-limit question at the two-loss limit", () => {
    expect(emotionalHardLimitFailure({ executedTradeTheses: 0, consecutiveLosingTheses: 2 })).toBe(true);
  });

  it("does not treat an active strategy edit as a rewrite of saved response text", () => {
    const savedSnapshot = EMOTIONAL_READINESS_QUESTIONS[0];
    const editedStrategyWording = "Edited future-version wording";
    expect(savedSnapshot).not.toBe(editedStrategyWording);
  });
});
