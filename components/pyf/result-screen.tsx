'use client'
import Image from 'next/image'
import Link from 'next/link'
import type { films } from '@/db/schema'

type Film = typeof films.$inferSelect

type Props = {
  films: Film[]
  onRetake: () => void
}

export function ResultScreen({ films, onRetake }: Props) {
  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col gap-2 text-center">
        <p className="text-xs uppercase tracking-widest text-text-muted">
          Your fear has been assessed
        </p>
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-text-primary">
          Your Horror Awaits
        </h2>
        <p className="text-text-secondary text-sm max-w-sm mx-auto">
          Based on what terrifies you most, the darkness has chosen these for you.
        </p>
      </div>

      {/* Film grid */}
      {films.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-5">
          {films.map((film) => (
            <Link
              key={film.id}
              href={`/film/${film.tmdb_id}`}
              className="group flex flex-col gap-2 w-32 md:w-36 transition-transform duration-200 ease-out hover:scale-[1.03]"
            >
              <div className="relative w-32 md:w-36 h-48 md:h-52 rounded-md overflow-hidden bg-bg-surface border border-border-subtle">
                {film.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${film.poster_path}`}
                    alt={film.title}
                    fill
                    sizes="(min-width: 768px) 144px, 128px"
                    className="object-cover transition-opacity duration-200 group-hover:opacity-80"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-text-muted text-xs uppercase tracking-widest text-center px-2">
                      No Image
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-text-primary text-sm font-semibold truncate leading-snug">
                  {film.title}
                </p>
                <p className="text-text-muted text-xs truncate">
                  {[film.year, film.genre].filter(Boolean).join(' · ')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-12">
          <p className="text-text-muted text-sm uppercase tracking-widest">
            The void is empty.
          </p>
          <p className="text-text-muted text-xs">No films found in the abyss.</p>
        </div>
      )}

      {/* Retake */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onRetake}
          className="px-6 py-3 rounded-md border border-border-subtle text-text-secondary text-sm uppercase tracking-widest font-semibold hover:bg-bg-surface hover:text-text-primary transition-colors duration-150 cursor-pointer"
        >
          Take Again
        </button>
      </div>
    </div>
  )
}
