'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { signIn, signInWithGoogle, sendMagicLink } from '@/app/actions/auth'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type FormData = z.infer<typeof schema>

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [magicEmail, setMagicEmail] = useState('')
  const [magicSent, setMagicSent] = useState(false)
  const [magicLoading, setMagicLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const passwordUpdated = searchParams.get('message') === 'password-updated'

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    const result = await signIn(data.email, data.password)
    setIsLoading(false)

    if ('error' in result) {
      toast.error(result.error)
      return
    }
    router.push(result.redirectTo)
    router.refresh()
  }

  async function handleGoogleSignIn() {
    const result = await signInWithGoogle()
    if ('error' in result) {
      toast.error(result.error)
      return
    }
    window.location.href = result.redirectTo
  }

  async function handleMagicLink() {
    const email = magicEmail || getValues('email')
    if (!email) {
      toast.error('Enter your email first')
      return
    }
    setMagicLoading(true)
    const result = await sendMagicLink(email)
    setMagicLoading(false)

    if ('error' in result) {
      toast.error(result.error)
      return
    }
    setMagicSent(true)
    toast.success(result.data.message)
  }

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface p-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-text-primary">Sign in</h1>
        <p className="text-sm text-text-secondary">
          New here?{' '}
          <Link href="/auth/sign-up" className="text-accent hover:underline">
            Create an account
          </Link>
        </p>
      </div>

      {passwordUpdated && (
        <p className="text-sm text-accent">
          Password updated — please sign in with your new password.
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="email" className="text-text-secondary text-xs uppercase tracking-wide">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            onChange={(e) => setMagicEmail(e.target.value)}
          />
          {errors.email && (
            <p className="text-xs text-danger">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-text-secondary text-xs uppercase tracking-wide">
              Password
            </Label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-text-muted hover:text-text-secondary transition-colors duration-150"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-xs text-danger">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <div className="relative">
        <Separator className="bg-border-subtle" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-surface px-2 text-xs text-text-muted uppercase tracking-wide">
          or
        </span>
      </div>

      <div className="space-y-3">
        {/* Google OAuth — blocked until credentials added to Supabase dashboard */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled
          title="Google sign-in requires OAuth credentials in Supabase dashboard (pending setup)"
        >
          Continue with Google
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleMagicLink}
          disabled={magicLoading || magicSent}
        >
          {magicSent
            ? 'Magic link sent — check your email'
            : magicLoading
            ? 'Sending…'
            : 'Sign in with Magic Link'}
        </Button>
      </div>
    </div>
  )
}
