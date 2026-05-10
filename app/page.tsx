import { redirect } from 'next/navigation'
import Link from 'next/link'
import { listFilms } from '@/lib/queries/films'
import { FeaturedSection } from '@/components/home/featured-section'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; next?: string }>
}) {
  const params = await searchParams
  if (params.code) {
    const next = params.next ?? '/profile/me'
    redirect(
      `/auth/callback?code=${encodeURIComponent(params.code)}&next=${encodeURIComponent(next)}`,
    )
  }

  const [featured, newArrivals, scaryPicks] = await Promise.all([
    listFilms({ limit: 10, offset: 0 }),
    listFilms({ limit: 10, offset: 10 }),
    listFilms({ limit: 10, offset: 20 }),
  ])

  return (
    <>
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-4 overflow-hidden">
        {/* Atmospheric radial gradient behind text */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 40%, color-mix(in srgb, var(--accent-primary) 18%, transparent) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-8">
          <p className="text-xs uppercase tracking-widest text-text-muted">
            Horror · Rated by Real Fans
          </p>
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tight text-text-primary leading-none">
            What Are You Afraid Of?
          </h1>
          <p className="text-text-muted uppercase tracking-widest text-sm">
            Rate it. Fear it. Own it.
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link
              href="/explore"
              className="inline-flex items-center px-8 py-3 rounded-md bg-accent text-text-primary font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity"
            >
              Explore
            </Link>
            <Link
              href="/pick-your-fear"
              className="inline-flex items-center px-8 py-3 rounded-md border border-border-subtle text-text-secondary font-bold uppercase tracking-widest text-sm hover:text-text-primary hover:border-accent transition-colors duration-150"
            >
              Pick Your Fear
            </Link>
          </div>
        </div>
      </section>

      {/* Film sections */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-32 flex flex-col gap-20">
        <FeaturedSection
          label="Featured"
          title="Featured Horror"
          films={featured}
        />
        <FeaturedSection
          label="Coming Soon"
          title="New Arrivals"
          films={newArrivals}
        />
        <FeaturedSection
          label="Scary Picks"
          title="Scary Picks"
          films={scaryPicks}
        />
      </div>
    </>
  )
}
