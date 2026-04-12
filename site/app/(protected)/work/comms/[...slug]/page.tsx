import { getMarkdownFileWithPending, getMarkdownFiles } from "@/lib/content"
import PagePathStatic from "@/components/layout/PagePathStatic"
import PageHeader from "@/components/layout/PageHeader"
import MarkdownRenderer from "@/components/ui/MarkdownRenderer"
import { notFound } from "next/navigation"


export const dynamicParams = false

export async function generateStaticParams() {
  const files = getMarkdownFiles("work/docs/comms")
  return files.map(f => ({ slug: f.slug.split("/") }))
}

export default async function WorkCommsDetailPage({ params }: { params: { slug: string[] } }) {
  const slugPath = params.slug.join("/").replace(/\.md$/, "")
  const file = await getMarkdownFileWithPending(`work/docs/comms/${slugPath}.md`)
  if (!file) notFound()

  return (
    <div>
      <PagePathStatic path={`work/comms/${slugPath}`} />
      <PageHeader
        icon="📣"
        title={file.displayTitle}
        description={file.frontmatter.date || ""}
      />
      <div className="mt-6">
        <MarkdownRenderer content={file.content} />
      </div>
    </div>
  )
}
