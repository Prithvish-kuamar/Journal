# Phase 1 vertical-slice implementation plan

## Scope

Deliver the complete owner workflow: Strategy Builder → Daily Plan → New Setup → Mandatory Gate → Setup Grade → Trade Entry → Post-Trade Review. Non-slice navigation stays intentionally unavailable with clear later-phase states.

## Implementation sequence

1. Scaffold the Next.js/TypeScript application and local Prisma/SQLite persistence; add project commands and `.env.example`.
2. Model versioned strategies, configurable rules/gates/grade categories/entry models, candidates, gate assessments, grades, trades/legs, reviews, evidence metadata, and append-only audit events.
3. Seed one editable strategy draft, a published default version, the 15 gate titles, six grade categories, four intentionally incomplete entry-model shells, and labelled demo records.
4. Implement and test domain services for gate rejection, grading, trade permission, grade locking, strategy version copies, add-on controls, R metrics, screenshot timing, and historical references.
5. Build the Evidence Ledger shell and fully functional Phase 1 screens/forms.
6. Add unit/integration tests plus Playwright happy-path and rejected-path coverage; run build and document limitations.

## Explicit non-goals

No brokerage execution/sync, live data, candle recognition, automatic macro analysis, production file storage, full importer, advanced analytics, social/billing features, native app, or AI coach.

## Acceptance checkpoints

- A published strategy can be edited only by creating a new draft version.
- A Daily Plan and Setup Candidate can reference that immutable version.
- First mandatory No remains Rejected after diagnostic completion.
- A Passed assessment can be graded 6–12, and a created trade locks the grade.
- Add-on and restricted-thesis rules are checked and audited.
- A closed trade can receive a structured review and a demo evidence attachment.
