-- Bind dashboard access to exactly one Auth user ID.
-- `role = owner` alone is insufficient: an old owner JWT would otherwise keep
-- access after NUXT_ADMIN_OWNER_EMAIL changes.

create table if not exists public.admin_owner (
  singleton boolean primary key default true check (singleton),
  user_id uuid not null unique,
  updated_at timestamptz not null default now()
);

alter table public.admin_owner enable row level security;
revoke all on table public.admin_owner from anon, authenticated;
grant select, insert, update on table public.admin_owner to service_role;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_admin_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_owner
    where singleton = true
      and user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_admin_owner() from public;
grant execute on function private.is_admin_owner() to authenticated;

drop policy if exists "owner_select_interest" on public.interest_responses;
drop policy if exists "owner_update_interest" on public.interest_responses;

create policy "owner_select_interest"
  on public.interest_responses
  for select
  to authenticated
  using ((select private.is_admin_owner()));

create policy "owner_update_interest"
  on public.interest_responses
  for update
  to authenticated
  using ((select private.is_admin_owner()))
  with check ((select private.is_admin_owner()));
