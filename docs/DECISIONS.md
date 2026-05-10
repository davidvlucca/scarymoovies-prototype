# Architecture & Tool Decisions

> Record permanent decisions here so future agents don't re-litigate them.
> Format: decision → rationale → consequences.

---

## Auth

### Apple OAuth deferred to v0.2
**Decision:** Apple OAuth is not implemented in S2–S8.
**Why:** Requires Apple Developer account, app ID, and key management — not available for v0.1 sprint.
**Consequence:** Auth pages offer email/password + Google OAuth + magic link only. Apple button is hidden or shows a "coming soon" state. Do not wire `signInWithApple` action.

### Google OAuth requires manual Supabase dashboard step
**Decision:** Google OAuth credentials (Client ID + Secret) must be added to Supabase Auth → Providers → Google by the human operator.
**Why:** Claude cannot access the Supabase or Google Cloud dashboards directly.
**Consequence:** S4-03 is blocked until this is done. S4-01/S4-02 can proceed independently. The Google button on `/auth/sign-in` is `disabled` until credentials are confirmed. Stop Point 2 is not fully approved until Google OAuth is verified.

### Signup email verification lands on `/profile/me` placeholder
**Decision:** `signUp()` sets `emailRedirectTo` to `${origin}/auth/callback?next=/profile/me`. After clicking the verification email, users land on `/profile/me`.
**Why:** PLAN.md Stop Point 2 requires "signup → email verification → profile lands." `/profile/me` is a minimal protected placeholder (shows user email) until S5-05 implements the full profile.
**Consequence:** After confirming email, the user sees a minimal page. Full profile UI arrives in Phase C. This is expected — document as temporary state, not a bug.

---

## Middleware

### Supabase session refresh uses fetch-based middleware (no @supabase/ssr import)
**Decision:** `middleware.ts` implements session refresh via direct fetch to `/auth/v1/token` using only `next/server`. `@supabase/ssr` is NOT imported in `middleware.ts`.
**Why:** `@supabase/ssr@0.10.3` (via `@supabase/supabase-js@2.105.x`) causes `MIDDLEWARE_INVOCATION_FAILED` on Vercel Edge runtime — likely imports a Node.js built-in at module load time. Try/catch cannot prevent this because the failure happens at import, not at call site.
**Consequence:** If Supabase changes its cookie format (name scheme, chunking), `middleware.ts` must be updated manually. Server Components and Server Actions continue to use `@supabase/ssr` via `lib/supabase/server.ts` (Node.js runtime — no Edge restriction).
**Do not:** Re-add `import { createServerClient } from '@supabase/ssr'` to `middleware.ts`.

---

## Build

### Production build uses webpack (not Turbopack)
**Decision:** `package.json` build script: `"build": "next build"`. Dev uses `"dev": "next dev --turbopack"`.
**Why:** Turbopack (`next build --turbopack`) mis-bundled `@supabase/ssr` for the Edge runtime during S1 investigation, though the root cause was the package itself. Webpack is conservative and correct.
**Consequence:** Production builds are slower than Turbopack but reliable. Re-evaluate when Turbopack matures.

---

## Data

### Drizzle generate + migrate — never push
**Decision:** All schema changes use `drizzle-kit generate && drizzle-kit migrate`. `drizzle-kit push` is banned.
**Why:** `push` skips migration history; `generate + migrate` is safe for production.
**Consequence:** Every schema change requires a migration file to be generated and applied.

### Supabase SQL for triggers and RLS — never Drizzle
**Decision:** Auth triggers and RLS policies live in `supabase/migrations/*.sql` and are applied via Supabase SQL editor. Drizzle only manages `public.*` table DDL.
**Why:** Drizzle cannot manage Supabase-specific constructs (triggers, RLS, auth schema).

### TMDB API key is server-side only
**Decision:** `TMDB_API_KEY` is never a `NEXT_PUBLIC_` variable. All TMDB fetches go through Server Components, Server Actions, or scripts only.
**Why:** Exposing a TMDB API key to the browser allows unlimited unauthenticated API calls at our expense.
**Consequence:** No TMDB fetches in Client Components. Use RSC data passing or TanStack Query backed by Server Actions.

---

## UI / Styling

### No hardcoded hex in JSX/TSX
**Decision:** All colours must be CSS custom properties (`var(--accent-primary)`) or Tailwind token utilities (`bg-accent`, `text-text-muted`).
**Why:** Brand-system ground truth; prevents drift from design tokens.
**Consequence:** Review all new components before commit. Reject PRs with hardcoded hex.

### No light mode in v0.1
**Decision:** No `dark:` Tailwind variants. No `prefers-color-scheme` media queries. Root background is always `var(--bg-primary)` (#0c0a0e).

### Display font = Inter Black (not Playfair Display)
**Decision:** `--font-display` is set to `var(--font-body)` (Inter). No Playfair Display or other serif.
**Why:** Confirmed in PLAN.md: "Display font: Inter Black".

---

## Packages

### shadcn form component — built manually
**Decision:** `npx shadcn add form` silently fails in shadcn@4. Form components are built manually using `react-hook-form` + `zod` + shadcn primitives (`Input`, `Label`, `Button`).
**Why:** shadcn@4 does not expose a standalone `form` CLI component.

### toast → sonner
**Decision:** `toast` component is deprecated in shadcn@4. `sonner` is used instead.
**Why:** shadcn@4 CLI explicitly rejects `toast` and recommends `sonner`.

### Server Actions only — no /api/* routes
**Decision:** All mutations go through `use server` Server Actions. No API route files except `/auth/callback/route.ts`.
**Why:** Matches PLAN.md tech stack decision. Keeps auth secret handling server-side.

---

## Data Access / Security Model

### Supabase client for user-owned mutations; Drizzle for server-trusted reads

**Decision:** Server Actions that perform user-owned mutations (insert/update/delete on `ratings`, `reviews`, `watchlist_items`, `tier_list_entries`, `collection_films`, `collections`) must use `supabase.from('table').*` via `createClient()` from `lib/supabase/server.ts`. They must NOT call `lib/queries/*` write functions or import `db` from `db/index.ts` directly.

**Why:** `db` (Drizzle, via `DATABASE_URL`) connects as the postgres superuser role, which has `BYPASSRLS`. Every Drizzle write silently skips all 33 RLS policies — `auth.uid()` is never set in the Postgres session. The Supabase client sends the user's JWT through PostgREST, which sets `auth.uid()` correctly and enforces RLS on every operation.

**Consequences:**
- `app/actions/ratings.ts`, `reviews.ts`, `watchlist.ts`, `tier-list.ts` → Supabase client only for mutations.
- `lib/queries/*` write functions (`upsertRating`, `upsertReview`, `addToWatchlist`, etc.) are admin/script-only — they bypass RLS by design. Do not call them from Server Actions.
- `lib/queries/*` read functions are safe to use from Server Components (RSC reads trusted server code; WHERE clauses use JWT-derived user IDs from prior auth checks).
- `db` may be used from Server Components for typed reads. Never from Server Actions for user-scoped writes.
- S8 RLS tests must use the Supabase client path, not Drizzle, to validate policy enforcement.

---

## S2–S8 Conservative Assumptions

- **Tier list gate:** A film must have a `ratings` row for the authenticated user before it can be added to `tier_list_entries`. Enforced in Server Action, not just UI.
- **Watchlist is private:** `watchlist_items` RLS policy is select-own only. Public profiles do not show another user's watchlist.
- **Collections are public read:** Any user (including anon) can read a collection. Write is own-only.
- **PYF recommendations:** Sourced only from the seeded `films` table (50 rows). No live TMDB search in PYF result. Expand seed if results are too sparse.
- **Rating scale:** 0–5 in 0.5 increments. Stored as `numeric(3,1)`. CHECK constraint enforced in DB.
- **No real-time:** No Supabase Realtime subscriptions in v0.1. TanStack Query handles client-side caching with manual invalidation after mutations.
