'use server'
import { createClient } from '@/lib/supabase/server'
import type { watchlistItems } from '@/db/schema'
import { FilmIdSchema } from '@/lib/validation/schemas'

type WatchlistItem = typeof watchlistItems.$inferSelect

export async function toggleWatchlist(
  filmId: number,
): Promise<{ data: { inWatchlist: boolean } } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const parsed = FilmIdSchema.safeParse({ filmId })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { data: existing } = await supabase
    .from('watchlist_items')
    .select('id')
    .eq('user_id', user.id)
    .eq('film_id', filmId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('watchlist_items')
      .delete()
      .eq('user_id', user.id)
      .eq('film_id', filmId)
    if (error) return { error: error.message }
    return { data: { inWatchlist: false } }
  }

  const { error } = await supabase
    .from('watchlist_items')
    .insert({ user_id: user.id, film_id: filmId })

  if (error) return { error: error.message }
  return { data: { inWatchlist: true } }
}

export async function getWatchlistStatus(
  filmId: number,
): Promise<{ data: { inWatchlist: boolean } }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: { inWatchlist: false } }

  const { data } = await supabase
    .from('watchlist_items')
    .select('id')
    .eq('user_id', user.id)
    .eq('film_id', filmId)
    .maybeSingle()

  return { data: { inWatchlist: data !== null } }
}

export async function getUserWatchlist(): Promise<
  { data: WatchlistItem[] } | { error: string }
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('watchlist_items')
    .select()
    .eq('user_id', user.id)
    .order('added_at', { ascending: false })

  if (error) return { error: error.message }
  return { data: (data ?? []) as WatchlistItem[] }
}
