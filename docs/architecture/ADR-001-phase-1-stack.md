# ADR-001: Phase 1 application stack

- **Status:** Accepted
- **Date:** 2026-08-02

## Context

The repository contained only product documentation. Phase 1 needs a responsive TypeScript web application, relational records and version history, local screenshot storage, input validation, audit events, and automated tests—without broker execution, market data, or unnecessary services.

## Decision

Use a single Next.js App Router TypeScript application with Prisma and SQLite for local development. Use server actions/route handlers only for application persistence, Zod for validation, Vitest for domain and integration tests, and Playwright for the two critical end-to-end flows. Store uploads under a local ignored directory in development, with database metadata; production object storage is intentionally deferred behind the storage abstraction.

The app is single-owner in Phase 1. Authentication and multi-user authorization are deferred rather than faked. There is no broker API, order routing, live price feed, or automatic doctrine/candle detection.

## Consequences

- SQLite makes local setup a single command and permits relational foreign keys, immutable version references, audit events, and realistic seed records.
- Prisma migrations make schema evolution explicit. Strategy definitions are stored as structured records/JSON fields where owner-configured shapes vary, while invariant relationships remain relational.
- Next.js keeps the vertical slice in one deployable service and supports responsive server-rendered pages with small interactive client components.
- Uploads are suitable for local demo/development only. A later ADR must choose private object storage, malware scanning, retention, and authenticated access before production use.

## Alternatives considered

| Alternative | Why not selected for Phase 1 |
|---|---|
| React SPA + Express API | Splits a small vertical slice into two apps and adds local-development overhead. |
| Next.js + hosted Postgres/Supabase | Adds external accounts and services before their value is needed; SQLite preserves relational behaviour locally. |
| File-only JSON persistence | Cannot safely express version references, audit records, concurrent updates, or queryable analytics. |
| No ORM / raw SQL | Adds schema/query boilerplate without improving this bounded single-service slice. |

## Security notes

Local upload files are untrusted: validate extension, MIME type, and size; generate server-side names; do not execute uploads; and never expose absolute filesystem paths. Secrets are environment variables and are not committed. Production security requirements remain documented in `docs/product/OPEN_DECISIONS.md`.
