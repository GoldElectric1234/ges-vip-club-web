-- GES VIP CLUB - Phase 2 sample seed data
-- Replace the sample UUID with an existing auth.users.id before running.

do $$
declare
  sample_user_id uuid := '00000000-0000-0000-0000-000000000001';
  sample_property_id uuid;
begin
  insert into public.profiles (
    id,
    full_name,
    phone,
    membership_plan,
    preferred_language,
    senior_mode
  )
  values (
    sample_user_id,
    'Test Homeowner',
    '(555) 123-4567',
    'gold',
    'en',
    false
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    phone = excluded.phone,
    membership_plan = excluded.membership_plan,
    preferred_language = excluded.preferred_language,
    senior_mode = excluded.senior_mode;

  insert into public.memberships (
    user_id,
    plan,
    start_date,
    renewal_date,
    active
  )
  values (
    sample_user_id,
    'gold',
    current_date,
    (current_date + interval '1 year')::date,
    true
  );

  insert into public.properties (
    user_id,
    property_name,
    property_type,
    address,
    city,
    state,
    zip_code,
    year_built,
    main_service_size,
    main_panel_brand,
    generator_installed,
    solar_installed,
    notes
  )
  values (
    sample_user_id,
    'Primary Residence',
    'residential',
    '123 Main Street',
    'Springfield',
    'IL',
    '62701',
    1998,
    '200 amp',
    'Square D',
    true,
    false,
    'Generator transfer switch installed near main panel.'
  )
  returning id into sample_property_id;

  insert into public.service_requests (
    user_id,
    property_id,
    service_type,
    priority,
    status,
    description
  )
  values (
    sample_user_id,
    sample_property_id,
    'Panel inspection',
    'normal',
    'pending',
    'Annual electrical inspection for main service panel.'
  );
end;
$$;
