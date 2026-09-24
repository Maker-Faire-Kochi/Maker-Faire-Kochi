-- Access requests for organizer accounts.
-- Anyone can submit a pending request; only the owner (via Nitro + service role)
-- can approve (creates Auth user + organizer role) or reject.

create table public.organizer_access_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  note text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  reviewed_by text,
  constraint organizer_access_requests_email_format
    check (email ~* '^[^@]+@[^@]+\.[^@]+$')
);

create unique index organizer_access_requests_pending_email_uidx
  on public.organizer_access_requests (lower(email))
  where status = 'pending';

create index organizer_access_requests_status_idx
  on public.organizer_access_requests (status, created_at desc);

alter table public.organizer_access_requests enable row level security;

-- Public can submit a request (insert pending only). No public reads.
create policy "anon_insert_pending_access_request"
  on public.organizer_access_requests
  for insert
  to anon, authenticated
  with check (status = 'pending');

-- Staff can list requests (owner UI still gated in Nitro by owner email).
create policy "staff_select_access_requests"
  on public.organizer_access_requests
  for select
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('organizer', 'owner')
  );

comment on table public.organizer_access_requests is
  'Pending organizer account requests; only the owner account approves via API.';
