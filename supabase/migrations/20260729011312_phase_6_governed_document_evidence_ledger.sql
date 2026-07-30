-- GES Digital Documents & Signature Engine Phase 6
-- Governed durable audit and evidence persistence.
-- This ledger is append-only and server-writable. It enables no delivery,
-- publication, public verification, retention execution, or QuickBooks write.

begin;

create extension if not exists pgcrypto;

create table if not exists public.document_evidence_ledger (
  id uuid primary key default gen_random_uuid(),
  ledger_reference text not null unique,
  correlation_identity text not null,
  sequence integer not null check (sequence > 0),
  previous_ledger_reference text null
    references public.document_evidence_ledger(ledger_reference) on delete restrict,
  document_identity text not null,
  version_identity text not null,
  review_identity text not null,
  signature_session_identity text not null,
  evidence_package_identity text not null,
  certification_identity text not null,
  document_fingerprint text not null,
  version_fingerprint text not null,
  session_fingerprint text not null,
  evidence_fingerprint text not null,
  certification_fingerprint text not null,
  lineage_fingerprint text not null,
  aggregate_fingerprint text not null unique,
  document_record jsonb not null,
  version_record jsonb not null,
  review_record jsonb not null,
  signature_session_record jsonb not null,
  evidence_package_record jsonb not null,
  certification_record jsonb not null,
  audit_timeline jsonb not null,
  lineage jsonb not null,
  phase6_record jsonb not null,
  recorded_at timestamptz not null,
  immutable boolean not null default true check (immutable),
  constraint document_evidence_ledger_sequence_unique
    unique (correlation_identity, sequence),
  constraint document_evidence_ledger_previous_not_self
    check (previous_ledger_reference is null or previous_ledger_reference <> ledger_reference),
  constraint document_evidence_ledger_document_payload_binding
    check (
      document_record ->> 'documentReference' = document_identity
      and document_record ->> 'fingerprint' = document_fingerprint
    ),
  constraint document_evidence_ledger_version_payload_binding
    check (
      version_record ->> 'versionId' = version_identity
      and version_record ->> 'fingerprint' = version_fingerprint
    ),
  constraint document_evidence_ledger_review_payload_binding
    check (review_record ->> 'sessionId' = review_identity),
  constraint document_evidence_ledger_session_payload_binding
    check (
      signature_session_record ->> 'signatureSessionReference' = signature_session_identity
      and signature_session_record ->> 'fingerprint' = session_fingerprint
    ),
  constraint document_evidence_ledger_evidence_payload_binding
    check (
      evidence_package_record ->> 'evidencePackageIdentity' = evidence_package_identity
      and evidence_package_record ->> 'finalEvidenceFingerprint' = evidence_fingerprint
    ),
  constraint document_evidence_ledger_certification_payload_binding
    check (
      certification_record ->> 'certificationIdentity' = certification_identity
      and certification_record ->> 'fingerprint' = certification_fingerprint
    )
);

create index if not exists document_evidence_ledger_document_lineage_idx
  on public.document_evidence_ledger(document_identity, sequence);
create index if not exists document_evidence_ledger_version_idx
  on public.document_evidence_ledger(version_identity);
create index if not exists document_evidence_ledger_correlation_idx
  on public.document_evidence_ledger(correlation_identity, sequence);

alter table public.document_evidence_ledger enable row level security;

revoke all on public.document_evidence_ledger from public, anon, authenticated;
grant select, insert on public.document_evidence_ledger to service_role;
revoke update, delete on public.document_evidence_ledger from service_role;

create policy "Phase6 service role can append evidence ledger"
on public.document_evidence_ledger for insert
to service_role
with check (immutable);

create policy "Phase6 service role can recover evidence ledger"
on public.document_evidence_ledger for select
to service_role
using (true);

create or replace function public.phase6_validate_evidence_ledger_append()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  predecessor public.document_evidence_ledger%rowtype;
begin
  if new.sequence = 1 then
    if new.previous_ledger_reference is not null then
      raise exception 'First Phase 6 ledger record cannot have a predecessor';
    end if;
  else
    if new.previous_ledger_reference is null then
      raise exception 'Sequential Phase 6 ledger record requires a predecessor';
    end if;

    select * into predecessor
    from public.document_evidence_ledger
    where ledger_reference = new.previous_ledger_reference;

    if not found
      or predecessor.correlation_identity <> new.correlation_identity
      or predecessor.document_identity <> new.document_identity
      or predecessor.sequence + 1 <> new.sequence
      or predecessor.aggregate_fingerprint
        <> new.lineage ->> 'previousAggregateFingerprint' then
      raise exception 'Phase 6 ledger lineage is invalid';
    end if;
  end if;

  if new.lineage ->> 'documentIdentity' <> new.document_identity
    or new.lineage ->> 'versionIdentity' <> new.version_identity
    or new.lineage ->> 'previousLedgerReference'
      is distinct from new.previous_ledger_reference then
    raise exception 'Phase 6 ledger lineage payload does not match governed columns';
  end if;

  return new;
end;
$$;

revoke all on function public.phase6_validate_evidence_ledger_append()
  from public, anon, authenticated;

drop trigger if exists document_evidence_ledger_lineage_guard
  on public.document_evidence_ledger;
create trigger document_evidence_ledger_lineage_guard
before insert on public.document_evidence_ledger
for each row execute function public.phase6_validate_evidence_ledger_append();

create or replace function public.phase6_reject_evidence_ledger_mutation()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  raise exception 'Phase 6 evidence ledger is append-only';
end;
$$;

revoke all on function public.phase6_reject_evidence_ledger_mutation()
  from public, anon, authenticated;

drop trigger if exists document_evidence_ledger_append_only_guard
  on public.document_evidence_ledger;
create trigger document_evidence_ledger_append_only_guard
before update or delete on public.document_evidence_ledger
for each row execute function public.phase6_reject_evidence_ledger_mutation();

commit;
