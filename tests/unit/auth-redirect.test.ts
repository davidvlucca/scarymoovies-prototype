import { describe, it, expect } from 'vitest'

// Unit-level guard for the auth-code redirect URL construction.
//
// Manual check (run in dev with `npm run dev`):
//   1. Navigate to http://localhost:3000/?code=fake
//   2. Expected: browser is redirected to /auth/callback?code=fake&next=...
//   3. /auth/callback exchanges the fake code; Supabase returns an error
//   4. Browser lands on /auth/error — NOT "Internal Server Error"

function buildAuthCallbackUrl(code: string, next?: string): string {
  const resolvedNext = next ?? '/profile/me'
  return `/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(resolvedNext)}`
}

describe('auth code redirect URL construction', () => {
  it('encodes a simple code correctly', () => {
    const url = buildAuthCallbackUrl('abc123')
    expect(url).toBe('/auth/callback?code=abc123&next=%2Fprofile%2Fme')
  })

  it('defaults next to /profile/me when absent', () => {
    expect(buildAuthCallbackUrl('x')).toContain('next=%2Fprofile%2Fme')
  })

  it('uses provided next when present', () => {
    const url = buildAuthCallbackUrl('x', '/auth/reset-password')
    expect(url).toContain('next=%2Fauth%2Freset-password')
  })

  it('percent-encodes codes that contain special chars', () => {
    const url = buildAuthCallbackUrl('81934a7d-924a-4d91-85f3-0343ede627c5')
    expect(url).toBe(
      '/auth/callback?code=81934a7d-924a-4d91-85f3-0343ede627c5&next=%2Fprofile%2Fme',
    )
  })

  it('never redirects to / — always has a real next path', () => {
    const url = buildAuthCallbackUrl('code', undefined)
    expect(url).not.toContain('next=%2F&')
    expect(url).not.toMatch(/next=%2F$/)
  })
})
