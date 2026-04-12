import { notFound } from "next/navigation"
import Link from "next/link"
import { getMarkdownFileWithPending, getMarkdownFilesWithPending, getMarkdownFiles } from "@/lib/content"
import MarkdownRenderer from "@/components/MarkdownRenderer"
import PagePathStatic from "@/components/PagePathStatic"


export const dynamicParams = false

export async function generateStaticParams() {
  const files = getMarkdownFiles("personal/docs/work")
  return files.map(f => ({ slug: f.slug.split("/") }))
}

interface Props {
  params: { slug: string[] }
}

// Section icons for breadcrumb labels
const SECTION_ICONS: Record<string, string> = {
  career: "🚀",
  together: "🤝",
  asana: "📋",
  peregrine: "🦅",
  "product-inspiration": "💡",
  "professional-development": "📚",
  ai: "🤖",
}

export default async function WorkDetailPage({ params }: Props) {
  const slugPath = params.slug.join("/").replace(/\.md$/, "")

  // Try direct file first
  let file = await getMarkdownFileWithPending(`personal/docs/work/${slugPath}.md`)

  // If not found, try index.md (for section landing pages)
  if (!file) {
    file = await getMarkdownFileWithPending(`personal/docs/work/${slugPath}/index.md`)
  }

  if (!file) notFound()

  // Build breadcrumb segments from slug
  const segments = params.slug
  const topSection = segments[0] ?? ""
  const sectionIcon = SECTION_ICONS[topSection] ?? "📄"

  // Get sibling entries if this is a top-level section (one segment deep)
  const isTopSection = segments.length === 1
  const siblings = isTopSection
    ? (await getMarkdownFilesWithPending(`personal/docs/work/${topSection}`))
        .filter((f) => !f.slug.includes("/"))  // only direct children
        .slice(0, 30)
    : []

  const { frontmatter, content, displayTitle } = file
  const notionId = frontmatter.notion_id || ""
  const notionSource = frontmatter.source || ""

  // Build metadata table rows (filter out internal fields)
  const metaRows = Object.entries(frontmatter).filter(
    ([k]) => !["title", "notion_id", "source"].includes(k) && frontmatter[k]
  )

  return (
    <div>
      <PagePathStatic path={`work/${slugPath}`} />

      {/* Back navigation */}
      <div className="flex items-center gap-2 mb-6 text-sm text-notion-muted">
        <Link href="/work" className="hover:text-notion-accent transition-colors">
          Work
        </Link>
        {segments.map((seg, i) => {
          const href = `/work/${segments.slice(0, i + 1).join("/")}`
          const isLast = i === segments.length - 1
          return (
            <span key={seg} className="flex items-center gap-2">
              <span className="opacity-40">/</span>
              {isLast ? (
                <span className="text-notion-text">{seg}</span>
              ) : (
                <Link href={href} className="hover:text-notion-accent transition-colors">
                  {seg}
                </Link>
              )}
            </span>
          )
        })}
      </div>

      {/* Page header */}
      <div className="mb-6">
        <div className="text-3xl mb-3">{sectionIcon}</div>
        <h1 className="text-2xl font-bold text-notion-text tracking-tight">{displayTitle}</h1>
        <div className="flex flex-wrap items-center gap-3 mt-2">
          {notionSource && (
            <a
              href={notionSource}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-notion-muted hover:text-notion-accent font-mono transition-colors"
            >
              View in Notion →
            </a>
          )}
          {notionId && (
            <span className="text-xs text-notion-muted font-mono opacity-50">{notionId}</span>
          )}
        </div>
      </div>

      {/* Metadata table */}
      {metaRows.length > 0 && (
        <div className="bg-notion-surface border border-notion-border rounded-xl p-4 mb-6">
          <table className="w-full text-sm">
            <tbody>
              {metaRows.map(([key, val]) => (
                <tr key={key} className="border-b border-notion-border last:border-0">
                  <td className="py-2 pr-4 text-notion-muted font-medium capitalize w-1/3">{key}</td>
                  <td className="py-2 text-notion-text">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Main content */}
      {content.trim() ? (
        <div className="bg-notion-surface border border-notion-border rounded-xl p-6 mb-6">
          <MarkdownRenderer content={content} />
        </div>
      ) : (
        <div className="bg-notion-surface border border-dashed border-notion-border rounded-xl p-6 mb-6 text-center">
          <p className="text-notion-muted text-sm">This page has no text content — it may be a container for subpages.</p>
        </div>
      )}

      {/* Subpage list (for section landing pages) */}
      {isTopSection && siblings.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-notion-muted uppercase tracking-wider mb-3">
            In this section
          </h2>
          <div className="space-y-2">
            {siblings.map((sibling) => {
              const siblingSlug = sibling.slug
              // sibling.slug is relative to the section dir, e.g. "performance-review-2025"
              return (
                <Link
                  key={siblingSlug}
                  href={`/work/${topSection}/${siblingSlug}`}
                  className="block bg-notion-surface border border-notion-border rounded-lg p-3 hover:bg-notion-hover transition-colors"
                >
                  <p className="text-sm font-semibold text-notion-text truncate">
                    {sibling.displayTitle}
                  </p>
                  <p className="text-xs text-notion-muted mt-0.5 font-mono truncate">
                    {topSection}/{siblingSlug}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
