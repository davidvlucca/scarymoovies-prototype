import Link from 'next/link'
import type { films } from '@/db/schema'
import { FilmCard } from './film-card'

type Film = typeof films.$inferSelect

interface Props {
  label: string
  title: string
  films: Film[]
}

export function FeaturedSection({ label, title, films: filmList }: Props) {
  return (
    <section>
      <div className="border-t border-border-subtle pt-8">
        <p className="text-xs uppercase tracking-widest text-text-muted mb-2">{label}</p>
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-3xl font-black uppercase tracking-tight text-text-primary">{title}</h2>
          <Link
            href="/explore"
            className="text-xs uppercase tracking-widest text-text-muted hover:text-accent transition-colors duration-150 shrink-0 ml-4"
          >
            See all →
          </Link>
        </div>
        <div
          className="flex gap-4 overflow-x-auto pb-4"
          style={{ scrollbarWidth: 'none' }}
        >
          {filmList.map((film) => (
            <FilmCard key={film.id} film={film} />
          ))}
        </div>
      </div>
    </section>
  )
}
