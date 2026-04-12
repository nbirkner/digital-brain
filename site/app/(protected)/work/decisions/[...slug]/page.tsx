import { getMarkdownFileWithPending, getMarkdownFiles } from "@/lib/content"
import PagePathStatic from "@/components/layout/PagePathStatic"
import PageHeader from "@/components/layout/PageHeader"
import MarkdownRenderer from "@/components/ui/MarkdownRenderer"
import { notFound } from "next/navigation"


export const dynamicParams = false

export async function generateStaticParams() {
  const files = getMarkdownFiles("work/docs/decisions")
  return files.map(f => ({ slug: f.slug.split("/") }))
}

export default async function WorkDecisionDetailPage({ params }: { params: { slug: string[] } }) {
  const slugPath = params.slug.join("/").replace(/\.md$/, "")
  const file = await getMarkdownFileWithPending(`work/docs/decisions/${slugPath}.md`)
  if (!file) notFound()

  return (
    <div>
      <PagePathStatic path={`work/decisions/${slugPath}`} />
      <PageHeader
        icon="⚖️"
        title={file.displayTitle}
        description={file.frontmatter.date || ""}
      />
      <div className="mt-6">
        <MarkdownRenderer content={file.content} />
      </div>
    </div>
  )
}
