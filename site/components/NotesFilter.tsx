"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useMemo } from "react"
import { TagRow } from "@/components/TagPill"
import { getTagDef } from "@/lib/tag-taxonomy"

interface NoteItem {
  slug: string
  displayTitle: string
  content: string
  frontmatter: Record<string, string>
  autoTags?: string[]
  filePath?: string
}

interface NotesFilterProps {
  notes: NoteItem[]
  currentPage?: number
  totalPages?: number
  totalCount?: number
}

const TYPE_BADGE: Record<string, { label: string; className: string }> = {
  note: { label: "note", className: "bg-blue-500/10 text-blue-500" },
  journal: { label: "journal", className: "bg-purple-500/10 text-purple-500" },
  idea: { label: "idea", className: "bg-yellow-500/10 text-yellow-600" },
  quote: { label: "quote", className: "bg-emerald-500/10 text-emerald-600" },
  dream: { label: "dream", className: "bg-indigo-500/10 text-indigo-500" },
}

export default function NotesFilter({
  notes,
  currentPage = 1,
  totalPages = 1,
  totalCount,
}: NotesFilterProps) {
  const [query, setQuery] = useState("")
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (page <= 1) {
      params.delete("page")
    } else {
      params.set("page", String(page))
    }
    router.push(`?${params.toString()}`)
  }

  // Collect all unique tags across notes for the filter bar
  const allTags = useMemo(() => {
    const tagCounts = new Map<string, number>()
    for (const note of notes) {
      for (const tag of note.autoTags || []) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      }
    }
    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([id, count]) => ({ id, count }))
  }, [notes])

  const filtered = useMemo(() => {
    let result = notes

    // Filter by active tag
    if (activeTag) {
      result = result.filter((n) => n.autoTags?.includes(activeTag))
    }

    // Filter by search query — title/slug only (content not loaded for performance)
    if (query.trim()) {
      const lower = query.toLowerCase()
      result = result.filter(
        (n) =>
          n.displayTitle.toLowerCase().includes(lower) ||
          n.slug.toLowerCase().includes(lower)
      )
    }

    return result
  }, [notes, query, activeTag])

  return (
    <div>
      <div className="sticky top-0 bg-notion-bg/90 backdrop-blur-sm pb-4 z-10">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-notion-muted pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-notion-surface border border-notion-border rounded-xl text-sm text-notion-text placeholder:text-notion-muted/40 focus:outline-none focus:ring-1 focus:ring-notion-accent focus:border-notion-accent transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-notion-muted hover:text-notion-text"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Tag filter bar */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {activeTag && (
              <button
                onClick={() => setActiveTag(null)}
                className="inline-flex items-center px-3 py-2 sm:px-2 sm:py-0.5 rounded-md text-xs sm:text-[10px] font-medium bg-notion-hover text-notion-muted hover:text-notion-text transition-colors min-h-[36px] sm:min-h-0"
              >
                Clear
              </button>
            )}
            {allTags.map(({ id, count }) => {
              const def = getTagDef(id)
              const isActive = activeTag === id
              return (
                <button
                  key={id}
                  onClick={() => setActiveTag(isActive ? null : id)}
                  className={`inline-flex items-center gap-1 px-3 py-2 sm:px-2 sm:py-0.5 rounded-md text-xs sm:text-[10px] font-medium transition-all min-h-[36px] sm:min-h-0 ${
                    isActive
                      ? `${def.color} ring-1 ring-current`
                      : `bg-notion-hover text-notion-muted/70 hover:text-notion-muted`
                  }`}
                >
                  {def.label}
                  <span className="opacity-50">{count}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {(query || activeTag) && (
        <p className="text-xs text-notion-muted mb-3">
          {filtered.length} {filtered.length === 1 ? "result" : "results"}
          {query && <> for &ldquo;{query}&rdquo;</>}
          {activeTag && <> tagged {getTagDef(activeTag).label}</>}
        </p>
      )}

      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((note) => {
            const type = note.frontmatter.type || "note"
            const badge = TYPE_BADGE[type] ?? TYPE_BADGE.note
            const date = note.frontmatter.date
            const preview = note.content?.slice(0, 120).trim()
            return (
              <Link
                key={note.slug}
                href={`/notes/${note.slug}`}
                className="group block bg-notion-surface border border-notion-border rounded-xl p-4 sm:p-4 hover:bg-notion-hover hover:border-notion-border hover:shadow-md transition-all stagger-item"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-notion-text group-hover:text-notion-accent transition-colors truncate leading-snug">{note.displayTitle}</p>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-notion-hover flex-shrink-0 mt-0.5 text-notion-muted/70`}>
                    {badge.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-notion-muted/60 font-mono truncate">
                    notes/{note.slug}{date && ` · ${date}`}
                  </p>
                  {note.filePath && (
                    <a
                      href={process.env.NEXT_PUBLIC_REPO_ROOT ? `cursor://file${process.env.NEXT_PUBLIC_REPO_ROOT}/${note.filePath}` : "#"}
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 text-[10px] text-notion-muted/30 hover:text-notion-accent transition-colors font-mono"
                      title="Open in Cursor"
                    >
                      ↗
                    </a>
                  )}
                </div>
                {note.autoTags && note.autoTags.length > 0 && (
                  <div className="mt-2">
                    <TagRow tags={note.autoTags} size="sm" max={5} />
                  </div>
                )}
                {preview && (
                  <p className="text-xs text-notion-muted/50 mt-1.5 line-clamp-2 leading-relaxed">
                    {preview}
                  </p>
                )}
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-notion-muted font-medium">
            {query ? <>No notes match &ldquo;{query}&rdquo;</> : "No notes match this filter"}
          </p>
          <p className="text-notion-muted/60 text-sm mt-1">Try a different search term or tag.</p>
        </div>
      )}

      {/* Pagination controls — only shown when not actively filtering */}
      {!query && !activeTag && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-notion-border">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="text-xs text-notion-muted hover:text-notion-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-1.5 rounded-lg hover:bg-notion-hover"
          >
            ← Previous
          </button>
          <span className="text-xs text-notion-muted/60">
            Page {currentPage} of {totalPages}
            {totalCount !== undefined && (
              <span className="ml-1 text-notion-muted/40">({totalCount} total)</span>
            )}
          </span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="text-xs text-notion-muted hover:text-notion-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-1.5 rounded-lg hover:bg-notion-hover"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
