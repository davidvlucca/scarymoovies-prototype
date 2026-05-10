import 'server-only'
import { db } from '@/db/index'
import { watchlistItems } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

type WatchlistItem = typeof watchlistItems.$inferSelect

export async function getWatchlist(userId: string): Promise<WatchlistItem[]> {
  return db.select().from(watchlistItems).where(eq(watchlistItems.user_id, userId))
}

export async function isInWatchlist(userId: string, filmId: number): Promise<boolean> {
  const rows = await db
    .select()
    .from(watchlistItems)
    .where(and(eq(watchlistItems.user_id, userId), eq(watchlistItems.film_id, filmId)))
    .limit(1)
  return rows.length > 0
}

export async function addToWatchlist(userId: string, filmId: number): Promise<WatchlistItem> {
  const rows = await db
    .insert(watchlistItems)
    .values({ user_id: userId, film_id: filmId })
    .returning()
  return rows[0]!
}

export async function removeFromWatchlist(userId: string, filmId: number): Promise<void> {
  await db
    .delete(watchlistItems)
    .where(and(eq(watchlistItems.user_id, userId), eq(watchlistItems.film_id, filmId)))
}
