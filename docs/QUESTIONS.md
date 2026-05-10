# Open Questions

---

## Blocking

### Google OAuth credentials required for Stop Point 2 (S4-03)

Stop Point 2 requires Google OAuth to be verified end-to-end (signup via Google → `public.users` row created). This is **blocked** until the operator adds credentials to Supabase.

**Steps required (manual — Claude cannot do these):**
1. Google Cloud Console → APIs & Services → Credentials → Create OAuth Client ID (Web application)
2. Add Authorized redirect URI: `https://jtanekyzfvmytcassmpj.supabase.co/auth/v1/callback`
3. Supabase dashboard → Authentication → Providers → Google → enter Client ID + Client Secret → Enable
4. Remove the `disabled` prop from the Google button in `app/auth/sign-in/page.tsx` (line ~88)

**Code status:** `signInWithGoogle()` action is complete in `app/actions/auth.ts`. The button exists on the sign-in page. Only the dashboard credentials and the `disabled` prop removal remain.

Phase C must not start until this is resolved OR the operator explicitly defers Google OAuth testing to a later phase.

---

## Non-Blocking Follow-Ups

### Supabase SQL migrations (applied, for the record)
Both `auth-trigger.sql` and `rls.sql` were applied successfully (33 policies confirmed).
No further action needed unless schema changes require re-running.

### `/profile/me` is a placeholder until S5-05
After email verification, users land on `/profile/me` which currently shows only their email address.
The full profile (tier list, reviews, watchlist, collections tabs) is implemented in S5-05 (Phase C).
This is explicitly documented as a temporary state — not a bug.

---

## External Manual Actions Required

| Action | Required by | Done? |
|---|---|---|
| Add Google OAuth credentials to Supabase Auth → Providers → Google | Stop Point 2 | **No — BLOCKING** |
| Remove `disabled` from Google button in `app/auth/sign-in/page.tsx` | Stop Point 2 | No (after above) |
| Set `NEXT_PUBLIC_SITE_URL` in Vercel project env vars | Auth robustness | See note below |
| Supabase → Authentication → URL Configuration — see note below | Auth routing | In progress |
| Verify signup → email → `/profile/me` flow in browser | Stop Point 3 | Re-test after URL config |
| Verify magic link flow in browser | Stop Point 3 | Re-test after URL config |
| Verify password reset email + complete in browser | Stop Point 3 | Re-test after URL config |
| Verify production URL returns 200 on commit `4719059` | S1 sign-off | Assumed yes (operator proceeded) |
| Monitor Vercel deploys for each Phase A/B/C push | ongoing | — |

### Supabase URL Configuration (required for email links to reach /auth/callback)

Supabase → Authentication → URL Configuration must have:

**Site URL:**
- Production: `https://scarymoovies-prototype.vercel.app`

**Redirect URLs (allowlist):**
```
https://scarymoovies-prototype.vercel.app/**
https://scarymoovies-prototype.vercel.app/auth/callback
http://localhost:3000/**
http://localhost:3000/auth/callback
```

Without `/auth/callback` in the allowlist, Supabase falls back to the Site URL root (`/`) and the auth code exchange never happens.

### NEXT_PUBLIC_SITE_URL env var (recommended for production)

Add to Vercel project settings → Environment Variables:
```
NEXT_PUBLIC_SITE_URL = https://scarymoovies-prototype.vercel.app
```

`getOrigin()` in `app/actions/auth.ts` checks this var first, falling back to request headers. This ensures `emailRedirectTo` is always correct regardless of proxy header behavior.

---

## Resolved (S1)

- Production 500 `MIDDLEWARE_INVOCATION_FAILED` — fixed; see `docs/DECISIONS.md` (middleware section)
- Production 404 — fixed by `vercel.json` with explicit `framework: nextjs`
- Supabase SQL migrations applied; 33 RLS policies confirmed
- Seeder `.env.local` fix applied (`config({ path: '.env.local' })`)
- `auth-trigger.sql` made idempotent (`DROP TRIGGER IF EXISTS`)

## Resolved (Phase A)

- Server Actions bypassed RLS via Drizzle — fixed; all user mutations now use Supabase client (see `docs/DECISIONS.md`)

## Resolved (Phase C — Stop Point 3)

- **Auth email links landing on `/?code=...` → Internal Server Error** — fixed with three-layer defense:
  1. Middleware redirects `/?code=...` → `/auth/callback?code=...` (Edge layer)
  2. `app/page.tsx` Server Component checks `searchParams.code` and redirects (Node layer)
  3. `/auth/callback/route.ts` wraps `exchangeCodeForSession` in try-catch so invalid/fake codes redirect to `/auth/error` instead of crashing
- **Magic link `emailRedirectTo` missing `?next=/profile/me`** — fixed in `app/actions/auth.ts`
- **Tier List tab always empty** — fixed by adding `TierPicker` component to the film detail page right column. Implementation: `getCurrentTierEntry` server action reads current tier from `tier_list_entries`; `TierPicker` client component shows S/A/B/C/D/E/F buttons gated on `hasRating`; selecting a tier calls `addToTierList` which upserts `tier_list_entries` (no duplicates). Profile `/profile/me → Tier List` tab now reflects the selection.
- **TierPicker stays disabled after rating** — fixed by `FilmSidePanel` client wrapper that shares `hasRating` state between `RatingPanel` and `TierPicker`. `RatingPanel` now accepts `onRated?: () => void` callback, called on successful save. TierPicker enables immediately without page refresh.
- **No way to move/reorder tier list entries** — fixed with `reorderTierEntry` server action (position-swap) and movement controls in `TierRow`: ↑←×→↓ buttons per poster card. Cross-tier moves use `moveTierEntry` + `router.refresh()`; within-tier reorder uses `reorderTierEntry` + optimistic local state update. Controls are always visible on mobile (touch), hover-reveal on desktop.
- **Mobile responsiveness** — targeted fixes: ProfileHeader avatar smaller on mobile (w-14/md:w-20), username `break-all`; ProfileTabs `overflow-x-auto` + `whitespace-nowrap` on tab buttons; TierRow movement controls w-5 h-5 (20px touch targets), `sm:opacity-0 sm:group-hover:opacity-100` (always visible on mobile).
