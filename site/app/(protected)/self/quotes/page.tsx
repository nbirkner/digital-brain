import { getMarkdownFilesWithPending } from "@/lib/content"
import PagePathStatic from "@/components/layout/PagePathStatic"
import PageHeader from "@/components/layout/PageHeader"
import Link from "next/link"
import LabelPageContent from "@/components/features/notes/LabelPageContent"


export default async function QuotesPage() {
  const allArticles = await getMarkdownFilesWithPending("personal/docs/library/quotes/articles")
  const allBooks = await getMarkdownFilesWithPending("personal/docs/library/quotes/books")
  const allTweets = await getMarkdownFilesWithPending("personal/docs/library/quotes/tweets")

  const totalCount = allArticles.length + allBooks.length + allTweets.length

  const CATEGORIES = [
    {
      label: "Books",
      emoji: "📚",
      count: allBooks.length,
      href: "/self/quotes/books",
    },
    {
      label: "Articles",
      emoji: "📰",
      count: allArticles.length,
      href: "/self/quotes/articles",
    },
    {
      label: "Tweets",
      emoji: "🐦",
      count: allTweets.length,
      href: "/self/quotes/tweets",
    },
  ]

  // Show a sample from recent books and articles
  const recentBooks = allBooks.slice(0, 6)
  const recentArticles = allArticles.slice(0, 6)

  return (
    <div className="max-w-2xl">
      <PagePathStatic path="niki/quotes" />
      <PageHeader
        icon="💭"
        title="Notable Quotes & Reminders"
        description="Words that stuck. Lines worth returning to."
      />

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.label}
            className="rounded-xl border border-notion-border bg-notion-surface p-4 text-center"
          >
            <div className="text-2xl mb-1">{cat.emoji}</div>
            <div className="text-2xl font-bold text-notion-text">{cat.count.toLocaleString()}</div>
            <div className="text-xs text-notion-muted mt-0.5">{cat.label}</div>
          </div>
        ))}
      </div>

      <p className="text-xs text-notion-muted mb-8">
        {totalCount.toLocaleString()} highlights total — saved from Readwise.
      </p>

      {/* Recent books */}
      {recentBooks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-notion-muted uppercase tracking-wider mb-3">
            📚 Books
          </h2>
          <div className="space-y-1">
            {recentBooks.map((f) => (
              <Link
                key={f.slug}
                href={`/self/quotes/books/${f.slug}`}
                className="block px-3 py-2 rounded-lg hover:bg-notion-surface border border-transparent hover:border-notion-border transition-colors"
              >
                <p className="text-sm text-notion-text leading-snug">{f.displayTitle}</p>
                {f.frontmatter.date && (
                  <p className="text-xs text-notion-muted mt-0.5">{f.frontmatter.date}</p>
                )}
              </Link>
            ))}
          </div>
          {allBooks.length > 6 && (
            <p className="text-xs text-notion-muted mt-2 px-3">
              {allBooks.length - 6} more books not shown.
            </p>
          )}
        </div>
      )}

      {/* Recent articles */}
      {recentArticles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-notion-muted uppercase tracking-wider mb-3">
            📰 Articles
          </h2>
          <div className="space-y-1">
            {recentArticles.map((f) => (
              <Link
                key={f.slug}
                href={`/self/quotes/articles/${f.slug}`}
                className="block px-3 py-2 rounded-lg hover:bg-notion-surface border border-transparent hover:border-notion-border transition-colors"
              >
                <p className="text-sm text-notion-text leading-snug">{f.displayTitle}</p>
                {f.frontmatter.date && (
                  <p className="text-xs text-notion-muted mt-0.5">{f.frontmatter.date}</p>
                )}
              </Link>
            ))}
          </div>
          {allArticles.length > 6 && (
            <p className="text-xs text-notion-muted mt-2 px-3">
              {allArticles.length - 6} more articles not shown.
            </p>
          )}
        </div>
      )}
      <LabelPageContent tagId="quote" />
    </div>
  )
}
