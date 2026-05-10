'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { signOut } from '@/app/actions/auth'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  user: User | null
}

const navLinks: { label: string; href: string }[] = [
  { label: 'Home', href: '/' },
  { label: 'Explore', href: '/explore' },
  { label: 'Pick Your Fear', href: '/pick-your-fear' },
  { label: 'Collections', href: '/collections' },
]

export function MobileMenu({ open, onClose, user }: MobileMenuProps) {
  const router = useRouter()

  async function handleSignOut() {
    onClose()
    const result = await signOut()
    router.push(result.redirectTo)
    router.refresh()
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <SheetContent
        side="left"
        className="flex flex-col gap-2 bg-bg-surface border-border-subtle min-h-screen"
      >
        <nav className="flex flex-col mt-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="py-4 px-2 text-base uppercase tracking-wide border-b border-border-subtle text-text-secondary hover:text-text-primary transition-colors duration-150"
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <>
              <Link
                href="/profile/me"
                onClick={onClose}
                className="py-4 px-2 text-base uppercase tracking-wide border-b border-border-subtle text-text-secondary hover:text-text-primary transition-colors duration-150"
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="py-4 px-2 text-base uppercase tracking-wide text-left text-danger hover:opacity-80 transition-opacity duration-150"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/auth/sign-in"
              onClick={onClose}
              className="py-4 px-2 text-base uppercase tracking-wide border-b border-border-subtle text-accent hover:opacity-80 transition-opacity duration-150"
            >
              Sign in
            </Link>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
