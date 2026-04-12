import Link from "next/link"
import PagePathStatic from "@/components/PagePathStatic"
import LearningHighlightsClient from "@/components/LearningHighlightsClient"
import { fetchBooks, fetchHighlights } from "@/lib/readwise"

export const revalidate = 60

interface Props {
  searchParams: Promise<{ book?: string }>
}

export default async function HighlightsPage({ searchParams }: Props) {
  const { book: bookParam } = await searchParams
  const initialBookId = bookParam ? parseInt(bookParam, 10) : undefined

  const [books, highlights] = await Promise.all([fetchBooks(), fetchHighlights()])

  // Build book lookup for client — include id and source_url for linking
  const bookMap = Object.fromEntries(
    books.map((b) => [
      b.id,
      {
        title: b.title,
        category: b.category,
        source_url: b.source_url,
      },
    ])
  )

  // Sort newest first
  const sorted = [...highlights].sort((a, b) => {
    const da = a.highlighted_at ? new Date(a.highlighted_at).getTime() : 0
    const db = b.highlighted_at ? new Date(b.highlighted_at).getTime() : 0
    return db - da
  })

  const initialBookTitle =
    initialBookId && !isNaN(initialBookId)
      ? (bookMap[initialBookId]?.title ?? undefined)
      : undefined

  return (
    <div>
      <PagePathStatic path="learning/highlights" />

      <Link
        href="/learning"
        className="inline-flex items-center gap-1.5 text-xs text-notion-muted hover:text-notion-accent transition-colors mb-6"
      >
        <span>←</span>
        <span>Back to Learning</span>
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-notion-text mb-1">Highlights</h1>
        <p className="text-sm text-notion-muted">Everything underlined, dog-eared, or starred.</p>
      </div>

      <LearningHighlightsClient
        highlights={sorted}
        bookMap={bookMap}
        initialBookId={!isNaN(initialBookId ?? NaN) ? initialBookId : undefined}
        initialBookTitle={initialBookTitle}
      />
    </div>
  )
}
