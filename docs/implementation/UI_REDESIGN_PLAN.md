# Evidence Ledger UI Redesign Plan

## Scope

Rebuild the application shell, Home dashboard, Strategy page, and shared visual
components around the supplied reference images. This is a presentation-layer
change: existing Prisma reads, server actions, routes, and domain invariants
remain unchanged.

## Visual contract

- Fixed 252px desktop sidebar; compact 58px application bar.
- Near-black canvas, charcoal panels, cool-gray one-pixel dividers, restrained
  cyan only for small actions and active state.
- IBM Plex Mono/monospace metrics with tabular figures; sans-serif narrative
  copy.
- Connected metric strips, dense tables, small-radius panels, and no marketing
  hero layouts.
- R and execution quality take priority over currency and outcome.

## Components

Create a common `Shell`, dense toolbar, metric strip, status badge, mini chart,
empty state, and calendar presentation. Home composes these with real journal
data; Strategy composes them with existing strategy-version and entry-model
data. No analytics are fabricated when a source field is absent.

## Responsive and accessibility

Desktop retains the dense grid through 1366px. Tablet turns long strips into
horizontal scroll areas or fewer columns; mobile collapses to one column and a
compact sidebar navigation. Controls retain semantic labels, visible focus,
status text in addition to colour, table semantics, and reduced-motion support.
