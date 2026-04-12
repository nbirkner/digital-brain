"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import FilterTabs from "@/components/ui/FilterTabs"
import { parseInlineMarkdown } from "@/lib/markdown"
import { sanitizeHtml } from "@/lib/sanitize-html"
import type { ReadwiseHighlight, ReadwiseCategory } from "@/lib/readwise"
import HighlightActions from "@/components/features/learning/HighlightActions"

// ─── types ────────────────────────────────────────────────────────────────────

type CategoryFilter = "all" | "books" | "articles" | "podcasts" | "tweets"

const CATEGORY_BADGE_STYLES: Record<ReadwiseCategory, string> = {
  books: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  articles: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  tweets: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
  podcasts: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  supplementals: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
}

const CATEGORY_LABELS: Record<ReadwiseCategory, string> = {
  books: "Book",
  articles: "Article",
  tweets: "Tweet",
  podcasts: "Podcast",
  supplementals: "Supplemental",
}

const TABS: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "books", label: "Books" },
  { id: "articles", label: "Articles" },
  { id: "podcasts", label: "Podcasts" },
  { id: "tweets", label: "Tweets" },
]

interface BookInfo {
  title: string
  category: ReadwiseCategory
  source_url: string | null
}

interface SourceGroup {
  bookId: number
  book: BookInfo
  highlights: ReadwiseHighlight[]
  latestAt: number
}

interface Props {
  highlights: ReadwiseHighlight[]
  bookMap: Record<number, BookInfo>
  initialBookId?: number
  initialBookTitle?: string
}

// ─── category badge ───────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: ReadwiseCategory }) {
  const style =
    CATEGORY_BADGE_STYLES[category] ??
    "bg-notion-surface border border-notion-border text-notion-muted"
  const label = CATEGORY_LABELS[category] ?? category
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${style}`}>
      {label}
    </span>
  )
}

// ─── highlight text with inline markdown ─────────────────────────────────────

function HighlightText({ text }: { text: string }) {
  return (
    <p
      className="text-sm text-notion-text leading-relaxed whitespace-pre-line [&_strong]:font-semibold [&_em]:italic [&_a]:text-notion-accent [&_a]:hover:underline"
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(parseInlineMarkdown(text)) }}
    />
  )
}

// ─── source group section ─────────────────────────────────────────────────────

function SourceGroupSection({ bookId, book, highlights }: {
  bookId: number
  book: BookInfo
  highlights: ReadwiseHighlight[]
}) {
  return (
    <div className="mb-8">
      {/* Group header — matches DocsClient WeekGroupSection style */}
      <div className="border-b border-notion-border/20 mb-3 pb-1.5 flex items-center gap-2">
        <CategoryBadge category={book.category} />
        <Link
          href={`/learning/${bookId}`}
          className="text-[11px] font-semibold text-notion-muted/70 hover:text-notion-accent transition-colors truncate"
        >
          {book.title}
        </Link>
        <span className="text-[10px] font-mono text-notion-muted/30 ml-auto shrink-0">
          {highlights.length}
        </span>
      </div>

      {/* Highlights */}
      <div className="rounded-xl border border-notion-border overflow-hidden bg-notion-surface divide-y divide-notion-border/30">
        {highlights.map((h) => {
          const date = h.highlighted_at
            ? new Date(h.highlighted_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : null

          return (
            <div
              key={h.id}
              className="px-5 py-5 flex flex-col gap-2 hover:bg-notion-hover transition-colors"
            >
              <HighlightText text={h.text} />
              <div className="flex items-center gap-3 flex-wrap">
                {date && (
                  <span className="text-[11px] font-mono text-notion-muted/40">{date}</span>
                )}
                <HighlightActions text={h.text} highlightId={h.id} readwiseUrl={h.readwise_url} sourceTitle={book.title} sourceUrl={book.source_url} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

const GROUPS_PER_PAGE = 10

export default function LearningHighlightsClient({
  highlights,
  bookMap,
  initialBookId,
  initialBookTitle,
}: Props) {
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all")
  const [bookFilter, setBookFilter] = useState<{ id: number; title: string } | null>(
    initialBookId && initialBookTitle
      ? { id: initialBookId, title: initialBookTitle }
      : null
  )
  const [visibleGroups, setVisibleGroups] = useState(GROUPS_PER_PAGE)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return highlights.filter((h) => {
      const book = bookMap[h.book_id]
      if (activeCategory !== "all" && book?.category !== activeCategory) return false
      if (bookFilter && h.book_id !== bookFilter.id) return false
      if (q && !h.text.toLowerCase().includes(q)) return false
      return true
    })
  }, [highlights, bookMap, query, activeCategory, bookFilter])

  // Group filtered highlights by source, sorted by most recent
  const groups = useMemo<SourceGroup[]>(() => {
    const map = new Map<number, SourceGroup>()
    for (const h of filtered) {
      const book = bookMap[h.book_id]
      if (!book) continue
      if (!map.has(h.book_id)) {
        map.set(h.book_id, { bookId: h.book_id, book, highlights: [], latestAt: 0 })
      }
      const group = map.get(h.book_id)!
      group.highlights.push(h)
      const ts = h.highlighted_at ? new Date(h.highlighted_at).getTime() : 0
      if (ts > group.latestAt) group.latestAt = ts
    }
    return Array.from(map.values()).sort((a, b) => b.latestAt - a.latestAt)
  }, [filtered, bookMap])

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleGroups(GROUPS_PER_PAGE)
  }, [query, activeCategory, bookFilter])

  // Infinite scroll via IntersectionObserver
  const loadMore = useCallback(() => {
    setVisibleGroups((n) => Math.min(n + GROUPS_PER_PAGE, groups.length))
  }, [groups.length])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore() },
      { rootMargin: "200px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  const visibleGroupList = groups.slice(0, visibleGroups)
  const totalVisible = visibleGroupList.reduce((sum, g) => sum + g.highlights.length, 0)

  return (
    <div>
      {/* Stats bar */}
      <div className="flex items-center gap-6 mb-6 px-1">
        <div className="flex flex-col gap-0.5">
          <span className="text-xl tabular-nums leading-none font-semibold text-notion-text">
            {highlights.length}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-notion-muted/50 font-medium">
            total
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xl tabular-nums leading-none font-semibold text-notion-text">
            {filtered.length}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-notion-muted/50 font-medium">
            shown
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xl tabular-nums leading-none font-semibold text-notion-text">
            {groups.length}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-notion-muted/50 font-medium">
            sources
          </span>
        </div>
      </div>

      {/* Active book filter pill */}
      {bookFilter && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-[11px] text-notion-muted/60">Filtered by source:</span>
          <span className="inline-flex items-center gap-1.5 text-[11px] bg-notion-accent/10 text-notion-accent border border-notion-accent/20 rounded-full px-2.5 py-0.5 font-medium">
            <Link href={`/learning/${bookFilter.id}`} className="hover:underline truncate max-w-[200px]">
              {bookFilter.title}
            </Link>
            <button
              onClick={() => setBookFilter(null)}
              className="text-notion-accent/60 hover:text-notion-accent transition-colors ml-0.5"
              aria-label="Clear book filter"
            >
              ×
            </button>
          </span>
        </div>
      )}

      {/* Search input */}
      <div className="relative mb-4">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-notion-muted/40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search highlights..."
          className="w-full bg-notion-surface border border-notion-border rounded-lg pl-9 pr-4 py-2 text-sm text-notion-text placeholder-notion-muted/40 focus:outline-none focus:ring-1 focus:ring-notion-accent/40 focus:border-notion-accent/40 transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-notion-muted/40 hover:text-notion-muted transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <FilterTabs
        tabs={TABS}
        active={activeCategory}
        onChange={(id) => setActiveCategory(id as CategoryFilter)}
        className="mb-6"
      />

      {/* Grouped highlights */}
      {groups.length === 0 ? (
        <p className="text-sm text-notion-muted px-1">
          {query ? `No highlights matching "${query}"` : "No highlights in this category."}
        </p>
      ) : (
        <>
          {visibleGroupList.map((group) => (
            <SourceGroupSection
              key={group.bookId}
              bookId={group.bookId}
              book={group.book}
              highlights={group.highlights}
            />
          ))}

          {/* Infinite scroll sentinel */}
          {visibleGroups < groups.length && (
            <div ref={sentinelRef} className="py-4 flex justify-center">
              <span className="text-xs text-notion-muted/40 font-mono">
                {totalVisible} of {filtered.length} highlights — scroll for more
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
