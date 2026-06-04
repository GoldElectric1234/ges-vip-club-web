-- GES VIP CLUB - Phase 3 property photos and service requests foundation
-- Safe to run multiple times after the Phase 2 schema.

alter table public.properties
  add column if not exists main_breaker_size text,
  add column if not exists utility_company text,
  add column if not exists generator_brand text,
  add column if not exists solar_system_size text,
  add column if not exists last_electrical_inspection date,
  add column if not exists property_photo_url text,
  add column if not exists panel_photo_url text,
  add column if not exists meter_photo_url text;

alter table public.service_requests
  add column if not exists photo_urls text[] not null default '{}';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'service_requests_priority_check'
  ) then
    alter table public.service_requests
      add constraint service_requests_priority_check
      check (priority in ('low', 'normal', 'high', 'emergency'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'service_requests_status_check'
  ) then
    alter table public.service_requests
      add constraint service_requests_status_check
      check (status in ('pending', 'scheduled', 'in-progress', 'completed', 'cancelled'));
  end if;
end;
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'property-photos',
    'property-photos',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
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

drop policy if exists "Authenticated users can upload property photos" on storage.objects;
create policy "Authenticated users can upload property photos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'property-photos');

drop policy if exists "Authenticated users can update property photos" on storage.objects;
create policy "Authenticated users can update property photos"
on storage.objects for update
to authenticated
using (bucket_id = 'property-photos')
with check (bucket_id = 'property-photos');

drop policy if exists "Authenticated users can delete property photos" on storage.objects;
create policy "Authenticated users can delete property photos"
on storage.objects for delete
to authenticated
using (bucket_id = 'property-photos');

drop policy if exists "Public can read property photos" on storage.objects;
create policy "Public can read property photos"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'property-photos');

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

grant select, insert, update, delete on public.properties to authenticated;
grant select, insert, update, delete on public.service_requests to authenticated;

select table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name in ('properties', 'service_requests')
order by table_name, ordinal_position;
