# Open Questions — S1

## Resolved

### Production 500 (MIDDLEWARE_INVOCATION_FAILED) — fixed
**Root cause:** `@supabase/ssr@0.10.3` (via `@supabase/supabase-js@2.105.x`) imports a
Node.js built-in (likely `crypto`) at module load time. Vercel's Edge runtime rejects
the module on initialisation, so even a try/catch around the function call cannot help.

**Fix:** Middleware rewritten using only `fetch` + `next/server`. No `@supabase/*`
imports in `middleware.ts`. Session refresh calls the Supabase REST endpoint directly
(`/auth/v1/token?grant_type=refresh_token`). `@supabase/ssr` is retained as a
dependency for Server Components and Server Actions, which run in Node.js runtime.

### Production 404 (NOT_FOUND) — fixed
**Root cause:** Vercel project was linked before any Next.js app existed; it may have
auto-detected the wrong framework or root directory.

**Fix:** Added `vercel.json` with `"framework": "nextjs"` to force correct detection.

### Supabase SQL migrations (manual) — pending your action
Apply via the Supabase SQL editor (not Drizzle) in this order:
1. `supabase/migrations/auth-trigger.sql` — user creation trigger (idempotent: DROP IF EXISTS added)
2. `supabase/migrations/rls.sql` — RLS enable + all per-operation policies

After applying, run the RLS verification query:
```sql
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```
Expected: 10 tables, all with explicit per-operation policies. No catch-all writes.

## Notes

- `shadcn form` not available as a standalone add in shadcn@4 — built manually using
  react-hook-form + zod (both installed) in S2.
- `toast` deprecated in shadcn@4 — replaced with `sonner` (installed).
- Apple OAuth deferred to v0.2 (documented in PLAN.md).
