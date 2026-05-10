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
    <div className="flex flex-col">
      {/* Page header */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-12 pb-8 w-full">
        <p className="text-xs uppercase tracking-widest text-text-muted mb-2">Discover</p>
        <h1 className="text-4xl md:text-6xl font-black uppercase text-text-primary">All Horror</h1>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full mb-10">
        <div className="bg-bg-surface rounded-lg p-4 flex flex-col gap-6">
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
      </div>

      {/* Film grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-24 w-full">
        <FilmGrid
          films={films}
          selectedGenre={selectedGenre}
          selectedMood={selectedMood}
          moodGenres={moodGenres}
        />
      </div>
    </div>
  )
}
