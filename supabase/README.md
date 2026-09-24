# Supabase — Interest form + signup → owner approval → dashboard

## Flow

1. Someone goes to `/admin/login`, enters email, verifies OTP (**signup allowed**).
2. Dashboard stays **closed** → `/admin/pending`.
3. You (owner) open `/admin` → **Team** → **Accept**.
4. They Refresh (or wait ~15s) → JWT refreshes → dashboard opens.

## Setup

```
NUXT_PUBLIC_SUPABASE_URL=...
NUXT_PUBLIC_SUPABASE_ANON_KEY=...
NUXT_SUPABASE_SERVICE_ROLE_KEY=...
NUXT_ADMIN_OWNER_EMAIL=you@example.com
```

1. Apply **all three** migrations in `supabase/migrations/` (SQL editor or `npx supabase db push`).
2. Auth → Email ON; Google OFF.
3. Redirect allow-list: `/admin`, `/admin/login`, `/admin/callback`, `/admin/pending`.
4. Sign up once as yourself at `/admin/login`, then set App metadata:

```json
{ "role": "owner" }
```

Email must match `NUXT_ADMIN_OWNER_EMAIL`.

## Migrations

| File | What |
|---|---|
| `…120000_interest_responses.sql` | Form table + RLS |
| `…140000_organizer_access_requests.sql` | Pending signups |
| `…150000_fix_interest_rls_and_status.sql` | Owner can read rows; status-only updates; `user_id` on requests; drop anon insert |

## Owner powers

Only `NUXT_ADMIN_OWNER_EMAIL` / `role: owner` sees **Team** and can Accept/Reject.
Accept sets `app_metadata.role = organizer` on the signed-up Auth user (via stored `user_id`).
