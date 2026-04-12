/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Include the build-time generated search index in the Vercel serverless bundle.
    // The file lives in site/data/ (not public/) so it's only accessible via /api/search (auth-protected).
    outputFileTracingIncludes: {
      "/api/search": ["./data/search-index.json"],
    },
  },
  async redirects() {
    return [
      {
        source: "/tags/:tagId",
        destination: "/labels/:tagId",
        permanent: true,
      },
      {
        source: "/personal/goals",
        destination: "/goals",
        permanent: true,
      },
      {
        source: "/personal/career",
        destination: "/career-external",
        permanent: true,
      },
      {
        source: "/personal/learning",
        destination: "/learning",
        permanent: true,
      },
      {
        source: "/personal/astrology",
        destination: "/personal/growth/spirituality/astrology",
        permanent: true,
      },
      {
        source: "/work/notes",
        destination: "/notes",
        permanent: true,
      },
      {
        source: "/work/meetings",
        destination: "/notes",
        permanent: true,
      },
      {
        source: "/health",
        destination: "/self/health",
        permanent: true,
      },
      {
        source: "/self/costa-rica",
        destination: "/external/costa-rica",
        permanent: false,
      },
      {
        source: "/self/costa-rica/:path*",
        destination: "/external/costa-rica",
        permanent: false,
      },
    ]
  },
}
module.exports = nextConfig
