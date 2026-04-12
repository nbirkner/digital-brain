export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8 pb-6 border-b border-notion-border/40">
        <div className="h-10 w-10 bg-notion-surface rounded-lg mb-3" />
        <div className="h-8 w-28 bg-notion-surface rounded-lg mb-2" />
        <div className="h-4 w-48 bg-notion-surface rounded" />
      </div>

      {/* Filter tabs skeleton */}
      <div className="flex gap-2 mb-6">
        {[64, 76, 88, 72, 60, 80].map((w, i) => (
          <div key={i} className="h-8 bg-notion-surface rounded-lg" style={{ width: w }} />
        ))}
      </div>

      {/* Work doc cards skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="p-4 bg-notion-surface rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-5 bg-notion-border rounded w-2/5" />
              <div className="h-4 w-20 bg-notion-border rounded" />
            </div>
            <div className="h-3 bg-notion-border/60 rounded w-3/5" />
            <div className="flex gap-2 pt-1">
              <div className="h-5 w-14 bg-notion-border/40 rounded-full" />
              <div className="h-5 w-18 bg-notion-border/40 rounded-full" />
              <div className="h-5 w-12 bg-notion-border/40 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
