# Product Requirements Document — Custom LTA Strategy Journal

## 1. Problem and vision

### Problem
Most trade journals preserve outcomes, but not the decision context that makes an LTA trade valid. This makes a profitable rule-break look successful and a valid losing trade look unsuccessful. The owner needs a fast, evidence-led system that records the plan before entry, qualifies the setup, preserves trade management decisions, and distinguishes strategy variance from execution error.

### Vision
**A strategy-first trading execution and review system that helps a trader qualify setups, enforce rules, diagnose mistakes, and improve through data.** It is a journal and decision record, not a broker or execution platform.

### Product position
The first release joins broad journal analytics with a structured strategy playbook and a strict pre-entry qualification flow. Its differentiator is the immutable relationship between: pre-trade evidence → mandatory gates → pre-entry grade → execution and management events → outcome and review.

Strategy doctrine must also retain a rule status and source: OWNER-APPROVED, SOURCE-BACKED DRAFT, or UNRESOLVED. Source-backed material may support a draft workflow but cannot be represented as final personal rule or silently override an owner-approved rule.

Batch A policy: live execution instruments are XAUUSD, EURUSD, GBPUSD, USDJPY, USDCHF, USDCAD, AUDUSD and NZDUSD only. Asia, London and New York AM are trader-selected planning/analytics labels, not clock-time entry windows; timestamps are stored UTC/original and shown in IST. Maximum is two executed trade theses per trading day; planned add-ons remain in their parent thesis. Normal/reduced risk are 2%/1% of a still-unresolved approved account-risk basis; 1% is required for contrarian/countertrend, high-volatility, holiday/thin-liquidity, and funded-drawdown-proximity conditions. Adds must be preplanned, secured/non-losing, pre-risk-checked and at or below 2% complete-position worst-case risk, with each leg evidenced; only whether every add needs a complete new entry model remains unresolved.

## 2. Target user, jobs, and pains

| Area | Definition |
|---|---|
| Primary user | One discretionary LTA / Trading War Map-inspired trader, initially trading a small set of instruments and accounts. |
| Future fit | Multiple strategies and users must be possible without diluting the first-user workflow. |
| Primary jobs | Plan a trading day; decide whether a live setup is permitted; capture evidence before memory is biased; manage a position; diagnose outcomes; identify repeatable conditions and costly errors. |
| Pains | Checklist steps are skipped under time pressure; records lack screenshot evidence; outcomes distort self-assessment; management changes overwrite the original plan; mistakes are free-text and cannot be analysed; no-trade decisions disappear. |

### Jobs to be done

1. When preparing for a session, I want to turn macro and technical research into dated, instrument-specific scenarios, so I know exactly what would permit or invalidate a trade.
2. When price approaches a planned area, I want to qualify a setup in under 90 seconds, so rule enforcement does not slow execution.
3. When I trade or decline a setup, I want the system to retain the original evidence and timestamp, so later review is honest.
4. When reviewing, I want quality, validity, execution, management, and outcome separated, so I can improve the right part of my process.
5. When choosing what to work on next week, I want mistake cost and recurrence in R, so my objective targets the highest-leverage behavioural change.

## 3. Product principles and non-negotiable rules

- **Valid first, grade second.** Any mandatory-gate `No` produces `Rejected`, irrespective of numerical score.
- **Grade before result.** Gate responses and calculated setup grade lock when a live trade is created; confidence/notes are separate and later amendments are audited.
- **Quality is not outcome.** Setup, execution, management, validity, and result are independently stored.
- **R before money.** R is the default display unit; currency and percentage are secondary display modes.
- **Evidence before memory.** Pre-entry screenshots and decisions are timestamped and associated with their record.
- **No-trade decisions count.** Correct no-trades, rejected setups, and missed valid setups are first-class records.
- **Fast, strict, and humane.** Mandatory steps are concise; discretionary analysis remains editable and explainable.

## 4. Scope

### First valuable version

- Authenticated single-user experience with multiple accounts, timezones, and account-level risk limits.
- Versioned strategy playbook, including macro/technical frameworks and EM1–EM4.
- Daily plans and instrument-specific scenarios with attachments.
- Fast and review pre-entry gate modes; score, grade, permission, rejection, and audit behaviour.
- Manual planned/active/closed trade lifecycle, partial fills/exits, management-event log, screenshots, and post-trade review.
- Calendar, setup library, filters, analytics, weekly review, CSV-import design, exports, backup/restore, and data-deletion flows.

### Explicitly out of scope

Live broker execution or synchronisation, live market data, automatic chart reconstruction, AI coach, market replay/backtesting engine, social/community features, trade copying, native mobile app, public profiles, complex billing, leaderboards, or mentor marketplace. These are roadmap candidates only.

## 5. Functional requirements

| ID | Requirement | Acceptance outcome |
|---|---|---|
| FR-01 | Strategy versioning | Rule and entry-model revisions create a version; historical plans, gates, and trades retain their original version. |
| FR-02 | Daily planning | A date/account plan supports multiple instrument plans, scenarios, readiness, risk limits, news, and attachments. |
| FR-03 | Mandatory gate | A Yes path requires all active mandatory gate answers for the referenced strategy version. Current published strategy versions have 14 mandatory gates; older historical snapshots may retain 15. One `No` rejects immediately; Fast Mode may save then and remaining answers are optional diagnostics. Required evidence rules are configured per strategy rule. |
| FR-04 | Pre-entry grading | Six 1–2 categories calculate immutable C/B/A/A+ after all gates pass. Confidence/note is separate; Rejected overrides grade. |
| FR-05 | Trade guardrail | Default A+/A permit; B review-only; C/Rejected block live creation, while preserving manual historical records and a deliberate restricted-override pathway with reason. |
| FR-06 | Trade and legs | A trade stores original plan/risk and has one or more entries/exits. Net result and realized R handle partials and fees. |
| FR-07 | Management history | Every stop, target, quantity, and close decision becomes a timestamped event without changing the original plan. |
| FR-08 | Review | Closed trades can be classified, graded for execution/management, associated with mistake codes and screenshots, and marked complete. |
| FR-09 | No-trade/missed setup | User can capture correct no-trades, rejected setup avoidance, missed valid setups, real-time versus hindsight discovery, and estimated R. |
| FR-10 | Analysis | Metrics display formula, sample size, visible filters, valid-only/all-trades mode, and insufficient-sample warnings. |
| FR-11 | Findability | Global and page filters, saved views, tags, screenshot/review indicators, and deep links to plan, setup, trade, and library records. |
| FR-12 | Data control | Manual entry, staged CSV import/mapping/deduplication, export, backup/restore, deletion flow, audit log, and account archival. |

### Mandatory pre-entry gates

| # | Gate | System behaviour |
|---:|---|---|
| 1–2 | Macro direction clear; meaningful macro location | Yes/No, optional note/evidence; configurable evidence requirement. |
| 3–4 | Archetype identified; archetype fits conditions | Must name contrarian or momentum when Yes. |
| 5–6 | Intraday structure actionable; execution phase reached | `No` immediately shows rejected state but preserves remaining answers if user continues. |
| 7–9 | Valid profile level; complete entry model; confirmation candle closed | Require selected level/model/candle data on Yes. |
| 10–11 | Entry near plan; structural invalidation clear | Require prices/risk calculation where configured. |
| Optional confluence | Realistic 2R available | Optional execution confluence and risk/tradeability scoring context; `No` or unchecked does not reject a setup. |
| 12–14 | Size correct; total exposure compliant; emotionally capable | Require risk/exposure calculation and readiness response. |

### Grade calculation

Six categories—macro fundamentals, higher-timeframe location, archetype, intraday structure, entry-model quality, and risk/tradeability—each score 1 or 2 after all gates pass. Totals are A+ 11–12, A 9–10, B 7–8, C 6. A failed gate always produces `Rejected`, without scoring. A No rejects immediately; Fast Mode may save then, while remaining gates become optional diagnostics. Gate result, diagnostic completion, and lock state are stored separately. Initial policy: A+/A permit; B review-only; C/Rejected block live execution. Any B/C/Rejected override requires reason and is permanently classified `Restricted setup taken anyway` with basis.

## 6. Non-functional requirements

| Area | Requirement |
|---|---|
| Performance | Daily plan 10–15 minutes; fast gate <90 seconds; immediate logging 1–2 minutes; review 3–5 minutes; weekly review 30–45 minutes. Target fast interactions at typical broadband/mobile-network conditions; design must avoid losing a gate answer on interruption. |
| Accessibility | Keyboard-operable controls, labelled inputs, visible focus, semantic status text, contrast-conformant palettes, no red/green-only meaning, reduced motion, touch targets, screen-reader announcements for rejection and validation. |
| Responsive | Desktop-first dense workspaces; tablet reorganises columns; mobile supports plan review, gate, quick screenshots, trade event, and review—not a compressed desktop table. |
| Reliability | Draft autosave with clear saved/offline/error state; idempotent import; immutable audit records; backup/restore verification. |
| Security/privacy | Secure authentication and session management, least-privilege access, encrypted transport and storage expectations, validated uploads, rate limiting, secure screenshot access, export/delete controls, no public profile by default, no sale of journal data. |
| Data integrity | UTC timestamps plus user/account timezone, trading-day rollover, append-only audit events, retained inactive/deleted-account history, strategy-version references, input and file-type/size validation. |

## 7. Success metrics

| Metric | First target / interpretation |
|---|---|
| Pre-entry coverage | ≥90% of executed manual trades have locked gate + grade or an explicit manual/import exception. |
| Evidence coverage | ≥80% of qualified/executed trades have exact pre-entry screenshot or recorded exemption. |
| Review completion | ≥85% of closed trades reviewed within 48 hours. |
| Workflow time | Median fast-gate completion ≤90 seconds; post-trade review ≤5 minutes. |
| Process adherence | User can quantify valid-trade %, A/A+ adherence, and top mistake cost with a sample size. |
| Data confidence | Zero silent duplicate imports; all grade/rule changes after lock have an audit event. |

## 8. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Too much data entry causes abandonment | Fast mode, defaults from plan, progressive disclosure, drafts, keyboard flow, and import for execution data. |
| Checklist becomes theatre | Preserve evidence/timestamps, require explanation on overrides, and surface recurring gate/mistake patterns. |
| Hindsight contaminates records | Lock pre-entry snapshot; distinguish real-time from hindsight; audit amendments. |
| False confidence from small samples | Display N, minimum useful sample, and warnings; never label correlations as causes. |
| LTA rules evolve | Version strategy and retain references; no retroactive rewrites. |
| Sensitive trading data or screenshots leak | Private-by-default storage, authenticated signed access, validation, explicit export/deletion, and audit logging. |

## 9. Assumptions to confirm

1. One primary owner initially administers rules, accounts, and taxonomies.
2. A “trade” is an idea-level record; its legs represent individual entries/exits and can span a rollover.
3. Executed R is primary: net P&L ÷ initial risk of quantity actually filled. Planned-capital R and Maximum-risk R are separately retained secondary values; no value overwrites another.
4. CSV import starts as execution-data ingestion and does not invent missing strategy context.
5. The first version records economic events manually rather than integrating a live calendar.
