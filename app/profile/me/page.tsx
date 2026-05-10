import { requireAuth } from '@/lib/auth-guard'
import { db } from '@/db/index'
import { users, reviews, watchlistItems, films, tierLists, tierListEntries } from '@/db/schema'
import { eq, desc, asc } from 'drizzle-orm'
import { getTableColumns } from 'drizzle-orm'
import { listCollections } from '@/lib/queries/collections'
import { ProfileHeader } from '@/components/profile/profile-header'
import { ProfileTabs } from '@/components/profile/profile-tabs'

export default async function ProfileMePage() {
  const authUser = await requireAuth()

  // Look up public profile row
  const profileRows = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1)
  const profile = profileRows[0]

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16">
        <p className="text-text-secondary text-sm">
          Your profile is being set up. Try again in a moment.
        </p>
      </div>
    )
  }

  // Load all tab data in parallel
  const [userReviews, watchlistWithFilms, userCollections] = await Promise.all([
    db
      .select()
      .from(reviews)
      .where(eq(reviews.user_id, authUser.id))
      .orderBy(desc(reviews.created_at))
      .limit(20),
    db
      .select({ ...getTableColumns(watchlistItems), film: films })
      .from(watchlistItems)
      .innerJoin(films, eq(watchlistItems.film_id, films.id))
      .where(eq(watchlistItems.user_id, authUser.id))
      .orderBy(desc(watchlistItems.added_at))
      .limit(50),
    listCollections({ userId: authUser.id }),
  ])

  // Load tier list entries for this user
  const tierListRows = await db
    .select()
    .from(tierLists)
    .where(eq(tierLists.user_id, authUser.id))
    .limit(1)

  let tierEntries: (typeof tierListEntries.$inferSelect & { film: typeof films.$inferSelect })[] = []
  if (tierListRows[0]) {
    tierEntries = await db
      .select({ ...getTableColumns(tierListEntries), film: films })
      .from(tierListEntries)
      .innerJoin(films, eq(tierListEntries.film_id, films.id))
      .where(eq(tierListEntries.tier_list_id, tierListRows[0].id))
      .orderBy(asc(tierListEntries.position))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 flex flex-col gap-8">
      <ProfileHeader profile={profile} isOwnProfile={true} />
      <ProfileTabs
        isOwnProfile={true}
        reviews={userReviews}
        watchlistWithFilms={watchlistWithFilms}
        collections={userCollections}
        tierEntries={tierEntries}
      />
    </div>
  )
}
