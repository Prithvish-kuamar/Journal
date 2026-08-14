import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const args = Object.fromEntries(process.argv.slice(2).filter((arg) => arg.startsWith("--")).map((arg) => { const [key, ...rest] = arg.slice(2).split("="); return [key, rest.join("=") || true]; }));
const sqlitePath = args.sqlite && path.resolve(String(args.sqlite));
const postgresUrl = args.postgres && String(args.postgres);
if (!sqlitePath || !postgresUrl || args.confirm !== true) {
  console.error("Usage: node scripts/migrate-sqlite-to-postgres.mjs --sqlite=<source.db> --postgres=<destination-url> --confirm");
  console.error("The destination must be explicit; this command never uses DATABASE_URL implicitly and never migrates uploads.");
  process.exit(2);
}
if (!fs.existsSync(sqlitePath)) throw new Error(`SQLite source does not exist: ${sqlitePath}`);
if (!/^(postgres|postgresql):\/\//.test(postgresUrl)) throw new Error("--postgres must be a PostgreSQL URL.");

const sqlite = process.env.SQLITE3_BIN || "sqlite3";
const tableNames = ["Strategy", "StrategyVersion", "StrategyRule", "GateDefinition", "GradeCategory", "EntryModel", "DailyPlan", "InstrumentPlan", "SetupCandidate", "GateAssessment", "GateResponse", "EmotionalQuestion", "EmotionalAssessment", "EmotionalResponse", "SetupGrade", "Trade", "JournalOption", "CandidateOptionSelection", "CandidateTarget", "InstrumentMetadata", "TradeLeg", "TradeReview", "Evidence", "AuditEvent"];
const sourceRows = (table) => {
  const output = execFileSync(sqlite, [sqlitePath, "-json", `SELECT * FROM "${table}";`], { encoding: "utf8" });
  return output.trim() ? JSON.parse(output) : [];
};
const source = Object.fromEntries(tableNames.map((table) => [table, sourceRows(table)]));
process.env.DATABASE_URL = postgresUrl;
const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();
const report = { source: sqlitePath, destination: postgresUrl.replace(/:[^:@/]+@/, ":***@"), startedAt: new Date().toISOString(), counts: {}, migrated: [] };
const reportPath = path.resolve(process.cwd(), `sqlite-to-postgres-report-${new Date().toISOString().replaceAll(/[:.]/g, "-")}.json`);
try {
  for (const table of tableNames) {
    const delegate = table[0].toLowerCase() + table.slice(1);
    const count = await prisma[delegate].count();
    if (count > 0) throw new Error(`Destination is not empty: ${table} has ${count} records. Use an empty PostgreSQL database.`);
  }
  await prisma.$transaction(async (tx) => {
    for (const table of tableNames) {
      const delegate = table[0].toLowerCase() + table.slice(1);
      const rows = source[table];
      if (rows.length) await tx[delegate].createMany({ data: rows });
      report.counts[table] = { source: rows.length, destination: rows.length };
      report.migrated.push(table);
    }
  }, { timeout: 120000 });
  for (const table of tableNames) {
    const delegate = table[0].toLowerCase() + table.slice(1);
    const destinationCount = await prisma[delegate].count();
    report.counts[table].destination = destinationCount;
    if (destinationCount !== report.counts[table].source) throw new Error(`Count mismatch for ${table}: source ${report.counts[table].source}, destination ${destinationCount}`);
  }
  report.completedAt = new Date().toISOString();
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Migration complete. Report: ${reportPath}`);
} catch (error) {
  report.failedAt = new Date().toISOString();
  report.error = error instanceof Error ? error.message : String(error);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  throw error;
} finally {
  await prisma.$disconnect();
}
