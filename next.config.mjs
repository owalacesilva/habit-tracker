/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emits a self-contained server bundle so the runtime image stays small.
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        // The service worker must never be served from a stale cache,
        // otherwise clients can get stuck on an old app shell forever.
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/manifest.webmanifest',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=3600' }],
      },
    ]
  },
}

export default nextConfig
