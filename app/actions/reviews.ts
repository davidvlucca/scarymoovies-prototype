'use server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getReviews, getUserReview, upsertReview } from '@/lib/queries/reviews'
import { db } from '@/db/index'
import { reviews } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

type Review = typeof reviews.$inferSelect

const ReviewSchema = z.object({
  filmId: z.number().int().positive(),
  body: z
    .string()
    .min(1, 'Review cannot be empty')
    .max(5000, 'Review is too long'),
})

export async function upsertUserReview(
  filmId: number,
  body: string,
): Promise<{ data: Review } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const parsed = ReviewSchema.safeParse({ filmId, body })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const review = await upsertReview(user.id, filmId, body)
    return { data: review }
  } catch {
    return { error: 'Failed to save review' }
  }
}

export async function getFilmReviews(
  filmId: number,
): Promise<{ data: Review[] }> {
  // Public — no auth required
  const filmReviews = await getReviews(filmId)
  return { data: filmReviews }
}

export async function getCurrentUserReview(
  filmId: number,
): Promise<{ data: Review | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { data: null }

  const review = await getUserReview(user.id, filmId)
  return { data: review ?? null }
}

export async function deleteReview(
  filmId: number,
): Promise<{ data: true } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  await db
    .delete(reviews)
    .where(and(eq(reviews.user_id, user.id), eq(reviews.film_id, filmId)))

  return { data: true as const }
}
