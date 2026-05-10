import Link from 'next/link'
import { listCollections } from '@/lib/queries/collections'
import { getOptionalUser } from '@/lib/auth-guard'
import { CollectionCard } from '@/components/collections/collection-card'

export const metadata = { title: 'Collections — ScaryMoovies' }

export default async function CollectionsPage() {
  const [cols, user] = await Promise.all([
    listCollections({ limit: 50 }),
    getOptionalUser(),
  ])

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-16">
      {/* Page header */}
      <div className="flex items-end justify-between gap-4 mb-10">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-text-muted">Browse</p>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Horror Lists</h1>
          <p className="text-sm text-text-secondary">
            Curated collections from the community.
          </p>
        </div>

        {user && (
          <Link
            href="/collections/new"
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-text-primary text-sm font-medium uppercase tracking-wide transition-colors duration-150 hover:bg-accent-hover"
          >
            + New List
          </Link>
        )}
      </div>

      {/* Grid */}
      {cols.length === 0 ? (
        <p className="text-text-muted text-sm">No collections yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cols.map((col) => (
            <CollectionCard key={col.id} collection={col} />
          ))}
        </div>
      )}
    </div>
  )
}
