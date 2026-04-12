"use client"

import { useState } from "react"
import Link from "next/link"
import FilterTabs from "@/components/FilterTabs"
import { parseInlineMarkdown } from "@/lib/markdown"
import { sanitizeHtml } from "@/lib/sanitize-html"
import type { ReadwiseBook, ReadwiseHighlight, ReadwiseCategory } from "@/lib/readwise"
import HighlightActions from "@/components/HighlightActions"

// ─── types ────────────────────────────────────────────────────────────────────

type CategoryFilter = "all" | "books" | "articles" | "podcasts" | "tweets" | "supplementals"

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: "All",
  books: "Books",
  articles: "Articles",
  podcasts: "Podcasts",
  tweets: "Tweets",
  supplementals: "Supplemental",
}

const CATEGORY_BADGE_STYLES: Record<ReadwiseCategory, string> = {
  books: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  articles: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  tweets: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
  podcasts: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  supplementals: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
}

const TABS: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "books", label: "Books" },
  { id: "articles", label: "Articles" },
  { id: "podcasts", label: "Podcasts" },
  { id: "tweets", label: "Tweets" },
]

// ─── category badge ───────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: ReadwiseCategory }) {
  const style = CATEGORY_BADGE_STYLES[category] ?? "bg-notion-surface border border-notion-border text-notion-muted"
  const label = CATEGORY_LABELS[category] ?? category
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${style}`}>
      {label}
    </span>
  )
}

// ─── book card ────────────────────────────────────────────────────────────────

function BookCard({
  book,
  highlightCount,
}: {
  book: ReadwiseBook
  highlightCount: number
}) {
  return (
    <div className="flex flex-col rounded-xl border border-notion-border bg-notion-surface overflow-hidden hover:bg-notion-hover transition-colors">
      {/* Cover */}
      <div className="aspect-[3/2] bg-notion-hover flex items-center justify-center overflow-hidden relative">
        {book.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.cover_image_url}
            alt={book.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget
              target.style.display = "none"
              const parent = target.parentElement
              if (parent) {
                parent.innerHTML = `<span style="font-size:2.5rem">📖</span>`
              }
            }}
          />
        ) : (
          <span className="text-4xl">📖</span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <CategoryBadge category={book.category} />
        <p className="text-sm font-semibold text-notion-text leading-snug line-clamp-2">
          {book.title}
        </p>
        {book.author && (
          <p className="text-xs text-notion-muted truncate">{book.author}</p>
        )}
        <p className="text-[10px] text-notion-muted/50 font-mono mt-auto pt-1">
          {highlightCount} highlight{highlightCount !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  )
}

// ─── highlight row ────────────────────────────────────────────────────────────

function HighlightRow({
  highlight,
  bookTitle,
  bookSourceUrl,
}: {
  highlight: ReadwiseHighlight
  bookTitle: string
  bookSourceUrl?: string | null
}) {
  const date = highlight.highlighted_at
    ? new Date(highlight.highlighted_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null

  return (
    <div className="px-4 py-3.5 flex flex-col gap-1 group hover:bg-notion-hover transition-colors">
      <p
        className="text-sm text-notion-text leading-relaxed whitespace-pre-line [&_strong]:font-semibold [&_em]:italic [&_a]:text-notion-accent [&_a]:hover:underline"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(parseInlineMarkdown(highlight.text)) }}
      />
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] text-notion-muted/60 truncate max-w-[280px]">
          {bookTitle}
        </span>
        {date && (
          <span className="text-[11px] font-mono text-notion-muted/40">{date}</span>
        )}
        <HighlightActions text={highlight.text} highlightId={highlight.id} readwiseUrl={highlight.readwise_url} sourceTitle={bookTitle} sourceUrl={bookSourceUrl} />
      </div>
    </div>
  )
}

// ─── main client component ────────────────────────────────────────────────────

interface LearningClientProps {
  books: ReadwiseBook[]
  highlights: ReadwiseHighlight[]
  totalHighlightsRaw: number
}

export default function LearningClient({
  books,
  highlights,
  totalHighlightsRaw,
}: LearningClientProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "az">("newest")

  // Build a lookup: book_id → book
  const bookById = new Map<number, ReadwiseBook>(books.map((b) => [b.id, b]))

  // Filter + sort books
  const filteredBooks = books
    .filter((b) => activeCategory === "all" || b.category === activeCategory)
    .sort((a, b) => {
      if (sortOrder === "az") {
        return a.title.localeCompare(b.title)
      }
      const da = a.last_highlight_at ? new Date(a.last_highlight_at).getTime() : 0
      const db = b.last_highlight_at ? new Date(b.last_highlight_at).getTime() : 0
      return sortOrder === "newest" ? db - da : da - db
    })

  // Build per-book highlight counts (from deduplicated highlights)
  const highlightCountByBook = new Map<number, number>()
  for (const h of highlights) {
    highlightCountByBook.set(h.book_id, (highlightCountByBook.get(h.book_id) ?? 0) + 1)
  }

  // Recent highlights for displayed books (filtered by category), sorted newest first
  const filteredBookIds = new Set(filteredBooks.map((b) => b.id))
  const recentHighlights = highlights
    .filter((h) => activeCategory === "all" || filteredBookIds.has(h.book_id))
    .sort((a, b) => {
      const da = a.highlighted_at ? new Date(a.highlighted_at).getTime() : 0
      const db = b.highlighted_at ? new Date(b.highlighted_at).getTime() : 0
      return db - da
    })
    .slice(0, 50)

  // Stats
  const bookCount = books.filter((b) => b.category === "books").length
  const articleCount = books.filter((b) => b.category === "articles").length

  return (
    <div>
      {/* Stats bar */}
      <div className="flex items-center gap-6 mb-6 px-1">
        <div className="flex flex-col gap-0.5">
          <span className="text-xl tabular-nums leading-none font-semibold text-notion-text">
            {books.length}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-notion-muted/50 font-medium">
            sources
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xl tabular-nums leading-none font-semibold text-notion-text">
            {bookCount}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-notion-muted/50 font-medium">
            books
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xl tabular-nums leading-none font-semibold text-notion-text">
            {articleCount}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-notion-muted/50 font-medium">
            articles
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xl tabular-nums leading-none font-semibold text-notion-text">
            {highlights.length}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-notion-muted/50 font-medium">
            highlights
          </span>
        </div>
        <Link
          href="/learning/highlights"
          className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-notion-text bg-notion-surface border border-notion-border hover:border-notion-accent/40 hover:text-notion-accent rounded-lg px-3 py-1.5 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10" />
          </svg>
          Highlights Database
        </Link>
      </div>

      {/* Filter tabs + sort */}
      <div className="flex items-center gap-3 mb-6">
        <FilterTabs
          tabs={TABS}
          active={activeCategory}
          onChange={(id) => setActiveCategory(id as CategoryFilter)}
        />
        <div className="ml-auto flex items-center gap-1 shrink-0">
          {(["newest", "oldest", "az"] as const).map((opt) => {
            const labels = { newest: "Newest", oldest: "Oldest", az: "A → Z" }
            return (
              <button
                key={opt}
                onClick={() => setSortOrder(opt)}
                className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${
                  sortOrder === opt
                    ? "bg-notion-accent/10 text-notion-accent font-medium"
                    : "text-notion-muted/60 hover:text-notion-muted hover:bg-notion-hover"
                }`}
              >
                {labels[opt]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Books grid */}
      {filteredBooks.length === 0 ? (
        <p className="text-sm text-notion-muted px-1 mb-8">No sources in this category.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-10">
          {filteredBooks.map((book) => (
            <Link key={book.id} href={`/learning/${book.id}`} className="block">
              <BookCard
                book={book}
                highlightCount={highlightCountByBook.get(book.id) ?? 0}
              />
            </Link>
          ))}
        </div>
      )}

      {/* Recent highlights */}
      <div className="mb-2 px-1 flex items-center gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-notion-muted/60">
          Recent highlights
        </p>
        <span className="text-[10px] text-notion-muted/40 font-mono">
          {recentHighlights.length}
        </span>
        <Link
          href="/learning/highlights"
          className="ml-auto text-[10px] text-notion-muted/50 hover:text-notion-accent transition-colors"
        >
          View all {highlights.length} →
        </Link>
      </div>

      {recentHighlights.length === 0 ? (
        <p className="text-sm text-notion-muted px-1">No highlights yet.</p>
      ) : (
        <div className="rounded-xl border border-notion-border overflow-hidden bg-notion-surface divide-y divide-notion-border/30">
          {recentHighlights.map((h) => {
            const book = bookById.get(h.book_id)
            return (
              <HighlightRow
                key={h.id}
                highlight={h}
                bookTitle={book?.title ?? "Unknown source"}
                bookSourceUrl={book?.source_url}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
