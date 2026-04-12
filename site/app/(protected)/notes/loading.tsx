export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8 pb-6 border-b border-notion-border/40">
        <div className="h-10 w-10 bg-notion-surface rounded-lg mb-3" />
        <div className="h-8 w-28 bg-notion-surface rounded-lg mb-2" />
        <div className="h-4 w-52 bg-notion-surface rounded" />
      </div>

      {/* Filter tabs skeleton */}
      <div className="flex gap-2 mb-6">
        {[60, 76, 68].map((w, i) => (
          <div key={i} className="h-8 bg-notion-surface rounded-lg" style={{ width: w }} />
        ))}
      </div>

      {/* Note cards skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 bg-notion-surface rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-5 bg-notion-border rounded w-1/2" />
              <div className="h-4 w-20 bg-notion-border rounded" />
            </div>
            <div className="h-3 bg-notion-border/60 rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )
}
