-- One admin account. Drops the organizer / approval model entirely.
-- Safe on a fresh project and on one that already ran 120000–150000.

-- Read + status update: owner only.
drop policy if exists "organizers_select_interest" on public.interest_responses;
drop policy if exists "organizers_update_status" on public.interest_responses;
drop policy if exists "staff_select_interest" on public.interest_responses;
drop policy if exists "staff_update_interest" on public.interest_responses;
drop policy if exists "owner_select_interest" on public.interest_responses;
drop policy if exists "owner_update_interest" on public.interest_responses;

create policy "owner_select_interest"
  on public.interest_responses
  for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'owner');

create policy "owner_update_interest"
  on public.interest_responses
  for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'owner')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'owner');

-- Same trigger body, now with a pinned search_path (Supabase advisor 0011).
create or replace function public.interest_responses_status_only()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (to_jsonb(new) - 'status') is distinct from (to_jsonb(old) - 'status') then
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

-- Length caps, matching MAX_LEN in shared/interest/validate.ts.
-- NOT VALID: enforced for new rows without failing on anything already stored.
alter table public.interest_responses
  drop constraint if exists interest_responses_len_caps;
alter table public.interest_responses
  add constraint interest_responses_len_caps check (
    char_length(name) <= 120
    and char_length(email) <= 254
    and coalesce(char_length(phone), 0) <= 32
    and coalesce(char_length(self_describe_other), 0) <= 200
    and coalesce(char_length(org_name), 0) <= 200
    and coalesce(char_length(heard_from_other), 0) <= 200
    and coalesce(char_length(make_possible), 0) <= 4000
    and coalesce(char_length(contribute_text), 0) <= 4000
    and coalesce(char_length(project_description), 0) <= 4000
    and coalesce(char_length(anything_else), 0) <= 4000
  ) not valid;

-- Approval queue is gone.
drop table if exists public.organizer_access_requests cascade;
