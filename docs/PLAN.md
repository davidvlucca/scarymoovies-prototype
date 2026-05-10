# ScaryMoovies Prototype — Build Plan (QA-reviewed)

## Project

Horror IMDB-like platform built on Next.js 15 + Supabase. Two-paste workflow: S1 (Architect) runs alone first; S2–S8 spawn only after human approves Stop Point 1.

**Repos & services:**
- GitHub: `https://github.com/davidvlucca/scarymoovies-prototype`
- Vercel: `https://vercel.com/davidvluccas-projects/scarymoovies-prototype`
- Supabase: `https://jtanekyzfvmytcassmpj.supabase.co` (eu-west-1, Ireland)
- Local: `D:\ScaryMoovies\prototype\`

**Design references:**
- PRIMARY: `D:\ScaryMoovies\brand-system\` — design source of truth (tokens, components, specs). Verify with `npm run lint && npm run build` in `brand-system\web\` before porting components. If lint fails, treat components as design references only — adapt, do not copy verbatim. Tokens always come from `brand-system\web\app\globals.css`.
- Secondary: `c:\Users\dnavi\Downloads\ScaryMoovies Design System Updatedk\ui_kits\web\` — screen compositions only
- Legacy (UX ideas only): `D:\ScaryMoovies\Assets\scary-moovies\` — **DO NOT copy its architecture, API layer, token system, env handling, or localStorage persistence. Reference only for screen layout ideas.**
- Live: `https://scarymoovies-bs.vercel.app/`

**Display font:** Inter Black (`--font-display: var(--font-body)`) — no Playfair Display.

**No hardcoded hex** in prototype JSX/TSX except canonical token definitions in `globals.css` or documented external brand marks.

---

## Pre-work checklist

- [x] GitHub repo created
- [x] Vercel project linked to GitHub repo (Preview and Production env vars set separately — see below)
- [x] Supabase project created (eu-west-1 Ireland — correct for Portugal)
- [x] All 5 env vars added to Vercel Environment Variables
- [x] Repo cloned to `D:\ScaryMoovies\prototype\`
- [x] Node.js v24.11.1 confirmed

**Env vars configured (Production + Preview — set separately in Vercel):**
```
NEXT_PUBLIC_SUPABASE_URL=https://jtanekyzfvmytcassmpj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...          ← server-side only, never expose to browser
DATABASE_URL=postgresql://postgres.jtanekyzfvmytcassmpj:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
TMDB_API_KEY=eyJhbGci...                         ← server-side only, never NEXT_PUBLIC_TMDB_*
```

Note: Supabase uses new key format (`sb_publishable_` / `sb_secret_`) — compatible with @supabase/ssr.

**Vercel env var scope:**
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Production + Preview + Development
- `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `TMDB_API_KEY`: Production + Preview only (never Development browser exposure)

---

## Version decisions

| Item | Decision | Rationale |
|---|---|---|
| Next.js | **15** (pin `create-next-app@15`) | Intentional — locked to 15 for stability and planned compatibility. Do not use `@latest` (may install 16+). Brand-system version is not verified and may differ. |
| Tailwind | **v4** CSS-first — `@import "tailwindcss"`, `@theme inline`, no `tailwind.config.ts` | Token compatibility with brand-system `globals.css` |
| Node | **24.x** — add `"engines": { "node": "24.x" }` to `package.json` | Matches local v24.11.1 and current Vercel default |
| Drizzle | **`drizzle-kit generate && drizzle-kit migrate`** — never `drizzle-kit push` in production | `push` skips migration history; `generate + migrate` is safe for production |
| Apple OAuth | Deferred to v0.2 | Requires Apple Developer account + cert work |

---

## Issues from original prompt (all fixed below)

**Critical:** HANDOFF.md reference removed · Next.js 14→15 · Tailwind v3/v4 ambiguity · RLS missing from S1 · OAuth callback exception · auth.users bridge missing

**Important:** Migration system split · TMDB image domain · Two-paste workflow · TMDB rate limiting · S8 test timing · Apple OAuth deferred

**QA review round 1:** `.gitignore` before env · legacy app boundary · hardened RLS · SSR middleware · TMDB server-side gate · brand-system lint check · Node engines field · generate+migrate · schema constraints · deployment gates

**QA review round 2:** Non-empty directory handling · Next.js rationale corrected · async `cookies()` for Next 15 · middleware.ts naming note · git status wording tightened · grep→rg (PowerShell) · service role audit · `"node": "24.x"` · `server-only` package · username collision fix

---

## PASTE 1 — S1: Architect only

Paste into a new Claude Code session from `D:\ScaryMoovies\prototype\`. Work sequentially. Do NOT spawn subagents. Report at the stop point.

---

# ScaryMoovies Prototype — S1: Architect

## Your role
You are S1 — the Architect. Set up the scaffold, schema, and first deploy.
S2–S8 follow only after human review of your stop point output.
Work sequentially. Do NOT spawn subagents.

## Design source of truth (READ-ONLY — never write here)

Primary: `D:\ScaryMoovies\brand-system\`
- `web/app/globals.css` — token source of truth (Tailwind v4, 40+ tokens)
- `web/components/brand/*.tsx` — brand components. Before porting any component, run `npm run lint && npm run build` in `brand-system\web\`. If either fails, use the component as a design reference and adapt — do not copy verbatim.
- `web/content/*.mdx` — component specs + usage rules
- `briefing.md` — brand bible
- `web/CLAUDE.md` — non-negotiable rules

Secondary (screen layouts only):
`c:\Users\dnavi\Downloads\ScaryMoovies Design System Updatedk\ui_kits\web\`
- `kit.css`, `detail.css` — layout patterns
- `Screens.jsx`, `Detail.jsx`, `PYF.jsx` — screen compositions to reference for routes

Legacy reference (UX ideas only):
`D:\ScaryMoovies\Assets\scary-moovies\`
DO NOT copy: architecture, API layer, token system, env handling, localStorage persistence.
Use only for screen layout ideas.

Live visual reference: https://scarymoovies-bs.vercel.app/

Read `globals.css` and at least 3 brand components before writing any code.
No hardcoded hex in JSX/TSX. No inline `font-family`. CSS tokens only.

## Tech stack (locked)

- Next.js 15, App Router, TypeScript strict
- Tailwind v4 — `@import "tailwindcss"`, `@theme inline`. NO `tailwind.config.ts`
- shadcn/ui for primitives
- Supabase: Auth + Postgres + Storage
- Drizzle ORM + drizzle-kit (`generate + migrate` — never `push`)
- TanStack Query for server state
- React Hook Form + Zod
- Server Actions for mutations. No `/api/*` routes — exception: `/auth/callback/route.ts` only
- Vitest (unit) + Playwright (e2e)
- Vercel hosting

## Setup steps (run in order)

### Step 0 — .gitignore (MUST run before any env work)

Before anything else, verify `.gitignore` covers secrets. Create or update it:

```
# dependencies
node_modules/

# Next.js
.next/
out/

# env — all variants ignored; only .env.example is committed
.env*
!.env.example

# Vercel
.vercel/

# OS
.DS_Store
Thumbs.db
```

Then verify no secrets are staged:
```bash
git status --short
```
Must show no `.env*` files. Only proceed when clean.

Create `.env.example` (committed, no real values):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
TMDB_API_KEY=
```

### Step 1 — Scaffold

**Important:** `D:\ScaryMoovies\prototype\` already contains `PLAN.md`. `create-next-app` will fail on a non-empty directory. Move the plan file **outside** the prototype directory first, scaffold, then restore it:

```powershell
# 1. Move PLAN.md out of the repo entirely
Move-Item PLAN.md ..\prototype-PLAN.md

# 2. Scaffold into the now-empty directory
npx create-next-app@15 . --typescript --tailwind --app --eslint --src-dir=false --import-alias="@/*"

# 3. Restore plan into docs/
New-Item -ItemType Directory -Force docs
Move-Item ..\prototype-PLAN.md docs\PLAN.md
```

Add `engines` to `package.json`:
```json
"engines": { "node": "24.x" }
```

### Step 2 — Verify Tailwind v4

Check `app/globals.css` opens with `@import "tailwindcss"` — not `@tailwind base`.
If it has `@tailwind` directives, Tailwind v3 was installed — stop and run:
```bash
npm install tailwindcss@next @tailwindcss/postcss@next
```
Then update `globals.css` to the v4 pattern before continuing.

Also confirm `output: "export"` is NOT in `next.config.ts` (this is a dynamic app).

### Step 3 — shadcn init

```bash
npx shadcn@latest init
```
Choose: Default style, CSS variables YES.

Then add components:
```bash
npx shadcn@latest add button dialog dropdown-menu tabs sheet tooltip select form toast input label avatar separator
```

### Step 4 — Install packages

```bash
npm install drizzle-orm @supabase/supabase-js @supabase/ssr drizzle-kit @tanstack/react-query react-hook-form zod lucide-react server-only
npm install -D tsx
```

`server-only` must be imported at the top of every module that reads `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, or `TMDB_API_KEY`:
```ts
import "server-only"
```
Required in: `lib/supabase/server.ts`, Drizzle DB client, TMDB server utilities, any Server Action that touches secrets. This causes a build error if these modules are accidentally imported in a Client Component.

### Step 5 — Port tokens

Copy the full `:root` block and `@theme inline` block from:
`D:\ScaryMoovies\brand-system\web\app\globals.css`
into this project's `app/globals.css`.

Replace shadcn default variables with the ScaryMoovies token set.
Resolve any conflict in favor of brand-system values.
The `@theme inline` block must be ported so Tailwind utility classes resolve tokens.

### Step 6 — next.config.ts

Add TMDB image domain and confirm no static export:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'image.tmdb.org', pathname: '/t/p/**' }
    ]
  }
  // output: "export" must NOT be present — this is a dynamic app
}

export default nextConfig
```

### Step 7 — .env.local (only after Step 0 .gitignore is confirmed)

```bash
# Confirm .env* is gitignored — must show no .env* files staged or tracked.
# Other expected project files (PLAN.md, package.json, etc.) are fine.
git status --short
```

Then run a gitignore test using an empty file (no real values written yet):
```powershell
# Ignore test only — creates an empty file, no secrets
New-Item .env.local -ItemType File
git status --short   # .env.local must NOT appear in the output
```

Only fill `.env.local` with real secret values **after** this test passes and confirms the file is ignored.

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://jtanekyzfvmytcassmpj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
DATABASE_URL=postgresql://postgres.jtanekyzfvmytcassmpj:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
TMDB_API_KEY=eyJhbGci...
```

**TMDB key rule:** `TMDB_API_KEY` is server-side only. Never use `NEXT_PUBLIC_TMDB_*`. Never fetch TMDB from a Client Component. All TMDB calls go through Server Actions or Route Handlers only.

### Step 8 — Supabase client wiring + middleware

Create three files following the official @supabase/ssr Next.js App Router pattern:

**`lib/supabase/server.ts`** — for RSC + Server Actions:

Note: In Next 15, `cookies()` is async and must be awaited. Follow official @supabase/ssr Next.js App Router docs exactly — do not invent a custom pattern.

```ts
import "server-only"
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        }
      }
    }
  )
}
```

**`lib/supabase/browser.ts`** — for Client Components:
```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**`middleware.ts`** (project root) — cookie refresh (REQUIRED — without this, sessions expire silently):

Use `middleware.ts` for Next 15. Do not rename to `proxy.ts` unless upgrading to Next 16+ and updating this plan accordingly.
```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        }
      }
    }
  )

  await supabase.auth.getUser()
  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
}
```

### Step 9 — /auth/callback/route.ts

Note: `cookies()` must be awaited in Next 15. Follow official @supabase/ssr docs — do not invent a custom auth pattern.

```ts
// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          }
        }
      }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
```

## Database schema (db/schema.ts — Drizzle)

Migration system:
- **Drizzle only** for all `public.*` tables (use `drizzle-kit generate && drizzle-kit migrate`)
- **Supabase SQL only** for triggers, RLS policies, Auth config
- Never run both systems on the same table

```ts
// db/schema.ts — key constraints listed; implement full Drizzle schema

// users — id is UUID matching auth.users.id
users: id (uuid PK), username (text, unique), avatar_url, bio, created_at

// films
films: id (serial PK), tmdb_id (integer, UNIQUE), title, year, genre, runtime,
       poster_path, backdrop_path, overview, blurb (nullable), created_at

// ratings
ratings: id (serial PK), user_id (uuid → users), film_id (→ films),
         score (numeric, CHECK score >= 0 AND score <= 5 AND score % 0.5 = 0),
         tier (enum 'S'|'A'|'B'|'C'|'D'|'E'|'F', nullable),
         created_at
         UNIQUE(user_id, film_id)

// reviews
reviews: id (serial PK), user_id (uuid → users ON DELETE CASCADE),
         film_id (→ films ON DELETE CASCADE),
         body (text), helpful_count (int default 0), created_at, updated_at

// watchlist_items
watchlist_items: id (serial PK), user_id (uuid → users ON DELETE CASCADE),
                 film_id (→ films ON DELETE CASCADE), added_at
                 UNIQUE(user_id, film_id)

// tier_lists — one per user
tier_lists: id (serial PK), user_id (uuid → users ON DELETE CASCADE, UNIQUE),
            created_at, updated_at

// tier_list_entries
tier_list_entries: id (serial PK), tier_list_id (→ tier_lists ON DELETE CASCADE),
                   film_id (→ films ON DELETE CASCADE),
                   tier (enum S/A/B/C/D/E/F), position (int)
                   UNIQUE(tier_list_id, film_id)

// collections
collections: id (serial PK), user_id (uuid → users ON DELETE CASCADE),
             title, blurb, cover_film_ids (integer[]), created_at, updated_at

// collection_films
collection_films: id (serial PK), collection_id (→ collections ON DELETE CASCADE),
                  film_id (→ films ON DELETE CASCADE),
                  position (int), editor_note (nullable)
                  UNIQUE(collection_id, film_id)

// follows — no self-follow
follows: id (serial PK), follower_id (uuid → users ON DELETE CASCADE),
         following_id (uuid → users ON DELETE CASCADE),
         created_at
         UNIQUE(follower_id, following_id)
         CHECK(follower_id != following_id)
```

**Indexes to add (common lookup paths):**
```sql
CREATE INDEX ON ratings(film_id);
CREATE INDEX ON ratings(user_id);
CREATE INDEX ON watchlist_items(user_id);
CREATE INDEX ON reviews(film_id);
CREATE INDEX ON tier_list_entries(tier_list_id);
CREATE INDEX ON collection_films(collection_id);
CREATE INDEX ON follows(following_id);
```

After defining schema:
```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

## Supabase SQL migrations (supabase/migrations/)

Apply via Supabase SQL editor or `supabase db push`. Never use Drizzle for these.

### 1. auth-trigger.sql

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Username uses email prefix + 6-char UUID suffix to avoid collisions.
  -- User can update their username on first profile visit.
  INSERT INTO public.users (id, username, created_at)
  VALUES (
    NEW.id,
    split_part(NEW.email, '@', 1) || '_' || substr(NEW.id::text, 1, 6),
    NOW()
  )
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. rls.sql — hardened policies

```sql
-- Enable RLS on all tables
ALTER TABLE public.users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.films            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tier_lists       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tier_list_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_films ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows          ENABLE ROW LEVEL SECURITY;

-- films: public read, no writes via RLS (seeder uses service role)
CREATE POLICY "films_select_public"
  ON public.films FOR SELECT TO anon, authenticated USING (true);

-- users: public read, own row update only
CREATE POLICY "users_select_public"
  ON public.users FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ratings: public read; own rows insert/update/delete
CREATE POLICY "ratings_select_public"
  ON public.ratings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "ratings_insert_own"
  ON public.ratings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ratings_update_own"
  ON public.ratings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ratings_delete_own"
  ON public.ratings FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- reviews: public read; own rows insert/update/delete
CREATE POLICY "reviews_select_public"
  ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "reviews_insert_own"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_update_own"
  ON public.reviews FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_delete_own"
  ON public.reviews FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- watchlist_items: own rows only (private)
CREATE POLICY "watchlist_select_own"
  ON public.watchlist_items FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "watchlist_insert_own"
  ON public.watchlist_items FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "watchlist_delete_own"
  ON public.watchlist_items FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- tier_lists: public read; own row insert/update/delete
CREATE POLICY "tier_lists_select_public"
  ON public.tier_lists FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tier_lists_insert_own"
  ON public.tier_lists FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tier_lists_update_own"
  ON public.tier_lists FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tier_lists_delete_own"
  ON public.tier_lists FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- tier_list_entries: public read; write only if caller owns parent tier_list
CREATE POLICY "tier_entries_select_public"
  ON public.tier_list_entries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tier_entries_insert_own"
  ON public.tier_list_entries FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.tier_lists WHERE id = tier_list_id)
  );
CREATE POLICY "tier_entries_update_own"
  ON public.tier_list_entries FOR UPDATE TO authenticated
  USING (auth.uid() = (SELECT user_id FROM public.tier_lists WHERE id = tier_list_id))
  WITH CHECK (auth.uid() = (SELECT user_id FROM public.tier_lists WHERE id = tier_list_id));
CREATE POLICY "tier_entries_delete_own"
  ON public.tier_list_entries FOR DELETE TO authenticated
  USING (auth.uid() = (SELECT user_id FROM public.tier_lists WHERE id = tier_list_id));

-- collections: public read; own rows write
CREATE POLICY "collections_select_public"
  ON public.collections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "collections_insert_own"
  ON public.collections FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "collections_update_own"
  ON public.collections FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "collections_delete_own"
  ON public.collections FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- collection_films: public read; write only if caller owns parent collection
CREATE POLICY "collection_films_select_public"
  ON public.collection_films FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "collection_films_insert_own"
  ON public.collection_films FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.collections WHERE id = collection_id)
  );
CREATE POLICY "collection_films_update_own"
  ON public.collection_films FOR UPDATE TO authenticated
  USING (auth.uid() = (SELECT user_id FROM public.collections WHERE id = collection_id))
  WITH CHECK (auth.uid() = (SELECT user_id FROM public.collections WHERE id = collection_id));
CREATE POLICY "collection_films_delete_own"
  ON public.collection_films FOR DELETE TO authenticated
  USING (auth.uid() = (SELECT user_id FROM public.collections WHERE id = collection_id));

-- follows: public read; own rows write
CREATE POLICY "follows_select_public"
  ON public.follows FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "follows_insert_own"
  ON public.follows FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete_own"
  ON public.follows FOR DELETE TO authenticated
  USING (auth.uid() = follower_id);
```

**RLS verification query** — run after applying `rls.sql` and confirm all expected policies exist:
```sql
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```
Expected: 10 tables enabled, all tables above have explicit per-operation policies. No table should rely on a catch-all `USING (true)` for writes.

## TMDB seeder (scripts/seed-films.ts)

- All TMDB calls are server-side. `TMDB_API_KEY` is read from `process.env` only.
- No `NEXT_PUBLIC_TMDB_*` variables. No TMDB fetches from Client Components.
- Use Bearer auth: `Authorization: Bearer ${process.env.TMDB_API_KEY}`
- Fetch 50 horror films via `/discover/movie?with_genres=27` across multiple pages/decades.
- Add **100ms delay** between API calls to avoid 429 rate limit errors.
- Write to `films` table via Drizzle. Upsert on `tmdb_id` — skip duplicates.

```bash
npx tsx scripts/seed-films.ts
```

**TMDB audit gate** — before Stop Point 1 sign-off, run (PowerShell / ripgrep):
```bash
rg "NEXT_PUBLIC_TMDB|TMDB_API_KEY|tmdb\.org" -g "*.ts" -g "*.tsx"
```
Expected:
- `NEXT_PUBLIC_TMDB` → zero results anywhere
- `tmdb.org` → must not appear in any Client Component file
- `TMDB_API_KEY` → may only appear in server-only files or scripts (never in `"use client"` files)

**Service role audit** — also run:
```bash
rg "SUPABASE_SERVICE_ROLE_KEY|service_role|sb_secret_" -g "*.ts" -g "*.tsx" -g "*.md" -g "*.env*"
```
Expected:
- No real secret values in any committed file
- `SUPABASE_SERVICE_ROLE_KEY` only in server-only modules, scripts, or documentation placeholders
- Never imported or referenced in Client Components

## First commit + deploy

Pre-deploy checklist (run all locally before pushing):
```bash
npx tsc --noEmit          # zero type errors
npm run lint               # zero ESLint warnings
npm run build              # build succeeds, output: export must NOT appear
git status --short         # no .env* files staged or tracked
rg "NEXT_PUBLIC_TMDB|TMDB_API_KEY|tmdb\.org" -g "*.ts" -g "*.tsx"   # NEXT_PUBLIC_TMDB = zero
rg "SUPABASE_SERVICE_ROLE_KEY|sb_secret_" -g "*.ts" -g "*.tsx"      # not in client files
```

Then push:
```bash
git add -A
git commit -m "chore(scaffold): Next.js 15 + Supabase + Drizzle + brand tokens"
git push origin main
```

Vercel will auto-deploy. Wait for deploy to complete before proceeding.

## STOP — human review required

Report back with:
1. Vercel deploy URL (must respond 200)
2. `tsc --noEmit` — zero errors
3. `npm run lint` — zero warnings
4. `next build` — succeeded locally, no `output: export` in config
5. `git status --short` — no `.env*` files
6. Supabase `films` table has 50 rows
7. RLS verification query output (all 10 tables, all policies present)
8. `/auth/callback` route exists
9. TMDB audit grep — zero results in client files
10. Any open questions logged to `docs/QUESTIONS.md`

Do NOT spawn S2–S8. Wait for human approval.

---

## PASTE 2 — S2–S8 (send after Stop Point 1 approved)

> Send this only after human reviews and approves all 10 Stop Point 1 checks above.

**S4 — Auth (Apple OAuth deferred to v0.2):**
Wire Supabase Auth:
- Email + password
- Google OAuth
- Magic link
- Email verification
- Password reset
Document in `docs/DECISIONS.md`: Apple OAuth deferred to v0.2.

**S8 — Tests:**
- Vitest unit tests: start alongside S2 (no running app needed)
- Playwright e2e: start ONLY after Stop Point 3 passes (full stack required)

**Required test coverage includes:**
- Auth: signup, login, logout, password reset
- Rating: create, update, ownership enforcement (cannot rate as another user)
- Watchlist: add, remove, ownership enforcement
- Review: create, edit, delete, ownership enforcement
- RLS security path: confirm unauthenticated user cannot INSERT to `ratings`, `reviews`, or `watchlist_items`

---

## Verification checklist

### Stop Point 1
- [ ] `PLAN.md` temporarily moved outside prototype (`../prototype-PLAN.md`) before scaffolding, restored to `docs/PLAN.md` after scaffold
- [ ] `.gitignore` covers `.env*`, `.next/`, `node_modules/`, `.vercel/`
- [ ] `git status --short` shows no `.env*` files staged or tracked
- [ ] `.env.local` confirmed gitignored (test: create file, run `git status --short`, must not appear)
- [ ] `.env.example` committed with empty values
- [ ] `"engines": { "node": "24.x" }` in `package.json`
- [ ] `tsc --noEmit` — zero errors
- [ ] `npm run lint` — zero warnings
- [ ] `next build` succeeds locally
- [ ] `output: "export"` absent from `next.config.ts`
- [ ] TMDB `image.tmdb.org` remote pattern present in `next.config.ts`
- [ ] Vercel deploy URL responds 200
- [ ] `films` table has 50 rows in Supabase
- [ ] RLS enabled on all 10 tables — verification query run and confirmed
- [ ] All expected per-operation policies exist (no catch-all writes)
- [ ] `/auth/callback/route.ts` exists with `await cookies()`
- [ ] `middleware.ts` exists at project root (cookie refresh)
- [ ] `server-only` imported in `lib/supabase/server.ts`, DB client, TMDB utilities
- [ ] `rg "NEXT_PUBLIC_TMDB"` — zero results
- [ ] `rg "SUPABASE_SERVICE_ROLE_KEY|sb_secret_"` — not in any client file
- [ ] Username trigger uses collision-safe suffix (`email_prefix_xxxxxx`)

### Stop Point 2
- [ ] Signup → check email → click link → lands on profile
- [ ] Login → logout works
- [ ] Forgot password email arrives → reset flow completes
- [ ] Google OAuth completes and creates row in `public.users`

### Stop Point 3
- [ ] Full e2e: signup → rate a film → add to watchlist → write review → view on `/profile/me`
- [ ] RLS security test: unauthenticated INSERT to `ratings` returns 403/error
- [ ] Ownership test: user A cannot update user B's rating
- [ ] Playwright suite green
- [ ] Lighthouse mobile > 85
