import fs from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const runId = "GES-P6-1-CMV-20260729T225921Z-A7F3";
const runtimeRoot = path.join(os.tmpdir(), "ges-p6-1-cmv-20260729t225921z-a7f3-runtime");
const databaseDir = path.join(os.tmpdir(), "ges-p6-1-cmv-20260729t225921z-a7f3-db");
const requireFromRuntime = createRequire(path.join(runtimeRoot, "package.json"));
const embeddedModule = requireFromRuntime("embedded-postgres");
const EmbeddedPostgres = embeddedModule.default ?? embeddedModule;

async function freePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : null;
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  if (!port) throw new Error("Unable to allocate disposable PostgreSQL port");
  return port;
}

function fixture() {
  const prefix = `${runId}-CONCURRENCY`;
  return {
    values: [
      `${prefix}-LEDGER-1`,
      `${prefix}-CORRELATION`,
      `${prefix}-DOCUMENT`,
      `${prefix}-VERSION`,
      `${prefix}-REVIEW`,
      `${prefix}-SESSION`,
      `${prefix}-EVIDENCE`,
      `${prefix}-CERTIFICATION`,
      "1".repeat(64),
      "2".repeat(64),
      "3".repeat(64),
      "4".repeat(64),
      "5".repeat(64),
      "6".repeat(64),
      "7".repeat(64),
      JSON.stringify({ documentReference: `${prefix}-DOCUMENT`, fingerprint: "1".repeat(64) }),
      JSON.stringify({ versionId: `${prefix}-VERSION`, fingerprint: "2".repeat(64) }),
      JSON.stringify({ sessionId: `${prefix}-REVIEW` }),
      JSON.stringify({ signatureSessionReference: `${prefix}-SESSION`, fingerprint: "3".repeat(64) }),
      JSON.stringify({ evidencePackageIdentity: `${prefix}-EVIDENCE`, finalEvidenceFingerprint: "4".repeat(64) }),
      JSON.stringify({ certificationIdentity: `${prefix}-CERTIFICATION`, fingerprint: "5".repeat(64) }),
      JSON.stringify([]),
      JSON.stringify({
        documentIdentity: `${prefix}-DOCUMENT`,
        versionIdentity: `${prefix}-VERSION`,
        previousLedgerReference: null,
      }),
      JSON.stringify({ runIdentity: runId, synthetic: true }),
      "2026-07-29T22:59:21.000Z",
    ],
  };
}

const insertSql = `
  insert into public.document_evidence_ledger (
    ledger_reference, correlation_identity, sequence,
    previous_ledger_reference, document_identity, version_identity,
    review_identity, signature_session_identity, evidence_package_identity,
    certification_identity, document_fingerprint, version_fingerprint,
    session_fingerprint, evidence_fingerprint, certification_fingerprint,
    lineage_fingerprint, aggregate_fingerprint, document_record,
    version_record, review_record, signature_session_record,
    evidence_package_record, certification_record, audit_timeline, lineage,
    phase6_record, recorded_at
  ) values (
    $1, $2, 1, null, $3, $4, $5, $6, $7, $8,
    $9, $10, $11, $12, $13, $14, $15,
    $16::jsonb, $17::jsonb, $18::jsonb, $19::jsonb, $20::jsonb,
    $21::jsonb, $22::jsonb, $23::jsonb, $24::jsonb, $25::timestamptz
  ) returning ledger_reference
`;

const port = await freePort();
const cluster = new EmbeddedPostgres({
  databaseDir,
  user: "postgres",
  password: "GES-CMV-DISPOSABLE-ONLY",
  port,
  persistent: false,
  onLog: () => {},
  onError: () => {},
});

let clientA;
let clientB;
let setup;
let result;
try {
  await cluster.initialise();
  await cluster.start();
  setup = cluster.getPgClient();
  await setup.connect();
  await setup.query("create role anon; create role authenticated; create role service_role;");
  const migration = await fs.readFile(
    path.resolve("supabase/migrations/20260729011312_phase_6_governed_document_evidence_ledger.sql"),
    "utf8",
  );
  await setup.query(migration);

  const schemaProof = await setup.query(`
    select count(*)::integer as column_count
    from information_schema.columns
    where table_schema = 'public' and table_name = 'document_evidence_ledger'
  `);
  if (schemaProof.rows[0].column_count !== 29) {
    throw new Error("Disposable schema does not match the 29-column ledger");
  }

  clientA = cluster.getPgClient();
  clientB = cluster.getPgClient();
  await Promise.all([clientA.connect(), clientB.connect()]);
  await Promise.all([
    clientA.query("set role service_role"),
    clientB.query("set role service_role"),
  ]);

  const { values } = fixture();
  const ledgerReference = values[0];

  // Exact current-adapter race shape: both pre-reads complete before either insert.
  const preReads = await Promise.all([
    clientA.query(
      "select phase6_record from public.document_evidence_ledger where ledger_reference = $1",
      [ledgerReference],
    ),
    clientB.query(
      "select phase6_record from public.document_evidence_ledger where ledger_reference = $1",
      [ledgerReference],
    ),
  ]);
  if (preReads.some((read) => read.rowCount !== 0)) {
    throw new Error("Disposable concurrency pre-read was not empty");
  }

  const attempts = await Promise.allSettled([
    clientA.query(insertSql, values),
    clientB.query(insertSql, values),
  ]);
  const successes = attempts.filter((attempt) => attempt.status === "fulfilled");
  const failures = attempts.filter((attempt) => attempt.status === "rejected");
  const databaseState = await setup.query(`
    select count(*)::integer as row_count,
           count(distinct ledger_reference)::integer as distinct_ledger_count,
           count(distinct aggregate_fingerprint)::integer as distinct_aggregate_count
    from public.document_evidence_ledger
    where ledger_reference = $1
  `, [ledgerReference]);
  const failureCodes = failures.map((attempt) => attempt.reason?.code ?? "UNCLASSIFIED");

  let classification = "INTEGRITY_FAILURE";
  if (
    successes.length === 1 &&
    failures.length === 1 &&
    failureCodes[0] === "23505" &&
    databaseState.rows[0].row_count === 1 &&
    databaseState.rows[0].distinct_ledger_count === 1 &&
    databaseState.rows[0].distinct_aggregate_count === 1
  ) {
    classification = "SAFE_UNIQUE_CONFLICT";
  }

  result = {
    runId,
    database: "DISPOSABLE_LOCAL_POSTGRESQL_17_6",
    linkedDatabaseTouched: false,
    schemaColumnCount: schemaProof.rows[0].column_count,
    adapterRaceShape: "TWO_EMPTY_PRE_READS_THEN_SIMULTANEOUS_IDENTICAL_INSERTS",
    preReadRowCounts: preReads.map((read) => read.rowCount),
    insertSuccesses: successes.length,
    insertFailures: failures.length,
    failureSqlstates: failureCodes,
    disposableRowCount: databaseState.rows[0].row_count,
    distinctLedgerCount: databaseState.rows[0].distinct_ledger_count,
    distinctAggregateCount: databaseState.rows[0].distinct_aggregate_count,
    classification,
  };
  if (classification === "INTEGRITY_FAILURE") {
    throw new Error(`Concurrency integrity classification failed: ${JSON.stringify(result)}`);
  }
} finally {
  await Promise.allSettled([
    clientA?.end(),
    clientB?.end(),
    setup?.end(),
  ]);
  await cluster.stop().catch(() => {});
  const expectedPrefix = path.join(os.tmpdir(), "ges-p6-1-cmv-");
  if (!databaseDir.toLowerCase().startsWith(expectedPrefix.toLowerCase())) {
    throw new Error("Refused disposable database cleanup outside approved temp prefix");
  }
  await fs.rm(databaseDir, { recursive: true, force: true });
}

const databaseResidue = await fs.stat(databaseDir).then(() => true).catch(() => false);
if (databaseResidue) throw new Error("Disposable database directory remains after cleanup");
console.log(JSON.stringify({ ...result, disposableDatabaseDestroyed: true }, null, 2));
