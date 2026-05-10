import 'server-only'
import { db } from '@/db/index'
import { collections, collectionFilms, films } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getTableColumns } from 'drizzle-orm'

type Collection = typeof collections.$inferSelect
type CollectionFilm = typeof collectionFilms.$inferSelect & { film: typeof films.$inferSelect }

export async function listCollections(opts?: {
  userId?: string
  limit?: number
}): Promise<Collection[]> {
  let query = db.select().from(collections).orderBy(desc(collections.created_at)).$dynamic()

  if (opts?.userId !== undefined) {
    query = query.where(eq(collections.user_id, opts.userId))
  }

  return query.limit(opts?.limit ?? 20)
}

export async function getCollection(
  id: number,
): Promise<(Collection & { films: CollectionFilm[] }) | undefined> {
  const colRows = await db.select().from(collections).where(eq(collections.id, id)).limit(1)
  if (colRows.length === 0) return undefined

  const col = colRows[0]!

  const colFilms = await db
    .select({ ...getTableColumns(collectionFilms), film: films })
    .from(collectionFilms)
    .innerJoin(films, eq(collectionFilms.film_id, films.id))
    .where(eq(collectionFilms.collection_id, id))
    .orderBy(collectionFilms.position)

  return { ...col, films: colFilms }
}

export async function createCollection(
  userId: string,
  title: string,
  blurb?: string,
): Promise<Collection> {
  const rows = await db
    .insert(collections)
    .values({ user_id: userId, title, blurb: blurb ?? null })
    .returning()
  return rows[0]!
}

export async function addFilmToCollection(
  collectionId: number,
  filmId: number,
  position: number,
): Promise<void> {
  await db
    .insert(collectionFilms)
    .values({ collection_id: collectionId, film_id: filmId, position })
}
