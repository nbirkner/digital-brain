import { getMarkdownFileWithPending, getMarkdownFiles } from "@/lib/content"
import PageHeader from "@/components/PageHeader"
import PagePathStatic from "@/components/PagePathStatic"
import MarkdownRenderer from "@/components/MarkdownRenderer"
import { notFound } from "next/navigation"


export const dynamicParams = false

export async function generateStaticParams() {
  const files = getMarkdownFiles("shared/luci")
  return files.map(f => ({ slug: f.slug }))
}

interface Props {
  params: { slug: string }
}

export default async function LuciDetailPage({ params }: Props) {
  const file = await getMarkdownFileWithPending("shared/luci/" + params.slug + ".md")
  if (!file) notFound()
  return (
    <div className="max-w-2xl mx-auto">
      <PagePathStatic path={"life/luci/" + params.slug} />
      <PageHeader
        icon="🐱"
        title={file.displayTitle}
        description={file.frontmatter.date || params.slug}
      />
      <div className="mt-6 bg-notion-surface border border-notion-border rounded-xl p-6">
        <MarkdownRenderer content={file.content} />
      </div>
    </div>
  )
}
