'use client'

import { useState } from 'react'
import type { films } from '@/db/schema'
import { GenreFilter } from './genre-filter'
import { MoodFilter, getMoodGenres } from './mood-filter'
import { FilmGrid } from './film-grid'

type Film = typeof films.$inferSelect

interface Props {
  films: Film[]
  genres: string[]
}

export function ExploreClient({ films, genres }: Props) {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)

  const moodGenres = getMoodGenres(selectedMood)

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col gap-10">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-widest text-text-muted">Browse</p>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-text-primary">
          Explore
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-6 border-t border-border-subtle pt-6">
        <GenreFilter
          genres={genres}
          selected={selectedGenre}
          onChange={setSelectedGenre}
        />
        <MoodFilter
          selected={selectedMood}
          onChange={setSelectedMood}
        />
      </div>

      {/* Film grid */}
      <FilmGrid
        films={films}
        selectedGenre={selectedGenre}
        selectedMood={selectedMood}
        moodGenres={moodGenres}
      />
    </div>
  )
}
