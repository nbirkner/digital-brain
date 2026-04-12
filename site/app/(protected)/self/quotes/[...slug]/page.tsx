import { notFound } from "next/navigation"
import { getMarkdownFileWithPending, getMarkdownFiles } from "@/lib/content"
import MarkdownRenderer from "@/components/ui/MarkdownRenderer"
import PagePathStatic from "@/components/layout/PagePathStatic"


export const dynamicParams = false

export async function generateStaticParams() {
  const files = getMarkdownFiles("personal/docs/library/quotes")
  return files.map(f => ({ slug: f.slug.split("/") }))
}

interface Props {
  params: { slug: string[] }
}

export default async function QuoteDetailPage({ params }: Props) {
  const slugPath = params.slug.join("/")
  const file = await getMarkdownFileWithPending(`personal/docs/library/quotes/${slugPath}.md`)
  if (!file) notFound()

  const { frontmatter, content, displayTitle } = file
  const date = frontmatter.date || ""
  const source = frontmatter.source || frontmatter.author || ""

  return (
    <div className="max-w-2xl mx-auto">
      <PagePathStatic path={`niki/quotes/${slugPath}`} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-notion-text tracking-tight">{displayTitle}</h1>
        <p className="text-xs text-notion-muted mt-1 font-mono">
          {slugPath}{source && ` · ${source}`}{date && ` · ${date}`}
        </p>
      </div>

      {content.trim() ? (
        <div className="bg-notion-surface border border-notion-border rounded-xl p-6">
          <MarkdownRenderer content={content} />
        </div>
      ) : (
        <div className="bg-notion-surface border border-notion-border rounded-xl p-6 text-center">
          <p className="text-notion-muted text-sm">No content yet.</p>
        </div>
      )}
    </div>
  )
}
