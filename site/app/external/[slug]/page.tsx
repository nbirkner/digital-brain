import { notFound } from "next/navigation"
import { getPageBySlug, getPublishedPrivatePages } from "@/data/external-published"
import { getMarkdownFile } from "@/lib/content"
import MarkdownRenderer from "@/components/MarkdownRenderer"

// Only statically generate slugs for published private pages.
// Dedicated pages (costa-rica, tms) are their own static directories — no conflict.
export async function generateStaticParams() {
  return getPublishedPrivatePages().map((p) => ({ slug: p.slug }))
}

export const dynamicParams = false

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ExternalSlugPage({ params }: Props) {
  const { slug } = await params
  const page = getPageBySlug(slug)

  // Must be a published private page — dedicated pages have their own directories
  if (!page || page.type !== "published") notFound()

  const file = getMarkdownFile(page.contentPath)
  if (!file) notFound()

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-3xl">{page.icon}</span>
          <h1 className="text-2xl font-bold text-notion-text">{file.displayTitle}</h1>
        </div>
        {(file.frontmatter.date || page.description) && (
          <p className="text-notion-muted text-sm">
            {file.frontmatter.date ?? page.description}
          </p>
        )}
      </div>

      <div className="bg-notion-surface border border-notion-border rounded-xl p-6">
        <MarkdownRenderer content={file.content} />
      </div>
    </div>
  )
}
