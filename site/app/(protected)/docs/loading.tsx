export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8 pb-6 border-b border-notion-border/40">
        <div className="h-10 w-10 bg-notion-surface rounded-lg mb-3" />
        <div className="h-8 w-20 bg-notion-surface rounded-lg mb-2" />
        <div className="h-4 w-40 bg-notion-surface rounded" />
      </div>

      {/* Filter tabs skeleton */}
      <div className="flex gap-2 mb-6">
        {[60, 72, 80, 68, 76].map((w, i) => (
          <div key={i} className="h-8 bg-notion-surface rounded-lg" style={{ width: w }} />
        ))}
      </div>

      {/* Doc cards skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 bg-notion-surface rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-5 bg-notion-border rounded w-2/5" />
              <div className="h-4 w-24 bg-notion-border rounded" />
            </div>
            <div className="h-3 bg-notion-border/60 rounded w-3/4" />
            <div className="flex gap-2 pt-1">
              <div className="h-5 w-16 bg-notion-border/40 rounded-full" />
              <div className="h-5 w-12 bg-notion-border/40 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
