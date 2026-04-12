"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[protected error]", error)
  }, [error])

  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
        <span className="text-xl">⚠️</span>
      </div>
      <h2 className="text-base font-semibold text-notion-text mb-2">Something broke on this page</h2>
      <p className="text-sm text-notion-muted max-w-xs mb-6">
        A client-side error occurred. Try reloading the page.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="text-sm font-medium bg-notion-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
        <button
          onClick={() => router.push("/")}
          className="text-sm text-notion-muted hover:text-notion-text transition-colors"
        >
          Go home
        </button>
      </div>
      {process.env.NODE_ENV === "development" && error.message && (
        <pre className="mt-6 text-xs text-red-400/70 bg-red-500/5 rounded-lg p-4 text-left max-w-lg overflow-auto">
          {error.message}
        </pre>
      )}
    </div>
  )
}
