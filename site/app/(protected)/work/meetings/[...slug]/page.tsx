import { getMarkdownFileWithPending, getMarkdownFiles } from "@/lib/content"
import PagePathStatic from "@/components/layout/PagePathStatic"
import ContentDetailPage from "@/components/features/content/ContentDetailPage"
import { notFound } from "next/navigation"


export const dynamicParams = false

export async function generateStaticParams() {
  const files = getMarkdownFiles("work/notes")
  return files.map(f => ({ slug: f.slug.split("/") }))
}

export default async function WorkMeetingDetailPage({ params }: { params: { slug: string[] } }) {
  const slugPath = params.slug.join("/").replace(/\.md$/, "")
  const file = await getMarkdownFileWithPending(`work/notes/${slugPath}.md`)
  if (!file) notFound()

  const slugFilename = slugPath.split("/").pop() ?? slugPath
  const contentWithoutTitle = file.content.replace(/^\s*#+\s+.+\n?/, "")

  return (
    <div>
      <PagePathStatic path={`work/meetings/${slugFilename}`} />
      <ContentDetailPage
        title={file.displayTitle}
        date={file.frontmatter.date || ""}
        tags={file.autoTags}
        content={contentWithoutTitle}
      />
    </div>
  )
}
