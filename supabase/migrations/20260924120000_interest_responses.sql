-- Interest form responses (NOT registration / tickets).
-- Public writes go through Nitro with the service role; clients never INSERT.

create table public.interest_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  location text not null,
  self_describe text not null,
  self_describe_other text,
  participation text[] not null,
  make_possible text,
  contribute_text text,
  has_project text,
  project_description text,
  project_categories text[],
  volunteer_areas text[],
  volunteer_time text,
  in_organization boolean,
  org_name text,
  org_collaborate text,
  heard_from text,
  heard_from_other text,
  anything_else text,
  status text not null default 'new'
    check (status in ('new', 'reviewed', 'contacted', 'archived')),
  constraint interest_responses_participation_nonempty
    check (cardinality(participation) > 0),
  constraint interest_responses_email_format
    check (email ~* '^[^@]+@[^@]+\.[^@]+$')
);

create index interest_responses_created_at_idx
  on public.interest_responses (created_at desc);

create index interest_responses_participation_idx
  on public.interest_responses using gin (participation);

create index interest_responses_status_idx
  on public.interest_responses (status);

alter table public.interest_responses enable row level security;

-- No anon / authenticated INSERT. Service role bypasses RLS for Nitro inserts.

create policy "organizers_select_interest"
  on public.interest_responses
  for select
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'organizer'
  );

create policy "organizers_update_status"
  on public.interest_responses
  for update
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'organizer'
  )
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'organizer'
  );

comment on table public.interest_responses is
  'Get Involved interest form. Separate from future registrations/tickets.';
