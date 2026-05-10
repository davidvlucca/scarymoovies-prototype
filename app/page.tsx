import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col items-center gap-6">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-text-primary">
            What Are You Afraid Of?
          </h1>
          <p className="text-text-secondary text-lg max-w-xl">
            The horror movie platform for real fans.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center px-6 py-3 rounded-md bg-accent text-text-primary font-semibold uppercase tracking-wide hover:opacity-90 transition-opacity"
          >
            Explore Now
          </Link>
        </div>
      </section>

      {/* Placeholder sections */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-24 flex flex-col gap-16">
        {/* Featured */}
        <section>
          <div className="border-t border-border-subtle pt-8">
            <p className="text-xs uppercase tracking-widest text-text-muted mb-2">Featured</p>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Featured Horror</h2>
            <p className="text-text-secondary text-sm">Coming soon — real data in S5.</p>
          </div>
        </section>

        {/* New Arrivals */}
        <section>
          <div className="border-t border-border-subtle pt-8">
            <p className="text-xs uppercase tracking-widest text-text-muted mb-2">New Arrivals</p>
            <h2 className="text-2xl font-bold text-text-primary mb-3">New Arrivals</h2>
            <p className="text-text-secondary text-sm">Coming soon — real data in S5.</p>
          </div>
        </section>

        {/* Scary Picks */}
        <section>
          <div className="border-t border-border-subtle pt-8">
            <p className="text-xs uppercase tracking-widest text-text-muted mb-2">Scary Picks</p>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Scary Picks</h2>
            <p className="text-text-secondary text-sm">Coming soon — real data in S5.</p>
          </div>
        </section>
      </div>
    </>
  )
}
