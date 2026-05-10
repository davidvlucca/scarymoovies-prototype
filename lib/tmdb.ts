import 'server-only'

const BASE = 'https://api.themoviedb.org/3'
const KEY = process.env.TMDB_API_KEY!

function headers(): Record<string, string> {
  return { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }
}

// 100ms delay helper for batch sequential calls
async function delay(ms = 100): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Keep delay exported so batch scripts can use it
export { delay }

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TmdbFilm = {
  id: number
  title: string
  release_date: string // 'YYYY-MM-DD'
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  genre_ids: number[]
  runtime: number | null
  vote_average: number
}

export type TmdbFilmDetail = TmdbFilm & {
  genres: { id: number; name: string }[]
  runtime: number | null
  tagline: string
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[]
    crew: { id: number; name: string; job: string }[]
  }
}

export type TmdbPage<T> = {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/** GET /movie/{id}?append_to_response=credits */
export async function fetchFilm(tmdbId: number): Promise<TmdbFilmDetail> {
  const url = `${BASE}/movie/${tmdbId}?append_to_response=credits`
  const res = await fetch(url, { headers: headers() })
  if (!res.ok) {
    throw new Error(`TMDB ${res.status}: ${url}`)
  }
  return res.json() as Promise<TmdbFilmDetail>
}

/** GET /discover/movie?with_genres=27&sort_by=popularity.desc&page=N */
export async function fetchFilms(page = 1): Promise<TmdbPage<TmdbFilm>> {
  const url = `${BASE}/discover/movie?with_genres=27&sort_by=popularity.desc&page=${page}`
  const res = await fetch(url, { headers: headers() })
  if (!res.ok) {
    throw new Error(`TMDB ${res.status}: ${url}`)
  }
  return res.json() as Promise<TmdbPage<TmdbFilm>>
}

/** GET /search/movie?query=q&page=N */
export async function searchFilms(q: string, page = 1): Promise<TmdbPage<TmdbFilm>> {
  const url = `${BASE}/search/movie?query=${encodeURIComponent(q)}&page=${page}`
  const res = await fetch(url, { headers: headers() })
  if (!res.ok) {
    throw new Error(`TMDB ${res.status}: ${url}`)
  }
  return res.json() as Promise<TmdbPage<TmdbFilm>>
}

/** GET /trending/movie/week */
export async function fetchTrending(): Promise<TmdbPage<TmdbFilm>> {
  const url = `${BASE}/trending/movie/week`
  const res = await fetch(url, { headers: headers() })
  if (!res.ok) {
    throw new Error(`TMDB ${res.status}: ${url}`)
  }
  return res.json() as Promise<TmdbPage<TmdbFilm>>
}
