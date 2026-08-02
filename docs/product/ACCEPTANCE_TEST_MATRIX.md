# Acceptance Test Matrix

All scenarios require visible status, source/version provenance, audit event, keyboard completion where interactive, and no silent data loss on retry/offline unless noted.

| ID | Scenario | Expected acceptance result |
|---|---|---|
| AT-01 | A+ valid loss | 15 Yes, 11–12 score, locked A+, Closed negative R, Complete review ValidLoss; quality and outcome remain separate. |
| AT-02 | A valid win | 9–10 score, execution/management recorded, valid classification; analytics reconcile R. |
| AT-03 | Invalid win | Review classifies InvalidWin; never boosts valid-trade % despite positive R. |
| AT-04 | Invalid loss | InvalidLoss, mistake/cause separation and review backlog logic work. |
| AT-05 | First-gate rejection | First No immediately Rejected; Fast save works; no score; diagnostics incomplete metric increments. |
| AT-06 | Multiple failed gates | First failure preserved; optional remaining answers create FullyAssessed diagnostic record. |
| AT-07 | Restricted/rejected trade taken anyway | Mandatory reason/confirmation; linked trade permanently classified Restricted setup taken anyway with basis Rejected/C/RestrictedB. |
| AT-08 | B blocked/saved | B score saves/reviews under default policy and cannot create live trade without configured override. |
| AT-09 | Chased entry | Gate/review captures CHASE; planned vs actual entry visible; observed vs counterfactual impact separate. |
| AT-10 | Confirmation candle not closed | Gate 9 No rejects; evidence/time persists. |
| AT-11 | Incorrect profile | Gate/Review PROFILE evidence and mistake taxonomy snapshot work. |
| AT-12 | Partial entry/exit | Legs reconcile aggregate R per M-04; no leg-count trade metric. |
| AT-13 | Position add | Addition records event; ER/PCR remain distinct from increased MRR. |
| AT-14 | Stop widened | Initial ER/PCR denominators immutable; MRR increases; warning/audit visible. |
| AT-15 | Breakeven | Fees determine true R; BE rate uses tolerance; expectancy includes record. |
| AT-16 | Cross-midnight rollover | Actual UTC/timezone shown; calendar uses stored trading date. |
| AT-17 | Different timezone | Account timezone/rollover derives correct trading date without altering history. |
| AT-18 | Duplicate import | Preview demands explicit skip/merge/correction; retry is idempotent. |
| AT-19 | Imported context missing | Financial data eligible only after reconciliation; no inferred grade/validity/process analytics. |
| AT-20 | Late screenshot | Shows capture/upload times and late label; cannot masquerade as pre-entry evidence. |
| AT-21 | Missing review | Financial metrics include closed trade; review metrics show incomplete exclusion/backlog. |
| AT-22 | Strategy revision | Published version immutable; new version affects future only; comparison/audit works. |
| AT-23 | Renamed mistake code | Historical label snapshot remains; new code revision available for future. |
| AT-24 | Correct no-trade | First-class decision starts Pending and only end-day/weekly confirms after required checks; no realised R. |
| AT-25 | Real-time missed setup | Evidence/time enables prospective missed grouping; estimated R not realized. |
| AT-26 | Hindsight missed setup | Hindsight badge/exclusion from prospective metrics, basis required. |
| AT-27 | Small analytics sample | `<10 exploratory` label, N/exclusions visible, no “best” rank claim. |
| AT-28 | Backup/restore | Validate/preview before restore; restore job/audit; explicit merge/replace scope. |
| AT-29 | Account archive/deletion | Archive preserves trades; deletion shows retained/anonymised/deleted scope and export option. |
| AT-30 | Source-backed doctrine guard | Gate/model displays source-backed status and question link; cannot be marked owner-approved or silently automated while a blocking question is unanswered. |
| AT-31 | EM1 source conflict | UI/rulebook preserves second-candle, third-candle and structural-break interpretations; no default sequence chosen before owner answer. |
| AT-32 | Batch A instrument allow-list | Only XAUUSD and seven named FX pairs permit live entry; analysis-only symbol cannot obtain permission. |
| AT-33 | Session classification | Plan and trade manually select Asia/London/New York AM; UTC/original timestamp and IST display are retained, but no session clock/DST boundary rejects the setup. |
| AT-34 | Daily trade-thesis cap | Two executed trade theses block a third live thesis; a partial first fill counts, no-fill cancellation does not, and a planned add-on remains in its parent thesis. Historical third is restricted with violation/intent. |
| AT-35 | Approved add controls | Add is blocked when unplanned, losing/unsecured, post-invalidation, or above 2% total worst-case risk; each valid leg retains entry, stop, risk, screenshot and reason. Unplanned records are violations. |
