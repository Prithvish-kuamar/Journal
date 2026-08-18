-- Enable Row-Level Security on all public tables.
-- Prisma connects as the postgres/service_role user which bypasses RLS,
-- so this does not affect application behaviour — it only closes off the
-- Supabase Data API (REST/GraphQL/anon) path.

ALTER TABLE "Strategy"                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StrategyVersion"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StrategyRule"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GateDefinition"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GradeCategory"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EntryModel"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EmotionalQuestion"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JournalOption"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InstrumentMetadata"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DailyPlan"                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InstrumentPlan"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SetupCandidate"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CandidateOptionSelection"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CandidateTarget"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GateAssessment"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GateResponse"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EmotionalAssessment"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EmotionalResponse"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SetupGrade"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Trade"                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TradeLeg"                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TradeReview"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Evidence"                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditEvent"                ENABLE ROW LEVEL SECURITY;
