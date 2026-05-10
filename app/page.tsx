import Link from 'next/link'
import { listFilms } from '@/lib/queries/films'
import { FeaturedSection } from '@/components/home/featured-section'

export default async function HomePage() {
  const [featured, newArrivals, scaryPicks] = await Promise.all([
    listFilms({ limit: 10, offset: 0 }),
    listFilms({ limit: 10, offset: 10 }),
    listFilms({ limit: 10, offset: 20 }),
  ])

  return (
    <>
      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col items-center gap-6">
          <p className="text-xs uppercase tracking-widest text-text-muted">
            Horror · Rated by Real Fans
          </p>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-text-primary">
            What Are You Afraid Of?
          </h1>
          <p className="text-text-secondary text-lg max-w-xl">
            The horror movie platform for people who take fear seriously.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center px-6 py-3 rounded-md bg-accent text-text-primary font-semibold uppercase tracking-wide hover:opacity-90 transition-opacity"
          >
            Explore Now
          </Link>
        </div>
      </section>

      {/* Film sections */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-24 flex flex-col gap-16">
        <FeaturedSection
          label="Featured"
          title="Featured Horror"
          films={featured}
        />
        <FeaturedSection
          label="New Arrivals"
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
