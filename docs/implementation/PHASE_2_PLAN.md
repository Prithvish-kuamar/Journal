# Phase 2 Plan â€” Complete Journal Operations

Status: Planning only
Scope: Single-user local journal workspace
Design: Evidence Ledger visual system remains locked

## 1. Executive summary

Phase 1 delivered a working strategy-first vertical slice: Strategy Builder â†’ Daily Plan â†’ New Setup â†’ mandatory gates â†’ grading â†’ trade creation â†’ review. Phase 2 will make every journal record findable, openable, editable only within its lifecycle, reviewable, filterable, and auditable.

This plan is based on the current repository, not the original roadmap numbering. It deliberately prioritizes operational completeness over new analytics. No application code, schema, migration, dependency, or UI change is part of this planning task.

## 2. Current-state audit

### Runtime and persistence

- Next.js 15.5.x, React 19, strict TypeScript, pnpm 11.9, Prisma 6 with local SQLite.
- `prisma/dev.db` is used locally; there is no committed Prisma migration history. Schema synchronization currently uses `prisma db push`.
- Seed data is explicitly labelled demo data and includes a historical 15-gate strategy version plus the current 14-gate version where 2R is optional.

### Implemented routes and active components

| Area | Current implementation | Assessment |
|---|---|---|
| Home / Journaling Dashboard | `src/app/page.tsx`, `src/components/analysis-dashboard.tsx` | Working Journal, functional Analysis, URL-backed dashboard filters/export |
| New Setup | `src/app/journal/new/page.tsx` | Working vertical-slice creation form |
| Setup detail | `src/app/journal/[id]/page.tsx` | Working gates, Gate 15, optional confluences, grade, trade/review portions; operational editing guards need completion |
| Setup list | `src/app/journal/page.tsx` | Basic list; lacks scalable search/sort/filter/pagination and lifecycle tooling |
| Daily Plan | `src/app/plan/page.tsx` | Create/activate/list works; detail/edit/completion/archive and day integration are incomplete |
| Review | `src/app/review/page.tsx` | Basic closed-trade review persistence; no complete queue, locking/correction flow, or all decision queues |
| Strategy | `src/app/strategy/page.tsx`, `src/app/strategy/edit/page.tsx` | Version list/draft/publish/edit works; comparison and full library management are incomplete |
| Generic routes | `src/app/[section]/page.tsx` | Deliberate unavailable state prevents blanks, but is not a complete operational page |
| Export | `src/app/api/journal-export/route.ts` | Basic expanded CSV export works |
| Domain | `src/lib/domain.ts`, `src/lib/pnl.ts`, `src/lib/dashboard-filters.ts` | Core invariants, R/PnL validation, and dashboard filtering exist |

## 3. Features already complete

- Strategy-versioned setup creation with immutable historical references.
- Gate result, diagnostic completion, and lock state are separate.
- First mandatory No immediately rejects; diagnostics cannot restore Passed.
- Current 14-gate strategy and optional 2R confluence; historical 15-gate versions remain intact.
- Gate 15 emotional-readiness checklist with hard daily trade/two-loss checks.
- Six-category 1/2 grading, Rejected cannot be graded, A/A+ live permission and B/C/Rejected restrictions.
- Grade locks at trade creation; correction retains original value plus audit intent.
- Planned add-on eligibility rules and entry-leg persistence are present, though full multi-leg accounting is not.
- Three separate R concepts and metadata-aware/manual PnL paths are present.
- Daily-plan creation/activation, setup-to-trade flow, basic post-trade review and Lesson persistence.
- Expanded journal fields/options persist with historical selection snapshots.
- Dashboard Journal/Analysis views, filters, charts, calendar summary, and CSV export at the current supported scope.
- Strategy draft copy/version publish flow and focused domain/E2E regression tests.

## 4. Features partially complete

- Setup list/detail: no lifecycle-aware editing matrix, scalable query controls, evidence/audit views, or all disposition queues.
- Trade management: no dedicated trade list/detail; entry legs exist but exit legs and management timeline do not.
- Partial exits: not first-class; deterministic weighted PnL and final-close semantics are incomplete.
- Add-ons: eligibility is tested, but complete risk/R recalculation across all legs is limited.
- Reviews: basic persistence only; no queue segmentation, review lock, correction audit, rejected diagnostic, missed-setup, or correct-no-trade workflows.
- Daily Plan/calendar: no complete day route, daily review, day evidence, or no-trade/missed status view.
- Strategy/Entry Model/Evidence libraries: list/edit shell exists, but comparison, detail, association, search and evidence browsing are incomplete.
- Option libraries: seeded options and snapshots exist; CRUD, archive/restore, reorder, duplicate protection and management UI are absent.
- Accounts/instrument metadata: model support is partial; metadata editor and missing-field workflow are absent.
- Manage Data and local backup/restore are absent.
- Search/filter coverage is inconsistent outside the dashboard; saved views are not yet defined.
- Sidebar destinations use generic unavailable pages rather than complete operations pages.
- Upload storage is metadata-only; authenticated private storage and scanning are deferred production concerns.

## 5. Missing features

The material gaps are: setup operations, trade operations, first-class exit legs, review workspace, calendar day view, periodic logs, strategy/entry-model/evidence libraries, option CRUD, account/metadata management, local data management, global search/filter consistency, and complete route states.

## 6. Exact Phase 2 scope

Phase 2 includes Milestones 2.0–2.8. It includes relational/domain changes only after the migration baseline is accepted. It does not change approved gate, grade, permission, R, add-on, session, or strategy-version rules. Any unresolved LTA doctrine remains owner configuration.

## 7. Explicit non-goals

No broker synchronization, live execution or market data; AI coaching; automatic macro/candle analysis; replay/backtesting; social/public profiles; billing; native mobile; advanced Phase 3 analytics; production authentication/multi-user authorization; deployment; malware-scanning infrastructure. The existing Analysis dashboard is maintained, not expanded into a new analytics platform.

## 8. Dependencies and prerequisites

- Owner approval of lifecycle and review terminology already marked Proposed in `DECISION_LOG.md` (candidate conversion, trade/review states, missed/correct-no-trade entities).
- Decision on cross-currency reporting/conversion source and audit retention.
- Exact instrument metadata supplied before enabling calculated PnL for an instrument.
- Migration baseline and backup procedure accepted before any Phase 2 schema change.
- Existing Phase 1 focused/unit/E2E suite remains green at each milestone.

## 9. Database migration plan (precondition)

1. Freeze the current Prisma schema and record its hash plus `pnpm-lock.yaml`/runtime versions.
2. Back up `prisma/dev.db` byte-for-byte to a dated, gitignored backup location; export a JSON/CSV demo snapshot using the existing exporter for an additional recovery copy. Never treat the backup as a migration.
3. Generate a SQL baseline from the current schema against a fresh empty SQLite database. Review it against `prisma/schema.prisma`; do not hand-edit business semantics during baseline creation.
4. Commit `prisma/migrations/00000000000000_baseline/migration.sql` only after local verification. Mark the existing database as baseline-resolved using the Prisma-supported resolve workflow, tested first on a copy.
5. Verify fresh setup: create an empty database, apply migrations, generate Prisma client, seed labelled demo data, and run the Phase 1 suite.
6. For every Phase 2 schema change, create a named migration, apply it to a copied current database and a fresh database, then run seed, unit/integration tests and rollback/recovery checks where SQLite permits.
7. On failure, stop at the failed migration, restore the dated database backup, preserve logs, and fix/recreate only the failed migration before retrying. Never use `db push` as an unnoticed production substitute.
8. Document the eventual production database/storage decision separately; Phase 2 remains local/single-user.

## 10. Domain-model changes

Proposed changes (not implemented here):

- `ExitLeg`: trade reference, timestamp, price, quantity, fees/commission, reason, close-status snapshot, realized gross/net PnL, evidence, audit timestamps.
- `ManagementEvent`: trade/leg reference, event type (stop/target/add/security/other), prior/new values, timestamp, reason, evidence.
- Trade close state derived from filled entry quantity minus exit quantity; prevent over-exit. Final exit determines duration end.
- Review lifecycle: Not started/In progress/Complete/Locked with correction event and reason; retain review/lesson history.
- First-class decision records or explicit subtypes for Missed Setup and Correct No-Trade, including provenance/evidence and confirmation checks.
- Option-library metadata: active/archive state, order, category/colour, owner scope, strategy-version association, immutable historical label/colour snapshot.
- Account and instrument metadata completeness/status fields; no inferred contract specifications.
- Search/filter indexes or query helpers only where measured as necessary; do not add a saved-view model until its lifecycle is approved.

## 11. Route/page list

### Existing routes to retain

`/`, `/plan`, `/journal`, `/journal/new`, `/journal/[id]`, `/review`, `/strategy`, `/strategy/edit`, `/api/journal-export`.

### Phase 2 routes/pages

- `/journal/setups` (or the existing `/journal` promoted to the canonical list): list, filters, lifecycle tabs, scalable loading.
- `/journal/setups/[id]`: setup detail, gate/grade/evidence/audit and lifecycle-safe actions.
- `/journal/trades`: active/closed trade list and filters.
- `/journal/trades/[id]`: legs, exits, management, R/PnL, evidence, review and audit.
- `/journal/calendar` and `/journal/calendar/[date]`: month navigation and complete day view.
- `/review`: queue tabs, detail, lock/correction and decision queues.
- `/logs/daily`, `/logs/weekly`, `/logs/monthly`: functional summary logs.
- `/strategy`: library/version comparison and historical usage.
- `/strategy/entry-models` and `/strategy/entry-models/[id]`.
- `/strategy/evidence` (or `/evidence`) and detail/full-screen view.
- `/settings/options`, `/settings/accounts`, `/settings/instruments`, `/settings/data`.
- Every remaining sidebar route must either map to one of these or retain a deliberate, labelled unavailable state.

## 12. Component changes

Extend existing shell and form primitives without visual redesign: `DenseTable`, filter bar, status/grade badges, lifecycle tabs, `EvidenceList`, `AuditTimeline`, `TradeLegTable`, `ExitLegEditor`, `ReviewQueue`, `CalendarDayPanel`, `OptionLibraryEditor`, `MetadataWarning`, `UnavailableState`, and accessible loading/error/empty states. Reuse `analysis-dashboard.tsx` charts rather than creating a second analytics system.

## 13. API/server-action changes

Add server/domain operations for setup queries/lifecycle edits, trade/leg/exit CRUD, management events, review locking/corrections, daily day queries, periodic logs, library associations, option CRUD/archive/reorder, accounts/instrument metadata, local backup/restore, and global filtered search. Keep validation in Zod/domain functions and authorize every mutation for the single local owner boundary. CSV export should reuse the same filtered query DTO.

## 14. Validation rules

- Lifecycle transitions are explicit and reject edits to locked/historical fields.
- Gate/grade rules remain unchanged: first No rejects; only 1/2 after all active mandatory gates; Rejected has no grade.
- Trade creation preserves setup grade and strategy-version reference.
- Exit quantity cannot exceed remaining filled quantity; a trade remains active until all quantity is exited.
- Each leg/add-on retains its own evidence and risk; add-on rules and â‰¤2% maximum worst-case risk are enforced.
- R denominators remain separate; unavailable/estimated values are explicit.
- Review completion requires required fields; post-lock edits require reason/audit.
- Option archive is non-destructive and referenced historical snapshots never change.
- Instrument PnL calculations stop with a precise missing-metadata message.

## 15. Audit-event requirements

Append events for lifecycle transitions, gate/grade corrections, trade creation/closure, exit-leg creation/edit/removal, management changes, add-on/unplanned add-on, evidence upload/late upload/removal, review completion/lock/correction, missed/correct-no-trade decisions, option/account/metadata archive/edit, strategy publish/archive, export/backup/restore/clear-demo operations. Each event stores actor, UTC timestamp, entity, action, previous/new value, reason and redacted metadata.

## 16. Backward compatibility

Existing records load with empty new fields. Historical strategy-version snapshots, gate assessments, grades, option labels/colours and R values are never recalculated. Existing closed trades remain readable while their legacy aggregate exits are represented as a compatible initial exit record during migration. Demo records remain clearly labelled. Export columns are additive and CSV escaping is preserved.

## 17. Seed/demo-data updates

Keep the existing labelled demo set and add representative Phase 2 fixtures only through the seed: draft/qualified/rejected/expired/missed/restricted setups; active/closed trade; planned add-on; multiple exit legs/partial close; incomplete/reviewed/locked review; correct-no-trade and missed setup; archived option; incomplete instrument metadata; strategy version comparison. Demo fixtures must be deterministic and visibly marked.

## 18. Security considerations

Keep the single-user boundary explicit; do not imply multi-user authorization. Validate upload type/size and keep evidence private/local. Prevent path traversal in backup/restore, redact secrets from audit metadata, protect destructive demo-data actions with confirmation, and avoid exposing private review text in public routes or exports unless explicitly requested.

## 19. Accessibility requirements

Semantic headings/tables, labelled filters, keyboard-operable tabs/dialogs/date navigation, visible focus, status text plus colour/icon, screen-reader summaries for charts, accessible error/live regions, and reduced-motion support. Dense tables must retain a usable narrow-screen representation.

## 20. Responsive requirements

Preserve the locked shell. Desktop uses dense tables and two-column detail panels; tablet wraps filters and stacks panels; mobile uses scrollable tables or labelled cards, accessible drawers, and keeps review/violation states visible.

## 21. Test plan

- Domain/unit: lifecycle transitions, immutable grade/version, exit math/over-exit, add-on risk, review lock/correction, option archive/snapshots, metadata validation, R calculations.
- Integration: server actions/API with real SQLite test database, migration baseline/fresh seed, filters/search/export, calendar day aggregation, backup/restore.
- E2E: setup lifecycle, trade with add-on and partial exits, review queue/completion/lock, day view, strategy comparison, evidence association, route audit.
- Accessibility: keyboard/focus, semantic table/tab checks, reduced motion and error announcements.
- Regression: existing Phase 1 gates, Gate 15, grading, dashboard Analysis, strategy versioning and rejected-path tests.

## 22. Implementation sequence

### Milestone 2.0 â€” Migration baseline and checkpoint

- Deliverables: baseline migration, backup/export procedure, fresh-db seed verification.
- Likely files: `prisma/schema.prisma`, `prisma/migrations`, `package.json` scripts, implementation docs.
- Database: baseline only; no feature schema changes.
- Tests: fresh/copy database, seed, Phase 1 unit/E2E/build.
- Acceptance: existing local data backed up; fresh database reproduces Phase 1.
- Risks: SQLite/Prisma baseline resolution; recovery procedure must be tested manually.

### Milestone 2.1 â€” Setup list and details

- Deliverables: lifecycle-aware list/detail, search/sort/filter/loading, gates, confluences, grade, evidence, audit.
- Modules: `src/app/journal*`, domain queries/actions, table/filter components.
- Database: indexes/query support only if required after baseline.
- Tests: lifecycle matrix, locked edit denial, strategy snapshot, evidence/audit.
- Acceptance/manual: create each lifecycle state, open from list, refresh and preserve history.

### Milestone 2.2 â€” Trade management and first-class exits

- Deliverables: trade list/detail, legs/add-ons, exit legs, management events, close derivation, R/PnL.
- Database: `ExitLeg`, `ManagementEvent`, compatibility migration.
- Tests: partial exits, final close, over-exit, weighted PnL/R, add-on risk.
- Acceptance/manual: multi-leg long/short, partial close remains active, final close locks duration.

### Milestone 2.3 â€” Review workspace

- Deliverables: segmented queue, detail, review/lesson paragraphs, emotional/evidence sections, lock/correction audit, rejected diagnostics and decision queues.
- Database: review/decision history if needed.
- Tests: completion requirements, lock, correction, missed/correct-no-trade rules.
- Acceptance/manual: work every queue type and verify audit trail.

### Milestone 2.4 â€” Daily journal and calendar day view

- Deliverables: calendar navigation, complete date view, daily notes/review/screenshots/session summary.
- Database: day-review/evidence fields only if current plan model cannot represent them.
- Tests: month/day navigation, UTC date boundaries/display timezone, R/validity/mistake aggregation.
- Acceptance/manual: calendar never lands on blank page; selected date opens all related records.

### Milestone 2.5 â€” Strategy, Entry Model and Evidence libraries

- Deliverables: searchable strategy/version comparison, entry-model detail/associations, evidence browser and late-upload labels.
- Database: associations/indexes as required.
- Tests: immutable publish/archive, historical usage, evidence privacy/association.
- Acceptance/manual: compare versions and open every associated setup/trade.

### Milestone 2.6 â€” Accounts, metadata and option libraries

- Deliverables: account/instrument editors, missing-metadata warnings, option CRUD/search/reorder/archive/restore.
- Database: option-library fields and metadata completeness if not already present.
- Tests: duplicate/archive/history snapshots, PnL missing-field validation.
- Acceptance/manual: archive referenced option without changing historical label/colour.

### Milestone 2.7 â€” Search, filters, routes and data management

- Deliverables: shared query/filter model, route completeness, local export/backup/restore/demo-data management, periodic logs.
- Database: indexes only; saved views remain a decision unless approved.
- Tests: URL/filter consistency, export, backup/restore, every sidebar route.
- Acceptance/manual: no blank/unexplained interactive route; destructive actions confirmed.

### Milestone 2.8 â€” Regression QA

- Deliverables: full QA report, accessibility pass, migration recovery runbook, limitations update.
- Tests: all unit/integration/E2E/type/lint/build and responsive/manual matrix.
- Acceptance/manual: Phase 1 regression remains green and Definition of Done is signed off.

## 23. Risks

- Baseline migration may expose drift between `db push` schema and local data.
- Partial-exit compatibility can change historical PnL if conversion is not snapshot-safe.
- SQLite concurrency and backup/restore semantics are weaker than a production relational service.
- Broad route completion can accidentally duplicate existing vertical-slice workflows.
- Unresolved owner doctrine may be mistaken for universal validation; keep all such rules version-configurable.
- Evidence privacy and local file lifecycle need a later production security design.

## 24. Open decisions / blockers

1. Approve lifecycle/candidate conversion and trade/review state proposals in `DECISION_LOG.md`.
2. Define correct-no-trade and missed-setup entity/provenance schema.
3. Choose cross-currency conversion source, snapshot and reporting policy.
4. Define audit retention, deletion/anonymisation and backup retention.
5. Confirm whether saved filter views are in Phase 2; if yes, define owner scope, edit/archive/share (share should remain off) lifecycle.
6. Supply complete instrument metadata before calculated PnL is enabled.
7. Confirm review locking/correction wording and required fields.
8. Confirm migration baseline procedure on the ownerâ€™s local database before schema work.

## 25. Definition of done

Phase 2 is complete when every supported sidebar route is functional or deliberately unavailable, setup/trade/review records are searchable and lifecycle-safe, partial exits and add-ons are auditable and mathematically consistent, calendar day views work, libraries/options/accounts/metadata are manageable without rewriting history, local data operations are recoverable, all Phase 1 rules/regressions remain green, accessibility/responsive checks pass, and the migration/recovery runbook is verified. No non-goal feature is present.


