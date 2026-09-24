# Supabase — Interest form + admin auth (Google / Gmail)

## Setup

1. Create a project at https://supabase.com
2. Copy URL, anon key, service role key into `.env` (see `.env.example`)
3. Apply migration:

```bash
npx supabase login
npx supabase link --project-ref <your-ref>
npx supabase db push
```

Or paste `migrations/20260924120000_interest_responses.sql` into the SQL editor.

## Auth: Google (Gmail) + magic link

Admin login is at `/admin/login`. Primary path is **Continue with Google**.

### 1. Enable Google provider in Supabase

Authentication → Providers → **Google** → Enable.

You need a Google Cloud OAuth client:

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create **OAuth client ID** (Web application)
3. Authorized JavaScript origins:
   - `http://localhost:3000`
   - `https://makerfaire.in`
   - `https://YOUR_PROJECT.supabase.co`
4. Authorized redirect URIs (critical — use the Supabase callback):
   - `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
5. Copy Client ID + Client Secret into Supabase Google provider settings → Save

### 2. Redirect allow-list in Supabase

Authentication → URL configuration:

- Site URL: `https://makerfaire.in` (or `http://localhost:3000` in local)
- Redirect URLs (add all):
  - `http://localhost:3000/admin/callback`
  - `http://localhost:3000/admin`
  - `https://makerfaire.in/admin/callback`
  - `https://makerfaire.in/admin`

### 3. Organizer role (required)

After first Google sign-in, the user appears under Authentication → Users.
Open the user → **App metadata** (not User metadata):

```json
{ "role": "organizer" }
```

Without this, Google sign-in succeeds but the dashboard **stays locked**.

Enable **Email** provider too if you want the magic-link fallback (works with Gmail addresses).

## Auth lock

`/admin` is SPA-only and guarded by `admin-auth` middleware:

1. No session → `/admin/login`
2. Session without `app_metadata.role = "organizer"` → signed out + locked
3. Organizer session → dashboard unlocks

OAuth / magic-link returns through `/admin/callback`, which exchanges the PKCE code and enforces the organizer check.

## Tests

After migrate, run `tests/interest_rls.sql` in the SQL editor.

Then:

1. Anon `GET /rest/v1/interest_responses` → no rows (RLS)
2. `POST /api/interest` from the Nuxt app → inserts (service role)
3. Google sign-in as organizer → `/admin` Summary + Responses load
4. Non-organizer Google account → locked with `reason=forbidden`
