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
import { signUp } from '@/app/actions/auth'

const schema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    const result = await signUp(data.email, data.password)
    setIsLoading(false)

    if ('error' in result) {
      toast.error(result.error)
      return
    }
    setSuccessMessage(result.data.message)
  }

  if (successMessage) {
    return (
      <div className="rounded-lg border border-border-subtle bg-bg-surface p-8 text-center space-y-4">
        <p className="text-text-primary font-semibold">Email sent</p>
        <p className="text-text-secondary text-sm">{successMessage}</p>
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
        <h1 className="text-xl font-bold text-text-primary">Create account</h1>
        <p className="text-sm text-text-secondary">
          Already have one?{' '}
          <Link href="/auth/sign-in" className="text-accent hover:underline">
            Sign in
          </Link>
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

        <div className="space-y-1">
          <Label htmlFor="password" className="text-text-secondary text-xs uppercase tracking-wide">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-xs text-danger">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="confirmPassword" className="text-text-secondary text-xs uppercase tracking-wide">
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-danger">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </div>
  )
}
