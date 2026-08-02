# Strategy Owner Questions — Blocking Doctrine Register

## How to use

Answer each `Blocking` question before the relevant strategy rule can be marked OWNER-APPROVED. Options are source-backed alternatives, not recommendations unless stated. Record answer, date, strategy version, and any example/evidence supplied. Source hierarchy is in [STRATEGY_RULEBOOK.md](STRATEGY_RULEBOOK.md).

| Field | Meaning |
|---|---|
| Recommended default | Only a source-backed operational default where the source supports one; it is never owner approval. |
| Affected documents | Rulebook plus implementation-facing documents that must be revised after answer. |

## Batch A — Global operating rules

| ID | Question / why it matters | Source-backed options / recommended default | Owner answer | Status / affected documents |
|---|---|---|---|---|
| Q-A01 | Which exact instruments, venues and symbol aliases are permitted? Risk/CSV conversion cannot be safe without this. | List owner universe; War Map examples include futures-like symbols but do not define personal universe. | [ ] | Blocking — Rulebook, Data Dictionary, Domain Model. |
| Q-A02 | **Resolved:** which session labels are permitted? | Asia, London and New York AM; no fixed entry windows or DST treatment. | Owner-approved. | Resolved — Rulebook, Plan, Gate, IA. |
| Q-A03 | Which trading days/holidays are valid and what is the trading-day rollover timezone/time? | No source personal rule. | [ ] | Blocking — Rulebook, Accounts, Calendar, analytics. |
| Q-A04 | What exact news restriction applies: event severity, blackout before/after, and handling for an already-open trade? | Source advises caution/avoidance around Red Folder events. | [ ] | Blocking — Rulebook, Gate 12, Plan. |
| Q-A05 | What spread/slippage/fee condition blocks an entry or reduces risk? | No threshold in source. | [ ] | Blocking — Gate 10/12, Risk policy. |
| Q-A06 | **Resolved in part:** which named conditions require 1%? | Contrarian/countertrend, high volatility, holiday/thin liquidity and funded-account drawdown proximity are approved. | Owner-approved; `Other` remains Q-A37. | Resolved except Q-A37 — Gate 13, Analytics, Rulebook. |
| Q-A07 | Set maximum daily risk, weekly risk, total exposure and maximum trades/day. | No source numbers; 2% per trade is approved only. | [ ] | Blocking — Gate 14, Accounts, Analytics. |
| Q-A08 | How are correlated exposures grouped and limited (e.g., EURUSD/GBPUSD USD exposure)? | Source says such positions may be one USD play; no numeric policy. | [ ] | Blocking — Gate 14, Domain Model. |
| Q-A09 | What is the exact position-size formula and which costs are included before entry? | Use account risk, entry/stop, tick/pip/contract value, fees; no personal formula source. | [ ] | Blocking — Gate 13, Metric cases. |
| Q-A10 | For partial fills, does Executed R use only initially filled quantity as currently designed, and when is Planned-capital R mandatory? | Product policy distinguishes three Rs; owner confirms display/use convention. | [ ] | Blocking — Analytics, Metric cases. |
| Q-A11 | **Resolved in part:** are adds allowed and what baseline controls apply? | Planned before first entry; only when secured/not losing; each leg recorded; total worst-case risk ≤2%; no fixed leg cap; no daily-count increase. | Owner-approved; new-entry-model requirement remains Q-A43. | Resolved except Q-A43 — Management, Gate 14. |
| Q-A12 | May a third trade occur after two losses only when “secured”; if so, define secured objectively and require a pre-session limit? | PDF p. 212 permits continuation if secured; owner rule prohibits recovery-driven third trade. | [ ] | Blocking — Gate 15, Daily Plan, State Model. |
| Q-A13 | Which screenshots are mandatory at plan, gate, entry, management and review, and may a late upload ever count as pre-entry evidence? | Product requires timestamped evidence; exact set is personal. | [ ] | Blocking — Evidence policy, Page Specs. |

### Batch A approved-decision application

The following owner decisions resolve part of Batch A. Remaining questions below are still blocking.

| Decision | Applied answer | Remaining blocker |
|---|---|---|
| A01 instruments | XAUUSD, EURUSD, GBPUSD, USDJPY, USDCHF, USDCAD, AUDUSD, NZDUSD are live-execution only. Analysis-only symbols are separate. | Exact broker/venue aliases for each instrument. |
| A02 sessions | Asia, London and New York AM are manually selected planning/analytics labels. UTC/original timestamps are retained and IST is displayed; no clock window, DST policy or timestamp-based rejection applies. | None. |
| A03 normal risk | 2% of the account-risk basis. | Choose current balance, current equity or start-of-day equity. |
| A04 reduced risk | 1% is required for contrarian/countertrend, high volatility, holiday/thin liquidity or funded-drawdown proximity; valid A/A+ only, with a recorded reason. | Define or remove `Other`. |
| A05 daily trade limit | Two executed trade theses/day; a partial fill starts a thesis, no-fill cancellation does not. Planned add-ons remain one thesis; unrelated setups may not be linked to bypass the limit. | None. |
| A06 additions | Adds must be planned, secured/not losing, pre-risk-checked and ≤2% total worst-case risk; each is a separate leg. Unplanned adds are violations; no fixed leg cap. | Whether every add requires a complete new entry model. |

### Remaining Batch A blocking questions

| ID | Question / why it matters | Source-backed options / recommended default | Owner answer | Status / affected documents |
|---|---|---|---|---|
| Q-A36 | Which account-risk basis sets 2%/1%: current balance, current equity, or start-of-day equity? | No personal basis approved. | [ ] | Blocking — Gate 13, R/risk calculator. |
| Q-A37 | Define the owner-selected additional “Other” reduced-risk condition, or remove the category. | Contrarian/countertrend, high volatility, holiday/thin liquidity and funded-drawdown proximity are already approved. | [ ] | Blocking — Gate 13, risk policy. |
| Q-A43 | Must every addition have a complete new entry model? | No owner doctrine. | [ ] | Blocking — Gate 8/9, add policy. |

## Batch B — Macro and location (Gates 1–4)

| ID | Question / why it matters | Source-backed options / recommended default | Owner answer | Status / affected documents |
|---|---|---|---|---|
| Q-B01 | What minimum combination defines a clear macro bias? | COT, sentiment, OI, seasonality, valuation, correlations, market drivers; source does not require all. | [ ] | Blocking — Gate 1, grade rubric. |
| Q-B02 | Can a technical-only momentum bias pass Gate 1? If yes, list required technical/participation evidence. | Source describes structural shift + volume/OI; no personal exception. | [ ] | Blocking — Gates 1/3/4. |
| Q-B03 | Which macro layers are mandatory versus optional, and how does contradiction resolve? | Owner may rank layers; source provides no fixed hierarchy. | [ ] | Blocking — Gate 1, analytics. |
| Q-B04 | Which macro-location timeframes are permitted: Monthly, Weekly, 3D, Daily, 12H, 8H, other? | All listed as candidate source/product locations. | [ ] | Blocking — Gate 2, grade rubric. |
| Q-B05 | How are fresh, tested, broken and retested zones defined and graded? | Source supports zones/structure but no numeric test rule. | [ ] | Blocking — Gate 2, score 1/2. |
| Q-B06 | Is higher-timeframe profile confluence mandatory, optional, or prohibited for each permitted location? | Source supports combined macro S/D + lower-timeframe volume. | [ ] | Blocking — Gates 2/7. |
| Q-B07 | For contrarian, which conditions are mandatory: positioning/sentiment extreme, valuation, macro zone, weakening momentum, accumulation/distribution, reversal structure? | Source lists all as supporting concepts. | [ ] | Blocking — Gates 3/4. |
| Q-B08 | For momentum, which are mandatory: macro shift, trend, volume, OI/participation, pullback into value, continuation structure? | Source lists all as supporting concepts. | [ ] | Blocking — Gates 3/4. |
| Q-B09 | What objective event changes contrarian to momentum, and can both be marked during transition? | Source describes extremes ending, structural shift and participation; no threshold. | [ ] | Blocking — Gates 3/4, analytics. |
| Q-B10 | **Resolved:** does a contrarian/countertrend trade require 1% risk? | Yes. Contrarian/countertrend is an owner-approved reduced-risk condition; all other validity and A/A+ permission rules still apply. | Owner-approved. | Resolved — Risk policy, Gate 13. |

## Batch C — Intraday structure and profiles (Gates 5–7)

| ID | Question / why it matters | Source-backed options / recommended default | Owner answer | Status / affected documents |
|---|---|---|---|---|
| Q-C01 | Define anchor/start/end rules for Previous Week/Day, Fixed and Swing profiles. | Swing source: high-to-low including wicks; Fixed source: consolidation structure. | [ ] | Blocking — Gate 7, Data Dictionary. |
| Q-C02 | Which data source applies: futures, broker feed, or instrument-specific mapping? | No personal source rule. | [ ] | Blocking — Gate 7, import. |
| Q-C03 | Is wick touch sufficient for a profile interaction, or is close/hold/retest required? | Source gives reaction examples; no universal threshold. | [ ] | Blocking — Gate 7, EMs. |
| Q-C04 | What maximum distance from a profile level remains valid, and how are overlapping levels ranked? | No threshold. | [ ] | Blocking — Gates 7/10. |
| Q-C05 | Define Early Previous Day and relevant session high/low anchors. | Owner-approved families, no drawing rule. | [ ] | Blocking — Rulebook. |
| Q-C06 | Which intraday timeframes define structure and execution phase? | Source examples span 1H/30M/15M; no personal set. | [ ] | Blocking — Gates 5/6. |
| Q-C07 | Is a wick break sufficient, or must a candle close beyond the structural point? | Source says break of structure; closure threshold unclear. | [ ] | Blocking — Gates 5/6/9. |
| Q-C08 | Are trendlines permitted as structure confirmation? | Source describes reference points, not trendline rule. | [ ] | Blocking — Gate 5. |
| Q-C09 | How is a false break recognised and when does it reset preparation? | Source says temporary break can fade back into range. | [ ] | Blocking — Gates 5/6. |
| Q-C10 | Is previous-week high/low break sufficient for execution phase, or must it pair with two points and close? | Source calls it a reliable marker, not universal sole test. | [ ] | Blocking — Gate 6. |

## Batch D — EM1 Double Wick Confirmation

| ID | Question / why it matters | Source-backed options / recommended default | Owner answer | Status / affected documents |
|---|---|---|---|---|
| Q-D01 | Define C1, C2 and C3 precisely for bullish and bearish EM1. | Source has second-flip, third-control and structural-break variants. | [ ] | Blocking — EM1, Gate 8/9. |
| Q-D02 | Must C2 sweep below/above C1’s wick, or is a second rejection wick enough? | Source says price wicks again/flips; no exact sweep rule. | [ ] | Blocking — EM1. |
| Q-D03 | Must a candle close inside the prior candle’s high-low range; if yes, which candle/range? | Not consistently defined in source. | [ ] | Blocking — EM1. |
| Q-D04 | Which candle must close in intended direction, and is same-direction C1/C2 valid? | Source examples differ. | [ ] | Blocking — EM1. |
| Q-D05 | Is C3 required, optional, or prohibited after C2 closure? | p.56 third-candle control conflicts with p.57 second-closure entry. | [ ] | Blocking — EM1. |
| Q-D06 | May a confirming candle sweep both sides, or does that invalidate EM1? | No exact source rule. | [ ] | Blocking — EM1. |
| Q-D07 | Does a doji qualify, and does a close beyond the level invalidate the model? | No exact source rule. | [ ] | Blocking — EM1. |
| Q-D08 | Is entry on close, break of C1, retracement, or limit order? | Source describes all/ambiguous variants across pp.57–69. | [ ] | Blocking — EM1, Gate 10. |
| Q-D09 | Must both wick tests touch the exact profile level, and which wick/prior swing anchors the stop? | Source says key-level interaction and wick/prior high/low stop. | [ ] | Blocking — EM1, Gate 11. |

## Batch E — EM2 Internal Swing Confirmation

| ID | Question / why it matters | Source-backed options / recommended default | Owner answer | Status / affected documents |
|---|---|---|---|---|
| Q-E01 | What completes an internal swing and what exact two anchor points draw its profile? | Source example: first touch to internal swing high; general text says LTF swing. | [ ] | Blocking — EM2. |
| Q-E02 | Which LTF is required for each execution timeframe? | Source example 1H→15M; no universal mapping. | [ ] | Blocking — EM2. |
| Q-E03 | Is LTF POC always valid; when may VAH/VAL substitute? | Source says VAH/VAL can be used for significantly aggressive move. | [ ] | Blocking — EM2. |
| Q-E04 | Is aggressive entry from POC allowed, or is expansion/wait mandatory? | Source diagram distinguishes A aggressive and B wait for expansion. | [ ] | Blocking — EM2. |
| Q-E05 | Does EM2 inherit EM1 candle doctrine unchanged, including C3? | Source says same double-wick strategy; exact inheritance unclear. | [ ] | Blocking — EM2. |
| Q-E06 | Is entry at third-candle flip/break required or can it be a retracement/limit? | Source p.64 example enters at flip after break. | [ ] | Blocking — EM2. |
| Q-E07 | What stop anchor/invalidation applies to EM2? | Source says previous internal candle in example. | [ ] | Blocking — EM2. |

## Batch F — EM3 Confirmation of Internal Structure

| ID | Question / why it matters | Source-backed options / recommended default | Owner answer | Status / affected documents |
|---|---|---|---|---|
| Q-F01 | What minimum consolidation defines EM3? | Source requires consolidation around/above/below key level, no count/size. | [ ] | Blocking — EM3. |
| Q-F02 | What exactly qualifies as manipulation and must it sweep liquidity? | Source: false breakout into key level; liquidity both sides concept. | [ ] | Blocking — EM3. |
| Q-F03 | Which high/low is “responsible for mitigation” and must it be broken by close? | Source refers to internal high/low, no exact mapping. | [ ] | Blocking — EM3. |
| Q-F04 | Enter on direct break, close, or retest? | Source says participate in break; retest undefined. | [ ] | Blocking — EM3. |
| Q-F05 | Does a false break invalidate immediately or can it reform? | No exact source policy. | [ ] | Blocking — EM3. |
| Q-F06 | Is EM3 always momentum, and what macro/archetype confirmation is mandatory? | Source calls momentum play; owner threshold absent. | [ ] | Blocking — EM3, Gates 3/4. |
| Q-F07 | Where is stop placed: manipulation extreme or internal structure, and target/management rule? | Source examples vary. | [ ] | Blocking — EM3, Gate 11/12. |

## Batch G — EM4 Three-Candle Flip

| ID | Question / why it matters | Source-backed options / recommended default | Owner answer | Status / affected documents |
|---|---|---|---|---|
| Q-G01 | Choose official working name: Continuation Higher, Three-Candle Flip, or another name. | Source title vs product label differ. | [ ] | Blocking — EM4 nomenclature. |
| Q-G02 | Define C1 hesitation body/wick rule. | Source says touches level/hesitates. | [ ] | Blocking — EM4. |
| Q-G03 | Define C2 “begins flip” rule and C3 required close. | Source says C2 begins, C3 confirms direction. | [ ] | Blocking — EM4. |
| Q-G04 | May C3 be oversized or sweep both sides? | No source threshold. | [ ] | Blocking — EM4. |
| Q-G05 | Entry on C3 close, next-candle confirmation, or retracement? | Source says next after trap candle confirms flip; exact timing unclear. | [ ] | Blocking — EM4. |
| Q-G06 | What measures high-volume condition, and when is EM4 preferred over EM1? | Source calls EM4 alternative in high volume. | [ ] | Blocking — EM4. |
| Q-G07 | Exact stop anchor: flip wick, trap wick, or another structure? | Source says beneath flip wick. | [ ] | Blocking — EM4. |
| Q-G08 | Required directional-bias evidence and valid location/profile families? | Source demands clear prior bias and cites PD/weekly/fixed levels. | [ ] | Blocking — EM4. |

## Batch H — Stops, targets, management and proximity

| ID | Question / why it matters | Source-backed options / recommended default | Owner answer | Status / affected documents |
|---|---|---|---|---|
| Q-H01 | Define chase tolerance: ticks/pips/%/ATR/stop fraction/lost planned R/candle location. | No threshold; source says do not rush and skip if RR is unfavourable. | [ ] | Blocking — Gate 10. |
| Q-H02 | Map permitted stop anchor by EM1–EM4: confirmation wick, manipulation extreme, swing, profile, S/D boundary, structural point. | Source offers different examples, not one rule. | [ ] | Blocking — Gate 11. |
| Q-H03 | When is a structurally valid stop too wide, and may it be tightened? | Owner prohibits manufacturing 2R with invalid tight stop. | [ ] | Blocking — Gate 11/12. |
| Q-H04 | Is target fixed exactly at 2R, and are holds beyond/early exits allowed under a separate management plan? | Owner says standard fixed 2:1; source discusses later optimisation/run/early exit. | [ ] | Blocking — Gate 12, management. |
| Q-H05 | Define additions, stop widening and breakeven triggers by archetype/model. | Source says contrarian may BE sooner; momentum may allow development. | [ ] | Blocking — management, Maximum-risk R. |

## Batch I — Emotional readiness

| ID | Question / why it matters | Source-backed options / recommended default | Owner answer | Status / affected documents |
|---|---|---|---|---|
| Q-I01 | Which answers automatically block Gate 15: revenge, FOMO, recovery intent, boredom, urgency, post-win size increase, unwillingness to honour stop/2R? | Source checklist supports each as a review concept; no automatic blocker list. | [ ] | Blocking — Gate 15. |
| Q-I02 | What reset/reassessment is required after Gate 15 No or two-loss stop? | Source says step away/reassess; exact duration/process absent. | [ ] | Blocking — Plan, Review. |
| Q-I03 | Is “would take this exact setup tomorrow” mandatory pre-entry, post-trade only, or both? | Source uses it as emotional checklist; product uses post-trade question. | [ ] | Non-blocking — Gate 15, Review. |
