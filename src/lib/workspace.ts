import "server-only";
import { StrategyStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { defaultStrategyConfiguration, EMOTIONAL_READINESS_QUESTIONS, ENTRY_MODEL_SHELLS, GATE_TITLES, GRADE_CATEGORIES } from "@/lib/strategy-defaults";
import { JOURNAL_OPTION_LIBRARY } from "@/lib/journal-options";
import { gradeText } from "@/lib/grade-copy";

const FUTURES_SPECS: Record<string, { tickSize: number; tickValue: number }> = { GC: { tickSize: 0.10, tickValue: 10.00 }, MGC: { tickSize: 0.10, tickValue: 1.00 }, ES: { tickSize: 0.25, tickValue: 12.50 }, MES: { tickSize: 0.25, tickValue: 1.25 }, NQ: { tickSize: 0.25, tickValue: 5.00 }, MNQ: { tickSize: 0.25, tickValue: 0.50 } };
const FUTURES_LABELS = new Set(["GC", "MGC", "ES", "MES", "NQ", "MNQ", "6B", "6E", "6A", "6C", "6J", "6N", "6S"]);

/**
 * Give a newly signed-up account a usable strategy to work from. Without this
 * a new user lands on an app with no gates, entry models, or grade categories
 * and cannot qualify a single setup.
 *
 * Idempotent: returns immediately once the account owns any strategy. Called
 * on page load rather than at signup so it still runs when Supabase requires
 * email confirmation (no session exists at signup time in that flow).
 */
export async function ensureWorkspace(ownerId: string) {
  if (await prisma.strategy.count({ where: { ownerId } })) return;

  await prisma.$transaction(async (tx) => {
    // Re-check inside the transaction: two parallel first-load requests would
    // otherwise both pass the count above and seed two strategies.
    if (await tx.strategy.count({ where: { ownerId } })) return;

    const strategy = await tx.strategy.create({ data: { ownerId, name: "LTA Evidence Ledger", description: "Configure gate doctrine, entry models, and grade categories before trading." } });
    const version = await tx.strategyVersion.create({ data: { ownerId, strategyId: strategy.id, versionNumber: 1, status: StrategyStatus.PUBLISHED, effectiveDate: new Date(), publishedAt: new Date(), configuration: JSON.stringify(defaultStrategyConfiguration), changeSummary: "Initial version" } });
    const strategyVersionId = version.id;

    await tx.gateDefinition.createMany({ data: GATE_TITLES.map((title, index) => ({ strategyVersionId, gateKey: `G${String(index + 1).padStart(2, "0")}`, title, explanation: "Owner configuration required", yesCriteria: "Owner configuration required", noCriteria: "Owner configuration required", evidence: "Owner configuration required", displayOrder: index + 1 })) });
    await tx.emotionalQuestion.createMany({ data: EMOTIONAL_READINESS_QUESTIONS.map((wording, index) => ({ strategyVersionId, questionId: `E${String(index + 1).padStart(2, "0")}`, wording, displayOrder: index + 1, hardBlock: index === 7 })) });
    await tx.gradeCategory.createMany({ data: GRADE_CATEGORIES.map((title, index) => ({ strategyVersionId, categoryKey: `GRADE_${index + 1}`, title, scoreOne: gradeText(title, 1, "Owner configuration required"), scoreTwo: gradeText(title, 2, "Owner configuration required"), displayOrder: index + 1 })) });
    await tx.entryModel.createMany({ data: ENTRY_MODEL_SHELLS.map((code) => ({ strategyVersionId, code, name: code, shortDescription: code.startsWith("No EM") ? "No valid entry model — explanation required." : "Owner configuration required", fields: JSON.stringify({ requiredMacroContext: "Owner configuration required", candleSequence: "Owner configuration required", confirmationRule: "Owner configuration required", entryTrigger: "Owner configuration required", stopRule: "Owner configuration required" }) })) });
    await tx.journalOption.createMany({ data: JOURNAL_OPTION_LIBRARY.map((option, index) => ({ strategyVersionId, ...option, displayOrder: index + 1 })) });
    await tx.strategyRule.createMany({ data: [
      { strategyVersionId, ruleId: "risk-basis", title: "Account risk basis", description: "Owner configuration required: current balance, current equity, or start-of-day equity.", category: "Risk", mandatory: true, inputType: "SINGLE_SELECT", allowedAnswers: JSON.stringify(["Current balance", "Current equity", "Start-of-day equity"]), displayOrder: 1 },
      { strategyVersionId, ruleId: "optional-2r", title: "Realistic 2R", description: "Optional execution confluence. It can improve risk and tradeability scoring but cannot reject a setup.", category: "Execution", mandatory: false, inputType: "YES_NO", displayOrder: 2 }
    ] });
    await tx.instrumentMetadata.createMany({ data: JOURNAL_OPTION_LIBRARY.filter((option) => option.category === "INSTRUMENT").map((option) => {
      const isFutures = FUTURES_LABELS.has(option.label);
      const spec = FUTURES_SPECS[option.label];
      return { strategyVersionId, symbol: option.label.replaceAll("/", ""), displayName: option.label, aliases: option.label === "XAU/USD" ? JSON.stringify(["XAUUSD"]) : null, assetClass: isFutures ? "FUTURES" : option.label === "BTC/USD" ? "CRYPTO" : option.label.startsWith("X") ? "METAL" : "FOREX", tradingFormat: isFutures ? "FUTURES" : "SPOT", quoteCurrency: option.label.includes("/") ? option.label.split("/")[1] : "USD", calculationSupported: Boolean(spec), tickSize: spec?.tickSize ?? null, tickValue: spec?.tickValue ?? null, metadataNotes: spec ? null : "Owner configuration required — values are never guessed." };
    }) });
  });
}
