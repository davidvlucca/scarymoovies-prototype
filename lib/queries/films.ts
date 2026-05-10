import 'server-only'
import { db } from '@/db/index'
import { films } from '@/db/schema'
import { eq } from 'drizzle-orm'

type Film = typeof films.$inferSelect

export async function getFilm(id: number): Promise<Film | undefined> {
  const rows = await db.select().from(films).where(eq(films.id, id)).limit(1)
  return rows[0]
}

export async function getFilmByTmdbId(tmdbId: number): Promise<Film | undefined> {
  const rows = await db.select().from(films).where(eq(films.tmdb_id, tmdbId)).limit(1)
  return rows[0]
}

export async function listFilms(opts?: {
  genre?: string
  limit?: number
  offset?: number
}): Promise<Film[]> {
  let query = db.select().from(films).$dynamic()

  if (opts?.genre !== undefined) {
    query = query.where(eq(films.genre, opts.genre))
  }
  if (opts?.limit !== undefined) {
    query = query.limit(opts.limit)
  }
  if (opts?.offset !== undefined) {
    query = query.offset(opts.offset)
  }

  return query
}
