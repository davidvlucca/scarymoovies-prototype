'use server'
import { db } from '@/db/index'
import { films } from '@/db/schema'
import type { ScoreMap } from './scoring'
import { getTopGenres } from './scoring'

type Film = typeof films.$inferSelect

export async function getRecommendations(scores: ScoreMap): Promise<Film[]> {
  const topGenres = getTopGenres(scores, 3)

  // Fetch all films from DB (capped at 50)
  const allFilms = await db.select().from(films).limit(50)

  if (topGenres.length === 0) {
    return allFilms.slice(0, 5)
  }

  // Score each film by how many top genres appear in film.genre
  type ScoredFilm = { film: Film; score: number }

  const scored: ScoredFilm[] = allFilms.map((film) => {
    const filmGenre = film.genre ?? ''
    let matchScore = 0
    for (const genre of topGenres) {
      if (filmGenre.toLowerCase().includes(genre.toLowerCase())) {
        matchScore += 1
      }
    }
    return { film, score: matchScore }
  })

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score)

  // Take top 5 matching films (score > 0), then fill with remaining if needed
  const matching = scored.filter((s) => s.score > 0).slice(0, 5)
  const result = matching.map((s) => s.film)

  if (result.length < 5) {
    const matchingIds = new Set(result.map((f) => f.id))
    const fillers = allFilms
      .filter((f) => !matchingIds.has(f.id))
      .slice(0, 5 - result.length)
    result.push(...fillers)
  }

  return result
}
