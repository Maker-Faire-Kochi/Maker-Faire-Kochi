-- Fix interest_responses RLS: owner role + status-only updates.

drop policy if exists "organizers_select_interest" on public.interest_responses;
drop policy if exists "organizers_update_status" on public.interest_responses;

create policy "staff_select_interest"
  on public.interest_responses
  for select
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('organizer', 'owner')
  );

-- UPDATE allowed for staff, but only the status column may change (see trigger).
create policy "staff_update_interest"
  on public.interest_responses
  for update
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('organizer', 'owner')
  )
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('organizer', 'owner')
  );

create or replace function public.interest_responses_status_only()
returns trigger
language plpgsql
as $$
begin
  if new.id is distinct from old.id
    or new.created_at is distinct from old.created_at
    or new.name is distinct from old.name
    or new.email is distinct from old.email
    or new.phone is distinct from old.phone
    or new.location is distinct from old.location
    or new.self_describe is distinct from old.self_describe
    or new.self_describe_other is distinct from old.self_describe_other
    or new.participation is distinct from old.participation
    or new.make_possible is distinct from old.make_possible
    or new.contribute_text is distinct from old.contribute_text
    or new.has_project is distinct from old.has_project
    or new.project_description is distinct from old.project_description
    or new.project_categories is distinct from old.project_categories
    or new.volunteer_areas is distinct from old.volunteer_areas
    or new.volunteer_time is distinct from old.volunteer_time
    or new.in_organization is distinct from old.in_organization
    or new.org_name is distinct from old.org_name
    or new.org_collaborate is distinct from old.org_collaborate
    or new.heard_from is distinct from old.heard_from
    or new.heard_from_other is distinct from old.heard_from_other
    or new.anything_else is distinct from old.anything_else
  then
    raise exception 'interest_responses: only status may be updated';
  end if;
  return new;
end;
$$;

drop trigger if exists interest_responses_status_only_trg on public.interest_responses;

create trigger interest_responses_status_only_trg
  before update on public.interest_responses
  for each row
  execute function public.interest_responses_status_only();

-- Restrict access-request SELECT to owner role only (Team is owner-gated in app too).
drop policy if exists "staff_select_access_requests" on public.organizer_access_requests;

create policy "owner_select_access_requests"
  on public.organizer_access_requests
  for select
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'owner'
  );

-- Drop public anon insert leftover from the old request form.
drop policy if exists "anon_insert_pending_access_request" on public.organizer_access_requests;
