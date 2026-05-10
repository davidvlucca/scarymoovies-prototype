import { requireAuth } from '@/lib/auth-guard'

export default async function ProfileMePage() {
  const user = await requireAuth()

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-16">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-text-muted">Your profile</p>
        <h1 className="text-2xl font-bold text-text-primary">
          {(user.user_metadata?.full_name as string | undefined) ?? user.email}
        </h1>
        <p className="text-text-secondary text-sm">{user.email}</p>
      </div>

      <div className="mt-12 border-t border-border-subtle pt-8">
        <p className="text-text-muted text-sm">
          Full profile — tier list, reviews, watchlist, collections — arrives in Phase C.
        </p>
      </div>
    </div>
  )
}
