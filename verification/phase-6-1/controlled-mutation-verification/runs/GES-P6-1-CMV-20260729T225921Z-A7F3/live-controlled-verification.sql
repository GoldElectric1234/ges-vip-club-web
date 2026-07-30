begin;

set local statement_timeout = '20s';
set local lock_timeout = '5s';
set local application_name = 'GES-P6-1-CMV-20260729T225921Z-A7F3';

create temporary table phase6_cmv_results (
  ordinal integer primary key,
  verification_case text not null,
  result text not null,
  sqlstate text,
  evidence text not null
) on commit drop;

do $$
begin
  if (select count(*) from public.document_evidence_ledger) <> 0 then
    raise exception 'STOP: ledger pre-count is not zero';
  end if;
  if (select count(*) from public.document_evidence_ledger
      where ledger_reference like 'GES-P6-1-CMV-%'
         or correlation_identity like 'GES-P6-1-CMV-%') <> 0 then
    raise exception 'STOP: synthetic prefix pre-count is not zero';
  end if;
end
$$;

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
  'GES-P6-1-CMV-20260729T225921Z-A7F3-LEDGER-1',
  'GES-P6-1-CMV-20260729T225921Z-A7F3-CORRELATION-A', 1, null,
  'GES-P6-1-CMV-20260729T225921Z-A7F3-DOCUMENT',
  'GES-P6-1-CMV-20260729T225921Z-A7F3-VERSION',
  'GES-P6-1-CMV-20260729T225921Z-A7F3-REVIEW',
  'GES-P6-1-CMV-20260729T225921Z-A7F3-SESSION',
  'GES-P6-1-CMV-20260729T225921Z-A7F3-EVIDENCE',
  'GES-P6-1-CMV-20260729T225921Z-A7F3-CERTIFICATION',
  repeat('1', 64), repeat('2', 64), repeat('3', 64), repeat('4', 64),
  repeat('5', 64), repeat('6', 64), repeat('7', 64),
  jsonb_build_object('documentReference',
    'GES-P6-1-CMV-20260729T225921Z-A7F3-DOCUMENT', 'fingerprint', repeat('1', 64)),
  jsonb_build_object('versionId',
    'GES-P6-1-CMV-20260729T225921Z-A7F3-VERSION', 'fingerprint', repeat('2', 64)),
  jsonb_build_object('sessionId',
    'GES-P6-1-CMV-20260729T225921Z-A7F3-REVIEW'),
  jsonb_build_object('signatureSessionReference',
    'GES-P6-1-CMV-20260729T225921Z-A7F3-SESSION', 'fingerprint', repeat('3', 64)),
  jsonb_build_object('evidencePackageIdentity',
    'GES-P6-1-CMV-20260729T225921Z-A7F3-EVIDENCE',
    'finalEvidenceFingerprint', repeat('4', 64)),
  jsonb_build_object('certificationIdentity',
    'GES-P6-1-CMV-20260729T225921Z-A7F3-CERTIFICATION',
    'fingerprint', repeat('5', 64)),
  '[]'::jsonb,
  jsonb_build_object('documentIdentity',
    'GES-P6-1-CMV-20260729T225921Z-A7F3-DOCUMENT', 'versionIdentity',
    'GES-P6-1-CMV-20260729T225921Z-A7F3-VERSION',
    'previousLedgerReference', null),
  jsonb_build_object('runIdentity', 'GES-P6-1-CMV-20260729T225921Z-A7F3'),
  '2026-07-29T22:59:21Z'::timestamptz
);

do $$
begin
  if (select count(*) from public.document_evidence_ledger
      where ledger_reference = 'GES-P6-1-CMV-20260729T225921Z-A7F3-LEDGER-1') <> 1 then
    raise exception 'STOP: first append assertion failed';
  end if;
  insert into phase6_cmv_results values
    (1, 'FIRST_APPEND', 'PASS', null, 'one transaction-visible sequence-1 row');
end
$$;

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
  'GES-P6-1-CMV-20260729T225921Z-A7F3-LEDGER-2',
  'GES-P6-1-CMV-20260729T225921Z-A7F3-CORRELATION-A', 2,
  'GES-P6-1-CMV-20260729T225921Z-A7F3-LEDGER-1',
  'GES-P6-1-CMV-20260729T225921Z-A7F3-DOCUMENT',
  'GES-P6-1-CMV-20260729T225921Z-A7F3-VERSION',
  'GES-P6-1-CMV-20260729T225921Z-A7F3-REVIEW-2',
  'GES-P6-1-CMV-20260729T225921Z-A7F3-SESSION-2',
  'GES-P6-1-CMV-20260729T225921Z-A7F3-EVIDENCE-2',
  'GES-P6-1-CMV-20260729T225921Z-A7F3-CERTIFICATION-2',
  repeat('1', 64), repeat('2', 64), repeat('8', 64), repeat('9', 64),
  repeat('a', 64), repeat('b', 64), repeat('c', 64),
  jsonb_build_object('documentReference',
    'GES-P6-1-CMV-20260729T225921Z-A7F3-DOCUMENT', 'fingerprint', repeat('1', 64)),
  jsonb_build_object('versionId',
    'GES-P6-1-CMV-20260729T225921Z-A7F3-VERSION', 'fingerprint', repeat('2', 64)),
  jsonb_build_object('sessionId',
    'GES-P6-1-CMV-20260729T225921Z-A7F3-REVIEW-2'),
  jsonb_build_object('signatureSessionReference',
    'GES-P6-1-CMV-20260729T225921Z-A7F3-SESSION-2', 'fingerprint', repeat('8', 64)),
  jsonb_build_object('evidencePackageIdentity',
    'GES-P6-1-CMV-20260729T225921Z-A7F3-EVIDENCE-2',
    'finalEvidenceFingerprint', repeat('9', 64)),
  jsonb_build_object('certificationIdentity',
    'GES-P6-1-CMV-20260729T225921Z-A7F3-CERTIFICATION-2',
    'fingerprint', repeat('a', 64)),
  '[]'::jsonb,
  jsonb_build_object('documentIdentity',
    'GES-P6-1-CMV-20260729T225921Z-A7F3-DOCUMENT', 'versionIdentity',
    'GES-P6-1-CMV-20260729T225921Z-A7F3-VERSION', 'previousLedgerReference',
    'GES-P6-1-CMV-20260729T225921Z-A7F3-LEDGER-1',
    'previousAggregateFingerprint', repeat('7', 64)),
  jsonb_build_object('runIdentity', 'GES-P6-1-CMV-20260729T225921Z-A7F3'),
  '2026-07-29T23:00:21Z'::timestamptz
);

do $$
begin
  if (select count(*) from public.document_evidence_ledger
      where correlation_identity = 'GES-P6-1-CMV-20260729T225921Z-A7F3-CORRELATION-A') <> 2 then
    raise exception 'STOP: sequential append assertion failed';
  end if;
  insert into phase6_cmv_results values
    (2, 'SEQUENTIAL_APPEND', 'PASS', null, 'sequence 2 references exact sequence-1 aggregate');
end
$$;

do $$
declare
  found_count integer;
  found_fingerprint text;
begin
  select count(*), min(aggregate_fingerprint)
    into found_count, found_fingerprint
  from public.document_evidence_ledger
  where ledger_reference = 'GES-P6-1-CMV-20260729T225921Z-A7F3-LEDGER-1';
  if found_count <> 1 or found_fingerprint <> repeat('7', 64) then
    raise exception 'STOP: idempotent replay resolution failed';
  end if;
  if (select count(*) from public.document_evidence_ledger) <> 2 then
    raise exception 'STOP: idempotent replay attempted an insert';
  end if;
  insert into phase6_cmv_results values
    (3, 'IDEMPOTENT_REPLAY_RESOLUTION', 'PASS', null,
     'existing ledger identity resolved by exact aggregate fingerprint; no insert');
end
$$;

do $$
declare
  recovered integer[];
  predecessors text[];
begin
  select array_agg(sequence order by sequence),
         array_agg(coalesce(previous_ledger_reference, '<NULL>') order by sequence)
    into recovered, predecessors
  from public.document_evidence_ledger
  where correlation_identity = 'GES-P6-1-CMV-20260729T225921Z-A7F3-CORRELATION-A';
  if recovered <> array[1, 2]
     or predecessors <> array['<NULL>',
       'GES-P6-1-CMV-20260729T225921Z-A7F3-LEDGER-1'] then
    raise exception 'STOP: deterministic recovery assertion failed';
  end if;
  insert into phase6_cmv_results values
    (4, 'DETERMINISTIC_RECOVERY_ORDERING', 'PASS', null,
     'ordered sequences [1,2] with exact predecessor linkage');
end
$$;

do $$
declare rejected boolean := false; state text; message text;
begin
  begin
    update public.document_evidence_ledger
    set phase6_record = '{"unexpected":true}'::jsonb
    where ledger_reference = 'GES-P6-1-CMV-20260729T225921Z-A7F3-LEDGER-1';
  exception when others then
    rejected := true;
    get stacked diagnostics state = returned_sqlstate, message = message_text;
  end;
  if not rejected or state <> 'P0001' or message <> 'Phase 6 evidence ledger is append-only' then
    raise exception 'STOP: UPDATE rejection assertion failed';
  end if;
  insert into phase6_cmv_results values (5, 'UPDATE_REJECTION', 'PASS', state, message);
end
$$;

do $$
declare rejected boolean := false; state text; message text;
begin
  begin
    delete from public.document_evidence_ledger
    where ledger_reference = 'GES-P6-1-CMV-20260729T225921Z-A7F3-LEDGER-1';
  exception when others then
    rejected := true;
    get stacked diagnostics state = returned_sqlstate, message = message_text;
  end;
  if not rejected or state <> 'P0001' or message <> 'Phase 6 evidence ledger is append-only' then
    raise exception 'STOP: DELETE rejection assertion failed';
  end if;
  insert into phase6_cmv_results values (6, 'DELETE_REJECTION', 'PASS', state, message);
end
$$;

do $$
declare rejected boolean := false; state text; message text;
begin
  begin
    insert into public.document_evidence_ledger
    select gen_random_uuid(),
      'GES-P6-1-CMV-20260729T225921Z-A7F3-LEDGER-DUPSEQ', correlation_identity,
      sequence, previous_ledger_reference, document_identity, version_identity,
      review_identity, signature_session_identity, evidence_package_identity,
      certification_identity, document_fingerprint, version_fingerprint,
      session_fingerprint, evidence_fingerprint, certification_fingerprint,
      lineage_fingerprint, repeat('d', 64), document_record, version_record,
      review_record, signature_session_record, evidence_package_record,
      certification_record, audit_timeline, lineage, phase6_record, recorded_at,
      immutable
    from public.document_evidence_ledger
    where ledger_reference = 'GES-P6-1-CMV-20260729T225921Z-A7F3-LEDGER-2';
  exception when others then
    rejected := true;
    get stacked diagnostics state = returned_sqlstate, message = message_text;
  end;
  if not rejected or state <> '23505' then
    raise exception 'STOP: duplicate sequence rejection assertion failed';
  end if;
  insert into phase6_cmv_results values
    (7, 'DUPLICATE_SEQUENCE_REJECTION', 'PASS', state,
     'unique correlation-sequence constraint rejected duplicate');
end
$$;

do $$
declare rejected boolean := false; state text; message text;
begin
  begin
    insert into public.document_evidence_ledger
    select gen_random_uuid(),
      'GES-P6-1-CMV-20260729T225921Z-A7F3-LEDGER-INVALIDSEQ',
      'GES-P6-1-CMV-20260729T225921Z-A7F3-CORRELATION-INVALID', 2, null,
      document_identity, version_identity, review_identity,
      signature_session_identity, evidence_package_identity,
      certification_identity, document_fingerprint, version_fingerprint,
      session_fingerprint, evidence_fingerprint, certification_fingerprint,
      lineage_fingerprint, repeat('e', 64), document_record, version_record,
      review_record, signature_session_record, evidence_package_record,
      certification_record, audit_timeline,
      jsonb_set(jsonb_set(lineage, '{previousLedgerReference}', 'null'::jsonb),
        '{previousAggregateFingerprint}', 'null'::jsonb),
      phase6_record, recorded_at, immutable
    from public.document_evidence_ledger
    where ledger_reference = 'GES-P6-1-CMV-20260729T225921Z-A7F3-LEDGER-2';
  exception when others then
    rejected := true;
    get stacked diagnostics state = returned_sqlstate, message = message_text;
  end;
  if not rejected or state <> 'P0001'
     or message <> 'Sequential Phase 6 ledger record requires a predecessor' then
    raise exception 'STOP: invalid sequence rejection assertion failed';
  end if;
  insert into phase6_cmv_results values (8, 'INVALID_SEQUENCE_REJECTION', 'PASS', state, message);
end
$$;

do $$
declare rejected boolean := false; state text; message text;
begin
  begin
    insert into public.document_evidence_ledger
    select gen_random_uuid(),
      'GES-P6-1-CMV-20260729T225921Z-A7F3-LEDGER-BROKEN', correlation_identity,
      3, ledger_reference, document_identity, version_identity, review_identity,
      signature_session_identity, evidence_package_identity,
      certification_identity, document_fingerprint, version_fingerprint,
      session_fingerprint, evidence_fingerprint, certification_fingerprint,
      lineage_fingerprint, repeat('f', 64), document_record, version_record,
      review_record, signature_session_record, evidence_package_record,
      certification_record, audit_timeline,
      jsonb_build_object('documentIdentity', document_identity,
        'versionIdentity', version_identity, 'previousLedgerReference', ledger_reference,
        'previousAggregateFingerprint', repeat('0', 64)),
      phase6_record, recorded_at, immutable
    from public.document_evidence_ledger
    where ledger_reference = 'GES-P6-1-CMV-20260729T225921Z-A7F3-LEDGER-2';
  exception when others then
    rejected := true;
    get stacked diagnostics state = returned_sqlstate, message = message_text;
  end;
  if not rejected or state <> 'P0001' or message <> 'Phase 6 ledger lineage is invalid' then
    raise exception 'STOP: broken lineage rejection assertion failed';
  end if;
  insert into phase6_cmv_results values (9, 'BROKEN_LINEAGE_REJECTION', 'PASS', state, message);
end
$$;

do $$
declare rejected boolean := false; state text; message text;
begin
  begin
    insert into public.document_evidence_ledger
    select gen_random_uuid(),
      'GES-P6-1-CMV-20260729T225921Z-A7F3-LEDGER-CROSSCORR',
      'GES-P6-1-CMV-20260729T225921Z-A7F3-CORRELATION-B', 2,
      ledger_reference, document_identity, version_identity, review_identity,
      signature_session_identity, evidence_package_identity,
      certification_identity, document_fingerprint, version_fingerprint,
      session_fingerprint, evidence_fingerprint, certification_fingerprint,
      lineage_fingerprint, repeat('0', 63) || '1', document_record, version_record,
      review_record, signature_session_record, evidence_package_record,
      certification_record, audit_timeline,
      jsonb_build_object('documentIdentity', document_identity,
        'versionIdentity', version_identity, 'previousLedgerReference', ledger_reference,
        'previousAggregateFingerprint', aggregate_fingerprint),
      phase6_record, recorded_at, immutable
    from public.document_evidence_ledger
    where ledger_reference = 'GES-P6-1-CMV-20260729T225921Z-A7F3-LEDGER-1';
  exception when others then
    rejected := true;
    get stacked diagnostics state = returned_sqlstate, message = message_text;
  end;
  if not rejected or state <> 'P0001' or message <> 'Phase 6 ledger lineage is invalid' then
    raise exception 'STOP: cross-correlation lineage rejection assertion failed';
  end if;
  insert into phase6_cmv_results values
    (10, 'CROSS_CORRELATION_LINEAGE_REJECTION', 'PASS', state, message);
end
$$;

do $$
declare rejected boolean := false; state text; message text;
begin
  begin
    insert into public.document_evidence_ledger
    select gen_random_uuid(),
      'GES-P6-1-CMV-20260729T225921Z-A7F3-LEDGER-PAYLOAD', correlation_identity,
      3, ledger_reference, document_identity, version_identity, review_identity,
      signature_session_identity, evidence_package_identity,
      certification_identity, document_fingerprint, version_fingerprint,
      session_fingerprint, evidence_fingerprint, certification_fingerprint,
      lineage_fingerprint, repeat('0', 63) || '2',
      jsonb_set(document_record, '{documentReference}',
        to_jsonb('GES-P6-1-CMV-20260729T225921Z-A7F3-MISMATCH'::text)),
      version_record, review_record, signature_session_record,
      evidence_package_record, certification_record, audit_timeline,
      jsonb_build_object('documentIdentity', document_identity,
        'versionIdentity', version_identity, 'previousLedgerReference', ledger_reference,
        'previousAggregateFingerprint', aggregate_fingerprint),
      phase6_record, recorded_at, immutable
    from public.document_evidence_ledger
    where ledger_reference = 'GES-P6-1-CMV-20260729T225921Z-A7F3-LEDGER-2';
  exception when others then
    rejected := true;
    get stacked diagnostics state = returned_sqlstate, message = message_text;
  end;
  if not rejected or state <> '23514' then
    raise exception 'STOP: payload mismatch rejection assertion failed';
  end if;
  insert into phase6_cmv_results values
    (11, 'PAYLOAD_MISMATCH_REJECTION', 'PASS', state,
     'document payload binding constraint rejected mismatch');
end
$$;

do $$
begin
  if (select count(*) from public.document_evidence_ledger) <> 2 then
    raise exception 'STOP: unexpected transaction-visible ledger count';
  end if;
  if (select count(*) from public.document_evidence_ledger
      where ledger_reference like 'GES-P6-1-CMV-20260729T225921Z-A7F3-%'
         or correlation_identity like 'GES-P6-1-CMV-20260729T225921Z-A7F3-%') <> 2 then
    raise exception 'STOP: unexpected transaction-visible synthetic count';
  end if;
  insert into phase6_cmv_results values
    (12, 'DURING_TRANSACTION_STATE', 'PASS', null,
     'exactly two approved synthetic rows visible; all negative attempts left no row');
end
$$;

select jsonb_build_object(
  'runId', 'GES-P6-1-CMV-20260729T225921Z-A7F3',
  'transactionState', 'OPEN_BEFORE_REQUIRED_ROLLBACK',
  'ledgerRowsVisible', (select count(*) from public.document_evidence_ledger),
  'results', (select jsonb_agg(to_jsonb(r) order by ordinal) from phase6_cmv_results r)
) as controlled_mutation_evidence;

rollback;
