'use client'

import { useState } from 'react'
import { RatingPanel } from './rating-panel'
import { WatchlistButton } from './watchlist-button'
import { TierPicker } from './tier-picker'

type Tier = 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

type Props = {
  filmId: number
  initialRating: { score: string; tier: string | null } | null
  initialInWatchlist: boolean
  initialTier: Tier | null
}

export function FilmSidePanel({ filmId, initialRating, initialInWatchlist, initialTier }: Props) {
  const [hasRating, setHasRating] = useState(initialRating !== null)

  return (
    <>
      <RatingPanel
        filmId={filmId}
        initialRating={initialRating}
        onRated={() => setHasRating(true)}
      />
      <WatchlistButton filmId={filmId} initialInWatchlist={initialInWatchlist} />
      <TierPicker filmId={filmId} initialTier={initialTier} hasRating={hasRating} />
    </>
  )
}
