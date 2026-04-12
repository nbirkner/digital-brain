import { getMarkdownFileWithPending, getMarkdownFiles } from "@/lib/content"
import { getSubDocs } from "@/lib/docs"
import PagePathStatic from "@/components/layout/PagePathStatic"
import PageHeader from "@/components/layout/PageHeader"
import MarkdownRenderer from "@/components/ui/MarkdownRenderer"
import SubDocsPanel from "@/components/features/content/SubDocsPanel"
import { notFound } from "next/navigation"

export const dynamicParams = false

export async function generateStaticParams() {
  const files = getMarkdownFiles("work/docs/analyses")
  return files.map(f => ({ slug: f.slug.split("/") }))
}

export default async function WorkAnalysisDetailPage({ params }: { params: { slug: string[] } }) {
  const slugPath = params.slug.join("/").replace(/\.md$/, "")
  const file = await getMarkdownFileWithPending(`work/docs/analyses/${slugPath}.md`)
  if (!file) notFound()

  const thisFilePath = `work/docs/analyses/${slugPath}.md`
  const subDocs = getSubDocs(thisFilePath)

  const subDocItems = subDocs.map((sub) => ({
    title: sub.title,
    url: `/work/analyses/${sub.slug}`,
    snippet: sub.snippet,
  }))

  return (
    <div>
      <PagePathStatic path={`work/analyses/${slugPath}`} />
      <PageHeader
        icon="📊"
        title={file.displayTitle}
        description={file.frontmatter.date || ""}
      />
      <SubDocsPanel subDocs={subDocItems} />
      <div className="mt-2">
        <MarkdownRenderer content={file.content} />
      </div>
    </div>
  )
}
