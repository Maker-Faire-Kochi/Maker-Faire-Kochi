# Supabase — Interest form + invite-only admin OTP

## Why not Google?

For a handful of organizers, **invite-only accounts + email OTP** is better than Google OAuth:

- No Google Cloud client / consent screen to maintain
- You decide exactly who exists (no “any Gmail can try”)
- OTP works with any email provider
- `shouldCreateUser: false` blocks random signups at the Auth API

## Setup

1. Create a project at https://supabase.com  
2. Copy URL, anon key, service role key into `.env` (see `.env.example`)  
3. Apply migration (`npx supabase db push` or paste the SQL in `migrations/`)

## Create organizer accounts (few people only)

In Supabase Dashboard → **Authentication** → **Users**:

1. **Add user** / **Invite user** with their email (no public signup on the site)
2. Open the user → **App metadata** (not User metadata):

```json
{ "role": "organizer" }
```

3. Authentication → Providers → **Email** → enabled  
4. Prefer **OTP / magic link**; disable confirm-email friction for invited users if needed  
5. Turn **Google** (and other social providers) **off** unless you truly need them  
6. Auth settings: disable “allow new users to sign up” if the toggle exists (or rely on `shouldCreateUser: false` from the app)

Auth → URL configuration — allow:

- `http://localhost:3000/admin/callback`
- `http://localhost:3000/admin`
- `https://makerfaire.in/admin/callback`
- `https://makerfaire.in/admin`

## How organizers sign in

1. `/admin/login` → enter email → **Send one-time code**  
2. Enter the 6-digit code from email (or open the magic link → `/admin/callback`)  
3. Dashboard unlocks only if `app_metadata.role = organizer`

Unknown emails never create accounts (`shouldCreateUser: false`).

## Auth lock

`/admin` is SPA-only + `admin-auth` middleware:

1. No session → login  
2. Session without organizer role → signed out + locked  
3. Organizer + valid OTP session → dashboard  

## Interest form tests

Run `tests/interest_rls.sql` after migrate. Anon cannot read rows; Nitro service role inserts; organizers select via RLS.
