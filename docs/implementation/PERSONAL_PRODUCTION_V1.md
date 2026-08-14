# Evidence Ledger — Personal Production V1

## Required before deployment

- Owner-only Supabase Auth login/logout and server-side route/action protection — implemented in Task 2.
- Daily Plan, New Setup, mandatory gates, Gate 15 emotional checklist, optional confluences, grading, trade entry/closure, manual PnL/R, review and Lesson — existing workflow, protected by owner auth.
- Setup/trade history and basic filters — current workflow available; dedicated history improvements remain post-launch.
- Private screenshot storage — implemented in Task 3 with the private `evidence-private` bucket, server-generated paths, PNG/JPEG/WebP validation, 6 MB limit, temporary signed previews and protected deletion.
- PostgreSQL migrations, backup/recovery, production environment validation and redacted error handling — implemented or documented from Tasks 1–3.
- Production deployment runbook and Supabase Auth owner-user setup — still required before deployment.

## Useful after deployment

- Dedicated trade-history search/sort/pagination.
- Review queue improvements and evidence library browsing.
- Rich review autosave/history UI.
- Account and instrument metadata administration.
- Option-library CRUD, saved views, global search and periodic logs.
- Advanced analytics and comparison views.
- Automated backup scheduling/retention dashboard.
- Upload scanning and stronger retention controls.

## Not needed for Personal V1

Broker synchronization, live market data, live order execution, AI coach, replay, backtesting, social features, public profiles, multi-user support, native mobile, billing and public sharing.

## Guardrails

- Keep the approved Evidence Ledger UI unchanged.
- Preserve strategy versions, grades, gate snapshots, rejection outcomes and all three R values.
- Never seed demo data into production.
- Never commit secrets, databases, backups, uploads, tokens or logs.
- Do not use public Storage URLs or Vercel ephemeral storage for evidence.
- Authentication, Storage and database access remain single-owner and server-authorized.
