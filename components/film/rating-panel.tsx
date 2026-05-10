'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { rateFilm } from '@/app/actions/ratings'

type Props = {
  filmId: number
  initialRating: { score: string; tier: string | null } | null
}

const SCORES = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0]

export function RatingPanel({ filmId, initialRating }: Props) {
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
      }
    })
  }

  return (
    <div
      className="rounded-lg border p-4 md:p-5 space-y-4"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* Current rating display */}
      <div>
        <p
          className="text-xs uppercase tracking-widest mb-1"
          style={{ color: 'var(--text-muted)' }}
        >
          Your Rating
        </p>
        {currentScore !== null ? (
          <p
            className="text-2xl font-black tabular-nums"
            style={{ color: 'var(--accent-primary)' }}
          >
            {currentScore.toFixed(1)}
            <span
              className="text-sm font-normal ml-1"
              style={{ color: 'var(--text-muted)' }}
            >
              / 5
            </span>
          </p>
        ) : (
          <p
            className="text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
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
              className="h-9 rounded text-xs font-semibold tabular-nums border transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2"
              style={
                isSelected
                  ? {
                      background: 'var(--accent-primary)',
                      borderColor: 'var(--accent-primary)',
                      color: 'var(--text-primary)',
                    }
                  : {
                      background: 'var(--bg-elevated)',
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-secondary)',
                    }
              }
            >
              {score.toFixed(score % 1 === 0 ? 0 : 1)}
            </button>
          )
        })}
      </div>

      {isPending && (
        <p
          className="text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          Saving…
        </p>
      )}
    </div>
  )
}
