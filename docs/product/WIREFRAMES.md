# Low-Fidelity Wireframe Descriptions

These are structural wireframes, not production UI or branded assets. `[]` is a control/card, `|` divides desktop columns, and badges always have text labels.

## Dashboard

```text
+Sidebar+--------------------------- Dashboard --------------------------------+
| Dashboard | [Date] [Accounts] [Valid only] [R v] [Customize]               |
| Daily Plan| [Weekly objective: No early entry before candle close]           |
| Gate      | [Total R] [Expectancy] [Execution accuracy] [Valid trade %]      |
| Trades    | [Current DD] [A/A+ adherence] [Most expensive mistake]           |
| Calendar  | [Quality by grade chart/table] | [Recent trade list]             |
| Strategy  | [Calendar]                | [Missed A/A+ / Correct no-trade]     |
+----------+-------------------------------------------------------------------+
```

## Daily Plan and Mandatory Gate

```text
DAILY PLAN
[Date][Account][Session][Readiness][Risk][Objective] [Save draft][Activate]
Instrument tabs: [Gold] [EURUSD] [+ Add]
| Bias & drivers | zones/profiles | Scenario A / B / C | Attachments |

FAST GATE
[Plan: Gold / London]  Progress 08/15  [Review mode]
01 Macro clear?       [Yes] [No]       09 Confirmation closed? [Yes] [No]
02 Macro location?    [Yes] [No]       …
Persistent footer: [Save draft] [Rejected: 1 failed gate] / [Continue to score]
```

## Setup Grading and Trade Entry

```text
SETUP GRADING — all gates passed
Macro [0 - 1 - 2]   HTF location [0 - 1 - 2]    Archetype [0 - 1 - 2]
Structure [0 - 1 - 2]  Entry model [0 - 1 - 2] Risk [0 - 1 - 2]
Calculated: 10/12 A (locked on trade creation) | Scores: [1/2] × 6 | Confidence: [High v]
[Back] [Lock qualification and create trade]

TRADE ENTRY
Context (locked): [A][Qualified][EM2][Contrarian][Strategy v3]
| Identification | Entry / Stop / Target / Size / Fees | Evidence |
| Thesis          | Planned R / Exposure / order type    | exact pre-entry |
[Save planned] [Create active trade]
```

## Active Trade and Review

```text
ACTIVE TRADE  GOLD long  | Original plan 2.0R | Current open 0.50 | Status: Active
[Move stop] [Breakeven] [Partial] [Add/reduce] [Target] [Close]
Timeline: 09:31 entry • 10:02 partial • 10:15 stop moved (unplanned) • …
Event drawer: Action [v] Time [ ] Price [ ] Qty [ ] Reason [ ] Screenshot [ ]

POST-TRADE REVIEW
“Would you take this exact trade again without knowing the outcome?” [Yes][No]
[Outcome] [Classification]   Execution [A B C F]  Management [A B C F]
Guided questions | Primary mistake [ ] Cost R [ ] Prevention [ ]
Before | During | After | Annotated lesson
[Save incomplete] [Complete review]
```

## Calendar, Strategy, and Library

```text
CALENDAR [Month][Week] [Filters]
Mon  Tue  Wed  Thu  Fri
 1   2✓  3✕  4•  5↗     Legend: ✓ valid / ✕ invalid / • no-trade / ↗ missed
Day drawer: Plan | Trades | rejected | R | execution | mistake | reflection

MY STRATEGY
[Overview][Macro][Technical][EM1][EM2][EM3][EM4][Risk][Mistakes][Versions]
Version v3 Active [Create revision]
Rule: required profile level… Evidence examples [cards]

SETUP LIBRARY [Collection][Search][Filter][Compare]
[image][A+][EM1][Gold][+2.0R][A execution] [lesson]
```

## Analytics, Weekly Review, Accounts

```text
ANALYTICS [Date][Account][Valid / All]  N=42  [Metric definition]
[Total R] [Expectancy] [Mistake cost]
Breakdown [Entry Model v]  Chart with accessible table below

WEEKLY REVIEW — 28 Jul–1 Aug
Summary | Quality | Mistakes | Missed | Reflection | Next objective
[Publish review]

ACCOUNTS & SETTINGS
[Accounts][Import/export][Backup][Preferences][Privacy]
Account card: Limits / Timezone / Rollover / Active [Edit] [Archive]
```

## Responsive rules

- Desktop: persistent context/sidebar; two- or three-column planning and trade-detail workspaces.
- Tablet: sidebar collapses; plan and trade sections stack after key status/risk context.
- Mobile: fast gate, active-trade event, screenshots, review, and calendar agenda are first-class; analytics begins with concise KPI and accessible table. Complex strategy editing uses section screens, not compressed grids.

## Additional state and workflow wireframes

```text
ONBOARDING
Step 2 of 4  [Profile ✓] [Account •] [Strategy ○] [Ready ○]
Account name [................]  Currency [USD v]
Timezone [Asia/Kolkata v]      Rollover [00:00]
[Back] [Save & continue]      Status: saved locally / not yet synced

EMPTY DASHBOARD
No completed trades yet. Your improvement system starts before the first entry.
[Create today's plan] [Complete strategy rulebook]  [Import executions]
Review backlog: 0 | Active plan: none | Weekly objective: none
```

```text
REJECTED SETUP DETAIL
Status: ⨯ Rejected on gate 09 at 10:14  Diagnostics: 9/15
Failed: Confirmation candle closed?  [No]  Evidence [chart.png]
Other answered gates [expand]  Remaining diagnostic gates [optional]
[Save for study] [Record correct no-trade] [Take rejected setup anyway]

TAKE REJECTED SETUP ANYWAY
⚠ This trade will permanently be classified “Restricted setup taken anyway”.
Failed gates: 09 confirmation candle; 12 2R availability
Override reason [...........................................] *
[Cancel] [I understand — continue to trade entry]
```

```text
CORRECT NO-TRADE                         MISSED SETUP
Instrument [Gold v]                      Instrument [Gold v]
Reason [News restriction v] *            Reason [Away from desk v] *
Provenance [Real-time v] *               Provenance [Hindsight v] *
Correctness [Pending v]                  Intended grade [A+ v]
Evidence [+ attach]                      Estimate R [3.0] Basis [........] *
[Record decision]                        [Record missed setup]
```

```text
STRATEGY REVISION / COMPARE
v3 Published                         v4 Draft
Gate 09: candle close required       Gate 09: [edited criterion]
EM2 avoid condition                  EM2 [new condition]
Impact: future plans only; 47 historic trades retain v3
Change summary [........................................] *
[Save draft] [Validate] [Publish v4]

AUDIT HISTORY
[Entity: Trade T-104] [Action v] [Date range]   [Export permitted events]
10:14 Owner  Gate response set to No  Reason: —
10:16 Owner  Rejected override created Reason: “…”
10:19 Owner  Trade created              Original snapshot [View]
```

```text
CSV IMPORT — MAP → PREVIEW → CONFLICTS → RESULT
[File: broker.csv] Account [Funded v] Mapping [MT5 v] [Validate]
CSV column              Journal field                 Status
Symbol                  Instrument / alias             ✓
Open Time               Entry timestamp                ✓
Profit                  Broker net P&L                 ! verify currency
Conflict row 18: duplicate T-44  [Skip] [Merge] [Correction] *
[Back] [Import 124 accepted rows]
Result: 122 imported • 2 exceptions [Open results] • context missing badge
```

```text
OFFLINE FAST GATE                         MOBILE FAST GATE
⚠ Offline — 8 answers saved on device     08 / 15  Gold • London
Gate 09 [No] queued; do not close          Complete entry model formed?
[Retry sync] [Export local draft]          [Yes]             [No]
                                               [Save draft]  [Review mode]

MOBILE ACTIVE EVENT                        MOBILE REVIEW
Gold Long • Active • Open 0.50             Trade closed • Review 2/4
[BE] [Partial] [Close]                     Would take again? [Yes][No]
Action [Partial v] Qty [0.25]              Execution grade [A][B][C][F]
Price [ ] Reason [ ] [Save event]          [Save incomplete] [Next]
```
