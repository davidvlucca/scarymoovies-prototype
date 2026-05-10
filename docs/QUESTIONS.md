# Open Questions

---

## Blocking

_None at this time. S1 is fully approved._

---

## Non-Blocking Follow-Ups

### Google OAuth credentials (S4-03)
S4-03 requires Google Cloud OAuth Client ID + Secret added to the Supabase Auth dashboard.
This is a manual step by the operator — not a code task.
S4-01 and S4-02 can proceed without it; only the Google OAuth button test in Stop Point 2 is blocked.

### Supabase SQL migrations (applied, for the record)
Both `auth-trigger.sql` and `rls.sql` were applied successfully (33 policies confirmed).
No further action needed unless schema changes require re-running.

---

## External Manual Actions Required

| Action | Required by | Done? |
|---|---|---|
| Add Google OAuth credentials to Supabase Auth → Providers → Google | S4-03 | No |
| Verify production URL returns 200 on commit `4719059` | S1 sign-off | Assumed yes (operator proceeded) |
| Monitor Vercel deploys for each Phase A/B/C push | ongoing | — |

---

## Resolved (S1)

- Production 500 `MIDDLEWARE_INVOCATION_FAILED` — fixed; see `docs/DECISIONS.md` (middleware section)
- Production 404 — fixed by `vercel.json` with explicit `framework: nextjs`
- Supabase SQL migrations applied; 33 RLS policies confirmed
- Seeder `.env.local` fix applied (`config({ path: '.env.local' })`)
- `auth-trigger.sql` made idempotent (`DROP TRIGGER IF EXISTS`)
