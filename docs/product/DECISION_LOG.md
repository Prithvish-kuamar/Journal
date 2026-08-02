# Decision Log

| ID | Decision | Status | Recommended/default decision | Rationale and impact | Owner action |
|---|---|---|---|---|---|
| D-001 | Grade override | **Approved** | Immutable calculated grade; optional confidence/note. | Correction preserves original/corrected value, explanation and audit. | Applied. |
| D-002 | Gate completion after first No | **Approved** | Reject immediately; Fast Mode may save; remaining diagnostics optional. Result/diagnostic/lock are separate. | Preserves speed and data quality. | Applied. |
| D-003 | Candidate conversion | Proposed | A linked trade sets `convertedToTrade` relationship metadata; candidate retains lifecycle state. | Avoids mixing lifecycle and linkage. | Approve. |
| D-004 | Trade/review states | Proposed | Trade remains Closed; Review is separate Not started/In progress/Complete. | Separates financial record from diagnosis. | Approve. |
| D-005 | R basis and expectancy | **Approved** | Executed R primary; Planned-capital and Maximum-risk secondary. Expectancy is Σ Executed R ÷ all eligible closed trades, including BE. | Prevents denominator substitution. | Applied. |
| D-006 | Gate N/A | **Approved** | No N/A except documented rule-version exception, exact situation and required reason; never bypasses mandatory condition. | Protects validity gates. | Owner doctrine remains in progress. |
| D-007 | IA gate location | **Approved** | Home, Plan, Journal, Review, Analytics, Strategy, Settings; persistent global New Setup. | Gate is contextual/time-critical. | Applied. |
| D-008 | Correct no-trade/missed record | Proposed | First-class decision entities/subtypes with provenance and evidence. | Makes decisions analysable instead of archival. | Approve. |
| D-009 | Cross-currency reporting | Open | R is canonical; currency aggregation requires conversion snapshot and explicit source/time. | Avoids false precision across accounts. | Confirm reporting currencies/source. |
| D-010 | Imports | Proposed | Import execution data only; no inferred grade/validity/gates. | Protects analytical integrity. | Provide sample files/mappings. |
| D-011 | Strategy doctrine | Blocked on owner input | Do not invent exact LTA criteria. | Enforcement cannot be operational until Rulebook placeholders are approved. | Complete STRATEGY_RULEBOOK.md. |
| D-012 | Grade scoring | **Approved** | Score only 1 (valid/acceptable) or 2 (strong/aligned) after all gates pass; C=6. | Validity is determined by gates, so grade has no zero. | Applied. |
| D-013 | Correct no-trade confirmation | **Approved** | Save Pending; confirm only end-day/weekly after required no-skip checks; otherwise mark Missed. | Prevents rewarding inactivity that skipped a permitted setup. | Applied. |
| D-014 | Visual direction | **Approved** | Evidence Ledger dark default; Technical Fieldbook light mode. | Strategy/evidence-first, accessible and non-casino. | Applied. |
| D-015 | Strategy doctrine source intake | **In progress** | War Map PDF rules are SOURCE-BACKED DRAFT unless owner confirms operational interpretation. | Source conflicts and thresholds route to Strategy Owner Questions. | Applied. |
| D-016 | Batch A instruments and sessions | **Approved** | Eight named live instruments; Asia/London/New York AM are trader-selected planning/analytics labels. | No session hours, DST rules, or timestamp-based session rejection; UTC/original storage and IST display remain. | Applied. |
| D-017 | Batch A risk | **Approved in part** | 2% normal; 1% required for contrarian/countertrend, high volatility, holiday/thin liquidity, or funded-drawdown proximity, for valid A/A+ only. | Account-risk basis and `Other` reduced-risk condition remain blocking. | Applied. |
| D-018 | Batch A trade cap | **Approved** | Two executed trade theses/day; partial fill starts a thesis, no-fill does not; planned add-ons stay in that thesis; third history restricted/violating. | No Batch A count blocker remains. | Applied. |
| D-019 | Batch A additions | **Approved in part** | Planned, secured/not-losing additions are allowed as separate legs only when recalculated total worst-case risk remains at or below 2%; unplanned adds are violations. | Only whether every add requires a complete new entry model remains blocking (Q-A43). | Applied. |
| D-020 | Realistic 2R gate | **Approved** | Realistic 2R is an optional execution confluence, not a mandatory rejection gate, for strategy versions published after this decision. | A No cannot reject a setup; risk and tradeability may still use it as scoring context. Historical versions and assessments retain their 15-gate snapshot. | Applied in strategy version 2. |
| D-021 | Expanded journal classifications | **Approved** | Versioned option libraries store supplied field labels, optional colours and immutable selection snapshots for context, bias, confluence, targets and setup type. | Prevents option editing from rewriting history and prepares filters/exports/analytics. | Applied. |
