# Phase 6.1 Controlled Mutation Evidence Report

Date: 2026-07-29  
Proposal: `GES-P6-1-CMV-20260729-001`  
Run: `GES-P6-1-CMV-20260729T225921Z-A7F3`

## Commands and procedures executed

The following redacted commands were used. No credential, connection string,
or service-role secret was captured.

```text
git branch --show-current
Get-FileHash -Algorithm SHA256 supabase/migrations/20260729011312_phase_6_governed_document_evidence_ledger.sql
npx supabase db push --linked --dry-run
npx supabase db query --linked --output json "<read-only preflight catalog/count/privilege query>"
npx supabase db query --linked --output json --file verification/phase-6-1/controlled-mutation-verification/runs/GES-P6-1-CMV-20260729T225921Z-A7F3/live-controlled-verification.sql
npx supabase db query --linked --output json "<independent post-rollback count query>"
npm install --prefix %TEMP%/ges-p6-1-cmv-20260729t225921z-a7f3-runtime --no-save --no-audit --no-fund embedded-postgres@17.6.0-beta.15
node verification/phase-6-1/controlled-mutation-verification/runs/GES-P6-1-CMV-20260729T225921Z-A7F3/disposable-concurrency-verification.mjs
npx supabase db query --linked --output json "<final read-only integrity query>"
npx supabase db push --linked --dry-run
```

## Synthetic identity strategy

Every live identity used prefix
`GES-P6-1-CMV-20260729T225921Z-A7F3`. The disposable race added
`-CONCURRENCY`. Records contained deterministic synthetic fingerprints and
JSON payload bindings; no existing row or production business identifier was
read to construct them.

## Database state

Before execution, migration `20260729011312` appeared exactly once, the dry run
was current with zero pending migrations, RLS and both protection triggers were
present, privileges were unchanged, and total/prefix ledger counts were zero.

During the explicit live transaction, exactly two approved synthetic rows were
visible after the positive cases. Every negative attempt left that count
unchanged. `COMMIT` was never issued; the script ended with `ROLLBACK`.

An independent new session then returned total ledger count 0, controlled-prefix
count 0, and run-specific count 0. A final independent check after concurrency
testing repeated zero rows, one applied migration, unchanged RLS/triggers/grants,
and zero pending migrations.

## Positive results

| Case | Result | Evidence |
| --- | --- | --- |
| First append | PASS | One transaction-visible sequence-1 row. |
| Sequential append | PASS | Sequence 2 referenced the exact sequence-1 aggregate. |
| Idempotent replay resolution | PASS | Existing ledger identity and exact aggregate fingerprint resolved without an insert. |
| Deterministic recovery | PASS | Ordered sequence `[1,2]` with exact predecessor linkage. |

## Negative results

| Case | Result | SQLSTATE/evidence |
| --- | --- | --- |
| UPDATE rejection | PASS | `P0001`, append-only trigger. |
| DELETE rejection | PASS | `P0001`, append-only trigger. |
| Duplicate sequence | PASS | `23505`, unique correlation-sequence constraint. |
| Invalid sequence | PASS | `P0001`, predecessor required. |
| Broken lineage | PASS | `P0001`, invalid lineage. |
| Cross-correlation lineage | PASS | `P0001`, invalid lineage. |
| Payload mismatch | PASS | `23514`, payload binding constraint. |

## Disposable concurrency result

A disposable local PostgreSQL 17.6 cluster applied the exact migration and
reported 29 ledger columns. Two independent clients, operating as
`service_role`, both completed the current adapter's empty pre-read before
simultaneously attempting the identical first insert.

- empty pre-reads: `[0, 0]`;
- successful inserts: 1;
- failed inserts: 1;
- loser SQLSTATE: `23505`;
- resulting rows: 1;
- distinct ledger identities: 1;
- distinct aggregate fingerprints: 1;
- linked database concurrency writes: none;
- disposable database destroyed: yes.

Final classification: `SAFE_UNIQUE_CONFLICT`.

## Findings and boundaries

Blocking findings: none.

Non-blocking findings:

1. Concurrent identical first writes produce a safe unique conflict rather
   than normalized replay.
2. The predecessor foreign key lacks a covering index.
3. Recovery indexes remain unused while the live ledger is empty.

Accepted baselines remain the Gold AI `ApprovalLabel` error, admin-role
`TableShell` error, translation-integrity `${translationCall}` finding, and
unrelated Supabase advisor findings. None was exercised or modified.

No migration replay, production-data persistence, application change,
notification, publication, QuickBooks write, deployment, push, merge,
environment switch, index addition, concurrency normalization, or Phase 6.2
work occurred.

## Decision

Phase 6.1 controlled mutation verification is approved. This approval does not
authorize production persistence or any downstream action.

Status: `GES_DOCUMENT_PHASE_6_1_CONTROLLED_MUTATION_VERIFICATION_APPROVED`
