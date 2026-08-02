# Design System Direction

## Approved direction: “Evidence Ledger”

Use a dark, quiet, information-dense desktop workspace where status and evidence are clearer than profit celebration. Evidence Ledger is the default; Technical Fieldbook is the secondary light mode. No final production assets are created in this phase.

| Direction | Character | Strength | Risk | Recommendation |
|---|---|---|---|---|
| A. Evidence Ledger | Deep navy/slate, warm-neutral surfaces, structured panels, restrained blue focus. | Serious and calm; screenshots/charts stand out; supports long review sessions. | Can feel heavy if contrast hierarchy is weak. | **Approved default.** |
| B. Technical Fieldbook | Light warm-grey canvas, graphite text, blue rules, paper-like record hierarchy. | Excellent reading/printing and rule editing. | Less appropriate for screen-dense live use. | Optional light theme / strategy-print view. |
| C. Signal Matrix | Charcoal, high-density table system, stronger cyan/amber status cues. | Fast scanning for analytics and active trade. | Risks terminal/admin aesthetic and visual fatigue. | Use selectively in tables and live-status elements, not as full theme. |

## Foundations

| Element | Direction |
|---|---|
| Typography | Humanist sans for UI/body (e.g., Inter-like) with tabular numerals; 12–14px compact data, 14–16px body, 20–28px page headings. Avoid decorative/condensed trading type. |
| Colour | Semantic tokens, not hard-coded semantic colours: background, surface, text, muted, border, focus, planned, qualified, rejected, active, closed, reviewed, warning. Dark palette: navy/slate surfaces, off-white text, blue focus; green/red reserved for numeric direction and always paired with icon/text. |
| Spacing | 4px base: 4/8/12/16/24/32/48. Dense table padding 8–12; forms 16; page rhythm 24–32. |
| Elevation | Borders and tonal layers first; shadows only for transient overlay/dialog. Avoid glass/neon effects. |
| Motion | 150–200ms state transitions; reduced-motion replaces movement with instant state and focus change. Never animate financial values as celebration. |

### Concrete responsive and density tokens

`breakpoint-mobile: 0–767px`; `breakpoint-tablet: 768–1199px`; `breakpoint-desktop: ≥1200px`. Default shell widths: desktop sidebar 240px, content max 1600px, detail secondary panel 360px; tablet collapses sidebar/secondary panels; mobile minimum horizontal padding 16px. Density is user preference: `comfortable` (row 44px), `compact` (row 36px), with compact never reducing touch-action controls below 44px. Token examples: `surface-0/#0B1220`, `surface-1/#111B2E`, `text-primary/#F3F6FA`, `text-muted/#AAB6C8`, `focus/#6BA8FF`; validate final semantic colours rather than relying on these candidates.

## Components

| Category | Components and behaviour |
|---|---|
| Navigation | Sidebar, mobile menu, breadcrumb/context trail, tab set, date/account/filter bar, saved-view control. Current destination is text and icon, not colour only. |
| Status | Text badge with icon: Planned, Qualified, Rejected, Active, Closed, Review incomplete, Reviewed; grade badges A+/A/B/C/F; tooltip defines status. |
| Forms | Label above input, helper/rule text, required indicator, inline error plus error summary, Yes/No segmented controls with keyboard navigation, 1/2 quality score controls after gates pass, autosave state. |
| Evidence | Screenshot tile with type/capture/upload timestamp/caption; full-screen viewer; annotation layer; missing/late evidence badge. Never use a cropped image as the only source of state. |
| Data | Dense sortable tables with sticky headers, visible filters, row status/quality, column chooser; card alternative on mobile. Monospaced/tabular figures for price/R. |
| Charts | Prefer compact distributions, cumulative R, bar comparisons, calendar, and annotated trends. Include definition, N, filtering, selected version, table alternative, and “not enough data” state. |
| Feedback | Inline validation, success receipt, retryable error, empty-state next action, confirmation dialog for destructive/irreversible operations, unsaved-change prompt. |

Every interactive component defines `default`, `hover`, `focus-visible`, `pressed`, `disabled`, `loading`, `error`, `success`, and where relevant `offline/pending-sync` states. Status components additionally define `planned`, `qualified`, `rejected`, `active`, `closed`, `review-incomplete`, and `review-complete`; each has text/icon/token, never colour alone.

## Form and table design rules

- Group trade form by identification, locked strategy context, order/risk, evidence; show original plan beside current values on active/closed detail.
- Gate controls present one succinct rule and reason/evidence affordance, with progress and immediate textual rejection feedback.
- Required fields have asterisks explained once; do not mark optional fields as blank errors.
- Tables default to meaningful columns: instrument/date/status/grade/validity/R/execution/management/mistake. Make missing context explicit rather than blank.

## Screenshot and chart presentation

Screenshot viewer shows “before / during / after / lesson,” capture vs upload timestamp, note, linked event, and annotation. Images are fit-contained with zoom and full-screen; never crop technical levels by default. Charts cannot imply certainty: place N, definition, unit, filter chips, and strategy-version scope in the header; use accessible descriptions and equivalent data tables.

## Accessibility requirements

1. Meet WCAG 2.2 AA contrast for text/interactive controls; validate visual tokens in both themes.
2. Full keyboard flow for nav, grid, filters, gate Yes/No, score, dialogs, uploads, and chart alternatives.
3. Visible focus that is not only colour; semantic live announcements for gate rejection, save status, import progress, and validation summary.
4. Colour is redundant with text/icon/pattern. Calendar cells use state labels in tooltip/agenda and patterns/icons.
5. Respect font scaling, no horizontal loss at 320px for core mobile tasks, avoid time-limited controls, and provide reduced-motion preference.
