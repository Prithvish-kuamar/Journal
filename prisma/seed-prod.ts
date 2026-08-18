import { PrismaClient, StrategyStatus } from "@prisma/client";
import { defaultStrategyConfiguration, EMOTIONAL_READINESS_QUESTIONS, ENTRY_MODEL_SHELLS, GATE_TITLES, GRADE_CATEGORIES } from "../src/lib/strategy-defaults";
import { JOURNAL_OPTION_LIBRARY } from "../src/lib/journal-options";
import { gradeText } from "../src/lib/grade-copy";

const prisma = new PrismaClient();
const historicGateTitles = [...GATE_TITLES.slice(0, 11), "Is at least 2R realistically available?", ...GATE_TITLES.slice(11)];

async function createVersionContent(versionId: string, gates: readonly string[], historical = false) {
  await prisma.gateDefinition.createMany({ data: gates.map((title, index) => ({ strategyVersionId: versionId, gateKey: historical || index < 11 ? `G${String(index + 1).padStart(2, "0")}` : `G${String(index + 2).padStart(2, "0")}`, title, explanation: "Owner configuration required", yesCriteria: "Owner configuration required", noCriteria: "Owner configuration required", evidence: "Owner configuration required", displayOrder: index + 1 })) });
  await prisma.emotionalQuestion.createMany({ data: EMOTIONAL_READINESS_QUESTIONS.map((wording, index) => ({ strategyVersionId: versionId, questionId: `E${String(index + 1).padStart(2, "0")}`, wording, displayOrder: index + 1, hardBlock: index === 7 })) });
  await prisma.gradeCategory.createMany({ data: GRADE_CATEGORIES.map((title, index) => ({ strategyVersionId: versionId, categoryKey: `GRADE_${index + 1}`, title, scoreOne: gradeText(title, 1, "Owner configuration required"), scoreTwo: gradeText(title, 2, "Owner configuration required"), displayOrder: index + 1 })) });
  await prisma.entryModel.createMany({ data: ENTRY_MODEL_SHELLS.map((code) => ({ strategyVersionId: versionId, code, name: code, shortDescription: code.startsWith("No EM") ? "No valid entry model — explanation required." : "Owner configuration required", fields: JSON.stringify({ requiredMacroContext: "Owner configuration required", candleSequence: "Owner configuration required", confirmationRule: "Owner configuration required", entryTrigger: "Owner configuration required", stopRule: "Owner configuration required" }) })) });
  await prisma.journalOption.createMany({ data: JOURNAL_OPTION_LIBRARY.map((option, index) => ({ strategyVersionId: versionId, ...option, displayOrder: index + 1 })) });
}

async function main() {
  await prisma.auditEvent.deleteMany();
  await prisma.tradeReview.deleteMany();
  await prisma.tradeLeg.deleteMany();
  await prisma.trade.deleteMany();
  await prisma.setupGrade.deleteMany();
  await prisma.emotionalResponse.deleteMany();
  await prisma.emotionalAssessment.deleteMany();
  await prisma.gateResponse.deleteMany();
  await prisma.gateAssessment.deleteMany();
  await prisma.candidateOptionSelection.deleteMany();
  await prisma.candidateTarget.deleteMany();
  await prisma.setupCandidate.deleteMany();
  await prisma.instrumentPlan.deleteMany();
  await prisma.dailyPlan.deleteMany();
  await prisma.instrumentMetadata.deleteMany();
  await prisma.journalOption.deleteMany();
  await prisma.entryModel.deleteMany();
  await prisma.gradeCategory.deleteMany();
  await prisma.gateDefinition.deleteMany();
  await prisma.emotionalQuestion.deleteMany();
  await prisma.strategyRule.deleteMany();
  await prisma.strategyVersion.updateMany({ data: { parentVersionId: null } });
  await prisma.strategyVersion.deleteMany();
  await prisma.strategy.deleteMany();

  const strategy = await prisma.strategy.create({ data: { name: "LTA Evidence Ledger", description: "Live strategy — configure gate doctrine, entry models, and grade categories before trading." } });
  const historic = await prisma.strategyVersion.create({ data: { strategyId: strategy.id, versionNumber: 1, status: StrategyStatus.PUBLISHED, effectiveDate: new Date("2026-07-01"), publishedAt: new Date("2026-07-01"), configuration: JSON.stringify({ ...defaultStrategyConfiguration, minimumRewardRisk: 2 }), changeSummary: "Historical version: 2R was a mandatory gate" } });
  await createVersionContent(historic.id, historicGateTitles, true);
  const version = await prisma.strategyVersion.create({ data: { strategyId: strategy.id, versionNumber: 2, status: StrategyStatus.PUBLISHED, effectiveDate: new Date(), publishedAt: new Date(), parentVersionId: historic.id, configuration: JSON.stringify(defaultStrategyConfiguration), changeSummary: "2R moved from mandatory gate to optional execution confluence" } });
  await createVersionContent(version.id, GATE_TITLES);

  await prisma.strategyRule.createMany({ data: [
    { strategyVersionId: version.id, ruleId: "risk-basis", title: "Account risk basis", description: "Owner configuration required: current balance, current equity, or start-of-day equity.", category: "Risk", mandatory: true, inputType: "SINGLE_SELECT", allowedAnswers: JSON.stringify(["Current balance", "Current equity", "Start-of-day equity"]), displayOrder: 1 },
    { strategyVersionId: version.id, ruleId: "optional-2r", title: "Realistic 2R", description: "Optional execution confluence. It can improve risk and tradeability scoring but cannot reject a setup.", category: "Execution", mandatory: false, inputType: "YES_NO", displayOrder: 2 }
  ] });

  const FUTURES_SPECS: Record<string, { tickSize: number; tickValue: number }> = { GC: { tickSize: 0.10, tickValue: 10.00 }, MGC: { tickSize: 0.10, tickValue: 1.00 }, ES: { tickSize: 0.25, tickValue: 12.50 }, MES: { tickSize: 0.25, tickValue: 1.25 }, NQ: { tickSize: 0.25, tickValue: 5.00 }, MNQ: { tickSize: 0.25, tickValue: 0.50 } };
  const FUTURES_LABELS = new Set(["GC", "MGC", "ES", "MES", "NQ", "MNQ", "6B", "6E", "6A", "6C", "6J", "6N", "6S"]);
  await prisma.instrumentMetadata.createMany({ data: JOURNAL_OPTION_LIBRARY.filter((option) => option.category === "INSTRUMENT").map((option) => { const symbol = option.label.replaceAll("/", ""); const isFutures = FUTURES_LABELS.has(option.label); const spec = FUTURES_SPECS[option.label]; return { strategyVersionId: version.id, symbol, displayName: option.label, aliases: option.label === "XAU/USD" ? JSON.stringify(["XAUUSD"]) : null, assetClass: isFutures ? "FUTURES" : option.label === "BTC/USD" ? "CRYPTO" : option.label.startsWith("X") ? "METAL" : "FOREX", tradingFormat: isFutures ? "FUTURES" : "SPOT", quoteCurrency: option.label.includes("/") ? option.label.split("/")[1] : "USD", calculationSupported: spec ? true : false, tickSize: spec?.tickSize ?? null, tickValue: spec?.tickValue ?? null, metadataNotes: spec ? null : "Owner configuration required — values are never guessed." }; }) });

  console.log(`Seeded production strategy ${strategy.id}, v${version.versionNumber} (current), v${historic.versionNumber} (historic)`);
  console.log("No demo data — configure gate doctrine, entry models, and grade categories via /strategy/edit before trading.");
}
main().finally(() => prisma.$disconnect());
