import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  GesDurableEvidenceRecord,
  GesDurableEvidenceRepository,
} from "@/lib/documents/durable-evidence/durable-evidence-types";

type LedgerRow = Readonly<Record<string, unknown>>;

function toRow(record: GesDurableEvidenceRecord): LedgerRow {
  return {
    ledger_reference: record.ledgerReference,
    correlation_identity: record.correlationIdentity,
    sequence: record.sequence,
    previous_ledger_reference: record.lineage.previousLedgerReference,
    document_identity: record.documentIdentity,
    version_identity: record.versionIdentity,
    review_identity: record.reviewIdentity,
    signature_session_identity: record.signatureSessionIdentity,
    evidence_package_identity: record.evidencePackageIdentity,
    certification_identity: record.certificationIdentity,
    document_fingerprint: record.documentFingerprint,
    version_fingerprint: record.versionFingerprint,
    session_fingerprint: record.sessionFingerprint,
    evidence_fingerprint: record.evidenceFingerprint,
    certification_fingerprint: record.certificationFingerprint,
    lineage_fingerprint: record.lineageFingerprint,
    aggregate_fingerprint: record.aggregateFingerprint,
    document_record: record.documentRecord,
    version_record: record.versionRecord,
    review_record: record.reviewRecord,
    signature_session_record: record.signatureSessionRecord,
    evidence_package_record: record.evidencePackageRecord,
    certification_record: record.certificationRecord,
    audit_timeline: record.auditTimeline,
    lineage: record.lineage,
    phase6_record: record,
    recorded_at: record.recordedAt,
    immutable: true,
  };
}

export function createSupabaseGesDurableEvidenceRepository(
  client: SupabaseClient,
): GesDurableEvidenceRepository {
  const findByLedgerReference = async (reference: string) => {
    const { data, error } = await client
      .from("document_evidence_ledger")
      .select("phase6_record")
      .eq("ledger_reference", reference)
      .maybeSingle();
    if (error) throw new Error(`Unable to recover Phase 6 evidence: ${error.message}`);
    return (data?.phase6_record as GesDurableEvidenceRecord | undefined) ?? null;
  };

  return {
    async append(record) {
      const existing = await findByLedgerReference(record.ledgerReference);
      if (existing)
        return existing.aggregateFingerprint === record.aggregateFingerprint
          ? { status: "IDEMPOTENT_REPLAY", record: existing }
          : { status: "DUPLICATE_CONFLICT" };
      if (record.lineage.previousLedgerReference) {
        const previous = await findByLedgerReference(record.lineage.previousLedgerReference);
        if (
          !previous ||
          previous.aggregateFingerprint !== record.lineage.previousAggregateFingerprint ||
          previous.documentIdentity !== record.documentIdentity ||
          previous.correlationIdentity !== record.correlationIdentity ||
          previous.sequence + 1 !== record.sequence
        )
          return { status: "LINEAGE_CONFLICT" };
      }
      const { error } = await client.from("document_evidence_ledger").insert(toRow(record));
      if (error) throw new Error(`Unable to append Phase 6 evidence: ${error.message}`);
      return { status: "APPENDED", record };
    },
    findByLedgerReference,
    async recoverByCorrelation(correlationIdentity) {
      const { data, error } = await client
        .from("document_evidence_ledger")
        .select("phase6_record")
        .eq("correlation_identity", correlationIdentity)
        .order("sequence", { ascending: true });
      if (error) throw new Error(`Unable to recover Phase 6 lineage: ${error.message}`);
      return (data ?? []).flatMap((row) => {
        const record = row.phase6_record as GesDurableEvidenceRecord | undefined;
        return record ? [record] : [];
      });
    },
  };
}
