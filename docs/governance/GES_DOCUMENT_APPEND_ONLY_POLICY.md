# GES Document Append-Only Policy

Date: 2026-07-28

## Mandatory rules

- Every documentary evidence aggregate is immutable after insertion.
- Historical versions and their lineage are never overwritten or deleted.
- Corrections and supersessions append a new record referencing the exact
  preceding ledger identity and aggregate fingerprint.
- The first record has sequence 1 and no predecessor. Later records must
  advance by exactly one and preserve document identity.
- Duplicate ledger identities are idempotent only when the full aggregate
  fingerprint is identical. A different payload is an immutable conflict.
- Audit entries are non-empty, contiguous, chronological, and bound to the
  aggregate correlation identity.
- Recovery returns the original records in lineage sequence.

## Enforcement layers

The domain assembler validates identities, timestamps, audit ordering, and
lineage pairs. Repository ports expose only append and recovery operations.
Postgres grants allow only insert/select, unique constraints reject duplicate
keys, foreign keys protect lineage, RLS blocks untrusted roles, and the
append-only trigger rejects update/delete.

No operational cleanup or legal-retention deletion is authorized by Phase 6.
Any future retention execution requires separate governance and must not
rewrite this evidence ledger.

## Live verification

Migration `20260729011312` is applied. Transactional live verification proved
first and sequential appends, ordered recovery, idempotent existing-record
resolution, and rejection of update, delete, conflicting duplicate, broken
lineage, repeated correlation sequence, cross-correlation lineage, and payload
identity mismatch. The verification transaction was rolled back.

Concurrent writers remain governed by database uniqueness and lineage
serialization. A losing duplicate writer must never retry with mutation.
Future adapter hardening should catch the unique conflict, re-read the governed
record, compare the aggregate fingerprint, and return idempotent replay only
for an exact match.

Phase 6.1 controlled verification classified the current observed race as
`SAFE_UNIQUE_CONFLICT`: one insert succeeds, the loser receives SQLSTATE
`23505`, and no duplicate or fork is created. This behavior is accepted for
Phase 6.1. Normalized replay and a predecessor covering index remain deferred
governed work and are not authorized by completion.
