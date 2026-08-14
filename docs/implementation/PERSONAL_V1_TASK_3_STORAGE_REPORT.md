# Personal Production V1 — Task 3 Private Storage Report

Date: 2026-08-02  
Status: **Complete — private evidence storage implemented**

## Architecture

- Supabase Storage bucket: `evidence-private`.
- Bucket verification completed: exists, private, file-size limit configured, and MIME restrictions configured.
- Administrative Storage access uses a server-only Supabase client with `SUPABASE_SECRET_KEY`, no session cookies, and disabled session persistence/refresh.
- Every Storage route first calls the existing `requireOwner()` authorization system.
- Browser uploads use Supabase `uploadToSignedUrl`; the server secret is never sent to the browser.
- Object paths are generated server-side as `owner/{user-id}/evidence/{evidence-id}/{random}.{extension}`.
- Public URLs are never used. Preview URLs are short-lived signed redirects and are not persisted.

## Files and schema

- Added `src/lib/supabase/admin.ts`.
- Added upload-request, finalize, preview URL, and delete routes under `src/app/api/evidence`.
- Added `src/lib/evidence-storage.ts` validation utilities and tests.
- Added compact evidence upload/preview/delete controls to setup detail without redesigning the page.
- Added nullable `Evidence.storageBucket`, `storagePath`, `originalFilename`, and `byteSize` fields.
- Added and applied `prisma/migrations/20260802230000_evidence_storage_metadata/migration.sql`.
- Added read-only `scripts/verify-storage-config.mjs` and `pnpm storage:verify`.

## Upload and verification flow

1. Authenticated owner requests authorization for an existing setup, trade, or review.
2. The server validates association, MIME type and declared size, generates the evidence ID/path, and requests a signed upload token.
3. The browser uploads directly to the private bucket with `upsert: false`.
4. Finalization downloads the object server-side, verifies actual size, MIME and PNG/JPEG/WebP magic bytes, removes invalid objects, and only then persists Evidence metadata.
5. Database failure triggers best-effort orphan cleanup.

## Protected operations

- Upload authorization: `POST /api/evidence/upload-request`.
- Finalization: `POST /api/evidence/finalize`.
- Preview/download redirect: `GET /api/evidence/{id}/url` with a 180-second signed URL.
- Delete: `DELETE /api/evidence/{id}`; reads the path only from the database and records an audit event.
- Unauthenticated requests return 401; authenticated non-owner requests return 403; inaccessible records return 404.

## Verification

- `pnpm storage:verify`: passed; bucket exists, is private, and restrictions are configured.
- `pnpm prisma migrate deploy`: passed; additive Evidence metadata migration applied to Supabase PostgreSQL.
- `pnpm test`: **35 passed**.
- `pnpm exec tsc --noEmit`: passed.
- `pnpm lint`: passed with the image preview rule intentionally disabled for the authenticated signed-URL thumbnail component.
- `pnpm build`: passed.
- Secret-safety review: `SUPABASE_SECRET_KEY` is server-only, has no `NEXT_PUBLIC_` prefix, is not returned by routes, and is not included in browser code or committed files.

## Manual verification and remaining limitations

The private bucket configuration was verified read-only. A real screenshot upload was not performed because the production database intentionally contains no demo records and no sensitive trading screenshots should be used for automated testing. The owner should manually verify PNG, JPEG, WebP, oversized, spoofed, SVG, preview-expiry, refresh, and delete cases using a non-sensitive setup after creating the owner Auth record.

Authentication must be configured in the Supabase dashboard before production use. Deployment was not performed. SQLite/demo data and local uploads were not migrated. The existing local `UPLOAD_DIR` remains documented for legacy development only; new production evidence uses Supabase Storage.

## Final classification

Task 3 is complete in code and schema. The bucket is private, Storage operations are owner-protected, public URLs are prohibited, and the approved UI was preserved. Production readiness still depends on the separately deferred owner-user/dashboard setup and deployment tasks.
