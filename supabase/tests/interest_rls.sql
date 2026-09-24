-- Manual / CI checks after migration is applied.
-- Run in SQL editor (service role) or: psql "$DATABASE_URL" -f supabase/tests/interest_rls.sql
--
-- Expect: anon cannot SELECT; service role can INSERT; cleanup deletes the probe row.

begin;

-- 1) Table exists
do $$
begin
  if to_regclass('public.interest_responses') is null then
    raise exception 'FAIL: interest_responses missing';
  end if;
  raise notice 'PASS: table exists';
end $$;

-- 2) Service-role style insert (this session is typically postgres / service)
insert into public.interest_responses (
  name, email, location, self_describe, participation, make_possible
) values (
  'RLS Probe',
  'rls-probe@example.com',
  'kochi',
  'maker',
  array['attend']::text[],
  'Probe row — delete me'
);

do $$
declare
  n int;
begin
  select count(*) into n from public.interest_responses where email = 'rls-probe@example.com';
  if n <> 1 then
    raise exception 'FAIL: insert did not land';
  end if;
  raise notice 'PASS: insert works';
end $$;

-- 3) RLS is on
do $$
declare
  forced boolean;
begin
  select relrowsecurity into forced
  from pg_class
  where oid = 'public.interest_responses'::regclass;
  if not forced then
    raise exception 'FAIL: RLS not enabled';
  end if;
  raise notice 'PASS: RLS enabled';
end $$;

-- 4) Cleanup probe
delete from public.interest_responses where email = 'rls-probe@example.com';

raise notice 'PASS: interest_rls smoke checks complete';

commit;

-- After linking a project, also verify in the dashboard:
-- * anon key GET /rest/v1/interest_responses → empty or 401/permission denied
-- * set auth.users.app_metadata.role = 'organizer' for your email, magic-link in, SELECT works
