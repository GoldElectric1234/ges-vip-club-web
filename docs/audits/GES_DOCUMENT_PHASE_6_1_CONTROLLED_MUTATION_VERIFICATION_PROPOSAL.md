# GES Document Phase 6.1 Controlled Mutation Verification Proposal

Date: 2026-07-29  
Proposal: `GES-P6-1-CMV-20260729-001`  
Proposal outcome: `APPROVED_AND_EXECUTED`  
Execution run: `GES-P6-1-CMV-20260729T225921Z-A7F3`

## Governance position

The Phase 6.1 Engineering Governor evidence review is approved. This artifact
prepares—but does not authorize—the next controlled verification gate.
Execution requires separate explicit Platform Owner approval of the proposal
and its procedure.

The proposal binds execution to migration `20260729011312`, SHA-256
`46C2D16ED1082F4C76C966246C124657E75D46F100673D1F3E3CF92CA6BFE3AF`,
the active stabilization branch, and the existing linked project. Migration
replay, environment changes, real business data, committed synthetic evidence,
and all downstream capabilities remain prohibited.

## Planned verification

The live portion uses one explicit transaction containing only uniquely
prefixed synthetic aggregates. It proves first append, sequential append,
idempotent repository resolution, deterministic recovery, and required
negative protections. Expected errors are isolated by savepoints or assertion
blocks. The outer transaction always ends in `ROLLBACK`; a separate read-only
session must then prove the ledger is again exactly zero rows.

The concurrent identical-first-write race runs only on a disposable,
schema-identical non-production database. This is necessary because a true
two-session uniqueness result requires one transaction to resolve, which is
incompatible with the live requirement that every transaction roll back. The
result must be classified as normalized replay, safe unique conflict, or
integrity failure. Current evidence predicts safe unique conflict.

## Findings classification

Blocking findings: none at proposal creation.

Non-blocking findings:

1. Concurrent identical first writes may surface a unique conflict rather than
   normalized replay.
2. The predecessor foreign key lacks a covering index.
3. Recovery indexes remain naturally unused while the ledger is empty.

Accepted baselines:

- Gold AI `ApprovalLabel` TypeScript/build error;
- admin-role `TableShell` TypeScript error;
- translation-integrity `${translationCall}` scanner finding;
- unrelated Supabase advisor findings.

Deferred recommendations:

- normalize exact concurrent unique conflicts by re-reading and comparing the
  aggregate fingerprint before material concurrent ingestion;
- add the predecessor covering index through a separately governed additive
  migration when justified by workload;
- reassess recovery-index use after durable records exist.

## Safety decision

Expected live database state is zero rows before execution, at most the exact
proposal-bound synthetic rows visible only within the transaction, and zero
rows after unconditional rollback. Any non-zero pre-count, pending migration,
identity mismatch, unexpected result, lost transaction control, rollback
uncertainty, or non-zero post-count is a stop condition and blocking incident.

Proposal review was approved. The authorized execution completed with rollback,
zero ledger residue, and concurrency classification `SAFE_UNIQUE_CONFLICT`.

Exact recommendation:

`APPROVE_PHASE_6_1_CONTROLLED_MUTATION_VERIFICATION_EXECUTION_USING_PROPOSAL_GES-P6-1-CMV-20260729-001`

Status: `GES_DOCUMENT_PHASE_6_1_CONTROLLED_MUTATION_VERIFICATION_APPROVED`
