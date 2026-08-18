import { notFound } from "next/navigation";
import { Shell } from "@/components/shell";
import { Gate15Checklist } from "@/components/gate15-checklist";
import { answerGate, closeTrade, completeDiagnostics, createTrade, saveGrade } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { plannedRewardRisk, tradePermission } from "@/lib/domain";
import { hasTargetDecision } from "@/lib/target-decision";
import { gradeText } from "@/lib/grade-copy";
import { guardPage } from "@/lib/supabase/page-guard";
import { EvidenceControls } from "@/components/evidence-controls";
import { TargetDecisionForm } from "@/components/target-decision-form";

export const dynamic = "force-dynamic";

export default async function SetupWorkflow({ params }: { params: Promise<{ id: string }> }) {
  await guardPage();
  const { id } = await params;
  const setup = await prisma.setupCandidate.findUnique({
    where: { id },
    include: {
      strategyVersion: {
        include: {
          gates: { where: { active: true }, orderBy: { displayOrder: "asc" } },
          gradeCategories: { where: { active: true }, orderBy: { displayOrder: "asc" } },
          emotionalQuestions: { where: { active: true }, orderBy: { displayOrder: "asc" } }
        }
      },
      gateAssessment: { include: { responses: true, emotionalAssessment: { include: { responses: true } } } },
      grade: true,
      trade: true,
      evidence: true,
      optionSelections: { orderBy: { displayOrder: "asc" } },
      targets: { orderBy: { displayOrder: "asc" } }
    }
  });
  if (!setup || !setup.gateAssessment) notFound();

  const assessment = setup.gateAssessment;
  const responseByKey = new Map(assessment.responses.map((response) => [response.gateKey, response]));
  const plannedR = plannedRewardRisk(setup.plannedEntry ?? undefined, setup.plannedStop ?? undefined, setup.plannedTarget ?? undefined);
  const gradePermission = setup.grade ? tradePermission(setup.grade.letter) : null;
  const targetDecided = hasTargetDecision(setup.targets);
  setup.strategyVersion.gradeCategories.forEach((category) => {
    category.scoreOne = gradeText(category.title, 1, category.scoreOne);
    category.scoreTwo = gradeText(category.title, 2, category.scoreTwo);
  });

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const dailyTrades = await prisma.trade.findMany({
    where: { account: setup.account, entryTimestamp: { gte: startOfDay } },
    select: { status: true, netResult: true },
    orderBy: { entryTimestamp: "desc" }
  });
  let consecutiveLosingTheses = 0;
  for (const trade of dailyTrades) {
    if (trade.status === "CLOSED" && (trade.netResult ?? 0) < 0) consecutiveLosingTheses += 1;
    else break;
  }
  const hardLimit = {
    reached: dailyTrades.length >= 2 || consecutiveLosingTheses >= 2,
    executedTradeTheses: dailyTrades.length,
    consecutiveLosingTheses
  };
  async function submitTrade(formData: FormData) { "use server"; const result = await createTrade(formData); if (result?.ok === false) return; }

  const tradeReview = setup.trade ? await prisma.tradeReview.findUnique({ where: { tradeId: setup.trade.id }, select: { status: true } }) : null;
  const phase = !setup.trade ? (assessment.result === "PASSED" ? "pre-trade: ready to enter" : "pre-trade: gates in progress") : setup.trade.status === "ACTIVE" ? "post-entry: trade open" : tradeReview?.status === "COMPLETE" ? "complete" : "post-trade: awaiting review";

  return <Shell>
    <div className="title-row">
      <div>
        <p className="eyebrow">Setup workflow · v{setup.strategyVersion.versionNumber}</p>
        <h1>{setup.instrument} {setup.direction} <span className={`badge ${assessment.result === "REJECTED" ? "danger" : assessment.result === "PASSED" ? "ok" : ""}`}>{assessment.result}</span></h1>
        <p className="muted">Phase: <strong>{phase}</strong> · Lifecycle: {setup.lifecycle} · Session: {setup.sessionLabel}</p>
      </div>
    </div>

    <div className="grid two">
      <section className="card">
        <h2>Pre-entry record</h2>
        <p><strong>Thesis:</strong> {setup.thesis || "Not recorded"}</p>
        <p><strong>Entry / stop / target:</strong> {setup.plannedEntry ?? "—"} / {setup.plannedStop ?? "—"} / {setup.plannedTarget ?? "—"}</p>
        <p><strong>Planned R:</strong> {plannedR?.toFixed(2) ?? "Unavailable — add entry, stop and target"}</p>
        <p><strong>Evidence:</strong> {setup.evidence.length} attachment records. Late uploads must be marked late.</p><EvidenceControls associationType="setup" associatedId={setup.id} initial={setup.evidence.map((item) => ({ id: item.id, filename: item.filename, mimeType: item.mimeType, byteSize: item.byteSize, label: item.label }))} />
      </section>
      <section className="card">
        <h2>Gate state</h2>
        <p>Result: <strong>{assessment.result}</strong></p>
        <p>Diagnostic completion: <strong>{assessment.diagnosticCompletion}</strong></p>
        <p>Lock state: <strong>{assessment.lockState}</strong></p>
        {assessment.firstFailedGateKey && <p className="danger">First failed gate: {assessment.firstFailedGateKey}. Further answers are diagnostic only.</p>}
        {assessment.result === "REJECTED" && assessment.diagnosticCompletion === "PARTIAL" && <form action={completeDiagnostics}><input type="hidden" name="candidateId" value={setup.id}/><button>Mark diagnostic review complete</button></form>}
      </section>
    </div>

    <section className="card">
      <h2>Mandatory gate · Fast / Review mode</h2>
      <p className="muted">Use Yes/No controls in rapid sequence, or read the configured owner criteria in Review mode. First No immediately and permanently rejects this assessment.</p>
      {setup.strategyVersion.gates.map((gate) => {
        if (gate.gateKey === "G15") return <Gate15Checklist key={gate.id} candidateId={setup.id} questions={setup.strategyVersion.emotionalQuestions} responses={assessment.emotionalAssessment?.responses ?? []} summary={assessment.emotionalAssessment} assessmentLocked={assessment.lockState === "LOCKED"} hardLimit={hardLimit} displayOrder={gate.displayOrder}/>;
        const response = responseByKey.get(gate.gateKey);
        return <div className="gate" key={gate.id}>
          <div>
            <strong>{gate.displayOrder}. {gate.title}{gate.gateKey === "G16" && <span className="muted" style={{ fontWeight: 400, fontSize: "10px", marginLeft: "6px" }}>(optional)</span>}</strong>
            {gate.explanation && <p className="muted">{gate.explanation}</p>}
            {(gate.evidence || gate.timeframe) && <small>{[gate.evidence && `Evidence: ${gate.evidence}`, gate.timeframe && `Timeframe: ${gate.timeframe}`].filter(Boolean).join(" · ")}</small>}
          </div>
          <div className="actions">
            {response ? <span className={`badge ${response.answer ? "ok" : "danger"}`}>{response.answer ? "Yes" : "No"}</span> : assessment.lockState === "DRAFT" ? <>
              <form action={answerGate}><input type="hidden" name="candidateId" value={setup.id}/><input type="hidden" name="gateKey" value={gate.gateKey}/><input type="hidden" name="answer" value="yes"/><button className="yes" aria-label={`Yes: ${gate.title}`}>Yes</button></form>
              <form action={answerGate}><input type="hidden" name="candidateId" value={setup.id}/><input type="hidden" name="gateKey" value={gate.gateKey}/><input type="hidden" name="answer" value="no"/><button className="no" aria-label={`No: ${gate.title}`}>No</button></form>
            </> : <span className="muted">Locked</span>}
          </div>
        </div>;
      })}
    </section>

    <section className="card">
      <h2>Optional confluences</h2>
      <p className="muted">Optional factors may strengthen the setup but cannot replace a failed mandatory rule.</p>
      {setup.optionSelections.filter((selection) => selection.category === "OPTIONAL_CONFLUENCE").length ? <div className="actions">{setup.optionSelections.filter((selection) => selection.category === "OPTIONAL_CONFLUENCE").map((selection) => <span className="badge ok" key={selection.id}>{selection.labelSnapshot}</span>)}</div> : <p className="muted">No optional execution confluences recorded.</p>}
      <p className="muted">Realistic 2R is optional. Planned R: {plannedR?.toFixed(2) ?? "Unavailable"}</p>
    </section>

    <section className="card">
      <h2>Target decision</h2>
      <p className="muted">Define at least one target reference, or explicitly record No target. This decision is required before recording a trade.</p>
      {setup.targets.length > 0 && <p className="notice">Current target decision: <strong>{setup.targets.map((target) => target.label).join(", ")}</strong></p>}
      <TargetDecisionForm candidateId={setup.id} currentLabel={setup.targets[0]?.label || ""} />
    </section>

    {assessment.result !== "PASSED" && <p className="notice">Setup grading is available only after all mandatory gates pass.</p>}
    {assessment.result === "PASSED" && <section className="card">
      <h2>Setup grading</h2>
      {setup.strategyVersion.gradeCategories.length === 0 && <p className="muted">No grade categories configured. Add them in Strategy Edit.</p>}
      <p>Every category must be 1 or 2. A zero is impossible after gate pass.</p>
      <form action={saveGrade}>
        <input type="hidden" name="candidateId" value={setup.id}/>
        <div className="grid two">
          {setup.strategyVersion.gradeCategories.map((category, index) => <div className="rule" key={category.id}>
            <strong>{category.title}</strong>
            <p className="muted">1: {category.scoreOne}<br/>2: {category.scoreTwo}</p>
            <div className="score"><label><input required type="radio" name={`score${index + 1}`} value="1" defaultChecked={setup.grade ? JSON.parse(setup.grade.scores)[index] === 1 : false}/> 1</label><label><input required type="radio" name={`score${index + 1}`} value="2" defaultChecked={setup.grade ? JSON.parse(setup.grade.scores)[index] === 2 : false}/> 2</label></div>
          </div>)}
        </div>
        <label className="field">Grade notes<textarea name="notes" defaultValue={setup.grade?.notes || ""}/></label>
        <button disabled={assessment.lockState === "LOCKED"}>Calculate and save grade</button>
      </form>
      {setup.grade && <p className="notice">Grade: <strong>{setup.grade.letter}</strong> · {setup.grade.total}/12 · Permission: <strong>{gradePermission}</strong>{setup.grade.lockedAt ? " · Locked at trade creation" : ""}</p>}
    </section>}

    <section className="card">
      <h2>Trade entry</h2>
      {setup.trade ? <>
        <p>Trade created: <strong>{setup.trade.status}</strong>. Grade and gates are locked.</p>
        {setup.trade.status === "ACTIVE" && <form action={closeTrade} style={{ marginTop: "1rem" }}>
          <input type="hidden" name="tradeId" value={setup.trade.id}/>
          <h3>Close trade</h3>
          <div className="grid three">
            <label className="field">Exit price<input name="exitPrice" type="number" step="any" defaultValue={setup.trade.targetPrice ?? ""}/></label>
            <label className="field">Exit timestamp<input name="exitTimestamp" type="datetime-local"/></label>
            <label className="field">Close status<select name="closeStatus"><option value="">Select</option><option value="stop_loss">Closed by SL</option><option value="take_profit">Closed by TP</option><option value="break_even">Closed by B.E.</option><option value="manual_exit">Manually exited</option></select></label>
          </div>
          <div className="grid three">
            <label className="field">PnL method<select name="pnlMethod"><option value="CALCULATED">Calculate from instrument metadata</option><option value="MANUAL">Enter manually</option></select></label>
            <label className="field">Currency<input name="pnlCurrency" placeholder="USD"/></label>
            <label className="field">Manual Net PnL<input name="manualNetPnl" type="number" step="any"/></label>
            <label className="field">Gross PnL<input name="grossPnl" type="number" step="any"/></label>
            <label className="field">Fees<input name="fees" type="number" step="any"/></label>
            <label className="field">Commission<input name="commission" type="number" step="any"/></label>
            <label className="field">Swap / funding<input name="swapFunding" type="number" step="any"/></label>
          </div>
          <button>Close trade</button>
        </form>}
        {setup.trade.status === "CLOSED" && <p className="notice" style={{ marginTop: "0.5rem" }}>Trade closed. Go to <a href="/review">Review</a> to complete the post-trade review.</p>}
      </> : <form action={submitTrade}>
        <input type="hidden" name="candidateId" value={setup.id}/>
        <div className="grid three">
          <label className="field">Entry price<input name="entryPrice" type="number" step="any" defaultValue={setup.plannedEntry ?? ""}/></label>
          <label className="field">Stop price<input name="stopPrice" type="number" step="any" defaultValue={setup.plannedStop ?? ""}/></label>
          <label className="field">Target price<input name="targetPrice" type="number" step="any" defaultValue={setup.plannedTarget ?? ""}/></label>
          <label className="field">Position size<input name="positionSize" type="number" step="any" defaultValue={setup.plannedPositionSize ?? ""}/></label>
          <label className="field">Risk %<input name="riskPercent" type="number" step="0.01" defaultValue={setup.plannedRisk ?? ""}/></label>
          <label className="field">Risk amount<input name="riskAmount" type="number" step="any"/></label>
        </div>
        <p className="muted">Entry timeframe: <strong>{setup.entryTimeframe === "Custom" ? setup.entryTimeframeCustom : setup.entryTimeframe}</strong> · Bias Evaluation: {setup.biasEvaluation ?? "—"}/10 · Entry Evaluation: {setup.entryEvaluation ?? "—"}/10</p>
        <div className="grid three"><label className="field">Trade status<select name="status"><option value="ACTIVE">Active</option><option value="CLOSED">Closed historical trade</option></select></label><label className="field">Entry timestamp<input name="entryTimestamp" type="datetime-local"/></label><label className="field">Exit timestamp<input name="exitTimestamp" type="datetime-local"/></label><label className="field">Exit price<input name="exitPrice" type="number" step="any"/></label><label className="field">Close Status<select name="closeStatus"><option value="">Only required when closed</option><option value="break_even">Closed by B.E.</option><option value="stop_loss">Closed by SL</option><option value="take_profit">Closed by TP</option><option value="manual_exit">Manually Exited</option></select></label><label className="field">Manual exit reason<textarea name="manualExitReason"/></label></div>
        <h3>Net PnL</h3><div className="grid three"><label className="field">Calculation mode<select name="pnlMethod"><option value="MANUAL">Enter manually</option><option value="CALCULATED">Calculate from instrument metadata</option></select></label><label className="field">Manual Net PnL<input name="manualNetPnl" type="number" step="any"/></label><label className="field">Currency<input name="pnlCurrency" placeholder="USD"/></label><label className="field">Gross PnL<input name="grossPnl" type="number" step="any"/></label><label className="field">Fees<input name="fees" type="number" step="any"/></label><label className="field">Commission<input name="commission" type="number" step="any"/></label><label className="field">Swap / funding<input name="swapFunding" type="number" step="any"/></label></div><label className="field">Manual PnL explanation / override reason<textarea name="pnlExplanation"/></label>
        <label className="field">Technical invalidation<textarea name="technicalInvalidation"/></label>
        {(assessment.result === "REJECTED" || gradePermission !== "PERMITTED") && <label className="field">Required restricted-record override reason<textarea required name="overrideReason" placeholder="Acknowledgement, reason and emotional/deliberate context"/></label>}
        {!targetDecided && <p className="notice" role="alert">Add a target or select No target before recording this trade.</p>}
        <button disabled={!targetDecided}>{assessment.result === "REJECTED" || gradePermission !== "PERMITTED" ? "Record restricted historical trade" : "Create trade and lock grade"}</button>
      </form>}
      <p className="muted">Risk amount/position-size calculation is unavailable until instrument metadata and the owner-selected account-risk basis are complete; values are never guessed.</p>
    </section>
  </Shell>;
}
