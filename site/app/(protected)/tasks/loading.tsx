export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8 pb-6 border-b border-notion-border/40">
        <div className="h-10 w-10 bg-notion-surface rounded-lg mb-3" />
        <div className="h-8 w-32 bg-notion-surface rounded-lg mb-2" />
        <div className="h-4 w-48 bg-notion-surface rounded" />
      </div>

      {/* Filter tabs skeleton */}
      <div className="flex gap-2 mb-6">
        {[80, 64, 72, 56].map((w, i) => (
          <div key={i} className="h-8 bg-notion-surface rounded-lg" style={{ width: w }} />
        ))}
      </div>

      {/* Task rows skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-notion-surface rounded-xl">
            <div className="h-4 w-4 bg-notion-border rounded-full flex-shrink-0" />
            <div className="h-4 bg-notion-border rounded flex-1" style={{ width: `${60 + (i % 4) * 10}%` }} />
            <div className="h-5 w-16 bg-notion-border rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
