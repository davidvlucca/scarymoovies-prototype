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
        <h2 className="text-2xl font-bold text-text-primary mb-6">{title}</h2>
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
