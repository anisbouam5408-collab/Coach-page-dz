# CoachPage DZ — Web (React + Supabase)

Multi-tenant SaaS for Algerian personal trainers: `SUPER_ADMIN`, `COACH`, and
`CLIENT` roles, built as a React SPA that talks directly to Supabase
(project `coachpage-dz`, ref `glvahsehpyavmyjlduqs`) — no separate backend
needed, which is what makes this deployable to Cloudflare Pages (static
hosting only).

This app is intentionally isolated from the existing Flask app in this repo
(`app.py` + `templates/`) — it doesn't share code, and the Flask app keeps
running unaffected against the same Supabase database (the schema changes
below are additive only).

## Architecture

- **Data**: existing `coaches` / `clients` tables (already used by the Flask
  app) plus additive columns/tables added for this rewrite:
  - `coaches.user_id`, `coaches.subscription_status` (`TRIAL` / `ACTIVE` /
    `EXPIRED` / `PENDING_APPROVAL`), `coaches.subscription_plan`,
    `coaches.subscription_expires_at` — kept separate from the pre-existing
    `status` / `trial_expires_at` columns the Flask app still uses.
  - `clients.training_program` (new nullable column).
  - `subscription_plans` — reference table for the three paid plans (3900 /
    12000 / 15900 DZD), publicly readable.
  - `super_admins` — registry of super-admin user ids. Locked down (RLS
    enabled, zero policies) — only reachable through the `private` schema
    helper functions, never directly.
- **Auth**: Supabase Auth (email/password). A coach's `auth.users.id` links
  to their `coaches.user_id`. There is no self-service way to become a
  super admin — see "Bootstrapping the first super admin" below.
- **Authorization**: Row Level Security on every table. A coach can only
  read/write their own `coaches` row and their own `clients` (and those
  clients' `daily_logs`/`weight_logs`). A database trigger
  (`private.protect_coach_subscription_fields`) silently blocks a coach
  from changing their own `subscription_status`/`plan`/`expires_at` — only
  a super admin update can move a coach out of `TRIAL`.
- **"Am I a super admin?"**: the frontend calls `public.am_i_super_admin()`
  (safe to expose — it only ever answers about the caller, derived from
  `auth.uid()`), not the locked `super_admins` table directly.

## Bootstrapping the first super admin

There's no signup flow for `SUPER_ADMIN` by design. To promote an account:

1. Have that person register normally through `/register` (creates their
   `auth.users` row).
2. Insert their user id into `super_admins`:
   ```sql
   insert into public.super_admins (user_id)
   select id from auth.users where email = 'the-admin@example.com';
   ```
3. They can now sign in and will be redirected to `/admin`.

## Cloudflare Pages

`public/_redirects` contains `/* /index.html 200` so client-side routes
(`/dashboard`, `/admin`, `/guide`, ...) don't 404 on a hard refresh. There is
no `404.html` in `public/` — Cloudflare Pages' SPA fallback only works when
one doesn't shadow `_redirects`.

## Development

```bash
npm install
npm run dev
npm run build
```

The Supabase URL and anon key are baked in as defaults in
`src/lib/supabase.ts` (anon keys are safe to ship client-side — RLS is what
actually protects data). Override via `VITE_SUPABASE_URL` /
`VITE_SUPABASE_ANON_KEY` if pointing at a different project.
