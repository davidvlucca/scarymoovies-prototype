'use server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import {
  isInWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
} from '@/lib/queries/watchlist'
import { watchlistItems } from '@/db/schema'

type WatchlistItem = typeof watchlistItems.$inferSelect

const FilmIdSchema = z.object({
  filmId: z.number().int().positive(),
})

export async function toggleWatchlist(
  filmId: number,
): Promise<{ data: { inWatchlist: boolean } } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const parsed = FilmIdSchema.safeParse({ filmId })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const inList = await isInWatchlist(user.id, filmId)
  if (inList) {
    await removeFromWatchlist(user.id, filmId)
    return { data: { inWatchlist: false } }
  } else {
    await addToWatchlist(user.id, filmId)
    return { data: { inWatchlist: true } }
  }
}

export async function getWatchlistStatus(
  filmId: number,
): Promise<{ data: { inWatchlist: boolean } }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { data: { inWatchlist: false } }

  const inList = await isInWatchlist(user.id, filmId)
  return { data: { inWatchlist: inList } }
}

export async function getUserWatchlist(): Promise<
  { data: WatchlistItem[] } | { error: string }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const items = await getWatchlist(user.id)
  return { data: items }
}
