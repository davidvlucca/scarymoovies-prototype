'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { toggleWatchlist } from '@/app/actions/watchlist'

type Props = {
  filmId: number
  initialInWatchlist: boolean
}

export function WatchlistButton({ filmId, initialInWatchlist }: Props) {
  const [inWatchlist, setInWatchlist] = useState(initialInWatchlist)
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    // Optimistic update
    setInWatchlist((prev) => !prev)

    startTransition(async () => {
      const result = await toggleWatchlist(filmId)
      if ('error' in result) {
        // Revert on failure
        setInWatchlist((prev) => !prev)
        toast.error(result.error)
      } else {
        setInWatchlist(result.data.inWatchlist)
        toast.success(
          result.data.inWatchlist ? 'Added to watchlist.' : 'Removed from watchlist.',
        )
      }
    })
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleToggle}
      className="w-full h-10 rounded text-xs font-bold uppercase tracking-widest border transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2"
      style={
        inWatchlist
          ? {
              background: 'transparent',
              borderColor: 'var(--accent-danger)',
              color: 'var(--accent-danger)',
            }
          : {
              background: 'var(--accent-primary)',
              borderColor: 'var(--accent-primary)',
              color: 'var(--text-primary)',
            }
      }
    >
      {isPending
        ? '…'
        : inWatchlist
          ? 'Remove from Watchlist'
          : '+ Add to Watchlist'}
    </button>
  )
}
