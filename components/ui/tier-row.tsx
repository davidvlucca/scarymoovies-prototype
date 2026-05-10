'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { removeTierEntry } from '@/app/actions/tier-list'

type TierEntry = {
  id: number
  tier: 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  position: number
  film_id: number
  film: {
    id: number
    tmdb_id: number
    title: string
    poster_path: string | null
    year: number | null
    genre: string | null
  }
}

type Props = {
  tier: 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  entries: TierEntry[]
  isOwner: boolean
}

const TIER_COLORS: Record<string, string> = {
  S: 'var(--tier-s)',
  A: 'var(--tier-a)',
  B: 'var(--tier-b)',
  C: 'var(--tier-c)',
  D: 'var(--tier-d)',
  E: 'var(--tier-e)',
  F: 'var(--tier-f)',
}

export function TierRow({ tier, entries: initialEntries, isOwner }: Props) {
  const [entries, setEntries] = useState<TierEntry[]>(initialEntries)
  const [isPending, startTransition] = useTransition()
  const [removingId, setRemovingId] = useState<number | null>(null)

  function handleRemove(filmId: number) {
    setRemovingId(filmId)
    startTransition(async () => {
      const result = await removeTierEntry(filmId)
      if ('error' in result) {
        toast.error(result.error)
        setRemovingId(null)
      } else {
        setEntries((prev) => prev.filter((e) => e.film_id !== filmId))
        setRemovingId(null)
      }
    })
  }

  return (
    <div className="flex min-h-[64px] border-b border-border-subtle last:border-b-0">
      {/* Tier label cell */}
      <div
        className="flex-shrink-0 w-14 flex items-center justify-center"
        style={{ backgroundColor: TIER_COLORS[tier] }}
      >
        <span className="text-2xl font-bold text-white leading-none select-none">
          {tier}
        </span>
      </div>

      {/* Film area */}
      <div className="flex-1 flex items-center gap-2 px-3 py-2 overflow-x-auto bg-bg-surface">
        {entries.length === 0 ? (
          <span className="text-text-muted text-xs italic">Empty</span>
        ) : (
          entries.map((entry) => {
            const isRemoving = removingId === entry.film_id && isPending
            return (
              <div
                key={entry.id}
                className="relative flex-shrink-0 group"
                style={{ opacity: isRemoving ? 0.4 : 1, transition: 'opacity 150ms ease' }}
              >
                <Link
                  href={`/film/${entry.film.tmdb_id}`}
                  className="block"
                  title={entry.film.title}
                >
                  <div className="relative w-10 h-14 rounded overflow-hidden bg-bg-elevated">
                    {entry.film.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w92${entry.film.poster_path}`}
                        alt={entry.film.title}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-text-muted text-xs">?</span>
                      </div>
                    )}
                  </div>
                  {/* Title tooltip on hover */}
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 rounded text-[10px] text-text-primary bg-bg-elevated whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10 max-w-[120px] truncate">
                    {entry.film.title}
                  </span>
                </Link>

                {/* Remove button (owner only) */}
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => handleRemove(entry.film_id)}
                    disabled={isPending}
                    aria-label={`Remove ${entry.film.title} from tier list`}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-bg-elevated text-text-secondary flex items-center justify-center text-[10px] leading-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:text-text-primary focus:opacity-100 z-20"
                  >
                    ×
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
