'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { removeTierEntry, moveTierEntry, reorderTierEntry } from '@/app/actions/tier-list'

const TIERS = ['S', 'A', 'B', 'C', 'D', 'E', 'F'] as const
type Tier = (typeof TIERS)[number]

type TierEntry = {
  id: number
  tier: Tier
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
  tier: Tier
  entries: TierEntry[]
  isOwner: boolean
}

const TIER_COLORS: Record<Tier, string> = {
  S: 'var(--tier-s)',
  A: 'var(--tier-a)',
  B: 'var(--tier-b)',
  C: 'var(--tier-c)',
  D: 'var(--tier-d)',
  E: 'var(--tier-e)',
  F: 'var(--tier-f)',
}

const BTN = [
  'w-9 h-9 rounded text-[11px] font-bold leading-none',
  'bg-bg-elevated text-text-secondary',
  'hover:text-text-primary transition-colors duration-100',
  'disabled:opacity-30 disabled:cursor-not-allowed',
  'focus-visible:outline-none',
].join(' ')

export function TierRow({ tier, entries: initialEntries, isOwner }: Props) {
  const router = useRouter()
  const [entries, setEntries] = useState<TierEntry[]>(initialEntries)
  const [isPending, startTransition] = useTransition()
  const [pendingId, setPendingId] = useState<number | null>(null)

  // Sync local state when server re-renders after router.refresh() so that
  // cross-tier moves appear in the destination row without an extra navigation.
  useEffect(() => {
    setEntries(initialEntries)
  }, [initialEntries])

  const tierIdx = TIERS.indexOf(tier)
  const prevTier = tierIdx > 0 ? TIERS[tierIdx - 1] : null
  const nextTier = tierIdx < TIERS.length - 1 ? TIERS[tierIdx + 1] : null

  function handleRemove(filmId: number) {
    setPendingId(filmId)
    startTransition(async () => {
      const result = await removeTierEntry(filmId)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        setEntries((prev) => prev.filter((e) => e.film_id !== filmId))
      }
      setPendingId(null)
    })
  }

  function handleTierMove(filmId: number, newTier: Tier) {
    setPendingId(filmId)
    startTransition(async () => {
      const result = await moveTierEntry(filmId, newTier)
      if ('error' in result) {
        toast.error(result.error)
        setPendingId(null)
      } else {
        setEntries((prev) => prev.filter((e) => e.film_id !== filmId))
        setPendingId(null)
        router.refresh()
      }
    })
  }

  function handleReorder(filmId: number, direction: 'left' | 'right') {
    setPendingId(filmId)
    startTransition(async () => {
      const result = await reorderTierEntry(filmId, tier, direction)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        setEntries((prev) => {
          const arr = [...prev]
          const idx = arr.findIndex((e) => e.film_id === filmId)
          const swapIdx = direction === 'left' ? idx - 1 : idx + 1
          if (idx !== -1 && swapIdx >= 0 && swapIdx < arr.length) {
            ;[arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]]
          }
          return arr
        })
      }
      setPendingId(null)
    })
  }

  return (
    <div className="flex border-b border-border-subtle last:border-b-0">
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
      <div className="flex-1 flex items-start gap-2 px-3 py-2 overflow-x-auto bg-bg-surface">
        {entries.length === 0 ? (
          <span className="text-text-muted text-xs italic self-center">Empty</span>
        ) : (
          entries.map((entry, entryIdx) => {
            const isBusy = pendingId === entry.film_id && isPending
            const isFirst = entryIdx === 0
            const isLast = entryIdx === entries.length - 1

            return (
              <div
                key={entry.id}
                className="flex-shrink-0 flex flex-col items-center gap-1 group"
                style={{ opacity: isBusy ? 0.4 : 1, transition: 'opacity 150ms ease' }}
              >
                {/* Poster with title tooltip */}
                <Link
                  href={`/film/${entry.film.tmdb_id}`}
                  className="relative block"
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
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 rounded text-[10px] text-text-primary bg-bg-elevated whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10 max-w-[120px] truncate">
                    {entry.film.title}
                  </span>
                </Link>

                {/* Movement controls (owner only): always visible on mobile, hover-reveal on desktop */}
                {isOwner && (
                  <div className="flex gap-1 transition-opacity duration-150 sm:opacity-0 sm:group-hover:opacity-100">
                    <button
                      type="button"
                      aria-label={prevTier ? `Move ${entry.film.title} to tier ${prevTier}` : `${entry.film.title} is already in the top tier`}
                      disabled={!prevTier || isPending}
                      onClick={() => prevTier && handleTierMove(entry.film_id, prevTier)}
                      className={BTN}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${entry.film.title} left`}
                      disabled={isFirst || isPending}
                      onClick={() => handleReorder(entry.film_id, 'left')}
                      className={BTN}
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${entry.film.title} from tier list`}
                      disabled={isPending}
                      onClick={() => handleRemove(entry.film_id)}
                      className={BTN}
                    >
                      ×
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${entry.film.title} right`}
                      disabled={isLast || isPending}
                      onClick={() => handleReorder(entry.film_id, 'right')}
                      className={BTN}
                    >
                      →
                    </button>
                    <button
                      type="button"
                      aria-label={nextTier ? `Move ${entry.film.title} to tier ${nextTier}` : `${entry.film.title} is already in the bottom tier`}
                      disabled={!nextTier || isPending}
                      onClick={() => nextTier && handleTierMove(entry.film_id, nextTier)}
                      className={BTN}
                    >
                      ↓
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
