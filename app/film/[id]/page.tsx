import { notFound } from 'next/navigation'
import { getFilmByTmdbId } from '@/lib/queries/films'
import { getOptionalUser } from '@/lib/auth-guard'
import { getCurrentUserRating } from '@/app/actions/ratings'
import { getCurrentUserReview, getFilmReviews } from '@/app/actions/reviews'
import { getWatchlistStatus } from '@/app/actions/watchlist'
import { getCurrentTierEntry } from '@/app/actions/tier-list'
import { FilmHero } from '@/components/film/film-hero'
import { FilmSidePanel } from '@/components/film/film-side-panel'
import { ReviewForm } from '@/components/film/review-form'
import { ReviewList } from '@/components/film/review-list'
import Link from 'next/link'

type Props = { params: Promise<{ id: string }> }

export default async function FilmDetailPage({ params }: Props) {
  const { id } = await params

  const film = await getFilmByTmdbId(Number(id))
  if (!film) notFound()

  const user = await getOptionalUser()

  // Fetch user-specific data and reviews in parallel
  const [ratingResult, reviewResult, watchlistResult, reviewsResult, tierResult] = user
    ? await Promise.all([
        getCurrentUserRating(film.id),
        getCurrentUserReview(film.id),
        getWatchlistStatus(film.id),
        getFilmReviews(film.id),
        getCurrentTierEntry(film.id),
      ])
    : [
        { data: null } as { data: null },
        { data: null } as { data: null },
        { data: { inWatchlist: false } },
        await getFilmReviews(film.id),
        { data: null } as { data: null },
      ]

  const currentRating =
    'data' in ratingResult && ratingResult.data
      ? { score: ratingResult.data.score, tier: ratingResult.data.tier ?? null }
      : null

  const currentReviewBody =
    'data' in reviewResult && reviewResult.data ? reviewResult.data.body : null

  const inWatchlist =
    'data' in watchlistResult ? watchlistResult.data.inWatchlist : false

  const allReviews =
    'data' in reviewsResult ? reviewsResult.data : []

  const currentTier =
    tierResult && 'data' in tierResult && tierResult.data
      ? (tierResult.data.tier as 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F')
      : null

  return (
    <div className="min-h-screen bg-bg-primary">
      <FilmHero film={film} />

      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-10 pb-20">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Left column — reviews */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Review form (logged-in only) */}
            {user ? (
              <ReviewForm filmId={film.id} initialReview={currentReviewBody} />
            ) : (
              <div className="rounded-lg border border-border-subtle px-4 py-5 text-sm bg-bg-surface text-text-secondary">
                <Link
                  href="/auth/sign-in"
                  className="font-semibold underline underline-offset-2 transition-colors text-accent"
                >
                  Sign in
                </Link>{' '}
                to leave a review.
              </div>
            )}

            {/* All reviews */}
            <ReviewList reviews={allReviews} />
          </div>

          {/* Right column — rating + watchlist */}
          <aside className="w-full md:w-64 shrink-0 space-y-4">
            {user ? (
              <FilmSidePanel
                filmId={film.id}
                initialRating={currentRating}
                initialInWatchlist={inWatchlist}
                initialTier={currentTier}
              />
            ) : (
              <div className="rounded-lg border border-border-subtle px-4 py-5 text-sm space-y-2 bg-bg-surface">
                <p className="text-xs uppercase tracking-widest text-text-muted">
                  Rate &amp; Track
                </p>
                <p className="text-text-secondary">
                  <Link
                    href="/auth/sign-in"
                    className="font-semibold underline underline-offset-2 text-accent"
                  >
                    Sign in
                  </Link>{' '}
                  to rate this film and add it to your watchlist.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
