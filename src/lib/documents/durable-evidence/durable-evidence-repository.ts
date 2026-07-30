import { deepFreeze } from "../document-validation";
import type {
  GesDurableEvidenceRecord,
  GesDurableEvidenceRepository,
} from "./durable-evidence-types";

export function createInMemoryGesDurableEvidenceRepository(): GesDurableEvidenceRepository {
  const records = new Map<string, GesDurableEvidenceRecord>();
  return {
    async append(record) {
      const existing = records.get(record.ledgerReference);
      if (existing)
        return existing.aggregateFingerprint === record.aggregateFingerprint
          ? deepFreeze({ status: "IDEMPOTENT_REPLAY" as const, record: existing })
          : deepFreeze({ status: "DUPLICATE_CONFLICT" as const });
      if (record.lineage.previousLedgerReference) {
        const previous = records.get(record.lineage.previousLedgerReference);
        if (
          !previous ||
          previous.aggregateFingerprint !== record.lineage.previousAggregateFingerprint ||
          previous.documentIdentity !== record.documentIdentity ||
          previous.correlationIdentity !== record.correlationIdentity ||
          previous.sequence + 1 !== record.sequence
        )
          return deepFreeze({ status: "LINEAGE_CONFLICT" as const });
      } else if (
        [...records.values()].some(
          (candidate) => candidate.correlationIdentity === record.correlationIdentity,
        )
      )
        return deepFreeze({ status: "LINEAGE_CONFLICT" as const });
      records.set(record.ledgerReference, record);
      return deepFreeze({ status: "APPENDED" as const, record });
    },
    async findByLedgerReference(reference) {
      return records.get(reference) ?? null;
    },
    async recoverByCorrelation(correlationIdentity) {
      return deepFreeze(
        [...records.values()]
          .filter((record) => record.correlationIdentity === correlationIdentity)
          .sort((left, right) => left.sequence - right.sequence),
      );
    },
  };
}
