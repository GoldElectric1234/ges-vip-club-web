-- GES VIP CLUB - Complete Supabase Phase 2 schema
-- Tables: profiles, properties, service_requests, memberships
-- Includes RLS policies, verification-friendly constraints, and seed helpers.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  membership_plan text not null default 'basic'
    check (membership_plan in ('basic', 'gold', 'platinum', 'enterprise')),
  preferred_language text not null default 'en'
    check (preferred_language in ('en', 'es')),
  senior_mode boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists full_name text,
  add column if not exists phone text,
  add column if not exists membership_plan text not null default 'basic',
  add column if not exists preferred_language text not null default 'en',
  add column if not exists senior_mode boolean not null default false,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
declare
  has_membership_tier boolean;
  has_senior_mode_enabled boolean;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'membership_tier'
  ) into has_membership_tier;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'senior_mode_enabled'
  ) into has_senior_mode_enabled;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'email'
  ) then
    alter table public.profiles alter column email drop not null;
  end if;

  if has_membership_tier then
    execute
      'update public.profiles
       set membership_plan = membership_tier
       where membership_tier in (''basic'', ''gold'', ''platinum'', ''enterprise'')';
  end if;

  if has_senior_mode_enabled then
    execute
      'update public.profiles
       set senior_mode = senior_mode_enabled
       where senior_mode_enabled is true';
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'profiles_membership_plan_check'
  ) then
    alter table public.profiles
      add constraint profiles_membership_plan_check
      check (membership_plan in ('basic', 'gold', 'platinum', 'enterprise'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'profiles_preferred_language_check'
  ) then
    alter table public.profiles
      add constraint profiles_preferred_language_check
      check (preferred_language in ('en', 'es'));
  end if;
end;
$$;

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_name text not null,
  property_type text not null check (property_type in ('residential', 'commercial')),
  address text not null,
  city text not null,
  state text not null,
  zip_code text not null,
  year_built integer,
  main_service_size text,
  main_panel_brand text,
  generator_installed boolean not null default false,
  solar_installed boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.properties
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists property_name text,
  add column if not exists property_type text,
  add column if not exists address text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists zip_code text,
  add column if not exists year_built integer,
  add column if not exists main_service_size text,
  add column if not exists main_panel_brand text,
  add column if not exists generator_installed boolean not null default false,
  add column if not exists solar_installed boolean not null default false,
  add column if not exists notes text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
declare
  has_owner_id boolean;
  has_profile_id boolean;
  has_nickname boolean;
  has_address_line1 boolean;
  has_postal_code boolean;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'properties'
      and column_name = 'owner_id'
      and udt_name = 'uuid'
  ) into has_owner_id;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'properties'
      and column_name = 'profile_id'
      and udt_name = 'uuid'
  ) into has_profile_id;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'properties'
      and column_name = 'nickname'
  ) into has_nickname;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'properties'
      and column_name = 'address_line1'
  ) into has_address_line1;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'properties'
      and column_name = 'postal_code'
  ) into has_postal_code;

  if has_owner_id then
    execute
      'update public.properties
       set user_id = owner_id
       where user_id is null
         and owner_id is not null
         and exists (select 1 from auth.users where auth.users.id = owner_id)';
  end if;

  if has_profile_id then
    execute
      'update public.properties
       set user_id = profile_id
       where user_id is null
         and profile_id is not null
         and exists (select 1 from auth.users where auth.users.id = profile_id)';
  end if;

  execute format(
    'update public.properties
     set
       property_name = coalesce(property_name, %s, ''Property''),
       address = coalesce(address, %s, ''''),
       zip_code = coalesce(zip_code, %s, ''''),
       property_type = coalesce(property_type, ''residential''),
       city = coalesce(city, ''''),
       state = coalesce(state, '''')
     where property_name is null
        or address is null
        or zip_code is null
        or property_type is null
        or city is null
        or state is null',
    case when has_nickname then 'nickname' else 'null' end,
    case when has_address_line1 then 'address_line1' else 'null' end,
    case when has_postal_code then 'postal_code' else 'null' end
  );

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'properties'
      and column_name = 'address_line1'
  ) then
    alter table public.properties alter column address_line1 drop not null;
  end if;
end;
$$;

alter table public.properties
  alter column property_name set not null,
  alter column property_type set not null,
  alter column address set not null,
  alter column city set not null,
  alter column state set not null,
  alter column zip_code set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'properties_property_type_check'
  ) then
    alter table public.properties
      add constraint properties_property_type_check
      check (property_type in ('residential', 'commercial'));
  end if;
end;
$$;

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  service_type text not null,
  priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high', 'emergency')),
  status text not null default 'pending'
    check (status in ('pending', 'scheduled', 'in-progress', 'completed', 'cancelled')),
  description text not null,
  created_at timestamptz not null default now()
);

alter table public.service_requests
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists property_id uuid references public.properties(id) on delete cascade,
  add column if not exists service_type text,
  add column if not exists priority text not null default 'normal',
  add column if not exists status text not null default 'pending',
  add column if not exists description text,
  add column if not exists created_at timestamptz not null default now();

do $$
begin
  update public.service_requests
  set
    service_type = coalesce(service_type, 'General service'),
    description = coalesce(description, 'Service request details pending.'),
    priority = coalesce(priority, 'normal'),
    status = coalesce(status, 'pending')
  where service_type is null
     or description is null
     or priority is null
     or status is null;
end;
$$;

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

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('basic', 'gold', 'platinum', 'enterprise')),
  start_date date not null default current_date,
  renewal_date date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.memberships
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists plan text not null default 'basic',
  add column if not exists start_date date not null default current_date,
  add column if not exists renewal_date date,
  add column if not exists active boolean not null default true,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
declare
  has_membership_type boolean;
  has_status boolean;
  has_property_id boolean;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'memberships'
      and column_name = 'membership_type'
  ) into has_membership_type;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'memberships'
      and column_name = 'status'
  ) into has_status;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'memberships'
      and column_name = 'property_id'
  ) into has_property_id;

  if has_membership_type then
    execute
      'update public.memberships
       set plan = lower(membership_type)
       where membership_type is not null
         and lower(membership_type) in (''basic'', ''gold'', ''platinum'', ''enterprise'')';
  end if;

  if has_status then
    execute
      'update public.memberships
       set active = (lower(status) = ''active'')
       where status is not null';
  end if;

  if has_property_id then
    execute
      'update public.memberships m
       set user_id = p.user_id
       from public.properties p
       where m.user_id is null
         and m.property_id = p.id';
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'memberships_plan_check'
  ) then
    alter table public.memberships
      add constraint memberships_plan_check
      check (plan in ('basic', 'gold', 'platinum', 'enterprise'));
  end if;
end;
$$;

create index if not exists properties_user_id_idx on public.properties(user_id);
create index if not exists service_requests_user_id_idx on public.service_requests(user_id);
create index if not exists service_requests_property_id_idx on public.service_requests(property_id);
create index if not exists memberships_user_id_idx on public.memberships(user_id);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at
before update on public.properties
for each row execute function public.set_updated_at();

drop trigger if exists memberships_set_updated_at on public.memberships;
create trigger memberships_set_updated_at
before update on public.memberships
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.service_requests enable row level security;
alter table public.memberships enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.properties to authenticated;
grant select, insert, update, delete on public.service_requests to authenticated;
grant select, insert, update, delete on public.memberships to authenticated;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can read own properties" on public.properties;
create policy "Users can read own properties"
on public.properties for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own properties" on public.properties;
create policy "Users can insert own properties"
on public.properties for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own properties" on public.properties;
create policy "Users can update own properties"
on public.properties for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own properties" on public.properties;
create policy "Users can delete own properties"
on public.properties for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can read own service requests" on public.service_requests;
create policy "Users can read own service requests"
on public.service_requests for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own service requests" on public.service_requests;
create policy "Users can insert own service requests"
on public.service_requests for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.properties
    where properties.id = service_requests.property_id
      and properties.user_id = auth.uid()
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

drop policy if exists "Users can read own memberships" on public.memberships;
create policy "Users can read own memberships"
on public.memberships for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own memberships" on public.memberships;
create policy "Users can insert own memberships"
on public.memberships for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own memberships" on public.memberships;
create policy "Users can update own memberships"
on public.memberships for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own memberships" on public.memberships;
create policy "Users can delete own memberships"
on public.memberships for delete
to authenticated
using (auth.uid() = user_id);
