'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { MobileMenu } from './mobile-menu'
import { UserMenu } from '@/components/auth/user-menu'

const navLinks: { label: string; href: string }[] = [
  { label: 'Home', href: '/' },
  { label: 'Explore', href: '/explore' },
  { label: 'Pick Your Fear', href: '/pick-your-fear' },
  { label: 'Collections', href: '/collections' },
]

export function Navbar({ user }: { user: User | null }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 h-14 px-4 md:px-8 flex items-center justify-between bg-bg-surface border-b border-border-subtle">
        {/* Wordmark */}
        <Link
          href="/"
          className="text-text-primary font-black uppercase tracking-wider text-sm select-none"
        >
          SCARY MOOVIES
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm uppercase tracking-wide text-text-secondary hover:text-text-primary transition-colors duration-150"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side: auth controls (desktop) + hamburger (mobile) */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center">
            {user ? (
              <UserMenu user={user} />
            ) : (
              <Link
                href="/auth/sign-in"
                className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-150 uppercase tracking-wide"
              >
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden flex items-center justify-center w-8 h-8 text-text-secondary hover:text-text-primary transition-colors duration-150"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} user={user} />
    </>
  )
}
