'use client'

import type { films } from '@/db/schema'
import { FilmCard } from '@/components/home/film-card'

type Film = typeof films.$inferSelect

interface Props {
  films: Film[]
  selectedGenre: string | null
  selectedMood: string | null
  moodGenres: string[] | null
}

export function FilmGrid({ films: allFilms, selectedGenre, moodGenres }: Props) {
  // Genre filter: reduces the rendered list (no reflow intent, just hiding unrelated genres)
  const genreFiltered = selectedGenre
    ? allFilms.filter((f) => f.genre === selectedGenre)
    : allFilms

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {genreFiltered.map((film) => {
        // Mood filter: all cards stay in position, non-matching fade to 15%
        const matchesMood =
          moodGenres === null || moodGenres.includes(film.genre ?? '')

        return (
          <div
            key={film.id}
            style={{
              opacity: matchesMood ? 1 : 0.15,
              transition: 'opacity 200ms ease',
            }}
          >
            <FilmCard film={film} />
          </div>
        )
      })}
    </div>
  )
}
