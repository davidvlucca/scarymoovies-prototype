import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/navbar'
import { Providers } from './providers'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ScaryMoovies',
  description: 'The horror movie platform for real fans.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-bg-primary text-text-primary antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded focus:bg-bg-elevated focus:text-text-primary"
        >
          Skip to content
        </a>
        <Navbar />
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
