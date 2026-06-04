-- GES VIP CLUB - Phase 3 service request upgrade
-- Adds Gold Electric Services intake fields, status lifecycle, and timeline history.
-- Safe to run multiple times after the Phase 2 schema.

alter table public.service_requests
  add column if not exists preferred_date date,
  add column if not exists preferred_time time,
  add column if not exists contact_name text,
  add column if not exists contact_phone text,
  add column if not exists timeline_history jsonb not null default '[]'::jsonb;

alter table public.service_requests
  alter column photo_urls set default '{}';

update public.service_requests
set photo_urls = '{}'
where photo_urls is null;

alter table public.service_requests
  alter column photo_urls set not null;

alter table public.service_requests
  drop constraint if exists service_requests_status_check;

alter table public.service_requests
  add constraint service_requests_status_check
  check (
    status in (
      'pending',
      'submitted',
      'scheduled',
      'technician-assigned',
      'in-progress',
      'waiting-parts',
      'inspection-required',
      'completed',
      'cancelled'
    )
  );

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'service_requests_priority_check'
      and conrelid = 'public.service_requests'::regclass
  ) then
    alter table public.service_requests
      add constraint service_requests_priority_check
      check (priority in ('low', 'normal', 'high', 'emergency'));
  end if;
end;
$$;

update public.service_requests
set timeline_history = jsonb_build_array(
  jsonb_build_object(
    'status', status,
    'note', 'Existing request imported into timeline history.',
    'createdAt', created_at
  )
)
where timeline_history = '[]'::jsonb;

grant select, insert, update, delete on public.service_requests to authenticated;

select table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'service_requests'
order by ordinal_position;
