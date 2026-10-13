# Supabase — Interest form + one-owner dashboard

## How access works

- `/interestform` is public. Submissions go through `POST /api/interest`, which validates
  and inserts with the service role. Browsers never write to the table directly.
- `/volunteer` is the media-team call. The sheet UI posts to `POST /api/volunteer`, which
  validates and forwards into the Google Form (responses land in that form’s Sheet). A
  confirmation email is sent when Brevo is configured. Nothing is stored in Supabase.
- `/admin` is for **one account**: the email in `NUXT_ADMIN_OWNER_EMAIL`.
  1. Create that one email/password user in **Supabase Authentication → Users**.
  2. Sign in at `/admin/login` with the same email and password.
  3. Supabase verifies the password; the server verifies the authenticated email against
     `NUXT_ADMIN_OWNER_EMAIL`.
  4. The first successful login binds that Auth user ID as the sole database owner. RLS checks
     the bound UUID, so another Auth account cannot read responses.
- Nobody can sign up. There is no approval queue and no team.

## Setup

```
NUXT_PUBLIC_SUPABASE_URL=...
NUXT_PUBLIC_SUPABASE_ANON_KEY=...
NUXT_SUPABASE_SERVICE_ROLE_KEY=...
NUXT_ADMIN_OWNER_EMAIL=you@example.com

# Optional — volunteer confirmation mail (Brevo HTTP API). Skip these to keep
# submissions working without sending mail.
NUXT_BREVO_API_KEY=xkeysib-xxxxxxxx
NUXT_MAIL_FROM=Maker Faire Kochi <volunteer@makerfaire.in>
NUXT_MAIL_REPLY_TO=you@your-inbox.com
```

1. Run every file in `supabase/migrations/` in order (SQL editor or `npx supabase db push`).
2. **Authentication → Sign In / Providers**
   - Email: ON. Google and everything else: OFF.
   - **Allow new users to sign up: OFF.**
3. **Authentication → Users → Add user → Create new user**
   - Enter the same email as `NUXT_ADMIN_OWNER_EMAIL`.
   - Set the password there and enable **Auto Confirm User**.
   - Do **not** insert a password into a Postgres table or put it in `.env`. Supabase Auth stores
     only its managed password hash.
4. Sign in once at `/admin/login`; this creates the one-user RLS binding.
5. No redirect URLs or email templates are needed.
6. Optional check: paste `supabase/tests/interest_rls.sql` into the SQL editor. It rolls back.

## Volunteer confirmation mail

Uses **Brevo** over HTTP (`POST /v3/smtp/email`). The SMTP host/port in the Brevo
dashboard is unused — Cloudflare Workers cannot open SMTP sockets. Same API key.

1. Create an account at [brevo.com](https://www.brevo.com).
2. **Senders & IP** → add and verify the from address (or authenticate `makerfaire.in`).
3. **SMTP & API → API keys** → create a key. Set `NUXT_BREVO_API_KEY`.
4. Set `NUXT_MAIL_FROM` to `Maker Faire Kochi <volunteer@makerfaire.in>`
   (must match a verified sender).
5. Optional: `NUXT_MAIL_REPLY_TO` for reply destination.

Leave the key empty and submissions still save. Only the confirmation email is skipped.
The message says the application was received, is under review, and that the team
will get back — with the Maker Faire Kochi lockup in the HTML.

## Changing the owner

Create the replacement Auth user, change `NUXT_ADMIN_OWNER_EMAIL`, redeploy, then sign in once
as the new owner. The server rejects the old email as soon as the env changes; the new login
moves the RLS binding so the previous user's existing token also loses direct database access.

## Migrations

| File | What |
|---|---|
| `…120000_interest_responses.sql` | Form table + RLS |
| `…140000_organizer_access_requests.sql` | Old approval queue (dropped by 160000) |
| `…150000_fix_interest_rls_and_status.sql` | Status-only trigger (superseded by 160000) |
| `…160000_single_owner.sql` | Owner-only RLS, trigger `search_path`, length caps, drops the queue |
| `…170000_bind_single_admin_owner.sql` | Binds RLS to one Auth user ID, not a reusable role |
