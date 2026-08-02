# Phase 1 limitations and follow-up boundary

- No broker sync or live order execution exists.
- No live market/news feed, automatic macro analysis, or candle-pattern recognition exists.
- Exact owner LTA doctrine remains data configured through the Strategy Builder; the preloaded values intentionally say `Owner configuration required` where unresolved.
- Account risk basis, `Other` reduced-risk condition, and per-add entry-model requirement remain unset in default configuration.
- Instrument metadata is modelled as a Phase 1 requirement but no fabricated tick/pip values are seeded. Position-size/risk-amount calculation is explicitly unavailable until metadata and a risk basis are completed.
- Screenshot evidence metadata is modelled; a production upload pipeline needs authenticated private object storage, malware scanning, retention, and content access controls.
- The app is single-owner/local-first; authentication and multi-user authorization are deferred.
- SQLite is selected for local development. A production database/storage deployment decision is deferred.
- In this desktop environment, Prisma generated the client and schema SQL but its schema engine returned an opaque SQLite-open error for `db push`/`migrate dev`. The local demo database was therefore created by executing Prisma-generated SQL through SQLite, then seeded. The committed Prisma schema remains the source of truth; investigate the engine issue and generate a committed migration before production deployment.
