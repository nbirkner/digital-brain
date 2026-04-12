import { getMarkdownFileWithPending, getMarkdownFiles } from "@/lib/content"
import PageHeader from "@/components/PageHeader"
import PagePathStatic from "@/components/PagePathStatic"
import MarkdownRenderer from "@/components/MarkdownRenderer"
import { notFound } from "next/navigation"


export const dynamicParams = false

export async function generateStaticParams() {
  const files = getMarkdownFiles("personal/docs/career")
  return files.map(f => ({ slug: f.slug.split("/") }))
}

interface Props {
  params: { slug: string[] }
}

export default async function CareerDetailPage({ params }: Props) {
  const slug = params.slug.join("/")
  const file = await getMarkdownFileWithPending("personal/docs/career/" + slug + ".md")
  if (!file) notFound()
  return (
    <div className="max-w-2xl mx-auto">
      <PagePathStatic path={"personal/development/career/" + slug} />
      <PageHeader
        icon="💼"
        title={file.displayTitle}
        description={file.frontmatter.date || slug}
      />
      <div className="mt-6 bg-notion-surface border border-notion-border rounded-xl p-6">
        <MarkdownRenderer content={file.content} />
      </div>
    </div>
  )
}
