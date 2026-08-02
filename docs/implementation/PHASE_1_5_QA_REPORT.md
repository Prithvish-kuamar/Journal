# Phase 1.5 QA Inventory

## Environment

- Runtime: Node.js from the bundled Codex runtime, pnpm 11.9.0.
- Framework: Next.js 15.5.x with React 19 and TypeScript strict mode.
- Database: local SQLite via Prisma. The repository currently has no committed Prisma migrations; local schema sync uses `pnpm prisma db push`.
- Seed: `pnpm db:seed` creates labelled demo data, a historical 15-gate version, and the current 14-gate version where realistic 2R is optional.

## Workflow inventory

| Workflow | Status | QA note |
|---|---|---|
| App startup | Passing | Next dev and production build start locally. |
| Dependency install / lockfile | Passing | `pnpm install --frozen-lockfile` and `pnpm install` completed. |
| Schema sync and seed | Passing | Prisma client generation, `db push`, and seed completed against local SQLite. |
| Mandatory gates | Passing with focused automated coverage | Current version has 14 mandatory gates; historical 2R gate is preserved in seed. |
| Optional 2R confluence | Passing with focused automated coverage | Optional confluence does not affect `gateOutcome`. |
| Emotional readiness | Passing with focused automated coverage | All-yes pass, first-no reject, hard daily/two-loss checks covered in unit tests. |
| Setup grading | Passing with focused automated coverage | Six scores of 1/2 only; Rejected cannot grade. |
| Strategy draft versioning | Fixed | Draft creation now copies option libraries and instrument metadata as well as gates/rules/models/questions. |
| New setup field expansion | Partially working | Fields render and persist. Target persistence bug fixed. Full option-library CRUD/search/reorder remains not implemented. |
| Trade entry | Partially working | Manual and metadata-based PnL paths validate missing metadata. Partial exits are not yet modelled. |
| Add-ons | Partially working | Domain eligibility rules are tested; UI/data model supports entry legs, but complete multi-leg R recalculation is limited. |
| Post-trade review / Lesson | Passing basic persistence | Review and Lesson fields persist; true autosave/history UI remains future hardening. |
| Dashboard controls | Partially working | Existing filters/export/navigation work at smoke-test level. Advanced field filters are not complete. |
| Export | Passing basic expanded CSV | Expanded fields are included; private screenshot files are not embedded. |
| E2E smoke | Passing | Strategy-first navigation and rejected setup path pass in Playwright. |
| Lint/type/build | Passing after fixes | Added ESLint 9 flat config and deterministic E2E runner. |
| Upload/security | Untested / production-hardening | Phase 1 only models evidence metadata; authenticated private storage and content scanning remain deferred. |

## Known remaining limitations

- No committed Prisma migration history exists yet; `db push` is the current local schema-sync mechanism.
- Partial exits are not implemented as first-class exit legs, so deterministic partial-exit PnL is a remaining gap.
- Full option-library management UI for search, custom options, archive, and drag reorder is not complete.
- Instrument metadata is intentionally incomplete in seed data; calculated PnL is unavailable until the owner supplies exact tick/pip/contract metadata.
- Authentication, multi-user authorization, private upload storage, malware scanning, rate limiting, and production retention policy are still production-readiness work.
