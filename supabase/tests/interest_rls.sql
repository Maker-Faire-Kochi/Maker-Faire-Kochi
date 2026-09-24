-- Manual checks after all migrations are applied. Runs in a transaction and rolls back.

begin;

do $$
begin
  if to_regclass('public.interest_responses') is null then
    raise exception 'FAIL: interest_responses missing';
  end if;
  if not (select relrowsecurity from pg_class where oid = 'public.interest_responses'::regclass) then
    raise exception 'FAIL: RLS not enabled';
  end if;
  if not exists (
    select 1 from pg_policies
    where tablename = 'interest_responses' and policyname = 'owner_select_interest'
  ) then
    raise exception 'FAIL: run 20260924160000_single_owner.sql';
  end if;
  if exists (
    select 1 from pg_policies
    where tablename = 'interest_responses' and policyname like 'staff_%'
  ) then
    raise exception 'FAIL: old staff_* policies still present';
  end if;
  if to_regclass('public.organizer_access_requests') is not null then
    raise exception 'FAIL: organizer_access_requests should be dropped';
  end if;
  raise notice 'PASS: schema + policies';
end $$;

insert into public.interest_responses (
  name, email, location, self_describe, participation, make_possible
) values (
  'RLS Probe', 'rls-probe@example.com', 'kochi', 'maker', array['attend']::text[], 'Probe row'
);

-- Status may change.
update public.interest_responses set status = 'reviewed' where email = 'rls-probe@example.com';

-- Anything else may not.
do $$
begin
  begin
    update public.interest_responses set name = 'Tampered' where email = 'rls-probe@example.com';
    raise exception 'FAIL: non-status update was allowed';
  exception when raise_exception then
    if sqlerrm like 'FAIL:%' then raise; end if;
    raise notice 'PASS: status-only trigger blocks other columns';
  end;
end $$;

-- Length cap.
do $$
begin
  begin
    insert into public.interest_responses (name, email, location, self_describe, participation)
    values (repeat('x', 121), 'long@example.com', 'kochi', 'maker', array['attend']::text[]);
    raise exception 'FAIL: 121-char name accepted';
  exception when check_violation then
    raise notice 'PASS: length cap enforced';
  end;
end $$;

-- An authenticated non-owner sees nothing.
set local role authenticated;
set local request.jwt.claims = '{"role":"authenticated","app_metadata":{"role":"organizer"}}';
do $$
begin
  if (select count(*) from public.interest_responses) <> 0 then
    raise exception 'FAIL: non-owner can read responses';
  end if;
  raise notice 'PASS: non-owner reads 0 rows';
end $$;

-- The owner sees the probe.
set local request.jwt.claims = '{"role":"authenticated","app_metadata":{"role":"owner"}}';
do $$
begin
  if (select count(*) from public.interest_responses where email = 'rls-probe@example.com') <> 1 then
    raise exception 'FAIL: owner cannot read responses';
  end if;
  raise notice 'PASS: owner reads responses';
end $$;

rollback;
