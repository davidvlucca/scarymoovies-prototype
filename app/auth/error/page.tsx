import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface p-8 text-center space-y-4">
      <p className="text-xl font-bold text-text-primary">Authentication failed</p>
      <p className="text-sm text-text-secondary">
        The link may have expired or already been used. Please try again.
      </p>
      <div className="flex flex-col items-center gap-2 pt-2">
        <Link
          href="/auth/sign-in"
          className="text-sm text-accent hover:underline"
        >
          Back to sign in
        </Link>
        <Link
          href="/auth/forgot-password"
          className="text-sm text-text-muted hover:text-text-secondary transition-colors duration-150"
        >
          Request a new link
        </Link>
      </div>
    </div>
  )
}
