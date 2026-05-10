import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { films } from '../db/schema'
import { sql } from 'drizzle-orm'

const TMDB_BASE = 'https://api.themoviedb.org/3'
const HORROR_GENRE_ID = 27
const TARGET_COUNT = 50
const DELAY_MS = 100

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function tmdbFetch(path: string) {
  const res = await fetch(`${TMDB_BASE}${path}`, {
    headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
  })
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${path}`)
  return res.json()
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set')
  if (!process.env.TMDB_API_KEY) throw new Error('TMDB_API_KEY not set')

  const db = drizzle(process.env.DATABASE_URL)
  const collected: typeof films.$inferInsert[] = []

  // Fetch across multiple pages and decades to get variety
  const decades = [
    { gte: '2010-01-01', lte: '2024-12-31' },
    { gte: '1990-01-01', lte: '2009-12-31' },
    { gte: '1970-01-01', lte: '1989-12-31' },
  ]

  for (const decade of decades) {
    if (collected.length >= TARGET_COUNT) break
    for (let page = 1; page <= 3; page++) {
      if (collected.length >= TARGET_COUNT) break
      const data = await tmdbFetch(
        `/discover/movie?with_genres=${HORROR_GENRE_ID}&sort_by=vote_count.desc&vote_count.gte=100` +
        `&primary_release_date.gte=${decade.gte}&primary_release_date.lte=${decade.lte}&page=${page}`
      )
      for (const m of data.results ?? []) {
        if (collected.length >= TARGET_COUNT) break
        collected.push({
          tmdb_id:      m.id,
          title:        m.title,
          year:         m.release_date ? parseInt(m.release_date.slice(0, 4)) : null,
          genre:        'Horror',
          poster_path:  m.poster_path ?? null,
          backdrop_path: m.backdrop_path ?? null,
          overview:     m.overview ?? null,
        })
      }
      await sleep(DELAY_MS)
    }
  }

  // Upsert: skip duplicates on tmdb_id
  let inserted = 0
  for (const film of collected) {
    await db.insert(films).values(film).onConflictDoNothing({ target: films.tmdb_id })
    inserted++
    await sleep(DELAY_MS)
  }

  // Count actual rows
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(films)
  console.log(`Done. Attempted ${inserted} upserts. Films table now has ${count} rows.`)
}

main().catch(err => { console.error(err); process.exit(1) })
