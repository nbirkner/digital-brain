import { getMarkdownFileWithPending, getMarkdownFiles } from "@/lib/content"
import PagePathStatic from "@/components/PagePathStatic"
import PageHeader from "@/components/PageHeader"
import MarkdownRenderer from "@/components/MarkdownRenderer"
import { notFound } from "next/navigation"


export const dynamicParams = false

export async function generateStaticParams() {
  const files = getMarkdownFiles("work/docs/workflow-improvements")
  return files.map(f => ({ slug: f.slug.split("/") }))
}

export default async function WorkWorkflowDetailPage({ params }: { params: { slug: string[] } }) {
  const slugPath = params.slug.join("/").replace(/\.md$/, "")
  const file = await getMarkdownFileWithPending(`work/docs/workflow-improvements/${slugPath}.md`)
  if (!file) notFound()

  return (
    <div>
      <PagePathStatic path={`work/workflow/${slugPath}`} />
      <PageHeader
        icon="⚙️"
        title={file.displayTitle}
        description={file.frontmatter.date || ""}
      />
      <div className="mt-6">
        <MarkdownRenderer content={file.content} />
      </div>
    </div>
  )
}
