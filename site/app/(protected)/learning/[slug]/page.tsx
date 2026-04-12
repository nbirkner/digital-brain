import { notFound } from "next/navigation"
import Link from "next/link"
import PagePathStatic from "@/components/layout/PagePathStatic"
import { fetchBookById, fetchBookHighlights, fetchReaderSummary } from "@/lib/readwise"
import type { ReadwiseCategory } from "@/lib/readwise"
import { parseInlineMarkdown } from "@/lib/markdown"
import { sanitizeHtml } from "@/lib/sanitize-html"
import HighlightActions from "@/components/features/learning/HighlightActions"

export const revalidate = 60

// ─── category badge ───────────────────────────────────────────────────────────

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

function CategoryBadge({ category }: { category: ReadwiseCategory }) {
  const style =
    CATEGORY_BADGE_STYLES[category] ??
    "bg-notion-surface border border-notion-border text-notion-muted"
  const label = CATEGORY_LABELS[category] ?? category
  return (
    <span
      className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded ${style}`}
    >
      {label}
    </span>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ slug: string }>
}

export default async function BookDetailPage({ params }: Props) {
  const { slug } = await params
  const id = parseInt(slug, 10)

  if (isNaN(id)) notFound()

  const book = await fetchBookById(id)

  if (!book) notFound()

  const [highlights, summary] = await Promise.all([
    fetchBookHighlights(id),
    fetchReaderSummary(book.source_url, book.title),
  ])

  // Sort highlights: dated ones first (newest), then undated
  const sorted = [...highlights].sort((a, b) => {
    const da = a.highlighted_at ? new Date(a.highlighted_at).getTime() : 0
    const db = b.highlighted_at ? new Date(b.highlighted_at).getTime() : 0
    return db - da
  })

  return (
    <div>
      <PagePathStatic path={`learning/${book.title.slice(0, 40)}`} />

      {/* Back link */}
      <Link
        href="/learning"
        className="inline-flex items-center gap-1.5 text-xs text-notion-muted hover:text-notion-accent transition-colors mb-6"
      >
        <span>←</span>
        <span>Back to Learning</span>
      </Link>

      {/* Book header */}
      <div className="flex gap-5 mb-8">
        {/* Cover */}
        <div className="shrink-0 w-24 h-36 rounded-lg border border-notion-border overflow-hidden bg-notion-hover flex items-center justify-center">
          {book.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.cover_image_url}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl">📖</span>
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-col gap-2 min-w-0">
          <CategoryBadge category={book.category} />
          <h1 className="text-xl font-semibold text-notion-text leading-snug">
            {book.title}
          </h1>
          {book.author && (
            <p className="text-sm text-notion-muted">{book.author}</p>
          )}
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs font-mono text-notion-muted/50">
              {highlights.length} highlight{highlights.length !== 1 ? "s" : ""}
            </span>
            <a
              href={`https://readwise.io/bookreview/${book.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-notion-muted/50 hover:text-notion-accent transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              View in Readwise
            </a>
            {book.source_url && (
              <a
                href={book.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-notion-muted/50 hover:text-notion-accent transition-colors"
                title="View in Reader"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                View in Reader
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Reader summary */}
      {summary && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-notion-surface border border-notion-border/50">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-notion-muted/60 mb-1.5">
            Summary
          </p>
          <p className="text-sm text-notion-text/80 leading-relaxed">
            {summary}
          </p>
        </div>
      )}

      {/* Highlights list */}
      {sorted.length === 0 ? (
        <p className="text-sm text-notion-muted px-1">No highlights yet.</p>
      ) : (
        <>
          <div className="mb-2 px-1 flex items-center gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-notion-muted/60">
              Highlights
            </p>
            <span className="text-[10px] text-notion-muted/40 font-mono">
              {sorted.length}
            </span>
            <Link
              href={`/learning/highlights?book=${book.id}`}
              className="ml-auto text-[10px] text-notion-muted/50 hover:text-notion-accent transition-colors"
            >
              View in Highlights DB →
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {sorted.map((h) => {
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
                  className="rounded-xl border border-notion-border bg-notion-surface px-5 py-5 flex flex-col gap-2 hover:bg-notion-hover transition-colors"
                >
                  <p
                    className="text-sm text-notion-text leading-relaxed whitespace-pre-line [&_strong]:font-semibold [&_em]:italic [&_a]:text-notion-accent [&_a]:hover:underline"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(parseInlineMarkdown(h.text)) }}
                  />
                  <div className="flex items-center gap-3 flex-wrap">
                    {date && (
                      <span className="text-[11px] font-mono text-notion-muted/40">
                        {date}
                      </span>
                    )}
                    {h.note && (
                      <span className="text-[11px] text-notion-muted/60 italic">
                        {h.note}
                      </span>
                    )}
                    <HighlightActions text={h.text} highlightId={h.id} readwiseUrl={h.readwise_url} sourceTitle={book.title} sourceUrl={book.source_url} />
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
