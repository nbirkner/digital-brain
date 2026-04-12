"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to console in dev; swap for Sentry/etc. in prod
    console.error("[app error]", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
        <span className="text-xl">⚠️</span>
      </div>
      <h1 className="text-lg font-semibold text-notion-text mb-2">Something went wrong</h1>
      <p className="text-sm text-notion-muted max-w-sm mb-6">
        A rendering error occurred. You can try again or go home.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="text-sm font-medium bg-notion-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
        <Link
          href="/"
          className="text-sm text-notion-muted hover:text-notion-text transition-colors"
        >
          Go home
        </Link>
      </div>
      {process.env.NODE_ENV === "development" && error.message && (
        <pre className="mt-6 text-xs text-red-400/70 bg-red-500/5 rounded-lg p-4 text-left max-w-lg overflow-auto">
          {error.message}
        </pre>
      )}
    </div>
  )
}
