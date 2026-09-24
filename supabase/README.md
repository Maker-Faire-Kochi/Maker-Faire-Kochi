# Supabase — Interest form + signup → owner approval → dashboard

## Flow

1. Someone goes to `/admin/login`, enters email, verifies OTP (**signup allowed**).
2. Dashboard stays **closed** → they land on `/admin/pending`.
3. You (owner) open `/admin` → **Team** → **Accept**.
4. They Refresh (or wait ~15s) → JWT refreshes → dashboard opens.

No separate request form. Reject leaves them closed with a rejected message.

## Setup

```
NUXT_PUBLIC_SUPABASE_URL=...
NUXT_PUBLIC_SUPABASE_ANON_KEY=...
NUXT_SUPABASE_SERVICE_ROLE_KEY=...
NUXT_ADMIN_OWNER_EMAIL=you@example.com
```

1. Apply migrations (`interest_responses`, `organizer_access_requests`).
2. Auth → Email ON; allow signups (app uses `shouldCreateUser: true` for admin OTP only).
3. Create **your** user; App metadata `{ "role": "owner" }` (or match `NUXT_ADMIN_OWNER_EMAIL`).
4. Redirect allow-list: `/admin`, `/admin/login`, `/admin/callback`, `/admin/pending`.

## Owner powers

Only `NUXT_ADMIN_OWNER_EMAIL` (or `role: owner`) sees **Team** and can Accept/Reject.
Accept sets `app_metadata.role = organizer` on the signed-up Auth user.
