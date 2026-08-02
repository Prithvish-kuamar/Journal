# Interaction Audit — Functionality Pass

Audit completed before the functionality pass. The approved visual system is
locked; this document records behaviour only.

| Surface | Control | Status before work | Resolution |
| --- | --- | --- | --- |
| Dashboard | Journal tab | Partially functional | Keep as URL-backed default journal view. |
| Dashboard | Comparison / Analysis tabs | Placeholder | Add real, data-derived views and tab semantics. |
| Dashboard | Journal, account, strategy, date controls | Placeholder | Replace with URL-backed native selects; do not invent unsupported sources. |
| Dashboard | Export | Broken | Add filtered CSV export endpoint and client feedback. |
| Dashboard | Manual entry / New Setup | Partially functional | Route to the existing validated setup workflow; label historical mode limits. |
| Dashboard | Broker sync | Placeholder | Make non-interactive with an explanatory tooltip. |
| Dashboard | Open/Create plan | Partially functional | Route according to active-plan availability. |
| Calendar | Month controls, day cells, Journal cards | Broken | Make URL-backed month/day/list navigation. |
| Sidebar | Links to later-phase destinations | Future-phase | Keep navigation, but add scoped unavailable states with a current-workflow alternative. |
| Top bar | Settings / review queue | Fully functional | Preserve routes. |
| Top bar | Journal-ready label | Placeholder | Replace with a non-interactive, truthful local-journal status. |
| Strategy | Search and filter controls | Placeholder | Clearly disable with explanatory labels until strategy-library filtering is implemented. |

## Journal-source classification

The current schema has no imported/manual-source field. Therefore this pass only
offers sources that are safely derivable: **All journals**, **Verified**
(completed post-trade review), and **Demo** (explicit `DEMO:` record label).
Manual and imported options are intentionally omitted rather than fabricated.

## Deferred safely

- Broker synchronization, CSV import, and live execution remain unavailable.
- A dedicated historical-entry editor for missed/correct-no-trade records is
  not present in the Phase 1 workflow. Manual entry opens the existing
  validated setup workflow instead of bypassing gate, grade, or audit rules.
- Standalone strategy-library search/filtering remains disabled until it has a
  compatible query model; it is labelled as unavailable.
