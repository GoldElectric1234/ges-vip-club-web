import "server-only";

import { deterministicFingerprint, stableSerialize } from "../document-fingerprint";
import {
  deepFreeze,
  ensureIsoTimestamp,
  ensureNonEmptyString,
  pushIssue,
  type ValidationIssue,
  type ValidationResult,
} from "../document-validation";
import {
  GES_DURABLE_EVIDENCE_SCHEMA_VERSION,
  type GesDurableEvidenceInput,
  type GesDurableEvidenceRecord,
  type GesDurableEvidenceRepository,
} from "./durable-evidence-types";

const identityFields = [
  "ledgerReference",
  "correlationIdentity",
  "documentIdentity",
  "versionIdentity",
  "reviewIdentity",
  "signatureSessionIdentity",
  "evidencePackageIdentity",
  "certificationIdentity",
  "documentFingerprint",
  "versionFingerprint",
  "sessionFingerprint",
  "evidenceFingerprint",
  "certificationFingerprint",
] as const;

export function assembleGesDurableEvidenceRecord(
  input: GesDurableEvidenceInput,
): ValidationResult<GesDurableEvidenceRecord> {
  const issues: ValidationIssue[] = [];
  for (const field of identityFields) ensureNonEmptyString(input[field], field, issues);
  const bindings = [
    ["documentRecord.documentReference", input.documentRecord.documentReference, input.documentIdentity],
    ["documentRecord.fingerprint", input.documentRecord.fingerprint, input.documentFingerprint],
    ["versionRecord.versionId", input.versionRecord.versionId, input.versionIdentity],
    ["versionRecord.fingerprint", input.versionRecord.fingerprint, input.versionFingerprint],
    ["reviewRecord.sessionId", input.reviewRecord.sessionId, input.reviewIdentity],
    [
      "signatureSessionRecord.signatureSessionReference",
      input.signatureSessionRecord.signatureSessionReference,
      input.signatureSessionIdentity,
    ],
    ["signatureSessionRecord.fingerprint", input.signatureSessionRecord.fingerprint, input.sessionFingerprint],
    [
      "evidencePackageRecord.evidencePackageIdentity",
      input.evidencePackageRecord.evidencePackageIdentity,
      input.evidencePackageIdentity,
    ],
    [
      "evidencePackageRecord.finalEvidenceFingerprint",
      input.evidencePackageRecord.finalEvidenceFingerprint,
      input.evidenceFingerprint,
    ],
    [
      "certificationRecord.certificationIdentity",
      input.certificationRecord.certificationIdentity,
      input.certificationIdentity,
    ],
    ["certificationRecord.fingerprint", input.certificationRecord.fingerprint, input.certificationFingerprint],
  ] as const;
  for (const [field, actual, expected] of bindings)
    if (actual !== expected) pushIssue(issues, field, "must match governed identity");
  ensureIsoTimestamp(input.recordedAt, "recordedAt", issues);
  if (!Number.isSafeInteger(input.sequence) || input.sequence < 1)
    pushIssue(issues, "sequence", "must be a positive safe integer");
  if (input.auditTimeline.length === 0)
    pushIssue(issues, "auditTimeline", "must contain at least one event");
  input.auditTimeline.forEach((event, index) => {
    ensureNonEmptyString(event.eventType, `auditTimeline.${index}.eventType`, issues);
    ensureNonEmptyString(event.fingerprint, `auditTimeline.${index}.fingerprint`, issues);
    if (event.sequence !== index + 1)
      pushIssue(issues, `auditTimeline.${index}.sequence`, "must be contiguous");
    if (event.correlationIdentity !== input.correlationIdentity)
      pushIssue(issues, `auditTimeline.${index}.correlationIdentity`, "must match");
    ensureIsoTimestamp(event.occurredAt, `auditTimeline.${index}.occurredAt`, issues);
    if (
      index > 0 &&
      Date.parse(event.occurredAt) < Date.parse(input.auditTimeline[index - 1]!.occurredAt)
    )
      pushIssue(issues, `auditTimeline.${index}.occurredAt`, "must be chronological");
  });
  if (input.lineage.documentIdentity !== input.documentIdentity)
    pushIssue(issues, "lineage.documentIdentity", "must match document identity");
  if (input.lineage.versionIdentity !== input.versionIdentity)
    pushIssue(issues, "lineage.versionIdentity", "must match version identity");
  const previousPair = [
    input.lineage.previousLedgerReference,
    input.lineage.previousAggregateFingerprint,
  ];
  if (previousPair.filter(Boolean).length === 1)
    pushIssue(issues, "lineage.previous", "reference and fingerprint must appear together");
  if (!input.lineage.previousLedgerReference && input.sequence !== 1)
    pushIssue(issues, "sequence", "must be 1 for the first lineage record");
  if (input.lineage.previousLedgerReference && input.sequence === 1)
    pushIssue(issues, "sequence", "must advance when previous lineage exists");
  if (issues.length) return { ok: false, issues };

  const lineageFingerprint = deterministicFingerprint(
    "ges-durable-evidence-lineage",
    stableSerialize(input.lineage),
  );
  const normalized = {
    ...input,
    schemaVersion: GES_DURABLE_EVIDENCE_SCHEMA_VERSION,
    immutable: true as const,
    lineageFingerprint,
  };
  return {
    ok: true,
    value: deepFreeze({
      ...normalized,
      aggregateFingerprint: deterministicFingerprint(
        "ges-durable-evidence-record",
        stableSerialize(normalized),
      ),
    }),
  };
}

export async function persistGesDurableEvidence(input: {
  readonly repository: GesDurableEvidenceRepository;
  readonly evidence: GesDurableEvidenceInput;
}) {
  const assembled = assembleGesDurableEvidenceRecord(input.evidence);
  if (!assembled.ok) return assembled;
  const result = await input.repository.append(assembled.value);
  return result.status === "DUPLICATE_CONFLICT" || result.status === "LINEAGE_CONFLICT"
    ? { ok: false as const, issues: [{ field: "repository", reason: result.status }] }
    : { ok: true as const, value: result };
}
