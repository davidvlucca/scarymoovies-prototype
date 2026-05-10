import Link from 'next/link'
import type { collections } from '@/db/schema'

type Collection = typeof collections.$inferSelect

type Props = {
  collection: Collection & { filmCount?: number }
}

export function CollectionCard({ collection }: Props) {
  return (
    <Link
      href={`/collections/${collection.id}`}
      className="group flex flex-col gap-3 p-5 rounded-lg bg-bg-surface border border-border-subtle hover:border-border transition-colors duration-150"
    >
      {/* Title */}
      <h2 className="text-text-primary font-bold text-base leading-snug group-hover:text-accent transition-colors duration-150">
        {collection.title}
      </h2>

      {/* Blurb */}
      {collection.blurb && (
        <p className="text-text-secondary text-sm line-clamp-2 leading-relaxed">
          {collection.blurb}
        </p>
      )}

      {/* Footer meta */}
      <div className="mt-auto pt-1 flex items-center gap-2">
        <span className="text-text-muted text-xs uppercase tracking-widest">
          {collection.cover_film_ids?.length
            ? `${collection.cover_film_ids.length} films`
            : 'List'}
        </span>
      </div>
    </Link>
  )
}
