import { notFound } from "next/navigation"
import { getMarkdownFileWithPending, getMarkdownFiles } from "@/lib/content"
import MarkdownRenderer from "@/components/ui/MarkdownRenderer"
import PagePathStatic from "@/components/layout/PagePathStatic"


export const dynamicParams = false

export async function generateStaticParams() {
  const files = getMarkdownFiles("shared/housing")
  return files.map(f => ({ slug: f.slug.split("/") }))
}

interface Props {
  params: { slug: string[] }
}

const SKIP_FRONTMATTER_KEYS = ["title", "notion_id", "source"]

export default async function HousingDetailPage({ params }: Props) {
  const slugPath = params.slug.join("/").replace(/\.md$/, "")
  const file = await getMarkdownFileWithPending(`shared/housing/${slugPath}.md`)

  if (!file) notFound()

  const metaEntries = Object.entries(file.frontmatter).filter(
    ([key]) => !SKIP_FRONTMATTER_KEYS.includes(key) && file.frontmatter[key]
  )

  return (
    <div className="max-w-2xl mx-auto">
      <PagePathStatic path={`life/housing/${slugPath}`} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-notion-text tracking-tight">
          {file.frontmatter.title || file.displayTitle}
        </h1>
        {file.frontmatter.source && (
          <a
            href={file.frontmatter.source}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-notion-muted hover:text-notion-accent transition-colors mt-1 inline-block"
          >
            View in Notion ↗
          </a>
        )}
      </div>

      {metaEntries.length > 0 && (
        <div className="bg-notion-surface border border-notion-border rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-notion-muted uppercase tracking-wide mb-3">Details</h2>
          <div className="space-y-2">
            {metaEntries.map(([key, value]) => (
              <div key={key} className="flex justify-between gap-4 py-1.5 border-b border-notion-border last:border-0 text-sm">
                <span className="text-notion-muted capitalize">{key.replace(/_/g, " ")}</span>
                <span className="text-notion-text text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-notion-surface border border-notion-border rounded-xl p-6">
        <MarkdownRenderer content={file.content} />
      </div>
    </div>
  )
}
