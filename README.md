# LTA Evidence Ledger — Phase 1

Strategy-first journal vertical slice: Strategy Builder → Daily Plan → New Setup → Mandatory Gate → Setup Grade → Trade Entry → Post-Trade Review.

## Local setup

1. Install Node.js 20+ and pnpm.
2. Copy `.env.example` to `.env`.
3. `pnpm install`
4. `pnpm prisma generate`
5. Apply the committed SQLite baseline: `pnpm db:migrate:deploy`.
6. `pnpm db:seed`
7. `pnpm dev`

Run `pnpm test`, `pnpm build`, and `pnpm test:e2e` for verification.

## Database safety

- `pnpm db:backup` creates a dated, non-overwriting backup under `local-backups/` and never resets the active database.
- `pnpm db:baseline:status` reports migration status; `pnpm db:migrate:deploy` applies committed migrations only.
- Fresh or temporary database verification must supply an explicit temporary `DATABASE_URL`; never point a destructive command at `prisma/dev.db`.
- If a migration fails, stop the app, preserve logs, restore the dated SQLite copy, verify its SHA-256 checksum and record counts, then retry only after fixing the migration.
- The current baseline was generated with `prisma migrate diff --from-empty --to-schema-datamodel --script`.

## Scope and safeguards

- Demo records are clearly labelled and are not real trading history.
- There is no broker integration, live order execution, market feed, automatic macro analysis, or candle-pattern recognition.
- Sessions are manual analytics labels, not time windows.
- Unresolved strategy doctrine is editable configuration, not hardcoded validation.
- Uploaded screenshot production storage, authentication, retention, and malware scanning remain Phase 2 security work; Phase 1 stores evidence metadata and supports a local-storage boundary only.

See [ADR-001](docs/architecture/ADR-001-phase-1-stack.md) and the [Phase 1 plan](docs/implementation/PHASE_1_PLAN.md).
