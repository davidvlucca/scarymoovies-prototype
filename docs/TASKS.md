# ScaryMoovies Prototype — S2–S8 Task Registry

> Source of truth: `docs/PLAN.md`. This file tracks task breakdown only.
> Update the `status` field as work progresses.
> Agent roles: **frontend**, **fullstack**, **devops**, **debug**, **prompt-engineer**, **qa-foundation**, **qa-features**, **qa-interactions**, **qa-deploy**

---

## S2 — Design Tokens + Layout Shell

| Field | Value |
|---|---|
| **ID** | S2-01 |
| **Title** | Global layout shell (navbar, root layout, skip link) |
| **Owner** | frontend |
| **Deps** | S1 complete |
| **Files** | `app/layout.tsx`, `components/layout/navbar.tsx`, `components/layout/mobile-menu.tsx` |
| **Output** | Persistent navbar rendered on all routes; skip-to-content link; Inter font via next/font |
| **Verify** | Renders at localhost:3000; no hardcoded hex; tsc clean |
| **Status** | pending |
| **Blockers** | none |

| Field | Value |
|---|---|
| **ID** | S2-02 |
| **Title** | Brand token audit — confirm globals.css matches brand-system source |
| **Owner** | frontend |
| **Deps** | S1 complete |
| **Files** | `app/globals.css` |
| **Output** | All 40+ tokens verified against `brand-system/web/app/globals.css`; `@theme inline` block complete |
| **Verify** | Diff against brand-system source; no missing tokens |
| **Status** | pending |
| **Blockers** | none |

| Field | Value |
|---|---|
| **ID** | S2-03 |
| **Title** | Placeholder home page (/) |
| **Owner** | frontend |
| **Deps** | S2-01 |
| **Files** | `app/page.tsx` |
| **Output** | Minimal dark-first home page with navbar; replaces scaffold placeholder |
| **Verify** | Renders; no dark: variants; tokens used |
| **Status** | pending |
| **Blockers** | none |

---

## S3 — Data Layer + TMDB

| Field | Value |
|---|---|
| **ID** | S3-01 |
| **Title** | TMDB server utilities (lib/tmdb.ts) |
| **Owner** | fullstack |
| **Deps** | S1 complete |
| **Files** | `lib/tmdb.ts` |
| **Output** | `fetchFilm(tmdbId)`, `fetchFilms(page)`, `searchFilms(q)` — all server-only; Bearer auth; 100ms delay between calls |
| **Verify** | `import "server-only"` at top; `NEXT_PUBLIC_TMDB` = 0 grep |
| **Status** | pending |
| **Blockers** | none |

| Field | Value |
|---|---|
| **ID** | S3-02 |
| **Title** | Drizzle query helpers (lib/queries/) |
| **Owner** | fullstack |
| **Deps** | S1 complete (schema exists) |
| **Files** | `lib/queries/films.ts`, `lib/queries/ratings.ts`, `lib/queries/reviews.ts`, `lib/queries/watchlist.ts`, `lib/queries/collections.ts` |
| **Output** | Typed query functions for each table; all import `db/index.ts` (server-only) |
| **Verify** | tsc clean; no direct SQL strings |
| **Status** | pending |
| **Blockers** | none |

| Field | Value |
|---|---|
| **ID** | S3-03 |
| **Title** | Server Actions — ratings, reviews, watchlist |
| **Owner** | fullstack |
| **Deps** | S3-02 |
| **Files** | `app/actions/ratings.ts`, `app/actions/reviews.ts`, `app/actions/watchlist.ts` |
| **Output** | `use server` actions with Zod validation; auth check via `createClient()`; RLS enforced by Supabase |
| **Verify** | No `/api/` routes (except `/auth/callback`); tsc clean |
| **Status** | pending |
| **Blockers** | S4 (auth) must be wired before actions can be user-tested end-to-end |

| Field | Value |
|---|---|
| **ID** | S3-04 |
| **Title** | TanStack Query provider + client-side cache setup |
| **Owner** | fullstack |
| **Deps** | S2-01 |
| **Files** | `app/providers.tsx`, `app/layout.tsx` |
| **Output** | `QueryClientProvider` wrapping app shell; `use client` provider component |
| **Verify** | No SSR hydration mismatch; tsc clean |
| **Status** | pending |
| **Blockers** | none |

---

## S4 — Auth

| Field | Value |
|---|---|
| **ID** | S4-01 |
| **Title** | Auth pages — sign-up, sign-in, forgot password, reset password |
| **Owner** | frontend |
| **Deps** | S2-01, S3-04 |
| **Files** | `app/auth/sign-up/page.tsx`, `app/auth/sign-in/page.tsx`, `app/auth/forgot-password/page.tsx`, `app/auth/reset-password/page.tsx`, `app/auth/error/page.tsx` |
| **Output** | Forms built with react-hook-form + Zod; styled with brand tokens; no hardcoded hex |
| **Verify** | All pages render; form validation client-side; tsc clean |
| **Status** | pending |
| **Blockers** | none |

| Field | Value |
|---|---|
| **ID** | S4-02 |
| **Title** | Auth Server Actions — sign-up, sign-in, sign-out, magic-link, password reset |
| **Owner** | fullstack |
| **Deps** | S3-02 |
| **Files** | `app/actions/auth.ts` |
| **Output** | `signUp`, `signIn`, `signOut`, `sendMagicLink`, `sendPasswordReset`, `updatePassword` — all `use server`; `createClient()` from `lib/supabase/server.ts` |
| **Verify** | No client-side Supabase secret usage; tsc clean |
| **Status** | pending |
| **Blockers** | none |

| Field | Value |
|---|---|
| **ID** | S4-03 |
| **Title** | Google OAuth wiring |
| **Owner** | fullstack |
| **Deps** | S4-02 |
| **Files** | `app/actions/auth.ts`, Supabase dashboard config (manual) |
| **Output** | `signInWithGoogle` Server Action; OAuth redirect via `supabase.auth.signInWithOAuth`; `/auth/callback` handles code exchange |
| **Verify** | Stop Point 2: Google OAuth flow completes and creates row in `public.users` |
| **Status** | pending |
| **Blockers** | Google Cloud OAuth credentials must be added to Supabase dashboard (manual step) |

| Field | Value |
|---|---|
| **ID** | S4-04 |
| **Title** | Auth state in navbar + protected route guard |
| **Owner** | frontend |
| **Deps** | S4-01, S4-02 |
| **Files** | `components/layout/navbar.tsx`, `components/auth/user-menu.tsx`, `lib/auth-guard.ts` |
| **Output** | Navbar shows user avatar when signed in; unauthenticated users redirected from protected routes |
| **Verify** | Sign in → navbar updates; sign out → redirected; Stop Point 2 checklist |
| **Status** | pending |
| **Blockers** | none |

**► Stop Point 2** (gate before S5–S6):
- Signup → email verification → profile lands
- Login / logout works
- Password reset email arrives and completes
- Google OAuth creates `public.users` row

---

## S5 — Core Feature Pages

| Field | Value |
|---|---|
| **ID** | S5-01 |
| **Title** | Home page — Featured, Coming Soon, Scary Picks, Spooky People sections |
| **Owner** | frontend |
| **Deps** | S3-01, S3-02, S2-01 |
| **Files** | `app/page.tsx`, `components/home/featured-section.tsx`, `components/home/horizontal-scroll.tsx`, `components/home/genre-tabs.tsx` |
| **Output** | Dark-first home matching `Screens.jsx` layout; TMDB-sourced film data; section titles in caps |
| **Verify** | Renders with real data; no hardcoded hex; responsive |
| **Status** | pending |
| **Blockers** | S3-01 (TMDB utilities) |

| Field | Value |
|---|---|
| **ID** | S5-02 |
| **Title** | Explore page (/explore) — dual filter (genre + mood) |
| **Owner** | frontend |
| **Deps** | S3-01, S3-02 |
| **Files** | `app/explore/page.tsx`, `components/explore/genre-filter.tsx`, `components/explore/mood-filter.tsx`, `components/explore/film-grid.tsx` |
| **Output** | Genre filter: `max-height` collapse; Mood filter: `opacity: 0.15` dim (non-reflow); 200ms ease transitions — per brand-system spec |
| **Verify** | Both filters work independently; no reflow on mood filter; brand tokens only |
| **Status** | pending |
| **Blockers** | none |

| Field | Value |
|---|---|
| **ID** | S5-03 |
| **Title** | Film Detail page (/film/[id]) |
| **Owner** | frontend |
| **Deps** | S3-01, S3-02, S4-04 |
| **Files** | `app/film/[id]/page.tsx`, `components/film/film-hero.tsx`, `components/film/rating-panel.tsx`, `components/film/review-list.tsx`, `components/film/watchlist-button.tsx` |
| **Output** | Backdrop hero, metadata, star rating (0–5, 0.5 steps), watchlist toggle, review list; Server Component with client islands |
| **Verify** | Real TMDB data; rating action persists to DB; auth gate on interactive elements |
| **Status** | pending |
| **Blockers** | S3-03 (Server Actions), S4 (auth) |

| Field | Value |
|---|---|
| **ID** | S5-04 |
| **Title** | Collections page (/collections) + detail (/collections/[id]) |
| **Owner** | frontend |
| **Deps** | S3-02, S4-04 |
| **Files** | `app/collections/page.tsx`, `app/collections/[id]/page.tsx`, `components/collections/collection-card.tsx`, `components/collections/collection-detail.tsx` |
| **Output** | Browse public collections; view a collection's films; create/edit own collection (authenticated) |
| **Verify** | Public view works unauthenticated; edit controls hidden for non-owners |
| **Status** | pending |
| **Blockers** | S3-03, S4 |

| Field | Value |
|---|---|
| **ID** | S5-05 |
| **Title** | Profile page (/profile/[username] + /profile/me) |
| **Owner** | frontend |
| **Deps** | S3-02, S4-04 |
| **Files** | `app/profile/[username]/page.tsx`, `app/profile/me/page.tsx`, `components/profile/profile-header.tsx`, `components/profile/tier-list-tab.tsx`, `components/profile/reviews-tab.tsx`, `components/profile/watchlist-tab.tsx`, `components/profile/collections-tab.tsx` |
| **Output** | Profile tabs: Tier List / Reviews / Watchlist / Collections; public view vs. own view |
| **Verify** | `/profile/me` redirects unauthenticated; tabs render correct data |
| **Status** | pending |
| **Blockers** | S3-02, S4 |

---

## S6 — Pick Your Fear Quiz

| Field | Value |
|---|---|
| **ID** | S6-01 |
| **Title** | PYF quiz flow UI |
| **Owner** | frontend |
| **Deps** | S2-01 |
| **Files** | `app/pick-your-fear/page.tsx`, `components/pyf/quiz-step.tsx`, `components/pyf/answer-card.tsx`, `components/pyf/result-screen.tsx` |
| **Output** | 8-question multi-step quiz matching `PYF.jsx` layout; pill/card answer selection; progress indicator |
| **Verify** | All 8 steps render; no hardcoded hex; accessible focus management between steps |
| **Status** | pending |
| **Blockers** | S6-02 (scoring logic) must be complete before result screen |

| Field | Value |
|---|---|
| **ID** | S6-02 |
| **Title** | PYF scoring algorithm + film recommendation logic |
| **Owner** | prompt-engineer |
| **Deps** | S3-01 (TMDB utilities), S3-02 (film queries) |
| **Files** | `lib/pyf/scoring.ts`, `lib/pyf/questions.ts`, `lib/pyf/recommend.ts` |
| **Output** | 8 questions with weighted answer options; scoring maps answers → genre/mood/era weights; recommend top 5 films from `films` table matching weights |
| **Verify** | Unit tested; every answer path produces ≥1 recommendation; no hardcoded film IDs |
| **Status** | pending |
| **Blockers** | none |

---

## S7 — Tier List

| Field | Value |
|---|---|
| **ID** | S7-01 |
| **Title** | Tier list UI on /profile/[username] |
| **Owner** | frontend |
| **Deps** | S5-05, S3-02 |
| **Files** | `components/profile/tier-list-tab.tsx`, `components/ui/tier-row.tsx` |
| **Output** | 7-tier display (S/A/B/C/D/E/F); poster thumbnails per tier; own profile: drag-to-reorder + tier change; public profile: read-only |
| **Verify** | 7 tiers exactly; tier colors match brand tokens (`--tier-s` → `--tier-f`); tsc clean |
| **Status** | pending |
| **Blockers** | Film must be rated before appearing in tier list (gate in Server Action) |

| Field | Value |
|---|---|
| **ID** | S7-02 |
| **Title** | Tier list Server Actions — add/move/remove entry |
| **Owner** | fullstack |
| **Deps** | S3-02, S3-03, S4 |
| **Files** | `app/actions/tier-list.ts` |
| **Output** | `addToTierList`, `moveTierEntry`, `removeTierEntry`; RLS enforces ownership; rating gate: check `ratings` row exists before insert |
| **Verify** | Unrated film cannot be added (returns error); unauthenticated insert rejected by RLS |
| **Status** | pending |
| **Blockers** | none |

---

## S8 — Tests

| Field | Value |
|---|---|
| **ID** | S8-01 |
| **Title** | Vitest setup + unit tests |
| **Owner** | qa-interactions |
| **Deps** | S3 (can start alongside) |
| **Files** | `vitest.config.ts`, `tests/unit/scoring.test.ts`, `tests/unit/ratings.test.ts`, `tests/unit/watchlist.test.ts`, `tests/unit/reviews.test.ts` |
| **Output** | Vitest configured; unit tests for: PYF scoring, rating create/update, watchlist add/remove, review CRUD |
| **Verify** | `npx vitest run` passes; coverage ≥ key business logic |
| **Status** | pending |
| **Blockers** | S6-02 must exist for PYF scoring tests |

| Field | Value |
|---|---|
| **ID** | S8-02 |
| **Title** | Playwright setup + e2e suite |
| **Owner** | qa-interactions |
| **Deps** | Stop Point 3 (full stack required) |
| **Files** | `playwright.config.ts`, `tests/e2e/auth.spec.ts`, `tests/e2e/film-flow.spec.ts`, `tests/e2e/rls-security.spec.ts` |
| **Output** | E2e tests: signup→rate→watchlist→review→profile; RLS security test (unauth INSERT → error); ownership test (user A cannot update user B's rating) |
| **Verify** | All specs pass against production/staging; Lighthouse mobile > 85 |
| **Status** | pending |
| **Blockers** | Must not start until Stop Point 3 checklist passes |

---

## QA Tasks

| ID | Title | Owner | Deps | Status |
|---|---|---|---|---|
| QA-F-01 | Validate layout shell, tokens, routing | qa-foundation | S2 complete | pending |
| QA-F-02 | Home + Explore + Film Detail pages | qa-features | S5-01, S5-02, S5-03 | pending |
| QA-F-03 | Collections + Profile pages | qa-features | S5-04, S5-05 | pending |
| QA-I-01 | PYF quiz + scoring | qa-interactions | S6 complete | pending |
| QA-I-02 | Tier list interactions | qa-interactions | S7 complete | pending |
| QA-I-03 | Dual Explore filters (genre collapse, mood dim) | qa-interactions | S5-02 | pending |
| QA-D-01 | tsc + lint + build + Lighthouse ≥ 85 mobile | qa-deploy | Stop Point 3 | pending |

---

## Stop Point Summary

| Gate | Triggers | Unlocks |
|---|---|---|
| **Stop Point 2** | S4 auth flow verified end-to-end | S5–S8 |
| **Stop Point 3** | Full e2e: signup → rate → watchlist → review → profile visible | S8-02 Playwright |
