import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'image.tmdb.org', pathname: '/t/p/**' }
    ]
  }
  // output: "export" must NOT be present — this is a dynamic app
}

export default nextConfig
