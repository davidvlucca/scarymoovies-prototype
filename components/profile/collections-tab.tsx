import Link from 'next/link'
import type { collections } from '@/db/schema'

type Collection = typeof collections.$inferSelect

type Props = {
  collections: Collection[]
}

export function CollectionsTab({ collections }: Props) {
  if (collections.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-text-muted text-sm">No collections yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 pt-2">
      {collections.map((col) => (
        <Link
          key={col.id}
          href={`/collections/${col.id}`}
          className="flex flex-col gap-1 rounded-md p-3 hover:bg-bg-elevated transition-colors duration-150 border border-border-subtle"
        >
          <p className="text-text-primary text-sm font-medium">{col.title}</p>
          {col.blurb && (
            <p className="text-text-muted text-xs leading-relaxed">{col.blurb}</p>
          )}
        </Link>
      ))}
    </div>
  )
}
