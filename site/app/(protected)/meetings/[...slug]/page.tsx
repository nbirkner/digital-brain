import { notFound } from "next/navigation"
import { getMarkdownFileWithPending, getMarkdownFiles } from "@/lib/content"
import PagePathStatic from "@/components/PagePathStatic"
import ContentDetailPage from "@/components/ContentDetailPage"


export const dynamicParams = false

export async function generateStaticParams() {
  const files = getMarkdownFiles("personal/notes")
  return files.map(f => ({ slug: f.slug.split("/") }))
}

interface Props {
  params: { slug: string[] }
}

export default async function PersonalMeetingDetailPage({ params }: Props) {
  const slugPath = params.slug.join("/").replace(/\.md$/, "")
  const file = await getMarkdownFileWithPending(`personal/notes/${slugPath}.md`)

  if (!file) notFound()

  const contentWithoutTitle = file.content.replace(/^\s*#+\s+.+\n?/, "")

  return (
    <div className="max-w-2xl mx-auto">
      <PagePathStatic path={`notes/${slugPath}`} />
      <ContentDetailPage
        title={file.displayTitle}
        date={file.frontmatter.date || ""}
        tags={file.autoTags}
        content={contentWithoutTitle}
      />
    </div>
  )
}
