import { getMarkdownFilesWithPending } from "@/lib/content"
import Link from "next/link"
import PageHeader from "@/components/PageHeader"
import PagePathStatic from "@/components/PagePathStatic"
import EmptyState from "@/components/EmptyState"


export default async function WorkWorkflowPage() {
  const files = await getMarkdownFilesWithPending("work/docs/workflow-improvements")

  return (
    <div>
      <PagePathStatic path="work/workflow" />
      <PageHeader
        icon="⚙️"
        title="Workflow"
        description={`${files.length} workflow note${files.length !== 1 ? "s" : ""}`}
      />

      {files.length > 0 ? (
        <div className="space-y-2 mt-4">
          {files.map((f) => (
            <Link
              key={f.slug}
              href={`/work/workflow/${f.slug}`}
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
          icon="⚙️"
          message="No workflow notes yet"
          hint="Workflow improvements and process notes save to work/docs/workflow-improvements/."
        />
      )}
    </div>
  )
}
