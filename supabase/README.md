# Supabase — Interest form + one-owner dashboard

## How access works

- `/interestform` is public. Submissions go through `POST /api/interest`, which validates
  and inserts with the service role. Browsers never write to the table directly.
- `/admin` is for **one account**: the email in `NUXT_ADMIN_OWNER_EMAIL`.
  1. Enter that email at `/admin/login`.
  2. `POST /api/admin/send-code` checks it against the env var. Any other address gets the
     same "code is on its way" reply and no email, so the endpoint does not reveal the owner.
  3. For the owner it creates the Auth user if missing, sets `app_metadata.role = owner`,
     then emails a 6-digit code.
  4. The code is verified in the browser; the session's JWT carries `role: owner`, which is
     what RLS checks.
- Nobody can sign up. There is no approval queue and no team.

## Setup

```
NUXT_PUBLIC_SUPABASE_URL=...
NUXT_PUBLIC_SUPABASE_ANON_KEY=...
NUXT_SUPABASE_SERVICE_ROLE_KEY=...
NUXT_ADMIN_OWNER_EMAIL=you@example.com
```

1. Run every file in `supabase/migrations/` in order (SQL editor or `npx supabase db push`).
2. **Authentication → Sign In / Providers**
   - Email: ON. Google and everything else: OFF.
   - **Allow new users to sign up: OFF.** The server creates the owner with the admin API,
     which works with sign-ups disabled.
3. **Authentication → Email Templates → Magic Link**: make the body show the code, e.g.

   ```html
   <h2>Maker Faire Kochi admin</h2>
   <p>Your code: <strong>{{ .Token }}</strong></p>
   ```

   There is no link-based sign-in; the default template only has a link.
4. No redirect URLs are needed.
5. Optional check: paste `supabase/tests/interest_rls.sql` into the SQL editor. It rolls back.

## Changing the owner

Change `NUXT_ADMIN_OWNER_EMAIL` and redeploy. The old account keeps `role: owner` in
Auth until you remove it: **Authentication → Users → old user → delete** (or clear its
App metadata).

## Migrations

| File | What |
|---|---|
| `…120000_interest_responses.sql` | Form table + RLS |
| `…140000_organizer_access_requests.sql` | Old approval queue (dropped by 160000) |
| `…150000_fix_interest_rls_and_status.sql` | Status-only trigger (superseded by 160000) |
| `…160000_single_owner.sql` | Owner-only RLS, trigger `search_path`, length caps, drops the queue |
