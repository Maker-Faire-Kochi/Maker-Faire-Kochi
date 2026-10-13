-- Media-team volunteer call (/volunteer). Separate from interest_responses.
-- Public writes go through Nitro with the service role; clients never INSERT.
-- The Google Form keeps receiving every submission as well; this is the copy
-- the admin dashboard reads.

create table if not exists public.volunteer_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text not null,
  domains text[] not null,
  portfolio_url text,
  location text,
  occupation text,
  hours_per_week text not null,
  google_forwarded boolean not null default false,
  confirmation_sent boolean not null default false,
  status text not null default 'new'
    check (status in ('new', 'reviewed', 'contacted', 'archived')),
  constraint volunteer_responses_domains_nonempty
    check (cardinality(domains) > 0),
  constraint volunteer_responses_email_format
    check (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  -- Matches MAX_LEN in shared/volunteer/validate.ts.
  constraint volunteer_responses_len_caps check (
    char_length(name) <= 120
    and char_length(email) <= 254
    and char_length(phone) <= 32
    and coalesce(char_length(portfolio_url), 0) <= 500
    and coalesce(char_length(location), 0) <= 200
  )
);

create index if not exists volunteer_responses_created_at_idx
  on public.volunteer_responses (created_at desc);

create index if not exists volunteer_responses_status_idx
  on public.volunteer_responses (status);

alter table public.volunteer_responses enable row level security;

-- No anon / authenticated INSERT. Service role bypasses RLS for Nitro inserts.

drop policy if exists "owner_select_volunteer" on public.volunteer_responses;
drop policy if exists "owner_update_volunteer" on public.volunteer_responses;

create policy "owner_select_volunteer"
  on public.volunteer_responses
  for select
  to authenticated
  using ((select private.is_admin_owner()));

create policy "owner_update_volunteer"
  on public.volunteer_responses
  for update
  to authenticated
  using ((select private.is_admin_owner()))
  with check ((select private.is_admin_owner()));

-- The owner may change status and nothing else. The service role (Nitro)
-- also flips confirmation_sent after the email goes out.
create or replace function public.volunteer_responses_status_only()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.role()) = 'service_role' then
    return new;
  end if;
  if (to_jsonb(new) - 'status') is distinct from (to_jsonb(old) - 'status') then
    raise exception 'volunteer_responses: only status may be updated';
  end if;
  return new;
end;
$$;

drop trigger if exists volunteer_responses_status_only_trg on public.volunteer_responses;
create trigger volunteer_responses_status_only_trg
  before update on public.volunteer_responses
  for each row
  execute function public.volunteer_responses_status_only();

comment on table public.volunteer_responses is
  'Media-team volunteer call. Mirrored to the Google Form; reviewed in /admin.';
