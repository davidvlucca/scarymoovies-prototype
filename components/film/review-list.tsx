import type { reviews } from '@/db/schema'

type Review = typeof reviews.$inferSelect

type Props = {
  reviews: Review[]
}

export function ReviewList({ reviews }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-widest text-text-muted">
        Reviews
      </p>

      {reviews.length === 0 ? (
        <p className="text-sm text-text-secondary">
          No reviews yet. Be the first.
        </p>
      ) : (
        <ul className="space-y-0">
          {reviews.map((review, index) => (
            <li key={review.id}>
              {index > 0 && (
                <hr className="border-t border-border-subtle my-4" />
              )}
              <article className="space-y-1">
                <p className="text-sm leading-relaxed text-text-secondary">
                  {review.body}
                </p>
                <time
                  dateTime={new Date(review.created_at).toISOString()}
                  className="block text-xs tabular-nums text-text-muted"
                >
                  {new Date(review.created_at).toLocaleDateString()}
                </time>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
