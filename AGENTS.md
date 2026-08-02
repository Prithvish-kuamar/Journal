# Journal implementation instructions

## Product guardrails

- This is a strategy-first trading journal. It must never place, route, simulate, or suggest live orders.
- Preserve the distinct concepts in `docs/product`: candidate lifecycle vs disposition; gate result vs diagnostic completion vs lock state; setup quality vs execution/management/outcome quality; and the three R values.
- A first mandatory `No` permanently rejects a gate assessment. Diagnostic answers may continue but can never restore `Passed`.
- Grade only after all active mandatory gates pass. Scores are only 1 or 2; Rejected never receives a letter grade.
- The calculated grade locks when a trade is created. Corrections append an audit record and retain the original value.
- Historical records retain their strategy-version reference/snapshot. Published strategy versions are immutable and cannot be deleted while referenced.
- Unresolved LTA doctrine is configuration data and owner-entered content, never universal hardcoded validation.

## Approved Phase 1 defaults

- Live-permitted instruments: XAUUSD, EURUSD, GBPUSD, USDJPY, USDCHF, USDCAD, AUDUSD, NZDUSD.
- Sessions are manually selected labels (`Asia`, `London`, `New York AM`), not time windows. Store timestamps in UTC and display in IST; do not add DST or boundary enforcement.
- Standard/reduced risk: 2%/1%. The risk basis remains configurable and unselected by default.
- 1% is required for contrarian/countertrend, high volatility, holiday/thin liquidity, or funded-drawdown proximity; it cannot rescue an invalid, B, C, or Rejected setup.
- Two executed trade theses per day. A partial first fill starts a thesis; planned add-ons stay in it. A third historical thesis is permanently restricted.
- Adds must be planned, only occur when the original position is secured/not losing, and may never take maximum worst-case risk above 2%. Every add is a leg; unplanned adds are process violations.

## Engineering conventions

- Use TypeScript with strict typing, Zod validation at input boundaries, and relational persistence.
- Keep client/server concerns separate. Business invariants belong in reusable server/domain functions with tests, not only UI handlers.
- Record audit events for material changes. Do not silently mutate locked or historical values.
- Store screenshots as metadata plus local development files; validate type/size and mark an upload late when capture time is after its intended event time.
- Use accessible semantic controls, keyboard operation, visible labels/statuses, and dark Evidence Ledger styling. Do not use red/green as the only signal.
- Seed data must be clearly labelled demo data and never represented as trading history.

## Verification

- Run formatting, unit/integration tests, and production build after substantive changes.
- Add or update tests for business rules whenever a rule changes.
- Keep `docs/architecture` and `docs/implementation` current when technical choices or Phase 1 scope change.
