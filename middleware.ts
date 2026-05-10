import { NextResponse, type NextRequest } from 'next/server'

// Extract project ref from the Supabase URL so cookie names stay in sync
// with whatever the client sets — no hardcoded strings.
const PROJECT_REF = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
  .replace('https://', '')
  .replace('.supabase.co', '')
const BASE_COOKIE = `sb-${PROJECT_REF}-auth-token`
const CHUNK_SIZE = 3600 // match @supabase/ssr default

function readChunkedCookie(request: NextRequest): string | null {
  const plain = request.cookies.get(BASE_COOKIE)?.value
  if (plain) return plain
  // chunked format: sb-{ref}-auth-token.0, .1, .2, …
  const chunks: string[] = []
  for (let i = 0; ; i++) {
    const chunk = request.cookies.get(`${BASE_COOKIE}.${i}`)?.value
    if (!chunk) break
    chunks.push(chunk)
  }
  return chunks.length ? chunks.join('') : null
}

const COOKIE_OPTS = {
  path: '/',
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 365,
}

function writeChunkedCookie(response: NextResponse, value: string) {
  if (value.length <= CHUNK_SIZE) {
    response.cookies.set(BASE_COOKIE, value, COOKIE_OPTS)
    return
  }
  const total = Math.ceil(value.length / CHUNK_SIZE)
  for (let i = 0; i < total; i++) {
    response.cookies.set(
      `${BASE_COOKIE}.${i}`,
      value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
      COOKIE_OPTS,
    )
  }
}

// Refresh the Supabase session when the access token is about to expire.
// Uses only fetch + next/server — no @supabase/* imports — so it is safe
// to run in the Vercel Edge runtime.
export async function middleware(request: NextRequest) {
  // Defensive: Supabase occasionally delivers auth codes to the Site URL root
  // instead of /auth/callback when the allowlist is misconfigured. Catch it here
  // so the code exchange happens regardless of where Supabase sends the link.
  if (
    request.nextUrl.searchParams.has('code') &&
    request.nextUrl.pathname !== '/auth/callback'
  ) {
    const dest = request.nextUrl.clone()
    const code = dest.searchParams.get('code')!
    const next = request.nextUrl.pathname !== '/'
      ? `&next=${encodeURIComponent(request.nextUrl.pathname)}`
      : ''
    dest.pathname = '/auth/callback'
    dest.search = `?code=${encodeURIComponent(code)}${next}`
    return NextResponse.redirect(dest)
  }

  const response = NextResponse.next({ request })

  try {
    const raw = readChunkedCookie(request)
    if (!raw) return response

    const session = JSON.parse(raw) as {
      access_token?: string
      refresh_token?: string
      expires_at?: number
    }
    if (!session.refresh_token) return response

    // Only call refresh when token is within 60 s of expiry
    const now = Math.floor(Date.now() / 1000)
    if ((session.expires_at ?? 0) - now > 60) return response

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
        },
        body: JSON.stringify({ refresh_token: session.refresh_token }),
      },
    )

    if (!res.ok) return response

    const newSession = await res.json()
    writeChunkedCookie(response, JSON.stringify(newSession))
  } catch {
    // never crash middleware — pass through silently
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
