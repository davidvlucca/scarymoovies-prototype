# Open Questions — S1

## Pending manual steps (must be done before S2)

### 1. Apply Supabase SQL migrations manually
The RLS policies and auth trigger are in `supabase/migrations/` but must be applied via the Supabase SQL editor (not Drizzle).

Apply in order:
1. `supabase/migrations/auth-trigger.sql` — user creation trigger
2. `supabase/migrations/rls.sql` — RLS enable + all per-operation policies

After applying, run the verification query:
```sql
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```
Expected: 10 tables, all with explicit per-operation policies. No catch-all writes.

### 2. Confirm Vercel deploy URL
Push to `origin main` completed. Wait for Vercel auto-deploy to finish, then confirm the URL responds 200 at:
https://vercel.com/davidvluccas-projects/scarymoovies-prototype

## Resolved

- `shadcn form` component not available in shadcn@4 as a standalone add — will be built manually in S2 using react-hook-form + zod (both installed).
- `toast` deprecated in shadcn@4 — replaced with `sonner` (installed).
- Apple OAuth deferred to v0.2 (documented in PLAN.md).
