import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/navbar'
import { Providers } from './providers'
import { Toaster } from 'sonner'
import { createClient } from '@/lib/supabase/server'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ScaryMoovies',
  description: 'The horror movie platform for real fans.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-bg-primary text-text-primary antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded focus:bg-bg-elevated focus:text-text-primary"
        >
          Skip to content
        </a>
        <Navbar user={user} />
        <Providers>
          <main id="main-content" className="min-h-screen">
            {children}
          </main>
          <Toaster richColors position="bottom-right" />
        </Providers>
      </body>
    </html>
  )
}
