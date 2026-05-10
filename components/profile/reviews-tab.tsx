import type { reviews } from '@/db/schema'

type Review = typeof reviews.$inferSelect

type Props = {
  reviews: Review[]
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function ReviewsTab({ reviews }: Props) {
  if (reviews.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-text-muted text-sm">No reviews yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {reviews.map((review, index) => (
        <div key={review.id}>
          <div className="py-4">
            <p className="text-text-secondary text-sm leading-relaxed">{review.body}</p>
            <p className="text-text-muted text-xs mt-2">{formatDate(review.created_at)}</p>
          </div>
          {index < reviews.length - 1 && (
            <div className="h-px w-full bg-border-subtle" />
          )}
        </div>
      ))}
    </div>
  )
}
