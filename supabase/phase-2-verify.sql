-- GES VIP CLUB - Phase 2 schema verification

select
  table_name,
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name in ('profiles', 'properties', 'service_requests', 'memberships')
order by table_name, ordinal_position;

select
  schemaname,
  tablename,
  policyname,
  cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles', 'properties', 'service_requests', 'memberships')
order by tablename, policyname;

select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('profiles', 'properties', 'service_requests', 'memberships')
order by c.relname;
