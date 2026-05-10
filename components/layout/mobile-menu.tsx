'use client'

import Link from 'next/link'
import { Sheet, SheetContent } from '@/components/ui/sheet'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
}

const navLinks: { label: string; href: string }[] = [
  { label: 'Home', href: '/' },
  { label: 'Explore', href: '/explore' },
  { label: 'Pick Your Fear', href: '/pick-your-fear' },
  { label: 'Collections', href: '/collections' },
]

export function MobileMenu({ open, onClose }: MobileMenuProps) {
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
        </nav>
      </SheetContent>
    </Sheet>
  )
}
