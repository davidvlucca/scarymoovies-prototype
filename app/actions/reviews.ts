'use server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { reviews } from '@/db/schema'

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
  const parsed = ReviewSchema.safeParse({ filmId, body })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // reviews has no unique(user_id, film_id) — check first, then insert or update
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('user_id', user.id)
    .eq('film_id', filmId)
    .maybeSingle()

  if (existing) {
    const { data, error } = await supabase
      .from('reviews')
      .update({ body, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) return { error: error.message }
    return { data: data as Review }
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({ user_id: user.id, film_id: filmId, body })
    .select()
    .single()

  if (error) return { error: error.message }
  return { data: data as Review }
}

export async function getFilmReviews(
  filmId: number,
): Promise<{ data: Review[] } | { error: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reviews')
    .select()
    .eq('film_id', filmId)
    .order('helpful_count', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) return { error: error.message }
  return { data: (data ?? []) as Review[] }
}

export async function getCurrentUserReview(
  filmId: number,
): Promise<{ data: Review | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null }

  const { data } = await supabase
    .from('reviews')
    .select()
    .eq('user_id', user.id)
    .eq('film_id', filmId)
    .maybeSingle()

  return { data: (data as Review | null) ?? null }
}

export async function deleteReview(
  filmId: number,
): Promise<{ data: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('user_id', user.id)
    .eq('film_id', filmId)

  if (error) return { error: error.message }
  return { data: true as const }
}
