# Analytics Specification

## R measurements and canonical population

All financial metrics use **Executed R** by default and name their R basis. Never overwrite or substitute Planned-capital R or Maximum-risk R.

| Measurement | Formula / denominator | Use |
|---|---|---|
| Executed R (primary) | `net realised P&L ÷ initial risk of quantity actually filled`. Initial filled risk is each initial fill’s `abs(fill price − initial stop) × filled quantity × value-per-price-unit`, plus configured initial execution costs. | Default journal, dashboard, expectancy, drawdown, and performance analytics. |
| Planned-capital R (secondary) | `net realised P&L ÷ total risk planned before execution`, using planned entry schedule, initial stop, planned quantity, and configured planned costs. | Compare delivered result to intended capital deployment; partial/under-filled plans stay comparable. |
| Maximum-risk R (secondary) | `net realised P&L ÷ maximum actual risk reached` after fills/additions/stop widening/other management changes, including configured costs. | Diagnose risk expansion; must not replace Executed R. |

`net realised P&L = gross matched-leg P&L − commissions − fees − financing − explicitly captured spread/slippage`. Multiple exits aggregate net P&L once; never average leg R. Position additions are legs/events: they affect Maximum-risk R and may affect Executed R only to the extent they are initial filled quantity under the approved definition; their risk snapshot is retained. Stop tightening/BE never rewrite prior denominators; widening raises maximum risk. R requires no currency conversion. Currency totals group by account currency unless a stored conversion snapshot supplies pair/rate/source/time. Insufficient stop/quantity/cost data produces `Estimated` (documented basis) or `Unavailable`, not invented R.

**Canonical expectancy:** `Σ Executed R ÷ count(all eligible closed executed trades)`, including breakeven. Full-denominator decomposition is `P(win)×avgWin + P(loss)×avgLoss + P(BE)×0`.

## Eligibility and provenance

Eligible closed executed trades are non-duplicate, non-reverted Closed trades with Executed R calculable or an explicitly accepted estimated basis. Financial reports can include reconciled manual/imported records. Strategy/quality reports exclude `Imported—context missing` until audited enrichment and exclude incomplete reviews where the metric relies on review values. Every report displays N, R basis, filters, exclusions, version, conversion state, reconciliation status, and sample warning.

| Decision / classification | Rule |
|---|---|
| Gate | First No = Rejected; `diagnosticCompletion` Partial/Complete is reported separately. |
| Grade | Passed gates only; six categories score 1/2, totals C=6, B=7–8, A=9–10, A+=11–12. |
| Restricted override | Rejected/C/restricted B recorded as `Restricted setup taken anyway` with basis; always included in execution-error analytics and cannot be upgraded by outcome. |
| Correct No-Trade | Pending at save; Confirmed only at end-day/weekly review after no valid permitted/A/A+ setup was skipped and inactivity followed plan/protected quality. Otherwise change disposition to Missed. |
| Missed | Real-time/hindsight provenance; grade/R estimate must include source/basis. Hindsight never enters prospective adherence. |

## Metric catalogue

Global filters/exclusions, BE handling, and partial-trade rules above apply to every row. Thresholds: `<10 exploratory`, `10–29 directional`, `≥30 useful`.

| Metric | Definition / denominator | Common error |
|---|---|---|
| Total / Average Executed R | `Σ Executed R`; `Σ Executed R ÷ eligible trades`. | Treating plan risk or outcome as quality. |
| Planned-capital / Maximum-risk R reports | Same aggregate/average formulas using their labelled denominators; always secondary. | Mixing R bases in one chart. |
| Win rate / BE rate | positive ÷ positive+negative; BE ÷ all eligible (setting displayed). | Using BE-excluded win rate as expectancy probability. |
| Avg winner/loser, payoff, PF | Positive/negative aggregates on Executed R; PF N/A without losses. | Signed/absolute inconsistency. |
| Expectancy | `Σ Executed R ÷ all eligible closed trades`, BE included. | Claiming predictive certainty. |
| Drawdown / streaks | Ordered cumulative Executed R; configured BE breaks streak. | Mixing currencies/ordered dates. |
| Valid / invalid % | Valid or invalid/restricted ÷ classified strategy-context trades. | Calling profitable restricted trade valid. |
| Execution / management accuracy | A-grade count ÷ complete reviews. | Treating missing review as A. |
| A/A+ adherence | Executed A/A+ with execution A ÷ classified strategy-context trades. | Restricting denominator to A/A+ only. |
| Grade/model/dimension performance | `Σ Executed R ÷ group eligible trades`, N/version visible. | Ranking small samples. |
| Gate pass / first-failure / diagnostic coverage | Passed ÷ final assessments; Rejected with Partial diagnostics ÷ rejected; Complete diagnostics ÷ final assessments. | Treating unanswered diagnostics as Yes. |
| Mistake frequency | Mistake records ÷ complete reviews; primary/all toggle. | Secondary codes are non-exclusive. |
| Observed impact / counterfactual / unattributed | Separately sum measured deviation, estimated opportunity cost with basis, and remainder. | Calling estimate actual causal loss. |
| Missed / no-trade | Count by provenance/confirmation; estimated missed R excluded from financial totals. | Counting Pending no-trade as confirmed. |

## Batch A process analytics

Track manually selected Asia/London/New York AM session classifications and optional plan-versus-trade label variance without inferring session time windows; live-instrument violations; executed trade-thesis count per trading day; third-thesis restricted overrides; recovery/revenge intent; approved reduced-risk reason(s); and addition planned/unplanned status, pre-add risk and automatic-risk-block outcomes. A partial first fill counts once toward the thesis count, cancelled no-fill orders count zero, and add-ons remain in their parent thesis. These process measures remain distinct from outcome and the three R measures.
