-- GES VIP CLUB - Phase 3 production service requests
-- Safe to run multiple times after the Phase 2 schema.
-- QuickBooks is intentionally not included in this phase.

alter table public.service_requests
  add column if not exists preferred_date date,
  add column if not exists preferred_time time,
  add column if not exists photo_urls text[] not null default '{}',
  add column if not exists contact_name text,
  add column if not exists contact_phone text,
  add column if not exists timeline_history jsonb not null default '[]'::jsonb,
  add column if not exists ai_estimate_status text not null default 'not-requested',
  add column if not exists ai_estimate_summary text,
  add column if not exists ai_estimate_metadata jsonb not null default '{}'::jsonb;

update public.service_requests
set photo_urls = '{}'
where photo_urls is null;

update public.service_requests
set timeline_history = '[]'::jsonb
where timeline_history is null;

update public.service_requests
set ai_estimate_status = 'not-requested'
where ai_estimate_status is null
  or ai_estimate_status not in ('not-requested', 'pending', 'ready', 'needs-review');

update public.service_requests
set ai_estimate_metadata = '{}'::jsonb
where ai_estimate_metadata is null;

alter table public.service_requests
  alter column photo_urls set default '{}',
  alter column photo_urls set not null,
  alter column timeline_history set default '[]'::jsonb,
  alter column timeline_history set not null,
  alter column ai_estimate_status set default 'not-requested',
  alter column ai_estimate_status set not null,
  alter column ai_estimate_metadata set default '{}'::jsonb,
  alter column ai_estimate_metadata set not null;

update public.service_requests
set service_type = case service_type
  when 'service-upgrade' then 'panel-upgrade'
  when 'panel-replacement' then 'panel-upgrade'
  when 'generator-service' then 'generator'
  when 'inspection' then 'troubleshooting'
  when 'repair' then 'electrical-repair'
  when 'emergency' then 'emergency-service'
  when 'installation' then 'other'
  when 'maintenance' then 'other'
  else service_type
end;

update public.service_requests
set service_type = 'other'
where service_type is null
  or service_type not in (
    'electrical-repair',
    'panel-upgrade',
    'ev-charger',
    'generator',
    'lighting',
    'troubleshooting',
    'emergency-service',
    'other'
  );

update public.service_requests
set priority = case priority
  when 'high' then 'priority'
  when 'low' then 'normal'
  when 'priority' then 'priority'
  when 'emergency' then 'emergency'
  else 'normal'
end;

update public.service_requests
set status = case status
  when 'pending' then 'submitted'
  when 'submitted' then 'submitted'
  when 'under-review' then 'under-review'
  when 'technician-assigned' then 'under-review'
  when 'waiting-parts' then 'under-review'
  when 'inspection-required' then 'under-review'
  when 'cancelled' then 'under-review'
  when 'scheduled' then 'scheduled'
  when 'in-progress' then 'in-progress'
  when 'completed' then 'completed'
  else 'submitted'
end;

update public.service_requests
set timeline_history = jsonb_build_array(
  jsonb_build_object(
    'status', status,
    'note', 'Service request imported into Phase 3 timeline history.',
    'createdAt', created_at
  )
)
where timeline_history = '[]'::jsonb;

alter table public.service_requests
  drop constraint if exists service_requests_service_type_check,
  drop constraint if exists service_requests_priority_check,
  drop constraint if exists service_requests_status_check,
  drop constraint if exists service_requests_ai_estimate_status_check;

alter table public.service_requests
  add constraint service_requests_service_type_check
  check (
    service_type in (
      'electrical-repair',
      'panel-upgrade',
      'ev-charger',
      'generator',
      'lighting',
      'troubleshooting',
      'emergency-service',
      'other'
    )
  ),
  add constraint service_requests_priority_check
  check (priority in ('normal', 'priority', 'emergency')),
  add constraint service_requests_status_check
  check (status in ('submitted', 'under-review', 'scheduled', 'in-progress', 'completed')),
  add constraint service_requests_ai_estimate_status_check
  check (ai_estimate_status in ('not-requested', 'pending', 'ready', 'needs-review'));

alter table public.service_requests enable row level security;

drop policy if exists "Users can view own service requests" on public.service_requests;
create policy "Users can view own service requests"
on public.service_requests for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own service requests" on public.service_requests;
create policy "Users can create own service requests"
on public.service_requests for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.properties p
    where p.id = property_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists "Users can update own service requests" on public.service_requests;
create policy "Users can update own service requests"
on public.service_requests for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own service requests" on public.service_requests;
create policy "Users can delete own service requests"
on public.service_requests for delete
to authenticated
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'service-request-photos',
  'service-request-photos',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Authenticated users can upload service request photos" on storage.objects;
create policy "Authenticated users can upload service request photos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'service-request-photos');

drop policy if exists "Authenticated users can update service request photos" on storage.objects;
create policy "Authenticated users can update service request photos"
on storage.objects for update
to authenticated
using (bucket_id = 'service-request-photos')
with check (bucket_id = 'service-request-photos');

drop policy if exists "Authenticated users can delete service request photos" on storage.objects;
create policy "Authenticated users can delete service request photos"
on storage.objects for delete
to authenticated
using (bucket_id = 'service-request-photos');

drop policy if exists "Public can read service request photos" on storage.objects;
create policy "Public can read service request photos"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'service-request-photos');

grant select, insert, update, delete on public.service_requests to authenticated;

select table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'service_requests'
order by ordinal_position;
