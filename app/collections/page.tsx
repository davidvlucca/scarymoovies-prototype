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
    <div className="max-w-7xl mx-auto px-4 md:px-8">
      {/* Page header */}
      <div className="pt-12 pb-8">
        <p className="text-xs uppercase tracking-widest text-text-muted mb-2">Community</p>
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-4xl md:text-6xl font-black uppercase text-text-primary">Collections</h1>
          {user && (
            <Link
              href="/collections/new"
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-text-primary text-sm font-bold uppercase tracking-widest transition-opacity duration-150 hover:opacity-90"
            >
              + New List
            </Link>
          )}
        </div>
      </div>

      {/* Grid */}
      {cols.length === 0 ? (
        <p className="text-text-muted text-sm pb-24">No collections yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
          {cols.map((col) => (
            <CollectionCard key={col.id} collection={col} />
          ))}
        </div>
      )}
    </div>
  )
}
