# Custom LTA Strategy Rulebook — Source-Grounded Draft

## Status, authority, and approval boundary

| Status | Meaning |
|---|---|
| **OWNER-APPROVED** | Exact operational rule explicitly approved by the project owner. |
| **SOURCE-BACKED DRAFT** | Supported by the owner-supplied Trading War Map source, but not confirmed as the owner’s personal operating interpretation. |
| **UNRESOLVED** | Ambiguous, incomplete, conflicting, or requires a personal threshold. Not enforceable doctrine. |

Authority order: owner-approved personal rule → current owner-supplied official material → Trading War Map PDF → journal product policy. Lower sources never override higher sources. The supplied PDF is cited below as `War Map PDF` with its printed page number. This rulebook is **not Approved** until all blocking questions in [STRATEGY_OWNER_QUESTIONS.md](STRATEGY_OWNER_QUESTIONS.md) have owner answers.

## Source register and known conflicts

| Source area | Source-backed content | Status / handling |
|---|---|---|
| Execution models, pp. 56–69 | EM1–EM4, profile interaction and confirmation patterns. | SOURCE-BACKED DRAFT. |
| Intraday structure, pp. 172–173 | Two reference points, structural break and preparation/execution distinction. | SOURCE-BACKED DRAFT. |
| Archetypes, pp. 183–188 | Contrarian extremes versus confirmed momentum. | SOURCE-BACKED DRAFT. |
| Risk, pp. 204–216 | 2:1 preference, 2/2/2, 1% risk contexts, two-strike rule, emotional checklist. | Owner-approved rules prevail where supplied. |
| EM1 sequence conflict | p. 56 says third candle confirms control; p. 57 describes entry after second closure/flip; p. 69 shows third-candle structural break; p. 68 says entry after break of first candle. | UNRESOLVED; Q-D01–D09. |
| Two-strike exception | Owner requires stop/reassess after two losses and prohibits a third merely to recover. PDF p. 212 says continuation can occur if “secured” within pre-set limits. | Owner rule governs minimum behavior; exact “secured” exception is UNRESOLVED, Q-A12. |

## Owner-approved global operating rules

Each subsection lists the requested operational dimensions. Blank personal thresholds remain UNRESOLVED rather than inferred.

### 1. Instrument universe

**Status:** OWNER-APPROVED. **Exact rule:** live execution is limited to XAUUSD, EURUSD, GBPUSD, USDJPY, USDCHF, USDCAD, AUDUSD and NZDUSD. “Gold and all major pairs” means this explicit list only. Analysis-only futures, DXY, currency indices and correlated markets cannot gain live permission merely through analysis use. **Purpose:** prevent unsupported live execution and calculation. **Eligible/invalid:** listed instruments are eligible; all other instruments are live-execution invalid until added by a new strategy version. **Evidence/timeframe:** canonical instrument ID, venue/alias and account instrument convention. **Validation:** system-calculated allow-list. **Edge cases:** XAUUSD broker alias versus futures/continuous Gold symbol. **Owner question:** exact venue/alias mappings remain Q-A01. **Versioning:** universe is a strategy-versioned policy.

### 2–4. Trading sessions, days, timezone and rollover

**Status:** OWNER-APPROVED session classification; UNRESOLVED trading days/rollover. **Exact rule:** Asia, London and New York AM are the approved session labels. A Daily Plan may select one or more labels and the trader manually selects the applicable label for each trade. The label is an analytics and planning classification, not a clock-time entry window: no fixed IST hours, daylight-saving rules, or time-boundary rejection are defined. Timestamps are stored in UTC while preserving the original timestamp/source when available; IST is the owner display timezone. A trade may remain open after its selected session. **Purpose:** retain comparable session analytics without inventing a time-based restriction. **Eligible/invalid:** the three labels are selectable; a timestamp cannot itself invalidate a setup on session grounds. **Evidence:** planned label(s), trader-selected trade label, UTC/original timestamp and any plan variance explanation. **Validation:** trader-attested classification; system storage/analytics only. **Edge cases:** cross-session holding and cross-midnight display do not change the selected label. **Questions:** none for session hours or DST. **Versioning:** label set changes are prospective.

### 5. Economic-news restrictions

**Status:** SOURCE-BACKED DRAFT. **Exact rule:** upcoming “Red Folder” events are described as sudden-move/manipulation risk; source suggests avoiding them or using conservative risk (p. 63). No owner blackout window is approved. **Purpose:** avoid entries into known abnormal volatility. **Eligible:** owner-approved event/window policy. **Invalid:** entry violating approved blackout. **Evidence:** event record and planned/actual time. **Validation:** trader-attested in v1. **Edge cases:** event after entry. **Question:** Q-A05. **Versioning:** event policy snapshot.

### 6. Spread and execution-quality restrictions

**Status:** UNRESOLVED. **Exact rule:** no approved maximum spread, slippage, liquidity, or order-type threshold. **Purpose:** stop an apparent 2R setup becoming non-viable after costs. **Evidence:** planned/actual spread, fees and fill data. **Validation:** hybrid. **Question:** Q-A06. **Versioning:** execution policy revision.

### 7–8. Maximum risk per trade and riskier-condition reduction

**Status:** OWNER-APPROVED caps and named reduced-risk conditions; account-equity basis and the owner-selected `Other` condition UNRESOLVED. **Exact rule:** normal risk is 2% of the approved account-risk basis; reduced risk is 1%. Reduced risk is required for a contrarian/countertrend setup, high-volatility conditions, holiday/thin-liquidity conditions, or proximity to a funded-account drawdown limit. It is permitted only for a fully valid A or A+ setup that is permitted for live execution. It cannot legitimise B, C, Rejected, incomplete-model, chased, failed-gate, unclear-invalidation or sub-2R setup. Multiple reduced-risk conditions do not reduce risk below 1% unless a later strategy version explicitly changes that rule. **Purpose:** cap loss without lowering validity standards. **Eligible:** 2% normal or required 1% with one or more recorded approved conditions. **Invalid:** any higher risk or 1% used to bypass restriction. **Evidence:** account basis, entry/stop/quantity, selected reduced-risk reason(s). **Validation:** system-calculated cap plus trader attestation of the condition. **Questions:** Q-A36 (basis) and Q-A37 (`Other` only). **Versioning:** risk policy snapshot.

### 9–13. Daily/weekly/total/correlated exposure and maximum trades

**Status:** OWNER-APPROVED maximum trade-thesis rule; remaining numerical exposure limits UNRESOLVED. **Exact rule:** maximum two executed trade theses per trading day. Any partial fill begins an executed thesis; a cancelled order with no fill does not. Planned add-ons and partial fills of those add-ons remain part of their original thesis and do not increase the daily count. A separate directional thesis or independently qualified setup counts as a new trade. Add-ons may not be falsely linked to an earlier thesis to bypass the limit. After two theses, no third live thesis is permitted. A third historical thesis remains recordable as `Restricted setup taken anyway`, includes an immutable process-rule violation and recovery/revenge-intent field, and its result cannot remove the violation. **Purpose:** prevent overtrading/concentration. **Evidence:** thesis identity, filled legs, trading date, no-fill cancellation, linkage rationale and violation/intention record. **Validation:** system count plus linkage review. **Edge case:** an unplanned add-on is a violation even if it belongs to an existing thesis. **Questions:** daily/weekly/total/correlation numerical limits remain Q-A07–A08; no thesis-count question remains. **Versioning:** policy snapshot.

### 14. Two-consecutive-loss rule

**Status:** OWNER-APPROVED baseline with one UNRESOLVED exception. **Exact rule:** after two consecutive losing trades, stop and reassess; a third trade is not permitted merely to recover prior losses. PDF p. 212 requires stopping for the day after two losses but discusses continuation if “secured” within pre-defined limits. **Purpose:** break revenge/tilt sequence. **Evidence:** completed loss sequence, open correlation, reassessment note. **Validation:** system-calculated streak + trader-attested reassessment. **Edge case:** correlated positions and any “secured” continuation. **Question:** Q-A12. **Versioning:** loss-policy snapshot.

### 15. Position-sizing method

**Status:** SOURCE-BACKED DRAFT / UNRESOLVED formula. **Exact rule:** source supports fixed risk and the project has approved 2%/1% caps, but not a final quantity formula. **Purpose:** calculate size from initial structural stop and account risk. **Evidence:** account equity, risk %, entry/stop, tick/pip/contract value, costs. **Validation:** future system-calculated after instrument rules. **Questions:** Q-A09 and Q-A36. **Versioning:** formula snapshot.

### 16–19. Partial fills, adds, stop widening, breakeven

**Status:** OWNER-APPROVED add-on controls; whether an add-on needs a complete new entry model is UNRESOLVED. **Exact rule:** the possibility of adding must be planned before initial entry. Adding to a losing position or after thesis invalidation is prohibited; before an add, the original position must be at breakeven or otherwise secured. There is no fixed numerical leg limit, but total worst-case risk across the complete position may never exceed 2% and must be recalculated before every add. An add that would exceed 2% is automatically invalid. Every add is a separate trade leg retaining entry price, time, quantity, stop, initial risk, screenshot, reason and planned/unplanned status. An unplanned add is an immutable management/process violation even when the thesis wins. The product must not cap leg count but must warn when many legs create complexity or unclear risk. Executed R, Planned-capital R and Maximum-risk R remain separate. Stop widening/BE triggers remain UNRESOLVED. **Purpose:** permit planned scaling without obscuring risk or bypassing trade limits. **Evidence:** initial plan, secured-state evidence, pre-add risk calculation, each leg's evidence/reason and linkage to one thesis. **Validation:** system risk/thesis controls plus trader-attested secured state. **Edge cases:** partial add fill remains in the same thesis; independent setup cannot be linked as an add. **Questions:** Q-A43 and Q-H05. **Versioning:** management-policy snapshot.

### 20. Screenshot and evidence policy

**Status:** UNRESOLVED. **Exact rule:** journal product requires timestamped evidence; exact required chart types/timeframes/late-upload policy is owner-dependent. **Purpose:** prevent hindsight reconstruction. **Evidence:** macro/HTF/intraday/pre-entry and management/review chart types. **Validation:** system timestamp/file validation; owner-defined completeness. **Questions:** Q-A14 and gate-specific questions. **Versioning:** evidence requirement snapshot.

## Global-rule operational register

This register makes each global rule separately implementation-reviewable. `Owner question` links to the blocking register; versioning effect is always prospective strategy-version policy snapshot.

| # / rule | Status; exact rule / purpose | Eligible vs invalid; evidence; timeframe/session | Validation / edge cases / owner question / versioning |
|---|---|---|---|
| 1 Instrument universe | OWNER-APPROVED explicit list; analysis-only symbols have no live permission. | XAUUSD, EURUSD, GBPUSD, USDJPY, USDCHF, USDCAD, AUDUSD, NZDUSD only; alias/venue evidence. | System allow-list; mapping Q-A01; new version. |
| 2 Trading sessions | OWNER-APPROVED labels Asia/London/New York AM; no clock windows. | Daily Plan/trader manually select labels; UTC/original time retained and IST displayed. No timestamp-based rejection; open trade may span sessions. | Attested classification + system analytics; no session-hour/DST question; new version. |
| 3 Trading days | UNRESOLVED; no personal calendar. | Owner-approved day/holiday only; trading date evidence. | System calendar + attestation. Q-A03; new version. |
| 4 Timezone/rollover | UNRESOLVED; no personal IANA/time. | Account-configured time evidence; cross-midnight edge. | System-calculated day. Q-A03; historical snapshot. |
| 5 News restrictions | SOURCE-BACKED DRAFT; Red Folder caution/avoidance. Prevent abnormal event entry. | Owner blackout compliant; event/time evidence. | Attested; open-trade event edge. Q-A04; new version. |
| 6 Spread/execution quality | UNRESOLVED; no threshold. Prevent cost-damaged R. | Approved spread/slippage only; quote/fill evidence. | Hybrid; fast market edge. Q-A05; new version. |
| 7 Max risk/trade | OWNER-APPROVED 2% normal/1% reduced; account basis unresolved. | Valid A/A+ permitted setup only; equity/stop/qty and selected reason evidence. | System risk + attested condition. Q-A36; snapshot. |
| 8 Riskier reduction | OWNER-APPROVED: contrarian/countertrend, high volatility, holiday/thin liquidity, funded drawdown proximity. `Other` unresolved. | Required 1%; multiple conditions remain 1%; no validity rescue. | Hybrid; record reasons. Q-A37 only; snapshot. |
| 9 Max daily risk | UNRESOLVED numeric cap. | Under owner cap; daily R/exposure. | System once set; rollover edge. Q-A07; new version. |
| 10 Max weekly risk | UNRESOLVED numeric cap. | Under owner cap; weekly R/exposure. | System once set; week-boundary edge. Q-A07; new version. |
| 11 Max total exposure | UNRESOLVED numeric cap. | Under owner cap; all open risk. | System once set; pending orders edge. Q-A07; new version. |
| 12 Max correlated exposure | UNRESOLVED grouping/cap; source flags USD correlation. | Under group cap; correlation-group evidence. | System once set; cross-asset edge. Q-A08; new version. |
| 13 Max trades/day | OWNER-APPROVED max two executed trade theses/day. | Add-on/partial add remains one thesis; separate qualified thesis counts; third historical is restricted violation. | System thesis count/linkage review; snapshot. |
| 14 Two losses | OWNER-APPROVED stop/reassess; no recovery third. | Two losses trigger pause/reassessment; streak evidence. | System + attested reassessment; “secured” exception Q-A12. |
| 15 Position sizing | UNRESOLVED formula, 2%/1% caps approved. | Formula-compliant; equity/entry/stop/value/cost evidence. | System candidate; partial fill Q-A09. |
| 16 Partial fills | OWNER-APPROVED treatment; partial fill counts as executed trade and three R values retained. | Actual fills recorded; executed/planned/max denominators. | System calculation; Q-A09. |
| 17 Add policy | OWNER-APPROVED planned, secured, max-2%-risk scaling; new-model requirement unresolved. | Separate leg records; no adds while losing/after invalidation; unplanned add is a violation. | System pre-add risk + trader attestation. Q-A43. |
| 18 Stop widening | UNRESOLVED. | Only owner-approved structural case; original/revised stop/reason. | Hybrid; never rewrites ER/PCR. Q-H05. |
| 19 Breakeven | UNRESOLVED trigger; source says contrarian may BE sooner. | Owner trigger only; event/structure evidence. | Hybrid; costs can make exit negative. Q-H05. |
| 20 Screenshot/evidence | UNRESOLVED exact set. | Required type/time per future gate rule; capture/upload metadata. | System file/time + attestation; late upload. Q-A13. |

**Reference correction:** Q-A09 is the position-size formula and Q-A36 is the account-risk basis; the current position-size gate references those questions. Daily thesis counting is owner-approved and has no outstanding Batch A question.

**Batch A question routing:** no session-time or DST question remains. Q-A37 is limited to the owner-selected `Other` reduced-risk condition; Q-A43 asks only whether every add-on needs a complete new entry model.

## Valid profile families

**Status:** OWNER-APPROVED support list; drawing rules UNRESOLVED. Supported: Previous Week POC/VAH/VAL; Previous Day POC/VAH/VAL; Fixed Range POC/VAH/VAL; Swing POC/VAH/VAL; Early Previous Day levels; relevant session highs/lows; and confluence with higher-timeframe supply/demand. The PDF supports Fixed Range profiles in consolidation/accumulation/distribution (pp. 46–50), and describes Swing profile anchor as swing high to swing low including wicks (p. 53). This anchor is SOURCE-BACKED DRAFT until owner approval. Exact range boundaries, session cutoffs, data source, overlap handling and touch tolerance are Q-C01–C06.

## Mandatory gate doctrine

All mandatory gates must pass before grading. The first No sets Gate Result `Rejected`; additional responses may complete diagnostics but never pass it. No general N/A exists. Each gate records rule version, timestamp, first/additional failures, diagnostic completion and lock state.

### Gate 1 — Macro direction sufficiently clear

**Status:** SOURCE-BACKED DRAFT. **Strategy purpose:** prevent technically attractive entries without directional context. **Yes means:** owner-approved minimum combination is present; source possible inputs are COT, sentiment extremes, open interest, seasonality, valuation, correlations and market drivers. **No means:** required approved input is absent/contradictory. **Evidence:** dated macro plan/data summary; exact sources unresolved. **Timeframe:** macro/higher timeframe, UNRESOLVED. **Validation:** trader-attested, future automation candidate. **Automatic rejection examples:** owner-defined mandatory macro layer missing; directly contradictory approved data. **Edge cases:** technical-only momentum setup. **Owner decisions:** Q-B01–B03.

### Gate 2 — Meaningful macro location

**Status:** SOURCE-BACKED DRAFT. **Purpose:** avoid taking a signal away from consequential location. **Yes:** location meets approved hierarchy; source candidates: monthly/weekly/3D/daily/12H/8H supply-demand, broken/retested structure, higher-timeframe profile confluence. **No:** no approved location or direct contradiction. **Evidence:** marked HTF chart/zone/profile. **Timeframe:** candidate list above; owner selects permitted set. **Validation:** trader-attested/hybrid. **Automatic rejection:** only tested/invalid zone when policy forbids it. **Edge cases:** multiple overlapping zones. **Questions:** Q-B04–B06.

### Gate 3 — Contrarian or momentum identified

**Status:** SOURCE-BACKED DRAFT. **Purpose:** prevent mixing opposite execution/risk logic. **Yes:** one archetype is named with supporting context. Contrarian source signals: positioning/sentiment extreme, valuation stretch, macro zone, weakening momentum, accumulation/distribution, possible reversal. Momentum signals: structural shift, established directional trend, participation, pullback into value, continuation. **No:** archetype missing or mixed without approved transition logic. **Evidence:** plan/archetype rationale. **Timeframe:** macro plus intraday. **Validation:** trader-attested. **Questions:** Q-B07–B08.

### Gate 4 — Archetype fits current conditions

**Status:** SOURCE-BACKED DRAFT. **Purpose:** stop countertrend or continuation labels being used in the wrong context. **Yes:** contrarian/momentum mandatory conditions approved by owner are satisfied. **No:** source conditions conflict, e.g. claimed momentum without structural/participation support. **Evidence:** macro/structure/profile record. **Validation:** hybrid future candidate. **Edge cases:** transition from extreme reversal into momentum. **Questions:** Q-B09–B10.

### Gate 5 — Intraday structure actionable

**Status:** SOURCE-BACKED DRAFT. **Purpose:** prevent execution during undefined range/noise. **Yes:** source describes at least two meaningful references: HL+HH bullish or LH+LL bearish, with clean reaction around key levels; structural shift may show momentum candles/volume expansion (pp. 172–173). **No:** no two references, unresolved range, or contradictory break. **Evidence:** annotated intraday chart. **Timeframe:** owner selects. **Validation:** trader-attested. **Edge cases:** wick-only break, trendline, false break. **Questions:** Q-C07–C10.

### Gate 6 — Market entered execution phase

**Status:** SOURCE-BACKED DRAFT. **Purpose:** prevent entry in preparation/consolidation. **Yes:** source says two clear points plus a break of structure can label execution phase (p. 173). **No:** preparation, temporary break fading into range, or no confirmed break. **Evidence:** chart marking preparation/execution. **Validation:** trader-attested. **Edge cases:** previous-week high/low break, close versus wick. **Questions:** Q-C11–C12.

### Gate 7 — Valid profile level reached

**Status:** OWNER-APPROVED family list; UNRESOLVED drawing/interaction rules. **Purpose:** ensure entry uses an approved, correctly drawn profile level. **Yes:** selected level belongs to approved family and drawing/interaction passes owner rules. **No:** unapproved family, incorrect anchor, or interaction outside tolerance. **Evidence:** profile screenshot with anchor/data source. **Validation:** hybrid. **Automatic rejection:** selected profile not in list. **Questions:** Q-C01–C06.

### Gate 8 — Complete entry model formed

**Status:** SOURCE-BACKED DRAFT. **Purpose:** avoid partial patterns/chasing. **Yes:** one approved EM1–EM4 sequence completes under its owner-approved criteria. **No:** missing required sequence/structure/level. **Evidence:** labelled C1/C2/C3 or swing/structure chart. **Validation:** trader-attested, future automation candidate. **Edge cases:** model overlap, candle ambiguity. **Questions:** Q-D01–G08.

### Gate 9 — Required confirmation candle closed

**Status:** SOURCE-BACKED DRAFT with conflict. **Purpose:** prevent entry before control is proven. **Yes:** exact approved model closure condition occurs. Source repeatedly says wait for closure/next-candle development (pp. 57, 63–64), but EM1 timing conflicts. **No:** signal only intrabar, or closure fails approved rule. **Evidence:** timestamped chart and candle sequence. **Validation:** hybrid future candidate. **Questions:** Q-D01–D09, Q-E05, Q-F04, Q-G01–G06.

### Gate 10 — Entry still near planned level

**Status:** UNRESOLVED. **Purpose:** prevent chase that degrades R/invalidates location. **Yes/No:** only owner-approved tolerance can decide. **Evidence:** planned level, actual entry, stop/R impact. **Validation:** system-calculated after tolerance chosen. **Questions:** Q-H01.

### Gate 11 — Structural invalidation clear

**Status:** SOURCE-BACKED DRAFT / model-specific UNRESOLVED. **Purpose:** prevent arbitrary/tight stops. **Yes:** stop sits beyond structure that disproves setup; source examples include EM1 wick/prior high/low, EM3 prior structure and EM4 flip wick. **No:** no identified anchor or stop tightened solely to manufacture 2R. **Evidence:** annotated stop anchor. **Validation:** trader-attested/hybrid. **Questions:** Q-H02–H03.

### Optional confluence — Realistic 2R available

**Status:** OWNER-APPROVED rule change. **Purpose:** preserve reward-to-risk evidence without making 2R a mandatory rejection gate. **Selected/Yes:** fixed 2:1 target is realistically available before meaningful opposing structure, supply/demand, liquidity, session restriction or unacceptable event risk; stop remains structurally valid. **Unselected/No:** record that 2R was not available or was not confirmed, but do not reject the setup on this fact alone. **Evidence:** entry/stop/2R target plus opposing-level map. **Validation:** system-calculated R where metadata exists plus trader-attested obstruction check. **Edge case:** holding beyond 2R/early exit. **Question:** Q-H04. **Versioning:** current versions store this as an optional confluence snapshot; historical versions may retain the former Gate 12 response unchanged.

### Gate 12 — Position size correct

**Status:** OWNER-APPROVED risk cap; formula/equity basis UNRESOLVED. **Purpose:** keep initial filled risk within approved 2%/1% policy. **Yes:** quantity matches approved formula and selected risk condition. **No:** size exceeds allowed risk or calculation data absent. **Evidence:** account equity/risk %, entry/stop/tick value/fees/quantity. **Validation:** future system-calculated. **Questions:** Q-A09 (position-size formula) and Q-A36 (approved account-equity basis).

### Gate 13 — Total exposure within limit

**Status:** UNRESOLVED numerical limits. **Purpose:** prevent total/correlated concentration. **Yes:** approved total/correlation limit passes. **No:** limit exceeded or cannot calculate. **Evidence:** open positions/exposure grouping. **Validation:** future system-calculated. **Questions:** Q-A08–A11.

### Gate 14 — Emotional readiness

**Status:** SOURCE-BACKED DRAFT. **Purpose:** block revenge/FOMO/impulsive risk. **Yes:** trader attests no revenge intent, FOMO, recovery urge, boredom/urgency, post-win risk escalation; will honour stop/2R; two-loss rule status passes. Source checklist asks whether trade is fear versus structure, follows macro/criteria/2-2-2, and would be taken tomorrow (p. 216). **No:** any owner-defined blocking answer. **Evidence:** checklist and streak state. **Validation:** trader-attested. **Question:** Q-I01–I03.

## Entry-model doctrine

### EM1 — Double Wick Confirmation

**Status:** SOURCE-BACKED DRAFT; sequence conflict unresolved. **Purpose:** confirm rejection/control at key POC/VAH/VAL profile level. **Suitable archetype/bias:** not owner-approved; source describes reactions at key levels. **Location/profile:** POC/VAH/VAL, including PW examples. **Structure/candles:** source says first reaction touches/flips/leaves wick; retest gives second wick/flip; another description says third candle confirms control. **Closure/entry:** source alternately states enter after second closure/flip, on third-candle structural break, or after break of first candle. **Stop/invalidation:** wick or prior high/low (source); exact anchor unresolved. **Target:** liquidity/relevant key level, subject to owner-approved realistic 2R. **Management:** unresolved. **Examples/mistakes:** premature entry before closure, invalid/tight stop, unsupported 2R. **Blocking decisions:** Q-D01–D09.

### EM2 — Internal Swing Confirmation

**Status:** SOURCE-BACKED DRAFT. **Purpose:** refine a major-level reaction with internal swing profile and lower-timeframe confirmation. **Location:** mitigate major POC/VAH/VAL; form LTF swing; profile completed swing; return to LTF POC/VAH/VAL. **Structure/candles:** source calls for LTF double-wick/flip, and shows aggressive POC entry versus waiting for expansion (pp. 58, 64). **Closure/entry:** source example waits for third 15M candle flip/break; exact rule unresolved. **Stop/target/management:** internal prior candle/structure source example; owner approval required. **Blocking decisions:** Q-E01–E07.

### EM3 — Confirmation of Internal Structure

**Status:** SOURCE-BACKED DRAFT. **Purpose:** momentum participation after mitigation and internal break. **Archetype:** source calls it momentum play. **Location/profile:** approved key POC/VAH/VAL mitigated. **Structure:** consolidation → manipulation (false breakout into level) → expansion; break of the high/low responsible for mitigation signals participation (pp. 59–66). **Closure/entry:** break/retest and candle requirement unresolved. **Stop:** source example uses prior highs; exact rule unresolved. **Target:** source example targets prior day liquidity; owner 2R rule governs permission. **Blocking decisions:** Q-F01–F07.

### EM4 — Continuation Higher / Three-Candle Flip

**Status:** SOURCE-BACKED DRAFT. **Official working name:** source title “Continuation Higher”; product working label “Three-Candle Flip.” Preserve both until owner chooses. **Purpose:** continuation after a liquidity trap/high-volume alternative to EM1. **Bias:** source requires directional bias already clear. **Location/profile:** PD POC, weekly VAH/VAL, fixed VAH examples. **Candle sequence:** C1 touches/hesitates; C2 begins flip; C3 confirms direction (pp. 60–61). **Entry:** source says not trap candle, but next confirming candle; stop beneath flip wick. Exact candle body/wick, high-volume measure, entry timing and stop anchor unresolved. **Blocking decisions:** Q-G01–G08.

## Grade rubric after gate pass

All active mandatory gates must pass. Each category receives 1 (valid/acceptable) or 2 (strong/aligned); no zero is available. C=6, B=7–8, A=9–10, A+=11–12; Rejected if any mandatory gate fails. Optional confluences, including realistic 2R, may influence risk/tradeability judgment but cannot compensate for a failed mandatory gate and cannot independently reject the setup.

| Category | 1 — SOURCE-BACKED DRAFT distinction | 2 — SOURCE-BACKED DRAFT distinction | Owner threshold needed |
|---|---|---|---|
| Macro fundamentals | Approved minimum bias evidence is present but ordinary/mixed strength. | Multiple approved layers clearly align with no material contradiction. | Mandatory layers and conflict handling. |
| HTF location | Approved location exists but tested/weaker/less efficient. | Fresh, clear, aligned macro zone/profile confluence. | Timeframes, tested-zone rules, freshness. |
| Archetype | Named and broadly supported. | Clearly supported by approved contrarian/momentum conditions. | Mandatory archetype evidence. |
| Intraday structure | Valid actionable references/break, but less clean. | Clear execution-phase structure with decisive alignment. | Timeframe, close/wick, false-break definition. |
| Entry model | Complete approved sequence with ordinary quality. | Textbook sequence at intended level with strong confirmation. | Exact EM doctrine. |
| Risk/tradeability | Structural stop and policy compliance; 2R may be absent or weaker as optional context. | Efficient valid stop, clear optional 2R beyond obstacles, controlled exposure. | Chase/stop/exposure thresholds. |

## Approval record

- [x] Phase 0 product policies inserted as OWNER-APPROVED.
- [ ] All blocking questions answered by owner.
- [ ] Exact 15 gates and EM1–EM4 operational criteria approved.
- [ ] Strategy version may be marked Approved.
