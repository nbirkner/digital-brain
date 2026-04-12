export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8 pb-6 border-b border-notion-border/40">
        <div className="h-10 w-10 bg-notion-surface rounded-lg mb-3" />
        <div className="h-8 w-36 bg-notion-surface rounded-lg mb-2" />
        <div className="h-4 w-56 bg-notion-surface rounded" />
      </div>

      {/* Filter tabs skeleton */}
      <div className="flex gap-2 mb-6">
        {[72, 88, 64, 80].map((w, i) => (
          <div key={i} className="h-8 bg-notion-surface rounded-lg" style={{ width: w }} />
        ))}
      </div>

      {/* Content cards skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="p-4 bg-notion-surface rounded-xl space-y-2">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 bg-notion-border rounded flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-notion-border rounded w-3/5" />
                <div className="h-3 bg-notion-border/60 rounded w-2/5" />
              </div>
              <div className="h-5 w-14 bg-notion-border/40 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
