import { requireAuth } from '@/lib/auth-guard'
import { NewCollectionForm } from '@/components/collections/new-collection-form'

export const metadata = { title: 'New Collection — ScaryMoovies' }

export default async function NewCollectionPage() {
  await requireAuth()

  return (
    <div className="max-w-xl mx-auto px-4 md:px-8 py-16">
      <div className="space-y-1 mb-8">
        <p className="text-xs uppercase tracking-widest text-text-muted">Collections</p>
        <h1 className="text-2xl font-bold text-text-primary">Create a New List</h1>
        <p className="text-sm text-text-secondary">
          Name your horror list and give it a brief description.
        </p>
      </div>

      <NewCollectionForm />
    </div>
  )
}
