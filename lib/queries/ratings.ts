import 'server-only'
import { db } from '@/db/index'
import { ratings } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

type Rating = typeof ratings.$inferSelect

export async function getUserRating(userId: string, filmId: number): Promise<Rating | undefined> {
  const rows = await db
    .select()
    .from(ratings)
    .where(and(eq(ratings.user_id, userId), eq(ratings.film_id, filmId)))
    .limit(1)
  return rows[0]
}

export async function getUserRatings(userId: string): Promise<Rating[]> {
  return db.select().from(ratings).where(eq(ratings.user_id, userId))
}

export async function upsertRating(
  userId: string,
  filmId: number,
  score: number,
  tier?: 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F',
): Promise<Rating> {
  const rows = await db
    .insert(ratings)
    .values({
      user_id: userId,
      film_id: filmId,
      score: String(score),
      tier: tier ?? null,
    })
    .onConflictDoUpdate({
      target: [ratings.user_id, ratings.film_id],
      set: {
        score: String(score),
        tier: tier ?? null,
      },
    })
    .returning()

  return rows[0]!
}
