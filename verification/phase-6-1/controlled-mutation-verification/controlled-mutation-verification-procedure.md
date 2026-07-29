# Phase 6.1 Controlled Mutation Verification Procedure

Date: 2026-07-29  
Proposal: `GES-P6-1-CMV-20260729-001`  
Outcome: `CONTROLLED_MUTATION_VERIFICATION_APPROVED`  
Executed run: `GES-P6-1-CMV-20260729T225921Z-A7F3`

This procedure was separately approved by the Platform Owner and executed only
for run `GES-P6-1-CMV-20260729T225921Z-A7F3`. It grants no authority for a
repeat execution or any downstream action.

## 1. Fixed evidence and scope

- Branch: `phase-8-batch-6-1-live-persistence-validation`.
- Applied migration: `20260729011312`.
- Migration SHA-256:
  `46C2D16ED1082F4C76C966246C124657E75D46F100673D1F3E3CF92CA6BFE3AF`.
- Live target: the already-linked project `tmpolrjddutatfjokjfk`; no environment
  switching or relinking is permitted.
- Live mutation scope: only `public.document_evidence_ledger`, only synthetic
  proposal-bound records, and only inside one explicit transaction that ends in
  `ROLLBACK`.
- Concurrency scope: a disposable schema-identical local or isolated
  non-production database. A live two-session write race is prohibited.

Migration replay, schema changes, application behavior changes, real business
record access, notifications, publication, QuickBooks writes, deployment,
push, merge, and Phase 6.2 are outside scope.

## 2. Synthetic data strategy

At execution time, generate one UTC run identity:
`GES-P6-1-CMV-YYYYMMDDTHHMMSSZ-<random-suffix>`. Every text identity used by
the harness must begin with that exact value, including ledger, correlation,
document, version, review, signature-session, evidence-package, and
certification identities.

Fingerprints must be deterministic SHA-256 values derived from the run identity
plus their field name and sequence. JSON bindings must exactly match governed
columns:

- `document_record.documentReference` and `.fingerprint`;
- `version_record.versionId` and `.fingerprint`;
- `review_record.sessionId`;
- `signature_session_record.signatureSessionReference` and `.fingerprint`;
- `evidence_package_record.evidencePackageIdentity` and
  `.finalEvidenceFingerprint`;
- `certification_record.certificationIdentity` and `.fingerprint`;
- `lineage.documentIdentity`, `.versionIdentity`,
  `.previousLedgerReference`, and, for sequence two,
  `.previousAggregateFingerprint`.

The harness may read only the ledger, migration history, and catalog metadata
needed for the assertions. It must never select a production business row to
construct a fixture.

## 3. Pre-execution state gate

Before opening any write transaction, capture a timestamped, read-only state
record and stop unless every assertion is true:

1. Current branch, linked project reference, migration version, and local file
   hash match the fixed evidence above.
2. Linked migration history contains `20260729011312`, and a migration dry run
   reports zero pending migrations.
3. `document_evidence_ledger` exists with RLS and both protection triggers.
4. The privilege matrix remains: `public`, `anon`, and `authenticated` have no
   access; `service_role` has only `SELECT` and `INSERT`.
5. Total ledger row count is exactly zero.
6. Rows matching `GES-P6-1-CMV-%` are exactly zero.
7. The execution channel supports explicit transactions and does not autocommit
   individual statements.

The captured state and command output must be placed in a new run-specific
evidence directory. Secrets, connection strings, and service-role credentials
must be redacted.

## 4. Live transactional procedure

After separate approval, open one controlled database session and issue an
explicit `BEGIN`. Set a short statement timeout and a distinctive application
name containing the run identity. Never issue `COMMIT`.

Within the outer transaction:

1. **First append:** insert sequence 1 with no predecessor. Assert exactly one
   transaction-visible row with matching identities and bindings.
2. **Sequential append:** insert sequence 2 referencing sequence 1 and its
   aggregate fingerprint. Assert exactly two transaction-visible rows.
3. **Idempotent replay:** execute the trusted repository's governed resolution
   logic against the identical sequence-1 aggregate, or its exact SQL-equivalent
   read/compare branch in the harness. Assert it returns the existing ledger
   identity and does not issue a second insert. A raw repeated `INSERT` is a
   duplicate test, not idempotent replay.
4. **Deterministic recovery:** recover by correlation identity ordered by
   sequence and assert the exact ordered result `[1, 2]`, exact predecessor
   linkage, and fingerprint continuity.
5. **UPDATE rejection:** in an assertion block or savepoint, attempt to change a
   synthetic row. Require the append-only trigger error and unchanged row.
6. **DELETE rejection:** similarly require the append-only trigger error and
   unchanged row.
7. **Duplicate sequence rejection:** attempt a different ledger reference at an
   already-used `(correlation_identity, sequence)`. Require unique rejection.
8. **Invalid sequence rejection:** attempt sequence 2 without a predecessor (or
   a non-contiguous successor). Require lineage/sequence rejection.
9. **Broken lineage rejection:** reference a missing or fingerprint-mismatched
   predecessor. Require lineage rejection.
10. **Cross-correlation lineage rejection:** reference an existing synthetic
    predecessor from another synthetic correlation. Require lineage rejection.
11. **Payload mismatch rejection:** alter one governed JSON identity/fingerprint
    binding while keeping its column unchanged. Require check-constraint or
    lineage-trigger rejection.

Every expected error must be caught without aborting the outer transaction,
using a savepoint or exception-catching assertion block. After each negative
case, assert that transaction-visible row count and fingerprints remain exactly
the two expected positive rows.

Regardless of success or failure, issue `ROLLBACK` in a `finally`/trap path,
close the controlled session, and then perform the independent read-only
post-check in a new session. If connection loss makes rollback outcome
uncertain, stop all work and perform the independent zero-row checks before any
other action.

## 5. Concurrent identical-write verification

A real uniqueness race needs two independent sessions. If the winning live
transaction rolls back, the waiting transaction can proceed, so a live test
cannot both classify the final loser outcome and guarantee rollback of every
session. For that reason, concurrency verification must run only on a freshly
created disposable database with the exact migration applied and no other data.

Use two synchronized clients with the identical synthetic sequence-1
aggregate. Hold both at a barrier immediately before append, release together,
and collect database plus repository outcomes. Repeat enough times to exercise
the race, then destroy the disposable database. No migration history or schema
object may be copied back to the linked environment.

Classify each run:

- `NORMALIZED_REPLAY`: one row exists and the losing caller receives the
  governed existing result after exact aggregate-fingerprint comparison.
- `SAFE_UNIQUE_CONFLICT`: one row exists, no overwrite/fork occurs, and the
  losing caller receives a uniqueness conflict with no mutation retry.
- `INTEGRITY_FAILURE`: more than one logical row, divergent lineage, overwrite,
  unsafe retry, unclassified failure, or any residue outside the disposable
  database.

The expected current-adapter classification is `SAFE_UNIQUE_CONFLICT`.
`INTEGRITY_FAILURE` is blocking. `NORMALIZED_REPLAY` may be recorded only when
the evidence proves exact fingerprint comparison; a generic swallowed conflict
does not qualify.

## 6. Stop conditions

Immediately stop, roll back if a transaction is open, and classify the run as
failed if any of these occurs:

- fixed branch/project/migration/hash evidence differs;
- ledger pre-count is not zero, a pending migration exists, or drift appears;
- a fixture lacks the exact synthetic prefix;
- transaction control or rollback assurance is lost;
- a positive assertion fails or a prohibited negative operation succeeds;
- an unexpected authorization, constraint, trigger, or repository result occurs;
- schema, migration history, application code, or environment changes;
- any prohibited external capability is invoked;
- independent post-check is not exactly zero total rows and zero prefix rows.

No corrective write is permitted. An uncertain or non-zero post-state is a
blocking incident requiring Platform Owner escalation and governed recovery.

## 7. Required post-execution evidence

From a new read-only session, prove:

1. total ledger rows = 0;
2. `GES-P6-1-CMV-%` rows = 0;
3. migration history is unchanged;
4. schema, grants, RLS, policies, constraints, indexes, and triggers are
   unchanged;
5. no notification, publication, QuickBooks, deployment, push, merge, or Phase
   6.2 action occurred.

The run report must include redacted commands, timestamps, assertion results,
expected-error SQLSTATE/message evidence, rollback evidence, concurrency
classification, before/during/after counts, blockers, warnings, and an explicit
statement that no synthetic row was committed.

## 8. Eligibility recommendation

The proposal is eligible for formal review. With zero blocking review findings,
the exact recommended approval is:

`APPROVE_PHASE_6_1_CONTROLLED_MUTATION_VERIFICATION_EXECUTION_USING_PROPOSAL_GES-P6-1-CMV-20260729-001`

The separately approved run completed with final status
`GES_DOCUMENT_PHASE_6_1_CONTROLLED_MUTATION_VERIFICATION_APPROVED`. Any repeat
execution requires new explicit authority.
