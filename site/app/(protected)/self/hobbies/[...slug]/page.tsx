import { notFound } from "next/navigation"
import { getMarkdownFileWithPending, getMarkdownFiles } from "@/lib/content"
import MarkdownRenderer from "@/components/ui/MarkdownRenderer"
import PagePathStatic from "@/components/layout/PagePathStatic"


export const dynamicParams = false

export async function generateStaticParams() {
  const files = getMarkdownFiles("personal/docs/hobbies")
  return files.map(f => ({ slug: f.slug.split("/") }))
}

interface Props {
  params: Promise<{ slug: string[] }>
}

const SKIP_FIELDS = new Set(["title", "notion_id", "source"])

export default async function HobbyDetailPage({ params }: Props) {
  const { slug } = await params
  const slugPath = slug.join("/").replace(/\.md$/, "")
  const file = await getMarkdownFileWithPending(`personal/docs/hobbies/${slugPath}.md`)

  if (!file) notFound()

  const metaFields = Object.entries(file.frontmatter).filter(([key]) => !SKIP_FIELDS.has(key))

  return (
    <div className="max-w-2xl mx-auto">
      <PagePathStatic path={`niki/hobbies/${slugPath}`} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-notion-text tracking-tight">{file.displayTitle}</h1>
      </div>

      {metaFields.length > 0 && (
        <div className="bg-notion-surface border border-notion-border rounded-xl p-5 mb-6">
          <h2 className="text-xs font-semibold text-notion-muted uppercase tracking-wider mb-3">Details</h2>
          <div className="space-y-2">
            {metaFields.map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm gap-4">
                <span className="text-notion-muted shrink-0">{key}</span>
                <span className="text-notion-text font-mono text-right break-all">{value}</span>
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
