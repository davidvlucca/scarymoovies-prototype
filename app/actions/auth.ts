'use server'
import { z } from 'zod'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

async function getOrigin(): Promise<string> {
  const h = await headers()
  const forwardedProto = h.get('x-forwarded-proto') ?? 'http'
  const forwardedHost = h.get('x-forwarded-host')
  const host = h.get('host') ?? 'localhost:3000'
  return forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : `${forwardedProto}://${host}`
}

// ─── Sign Up ───────────────────────────────────────────

const SignUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function signUp(
  email: string,
  password: string,
): Promise<{ data: { message: string } } | { error: string }> {
  const parsed = SignUpSchema.safeParse({ email, password })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const origin = await getOrigin()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback?next=/profile/me` },
  })

  if (error) return { error: error.message }
  return { data: { message: 'Check your email to confirm your account.' } }
}

// ─── Sign In ───────────────────────────────────────────

const SignInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function signIn(
  email: string,
  password: string,
): Promise<{ redirectTo: string } | { error: string }> {
  const parsed = SignInSchema.safeParse({ email, password })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: error.message }
  return { redirectTo: '/' }
}

// ─── Sign Out ──────────────────────────────────────────

export async function signOut(): Promise<{ redirectTo: string }> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return { redirectTo: '/' }
}

// ─── Magic Link ────────────────────────────────────────

const MagicLinkSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function sendMagicLink(
  email: string,
): Promise<{ data: { message: string } } | { error: string }> {
  const parsed = MagicLinkSchema.safeParse({ email })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const origin = await getOrigin()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  })

  if (error) return { error: error.message }
  return { data: { message: 'Magic link sent — check your email.' } }
}

// ─── Password Reset ────────────────────────────────────

const EmailSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function sendPasswordReset(
  email: string,
): Promise<{ data: { message: string } } | { error: string }> {
  const parsed = EmailSchema.safeParse({ email })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const origin = await getOrigin()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
  })

  if (error) return { error: error.message }
  return { data: { message: 'Password reset email sent — check your inbox.' } }
}

// ─── Update Password (after reset link) ───────────────

const UpdatePasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function updatePassword(
  password: string,
): Promise<{ redirectTo: string } | { error: string }> {
  const parsed = UpdatePasswordSchema.safeParse({ password })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { error: error.message }
  return { redirectTo: '/auth/sign-in?message=password-updated' }
}

// ─── Google OAuth (S4-03) ─────────────────────────────
// NOTE: Requires Google OAuth credentials in Supabase Auth → Providers → Google.
// Full test blocked until operator completes that manual step.

export async function signInWithGoogle(): Promise<
  { redirectTo: string } | { error: string }
> {
  const supabase = await createClient()
  const origin = await getOrigin()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  })

  if (error) return { error: error.message }
  if (!data.url) return { error: 'OAuth provider did not return a redirect URL.' }
  return { redirectTo: data.url }
}
