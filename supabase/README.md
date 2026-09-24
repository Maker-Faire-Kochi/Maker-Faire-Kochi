# Supabase — Interest form + owner-approved organizer OTP

## Access model

1. **You (owner)** — set `NUXT_ADMIN_OWNER_EMAIL` to your email; create your user in Supabase Auth with App metadata `{ "role": "owner" }` (or `organizer` — email match still grants owner powers).
2. **Others** — go to `/admin/request`, submit a request. They **cannot** sign in until you Accept.
3. **You Accept** in Dashboard → **Team** tab → creates their Auth user + `role: organizer`.
4. They sign in at `/admin/login` with **email OTP** (`shouldCreateUser: false`).

Only the owner account can Accept / Reject. Other organizers see Summary + Responses only.

## Setup

1. Create Supabase project; fill `.env`:

```
NUXT_PUBLIC_SUPABASE_URL=...
NUXT_PUBLIC_SUPABASE_ANON_KEY=...
NUXT_SUPABASE_SERVICE_ROLE_KEY=...
NUXT_ADMIN_OWNER_EMAIL=you@example.com
```

2. Apply migrations (interest_responses + organizer_access_requests).
3. Auth → Email ON; Google OFF; disable public signups if available.
4. Create **your** user in Auth → Users; App metadata:

```json
{ "role": "owner" }
```

5. Redirect allow-list: `/admin`, `/admin/callback`, `/admin/login`, `/admin/request` (localhost + production).

## Flows

| Who | Path |
|---|---|
| Applicant | `/admin/request` → wait |
| Owner | `/admin` → Team → Accept / Reject |
| Organizer | `/admin/login` → OTP → dashboard |

## Auth lock

SPA `/admin` + middleware: no session → login; non-staff → locked; staff → dashboard; Team APIs require owner JWT.
