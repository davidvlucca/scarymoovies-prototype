import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Link
            href="/"
            className="text-sm font-black uppercase tracking-widest text-text-primary hover:text-accent transition-colors duration-150"
          >
            SCARY MOOVIES
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}
