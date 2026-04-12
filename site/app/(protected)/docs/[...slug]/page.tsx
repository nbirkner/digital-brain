import { notFound } from "next/navigation"
import { getMarkdownFile } from "@/lib/content"
import { getAllDocsIncludingHidden, getSubDocs } from "@/lib/docs"
import ContentDetailPage from "@/components/features/content/ContentDetailPage"
import SubDocsPanel from "@/components/features/content/SubDocsPanel"

export const dynamicParams = false

export async function generateStaticParams() {
  const docs = getAllDocsIncludingHidden()
  return docs.map((doc) => ({
    slug: doc.filePath.replace(/\.md$/, "").split("/"),
  }))
}

function buildBreadcrumbs(filePath: string): { label: string; href?: string }[] {
  const parts = filePath.replace(/\.md$/, "").split("/")
  const crumbs: { label: string; href?: string }[] = [{ label: "Docs", href: "/docs" }]
  const meaningfulParts = parts.slice(2)
  for (let i = 0; i < meaningfulParts.length - 1; i++) {
    const seg = meaningfulParts[i]
    crumbs.push({ label: seg.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) })
  }
  return crumbs
}

export default async function DocFullPage({ params }: { params: { slug: string[] } }) {
  const filePath = params.slug.join("/") + ".md"
  const file = getMarkdownFile(filePath)
  if (!file) notFound()

  const subDocs = getSubDocs(filePath)
  const crumbs = buildBreadcrumbs(filePath)

  // Strip H1 and "Reference Docs" section when sub-docs panel replaces it
  let content = file.content.replace(/^#+\s+.+\n?/, "")
  if (subDocs.length > 0) {
    content = content.replace(/\n*##\s+Reference Docs[\s\S]*$/, "")
  }

  const subDocItems = subDocs.map((sub) => ({
    title: sub.title,
    url: `/docs/${sub.filePath.replace(/\.md$/, "")}`,
    snippet: sub.snippet,
  }))

  return (
    <ContentDetailPage
      title={file.displayTitle}
      date={file.frontmatter.date || ""}
      breadcrumb={crumbs}
      tags={file.autoTags}
      content={content}
      beforeContent={<SubDocsPanel subDocs={subDocItems} />}
    />
  )
}
