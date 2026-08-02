# Phase 2 Acceptance Matrix

Status values: **Complete** = already working in Phase 1; **Partial** = present but insufficient for Phase 2; **Planned** = Phase 2 work; **Blocked** = owner or migration prerequisite.

| ID | Feature | Preconditions | Steps | Expected result | Automated test type | Manual verification | Status |
|---|---|---|---|---|---|---|---|
| P2-001 | Migration baseline | Backup approval | Baseline current schema; apply to fresh DB; seed; resolve baseline on copied DB | Fresh migration applied; deterministic seed ran twice without duplicate accumulation; copied DB retained all counts and historical links; schema diff reported none | `prisma migrate deploy`, `prisma migrate diff`, migration integration check | Verified 2026-08-02. Backup: `local-backups/2026-08-02-before-phase-2/`; fresh evidence: `local-backups/2026-08-02-phase20-fresh/`; copied evidence: `local-backups/2026-08-02-phase20-existing-copy/`; report: `PHASE_2_MILESTONE_2_0_REPORT.md` | Complete |
| P2-002 | Setup list | Seed setups | Open setups; search, sort, filter, paginate | Results are scalable and counts are correct | Integration/E2E | Try every lifecycle filter | Partial |
| P2-003 | Setup lifecycle | Setup records | Transition Preparing→Qualified/Rejected/Expired/Archived | Only allowed transitions succeed; disposition remains separate | Unit/integration | Attempt invalid transitions | Planned |
| P2-004 | Setup history lock | Locked setup | Edit locked grade/gate/version | Mutation denied; audit/history retained | Unit | Verify original snapshot | Planned |
| P2-005 | Setup detail evidence/audit | Setup with evidence/events | Open detail | Gates, confluences, grade, version, screenshots and timeline render | E2E | Open each evidence item | Planned |
| P2-006 | Strategy-version preservation | Two versions | Create setup/trade; publish later version | Historical record continues to show original version/snapshot | Unit/integration | Compare before/after publish | Complete/Regression |
| P2-007 | Trade list/detail | Closed and active trades | Open Trades; filter by status/instrument/direction/setup/model/version | Correct records and R/PnL appear | Integration/E2E | Open each demo trade | Planned |
| P2-008 | Add-on legs | Qualified permitted trade | Add planned secured leg | Separate leg stored; daily thesis count unchanged; risk ≤2% | Unit/integration | Inspect leg evidence/risk | Partial |
| P2-009 | Partial exit legs | Multi-leg trade | Create two exits, then final exit | Remaining quantity, duration, close state and PnL update correctly | Unit/integration/E2E | Partially close and refresh | Planned |
| P2-010 | Over-exit protection | Trade with remaining qty | Exit more than remaining | Validation blocks mutation and writes no false PnL | Unit | Try over-exit | Planned |
| P2-011 | Three R values | Trade with fees/adds/exits | Close trade | Executed, Planned-Capital and Maximum-Risk R remain separate with denominators | Unit | Inspect detail/export | Partial |
| P2-012 | Management events | Active trade | Change stop/target/add management event | Previous/new value, reason and timestamp audited | Unit/integration | Review timeline | Planned |
| P2-013 | Review queue | Closed/rejected/missed records | Open Review | Queue segments show all unresolved work with age/reason | Integration/E2E | Complete each queue type | Partial |
| P2-014 | Review completion | Closed trade | Enter review, lesson, grades, mistakes, evidence; complete | Review becomes Complete; required data validates | Unit/E2E | Refresh and reopen | Partial |
| P2-015 | Review lock/correction | Completed review | Attempt edit; submit correction reason | Locked review remains; correction appends audit event/history | Unit/integration | Verify old text remains | Planned |
| P2-016 | Emotional review | Gate 15 assessment | Open review | Pre-entry readiness and failures remain comparable to later emotional notes | Integration | Inspect failed question snapshots | Planned |
| P2-017 | Missed setup | Qualified missed candidate | Classify Missed | Disposition is Missed with evidence/reason and no false trade | Unit/E2E | Confirm list/calendar status | Planned |
| P2-018 | Correct no-trade | Pending no-trade | Perform end-day/weekly checks | Confirmed only when no valid permitted setup was skipped | Unit/E2E | Try invalid confirmation path | Blocked |
| P2-019 | Calendar navigation | Daily records | Change month; select day | Month changes and date opens complete day view, never blank | E2E | Test adjacent months and empty day | Partial |
| P2-020 | Calendar day view | Selected date | Open day | Plan, setups, trades, reviews, R, validity, mistakes, no-trade/missed and screenshots render | Integration/E2E | Verify UTC/display timezone boundary | Planned |
| P2-021 | Periodic logs | Journal data | Open daily/weekly/monthly log | Functional summary with links to source records | Integration | Test empty period | Planned |
| P2-022 | Strategy library | Published/draft versions | Search/list/compare/archive | Version differences and historical usage are visible; published version immutable | Unit/E2E | Attempt delete referenced version | Partial |
| P2-023 | Entry Model library | EM1–EM4/No-EM | Open model | Rules/configuration, screenshots, mistakes, associations and safe performance appear | Integration | Open every model | Planned |
| P2-024 | Evidence library | Evidence metadata | Search/filter/grid/detail | Before/management/post evidence, late label and associations render privately | Integration/E2E | Open full-screen and caption | Partial |
| P2-025 | Option CRUD | Existing option | Create/edit/reorder/archive/restore | Duplicate protection; referenced option is non-destructively archived | Unit/integration/E2E | Verify historical label/colour snapshot | Partial |
| P2-026 | Historical option snapshot | Referenced option | Edit label/colour after selection | Historical records retain original label and colour | Unit | Compare old/new record | Planned |
| P2-027 | Accounts | Demo account | Open account list/detail and edit settings | Currency, risk basis/configuration, limits and active state validate | Integration | Test inactive account | Planned |
| P2-028 | Instrument metadata | Incomplete symbol | Open editor; calculate PnL | Missing fields are named; calculation is unavailable, never guessed | Unit/E2E | Switch to manual PnL | Partial |
| P2-029 | Manage Data | Demo data | Export summary; backup; restore copy; clear demo with confirmation | Operations are local, auditable and recoverable | Integration | Restore backup and verify counts | Planned |
| P2-030 | Global search | Records across entities | Search by ID/instrument/text | Matching setups/trades/reviews/evidence link to detail | Integration/E2E | Search no-result and special chars | Planned |
| P2-031 | Shared filters | Records and URL | Apply account/date/model/grade/validity/etc. | All pages use consistent validated filters; no historical mutation | Integration | Refresh/back-forward context | Planned |
| P2-032 | Saved views decision | Owner decision | Decide whether to add saved views | If approved, lifecycle and owner scope are documented before implementation | Review | Owner sign-off | Blocked |
| P2-033 | Route completeness | Sidebar inventory | Visit every visible route | Functional page or labelled unavailable state; no blank/crash | E2E smoke | Click every sidebar item | Partial |
| P2-034 | Analysis regression | Demo trades | Open Analysis and filter | Existing metrics/charts/table remain rendered and calculated | E2E/unit | Verify R curve and empty state | Complete/Regression |
| P2-035 | Gate rejection regression | Gate assessment | Answer first No; continue diagnostics | Rejected remains permanent; no grade | Unit/E2E | Fast and Review modes | Complete/Regression |
| P2-036 | Gate 15 regression | Gate 15 | Answer all Yes/one No/hard limit | Checklist completion and hard-block semantics remain intact | Unit/E2E | Keyboard through ten questions | Complete/Regression |
| P2-037 | Grade regression | Qualified setup | Score six categories | 1/2 total and thresholds unchanged; Rejected cannot grade | Unit | Check locked trade grade | Complete/Regression |
| P2-038 | Strategy publish regression | Draft strategy | Publish new version | Existing setups/trades retain prior version | Unit/E2E | Compare versions | Complete/Regression |
| P2-039 | Audit trail | Any material mutation | Create/edit/lock/correct/export/backup | Actor/time/entity/action/old/new/reason are recorded and append-only | Unit/integration | Inspect timeline and redaction | Partial |
| P2-040 | Accessibility | Any Phase 2 page | Keyboard tabs, filters, dialogs, tables; screen reader labels | Focus visible, semantics/status/error announcements work | Automated a11y + E2E | Keyboard-only walkthrough | Planned |
| P2-041 | Responsive | Desktop/tablet/mobile widths | Open list/detail/review/calendar | Dense desktop layout remains; mobile remains usable without hiding critical states | E2E/visual | 1440, 1024, 390 widths | Planned |
| P2-042 | Evidence privacy | Local evidence | Upload/open/export | Files remain private/local; CSV excludes binary files; invalid type/size rejected | Integration/security | Try invalid upload/path | Partial |
| P2-043 | Backup recovery | Dated backup | Corrupt/failed restore simulation | Failure is surfaced without destroying source; recovery instructions work | Integration/manual | Restore copied DB only | Planned |
| P2-044 | Demo-data integrity | Seed | Seed twice/fresh DB | Deterministic labelled data, no duplicate accidental production-like records | Integration | Inspect demo marker | Complete/Regression |
| P2-045 | Non-goal containment | Phase 2 build | Inspect routes/dependencies | No broker/live/AI/backtest/social/billing/multi-user feature added | Review/manual | Product-scope review | Planned |

## Matrix execution policy

Rows marked Complete/Regression must remain green before every Phase 2 merge. Rows marked Partial are not release-complete until their expected result is met. Rows marked Blocked require the listed owner or migration decision; implementation must not silently choose a value. Each milestone updates this matrix with evidence links, automated test names, and manual verification date.
