# Competitor Review

## Review method and evidence boundary

This review was completed on 2026-08-01 using publicly accessible pages and search-indexed official help content. It does **not** claim access to authenticated product areas. “Observed” means explicit public page/help content; “inferred” means a reasonable design implication and is labelled as such.

| Product | Public access result | Evidence boundary |
|---|---|---|
| TradeZella | Homepage, public feature page, and help articles accessible. | Directly observed broad product claims and documented page structure; no private account tested. |
| DT Journal | Supplied `/journal` URL did not return a usable public product page in this review. | No feature claims made; screenshots or a public walkthrough are required. |
| TradeArt | Supplied app URL resolved without meaningful public UI content. | No feature claims made; authentication/product tour is required. |
| Tradesake staging | Supplied staging URL was inaccessible from this review environment. | No feature claims made; owner-provided access or screenshots are required. |

## Direct observations

### TradeZella

- The public site presents automated/manual import, multiple accounts, analytics dashboards, calendar, advanced filtering, strategy/playbooks, trade attachments/screenshots, notes, and replay/backtesting as product areas. [Feature page](https://www.tradezella.com/trading-journal)
- Its official getting-started guide describes a dashboard home, left-side navigation, top-level filters, a trade page with Stats, Playbook, Execution, and Attachments, plus chart, notes, day notes, and running daily P&L. [Help guide](https://help.tradezella.com/en/articles/13863136-getting-started-with-tradezella)
- Official help describes a configurable calendar widget with monthly, weekly, and daily information. [Calendar article](https://help.tradezella.com/en/articles/9689020-advanced-calendar-widget-in-tradezella-dashboard)
- The public product site also markets features deliberately outside this project’s first release: broker sync, replay, backtesting, AI, community, and prop-firm sync. [Homepage](https://www.tradezella.com/)

## Comparison

| Feature/pattern | TradeZella | DT Journal | TradeArt | Tradesake | Proposed journal | Adopt | Avoid | Why |
|---|---|---|---|---|---|---|---|---|
| Dashboard and KPI widgets | Observed, configurable | Not observed | Not observed | Not observed | Opinionated R-first dashboard; configurable later | Filtered KPI/widget concept | KPI overload | Improvement signals must lead vanity P&L. |
| Calendar/day review | Observed monthly/weekly/daily calendar | Not observed | Not observed | Not observed | Quality-coded day states + plan/review evidence | Calendar as navigation | Red/green-only P&L | A day can be a valid loss or correct no-trade. |
| Trade log/detail | Observed stats/playbook/executions/attachments | Not observed | Not observed | Not observed | Immutable original plan, legs, events, review | Deep linked detail | One flat trade form | Management and evidence need temporal records. |
| Playbooks/strategy | Observed strategies and playbook criteria | Not observed | Not observed | Not observed | Versioned LTA macro/technical rules + EM1–4 | Rule-to-trade association | Rewriting historical rules | Evaluation must reflect the rule version known at entry. |
| Screenshots/notes | Observed attachments, charts, notes | Not observed | Not observed | Not observed | Timestamped before/during/after/lesson evidence | Trade-linked evidence | Undated gallery | Prevents reconstructed rationale. |
| Import/sync | Observed broker/manual import emphasis | Not observed | Not observed | Not observed | Manual entry and staged CSV mapping only | Import mapping, dedupe | Sync dependency in v1 | Product needs strategy context first. |
| Analytics | Observed broad reports and filtering | Not observed | Not observed | Not observed | Transparent formula + N + valid-only/all filter | Segmentation/filter pattern | Opaque composite score | User must understand denominator and quality layer. |
| Live pre-entry enforcement | Not directly observed in accessible material | Not observed | Not observed | Not observed | 15-gate fast/review flow, grade lock and override record | None—differentiator | Soft optional checklist | This is the decisive product need. |
| Management diagnosis | Execution data observed; detailed rule-based management not established | Not observed | Not observed | Not observed | Event timeline with planned/unplanned reasoning and R effect | Execution timeline idea | Overwriting initial plan | Separates management quality from outcome. |

## Strengths, weaknesses, and implications

| Area | Observed strength/pattern | Limitation or uncertainty | Product implication |
|---|---|---|---|
| TradeZella breadth | Mature-looking coverage across import, analysis, playbooks, calendar, and review. | Public pages market many areas; private interaction details were not tested. | Borrow the breadth of review surfaces, not its layout or wording. |
| Strategy linkage | Playbook association and criteria are documented publicly. | No public evidence of LTA-specific mandatory gate lock/audit semantics. | Build typed rules, pre-entry evidence, and historical version retention. |
| Navigation | Dashboard + navigation + filters are documented. | Exact responsive/mobile implementation unavailable publicly. | Use a compact sidebar, global filters, and intentional mobile task flows. |
| Feature scope | Automation/replay/AI are established category expectations. | They add complexity and may distract from first-value discipline. | Defer them; make manual process strong first. |

## Accessibility and mobile observations

No accessibility conformance statement or public keyboard/screen-reader demonstration was verified for any supplied product. Responsive behaviour of authenticated surfaces was not directly tested. Therefore, the proposed journal treats accessible labelled controls, non-colour status cues, keyboard flow, and responsive task prioritisation as product requirements—not competitor conclusions.

## Differentiation

1. Gate → grade → trade causality is explicit and auditable.
2. Quality has five distinct dimensions: setup grade, validity, execution grade, management grade, outcome.
3. No-trade, rejected, and missed opportunities live in the same analytical model as executed trades.
4. Strategy-version snapshots prevent changing history when LTA rules evolve.
5. Mistakes are structured, costed in R, tied to prevention rules, and used to drive a weekly objective.

## Follow-up evidence requested

Before visual design sign-off, obtain screenshots or supervised access for DT Journal, TradeArt, and Tradesake showing dashboard, calendar, trade entry/detail, playbook, filters, screenshots, and mobile states. Update this document with dated direct observations; do not backfill assumptions.

## Structured evidence-request checklist

Use the same dated, labelled request for each inaccessible product. Mark `provided`, `not available`, or `not applicable`; never infer an answer.

| Area | DT Journal | TradeArt | Tradesake staging | Requested evidence / observation notes |
|---|---|---|---|---|
| Dashboard | Pending | Pending | Pending | Default/custom widgets, KPIs, filters, empty state. |
| Calendar | Pending | Pending | Pending | Month/week/day, outcome cues, drill-in, accessibility labels. |
| Trade entry | Pending | Pending | Pending | Manual/import workflow, fields, validation, speed. |
| Trade detail | Pending | Pending | Pending | Fills, notes, screenshots, audit/history, management. |
| Strategy/playbook | Pending | Pending | Pending | Rule criteria, versioning, trade association. |
| Screenshots | Pending | Pending | Pending | Capture/upload timing, annotation, viewer, deletion. |
| Filters/search | Pending | Pending | Pending | Dimensions, visibility, saved views, empty results. |
| Analytics | Pending | Pending | Pending | Formulas/N/exclusions, drill-through, small samples. |
| Import | Pending | Pending | Pending | CSV mapping/dedupe/errors/result. |
| Mobile | Pending | Pending | Pending | Navigation, key task flows, touch/keyboard/accessibility. |
| Empty/error states | Pending | Pending | Pending | No data, offline, validation, loading, destructive actions. |

Required evidence: public URL where available, capture date, route/role, whether authenticated, screenshot or walkthrough reference, and direct observation separated from inference.
