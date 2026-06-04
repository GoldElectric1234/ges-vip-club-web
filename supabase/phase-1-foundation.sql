-- Phase 1 foundation for GES VIP CLUB.
-- Apply this in Supabase SQL editor before relying on persisted settings.

create table if not exists public.membership_rules (
  tier text primary key check (tier in ('basic', 'gold', 'platinum', 'enterprise')),
  display_name text not null,
  property_limit integer,
  requires_admin_override boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint membership_rules_property_limit_check
    check (property_limit is null or property_limit > 0)
);

insert into public.membership_rules (tier, display_name, property_limit, requires_admin_override)
values
  ('basic', 'Basic', 1, false),
  ('gold', 'Gold', 3, false),
  ('platinum', 'Platinum', 10, false),
  ('enterprise', 'Enterprise', null, true)
on conflict (tier) do update set
  display_name = excluded.display_name,
  property_limit = excluded.property_limit,
  requires_admin_override = excluded.requires_admin_override,
  updated_at = now();

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  preferred_language text not null default 'en' check (preferred_language in ('en', 'es')),
  senior_mode_enabled boolean not null default false,
  membership_tier text not null default 'basic'
    references public.membership_rules(tier),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text,
  address_line1 text not null,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  property_type text not null check (property_type in ('residential', 'commercial')),
  is_primary boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists properties_user_id_idx on public.properties(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists membership_rules_set_updated_at on public.membership_rules;
create trigger membership_rules_set_updated_at
before update on public.membership_rules
for each row execute function public.set_updated_at();

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at
before update on public.properties
for each row execute function public.set_updated_at();

alter table public.membership_rules enable row level security;
alter table public.profiles enable row level security;
alter table public.properties enable row level security;

drop policy if exists "Membership rules are readable" on public.membership_rules;
create policy "Membership rules are readable"
on public.membership_rules for select
to authenticated, anon
using (true);

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

drop policy if exists "Users can update own profile preferences" on public.profiles;
create policy "Users can update own profile preferences"
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
