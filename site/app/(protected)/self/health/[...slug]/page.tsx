import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getMarkdownFileWithPending, getMarkdownFiles } from "@/lib/content"
import MarkdownRenderer from "@/components/ui/MarkdownRenderer"
import PagePathStatic from "@/components/layout/PagePathStatic"

export const dynamicParams = false

export async function generateStaticParams() {
  const files = getMarkdownFiles("personal/docs/health")
  return files.map(f => ({ slug: f.slug.split("/") }))
}

interface Props {
  params: { slug: string[] }
}

const FRONTMATTER_LABELS: Record<string, string> = {
  title: "Title",
  date: "Date",
  notion_id: "Notion ID",
  source: "Source",
  type: "Type",
  parent: "Parent",
}

// Human-readable section labels for breadcrumb
const SECTION_LABELS: Record<string, string> = {
  longevity: "Longevity",
  "fitness-diet": "Fitness & Diet",
  "health-care": "Health Care",
  "mental-health": "Mental Health",
  "physical-therapy": "Physical Therapy",
  "gut-health-gi": "Gut Health / GI",
  "dental-health": "Dental Health",
}

// Detect if a slug is a top-level section (direct child of Health root)
const TOP_LEVEL_SECTIONS = new Set(Object.keys(SECTION_LABELS))

// Extract image paths from markdown content
function extractImages(content: string): string[] {
  const regex = /!\[.*?\]\((\/images\/health\/[^)]+)\)/g
  const results: string[] = []
  let m: RegExpExecArray | null
  while ((m = regex.exec(content)) !== null) results.push(m[1])
  return results
}

// Extract subpage links from markdown content
function extractSubpageLinks(content: string): { label: string; href: string }[] {
  const regex = /\*\*\[(.+?)\]\((\/self\/health\/[^)]+)\)\*\*/g
  const results: { label: string; href: string }[] = []
  let m: RegExpExecArray | null
  while ((m = regex.exec(content)) !== null) results.push({ label: m[1], href: m[2] })
  return results
}


export default async function HealthDetailPage({ params }: Props) {
  const slugPath = params.slug.join("/").replace(/\.md$/, "")
  const file = await getMarkdownFileWithPending(`personal/docs/health/${slugPath}.md`)

  if (!file) notFound()

  const { frontmatter, content, displayTitle } = file

  // Filter out fields that are not useful to display
  const metaFields = Object.entries(frontmatter).filter(
    ([key, val]) => key !== "title" && key !== "icon" && val && val.length > 0
  )

  const images = extractImages(content)
  const subpageLinks = extractSubpageLinks(content)

  // Determine the parent section for breadcrumb
  const parentSection = TOP_LEVEL_SECTIONS.has(slugPath) ? null : (() => {
    // Check frontmatter parent field first
    if (frontmatter.parent && SECTION_LABELS[frontmatter.parent]) {
      return { slug: frontmatter.parent, label: SECTION_LABELS[frontmatter.parent] }
    }
    // Otherwise show generic "Health" breadcrumb
    return null
  })()

  // Strip the subpage link markers from content so MarkdownRenderer doesn't double-render
  // (they're already rendered as cards below)
  const cleanContent = content
    .replace(/\*\*\[.+?\]\(\/self\/health\/.+?\)\*\*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

  return (
    <div className="max-w-3xl">
      <PagePathStatic path={`self/health/${slugPath}`} />

      {/* Title */}
      <h1 className="text-2xl font-bold text-notion-text tracking-tight mb-6">
        {displayTitle}
      </h1>

      {/* Metadata table */}
      {metaFields.length > 0 && (
        <div className="bg-notion-surface border border-notion-border rounded-xl p-4 mb-6">
          <table className="w-full text-xs">
            <tbody>
              {metaFields.map(([key, val]) => (
                <tr key={key} className="border-b border-notion-border last:border-0">
                  <td className="py-1.5 pr-4 text-notion-muted font-medium w-28 shrink-0">
                    {FRONTMATTER_LABELS[key] ?? key}
                  </td>
                  <td className="py-1.5 text-notion-text break-all">
                    {key === "source" ? (
                      <a
                        href={val}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-notion-accent hover:underline"
                      >
                        Open in Notion
                      </a>
                    ) : key === "notion_id" ? (
                      <span className="font-mono text-notion-muted">{val}</span>
                    ) : (
                      val
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Images at top of page (inline images render inside MarkdownRenderer too) */}
      {images.length > 0 && !cleanContent.includes("/images/health/") && (
        <div className="grid gap-4 mb-6">
          {images.map((src, i) => (
            <div
              key={i}
              className="bg-notion-surface border border-notion-border rounded-xl overflow-hidden"
            >
              <Image
                src={src}
                alt={`Image ${i + 1}`}
                width={800}
                height={600}
                className="w-full h-auto object-contain"
                unoptimized
              />
            </div>
          ))}
        </div>
      )}

      {/* Main content */}
      {cleanContent && (
        <div className="bg-notion-surface border border-notion-border rounded-xl p-6 mb-6">
          <MarkdownRenderer content={cleanContent} />
        </div>
      )}

      {/* Subpage cards */}
      {subpageLinks.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-notion-muted uppercase tracking-wider mb-3">
            Subpages
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {subpageLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 bg-notion-surface border border-notion-border rounded-lg px-4 py-3 hover:border-notion-accent/40 hover:bg-notion-hover transition-colors group"
              >
                <span className="text-sm text-notion-text group-hover:text-notion-accent transition-colors flex-1">
                  {link.label}
                </span>
                <svg
                  className="w-3.5 h-3.5 text-notion-muted group-hover:text-notion-accent transition-colors shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
