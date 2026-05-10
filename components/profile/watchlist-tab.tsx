import Image from 'next/image'
import Link from 'next/link'
import type { watchlistItems, films } from '@/db/schema'

type WatchlistItem = typeof watchlistItems.$inferSelect
type Film = typeof films.$inferSelect

type WatchlistEntry = WatchlistItem & { film: Film }

type Props = {
  watchlistWithFilms: WatchlistEntry[]
}

export function WatchlistTab({ watchlistWithFilms }: Props) {
  if (watchlistWithFilms.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-text-muted text-sm">No films in watchlist yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 pt-2">
      {watchlistWithFilms.map((entry) => (
        <Link
          key={entry.id}
          href={`/film/${entry.film.tmdb_id}`}
          className="flex items-center gap-3 rounded-md p-2 hover:bg-bg-elevated transition-colors duration-150"
        >
          <div className="relative w-10 h-14 flex-shrink-0 rounded overflow-hidden bg-bg-surface">
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
          <div className="flex flex-col gap-0.5 min-w-0">
            <p className="text-text-primary text-sm font-medium truncate">{entry.film.title}</p>
            {entry.film.year && (
              <p className="text-text-muted text-xs">{entry.film.year}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
