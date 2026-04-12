"use client"

export default function ExternalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-10 h-10 rounded-xl bg-notion-accent/10 flex items-center justify-center mb-4">
        <span className="text-xl">🧠</span>
      </div>
      <h2 className="text-base font-semibold text-notion-text mb-2">This page couldn&apos;t load</h2>
      <p className="text-sm text-notion-muted max-w-xs mb-6">
        Something went wrong rendering this page. Try refreshing.
      </p>
      <button
        onClick={reset}
        className="text-sm font-medium bg-notion-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
      >
        Refresh
      </button>
    </div>
  )
}
