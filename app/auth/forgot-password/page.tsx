'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { sendPasswordReset } from '@/app/actions/auth'

const schema = z.object({
  email: z.string().email('Invalid email address'),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    const result = await sendPasswordReset(data.email)
    setIsLoading(false)

    if ('error' in result) {
      toast.error(result.error)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-border-subtle bg-bg-surface p-8 text-center space-y-4">
        <p className="text-text-primary font-semibold">Check your email</p>
        <p className="text-text-secondary text-sm">
          If an account exists for that address, a password reset link is on its way.
        </p>
        <Link
          href="/auth/sign-in"
          className="inline-block text-sm text-accent hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface p-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-text-primary">Reset password</h1>
        <p className="text-sm text-text-secondary">
          Enter your email and we&apos;ll send a reset link.
        </p>
      </div>

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
          />
          {errors.email && (
            <p className="text-xs text-danger">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>

      <p className="text-center text-sm text-text-muted">
        <Link href="/auth/sign-in" className="text-text-secondary hover:text-text-primary transition-colors duration-150">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
