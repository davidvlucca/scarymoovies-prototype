'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { upsertUserReview } from '@/app/actions/reviews'

type Props = {
  filmId: number
  initialReview: string | null
}

export function ReviewForm({ filmId, initialReview }: Props) {
  const [body, setBody] = useState(initialReview ?? '')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!body.trim()) return

    startTransition(async () => {
      const result = await upsertUserReview(filmId, body.trim())
      if ('error' in result) {
        toast.error(result.error)
      } else {
        setBody(result.data.body)
        toast.success('Review saved.')
      }
    })
  }

  return (
    <div
      className="rounded-lg border p-4 md:p-5 space-y-3"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <label
        htmlFor="review-body"
        className="block text-xs uppercase tracking-widest"
        style={{ color: 'var(--text-muted)' }}
      >
        Your Review
      </label>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          id="review-body"
          rows={4}
          disabled={isPending}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your review…"
          className="w-full rounded px-3 py-2 text-sm resize-none border outline-none transition-colors duration-150 disabled:opacity-50 placeholder:text-text-muted"
          style={{
            background: 'var(--bg-elevated)',
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-focus)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)'
          }}
        />

        <button
          type="submit"
          disabled={isPending || !body.trim()}
          className="h-9 px-5 rounded text-xs font-bold uppercase tracking-widest border-0 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2"
          style={{
            background: 'var(--accent-primary)',
            color: 'var(--text-primary)',
          }}
        >
          {isPending ? 'Saving…' : initialReview ? 'Update Review' : 'Submit Review'}
        </button>
      </form>
    </div>
  )
}
