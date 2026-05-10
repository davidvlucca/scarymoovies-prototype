import { notFound } from 'next/navigation'
import { db } from '@/db/index'
import { users, reviews, films, tierLists, tierListEntries } from '@/db/schema'
import { eq, desc, asc } from 'drizzle-orm'
import { getTableColumns } from 'drizzle-orm'
import { listCollections } from '@/lib/queries/collections'
import { ProfileHeader } from '@/components/profile/profile-header'
import { ProfileTabs } from '@/components/profile/profile-tabs'

type Props = {
  params: Promise<{ username: string }>
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params

  // Look up user by username
  const profileRows = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1)
  const profile = profileRows[0]

  if (!profile) {
    notFound()
  }

  // Load public data in parallel (watchlist is private — not shown)
  const [userReviews, userCollections] = await Promise.all([
    db
      .select()
      .from(reviews)
      .where(eq(reviews.user_id, profile.id))
      .orderBy(desc(reviews.created_at))
      .limit(20),
    listCollections({ userId: profile.id }),
  ])

  // Load tier list entries for the public profile user
  const tierListRows = await db
    .select()
    .from(tierLists)
    .where(eq(tierLists.user_id, profile.id))
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
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-10 flex flex-col gap-8">
      <ProfileHeader profile={profile} isOwnProfile={false} />
      <ProfileTabs
        isOwnProfile={false}
        reviews={userReviews}
        collections={userCollections}
        tierEntries={tierEntries}
      />
    </div>
  )
}
