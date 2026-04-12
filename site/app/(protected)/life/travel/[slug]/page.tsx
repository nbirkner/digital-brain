import { notFound } from "next/navigation"
import PageHeader from "@/components/PageHeader"
import MarkdownRenderer from "@/components/MarkdownRenderer"
import { getMarkdownFileWithPending, getMarkdownFiles } from "@/lib/content"
import PagePathStatic from "@/components/PagePathStatic"

const STATUS_STYLES: Record<string, string> = {
  "Tickets purchased": "bg-green-500/15 text-green-700 border-green-500/30",
  "Reservations pending": "bg-yellow-500/15 text-yellow-700 border-yellow-500/30",
  "Undecided": "bg-notion-surface text-notion-muted border-notion-border",
  "Done": "bg-blue-500/15 text-blue-700 border-blue-500/30",
  "Canceled": "bg-red-500/15 text-red-700 border-red-500/30",
  "Cancelled": "bg-red-500/15 text-red-700 border-red-500/30",
}


export const dynamicParams = false

export async function generateStaticParams() {
  const files = getMarkdownFiles("shared/travel/trips")
  return files.map(f => ({ slug: f.slug }))
}

export default async function TripPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const file = await getMarkdownFileWithPending(`shared/travel/trips/${slug}.md`)
  if (!file) notFound()

  const { frontmatter, content, displayTitle } = file
  const status = frontmatter.status ?? ""
  const dateHuman = frontmatter.date_human ?? frontmatter.date_start ?? ""

  return (
    <div>
      <PagePathStatic path={`life/travel/${slug}`} />

      <PageHeader
        icon="✈️"
        title={displayTitle}
        description={dateHuman as string}
      />

      {/* Trip metadata */}
      <div className="flex flex-wrap gap-2 mb-6">
        {status && (
          <span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_STYLES[status as string] ?? "bg-notion-surface text-notion-muted border-notion-border"}`}>
            {status as string}
          </span>
        )}
        {dateHuman && (
          <span className="text-xs px-2.5 py-1 rounded-full border bg-notion-surface text-notion-muted border-notion-border">
            {dateHuman as string}
          </span>
        )}
      </div>

      {content.trim() ? (
        <div className="bg-notion-surface border border-notion-border rounded-xl p-6">
          <MarkdownRenderer content={content} />
        </div>
      ) : (
        <div className="bg-notion-surface border border-notion-border rounded-xl p-6 text-center">
          <p className="text-notion-muted text-sm">No details added yet.</p>
        </div>
      )}
    </div>
  )
}
