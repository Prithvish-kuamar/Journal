# Implementation-Grade Page Specifications

## Shared page contract (applies to every specification below)

**Data contract notation:** `Label [type | R/O | default | source | validation/derivation]`. R=required, O=optional. All forms show required legend, account timezone/trading-day context where relevant, server/local autosave status, and an error summary linked to invalid controls. Owner has access to own records; future reviewer is read-only. Locked records expose audit history and an amendment/clone route rather than in-place mutation.

**State contract:** Empty explains why no data exists and names the next safe action; loading uses labelled skeletons; offline permits draft capture where safe and shows “not synced”; errors retain input and offer retry; success gives a receipt/deep link. Destructive action names target/count, offers export when applicable, requires confirmation, and writes an audit event. Desktop uses sidebar + page header + contextual panel; tablet collapses secondary panel; mobile uses single-column task flow/bottom sheet. Tab order follows visual task order, `Esc` closes overlays, shortcuts are discoverable, and screen readers receive semantic headings, labels, error summary, save/status announcements, and non-colour status text. Every page emits `page_view` with route/context, plus listed events; acceptance scenarios include visible state, persistence, audit, keyboard, and screen-reader result.

## 1. Onboarding

**Purpose/entry/actions:** First-run readiness; entry after authentication or `Resume setup`. Primary: save profile/account/strategy shell; secondary: skip optional tutorial. **Fields:** `Timezone [IANA select|R|browser guess|profile|valid IANA]`; `Trading-day rollover [time|R|00:00 account tz|profile|00:00–23:59]`; `Account name [text|R|—|user]`; `currency [ISO select|R|—]`; `strategy name [text|R|Custom LTA Strategy]`; `acknowledge rulebook incomplete [checkbox|R|false]`. Derived readiness checklist. Draft fields autosave; account/strategy creation is audited. Empty is this screen; success routes to Home with incomplete-rulebook warning. Events: `onboarding_started/completed/skipped`. **Acceptance:** cannot activate trading workflow without account/timezone; keyboard completes all fields; screen reader hears remaining prerequisites.

## 2. Dashboard

**Purpose/entry/actions:** Home from navigation/logo; primary action `New setup` (global), secondary filter/date/unit/layout. **Fields/controls:** `Date range [preset/date range|R|current week]`, `Account [multi-select|O|all active]`, `scope [segmented|R|all/valid-only]`, `unit [R/currency/%|R|R]`, `layout [preference|O|opinionated]`; sources are query + dashboard preference. Derived KPIs, N, exclusions, review coverage. Widgets are read-only and link to filtered reports. Locked metric snapshot never applies. Empty has strategy/plan calls; events `dashboard_filter_changed`, `widget_opened`. **Acceptance:** filter chips/units persist only as preference; every chart exposes N/definition/table and focusable drill-through.

## 3. Daily Plan list

**Purpose/entry/actions:** Find/create plans; entry Plan nav/Calendar. **Fields:** filters `date range [range|O|current month]`, `account [multi|O|active]`, `status [multi enum|O|Draft,Active,Completed]`, `instrument [autocomplete|O]`; rows show trading date/account/status/objective/instrument count. Primary `New plan`; secondary clone/archive/export. Source daily plans; validation prevents duplicate active plan per account/trading date unless override. Archive confirms linked record count. Events `plan_created/cloned/filter_changed`. **Acceptance:** empty differentiates no plans/no matches; row opens detail, keyboard table works, archive preserves linked snapshots.

## 4. Daily Plan detail/editor

**Purpose/entry/actions:** Create/edit/activate a dated plan. **Fields:** `Trading date [date|R|next trading date|account rollover]`, `Account [select|R]`, `Strategy version [read-only select|R|active published]`, `session classifications [multi-select|O|Asia/London/New York AM]`, `economic events [repeatable structured text/time|O]`, `volatility [enum|O]`, `readiness [enum|R|not assessed]`, `sleep/energy [1–5|O]`, `max daily risk [decimal R/currency|R|policy default]`, `max trades [integer|R|policy]`, `objective [text|R|weekly objective prefill]`, attachments. Session labels have no start/end time fields. Draft only editable; activation validates account/version/readiness/risk/objective and audits snapshot. Derived plan risk remaining. Events `plan_saved/activated/completed`. **Acceptance:** activation creates immutable downstream context; offline draft recovers; Completed is not deleteable.

## 5. Instrument Plan and Scenarios

**Purpose/entry/actions:** Specify one instrument’s thesis; entry plan detail/tab. **Fields:** `Instrument [instrument select|R]`, `bias [bull/bear/neutral|R]`, `confidence [1–5|R|3]`, `direction [long/short/both|R]`, `archetype [contrarian/momentum/undecided|R]`, driver/COT/sentiment/OI/seasonality/valuation/correlation summaries `[rich text|O]`, directions `[enum|O]`, zones/levels/profile `[repeatable structured|O]`, planned models `[multi select|O]`, required/invalidation conditions `[rich text|R]`; Scenario A/B/C each has expected action, confirmation, permitted models, invalidation. Source strategy/instrument definition; validation unique instrument per plan and published model. Active edits audit/revision. Events `instrument_plan_added/scenario_saved`. **Acceptance:** candidate copies, not references, current plan values.

## 6. Fast Pre-Entry Gate

**Purpose/entry/actions:** Qualify live setup in <90s; entry global `New setup`, shortcut, active plan. **Fields:** 15 gate answers `Yes/No [segmented|R until first No; remaining O diagnostics|unanswered]`, evidence/note `[attachment/text|O or policy-R]`, candidate instrument/direction/model `[select|R]`. Source active plan/rulebook. First No derives `Rejected on failure`; pass needs 15 Yes; only pass enables score. Primary save rejected/continue scoring; secondary save draft/switch Review. Lock at trade creation; all response changes audited. Events `gate_opened/answered/first_failed/rejected_saved/passed`. **Acceptance:** Y/N shortcut works; first No announces rejection and enables save without remaining fields; offline retains exact answer order/time locally.

## 7. Review Pre-Entry Gate

**Purpose/entry/actions:** Evidence-rich qualification/review; entry Fast Mode switch/candidate detail. **Fields:** same 15 plus `rule explanation [read-only]`, `evidence association [repeatable|policy]`, `note [text|O]`, `N/A [disabled unless rule permits]`. Shows first failure, answered/remaining count, fully-assessed flag. All stored against gate-definition snapshot. Events `gate_review_opened/diagnostic_completed`. **Acceptance:** rejected candidate can complete diagnostics without changing result; every control announces rule and evidence requirement.

## 8. Rejected Setup detail

**Purpose/entry/actions:** Preserve failure and choose study/no-trade/override. Entry from gate, Trades/Calendar. **Fields:** read-only failed gates/times/evidence; `override reason [long text|R only if trade anyway]`, `no-trade reason [enum+text|R]`, optional diagnostics. Primary `Record correct no-trade` or `Take rejected setup anyway`; secondary add evidence/complete diagnostics/expire. No grade controls. Audit locks failure; override produces linked classified trade. Events `rejected_viewed/no_trade_recorded/rejected_override_started`. **Acceptance:** never displays A+/A/B; override confirmation names failed gates and persists reason.

## 9. Setup Grading

**Purpose/entry/actions:** Calculate grade after pass. Entry gate pass/candidate detail. **Fields:** six criterion scores `[1/2 radio|R|unscored|criterion definition]`, `trader confidence [low/medium/high|O]`, `subjective note [text|O]`; derived C=6/B=7–8/A=9–10/A+=11–12. Validation all six values; no manual grade field in v1. Primary lock/create trade; secondary save calculated draft. Source versioned criteria/policy. Events `score_calculated/score_locked`. **Acceptance:** grade corrections preserve original/corrected value, explanation and audit.

## 10. Trade list

**Purpose/entry/actions:** Search/filter all idea-level trades. Entry Journal > Trades/global search. **Fields:** filters date/account/instrument/session/direction/outcome/grade/execution/management/validity/model/archetype/profile/mistake/tag/evidence/review/plan/version/source `[multi select|O]`; saved view `[select|O]`. Rows derived from trade/review/candidate snapshots, show source/context-missing. Primary open/create; secondary export/save view/archive. Events `trade_filter_changed/saved_view_applied`. **Acceptance:** manual/imported trades visible without candidate; all filters accessible and table has card alternative.

## 11. Trade creation

**Purpose/entry/actions:** Record planned/manual/direct trade. Entry qualified candidate, list `New trade`, import enrichment. **Fields:** identification `account/instrument/date/time/timezone/direction/archetype/model [select/date/time|R except model/archetype O for manual]`; context `candidate/plan [link|O]`, thesis/invalidation `[text|O]`; order `entry/stop/target [decimal|R for planned]`, `quantity [decimal|R]`, `risk, account size, fees, spread, exposure, correlated exposure [decimal|O/policy]`, `order type [enum|R]`; evidence. Defaults from candidate/plan/account. Validates instrument precision, stop/risk, policy warnings. Source `manual/imported/enriched`. Creation snapshots original plan/risk; audit records source. **Acceptance:** direct manual can save context-missing; rejected override requires reason; no invented grade.

## 12. Active Trade

**Purpose/entry/actions:** Safely append management and legs. Entry active trade alert/list/detail. **Fields:** read-only original plan/current position/R; event `action [enum|R]`, `timestamp [datetime|R|now]`, `price [decimal|conditional]`, `quantity [decimal|conditional]`, `reason [text|R]`, `planned [boolean|R]`, `evidence [O]`; quick actions BE/partial/close. Source trade/legs. Validates quantity ≤ open, precision, future time, warning on stop widen/limit breach. Event append-only; late entry labelled. Events `management_event_saved/trade_closed`. **Acceptance:** mobile event path works one-handed; close only when zero quantity; original plan is always visible.

## 13. Closed Trade detail

**Purpose/entry/actions:** Inspect immutable financial record; entry trade list/calendar/review. **Fields:** read-only context, legs, event timeline, realized R/reconciliation, evidence, audit; `correction reason [text|R for amendment]`. Primary begin review; secondary library promotion/export/request correction. No ordinary edit. Error reports unreconciled import. Events `closed_trade_viewed/correction_requested`. **Acceptance:** trade status remains Closed after review; late evidence shows upload/capture provenance.

## 14. Post-Trade Review

**Purpose/entry/actions:** Diagnose closed trade; entry closed detail/backlog. **Fields:** `would take again [yes/no|R]`, `outcome [enum|R|derived suggestion]`, `classification [enum|R]`, `execution grade [A/B/C/F|R]`, `management grade [A/B/C/F|R]`, versioned questions `[mixed|conditional]`, `primary mistake [code|R except NONE]`, secondary `[multi|O]`, `observed deviation impact R [decimal|O]`, `counterfactual cost R+basis [decimal/text|O]`, lesson `[text|R]`, evidence. Validates complete requirements and `NONE` exclusivity. Complete locks snapshot/amendment audit. Events `review_started/completed/amended`. **Acceptance:** financial metrics work before review; quality analytics exclude incomplete review with visible coverage.

## 15. Review backlog

**Purpose/entry/actions:** Complete overdue reviews. Entry Review nav/dashboard. **Fields:** filters `age/account/instrument/status [O]`; rows closed time, age, R, source, missing required parts. Primary open next review; secondary snooze with reason. Derived due/overdue based on 48h preference. Events `backlog_opened/review_snoozed`. **Acceptance:** no hidden exclusion; screen reader announces item count and overdue state.

## 16. Calendar month/week/day

**Purpose/entry/actions:** Navigate decision-quality days. Entry Journal > Calendar/dashboard. **Fields:** `view [month/week/day|R|month desktop, agenda mobile]`, date/account/filter; day cells derive labelled quality state, total/valid/invalid R, plan/activity. Day drawer shows plan, trades, rejected, missed, no-trade, review. Events `calendar_view_changed/day_opened`. **Acceptance:** not colour-only; timezone/rollover labelled; keyboard grid and mobile agenda both expose all day records.

## 17. Correct No-Trade form/detail

**Purpose/entry/actions:** Record rule-compliant avoidance; entry rejected detail, plan/calendar/new decision. **Fields:** `candidate/plan/scenario [link|O]`, `instrument [select|R]`, `reason [enum+text|R]`, `provenance [real-time/hindsight|R|real-time]`, `correctness [pending/confirmed|R|pending]`, evidence `[O/policy]`, `recorded time [datetime|R|now]`. No realized R/grade. Validates provenance and links; archived separately from decision. Events `no_trade_started/recorded/reviewed`. **Acceptance:** it is visible in calendar/analytics as Correct No-Trade, never merely archive.

## 18. Missed Setup form/detail

**Purpose/entry/actions:** Capture a valid opportunity not entered; entry plan/calendar/library. **Fields:** links, instrument `[R]`, `reason [enum+text|R]`, `provenance [real-time/hindsight|R]`, `intended grade [enum|O]`, `grade provenance [real-time evidence/hindsight estimate|conditional R]`, `estimated R [decimal|O]`, `estimation basis [text|conditional R]`, evidence, correctness/review. Hindsight label required and excludes prospective measures. Events `missed_setup_recorded/reviewed`. **Acceptance:** estimated R never enters realized metrics; model shows provenance.

## 19. My Strategy overview

**Purpose/entry/actions:** View active playbook/readiness. Entry Strategy nav. **Fields:** read-only active version, risk/permission summary, instruments, rulebook completeness, models, current examples; `create revision [action]`. Primary open rule/version; secondary archive strategy/export. Events `strategy_viewed/revision_started`. **Acceptance:** incomplete owner-required doctrine visibly blocks publish/automated enforcement claims.

## 20. Strategy rule editor

**Purpose/entry/actions:** Edit draft version rules. **Fields:** version metadata `[read-only/editable]`; gate definition prompt/Yes/No/N-A/evidence/timeframe/profile/automation/manual/examples `[text/select/repeatable|R as Rulebook]`; macro/technical/risk rules `[structured text|R per section]`. Source draft version/rulebook. Validates all 15 unique keys and published references. Only owner/draft editable; every save audited. Events `rule_edited/rule_validation_failed`. **Acceptance:** cannot edit published rule; clone to draft preserves source/version difference.

## 21. Entry Model editor/detail

**Purpose/entry/actions:** Specify EM1–EM4. **Fields:** code/name `[text|R]`, purpose, conditions, macro/location/profile/structure/candle/confirmation/entry/stop/target/invalidation/avoid, mistakes, examples `[structured text/evidence|R where Rulebook says]`. Validation unique code/version and required owner doctrine. Events `entry_model_saved/example_linked`. **Acceptance:** model selector only lists published version models; historical trade opens snapshot.

## 22. Strategy version comparison/publish

**Purpose/entry/actions:** Compare and safely publish draft. Entry Strategy overview. **Fields:** `from/to version [select|R]`, diff `[read-only]`, `change summary [text|R]`, `effective time [datetime|R|now]`, confirmation `[checkbox|R]`. Derived affected future records only. Validates Rulebook completeness/policies. Publish creates immutable version and supersedes prior; audit is mandatory. Events `version_compared/published/publish_blocked`. **Acceptance:** no historical trade is recalculated by publication.

## 23. Setup Library list/detail/compare

**Purpose/entry/actions:** Curate/study evidence. Entry Journal > Library/trade promotion. **Fields:** collection, filters/search, tags; detail `source [read-only]`, hero evidence, annotations, lesson `[R]`; compare selection `[2–4 IDs]`. Validation source visibility/evidence provenance. Owner edits curation not underlying trade. Events `library_item_created/compared/annotated`. **Acceptance:** missing evidence explicit; compare is keyboard and screen-reader usable as sequential panels.

## 24. Analytics overview and report detail

**Purpose/entry/actions:** Answer improvement question transparently. Entry Analytics nav/widget. **Fields:** global filters, `metric [select|R]`, `group by [select|O]`, `validity scope [R]`, `sample threshold [integer|O|30]`, saved view; derived metric/N/exclusions/definition/table/chart. Read-only data. Events `report_run/drillthrough/sample_warning_seen`. **Acceptance:** currency conversion source/time is shown; chart has table; no causal language or result without N.

## 25. Weekly Review

**Purpose/entry/actions:** Publish weekly reflection/objective. Entry Review nav/dashboard. **Fields:** period/account/filter `[R]`, generated metrics snapshot `[read-only]`, required reflections `[text|R]`, `objective [text|R]`, `focus mistake [code|O]`, examples `[links|O]`. Source complete reviews/trades under snapshot filters. Publish locks; revision only amendment. Events `weekly_review_generated/published/objective_updated`. **Acceptance:** missing reviews are surfaced; published metrics remain reproducible.

## 26. Accounts

**Purpose/entry/actions:** Manage financial contexts. Entry Settings. **Fields:** name/broker/type/currency/starting/current balance/limits/risk/timezone/rollover/status/notes; R as applicable. Validate unique name, ISO currency, limits/rollover. Owner only; archive/delete uses audited flow. Events `account_created/updated/archived`. **Acceptance:** archive keeps historical trades; account snapshot appears in them.

## 27. CSV import mapping/preview/results

**Purpose/entry/actions:** Safely ingest execution data. Entry Settings > Import. **Fields:** file `[upload|R]`, source/account `[select|R]`, mapping template `[select|O]`, column mappings `[select|R required mapped fields]`, row decisions `[accept/skip/merge|R conflict]`; preview normalised prices/times/aliases/duplicates/errors. File validation type/size/schema; source rows immutable. Events `import_uploaded/mapped/previewed/confirmed/row_resolved`. **Acceptance:** duplicate never silently imports; missing strategy data remains context-missing; retry does not duplicate accepted rows.

## 28. Export/backup/restore

**Purpose/entry/actions:** Data portability/recovery. Entry Settings > Data. **Fields:** `scope [records/dates/accounts|R]`, `format [select|R]`, `include evidence [boolean|R|false]`, restore archive `[file|R]`, confirmation `[R]`. Validates ownership/schema/checksum; backup/restores create job/audit. Events `export_requested/backup_created/restore_validated/restored`. **Acceptance:** restore runs validation/preview before write; destructive merge/replace choice explicit.

## 29. Privacy/deletion

**Purpose/entry/actions:** Control privacy/retention and request deletion. Entry Settings > Privacy. **Fields:** privacy preferences, export request, deletion scope `[account/user/evidence|R]`, retention acknowledgement `[R]`, confirmation phrase `[R]`. Validates recent authentication/ownership. Owner only; deletion request locks scope and audits. Events `privacy_updated/deletion_requested/export_ready`. **Acceptance:** explains what is deleted/anonymised/retained; no public profile default.

## 30. Audit-history viewer

**Purpose/entry/actions:** Explain material record changes. Entry detail `History`, Settings audit. **Fields:** filters entity/action/actor/date; immutable rows show time, actor, action, reason, redacted before/after, linked record. No edit/delete. Events `audit_viewed/audit_filtered`. **Acceptance:** locked-change path is traceable; sensitive data redacted; keyboard table and accessible change description work.

## Approved Phase 0 behaviour overrides

These approved rules take precedence over any earlier shorthand: scoring controls expose only 1 and 2 after a Passed gate result; gate UI stores separate result, diagnostic completion, and lock state; no general N/A exists; B/C/Rejected overrides require reason and use `Restricted setup taken anyway` plus basis; Closed Trade always displays distinct Executed R, Planned-capital R, and Maximum-risk R with denominators; Correct No-Trade saves Pending and can only be confirmed during end-of-day or weekly review after required checks.

## Doctrine-source guard

Strategy rule, gate, and entry-model views display `OWNER-APPROVED`, `SOURCE-BACKED DRAFT`, or `UNRESOLVED`, with source/conflict/question links. A source-backed draft may guide journal capture but may not be displayed as final personal doctrine or used as an unlabelled automatic validation rule. The strategy version publish screen blocks the “Owner-approved doctrine” designation while any blocking question remains unanswered.

## Batch A page behaviour

Daily Plan selects Asia, London and/or New York AM as manual planning/analytics labels; trade creation lets the trader select the applicable label without applying session hours, DST logic or a clock-time rejection. Event storage keeps UTC/original timestamp and IST is displayed. Trade creation rejects an instrument outside the versioned live allow-list and prevents a third live trade thesis after two executed theses. Manual third-history entry remains available but requires restricted override, process violation, and recovery/revenge-intent declaration. A partial first fill starts one thesis; no-fill cancellation does not, and planned add-ons remain in the same thesis. Active Trade records every addition as a leg with independent price, size, timestamp, stop, initial risk, screenshot, reason and planned/unplanned status; before save it recalculates complete-position worst-case risk, blocks an add above 2%, and flags an unplanned add as a violation. It warns, rather than caps, when many legs create risk complexity; only the new-entry-model question remains unresolved.
