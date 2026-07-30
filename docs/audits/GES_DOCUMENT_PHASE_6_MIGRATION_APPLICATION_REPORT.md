# GES Document Phase 6 Migration Application Report

Date: 2026-07-28  
Project: `tmpolrjddutatfjokjfk`  
Migration: `20260729011312_phase_6_governed_document_evidence_ledger.sql`

## Preflight

- Active branch was the non-main stabilization branch
  `phase-8-batch-6-1-live-persistence-validation`.
- Remote history ended at `20260724031140`.
- All remote history entries were represented locally.
- The governed dry run identified exactly one pending migration:
  `20260729011312`.
- No seeds, roles, older migrations, or unrelated changes were pending.
- Existing document metadata, versions, signature infrastructure, and
  notification tables were present.
- The migration was additive and forward-only.

Preflight identified and repaired two unapplied-migration defects:
cross-correlation lineage was not rejected by the repository/database, and
payload identity bindings were not independently enforced by Postgres. The
pending migration and repositories were tightened before application; no older
migration was edited.

## Application

`npx supabase db push --linked --yes` applied only version
`20260729011312`. A subsequent governed dry run reported the remote database
up to date.

## Schema, RLS, and grants

Direct catalog verification proved:

- migration history entry present;
- `document_evidence_ledger` present with 29 required columns;
- all primary, unique, lineage, immutable, and payload-binding constraints;
- document, version, and correlation recovery indexes;
- RLS enabled;
- exactly one service-role INSERT policy and one service-role SELECT policy;
- no SELECT or INSERT privilege for `public`, `anon`, or `authenticated`;
- service role has SELECT and INSERT but no UPDATE or DELETE;
- lineage and append-only triggers installed.

## Transactional live proof

All verification fixtures were created inside one transaction and rolled back.
The ledger row count was zero before and after verification.

| Proof | Result |
| --- | --- |
| First append | Passed |
| Sequential append | Passed |
| Ordered recovery | Passed: `{1,2}` |
| Idempotent existing-record resolution | Passed |
| Conflicting duplicate rejection | Passed: unique ledger constraint |
| Invalid correlation sequence | Passed: correlation/sequence constraint |
| Broken lineage | Passed: lineage trigger |
| Cross-correlation lineage | Passed: lineage trigger |
| Payload identity mismatch | Passed: payload-binding constraint |
| UPDATE | Rejected by append-only trigger |
| DELETE | Rejected by append-only trigger |

The trusted adapter’s focused test additionally proves insert-only behavior and
governed idempotent replay without a second insert.

## Compatibility and regression

- Phase 6 focused tests: 6 passed.
- Phase 1–5E, Demo 1.0, and existing persistence regressions: 90 passed.
- Customer notification regression: 11 passed.
- Document and workflow boundaries: passed.
- Targeted ESLint: passed.
- Translation parity: passed (2,020 keys).
- Next.js application compilation: passed before the known repository
  TypeScript baseline stopped the build.
- Existing document, version, signature, and notification tables remained
  present after verification.

## Lint and advisors

- Linked database lint: zero schema errors.
- Security advisors: 45 repository findings, none associated with Phase 6.
- Performance advisors: 316 repository findings. Phase 6 has one informational
  unindexed predecessor-FK notice and two expected unused recovery-index notices
  while the table is empty.

No unrelated advisor finding was repaired.

## Rollback and recovery

Verification changes were transactionally rolled back. The schema migration is
not destructively rolled back after real evidence exists because that would
violate the append-only policy. Suspension must use a forward migration that
revokes INSERT while preserving SELECT and history. Disaster recovery uses
Supabase backup/PITR followed by ordered correlation recovery and fingerprint/
lineage verification.

## Warnings

- A dedicated predecessor-reference covering index should be considered in a
  separately governed additive migration before material ledger volume.
- The adapter's read-before-insert idempotency path is safe but not fully
  normalized under simultaneous identical first writes. Database constraints
  preserve history; conflict re-read normalization is deferred before material
  concurrent ingestion.
- Repository-wide TypeScript/build retains the known unrelated Gold AI
  `ApprovalLabel` and admin-roles `TableShell` errors.
- Translation integrity retains the unrelated existing
  `${translationCall}` scanner finding.
- Formal proposal `GES-P6-1-REVIEW-20260728-001` is
  `READY_FOR_REVIEW`; review-only Governor execution is eligible after the
  required human approval. No Governor stage has executed.

Status: `GES_DOCUMENT_PHASE_6_MIGRATION_APPLIED_WITH_WARNINGS`

Review state: `ENGINEERING_GOVERNOR_EVIDENCE_REVIEW_APPROVED`
