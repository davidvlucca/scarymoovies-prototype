import 'server-only'
import { db } from '@/db/index'
import { reviews } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'

type Review = typeof reviews.$inferSelect

export async function getReviews(filmId: number): Promise<Review[]> {
  return db
    .select()
    .from(reviews)
    .where(eq(reviews.film_id, filmId))
    .orderBy(desc(reviews.helpful_count), desc(reviews.created_at))
}

export async function getUserReview(userId: string, filmId: number): Promise<Review | undefined> {
  const rows = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.user_id, userId), eq(reviews.film_id, filmId)))
    .limit(1)
  return rows[0]
}

export async function upsertReview(
  userId: string,
  filmId: number,
  body: string,
): Promise<Review> {
  const existing = await getUserReview(userId, filmId)

  if (existing !== undefined) {
    const rows = await db
      .update(reviews)
      .set({ body, updated_at: new Date() })
      .where(eq(reviews.id, existing.id))
      .returning()
    return rows[0]!
  }

  const rows = await db
    .insert(reviews)
    .values({ user_id: userId, film_id: filmId, body })
    .returning()
  return rows[0]!
}
