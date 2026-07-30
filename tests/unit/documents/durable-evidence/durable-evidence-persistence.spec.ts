import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  assembleGesDurableEvidenceRecord,
  createInMemoryGesDurableEvidenceRepository,
  persistGesDurableEvidence,
  type GesDurableEvidenceInput,
} from "@/lib/documents/durable-evidence";
import { createSupabaseGesDurableEvidenceRepository } from "@/lib/ges-document-durable-evidence-persistence.server";

const base = (overrides: Partial<GesDurableEvidenceInput> = {}): GesDurableEvidenceInput => ({
  ledgerReference: "LEDGER-1",
  correlationIdentity: "CORR-1",
  sequence: 1,
  recordedAt: "2026-07-29T01:00:00.000Z",
  documentIdentity: "DOC-1",
  versionIdentity: "VER-1",
  reviewIdentity: "REVIEW-1",
  signatureSessionIdentity: "SESSION-1",
  evidencePackageIdentity: "EVIDENCE-1",
  certificationIdentity: "CERT-1",
  documentFingerprint: "doc-fp",
  versionFingerprint: "version-fp",
  sessionFingerprint: "session-fp",
  evidenceFingerprint: "evidence-fp",
  certificationFingerprint: "cert-fp",
  documentRecord: { documentReference: "DOC-1", fingerprint: "doc-fp" },
  versionRecord: { versionId: "VER-1", fingerprint: "version-fp" },
  reviewRecord: { sessionId: "REVIEW-1" },
  signatureSessionRecord: {
    signatureSessionReference: "SESSION-1",
    fingerprint: "session-fp",
  },
  evidencePackageRecord: {
    evidencePackageIdentity: "EVIDENCE-1",
    finalEvidenceFingerprint: "evidence-fp",
  },
  certificationRecord: {
    certificationIdentity: "CERT-1",
    fingerprint: "cert-fp",
  },
  auditTimeline: [{
    sequence: 1,
    eventType: "CERTIFICATION_RECORDED",
    occurredAt: "2026-07-29T00:59:00.000Z",
    correlationIdentity: "CORR-1",
    fingerprint: "audit-fp",
  }],
  lineage: {
    previousLedgerReference: null,
    previousAggregateFingerprint: null,
    documentIdentity: "DOC-1",
    versionIdentity: "VER-1",
    supersedesVersionIdentity: null,
  },
  ...overrides,
});

test("assembles a deterministic deeply immutable aggregate", () => {
  const first = assembleGesDurableEvidenceRecord(base());
  const second = assembleGesDurableEvidenceRecord(base());
  expect(first).toEqual(second);
  expect(first.ok).toBe(true);
  if (!first.ok) return;
  expect(first.value.schemaVersion).toBe("6.0.0");
  expect(first.value.immutable).toBe(true);
  expect(Object.isFrozen(first.value)).toBe(true);
});

test("appends without overwrite and protects duplicate/replay identity", async () => {
  const repository = createInMemoryGesDurableEvidenceRepository();
  const first = await persistGesDurableEvidence({ repository, evidence: base() });
  const replay = await persistGesDurableEvidence({ repository, evidence: base() });
  const conflict = await persistGesDurableEvidence({
    repository,
    evidence: base({
      certificationFingerprint: "changed",
      certificationRecord: { certificationIdentity: "CERT-1", fingerprint: "changed" },
    }),
  });
  expect(first.ok && first.value.status).toBe("APPENDED");
  expect(replay.ok && replay.value.status).toBe("IDEMPOTENT_REPLAY");
  expect(conflict).toMatchObject({ ok: false });
  const recovered = await repository.findByLedgerReference("LEDGER-1");
  expect(recovered?.certificationFingerprint).toBe("cert-fp");
});

test("preserves immutable lineage and recovers it in sequence", async () => {
  const repository = createInMemoryGesDurableEvidenceRepository();
  const first = assembleGesDurableEvidenceRecord(base());
  expect(first.ok).toBe(true);
  if (!first.ok) return;
  await repository.append(first.value);
  const secondInput = base({
    ledgerReference: "LEDGER-2",
    sequence: 2,
    versionIdentity: "VER-2",
    versionFingerprint: "version-2-fp",
    versionRecord: { versionId: "VER-2", fingerprint: "version-2-fp" },
    recordedAt: "2026-07-29T02:00:00.000Z",
    lineage: {
      previousLedgerReference: first.value.ledgerReference,
      previousAggregateFingerprint: first.value.aggregateFingerprint,
      documentIdentity: "DOC-1",
      versionIdentity: "VER-2",
      supersedesVersionIdentity: "VER-1",
    },
  });
  const second = await persistGesDurableEvidence({ repository, evidence: secondInput });
  expect(second.ok && second.value.status).toBe("APPENDED");
  expect((await repository.recoverByCorrelation("CORR-1")).map((item) => item.sequence))
    .toEqual([1, 2]);
  const broken = await persistGesDurableEvidence({
    repository,
    evidence: base({
      ledgerReference: "LEDGER-3",
      sequence: 3,
      lineage: {
        previousLedgerReference: "LEDGER-2",
        previousAggregateFingerprint: "wrong",
        documentIdentity: "DOC-1",
        versionIdentity: "VER-1",
        supersedesVersionIdentity: null,
      },
    }),
  });
  expect(broken).toMatchObject({ ok: false });
  const crossCorrelation = await persistGesDurableEvidence({
    repository,
    evidence: base({
      ledgerReference: "LEDGER-X",
      correlationIdentity: "CORR-X",
      sequence: 2,
      auditTimeline: [{
        ...base().auditTimeline[0]!,
        correlationIdentity: "CORR-X",
      }],
      lineage: {
        previousLedgerReference: first.value.ledgerReference,
        previousAggregateFingerprint: first.value.aggregateFingerprint,
        documentIdentity: "DOC-1",
        versionIdentity: "VER-1",
        supersedesVersionIdentity: null,
      },
    }),
  });
  expect(crossCorrelation).toMatchObject({ ok: false });
});

test("rejects inconsistent audit, identity, and lineage inputs", () => {
  expect(assembleGesDurableEvidenceRecord(base({ reviewIdentity: "" })).ok).toBe(false);
  expect(assembleGesDurableEvidenceRecord(base({
    certificationRecord: { certificationIdentity: "OTHER", fingerprint: "cert-fp" },
  })).ok).toBe(false);
  expect(assembleGesDurableEvidenceRecord(base({
    auditTimeline: [{ ...base().auditTimeline[0]!, correlationIdentity: "OTHER" }],
  })).ok).toBe(false);
  expect(assembleGesDurableEvidenceRecord(base({
    lineage: { ...base().lineage, previousLedgerReference: "LEDGER-0" },
  })).ok).toBe(false);
});

test("migration enforces server-only append-only durable storage", () => {
  const migration = readFileSync(
    "supabase/migrations/20260729011312_phase_6_governed_document_evidence_ledger.sql",
    "utf8",
  );
  expect(migration).toContain("enable row level security");
  expect(migration).toContain("revoke all on public.document_evidence_ledger from public, anon, authenticated");
  expect(migration).toContain("revoke update, delete on public.document_evidence_ledger from service_role");
  expect(migration).toContain("before update or delete on public.document_evidence_ledger");
  expect(migration).toContain("document_evidence_ledger_certification_payload_binding");
  expect(migration).toContain("predecessor.correlation_identity <> new.correlation_identity");
});

test("Supabase adapter uses insert-only persistence and ordered recovery", async () => {
  const rows = new Map<string, Record<string, unknown>>();
  const operations: string[] = [];
  const client = {
    from() {
      return {
        insert(row: Record<string, unknown>) {
          operations.push("insert");
          rows.set(String(row.ledger_reference), row);
          return Promise.resolve({ error: null });
        },
        select() {
          operations.push("select");
          let reference: string | null = null;
          let correlation: string | null = null;
          return {
            eq(field: string, value: string) {
              if (field === "ledger_reference") reference = value;
              if (field === "correlation_identity") correlation = value;
              return this;
            },
            async maybeSingle() {
              const row = reference ? rows.get(reference) : undefined;
              return { data: row ? { phase6_record: row.phase6_record } : null, error: null };
            },
            async order() {
              const data = [...rows.values()]
                .filter((row) => row.correlation_identity === correlation)
                .sort((a, b) => Number(a.sequence) - Number(b.sequence))
                .map((row) => ({ phase6_record: row.phase6_record }));
              return { data, error: null };
            },
          };
        },
      };
    },
  } as unknown as SupabaseClient;
  const repository = createSupabaseGesDurableEvidenceRepository(client);
  const record = assembleGesDurableEvidenceRecord(base());
  expect(record.ok).toBe(true);
  if (!record.ok) return;
  expect((await repository.append(record.value)).status).toBe("APPENDED");
  expect((await repository.append(record.value)).status).toBe("IDEMPOTENT_REPLAY");
  expect(await repository.recoverByCorrelation("CORR-1")).toEqual([record.value]);
  expect(operations.filter((operation) => operation === "insert")).toHaveLength(1);
  expect(operations).not.toContain("update");
  expect(operations).not.toContain("delete");
  expect(operations).not.toContain("upsert");
});
