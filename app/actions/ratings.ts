'use server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getUserRating, getUserRatings, upsertRating } from '@/lib/queries/ratings'
import { db } from '@/db/index'
import { ratings } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

type Rating = typeof ratings.$inferSelect

const RateSchema = z.object({
  filmId: z.number().int().positive(),
  score: z.number().min(0).max(5).refine((v) => v * 2 === Math.floor(v * 2), {
    message: 'Score must be in 0.5 increments',
  }),
  tier: z.enum(['S', 'A', 'B', 'C', 'D', 'E', 'F']).optional(),
})

export async function rateFilm(
  filmId: number,
  score: number,
  tier?: 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F',
): Promise<{ data: Rating } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const parsed = RateSchema.safeParse({ filmId, score, tier })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const rating = await upsertRating(user.id, filmId, score, tier)
    return { data: rating }
  } catch {
    return { error: 'Failed to save rating' }
  }
}

export async function getCurrentUserRating(
  filmId: number,
): Promise<{ data: Rating | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { data: null }

  const rating = await getUserRating(user.id, filmId)
  return { data: rating ?? null }
}

export async function getAllUserRatings(): Promise<
  { data: Rating[] } | { error: string }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const userRatings = await getUserRatings(user.id)
  return { data: userRatings }
}

export async function deleteRating(
  filmId: number,
): Promise<{ data: true } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  await db
    .delete(ratings)
    .where(and(eq(ratings.user_id, user.id), eq(ratings.film_id, filmId)))

  return { data: true as const }
}
