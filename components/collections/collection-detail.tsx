import Image from 'next/image'
import Link from 'next/link'
import type { collections, collectionFilms, films } from '@/db/schema'
import { RemoveFilmButton } from './remove-film-button'

type Collection = typeof collections.$inferSelect
type CollectionFilm = typeof collectionFilms.$inferSelect & { film: typeof films.$inferSelect }

type Props = {
  collection: Collection & { films: CollectionFilm[] }
  isOwner: boolean
}

export function CollectionDetail({ collection, isOwner }: Props) {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-text-muted">Collection</p>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">
          {collection.title}
        </h1>
        {collection.blurb && (
          <p className="text-text-secondary text-base leading-relaxed max-w-xl">
            {collection.blurb}
          </p>
        )}
        <p className="text-text-muted text-xs uppercase tracking-widest">
          {collection.films.length === 1
            ? '1 film'
            : `${collection.films.length} films`}
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-border-subtle" />

      {/* Film list */}
      {collection.films.length === 0 ? (
        <p className="text-text-muted text-sm">No films in this collection yet.</p>
      ) : (
        <ul className="space-y-3">
          {collection.films.map((entry) => (
            <li
              key={entry.id}
              className="flex items-start gap-4 p-4 rounded-lg bg-bg-surface border border-border-subtle"
            >
              {/* Poster thumbnail */}
              <Link
                href={`/film/${entry.film.tmdb_id}`}
                className="shrink-0"
                tabIndex={-1}
                aria-hidden="true"
              >
                <div className="relative w-[50px] h-[75px] rounded overflow-hidden bg-bg-elevated">
                  {entry.film.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w154${entry.film.poster_path}`}
                      alt={entry.film.title}
                      fill
                      sizes="50px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-text-muted text-[9px] uppercase tracking-widest text-center px-1">
                        No Image
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Film info */}
              <div className="flex-1 min-w-0 space-y-1 pt-0.5">
                <Link
                  href={`/film/${entry.film.tmdb_id}`}
                  className="text-text-primary font-bold text-sm leading-snug hover:text-accent transition-colors duration-150 line-clamp-2"
                >
                  {entry.film.title}
                </Link>
                {entry.film.year && (
                  <p className="text-text-muted text-xs">{entry.film.year}</p>
                )}
                {entry.editor_note && (
                  <p className="text-text-secondary text-xs italic leading-relaxed mt-1">
                    &ldquo;{entry.editor_note}&rdquo;
                  </p>
                )}
              </div>

              {/* Remove button (owner only) */}
              {isOwner && (
                <div className="shrink-0 pt-0.5">
                  <RemoveFilmButton
                    collectionId={collection.id}
                    filmId={entry.film_id}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
