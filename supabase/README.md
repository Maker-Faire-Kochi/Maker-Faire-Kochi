# Supabase — Interest form

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

## Tests

After migrate, run in SQL editor:

```bash
# or paste:
```

`tests/interest_rls.sql` — checks table exists, insert works, RLS on, cleans probe row.

Then manually:

1. With **anon** key, `GET /rest/v1/interest_responses` must not return rows (RLS).
2. `POST /api/interest` from the Nuxt app must insert (service role).
3. Set organizer: Authentication → user → App Metadata → `{ "role": "organizer" }`.
4. Magic link via `/admin/login` → inbox loads.

## Auth lock

`/admin` is **SPA-only** and guarded by `admin-auth` middleware:

1. No Supabase session → `/admin/login`
2. Session without `app_metadata.role = "organizer"` → signed out + locked login
3. Organizer session → dashboard unlocks

Set the role in Supabase Dashboard → Authentication → user → **App metadata** (not User metadata):

```json
{ "role": "organizer" }
```

Allow redirect URLs: `http://localhost:3000/admin` and `https://makerfaire.in/admin`.
