import { getMarkdownFilesWithPending } from "@/lib/content"
import Link from "next/link"
import PageHeader from "@/components/layout/PageHeader"
import PagePathStatic from "@/components/layout/PagePathStatic"
import EmptyState from "@/components/ui/EmptyState"


export default async function WorkCatchupPage() {
  const files = await getMarkdownFilesWithPending("work/docs/catchup")

  return (
    <div>
      <PagePathStatic path="work/catchup" />
      <PageHeader
        icon="🔄"
        title="Catch-up Notes"
        description={`${files.length} catch-up note${files.length !== 1 ? "s" : ""}`}
      />

      {files.length > 0 ? (
        <div className="space-y-2 mt-4">
          {files.map((f) => (
            <Link
              key={f.slug}
              href={`/work/catchup/${f.slug}`}
              className="block bg-notion-surface border border-notion-border rounded-lg p-3 hover:bg-notion-hover transition-colors"
            >
              <p className="text-sm font-semibold text-notion-text truncate">{f.displayTitle}</p>
              <p className="text-xs text-notion-muted font-mono mt-0.5 truncate">
                {f.slug}{f.frontmatter.date && ` · ${f.frontmatter.date}`}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🔄"
          message="No catch-up notes yet"
          hint="Run /catch-up in Claude Code to generate context recovery notes. They save to work/docs/catchup/."
        />
      )}
    </div>
  )
}
