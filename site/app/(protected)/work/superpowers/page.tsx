import { getMarkdownFilesWithPending } from "@/lib/content"
import Link from "next/link"
import PageHeader from "@/components/PageHeader"
import PagePathStatic from "@/components/PagePathStatic"
import EmptyState from "@/components/EmptyState"


export default async function WorkSuperpowersPage() {
  const files = await getMarkdownFilesWithPending("work/docs/superpowers")

  return (
    <div>
      <PagePathStatic path="work/superpowers" />
      <PageHeader
        icon="⚡"
        title="Superpowers"
        description={`${files.length} superpower doc${files.length !== 1 ? "s" : ""}`}
      />

      {files.length > 0 ? (
        <div className="space-y-2 mt-4">
          {files.map((f) => (
            <Link
              key={f.slug}
              href={`/work/superpowers/${f.slug}`}
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
          icon="⚡"
          message="No superpowers docs yet"
          hint="Superpowers framework docs save to work/docs/superpowers/."
        />
      )}
    </div>
  )
}
