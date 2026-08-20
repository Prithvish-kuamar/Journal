-- Multi-user support: scope every root table to the Supabase auth user id.
--
-- DESTRUCTIVE. The existing rows are the single-owner demo dataset and have no
-- owner to attribute, so they are removed rather than guessed at. This is also
-- the demo-data cleanup that was outstanding. New accounts are seeded a fresh
-- strategy by ensureWorkspace() on first page load.
--
-- If you need to KEEP the existing rows instead, do not run this as-is. Add the
-- columns as nullable, run
--     UPDATE "Strategy" SET "ownerId" = '<your-supabase-auth-uid>';   -- and so on
-- for each table, then apply the NOT NULL constraints below.

-- Children cascade from these, so deleting the roots clears the whole graph.
DELETE FROM "AuditEvent";
DELETE FROM "Evidence";
DELETE FROM "TradeReview";
DELETE FROM "TradeLeg";
DELETE FROM "Trade";
DELETE FROM "SetupGrade";
DELETE FROM "EmotionalResponse";
DELETE FROM "EmotionalAssessment";
DELETE FROM "GateResponse";
DELETE FROM "GateAssessment";
DELETE FROM "CandidateOptionSelection";
DELETE FROM "CandidateTarget";
DELETE FROM "SetupCandidate";
DELETE FROM "InstrumentPlan";
DELETE FROM "DailyPlan";
DELETE FROM "InstrumentMetadata";
DELETE FROM "JournalOption";
DELETE FROM "EntryModel";
DELETE FROM "GradeCategory";
DELETE FROM "GateDefinition";
DELETE FROM "EmotionalQuestion";
DELETE FROM "StrategyRule";
UPDATE "StrategyVersion" SET "parentVersionId" = NULL;
DELETE FROM "StrategyVersion";
DELETE FROM "Strategy";

ALTER TABLE "Strategy"        ADD COLUMN "ownerId" TEXT NOT NULL;
ALTER TABLE "StrategyVersion" ADD COLUMN "ownerId" TEXT NOT NULL;
ALTER TABLE "DailyPlan"       ADD COLUMN "ownerId" TEXT NOT NULL;
ALTER TABLE "SetupCandidate"  ADD COLUMN "ownerId" TEXT NOT NULL;
ALTER TABLE "Trade"           ADD COLUMN "ownerId" TEXT NOT NULL;
ALTER TABLE "AuditEvent"      ADD COLUMN "ownerId" TEXT NOT NULL;

CREATE INDEX "Strategy_ownerId_idx"        ON "Strategy"("ownerId");
CREATE INDEX "StrategyVersion_ownerId_idx" ON "StrategyVersion"("ownerId");
CREATE INDEX "DailyPlan_ownerId_idx"       ON "DailyPlan"("ownerId");
CREATE INDEX "SetupCandidate_ownerId_idx"  ON "SetupCandidate"("ownerId");
CREATE INDEX "Trade_ownerId_idx"           ON "Trade"("ownerId");
CREATE INDEX "AuditEvent_ownerId_idx"      ON "AuditEvent"("ownerId");
