"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { GateResult, LockState, StrategyStatus } from "@prisma/client";
import { canCreateAddOn, gateOutcome, gradeForScores, plannedRewardRisk, rMeasurements, tradePermission } from "@/lib/domain";
import { emotionalHardLimitFailure, emotionalOutcome } from "@/lib/emotional-readiness";
import { noEntryModel, timeframeSeconds } from "@/lib/journal-options";
import { calculateNetPnl, tradeDurationSeconds } from "@/lib/pnl";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/supabase/server";
import { defaultStrategyConfiguration } from "@/lib/strategy-defaults";
import { targetDecisionError, validateTargetDecision } from "@/lib/target-decision";

async function assertOwner() {
  const owner = await requireOwner();
  if (owner.status !== "ok") throw new Error(owner.status === "unauthenticated" ? "Unauthorized" : "Forbidden");
}

export async function createStrategy(formData: FormData) {
  await assertOwner();
  const input = z.object({ name: z.string().trim().min(1).max(120), description: z.string().trim().max(500).optional() }).parse(Object.fromEntries(formData));
  const strategy = await prisma.strategy.create({ data: { name: input.name, description: input.description || null, versions: { create: { versionNumber: 1, status: StrategyStatus.DRAFT, configuration: JSON.stringify(defaultStrategyConfiguration), changeSummary: "Initial owner configuration" } } }, include: { versions: true } });
  const version = strategy.versions[0];
  await audit("Strategy", strategy.id, "STRATEGY_CREATED", undefined, undefined, { versionId: version.id });
  revalidatePath("/strategy");
  revalidatePath("/journal/new");
  redirect("/strategy/edit");
}

export async function addGateDefinition(formData: FormData) {
  await assertOwner();
  const input = z.object({ strategyVersionId: z.string(), gateKey: z.string().min(1).max(40), title: z.string().min(1), displayOrder: z.coerce.number().int().positive() }).parse(Object.fromEntries(formData));
  const version = await prisma.strategyVersion.findUniqueOrThrow({ where: { id: input.strategyVersionId } });
  if (version.status !== StrategyStatus.DRAFT) throw new Error("Create a draft change set before adding gates.");
  await prisma.gateDefinition.create({ data: { ...input, active: true } });
  await audit("GateDefinition", input.gateKey, "GATE_DEFINITION_ADDED");
  revalidatePath("/strategy/edit");
}

export async function addEntryModel(formData: FormData) {
  await assertOwner();
  const input = z.object({ strategyVersionId: z.string(), code: z.string().min(1).max(40), name: z.string().min(1), displayOrder: z.coerce.number().int().positive() }).parse(Object.fromEntries(formData));
  const version = await prisma.strategyVersion.findUniqueOrThrow({ where: { id: input.strategyVersionId } });
  if (version.status !== StrategyStatus.DRAFT) throw new Error("Create a draft change set before adding entry models.");
  await prisma.entryModel.create({ data: { ...input, fields: "{}", active: true } });
  await audit("EntryModel", input.code, "ENTRY_MODEL_ADDED");
  revalidatePath("/strategy/edit");
}

export async function addGradeCategory(formData: FormData) {
  await assertOwner();
  const input = z.object({ strategyVersionId: z.string(), categoryKey: z.string().min(1).max(40), title: z.string().min(1), scoreOne: z.string().min(1), scoreTwo: z.string().min(1), displayOrder: z.coerce.number().int().positive() }).parse(Object.fromEntries(formData));
  const version = await prisma.strategyVersion.findUniqueOrThrow({ where: { id: input.strategyVersionId } });
  if (version.status !== StrategyStatus.DRAFT) throw new Error("Create a draft change set before adding grade categories.");
  await prisma.gradeCategory.create({ data: { ...input, active: true } });
  await audit("GradeCategory", input.categoryKey, "GRADE_CATEGORY_ADDED");
  revalidatePath("/strategy/edit");
}

async function audit(entityType: string, entityId: string, action: string, reason?: string, previous?: object, next?: object) {
  await prisma.auditEvent.create({ data: { entityType, entityId, action, reason, previous: previous ? JSON.stringify(previous) : null, next: next ? JSON.stringify(next) : null } });
}
const number = (v: FormDataEntryValue | null) => v && String(v).trim() !== "" ? Number(v) : undefined;
const withoutVersionFields = <T extends { id: string; strategyVersionId?: string | null; createdAt?: Date }>(item: T) => {
  const { id: _id, strategyVersionId: _strategyVersionId, createdAt: _createdAt, ...rest } = item;
  void _id; void _strategyVersionId; void _createdAt;
  return rest;
};

export async function createDraftVersion(formData: FormData) {
  await assertOwner();
  const versionId = z.string().parse(formData.get("versionId"));
  const current = await prisma.strategyVersion.findUniqueOrThrow({ where: { id: versionId }, include: { rules: true, gates: true, gradeCategories: true, entryModels: true, emotionalQuestions: true, journalOptions: true, instrumentMetadata: true } });
  const draft = await prisma.strategyVersion.create({ data: { strategyId: current.strategyId, versionNumber: current.versionNumber + 1, parentVersionId: current.id, status: StrategyStatus.DRAFT, configuration: current.configuration, changeSummary: "Draft copied from published version", rules: { create: current.rules.map(withoutVersionFields) }, gates: { create: current.gates.map(withoutVersionFields) }, gradeCategories: { create: current.gradeCategories.map(withoutVersionFields) }, entryModels: { create: current.entryModels.map(withoutVersionFields) }, emotionalQuestions: { create: current.emotionalQuestions.map(withoutVersionFields) }, journalOptions: { create: current.journalOptions.map(withoutVersionFields) }, instrumentMetadata: { create: current.instrumentMetadata.map(withoutVersionFields) } } });
  await audit("StrategyVersion", draft.id, "STRATEGY_VERSION_DRAFT_CREATED", undefined, { source: current.id }, { version: draft.versionNumber });
  revalidatePath("/strategy");
}

export async function publishStrategyVersion(formData: FormData) {
  await assertOwner();
  const versionId = z.string().parse(formData.get("versionId"));
  const version = await prisma.strategyVersion.update({ where: { id: versionId }, data: { status: StrategyStatus.PUBLISHED, publishedAt: new Date(), effectiveDate: new Date(), changeSummary: String(formData.get("changeSummary") || "Published owner configuration") } });
  await audit("StrategyVersion", version.id, "STRATEGY_VERSION_PUBLISHED", version.changeSummary ?? undefined);
  revalidatePath("/strategy");
}

export async function updateStrategyConfiguration(formData: FormData) {
  await assertOwner();
  const versionId = z.string().parse(formData.get("versionId"));
  const configuration = z.string().min(2).parse(formData.get("configuration"));
  JSON.parse(configuration);
  const version = await prisma.strategyVersion.findUniqueOrThrow({ where: { id: versionId } });
  if (version.status !== StrategyStatus.DRAFT) throw new Error("Create a draft change set before editing a published version.");
  await prisma.strategyVersion.update({ where: { id: versionId }, data: { configuration, changeSummary: String(formData.get("changeSummary") || "Draft configuration update") } });
  await audit("StrategyVersion", versionId, "STRATEGY_CONFIGURATION_CHANGED");
  revalidatePath("/strategy");
}

export async function updateGateDefinition(formData: FormData) {
  await assertOwner();
  const gateId = z.string().parse(formData.get("gateId"));
  const gate = await prisma.gateDefinition.findUniqueOrThrow({ where: { id: gateId }, include: { strategyVersion: true } });
  if (gate.strategyVersion.status !== StrategyStatus.DRAFT) throw new Error("Create a draft change set before editing gate doctrine.");
  await prisma.gateDefinition.update({ where: { id: gateId }, data: { title: z.string().min(1).parse(formData.get("title")), explanation: String(formData.get("explanation") || ""), yesCriteria: String(formData.get("yesCriteria") || ""), noCriteria: String(formData.get("noCriteria") || ""), evidence: String(formData.get("evidence") || ""), timeframe: String(formData.get("timeframe") || ""), active: String(formData.get("active")) === "true" } });
  await audit("GateDefinition", gateId, "GATE_DEFINITION_CHANGED");
  revalidatePath("/strategy");
}

export async function updateEmotionalQuestion(formData: FormData) {
  await assertOwner();
  const questionId = z.string().parse(formData.get("questionId"));
  const question = await prisma.emotionalQuestion.findUniqueOrThrow({ where: { id: questionId }, include: { strategyVersion: { include: { emotionalQuestions: true } } } });
  if (question.strategyVersion.status !== StrategyStatus.DRAFT) throw new Error("Create a draft change set before editing emotional-readiness rules.");
  const active = String(formData.get("active")) === "true";
  if (!active && question.strategyVersion.emotionalQuestions.filter((item) => item.active).length <= 1) throw new Error("Gate 15 must retain at least one active mandatory emotional question.");
  if (question.questionId === "E08" && !active) throw new Error("The initial strategy version must retain the daily-limit and two-loss hard check.");
  await prisma.emotionalQuestion.update({ where: { id: questionId }, data: { wording: z.string().min(1).parse(formData.get("wording")), displayOrder: z.coerce.number().int().positive().parse(formData.get("displayOrder")), active, hardBlock: question.questionId === "E08" ? true : String(formData.get("hardBlock")) === "true" } });
  await audit("EmotionalQuestion", questionId, "EMOTIONAL_QUESTION_CHANGED");
  revalidatePath("/strategy/edit");
}

export async function addEmotionalQuestion(formData: FormData) {
  await assertOwner();
  const input = z.object({ strategyVersionId: z.string(), questionId: z.string().regex(/^E[A-Z0-9_-]+$/), wording: z.string().min(1), displayOrder: z.coerce.number().int().positive() }).parse(Object.fromEntries(formData));
  const version = await prisma.strategyVersion.findUniqueOrThrow({ where: { id: input.strategyVersionId } });
  if (version.status !== StrategyStatus.DRAFT) throw new Error("Create a draft change set before adding emotional-readiness rules.");
  const question = await prisma.emotionalQuestion.create({ data: { ...input, active: true, hardBlock: String(formData.get("hardBlock")) === "true" } });
  await audit("EmotionalQuestion", question.id, "EMOTIONAL_QUESTION_ADDED");
  revalidatePath("/strategy/edit");
}

export async function updateGradeCategory(formData: FormData) {
  await assertOwner();
  const categoryId = z.string().parse(formData.get("categoryId"));
  const category = await prisma.gradeCategory.findUniqueOrThrow({ where: { id: categoryId }, include: { strategyVersion: true } });
  if (category.strategyVersion.status !== StrategyStatus.DRAFT) throw new Error("Create a draft change set before editing grade definitions.");
  await prisma.gradeCategory.update({ where: { id: categoryId }, data: { scoreOne: z.string().min(1).parse(formData.get("scoreOne")), scoreTwo: z.string().min(1).parse(formData.get("scoreTwo")), evidence: String(formData.get("evidence") || ""), helpText: String(formData.get("helpText") || "") } });
  await audit("GradeCategory", categoryId, "GRADE_CATEGORY_CHANGED");
  revalidatePath("/strategy");
}

export async function updateEntryModel(formData: FormData) {
  await assertOwner();
  const modelId = z.string().parse(formData.get("modelId"));
  const model = await prisma.entryModel.findUniqueOrThrow({ where: { id: modelId }, include: { strategyVersion: true } });
  if (model.strategyVersion.status !== StrategyStatus.DRAFT) throw new Error("Create a draft change set before editing entry-model doctrine.");
  const fields = z.string().min(2).parse(formData.get("fields"));
  JSON.parse(fields);
  await prisma.entryModel.update({ where: { id: modelId }, data: { name: z.string().min(1).parse(formData.get("name")), shortDescription: String(formData.get("shortDescription") || ""), fields, active: String(formData.get("active")) === "true" } });
  await audit("EntryModel", modelId, "ENTRY_MODEL_CHANGED");
  revalidatePath("/strategy");
}

export async function saveDailyPlan(formData: FormData) {
  await assertOwner();
  const input = z.object({ strategyVersionId: z.string(), account: z.string().min(1), planDate: z.string(), sessionLabel: z.string(), riskMode: z.enum(["STANDARD", "REDUCED"]), objective: z.string().optional(), readinessNotes: z.string().optional() }).parse(Object.fromEntries(formData));
  const plan = await prisma.dailyPlan.create({ data: { strategyVersionId: input.strategyVersionId, account: input.account, planDate: new Date(input.planDate), sessionLabels: JSON.stringify([input.sessionLabel]), riskMode: input.riskMode, reducedRiskReason: input.riskMode === "REDUCED" ? String(formData.get("reducedRiskReason") || "") : null, objective: input.objective || null, readinessNotes: input.readinessNotes || null, maxTradeTheses: 2, status: "ACTIVE" } });
  await audit("DailyPlan", plan.id, "DAILY_PLAN_CREATED");
  revalidatePath("/plan");
}

export async function createCandidate(formData: FormData) {
  await assertOwner();
  const input = z.object({ strategyVersionId: z.string(), account: z.string().min(1), instrument: z.string().min(1), sessionLabel: z.string(), direction: z.string(), archetype: z.string().optional(), entryModel: z.string().optional(), thesis: z.string().optional(), entryTimeframe: z.string().min(1), biasEvaluation: z.coerce.number().int().min(0).max(10), entryEvaluation: z.coerce.number().int().min(0).max(10).optional() }).parse(Object.fromEntries(formData));
  const selectedVersion = await prisma.strategyVersion.findUnique({ where: { id: input.strategyVersionId }, select: { id: true, status: true } });
  if (!selectedVersion || selectedVersion.status !== StrategyStatus.PUBLISHED) throw new Error("An active published strategy version is required before creating a setup.");
  const customTimeframe = String(formData.get("entryTimeframeCustom") || "").trim();
  if (input.entryTimeframe === "Custom" && !customTimeframe) throw new Error("A custom entry timeframe needs a label.");
  const noModelExplanation = String(formData.get("noEntryModelExplanation") || "").trim();
  if (noEntryModel(input.entryModel) && !noModelExplanation) throw new Error("A No-EM entry requires an explanation.");
  const selectedOptionIds = formData.getAll("optionIds").map(String);
  const selectedOptions = await prisma.journalOption.findMany({ where: { id: { in: selectedOptionIds }, strategyVersionId: input.strategyVersionId, active: true, archivedAt: null } });
  const primaryTarget = String(formData.get("primaryTarget") || "");
  const targetIds = [...new Set([...formData.getAll("targetIds").map(String), ...(primaryTarget && primaryTarget !== "custom" ? [primaryTarget] : [])])];
  const selectedTargets = await prisma.journalOption.findMany({ where: { id: { in: targetIds }, strategyVersionId: input.strategyVersionId, category: "TARGET", active: true, archivedAt: null }, orderBy: { displayOrder: "asc" } });
  const customTargetLabel = String(formData.get("customTargetLabel") || "").trim();
  const customTargetPrice = number(formData.get("customTargetPrice"));
  if (customTargetPrice !== undefined && customTargetPrice <= 0) throw new Error("Custom target price must be positive.");
  if (primaryTarget === "custom" && !customTargetLabel) throw new Error("A custom primary target needs a label.");
  const candidate = await prisma.setupCandidate.create({ data: { strategyVersionId: input.strategyVersionId, account: input.account, instrument: input.instrument.replaceAll("/", ""), instrumentLabel: String(formData.get("instrumentLabel") || input.instrument), sessionLabel: input.sessionLabel, direction: input.direction, archetype: input.archetype || null, entryModel: input.entryModel || null, thesis: input.thesis || null, dailyPlanId: String(formData.get("dailyPlanId") || "") || null, entryTimeframe: input.entryTimeframe, entryTimeframeSeconds: timeframeSeconds[input.entryTimeframe] ?? null, entryTimeframeCustom: input.entryTimeframe === "Custom" ? customTimeframe : null, biasEvaluation: input.biasEvaluation, biasEvaluationNote: String(formData.get("biasEvaluationNote") || "") || null, entryEvaluation: input.entryEvaluation ?? null, entryEvaluationNote: String(formData.get("entryEvaluationNote") || "") || null, noEntryModelExplanation: noModelExplanation || null, plannedEntry: number(formData.get("plannedEntry")), plannedStop: number(formData.get("plannedStop")), plannedTarget: number(formData.get("plannedTarget")), plannedRisk: number(formData.get("plannedRisk")), plannedPositionSize: number(formData.get("plannedPositionSize")), optionSelections: { create: selectedOptions.map((option, index) => ({ optionId: option.id, category: option.category, valueSnapshot: option.value, labelSnapshot: option.label, colourSnapshot: option.colour, note: String(formData.get(`${option.id}-note`) || "") || null, evidence: String(formData.get(`${option.id}-evidence`) || "") || null, displayOrder: index })) }, targets: { create: [...selectedTargets.map((target, index) => ({ label: target.label, primary: primaryTarget === target.id, displayOrder: index })), ...(customTargetLabel ? [{ label: customTargetLabel, price: customTargetPrice ?? null, primary: primaryTarget === "custom", displayOrder: selectedTargets.length, note: String(formData.get("targetNotes") || "") || null }] : [])] }, gateAssessment: { create: {} } } });
  if (noEntryModel(input.entryModel)) await audit("SetupCandidate", candidate.id, "NO_ENTRY_MODEL_SELECTED", noModelExplanation, undefined, { entryModel: input.entryModel, mistakes: ["PROCESS", "EM"] });
  if (selectedTargets.some((target) => target.label === "No target") && (selectedTargets.length > 1 || customTargetLabel)) await audit("SetupCandidate", candidate.id, "TARGET_CONFLICT_WARNING", "No target was selected with another target reference.");
  await audit("SetupCandidate", candidate.id, "SETUP_CREATED");
  revalidatePath("/journal");
  return candidate.id;
}

export type TargetDecisionResult = { success: boolean; fieldErrors?: { targetLabel?: string; targetPrice?: string }; formError?: string };

export async function saveTargetDecision(_: TargetDecisionResult, formData: FormData): Promise<TargetDecisionResult> {
  await assertOwner();
  const candidateId = z.string().parse(formData.get("candidateId"));
  const decision = z.enum(["DEFINED", "NO_TARGET"]).parse(formData.get("targetDecision"));
  const label = String(formData.get("targetLabel") || "").trim();
  const price = number(formData.get("targetPrice"));
  const fieldErrors = validateTargetDecision(decision, label, price);
  if (fieldErrors.targetLabel || fieldErrors.targetPrice) return { success: false, fieldErrors };
  try {
    const existing = await prisma.candidateTarget.findMany({ where: { candidateId }, orderBy: { displayOrder: "asc" } });
    const targetLabel = decision === "NO_TARGET" ? "No target" : label;
    if (!existing.some((target) => target.label === targetLabel)) {
      await prisma.candidateTarget.create({ data: { candidateId, label: targetLabel, price: decision === "NO_TARGET" ? null : price, primary: existing.length === 0, displayOrder: existing.length } });
      await audit("SetupCandidate", candidateId, "TARGET_DECISION_SAVED", undefined, undefined, { decision, label: targetLabel });
    }
  } catch (error) {
    console.error("[target-decision] save failed", error instanceof Error ? error.message : "unknown error");
    return { success: false, formError: "Target decision could not be saved. Try again." };
  }
  revalidatePath(`/journal/${candidateId}`);
  redirect(`/journal/${candidateId}`);
}

export async function answerGate(formData: FormData) {
  await assertOwner();
  const candidateId = z.string().parse(formData.get("candidateId"));
  const gateKey = z.string().parse(formData.get("gateKey"));
  if (gateKey === "G15") throw new Error("Gate 15 is determined by the required emotional-readiness checklist.");
  const answer = String(formData.get("answer")) === "yes";
  const candidate = await prisma.setupCandidate.findUniqueOrThrow({ where: { id: candidateId }, include: { gateAssessment: { include: { responses: true } }, strategyVersion: { include: { gates: { where: { active: true }, orderBy: { displayOrder: "asc" } } } } } });
  const assessment = candidate.gateAssessment!;
  if (assessment.lockState === LockState.LOCKED) throw new Error("Gate assessment is locked.");
  if (assessment.responses.some((response) => response.gateKey === gateKey)) redirect(`/journal/${candidateId}`);
  await prisma.gateResponse.upsert({ where: { assessmentId_gateKey: { assessmentId: assessment.id, gateKey } }, create: { assessmentId: assessment.id, gateKey, answer }, update: { answer, answeredAt: new Date() } });
  const responses = await prisma.gateResponse.findMany({ where: { assessmentId: assessment.id }, orderBy: { answeredAt: "asc" } });
  const outcome = gateOutcome(responses.map((r) => ({ gateKey: r.gateKey, answer: r.answer })), candidate.strategyVersion.gates.map((g) => g.gateKey), ["G16"]);
  await prisma.gateAssessment.update({ where: { id: assessment.id }, data: { result: outcome.result as GateResult, diagnosticCompletion: outcome.diagnosticCompletion, firstFailedGateKey: outcome.firstFailedGateKey ?? null } });
  if (outcome.result === "REJECTED") await prisma.setupCandidate.update({ where: { id: candidateId }, data: { lifecycle: "REJECTED" } });
  if (outcome.result === "PASSED") await prisma.setupCandidate.update({ where: { id: candidateId }, data: { lifecycle: "QUALIFIED" } });
  await audit("GateAssessment", assessment.id, !answer ? "GATE_REJECTED" : "GATE_RESPONSE_CHANGED", undefined, undefined, { gateKey, answer, outcome });
  revalidatePath(`/journal/${candidateId}`);
  redirect(`/journal/${candidateId}`);
}

async function todayLimitStatus(account: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const trades = await prisma.trade.findMany({ where: { account, entryTimestamp: { gte: startOfDay } }, orderBy: { entryTimestamp: "desc" }, select: { status: true, netResult: true } });
  const executedTradeTheses = trades.length;
  let consecutiveLosingTheses = 0;
  for (const trade of trades) {
    if (trade.status === "CLOSED" && (trade.netResult ?? 0) < 0) consecutiveLosingTheses += 1;
    else break;
  }
  return { executedTradeTheses, consecutiveLosingTheses };
}

export async function answerEmotionalQuestion(formData: FormData) {
  await assertOwner();
  const candidateId = z.string().parse(formData.get("candidateId"));
  const questionId = z.string().parse(formData.get("questionId"));
  const submittedAnswer = String(formData.get("answer")) === "yes";
  const candidate = await prisma.setupCandidate.findUniqueOrThrow({
    where: { id: candidateId },
    include: {
      gateAssessment: { include: { responses: true, emotionalAssessment: { include: { responses: true } } } },
      strategyVersion: { include: { gates: { where: { active: true }, orderBy: { displayOrder: "asc" } }, emotionalQuestions: { where: { active: true }, orderBy: { displayOrder: "asc" } } } }
    }
  });
  const assessment = candidate.gateAssessment!;
  if (assessment.lockState === LockState.LOCKED) throw new Error("Gate assessment is locked.");
  const question = candidate.strategyVersion.emotionalQuestions.find((item) => item.questionId === questionId);
  if (!question) throw new Error("That emotional-readiness question is not active for this strategy version.");
  const limits = await todayLimitStatus(candidate.account);
  const hardFailure = question.questionId === "E08" && emotionalHardLimitFailure(limits);
  const answer = hardFailure ? false : submittedAnswer;
  const emotionalAssessment = assessment.emotionalAssessment ?? await prisma.emotionalAssessment.create({ data: { assessmentId: assessment.id, strategyVersionId: candidate.strategyVersionId, totalQuestions: candidate.strategyVersion.emotionalQuestions.length } });
  const existingResponse = await prisma.emotionalResponse.findUnique({ where: { emotionalAssessmentId_questionId: { emotionalAssessmentId: emotionalAssessment.id, questionId } } });
  if (existingResponse) redirect(`/journal/${candidateId}`);
  const optional = (key: string) => String(formData.get(key) || "").trim() || null;
  await prisma.emotionalResponse.create({ data: { emotionalAssessmentId: emotionalAssessment.id, questionId, questionTextSnapshot: question.wording, answer, note: optional("note"), currentEmotion: optional("currentEmotion"), trigger: optional("trigger"), previousTradeResult: optional("previousTradeResult"), explanation: optional("explanation"), correctiveAction: optional("correctiveAction") } });
  const responses = await prisma.emotionalResponse.findMany({ where: { emotionalAssessmentId: emotionalAssessment.id }, orderBy: { answeredAt: "asc" } });
  const summary = emotionalOutcome(responses.map((response) => ({ questionId: response.questionId, answer: response.answer })), candidate.strategyVersion.emotionalQuestions.map((item) => item.questionId));
  await prisma.emotionalAssessment.update({ where: { id: emotionalAssessment.id }, data: { ...summary, result: summary.result as GateResult } });
  if (summary.result === "REJECTED" || summary.result === "PASSED") {
    await prisma.gateResponse.upsert({ where: { assessmentId_gateKey: { assessmentId: assessment.id, gateKey: "G15" } }, create: { assessmentId: assessment.id, gateKey: "G15", answer: summary.result === "PASSED" }, update: { answer: summary.result === "PASSED", answeredAt: new Date() } });
  }
  const gateResponses = await prisma.gateResponse.findMany({ where: { assessmentId: assessment.id }, orderBy: { answeredAt: "asc" } });
  const outcome = gateOutcome(gateResponses.map((response) => ({ gateKey: response.gateKey, answer: response.answer })), candidate.strategyVersion.gates.map((gate) => gate.gateKey), ["G16"]);
  await prisma.gateAssessment.update({ where: { id: assessment.id }, data: { result: outcome.result as GateResult, diagnosticCompletion: outcome.diagnosticCompletion, firstFailedGateKey: outcome.firstFailedGateKey ?? null } });
  if (outcome.result === "REJECTED") await prisma.setupCandidate.update({ where: { id: candidateId }, data: { lifecycle: "REJECTED" } });
  if (outcome.result === "PASSED") await prisma.setupCandidate.update({ where: { id: candidateId }, data: { lifecycle: "QUALIFIED" } });
  await audit("EmotionalAssessment", emotionalAssessment.id, hardFailure ? "EMOTIONAL_HARD_LIMIT_FAILED" : !answer ? "EMOTIONAL_READINESS_FAILED" : "EMOTIONAL_READINESS_RESPONSE", hardFailure ? "Daily two-trade or two-loss limit reached." : undefined, undefined, { questionId, answer, summary, limits });
  if (summary.result === "REJECTED") await audit("GateAssessment", assessment.id, "GATE_REJECTED", "Gate 15 emotional-readiness failure", undefined, { firstFailedQuestionId: summary.firstFailedQuestionId });
  revalidatePath(`/journal/${candidateId}`);
  redirect(`/journal/${candidateId}`);
}

export async function completeDiagnostics(formData: FormData) {
  await assertOwner();
  const candidateId = z.string().parse(formData.get("candidateId"));
  const assessment = await prisma.gateAssessment.findFirstOrThrow({ where: { candidateId } });
  await prisma.gateAssessment.update({ where: { id: assessment.id }, data: { diagnosticCompletion: "COMPLETE" } });
  await audit("GateAssessment", assessment.id, "DIAGNOSTIC_REVIEW_COMPLETED");
  revalidatePath(`/journal/${candidateId}`);
  redirect(`/journal/${candidateId}`);
}

export async function saveGrade(formData: FormData) {
  await assertOwner();
  const candidateId = z.string().parse(formData.get("candidateId"));
  const candidate = await prisma.setupCandidate.findUniqueOrThrow({ where: { id: candidateId }, include: { gateAssessment: true } });
  if (candidate.gateAssessment?.result !== "PASSED") throw new Error("Only a passed assessment can be graded.");
  const scores = [1, 2, 3, 4, 5, 6].map((i) => Number(formData.get(`score${i}`)));
  const grade = gradeForScores(scores);
  await prisma.setupGrade.upsert({ where: { candidateId }, create: { candidateId, scores: JSON.stringify(scores), ...grade, notes: String(formData.get("notes") || "") }, update: { scores: JSON.stringify(scores), ...grade, notes: String(formData.get("notes") || "") } });
  await audit("SetupGrade", candidateId, "SETUP_GRADED", undefined, undefined, grade);
  revalidatePath(`/journal/${candidateId}`);
  redirect(`/journal/${candidateId}`);
}

export async function createTrade(formData: FormData) {
  await assertOwner();
  const candidateId = z.string().parse(formData.get("candidateId"));
  const candidate = await prisma.setupCandidate.findUniqueOrThrow({ where: { id: candidateId }, include: { grade: true, targets: true, gateAssessment: { include: { emotionalAssessment: true } } } });
  if (!candidate.entryTimeframe) throw new Error("Entry timeframe is required for an executed trade.");
  const targetError = targetDecisionError(candidate.targets);
  if (targetError) return { ok: false as const, error: targetError };
  const restricted = candidate.gateAssessment?.result === "REJECTED" || !candidate.grade || tradePermission(candidate.grade.letter) !== "PERMITTED";
  const overrideReason = String(formData.get("overrideReason") || "");
  if (restricted && !overrideReason) throw new Error("Restricted historical recording requires an override reason.");
  const entry = number(formData.get("entryPrice")) ?? candidate.plannedEntry;
  const stop = number(formData.get("stopPrice")) ?? candidate.plannedStop;
  const target = number(formData.get("targetPrice")) ?? candidate.plannedTarget;
  const status = String(formData.get("status") || "ACTIVE");
  const closeStatus = String(formData.get("closeStatus") || "");
  const exitTimestamp = String(formData.get("exitTimestamp") || "");
  if (status === "CLOSED" && !closeStatus) throw new Error("Close Status is required for a closed trade.");
  const exitAt = exitTimestamp ? new Date(exitTimestamp) : null;
  const entryAt = String(formData.get("entryTimestamp") || "") ? new Date(String(formData.get("entryTimestamp"))) : new Date();
  const durationSeconds = status === "CLOSED" && exitAt ? tradeDurationSeconds(entryAt, exitAt) : null;
  const pnlMethod = String(formData.get("pnlMethod") || "MANUAL");
  const manualNet = number(formData.get("manualNetPnl"));
  const pnlCurrency = String(formData.get("pnlCurrency") || "");
  if (manualNet !== undefined && !pnlCurrency) throw new Error("Net PnL requires a currency.");
  let pnl: ReturnType<typeof calculateNetPnl> | null = null;
  if (pnlMethod === "CALCULATED" && entry != null && number(formData.get("exitPrice")) !== undefined) {
    const metadata = await prisma.instrumentMetadata.findFirst({ where: { strategyVersionId: candidate.strategyVersionId, symbol: candidate.instrument, active: true } });
    if (!metadata) throw new Error("Net PnL calculation is unavailable: instrument metadata is missing.");
    pnl = calculateNetPnl({ direction: candidate.direction, entryPrice: entry, exitPrice: number(formData.get("exitPrice"))!, quantity: number(formData.get("positionSize")) ?? candidate.plannedPositionSize ?? 1, fees: number(formData.get("fees")), commission: number(formData.get("commission")), swapFunding: number(formData.get("swapFunding")), metadata });
    if (!pnl.available) pnl = null; // ponytail: fall through to manualNet; metadata fields are owner-configured
  }
  const netResult = pnl?.available ? pnl.netPnl : manualNet;
  const riskAmount = number(formData.get("riskAmount"));
  const r = rMeasurements({ netResult, executedRisk: riskAmount, plannedCapitalRisk: riskAmount, maximumRisk: riskAmount });
  const trade = await prisma.trade.create({ data: { candidateId, strategyVersionId: candidate.strategyVersionId, account: candidate.account, instrument: candidate.instrument, direction: candidate.direction, entryModel: candidate.entryModel, gradeLetter: candidate.grade?.letter, restrictionReason: restricted ? overrideReason : null, status: status === "CLOSED" ? "CLOSED" : "ACTIVE", entryPrice: entry, stopPrice: stop, targetPrice: target, positionSize: number(formData.get("positionSize")) ?? candidate.plannedPositionSize, riskPercent: number(formData.get("riskPercent")) ?? candidate.plannedRisk, riskAmount, plannedR: plannedRewardRisk(entry ?? undefined, stop ?? undefined, target ?? undefined), technicalInvalidation: String(formData.get("technicalInvalidation") || ""), entryTimestamp: entryAt, exitPrice: number(formData.get("exitPrice")), exitTimestamp: exitAt, closeStatus: closeStatus || null, manualExitReason: String(formData.get("manualExitReason") || "") || null, durationSeconds, durationSource: durationSeconds == null ? null : "CALCULATED", grossPnl: pnl?.available ? pnl.grossPnl : number(formData.get("grossPnl")), fees: pnl?.available ? pnl.fees : number(formData.get("fees")), commission: pnl?.available ? pnl.commission : number(formData.get("commission")), swapFunding: pnl?.available ? pnl.swapFunding : number(formData.get("swapFunding")), netResult, calculationCurrency: pnlCurrency || null, pnlMethod, pnlPrecision: pnl?.available ? "EXACT" : manualNet !== undefined ? "MANUAL" : null, pnlFormula: pnl?.available ? pnl.formula : null, executedRisk: riskAmount, plannedCapitalRisk: riskAmount, maximumRisk: riskAmount, ...r, legs: entry && stop ? { create: { entryPrice: entry, quantity: number(formData.get("positionSize")) ?? 1, stopPrice: stop, initialRisk: riskAmount ?? 0, planned: true, reason: "Initial entry" } } : undefined } });
  if (manualNet !== undefined) await audit("Trade", trade.id, "MANUAL_NET_PNL_ENTERED", String(formData.get("pnlExplanation") || ""));
  if (candidate.gateAssessment?.emotionalAssessment?.result === "REJECTED") await prisma.tradeReview.create({ data: { tradeId: trade.id, answers: JSON.stringify({ preEntryEmotionalReadiness: "Failed Gate 15" }), classification: "Rejected setup taken anyway", primaryMistake: "EMOTION" } });
  await prisma.setupCandidate.update({ where: { id: candidateId }, data: { disposition: "TRADED" } });
  if (candidate.grade) await prisma.setupGrade.update({ where: { candidateId }, data: { lockedAt: new Date() } });
  await prisma.gateAssessment.update({ where: { candidateId }, data: { lockState: "LOCKED" } });
  await prisma.emotionalAssessment.updateMany({ where: { assessmentId: candidate.gateAssessment?.id }, data: { lockState: "LOCKED" } });
  await audit("Trade", trade.id, restricted ? "RESTRICTED_TRADE_RECORDED" : "TRADE_CREATED", overrideReason || undefined);
  await audit("SetupGrade", candidateId, "SETUP_GRADE_LOCKED");
  revalidatePath(`/journal/${candidateId}`);
  revalidatePath("/journal");
}

export async function addTradeLeg(formData: FormData) {
  await assertOwner();
  const tradeId = z.string().parse(formData.get("tradeId"));
  const input = { planned: String(formData.get("planned")) === "true", positionSecured: String(formData.get("positionSecured")) === "true", thesisInvalidated: String(formData.get("thesisInvalidated")) === "true", combinedWorstCaseRiskPercent: Number(formData.get("combinedRisk")), requiresNewModel: false, hasEntryModel: Boolean(formData.get("entryModel")) };
  const decision = canCreateAddOn(input);
  if (!decision.allowed) throw new Error(decision.reason);
  const leg = await prisma.tradeLeg.create({ data: { tradeId, entryPrice: Number(formData.get("entryPrice")), quantity: Number(formData.get("quantity")), stopPrice: Number(formData.get("stopPrice")), initialRisk: Number(formData.get("initialRisk")), screenshot: String(formData.get("screenshot") || "") || null, reason: String(formData.get("reason") || ""), planned: input.planned, entryModel: String(formData.get("entryModel") || "") || null } });
  await audit("TradeLeg", leg.id, input.planned ? "ADD_ON_CREATED" : "ADD_ON_MARKED_UNPLANNED");
  revalidatePath(`/review?trade=${tradeId}`);
}

export async function saveCustomTargetPrice(formData: FormData) {
  await assertOwner();
  const versionId = z.string().parse(formData.get("versionId"));
  const price = formData.get("customTargetPrice");
  const version = await prisma.strategyVersion.findUniqueOrThrow({ where: { id: versionId } });
  const config = JSON.parse(version.configuration) as Record<string, unknown>;
  config.customTargetPrice = price ? Number(price) : null;
  await prisma.strategyVersion.update({ where: { id: versionId }, data: { configuration: JSON.stringify(config) } });
  revalidatePath("/settings");
  redirect("/settings");
}

export async function deleteStrategyVersion(formData: FormData) {
  await assertOwner();
  const versionId = z.string().parse(formData.get("versionId"));
  const version = await prisma.strategyVersion.findUniqueOrThrow({ where: { id: versionId }, select: { strategyId: true, _count: { select: { childVersions: true } } } });
  if (version._count.childVersions > 0) throw new Error("Cannot delete a version that has child versions.");
  await prisma.$transaction(async (tx) => {
    await tx.trade.deleteMany({ where: { strategyVersionId: versionId } });
    await tx.setupCandidate.deleteMany({ where: { strategyVersionId: versionId } });
    await tx.dailyPlan.deleteMany({ where: { strategyVersionId: versionId } });
    await tx.journalOption.deleteMany({ where: { strategyVersionId: versionId } });
    await tx.instrumentMetadata.deleteMany({ where: { strategyVersionId: versionId } });
    await tx.strategyVersion.delete({ where: { id: versionId } });
  });
  const remaining = await prisma.strategyVersion.count({ where: { strategyId: version.strategyId } });
  if (remaining === 0) await prisma.strategy.delete({ where: { id: version.strategyId } });
  revalidatePath("/strategy");
  redirect("/strategy");
}

export async function completeReview(formData: FormData) {
  await assertOwner();
  const tradeId = z.string().parse(formData.get("tradeId"));
  const answers = Object.fromEntries(["macro", "zone", "profile", "archetype", "structure", "entryModel", "confirmation", "chased", "invalidation", "twoR", "size", "exposure", "management", "emotionEntry", "emotionManagement"].map((key) => [key, String(formData.get(key) || "")]));
  const existing = await prisma.tradeReview.findUnique({ where: { tradeId } });
  const review = await prisma.tradeReview.upsert({ where: { tradeId }, create: { tradeId, status: "COMPLETE", takeAgain: String(formData.get("takeAgain")) === "yes", outcome: String(formData.get("outcome")), classification: String(formData.get("classification")), executionGrade: String(formData.get("executionGrade")), managementGrade: String(formData.get("managementGrade")), answers: JSON.stringify(answers), primaryMistake: String(formData.get("primaryMistake")), preventionRule: String(formData.get("preventionRule")), postTradeReview: String(formData.get("postTradeReview") || ""), lesson: String(formData.get("lesson")), completedAt: new Date(), lastSavedAt: new Date() }, update: { status: "COMPLETE", takeAgain: String(formData.get("takeAgain")) === "yes", outcome: String(formData.get("outcome")), classification: String(formData.get("classification")), executionGrade: String(formData.get("executionGrade")), managementGrade: String(formData.get("managementGrade")), answers: JSON.stringify(answers), primaryMistake: String(formData.get("primaryMistake")), preventionRule: String(formData.get("preventionRule")), postTradeReview: String(formData.get("postTradeReview") || ""), lesson: String(formData.get("lesson")), completedAt: new Date(), lastSavedAt: new Date() } });
  await audit("TradeReview", review.id, existing?.status === "COMPLETE" ? "REVIEW_EDITED_AFTER_COMPLETION" : "REVIEW_COMPLETED");
  revalidatePath("/review");
}
