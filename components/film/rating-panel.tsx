'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { rateFilm } from '@/app/actions/ratings'

type Props = {
  filmId: number
  initialRating: { score: string; tier: string | null } | null
  onRated?: () => void
}

const SCORES = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0]

export function RatingPanel({ filmId, initialRating, onRated }: Props) {
  const [currentScore, setCurrentScore] = useState<number | null>(
    initialRating ? parseFloat(initialRating.score) : null,
  )
  const [isPending, startTransition] = useTransition()

  function handleRate(score: number) {
    startTransition(async () => {
      const result = await rateFilm(filmId, score)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        setCurrentScore(parseFloat(result.data.score))
        toast.success('Rating saved.')
        onRated?.()
      }
    })
  }

  return (
    <div className="rounded-lg border border-border-subtle p-4 md:p-5 space-y-4 bg-bg-surface">
      {/* Current rating display */}
      <div>
        <p className="text-xs uppercase tracking-widest mb-1 text-text-muted">
          Your Rating
        </p>
        {currentScore !== null ? (
          <p className="text-2xl font-black tabular-nums text-accent">
            {currentScore.toFixed(1)}
            <span className="text-sm font-normal ml-1 text-text-muted">
              / 5
            </span>
          </p>
        ) : (
          <p className="text-sm text-text-secondary">
            Rate this film
          </p>
        )}
      </div>

      {/* Score buttons */}
      <div className="grid grid-cols-6 gap-1.5">
        {SCORES.map((score) => {
          const isSelected = currentScore === score
          return (
            <button
              key={score}
              type="button"
              disabled={isPending}
              onClick={() => handleRate(score)}
              aria-label={`Rate ${score}`}
              aria-pressed={isSelected}
              className={[
                'h-9 rounded text-xs font-semibold tabular-nums border transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2',
                isSelected
                  ? 'bg-accent border-accent text-text-primary'
                  : 'bg-bg-elevated border-border-subtle text-text-secondary',
              ].join(' ')}
            >
              {score.toFixed(score % 1 === 0 ? 0 : 1)}
            </button>
          )
        })}
      </div>

      {isPending && (
        <p className="text-xs text-text-muted">
          Saving…
        </p>
      )}
    </div>
  )
}
