-- Manual checks after all migrations are applied.
-- Expect: table exists; RLS on; service insert works; staff_select_interest present.

begin;

do $$
begin
  if to_regclass('public.interest_responses') is null then
    raise exception 'FAIL: interest_responses missing';
  end if;
  raise notice 'PASS: table exists';
end $$;

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
  forced boolean;
begin
  select count(*) into n from public.interest_responses where email = 'rls-probe@example.com';
  if n <> 1 then
    raise exception 'FAIL: insert did not land';
  end if;
  raise notice 'PASS: insert works';

  select relrowsecurity into forced
  from pg_class
  where oid = 'public.interest_responses'::regclass;
  if not forced then
    raise exception 'FAIL: RLS not enabled';
  end if;
  raise notice 'PASS: RLS enabled';
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'interest_responses'
      and policyname = 'staff_select_interest'
  ) then
    raise exception 'FAIL: run 20260924150000_fix_interest_rls_and_status.sql';
  end if;
  raise notice 'PASS: staff_select_interest policy present';
end $$;

delete from public.interest_responses where email = 'rls-probe@example.com';

raise notice 'PASS: interest_rls smoke checks complete';

commit;
