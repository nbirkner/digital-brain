import Link from "next/link"

export interface SubDocItem {
  title: string
  url: string
  snippet?: string
}

export default function SubDocsPanel({ subDocs }: { subDocs: SubDocItem[] }) {
  if (!subDocs.length) return null
  return (
    <div className="mt-6 mb-2">
      <p className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-3">Deep Dives</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {subDocs.map((sub) => (
          <Link
            key={sub.url}
            href={sub.url}
            className="group flex flex-col gap-1.5 rounded-lg border border-purple-500/20 bg-purple-500/5 p-4 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium text-notion-text group-hover:text-purple-200 transition-colors leading-snug">
                {sub.title}
              </span>
              <span className="text-purple-500/50 group-hover:text-purple-400 transition-colors shrink-0 mt-0.5 text-xs">
                ↗
              </span>
            </div>
            {sub.snippet && (
              <p className="text-xs text-notion-muted/70 leading-relaxed line-clamp-2">{sub.snippet}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
