# LTA Evidence Ledger — Personal Production V1 Foundation

Strategy-first journal vertical slice: Strategy Builder → Daily Plan → New Setup → Mandatory Gate → Setup Grade → Trade Entry → Post-Trade Review.

## Local setup

1. Install Node.js 20+ and pnpm.
2. Copy `.env.example` to `.env`.
3. `pnpm install`
4. Supply a private PostgreSQL development URL in `DATABASE_URL` and a direct migration URL in `DIRECT_URL` (use a separate Supabase development project; never use production for ordinary local work).
5. `pnpm prisma generate`
6. Apply the committed PostgreSQL baseline: `pnpm db:migrate:deploy`.
7. `pnpm db:seed`
8. `pnpm dev`

Run `pnpm test`, `pnpm build`, and `pnpm test:e2e` for verification.

## Database safety

- `pnpm db:backup` creates a dated, non-overwriting backup under `local-backups/` and never resets the active database.
- `pnpm db:baseline:status` reports migration status; `pnpm db:migrate:deploy` applies committed migrations only.
- `pnpm db:postgres:status` is an explicit PostgreSQL migration-status alias.
- `pnpm db:sqlite-to-postgres -- --sqlite=C:\path\to\copy.db --postgres=postgresql://... --confirm` migrates a copied SQLite database into an empty, explicitly supplied PostgreSQL database. It preserves IDs/snapshots and writes a count report; it never migrates uploads or uses a hidden destination.
- Fresh or temporary database verification must supply an explicit temporary `DATABASE_URL`; never point a destructive command at `prisma/dev.db`.
- If a migration fails, stop the app, preserve logs, restore the dated SQLite copy, verify its SHA-256 checksum and record counts, then retry only after fixing the migration.
- The active PostgreSQL baseline was generated with `prisma migrate diff --from-empty --to-schema-datamodel --script`.
- The former SQLite baseline is archived under `prisma/migrations-sqlite/` for local recovery/reference and must not be applied to PostgreSQL.

## Scope and safeguards

- Demo records are clearly labelled and are not real trading history.
- There is no broker integration, live order execution, market feed, automatic macro analysis, or candle-pattern recognition.
- Sessions are manual analytics labels, not time windows.
- Unresolved strategy doctrine is editable configuration, not hardcoded validation.
- Production screenshot storage uses the private Supabase `evidence-private` bucket. Run `pnpm storage:verify` for a read-only bucket check. Uploads require owner auth, are limited to PNG/JPEG/WebP images up to 6 MB, and use temporary signed previews; public URLs are never used.

See [ADR-001](docs/architecture/ADR-001-phase-1-stack.md) and the [Phase 1 plan](docs/implementation/PHASE_1_PLAN.md).
