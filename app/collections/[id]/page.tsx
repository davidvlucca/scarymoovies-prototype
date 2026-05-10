import { notFound } from 'next/navigation'
import { getCollection } from '@/lib/queries/collections'
import { getOptionalUser } from '@/lib/auth-guard'
import { CollectionDetail } from '@/components/collections/collection-detail'

type Props = { params: Promise<{ id: string }> }

export default async function CollectionPage({ params }: Props) {
  const { id } = await params
  const numId = Number(id)

  if (!Number.isInteger(numId) || numId <= 0) notFound()

  const [collection, user] = await Promise.all([
    getCollection(numId),
    getOptionalUser(),
  ])

  if (!collection) notFound()

  const isOwner = user?.id === collection.user_id

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-16">
      <CollectionDetail collection={collection} isOwner={isOwner} />
    </div>
  )
}
