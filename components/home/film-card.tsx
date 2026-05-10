import Image from 'next/image'
import Link from 'next/link'
import type { films } from '@/db/schema'

type Film = typeof films.$inferSelect

export function FilmCard({ film }: { film: Film }) {
  return (
    <Link
      href={`/film/${film.tmdb_id}`}
      className="group flex-shrink-0 w-36 flex flex-col gap-2 transition-transform duration-200 ease-out hover:scale-[1.03]"
    >
      <div className="relative w-36 h-52 rounded-md overflow-hidden bg-bg-surface">
        {film.poster_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/w500${film.poster_path}`}
            alt={film.title}
            fill
            sizes="144px"
            className="object-cover transition-opacity duration-200 group-hover:opacity-90"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-text-muted text-xs uppercase tracking-widest">No Image</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-text-primary text-sm font-medium truncate leading-snug">
          {film.title}
        </p>
        <p className="text-text-muted text-xs">
          {[film.year, film.genre].filter(Boolean).join(' · ')}
        </p>
      </div>
    </Link>
  )
}
