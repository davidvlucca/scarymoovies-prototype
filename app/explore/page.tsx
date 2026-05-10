import { listFilms } from '@/lib/queries/films'
import { ExploreClient } from '@/components/explore/explore-client'

export default async function ExplorePage() {
  const films = await listFilms({ limit: 100 })
  const genres = Array.from(
    new Set(films.map((f) => f.genre).filter((g): g is string => g !== null && g !== undefined))
  )

  return <ExploreClient films={films} genres={genres} />
}
