'use server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ratings } from '@/db/schema'

type Rating = typeof ratings.$inferSelect

const RateSchema = z.object({
  filmId: z.number().int().positive(),
  score: z.number().min(0).max(5).refine(
    (v) => v * 2 === Math.floor(v * 2),
    { message: 'Score must be in 0.5 increments' },
  ),
  tier: z.enum(['S', 'A', 'B', 'C', 'D', 'E', 'F']).optional(),
})

export async function rateFilm(
  filmId: number,
  score: number,
  tier?: 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F',
): Promise<{ data: Rating } | { error: string }> {
  const parsed = RateSchema.safeParse({ filmId, score, tier })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('ratings')
    .upsert(
      { user_id: user.id, film_id: filmId, score: String(score), tier: tier ?? null },
      { onConflict: 'user_id,film_id' },
    )
    .select()
    .single()

  if (error) return { error: error.message }
  return { data: data as Rating }
}

export async function getCurrentUserRating(
  filmId: number,
): Promise<{ data: Rating | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null }

  const { data } = await supabase
    .from('ratings')
    .select()
    .eq('user_id', user.id)
    .eq('film_id', filmId)
    .maybeSingle()

  return { data: (data as Rating | null) ?? null }
}

export async function getAllUserRatings(): Promise<
  { data: Rating[] } | { error: string }
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('ratings')
    .select()
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return { error: error.message }
  return { data: (data ?? []) as Rating[] }
}

export async function deleteRating(
  filmId: number,
): Promise<{ data: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('ratings')
    .delete()
    .eq('user_id', user.id)
    .eq('film_id', filmId)

  if (error) return { error: error.message }
  return { data: true as const }
}
