import { notFound } from "next/navigation"
import { getMarkdownFileWithPending, getMarkdownFiles } from "@/lib/content"
import MarkdownRenderer from "@/components/MarkdownRenderer"
import PagePathStatic from "@/components/PagePathStatic"


export const dynamicParams = false

export async function generateStaticParams() {
  const files = getMarkdownFiles("personal/docs/life/astrology")
  return files.map(f => ({ slug: f.slug }))
}

interface Props {
  params: { slug: string }
}

export default async function AstrologyDetailPage({ params }: Props) {
  const { slug } = params
  const file = await getMarkdownFileWithPending(`personal/docs/life/astrology/${slug}.md`)
  if (!file) notFound()

  const { frontmatter, content, displayTitle } = file
  const date = frontmatter.date || ""

  return (
    <div className="max-w-2xl mx-auto">
      <PagePathStatic path={`personal/growth/spirituality/astrology/${slug}`} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-notion-text tracking-tight">{displayTitle}</h1>
        <p className="text-xs text-notion-muted mt-1 font-mono">
          {slug}{date && ` · ${date}`}
        </p>
      </div>

      {content.trim() ? (
        <div className="bg-notion-surface border border-notion-border rounded-xl p-6">
          <MarkdownRenderer content={content} />
        </div>
      ) : (
        <div className="bg-notion-surface border border-notion-border rounded-xl p-6 text-center">
          <p className="text-notion-muted text-sm">No content added yet.</p>
        </div>
      )}
    </div>
  )
}
