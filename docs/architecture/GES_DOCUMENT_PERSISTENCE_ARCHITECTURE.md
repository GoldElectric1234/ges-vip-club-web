# GES Document Persistence Architecture

Date: 2026-07-28  
Contract: Phase 6 / 6.0.0

## Purpose

Phase 6 introduces one governed durable evidence ledger for immutable artifacts
produced by Phases 1–5E. It complements the existing document metadata/version
and Batch 6 signature tables; it does not replace completed domain services.

Each ledger row persists the exact document, version, review, governed
signature session, Phase 5D evidence package, Phase 5E certification record,
audit timeline, correlation identity, fingerprints, and lineage supplied by
the server.

## Write path

1. The server assembles and validates a complete Phase 6 aggregate.
2. Identity, correlation, chronological audit, and lineage invariants fail
   closed before repository access.
3. The repository checks the immutable ledger identity for an idempotent replay
   or conflicting duplicate.
4. A new row is inserted. There is no update, upsert, or delete operation.
5. Recovery reads rows by ledger reference or correlation identity in sequence.

The Supabase adapter requires an injected trusted server client. No browser
client or service-role credential is created by the Phase 6 module.

## Database controls

`public.document_evidence_ledger` has RLS enabled. `public`, `anon`, and
`authenticated` receive no privileges. `service_role` receives only
`SELECT` and `INSERT`; explicit revokes and a database trigger reject
`UPDATE` and `DELETE`, including privileged accidental mutation.

Unique ledger, aggregate, and correlation-sequence constraints prevent
duplicates. Self-referencing lineage uses `ON DELETE RESTRICT`. Indexed
document/version/correlation paths support deterministic recovery.

The migration is forward-only, was generated with the installed Supabase CLI,
and was applied to the linked project on 2026-07-28 through
`supabase db push --linked`. A post-application dry run reports the remote
database is up to date.

The database also validates payload identity/fingerprint bindings and rejects
missing, cross-correlation, cross-document, non-sequential, or
fingerprint-mismatched predecessors before insertion.

## Recovery and rollback

Recovery reads immutable rows by correlation identity ordered by sequence.
Application verification used transaction-scoped fixtures and rolled them back,
leaving zero Phase 6 rows. Because evidence history is append-only, rollback is
not a destructive table drop once real evidence exists. Operational recovery
uses database backup/PITR plus fingerprint and lineage verification. If the
capability must be suspended, a forward migration should revoke insert while
preserving select and all historical rows.

## Concurrency expectations

Database safety is concurrency-correct: unique ledger identity,
aggregate-fingerprint, and correlation-sequence constraints prevent competing
writes from creating duplicate or forked history, while the predecessor trigger
requires a committed, exact prior record. Concurrent inserts cannot overwrite
evidence.

The current trusted adapter performs read-before-insert idempotency resolution.
Two simultaneous identical first attempts may therefore race: one insert
succeeds and the other can surface the database unique-conflict error instead
of normalizing it to `IDEMPOTENT_REPLAY`. This does not compromise immutable
history and there is no active production caller, but conflict re-read/
normalization is deferred hardening before material concurrent ingestion.

Phase 6.1 disposable PostgreSQL concurrency verification observed exactly one
successful identical insert, one SQLSTATE `23505` loser, one ledger identity,
and one aggregate identity. The accepted classification is
`SAFE_UNIQUE_CONFLICT`; normalization remains separately governed deferred work.

## Phase 6.1 completion

Engineering Governor evidence review and Controlled Mutation Verification are
approved. Run `GES-P6-1-CMV-20260729T225921Z-A7F3` rolled back, and independent
checks prove zero total, controlled-prefix, and run-specific ledger rows.
Migration replay, production persistence, integration, deployment, and Phase
6.2 remain outside this approval.

## Capability boundary

No public verification, provider delivery, PDF publication, QuickBooks write,
email, SMS, push, legal-retention execution, or storage bucket is introduced.
Fingerprints preserve domain integrity but are not cryptographic certification.
