export const GES_DURABLE_EVIDENCE_SCHEMA_VERSION = "6.0.0" as const;

export interface GesDurableAuditEntry {
  readonly sequence: number;
  readonly eventType: string;
  readonly occurredAt: string;
  readonly correlationIdentity: string;
  readonly fingerprint: string;
}

export interface GesDurableEvidenceLineage {
  readonly previousLedgerReference: string | null;
  readonly previousAggregateFingerprint: string | null;
  readonly documentIdentity: string;
  readonly versionIdentity: string;
  readonly supersedesVersionIdentity: string | null;
}

export interface GesDurableEvidenceInput {
  readonly ledgerReference: string;
  readonly correlationIdentity: string;
  readonly sequence: number;
  readonly recordedAt: string;
  readonly documentIdentity: string;
  readonly versionIdentity: string;
  readonly reviewIdentity: string;
  readonly signatureSessionIdentity: string;
  readonly evidencePackageIdentity: string;
  readonly certificationIdentity: string;
  readonly documentFingerprint: string;
  readonly versionFingerprint: string;
  readonly sessionFingerprint: string;
  readonly evidenceFingerprint: string;
  readonly certificationFingerprint: string;
  readonly documentRecord: Readonly<Record<string, unknown>>;
  readonly versionRecord: Readonly<Record<string, unknown>>;
  readonly reviewRecord: Readonly<Record<string, unknown>>;
  readonly signatureSessionRecord: Readonly<Record<string, unknown>>;
  readonly evidencePackageRecord: Readonly<Record<string, unknown>>;
  readonly certificationRecord: Readonly<Record<string, unknown>>;
  readonly auditTimeline: readonly GesDurableAuditEntry[];
  readonly lineage: GesDurableEvidenceLineage;
}

export interface GesDurableEvidenceRecord extends GesDurableEvidenceInput {
  readonly schemaVersion: typeof GES_DURABLE_EVIDENCE_SCHEMA_VERSION;
  readonly immutable: true;
  readonly lineageFingerprint: string;
  readonly aggregateFingerprint: string;
}

export type GesDurableEvidenceAppendResult =
  | { readonly status: "APPENDED"; readonly record: GesDurableEvidenceRecord }
  | { readonly status: "IDEMPOTENT_REPLAY"; readonly record: GesDurableEvidenceRecord }
  | { readonly status: "DUPLICATE_CONFLICT" | "LINEAGE_CONFLICT" };

export interface GesDurableEvidenceRepository {
  append(record: GesDurableEvidenceRecord): Promise<GesDurableEvidenceAppendResult>;
  findByLedgerReference(reference: string): Promise<GesDurableEvidenceRecord | null>;
  recoverByCorrelation(correlationIdentity: string): Promise<readonly GesDurableEvidenceRecord[]>;
}
