import type { Answer } from './questions'

// Maps tags to genre strings in the films DB
const TAG_TO_GENRES: Record<string, string[]> = {
  supernatural: ['Horror', 'Supernatural Horror'],
  slasher: ['Slasher', 'Horror'],
  psychological: ['Psychological Horror', 'Thriller'],
  atmospheric: ['Horror', 'Mystery'],
  gore: ['Horror', 'Body Horror'],
  cosmic: ['Horror', 'Sci-Fi Horror'],
  thriller: ['Thriller', 'Mystery'],
}

export type ScoreMap = Record<string, number> // tag -> count

export function scoreAnswers(selectedAnswers: Answer[]): ScoreMap {
  const scores: ScoreMap = {}

  for (const answer of selectedAnswers) {
    for (const tag of answer.tags) {
      scores[tag] = (scores[tag] ?? 0) + 1
    }
  }

  return scores
}

export function getTopGenres(scores: ScoreMap, topN = 3): string[] {
  // Sort tags by score descending
  const sortedTags = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([tag]) => tag)

  // Map to genres and deduplicate
  const seen = new Set<string>()
  const genres: string[] = []

  for (const tag of sortedTags) {
    const tagGenres = TAG_TO_GENRES[tag] ?? []
    for (const genre of tagGenres) {
      if (!seen.has(genre)) {
        seen.add(genre)
        genres.push(genre)
      }
    }
    if (genres.length >= topN) break
  }

  return genres.slice(0, topN)
}
