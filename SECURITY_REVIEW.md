# We 4 You — Security Review

Status: the application fixes are in the source. The database lockdown is in `supabase/migrations/20261016_production_security.sql` and still needs to be applied on the Supabase project. Redeploy the edge functions after that. Production is not locked until both of those are live.

Reviewed: 16 October 2026  
Scope: source in this repository (frontend, Supabase SQL migrations, edge functions).  
This is a code review only. The live Supabase project was not queried, and deployed function settings were not confirmed.

No code was changed. Fixes wait until you say which items to apply.

## What this project is

**We 4 You** is a child identification wristband and guardian-contact service.

The README still describes a frontend-only demo with fake login and fake payments. The code is past that:

- React 18 + TypeScript + Vite + Tailwind public site and admin console
- Live Supabase project (`qazflguhczceidcxwtlx`) for auth, database, storage, and edge functions
- Data includes children, guardians, medical notes, band codes, payments, vendors, commissions, and incident reports
- Deploy target is Vercel (`vercel.json` SPA rewrite; signup redirects mention `we-4-you.vercel.app`)

Admin screens are partly still backed by in-memory demo state in `src/context/AppContext.tsx`, while `src/services/supabaseService.ts` and the SQL functions talk to the real database. Both paths are in the repo.

## Environment variables — not everything is env-driven

| Setting | Where it should live | What the code does |
|---|---|---|
| `VITE_SUPABASE_URL` | `.env` (gitignored) | Read from env, then **hardcoded fallback** to the live project URL in `src/lib/supabase.ts` and `src/services/authService.ts` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `.env` | Read from env, then **hardcoded fallback** in `src/lib/supabase.ts`. The same value is committed in `.env.example` |
| `VITE_SUPABASE_ANON_KEY` | `.env` | Used only by the staff-create fallback in `authService.ts`. If unset, that fallback uses an empty key |
| `SUPABASE_URL` | Edge function env (Supabase injects this) | Read with `Deno.env.get` in every function. No hardcoded service URL there |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge function env only | Read with `Deno.env.get`. **Not committed.** This part is correct |
| Office contact details, demo admin emails | Should be config | Hardcoded (`we4u@gmail.com`, `admin@we4u.com`) |
| Card demo values | Should not be a real payment form | Hardcoded in `CardPaymentForm.tsx` |

`.env` is gitignored. `.env.example` is committed and points at the live project, including a publishable key.

A publishable/anon key is meant to be public in a browser app. It is safe only when Row Level Security and function checks reject unauthorized calls. Those checks are not holding, so the hardcoded key is enough to call the database API.

The app also runs if `.env` is missing, because of the fallbacks. Configuration is **not** fully environment-driven.

## Findings

Severity is based on what a caller can do with the public client key, a normal signup, or the admin UI.

### Critical

#### 1. Privileged database functions are executable by anonymous and logged-in users

`SECURITY DEFINER` functions bypass Row Level Security. Several are granted to `anon` and `authenticated`, and the function bodies do not check `auth.uid()` or `is_admin()` / `is_support_or_admin()`.

| Function | File | What a caller can do |
|---|---|---|
| `approve_registration_atomic` | `supabase/migrations/20260927_admin_approval_workflow.sql` | Approve a registration, create wearer, band, subscription, payment, and commission records |
| `reject_registration_atomic` | same file | Reject registrations |
| `verify_demo_payment_atomic` | same file | Mark a payment verified |
| `create_commission_atomic` | same file | Create commission rows for any vendor and amount |
| `lookup_band_guardian_secure` | `supabase/migrations/20260927_safety_incident_module.sql` | Return wearer name, age range, primary and secondary contacts, subscription, and vendor phone for a band code |
| `log_guardian_contact_attempt` | same file | Write contact attempts onto incidents |
| `update_incident_status_atomic` | same file | Change incident status, including resolved |
| `lookup_band_emergency` | `supabase/migrations/20260925_enable_rls_security_policies.sql` | Return child name, blood type, allergies, medical conditions, and contact JSON for a band code |
| `sync_subscription_statuses_atomic` | `supabase/migrations/20260927_storage_realtime_reminders.sql` | Bulk-update subscription statuses |
| `send_renewal_reminder_atomic` | same file | Insert reminder rows (recipient email and phone) |

The UI calls these through `src/services/supabaseService.ts`. The grant is on the database role, so the admin screen is not the only caller. The anon key in the frontend is enough.

`lookup_band_guardian_secure` is commented as support/admin only. The grant and the missing role check do not match that comment.

#### 2. `create-staff-user` can create admin accounts with the service role

`supabase/functions/create-staff-user/index.ts` uses `SUPABASE_SERVICE_ROLE_KEY` and `auth.admin.createUser` with `email_confirm: true`. It accepts `role: "admin"` from the request body.

It never reads the caller JWT and never checks that the caller is an admin. The same pattern is in:

- `supabase/functions/approve-registration/index.ts`
- `supabase/functions/reject-registration/index.ts`
- `supabase/functions/create-commission/index.ts`
- `supabase/functions/verify-demo-payment/index.ts`
- `supabase/functions/submit-registration/index.ts` (public submit is reasonable; marking `payment_status` as `paid` because the body says `paymentMethod === "card"` is not)

There is no `supabase/config.toml` in the repo, so JWT verification for deployed functions could not be confirmed. Supabase’s default check only proves that some valid key was sent. The publishable key satisfies that. It does not prove the caller is staff.

#### 3. A new user can set their own profile role to `admin`

`users_insert_own_profile` in `supabase/migrations/20260925_enable_rls_security_policies.sql` only checks `id = auth.uid()`. It does not force `role = 'parent'`.

The update policy blocks later role changes. The first insert does not. After that insert, `is_admin()` is true, and the admin policies open guardians, children, payments, bands, and staff profiles.

`src/services/authService.ts` also trusts `user_metadata.role` when a profile row is missing (`getProfile`). Signup metadata is caller-controlled. That spoofs the React role and `ProtectedRoute`, even when the database role is still `parent`.

### High

#### 4. Hardcoded admin login fallback

`src/services/authService.ts` (`signIn`): if Supabase is not configured, or if the password check fails, `we4u@gmail.com` or `admin@we4u.com` with any password of 6+ characters is returned as an admin user. No Supabase session is created.

`src/context/AppContext.tsx` then stores `we4u_admin_auth=true` in `localStorage` and `sessionStorage`. `src/components/common/ProtectedRoute.tsx` treats that flag as authorization for admin and support routes.

This is a client-side gate. It does not replace the database bugs above, and it does let the admin UI open without a real staff session.

#### 5. Anonymous writes, and a path from public band rows to child records

`GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated` is in `supabase/migrations/20260925_full_schema.sql`. RLS limits that grant, but several policies are `WITH CHECK (true)` for `anon`:

- `guardians`, `wearers`, `child_guardians`
- `registrations` (includes `wearer_data`, `contact_data`, `card_details`)
- `subscriptions`, `payments`
- `incidents`, `contact_messages`

`public_lookup_band` allows `SELECT` on all band rows for `anon` (`USING (true)`), including `child_id` and `wearer_id`.

An authenticated parent who can insert into `child_guardians` can attach those wearer ids to their own guardian row. `parents_read_own_wearers` then returns the child row: name, date of birth, blood type, allergies, medical conditions, photo URL, and contact JSON.

#### 6. Storage and reminder policies do not check staff role

In `supabase/migrations/20260927_storage_realtime_reminders.sql`:

- `"Staff can access wearer photos"` is `FOR ALL TO authenticated` on `wearer-photos`, `payment-receipts`, and `branding-assets`, with no `is_support_or_admin()` check. Any logged-in parent can read and write those objects.
- `"Public can upload registration photo"` allows `anon` insert into `wearer-photos` with no owner path check.
- `renewal_reminders` is `FOR ALL TO authenticated` with `USING (true)`. Any logged-in user can read guardian emails and phones stored there.
- `authenticated_insert_audit_logs` is `WITH CHECK (true)`, so any logged-in user can insert audit rows.

#### 7. Card data is collected as if it were a real charge

`src/components/common/CardPaymentForm.tsx` collects full card number, expiry, and CVV in the browser. There is no payment processor. `RegisterPage.tsx` stores brand, last4, cardholder name, and expiry, and invents a transaction id.

`submit-registration` writes the request’s `cardDetails` JSON into `registrations.card_details` and sets `payment_status` to `paid` when the body says the method is card. The column can hold whatever JSON a caller sends. Storing PAN or CVV would be a card-data violation. Marking payment paid with no acquirer is a financial integrity bug.

The form includes a demo fill (`4242…`, CVV `849`) that looks like a real checkout.

### Medium

#### 8. Live project URL and publishable key are in source

- `src/lib/supabase.ts` lines 4–10
- `.env.example`
- `authService.ts` staff-create fallback

Removing `.env` does not disconnect the app from the live project.

#### 9. `SECURITY DEFINER` functions do not set `search_path`

The helper and workflow functions are `SECURITY DEFINER` without `SET search_path = public`. That is a known Postgres privilege-escalation class if an attacker can create objects in a schema that appears earlier on the path. Supabase usually locks this down; the functions should still pin `search_path`.

#### 10. Passwords and account recovery are weak for a staff console

Signup and staff creation accept 6-character passwords (`SignupPage.tsx`, `StaffListPage.tsx`). Password reset uses the default Supabase email flow with no extra staff confirmation. That is acceptable for parents only if Supabase rate limits and leaked-password protection are turned on in the project dashboard (not visible in this repo).

#### 11. Edge functions allow any origin

Every function sets `Access-Control-Allow-Origin: *`. Combined with missing authorization, any website can call them with the public key.

#### 12. README describes a demo that this code is not

`README.md` says there is no backend, no real auth, and no payment capture. Operators following that document will underestimate the data in Supabase.

### Low

#### 13. Admin flag and demo records live in browser storage

`AppContext.tsx` mirrors operational state into `localStorage` and `sessionStorage`, and `localStorage.clear()` runs on demo reset. On a shared computer this leaves child and guardian fields in the browser. The admin flag in the same storage is the high finding above; the leftover demo data is the lower one.

#### 14. Client TypeScript uses `as any` for `import.meta.env`

`src/lib/supabase.ts` casts Vite env access. That does not hide secrets. It does make a missing variable fail open to the hardcoded URL and key.

## What is in decent shape

- `.env` is gitignored. The service role key is not in the repo.
- Edge functions read the service role from `Deno.env`, not from the frontend bundle.
- RLS is enabled on the public tables listed in `20260925_enable_rls_security_policies.sql`.
- Profile updates cannot change `role` after the row exists (the insert path still can).
- Public parent signup in the UI sends `role: 'parent'`. The database does not enforce that.
- `submit_found_child_report` returns an acknowledgement only, not guardian records. The other lookup functions do not have that limit.
- Branding storage is the only bucket with a public read policy. Wearer photos and receipts are not public buckets. The authenticated policy in finding 6 still opens them to every logged-in user.
- Registration UI currently sends last4 and expiry, not the full card number, into app state. The edge function does not enforce that limit.

## Suggested fix order

Do these only after you approve. Nothing below is applied yet.

1. Revoke `EXECUTE` from `anon` and `authenticated` on every admin function. Re-grant only to `service_role`, or keep `authenticated` and add `IF NOT public.is_admin()` / `is_support_or_admin()` at the start of each function. Leave `submit_found_child_report` callable by `anon`, and keep its return payload free of guardian data.
2. Remove `lookup_band_emergency` from `anon`, or change it so a public band code returns no name, medical data, or phone numbers.
3. In every edge function except a deliberately public registration endpoint, require a user JWT and reject callers who are not admin or support. `create-staff-user` should allow `admin` only.
4. Change `users_insert_own_profile` so the inserted role must be `parent`. Stop reading `user_metadata.role` for authorization.
5. Delete the email/password admin fallback and stop treating `we4u_admin_auth` in browser storage as access control.
6. Replace `WITH CHECK (true)` inserts with column and ownership checks. Stop public `SELECT` of all bands; expose a narrow lookup that does not return `child_id`.
7. Restrict storage policies to staff for private buckets, and restrict `renewal_reminders` the same way.
8. Remove the card form, or send the card only to a PCI processor and store a processor token. Never persist PAN or CVV. Do not set `paid` from a client field.
9. Delete hardcoded Supabase URL and publishable key. Fail startup when `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are missing. Replace the live values in `.env.example` with placeholders.
10. Set `search_path` on every `SECURITY DEFINER` function. Replace `GRANT ALL` to `anon` with the specific privileges each policy needs.
11. Update the README so it matches the live backend.

## Files reviewed

- `README.md`, `package.json`, `.env.example`, `.gitignore`, `vercel.json`
- `src/lib/supabase.ts`, `src/services/authService.ts`, `src/services/supabaseService.ts`
- `src/context/AuthContext.tsx`, `src/context/AppContext.tsx`
- `src/components/common/ProtectedRoute.tsx`, `src/components/common/CardPaymentForm.tsx`
- `src/pages/admin/AdminLoginPage.tsx`, `src/pages/public/RegisterPage.tsx`
- `supabase/functions/*/index.ts`
- `supabase/migrations/20260925_full_schema.sql`
- `supabase/migrations/20260925_enable_rls_security_policies.sql`
- `supabase/migrations/20260927_admin_approval_workflow.sql`
- `supabase/migrations/20260927_safety_incident_module.sql`
- `supabase/migrations/20260927_storage_realtime_reminders.sql`
