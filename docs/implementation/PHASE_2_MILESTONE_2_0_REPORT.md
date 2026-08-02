# Phase 2 Milestone 2.0 Report

Date: 2026-08-02
Status: **Complete — Milestone 2.0 only**

## Scope statement

This milestone created and verified a Prisma migration baseline for the existing Phase 1 schema. No Phase 2 feature schema, route, UI, trading rule, gate rule, grade rule, R definition, strategy-version rule, or historical record was changed. Milestone 2.1 was not started.

## Starting repository state

- Git commit: unavailable; this working tree has no commit object (`git rev-parse --verify HEAD` failed) and all repository files are currently untracked.
- Active database: `prisma/dev.db`.
- Data classification: all 67 setup candidates have `DEMO:` theses; no non-demo candidates were detected.
- Original database was not used for migration commands and remains untouched.

## Environment versions

| Item | Value |
|---|---|
| Node | v24.18.1 |
| pnpm | 11.9.0 |
| Prisma CLI / Client | 6.19.3 |
| Next.js | 15.5.22 |
| React | 19.2.8 |
| Schema SHA-256 | `6880e5bfb3e222c5f33973421e2ca865b6e7111f87a1d8ea5db7791358610a09` |
| pnpm lockfile SHA-256 | `a71ff07128cc7261f914877d8c7f6835765f333b16a5d9625590a73b7d0900b3` |
| DATABASE_URL | `file:./dev.db` |

## Backup evidence

Backup directory: `local-backups/2026-08-02-before-phase-2/`

Contents:

- `dev.db` — byte-for-byte copy of the active database.
- `database-summary.json` — counts by actual Prisma model.
- `export.csv` — existing journal export.
- `environment-summary.txt` and `database-summary-environment.json` — runtime/repository/data classification.
- `checksums.txt` — SHA-256 values.

Original and backup database SHA-256:

`79f2011b313acf17a69aeff95eb4803996c23799428624503892feacb4154b4a`

Counts at backup time:

| Model | Count |
|---|---:|
| Strategy | 1 |
| StrategyVersion | 2 |
| DailyPlan | 1 |
| SetupCandidate | 67 |
| GateAssessment | 67 |
| GateResponse | 98 |
| SetupGrade | 5 |
| Trade | 62 |
| TradeLeg | 62 |
| TradeReview | 62 |
| Evidence | 0 |
| AuditEvent | 1 |
| JournalOption | 212 |
| CandidateOptionSelection | 102 |
| InstrumentMetadata | 26 |
| EmotionalAssessment | 7 |
| EmotionalResponse | 70 |
| EmotionalQuestion | 20 |
| CandidateTarget | 14 |

There is no `Account` model in the current schema, so no invented account count was added.

## Baseline creation

Created:

`prisma/migrations/00000000000000_baseline/migration.sql`

Procedure:

```text
prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script
prisma migrate deploy   # temporary fresh database only
prisma migrate resolve --applied 00000000000000_baseline   # copied existing database only
```

The SQL is a schema-generated baseline. It contains no Phase 2 entities such as ExitLeg or ManagementEvent. `prisma migrate diff` reported `No difference detected` for both the fresh database and the resolved existing copy.

## Fresh database verification

Evidence directory: `local-backups/2026-08-02-phase20-fresh/`

- Created a new temporary SQLite database.
- Applied the committed baseline successfully.
- Generated Prisma Client successfully after stopping the project Node process that held the Windows query-engine DLL.
- Ran the deterministic seed twice successfully. The seed resets only this temporary database; the second run did not accumulate duplicate records.
- Fresh seed produced the expected Phase 1 demonstration content: current 14-gate/optional-2R version, historical 15-gate version, Gate 15 questions, grading, strategy versions, plan, setups, trades, reviews and option snapshots.
- Final fresh counts: Strategy 1, StrategyVersion 2, DailyPlan 1, SetupCandidate 7, GateAssessment 7, GateResponse 98, SetupGrade 5, Trade 2, TradeLeg 2, TradeReview 2, JournalOption 212, CandidateOptionSelection 42, InstrumentMetadata 26, EmotionalAssessment 7, EmotionalResponse 70, EmotionalQuestion 20, CandidateTarget 14.
- Development startup against the fresh DB returned HTTP 200 at `http://127.0.0.1:3010`.
- Startup log: `local-backups/2026-08-02-phase20-fresh/dev-startup.log`.

## Existing database-copy verification

Evidence directory: `local-backups/2026-08-02-phase20-existing-copy/`

- Copied the backup, never the live database, to `dev.db`.
- Resolved `00000000000000_baseline` as applied on that copy.
- Before resolution SHA-256: `79f2011b313acf17a69aeff95eb4803996c23799428624503892feacb4154b4a`.
- After resolution SHA-256: `60f0dfa44b3210b71e0f5ff9d557b0564f803da7d067996b3e3a66df3f8672ac`.
- The byte hash changed only because Prisma added its migration bookkeeping table. User-table schema diff reported no difference.
- All recorded entity counts remained unchanged, including 2 strategy versions, 67 candidates, 62 trades, 62 reviews and 98 gate responses.
- Historical strategy links, gate snapshots, setup grades, trades and reviews remained queryable.

## Recovery test

Evidence directory: `local-backups/2026-08-02-recovery-test/`.

- Restored a separate copy from the dated backup; the source and restored copy matched SHA-256 `79f2011b313acf17a69aeff95eb4803996c23799428624503892feacb4154b4a`.
- Verified restored counts: Strategy 1, StrategyVersion 2, SetupCandidate 67, Trade 62.
- Recovery procedure documented in `README.md`: stop the app, preserve logs, identify the failed copy, restore the dated copy, verify checksum/counts, restart, and retry only after fixing the migration. No user-data recovery step deletes and reseeds the database.

## Commands executed

```text
git status --short
git rev-parse --verify HEAD
node --version
pnpm --version
node_modules/.bin/prisma.CMD --version
node_modules/.bin/prisma.CMD migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script
node_modules/.bin/prisma.CMD migrate deploy --schema=prisma/schema.prisma
node_modules/.bin/prisma.CMD generate --schema=prisma/schema.prisma
node_modules/.bin/prisma.CMD migrate resolve --applied 00000000000000_baseline --schema=prisma/schema.prisma
node_modules/.bin/prisma.CMD migrate diff --from-url <temporary-db> --to-schema-datamodel prisma/schema.prisma --exit-code
pnpm test
pnpm test:e2e
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

The first test invocation was blocked by sandbox access to the OneDrive workspace; the unchanged command was rerun with approved elevated filesystem access and passed. An initial temporary migration-engine attempt also failed before creating the temporary file; rerunning against an explicitly created empty file succeeded. Neither issue touched the original database.

## Results

- Migration baseline: passed.
- Fresh migration: passed.
- Fresh seed twice: passed; no duplicate accumulation.
- Existing copied database resolution: passed; counts and schema preserved.
- Recovery using a copy: passed.
- Unit tests: **28 passed** across 3 files.
- E2E tests: **7 passed**.
- Type checking: passed.
- Lint: passed.
- Production build: passed.
- Fresh development startup smoke: HTTP 200.

## Changes made

- Added committed baseline migration SQL.
- Added safe `db:migrate:deploy`, `db:baseline:status`, and non-overwriting `db:backup` commands.
- Added `scripts/create-db-backup.mjs`.
- Added `local-backups/` to `.gitignore`.
- Updated README setup and recovery guidance.
- Corrected the Phase 2 plan wording to “Phase 2 includes Milestones 2.0–2.8.”
- Updated P2-001 with evidence, dates, paths and status `Complete`.
- Created this completion report.

## Remaining risks

- The repository has no existing git commit baseline; a repository checkpoint commit still needs to be created by the owner/workflow.
- Prisma warns that the `package.json#prisma` seed configuration is deprecated for Prisma 7; this is not a Milestone 2.0 failure.
- SQLite remains local/single-user; production database/storage and authentication are outside this milestone.
- The baseline must be committed and reviewed before any Milestone 2.1 schema work begins.

## Final status

**Milestone 2.0 is complete.** The application design and behavior are unchanged, no Phase 2 feature work began, and work is stopped pending owner review and approval to begin Milestone 2.1.
