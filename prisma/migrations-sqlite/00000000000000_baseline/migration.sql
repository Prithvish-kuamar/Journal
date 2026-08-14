-- CreateTable
CREATE TABLE "Strategy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StrategyVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "strategyId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "effectiveDate" DATETIME,
    "configuration" TEXT NOT NULL,
    "changeSummary" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" DATETIME,
    "parentVersionId" TEXT,
    CONSTRAINT "StrategyVersion_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "Strategy" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StrategyVersion_parentVersionId_fkey" FOREIGN KEY ("parentVersionId") REFERENCES "StrategyVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StrategyRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "strategyVersionId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "mandatory" BOOLEAN NOT NULL DEFAULT false,
    "inputType" TEXT NOT NULL DEFAULT 'TEXT',
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
    CONSTRAINT "StrategyRule_strategyVersionId_fkey" FOREIGN KEY ("strategyVersionId") REFERENCES "StrategyVersion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GateDefinition" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    CONSTRAINT "GateDefinition_strategyVersionId_fkey" FOREIGN KEY ("strategyVersionId") REFERENCES "StrategyVersion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GradeCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    CONSTRAINT "GradeCategory_strategyVersionId_fkey" FOREIGN KEY ("strategyVersionId") REFERENCES "StrategyVersion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EntryModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "strategyVersionId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT,
    "fields" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "EntryModel_strategyVersionId_fkey" FOREIGN KEY ("strategyVersionId") REFERENCES "StrategyVersion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "strategyVersionId" TEXT NOT NULL,
    "planDate" DATETIME NOT NULL,
    "account" TEXT NOT NULL,
    "sessionLabels" TEXT NOT NULL,
    "riskMode" TEXT NOT NULL,
    "reducedRiskReason" TEXT,
    "newsNotes" TEXT,
    "objective" TEXT,
    "maxRisk" REAL,
    "maxTradeTheses" INTEGER NOT NULL DEFAULT 2,
    "readinessNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DailyPlan_strategyVersionId_fkey" FOREIGN KEY ("strategyVersionId") REFERENCES "StrategyVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InstrumentPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    CONSTRAINT "InstrumentPlan_dailyPlanId_fkey" FOREIGN KEY ("dailyPlanId") REFERENCES "DailyPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SetupCandidate" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "plannedEntry" REAL,
    "plannedStop" REAL,
    "plannedTarget" REAL,
    "plannedRisk" REAL,
    "plannedPositionSize" REAL,
    "instrumentLabel" TEXT,
    "entryTimeframe" TEXT,
    "entryTimeframeSeconds" INTEGER,
    "entryTimeframeCustom" TEXT,
    "biasEvaluation" INTEGER,
    "biasEvaluationNote" TEXT,
    "entryEvaluation" INTEGER,
    "entryEvaluationNote" TEXT,
    "noEntryModelExplanation" TEXT,
    "lifecycle" TEXT NOT NULL DEFAULT 'PREPARING',
    "disposition" TEXT NOT NULL DEFAULT 'NONE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SetupCandidate_strategyVersionId_fkey" FOREIGN KEY ("strategyVersionId") REFERENCES "StrategyVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SetupCandidate_dailyPlanId_fkey" FOREIGN KEY ("dailyPlanId") REFERENCES "DailyPlan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GateAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidateId" TEXT NOT NULL,
    "result" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "diagnosticCompletion" TEXT NOT NULL DEFAULT 'PARTIAL',
    "lockState" TEXT NOT NULL DEFAULT 'DRAFT',
    "firstFailedGateKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GateAssessment_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "SetupCandidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GateResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assessmentId" TEXT NOT NULL,
    "gateKey" TEXT NOT NULL,
    "answer" BOOLEAN NOT NULL,
    "notes" TEXT,
    "answeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GateResponse_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "GateAssessment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmotionalQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "strategyVersionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "wording" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "hardBlock" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "EmotionalQuestion_strategyVersionId_fkey" FOREIGN KEY ("strategyVersionId") REFERENCES "StrategyVersion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmotionalAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assessmentId" TEXT NOT NULL,
    "strategyVersionId" TEXT NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "answeredQuestions" INTEGER NOT NULL DEFAULT 0,
    "passedQuestions" INTEGER NOT NULL DEFAULT 0,
    "failedQuestions" INTEGER NOT NULL DEFAULT 0,
    "firstFailedQuestionId" TEXT,
    "result" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "diagnosticCompletion" TEXT NOT NULL DEFAULT 'PARTIAL',
    "lockState" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmotionalAssessment_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "GateAssessment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EmotionalAssessment_strategyVersionId_fkey" FOREIGN KEY ("strategyVersionId") REFERENCES "StrategyVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmotionalResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "answeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmotionalResponse_emotionalAssessmentId_fkey" FOREIGN KEY ("emotionalAssessmentId") REFERENCES "EmotionalAssessment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SetupGrade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidateId" TEXT NOT NULL,
    "scores" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "letter" TEXT NOT NULL,
    "notes" TEXT,
    "lockedAt" DATETIME,
    "originalTotal" INTEGER,
    "correctedAt" DATETIME,
    "correctionReason" TEXT,
    CONSTRAINT "SetupGrade_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "SetupCandidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidateId" TEXT NOT NULL,
    "strategyVersionId" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "instrument" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "entryModel" TEXT,
    "gradeLetter" TEXT,
    "restrictionReason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "entryPrice" REAL,
    "stopPrice" REAL,
    "targetPrice" REAL,
    "positionSize" REAL,
    "riskPercent" REAL,
    "riskAmount" REAL,
    "plannedR" REAL,
    "technicalInvalidation" TEXT,
    "entryTimestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "netResult" REAL,
    "executedRisk" REAL,
    "plannedCapitalRisk" REAL,
    "maximumRisk" REAL,
    "executedR" REAL,
    "plannedCapitalR" REAL,
    "maximumRiskR" REAL,
    "exitPrice" REAL,
    "exitTimestamp" DATETIME,
    "closeStatus" TEXT,
    "manualExitReason" TEXT,
    "durationSeconds" INTEGER,
    "durationSource" TEXT,
    "grossPnl" REAL,
    "fees" REAL,
    "commission" REAL,
    "swapFunding" REAL,
    "calculationCurrency" TEXT,
    "pnlMethod" TEXT,
    "pnlPrecision" TEXT,
    "pnlFormula" TEXT,
    "pnlOverrideReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Trade_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "SetupCandidate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Trade_strategyVersionId_fkey" FOREIGN KEY ("strategyVersionId") REFERENCES "StrategyVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JournalOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "strategyVersionId" TEXT,
    "category" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "colour" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "archivedAt" DATETIME,
    "custom" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JournalOption_strategyVersionId_fkey" FOREIGN KEY ("strategyVersionId") REFERENCES "StrategyVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CandidateOptionSelection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidateId" TEXT NOT NULL,
    "optionId" TEXT,
    "category" TEXT NOT NULL,
    "valueSnapshot" TEXT NOT NULL,
    "labelSnapshot" TEXT NOT NULL,
    "colourSnapshot" TEXT,
    "note" TEXT,
    "evidence" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CandidateOptionSelection_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "SetupCandidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CandidateOptionSelection_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "JournalOption" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CandidateTarget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidateId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "price" REAL,
    "primary" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    CONSTRAINT "CandidateTarget_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "SetupCandidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InstrumentMetadata" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "strategyVersionId" TEXT,
    "symbol" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "aliases" TEXT,
    "assetClass" TEXT NOT NULL,
    "tradingFormat" TEXT NOT NULL,
    "quoteCurrency" TEXT,
    "accountCurrency" TEXT,
    "pipSize" REAL,
    "tickSize" REAL,
    "pipValue" REAL,
    "tickValue" REAL,
    "contractSize" REAL,
    "contractMultiplier" REAL,
    "quantityUnit" TEXT,
    "pricePrecision" INTEGER,
    "quantityPrecision" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "calculationSupported" BOOLEAN NOT NULL DEFAULT false,
    "metadataSource" TEXT,
    "metadataNotes" TEXT,
    CONSTRAINT "InstrumentMetadata_strategyVersionId_fkey" FOREIGN KEY ("strategyVersionId") REFERENCES "StrategyVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TradeLeg" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tradeId" TEXT NOT NULL,
    "entryPrice" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantity" REAL NOT NULL,
    "stopPrice" REAL NOT NULL,
    "initialRisk" REAL NOT NULL,
    "screenshot" TEXT,
    "reason" TEXT,
    "planned" BOOLEAN NOT NULL DEFAULT true,
    "entryModel" TEXT,
    CONSTRAINT "TradeLeg_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TradeReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tradeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
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
    "lastSavedAt" DATETIME,
    "completedAt" DATETIME,
    CONSTRAINT "TradeReview_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidateId" TEXT,
    "tradeId" TEXT,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "capturedAt" DATETIME,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "late" BOOLEAN NOT NULL DEFAULT false,
    "label" TEXT,
    CONSTRAINT "Evidence_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "SetupCandidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Evidence_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actor" TEXT NOT NULL DEFAULT 'owner',
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "previous" TEXT,
    "next" TEXT,
    "reason" TEXT,
    "metadata" TEXT
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

