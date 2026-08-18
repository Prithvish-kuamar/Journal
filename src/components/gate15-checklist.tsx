import { answerEmotionalQuestion } from "@/app/actions";
import { emotionalReadinessLabel } from "@/lib/emotional-readiness";

type Question = { id: string; questionId: string; wording: string; displayOrder: number; hardBlock: boolean };
type Response = { questionId: string; answer: boolean; note: string | null; answeredAt: Date };
type Summary = { result: "IN_PROGRESS" | "PASSED" | "REJECTED"; totalQuestions: number; answeredQuestions: number; passedQuestions: number; failedQuestions: number; firstFailedQuestionId: string | null; diagnosticCompletion: "PARTIAL" | "COMPLETE"; lockState: "DRAFT" | "LOCKED" } | null;

export function Gate15Checklist({ candidateId, questions, responses, summary, assessmentLocked, hardLimit, displayOrder }: { candidateId: string; questions: Question[]; responses: Response[]; summary: Summary; assessmentLocked: boolean; hardLimit: { reached: boolean; executedTradeTheses: number; consecutiveLosingTheses: number }; displayOrder: number }) {
  const responseByQuestion = new Map(responses.map((response) => [response.questionId, response]));
  const calculated = summary ?? { result: "IN_PROGRESS" as const, totalQuestions: questions.length, answeredQuestions: responses.length, passedQuestions: responses.filter((response) => response.answer).length, failedQuestions: responses.filter((response) => !response.answer).length, firstFailedQuestionId: null, diagnosticCompletion: "PARTIAL" as const, lockState: "DRAFT" as const };
  const firstFailed = questions.find((question) => question.questionId === calculated.firstFailedQuestionId);
  return <div className="gate" style={{ gridTemplateColumns: "1fr" }}>
    <div>
      <strong>{displayOrder}. Is the trader emotionally capable of following the plan?</strong>
      <p className="muted">Required emotional-readiness checklist. Yes means emotionally acceptable; No means emotional readiness failure.</p>
      <p><span className={`badge ${calculated.result === "PASSED" ? "ok" : calculated.result === "REJECTED" ? "danger" : "warn"}`}>{emotionalReadinessLabel(calculated)}</span></p>
      {firstFailed && <p className="danger">First failed emotional condition: {firstFailed.displayOrder}. {firstFailed.wording}</p>}
      {hardLimit.reached && <p className="notice">Question 8 is automatically No: {hardLimit.executedTradeTheses >= 2 ? "the two-trade daily limit is reached" : "the two-loss rule is triggered"}. This cannot be changed manually.</p>}
    </div>
    <div aria-label="Gate 15 emotional-readiness checklist">
      {questions.map((question) => {
        const response = responseByQuestion.get(question.questionId);
        const automaticFailure = question.questionId === "E08" && hardLimit.reached;
        return <div className="rule" key={question.id}>
          <strong>{question.wording}</strong>
          {response ? <p><span className={`badge ${response.answer ? "ok" : "danger"}`}>{response.answer ? "Yes — acceptable" : "No — readiness failure"}</span> <small>Recorded {response.answeredAt.toLocaleString()}</small>{response.note ? <><br/><small>Note: {response.note}</small></> : null}</p> : <form action={answerEmotionalQuestion} className="grid" style={{ marginTop: 8, gap: 8 }}>
            <input type="hidden" name="candidateId" value={candidateId}/>
            <input type="hidden" name="questionId" value={question.questionId}/>
            <div className="actions">
              <button className="yes" type="submit" name="answer" value="yes" disabled={assessmentLocked || automaticFailure} aria-label={`Yes, emotionally acceptable: ${question.wording}`}>Yes — acceptable</button>
              <button className="no" type="submit" name="answer" value="no" disabled={assessmentLocked} aria-label={`No, emotional readiness failure: ${question.wording}`}>No — readiness failure</button>
            </div>
            <details>
              <summary className="muted">Optional failure details</summary>
              <div className="grid two" style={{ marginTop: 8 }}>
                <label className="field">Current emotion or mental state<input name="currentEmotion"/></label>
                <label className="field">Trigger<input name="trigger"/></label>
                <label className="field">Previous trade result<input name="previousTradeResult"/></label>
                <label className="field">Corrective action<select name="correctiveAction" defaultValue=""><option value="">Not selected</option><option>Stop trading for the day</option><option>Take a timed break</option><option>Review the previous trade</option><option>Step away from charts</option><option>Reduce screen exposure</option><option>End the session</option><option>Other</option></select></label>
              </div>
              <label className="field" style={{ marginTop: 8 }}>Brief explanation<textarea name="explanation"/></label>
              <label className="field" style={{ marginTop: 8 }}>Optional note<textarea name="note"/></label>
            </details>
          </form>}
        </div>;
      })}
    </div>
  </div>;
}
