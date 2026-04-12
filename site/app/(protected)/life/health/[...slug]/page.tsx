import { getMarkdownFileWithPending, getMarkdownFiles } from "@/lib/content"
import PageHeader from "@/components/layout/PageHeader"
import PagePathStatic from "@/components/layout/PagePathStatic"
import MarkdownRenderer from "@/components/ui/MarkdownRenderer"
import { notFound } from "next/navigation"


export const dynamicParams = false

export async function generateStaticParams() {
  const files = getMarkdownFiles("personal/site/health")
  return files.map(f => ({ slug: f.slug.split("/") }))
}

interface Props {
  params: { slug: string[] }
}

export default async function HealthSiteDetailPage({ params }: Props) {
  const slugPath = params.slug.join("/").replace(/\.md$/, "")
  const file = await getMarkdownFileWithPending("personal/site/health/" + slugPath + ".md")
  if (!file) notFound()
  return (
    <div className="max-w-2xl mx-auto">
      <PagePathStatic path={"life/health/" + slugPath} />
      <PageHeader
        icon="💚"
        title={file.displayTitle}
        description={file.frontmatter.date || slugPath}
      />
      <div className="mt-6 bg-notion-surface border border-notion-border rounded-xl p-6">
        <MarkdownRenderer content={file.content} />
      </div>
    </div>
  )
}
