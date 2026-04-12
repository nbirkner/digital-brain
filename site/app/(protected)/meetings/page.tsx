import Link from "next/link"
import PageHeader from "@/components/layout/PageHeader"
import { getMarkdownFilesWithPending } from "@/lib/content"
import PagePathStatic from "@/components/layout/PagePathStatic"

export default async function MeetingsPage() {
  const allFiles = await getMarkdownFilesWithPending("work/notes")
  const totalCount = allFiles.length
  const shown = allFiles.slice(0, 50)

  return (
    <div>
      <PagePathStatic path="meetings" />
      <PageHeader
        icon="📅"
        title="Meetings"
        description={`${totalCount} meeting note${totalCount !== 1 ? "s" : ""} — captured automatically via the daily-meeting-summary automation.`}
      />

      {totalCount === 0 ? (
        <div className="mt-8 text-center py-12 text-notion-muted/60 text-sm">
          <p className="text-2xl mb-3">📅</p>
          <p className="font-medium">No meeting notes yet</p>
          <p className="mt-1 text-xs">Meeting notes are captured automatically via the daily-meeting-summary automation.</p>
        </div>
      ) : (
        <div>
          {totalCount > 50 && (
            <p className="text-xs text-notion-muted mb-3">{totalCount} total · showing 50 most recent</p>
          )}
          <div className="space-y-2 mt-4">
            {shown.map((f) => (
              <Link
                key={f.slug}
                href={`/meetings/${f.slug}`}
                className="block bg-notion-surface border border-notion-border rounded-xl px-4 py-3 hover:bg-notion-hover transition-colors"
              >
                <p className="text-sm font-semibold text-notion-text truncate">{f.displayTitle}</p>
                <p className="text-xs text-notion-muted mt-0.5 font-mono truncate">
                  {f.slug}{f.frontmatter.date && ` · ${f.frontmatter.date}`}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
