-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "StrategyStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RuleInputType" AS ENUM ('YES_NO', 'SINGLE_SELECT', 'MULTI_SELECT', 'NUMBER', 'PERCENTAGE', 'CURRENCY', 'TEXT', 'LONG_TEXT', 'DATE_TIME', 'SCREENSHOT_REQUIRED', 'ATTACHMENT_REQUIRED', 'CONDITIONAL', 'INFORMATION');

-- CreateEnum
CREATE TYPE "CandidateLifecycle" AS ENUM ('PREPARING', 'QUALIFIED', 'REJECTED', 'EXPIRED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CandidateDisposition" AS ENUM ('NONE', 'TRADED', 'MISSED', 'CORRECT_NO_TRADE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "GateResult" AS ENUM ('IN_PROGRESS', 'PASSED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DiagnosticCompletion" AS ENUM ('PARTIAL', 'COMPLETE');

-- CreateEnum
CREATE TYPE "LockState" AS ENUM ('DRAFT', 'LOCKED');

-- CreateEnum
CREATE TYPE "GradeLetter" AS ENUM ('C', 'B', 'A', 'A_PLUS');

-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('ACTIVE', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETE');

-- CreateTable
CREATE TABLE "Strategy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Strategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategyVersion" (
    "id" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "status" "StrategyStatus" NOT NULL DEFAULT 'DRAFT',
    "effectiveDate" TIMESTAMP(3),
    "configuration" TEXT NOT NULL,
    "changeSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "parentVersionId" TEXT,

    CONSTRAINT "StrategyVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategyRule" (
    "id" TEXT NOT NULL,
    "strategyVersionId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "mandatory" BOOLEAN NOT NULL DEFAULT false,
    "inputType" "RuleInputType" NOT NULL DEFAULT 'TEXT',
    "allowedAnswers" TEXT,
    "defaultAnswer" TEXT,
    "failureBehaviour" TEXT,
    "evidenceRequired" BOOLEAN NOT NULL DEFAULT false,
    "helpText" TEXT,
    "validExample" TEXT,
    "invalidExample" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "ownerNotes" TEXT,

    CONSTRAINT "StrategyRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GateDefinition" (
    "id" TEXT NOT NULL,
    "strategyVersionId" TEXT NOT NULL,
    "gateKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "explanation" TEXT,
    "yesCriteria" TEXT,
    "noCriteria" TEXT,
    "evidence" TEXT,
    "timeframe" TEXT,
    "validExample" TEXT,
    "invalidExample" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GateDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GradeCategory" (
    "id" TEXT NOT NULL,
    "strategyVersionId" TEXT NOT NULL,
    "categoryKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "scoreOne" TEXT NOT NULL,
    "scoreTwo" TEXT NOT NULL,
    "evidence" TEXT,
    "helpText" TEXT,
    "examples" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GradeCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntryModel" (
    "id" TEXT NOT NULL,
    "strategyVersionId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT,
    "fields" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EntryModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyPlan" (
    "id" TEXT NOT NULL,
    "strategyVersionId" TEXT NOT NULL,
    "planDate" TIMESTAMP(3) NOT NULL,
    "account" TEXT NOT NULL,
    "sessionLabels" TEXT NOT NULL,
    "riskMode" TEXT NOT NULL,
    "reducedRiskReason" TEXT,
    "newsNotes" TEXT,
    "objective" TEXT,
    "maxRisk" DOUBLE PRECISION,
    "maxTradeTheses" INTEGER NOT NULL DEFAULT 2,
    "readinessNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstrumentPlan" (
    "id" TEXT NOT NULL,
    "dailyPlanId" TEXT NOT NULL,
    "instrument" TEXT NOT NULL,
    "bias" TEXT NOT NULL,
    "confidence" TEXT,
    "archetype" TEXT,
    "macroNarrative" TEXT,
    "profileLevels" TEXT,
    "permittedModels" TEXT NOT NULL,
    "scenarios" TEXT NOT NULL,
    "invalidation" TEXT,

    CONSTRAINT "InstrumentPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SetupCandidate" (
    "id" TEXT NOT NULL,
    "strategyVersionId" TEXT NOT NULL,
    "dailyPlanId" TEXT,
    "account" TEXT NOT NULL,
    "instrument" TEXT NOT NULL,
    "sessionLabel" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "archetype" TEXT,
    "entryModel" TEXT,
    "profileType" TEXT,
    "profileLevel" TEXT,
    "zoneTimeframe" TEXT,
    "thesis" TEXT,
    "expectedPath" TEXT,
    "plannedEntry" DOUBLE PRECISION,
    "plannedStop" DOUBLE PRECISION,
    "plannedTarget" DOUBLE PRECISION,
    "plannedRisk" DOUBLE PRECISION,
    "plannedPositionSize" DOUBLE PRECISION,
    "instrumentLabel" TEXT,
    "entryTimeframe" TEXT,
    "entryTimeframeSeconds" INTEGER,
    "entryTimeframeCustom" TEXT,
    "biasEvaluation" INTEGER,
    "biasEvaluationNote" TEXT,
    "entryEvaluation" INTEGER,
    "entryEvaluationNote" TEXT,
    "noEntryModelExplanation" TEXT,
    "lifecycle" "CandidateLifecycle" NOT NULL DEFAULT 'PREPARING',
    "disposition" "CandidateDisposition" NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SetupCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GateAssessment" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "result" "GateResult" NOT NULL DEFAULT 'IN_PROGRESS',
    "diagnosticCompletion" "DiagnosticCompletion" NOT NULL DEFAULT 'PARTIAL',
    "lockState" "LockState" NOT NULL DEFAULT 'DRAFT',
    "firstFailedGateKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GateAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GateResponse" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "gateKey" TEXT NOT NULL,
    "answer" BOOLEAN NOT NULL,
    "notes" TEXT,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GateResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmotionalQuestion" (
    "id" TEXT NOT NULL,
    "strategyVersionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "wording" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "hardBlock" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EmotionalQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmotionalAssessment" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "strategyVersionId" TEXT NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "answeredQuestions" INTEGER NOT NULL DEFAULT 0,
    "passedQuestions" INTEGER NOT NULL DEFAULT 0,
    "failedQuestions" INTEGER NOT NULL DEFAULT 0,
    "firstFailedQuestionId" TEXT,
    "result" "GateResult" NOT NULL DEFAULT 'IN_PROGRESS',
    "diagnosticCompletion" "DiagnosticCompletion" NOT NULL DEFAULT 'PARTIAL',
    "lockState" "LockState" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmotionalAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmotionalResponse" (
    "id" TEXT NOT NULL,
    "emotionalAssessmentId" TEXT NOT NULL,
    "gateResponseId" TEXT,
    "questionId" TEXT NOT NULL,
    "questionTextSnapshot" TEXT NOT NULL,
    "answer" BOOLEAN NOT NULL,
    "note" TEXT,
    "currentEmotion" TEXT,
    "trigger" TEXT,
    "previousTradeResult" TEXT,
    "explanation" TEXT,
    "correctiveAction" TEXT,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmotionalResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SetupGrade" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "scores" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "letter" "GradeLetter" NOT NULL,
    "notes" TEXT,
    "lockedAt" TIMESTAMP(3),
    "originalTotal" INTEGER,
    "correctedAt" TIMESTAMP(3),
    "correctionReason" TEXT,

    CONSTRAINT "SetupGrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "strategyVersionId" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "instrument" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "entryModel" TEXT,
    "gradeLetter" "GradeLetter",
    "restrictionReason" TEXT,
    "status" "TradeStatus" NOT NULL DEFAULT 'ACTIVE',
    "entryPrice" DOUBLE PRECISION,
    "stopPrice" DOUBLE PRECISION,
    "targetPrice" DOUBLE PRECISION,
    "positionSize" DOUBLE PRECISION,
    "riskPercent" DOUBLE PRECISION,
    "riskAmount" DOUBLE PRECISION,
    "plannedR" DOUBLE PRECISION,
    "technicalInvalidation" TEXT,
    "entryTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "netResult" DOUBLE PRECISION,
    "executedRisk" DOUBLE PRECISION,
    "plannedCapitalRisk" DOUBLE PRECISION,
    "maximumRisk" DOUBLE PRECISION,
    "executedR" DOUBLE PRECISION,
    "plannedCapitalR" DOUBLE PRECISION,
    "maximumRiskR" DOUBLE PRECISION,
    "exitPrice" DOUBLE PRECISION,
    "exitTimestamp" TIMESTAMP(3),
    "closeStatus" TEXT,
    "manualExitReason" TEXT,
    "durationSeconds" INTEGER,
    "durationSource" TEXT,
    "grossPnl" DOUBLE PRECISION,
    "fees" DOUBLE PRECISION,
    "commission" DOUBLE PRECISION,
    "swapFunding" DOUBLE PRECISION,
    "calculationCurrency" TEXT,
    "pnlMethod" TEXT,
    "pnlPrecision" TEXT,
    "pnlFormula" TEXT,
    "pnlOverrideReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalOption" (
    "id" TEXT NOT NULL,
    "strategyVersionId" TEXT,
    "category" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "colour" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "archivedAt" TIMESTAMP(3),
    "custom" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateOptionSelection" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "optionId" TEXT,
    "category" TEXT NOT NULL,
    "valueSnapshot" TEXT NOT NULL,
    "labelSnapshot" TEXT NOT NULL,
    "colourSnapshot" TEXT,
    "note" TEXT,
    "evidence" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CandidateOptionSelection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateTarget" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "primary" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,

    CONSTRAINT "CandidateTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstrumentMetadata" (
    "id" TEXT NOT NULL,
    "strategyVersionId" TEXT,
    "symbol" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "aliases" TEXT,
    "assetClass" TEXT NOT NULL,
    "tradingFormat" TEXT NOT NULL,
    "quoteCurrency" TEXT,
    "accountCurrency" TEXT,
    "pipSize" DOUBLE PRECISION,
    "tickSize" DOUBLE PRECISION,
    "pipValue" DOUBLE PRECISION,
    "tickValue" DOUBLE PRECISION,
    "contractSize" DOUBLE PRECISION,
    "contractMultiplier" DOUBLE PRECISION,
    "quantityUnit" TEXT,
    "pricePrecision" INTEGER,
    "quantityPrecision" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "calculationSupported" BOOLEAN NOT NULL DEFAULT false,
    "metadataSource" TEXT,
    "metadataNotes" TEXT,

    CONSTRAINT "InstrumentMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradeLeg" (
    "id" TEXT NOT NULL,
    "tradeId" TEXT NOT NULL,
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantity" DOUBLE PRECISION NOT NULL,
    "stopPrice" DOUBLE PRECISION NOT NULL,
    "initialRisk" DOUBLE PRECISION NOT NULL,
    "screenshot" TEXT,
    "reason" TEXT,
    "planned" BOOLEAN NOT NULL DEFAULT true,
    "entryModel" TEXT,

    CONSTRAINT "TradeLeg_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradeReview" (
    "id" TEXT NOT NULL,
    "tradeId" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "takeAgain" BOOLEAN,
    "outcome" TEXT,
    "classification" TEXT,
    "executionGrade" TEXT,
    "managementGrade" TEXT,
    "answers" TEXT NOT NULL,
    "primaryMistake" TEXT,
    "secondaryMistakes" TEXT,
    "preventionRule" TEXT,
    "lesson" TEXT,
    "postTradeReview" TEXT,
    "lastSavedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "TradeReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT,
    "tradeId" TEXT,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3),
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "late" BOOLEAN NOT NULL DEFAULT false,
    "label" TEXT,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "actor" TEXT NOT NULL DEFAULT 'owner',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "previous" TEXT,
    "next" TEXT,
    "reason" TEXT,
    "metadata" TEXT,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StrategyVersion_strategyId_versionNumber_key" ON "StrategyVersion"("strategyId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "StrategyRule_strategyVersionId_ruleId_key" ON "StrategyRule"("strategyVersionId", "ruleId");

-- CreateIndex
CREATE UNIQUE INDEX "GateDefinition_strategyVersionId_gateKey_key" ON "GateDefinition"("strategyVersionId", "gateKey");

-- CreateIndex
CREATE UNIQUE INDEX "GradeCategory_strategyVersionId_categoryKey_key" ON "GradeCategory"("strategyVersionId", "categoryKey");

-- CreateIndex
CREATE UNIQUE INDEX "EntryModel_strategyVersionId_code_key" ON "EntryModel"("strategyVersionId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "GateAssessment_candidateId_key" ON "GateAssessment"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "GateResponse_assessmentId_gateKey_key" ON "GateResponse"("assessmentId", "gateKey");

-- CreateIndex
CREATE UNIQUE INDEX "EmotionalQuestion_strategyVersionId_questionId_key" ON "EmotionalQuestion"("strategyVersionId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "EmotionalAssessment_assessmentId_key" ON "EmotionalAssessment"("assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "EmotionalResponse_emotionalAssessmentId_questionId_key" ON "EmotionalResponse"("emotionalAssessmentId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "SetupGrade_candidateId_key" ON "SetupGrade"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "Trade_candidateId_key" ON "Trade"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "JournalOption_strategyVersionId_category_value_key" ON "JournalOption"("strategyVersionId", "category", "value");

-- CreateIndex
CREATE UNIQUE INDEX "InstrumentMetadata_strategyVersionId_symbol_key" ON "InstrumentMetadata"("strategyVersionId", "symbol");

-- CreateIndex
CREATE UNIQUE INDEX "TradeReview_tradeId_key" ON "TradeReview"("tradeId");

-- AddForeignKey
ALTER TABLE "StrategyVersion" ADD CONSTRAINT "StrategyVersion_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "Strategy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategyVersion" ADD CONSTRAINT "StrategyVersion_parentVersionId_fkey" FOREIGN KEY ("parentVersionId") REFERENCES "StrategyVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategyRule" ADD CONSTRAINT "StrategyRule_strategyVersionId_fkey" FOREIGN KEY ("strategyVersionId") REFERENCES "StrategyVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GateDefinition" ADD CONSTRAINT "GateDefinition_strategyVersionId_fkey" FOREIGN KEY ("strategyVersionId") REFERENCES "StrategyVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeCategory" ADD CONSTRAINT "GradeCategory_strategyVersionId_fkey" FOREIGN KEY ("strategyVersionId") REFERENCES "StrategyVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntryModel" ADD CONSTRAINT "EntryModel_strategyVersionId_fkey" FOREIGN KEY ("strategyVersionId") REFERENCES "StrategyVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPlan" ADD CONSTRAINT "DailyPlan_strategyVersionId_fkey" FOREIGN KEY ("strategyVersionId") REFERENCES "StrategyVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentPlan" ADD CONSTRAINT "InstrumentPlan_dailyPlanId_fkey" FOREIGN KEY ("dailyPlanId") REFERENCES "DailyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetupCandidate" ADD CONSTRAINT "SetupCandidate_strategyVersionId_fkey" FOREIGN KEY ("strategyVersionId") REFERENCES "StrategyVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetupCandidate" ADD CONSTRAINT "SetupCandidate_dailyPlanId_fkey" FOREIGN KEY ("dailyPlanId") REFERENCES "DailyPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GateAssessment" ADD CONSTRAINT "GateAssessment_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "SetupCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GateResponse" ADD CONSTRAINT "GateResponse_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "GateAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmotionalQuestion" ADD CONSTRAINT "EmotionalQuestion_strategyVersionId_fkey" FOREIGN KEY ("strategyVersionId") REFERENCES "StrategyVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmotionalAssessment" ADD CONSTRAINT "EmotionalAssessment_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "GateAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmotionalAssessment" ADD CONSTRAINT "EmotionalAssessment_strategyVersionId_fkey" FOREIGN KEY ("strategyVersionId") REFERENCES "StrategyVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmotionalResponse" ADD CONSTRAINT "EmotionalResponse_emotionalAssessmentId_fkey" FOREIGN KEY ("emotionalAssessmentId") REFERENCES "EmotionalAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetupGrade" ADD CONSTRAINT "SetupGrade_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "SetupCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "SetupCandidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_strategyVersionId_fkey" FOREIGN KEY ("strategyVersionId") REFERENCES "StrategyVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalOption" ADD CONSTRAINT "JournalOption_strategyVersionId_fkey" FOREIGN KEY ("strategyVersionId") REFERENCES "StrategyVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateOptionSelection" ADD CONSTRAINT "CandidateOptionSelection_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "SetupCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateOptionSelection" ADD CONSTRAINT "CandidateOptionSelection_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "JournalOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateTarget" ADD CONSTRAINT "CandidateTarget_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "SetupCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentMetadata" ADD CONSTRAINT "InstrumentMetadata_strategyVersionId_fkey" FOREIGN KEY ("strategyVersionId") REFERENCES "StrategyVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeLeg" ADD CONSTRAINT "TradeLeg_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeReview" ADD CONSTRAINT "TradeReview_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "SetupCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

