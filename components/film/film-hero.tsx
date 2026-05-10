import Image from 'next/image'
import type { films } from '@/db/schema'

type Film = typeof films.$inferSelect

type Props = {
  film: Film
}

export function FilmHero({ film }: Props) {
  const backdropUrl = film.backdrop_path
    ? `https://image.tmdb.org/t/p/original${film.backdrop_path}`
    : null

  const posterUrl = film.poster_path
    ? `https://image.tmdb.org/t/p/w500${film.poster_path}`
    : null

  const meta = [
    film.genre,
    film.year?.toString(),
    film.runtime ? `${film.runtime} min` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <section aria-label="Film hero">
      {/* Backdrop */}
      <div className="relative w-full h-64 md:h-96 overflow-hidden bg-bg-surface">
        {backdropUrl ? (
          <Image
            src={backdropUrl}
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)' }}
          />
        )}
        {/* Gradient fade to page background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, transparent 0%, transparent 40%, var(--bg-primary) 100%)',
          }}
        />
        {/* Left/right vignette for depth */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, var(--bg-primary) 0%, transparent 20%, transparent 80%, var(--bg-primary) 100%)',
          }}
        />
      </div>

      {/* Content row — pulled up over the backdrop fade */}
      <div className="relative -mt-24 md:-mt-32 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="flex gap-5 md:gap-8 items-end">
          {/* Poster */}
          <div className="shrink-0 w-28 md:w-40 aspect-[2/3] rounded-md overflow-hidden bg-bg-elevated shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-border-subtle relative">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={`${film.title} poster`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 112px, 160px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-bg-elevated">
                <span className="text-xs uppercase tracking-widest text-text-muted">
                  No Image
                </span>
              </div>
            )}
          </div>

          {/* Title + meta */}
          <div className="flex-1 min-w-0 pb-1">
            <h1 className="text-3xl md:text-5xl font-black uppercase leading-none tracking-tight break-words text-text-primary">
              {film.title}
            </h1>
            {meta && (
              <p className="mt-2 text-sm uppercase tracking-widest text-text-muted">
                {meta}
              </p>
            )}
          </div>
        </div>

        {/* Overview */}
        {film.overview && (
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-text-secondary">
            {film.overview}
          </p>
        )}
      </div>
    </section>
  )
}
