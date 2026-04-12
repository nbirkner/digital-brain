import Link from "next/link"
import MarkdownRenderer from "@/components/ui/MarkdownRenderer"
import { getTagDef } from "@/lib/tag-taxonomy"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface ContentDetailPageProps {
  title: string
  date?: string
  breadcrumb?: BreadcrumbItem[]
  tags?: string[]
  content: string
  beforeContent?: React.ReactNode
  children?: React.ReactNode
}

export default function ContentDetailPage({
  title,
  date,
  breadcrumb,
  tags,
  content,
  beforeContent,
  children,
}: ContentDetailPageProps) {
  const hasTags = tags && tags.length > 0

  return (
    <div>
      {/* Breadcrumb */}
      {breadcrumb && breadcrumb.length > 0 && (
        <div className="flex items-center gap-1 mb-6 text-xs text-notion-muted font-mono flex-wrap">
          {breadcrumb.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-notion-muted/40">/</span>}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-notion-accent transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-notion-muted/60">{crumb.label}</span>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Title + date + tags */}
      <div className="mb-8 pb-6 border-b border-notion-border/40">
        <h1
          className="text-3xl font-bold text-notion-text tracking-tight"
          style={{ fontFamily: "var(--font-display, var(--font-sans))" }}
        >
          {title}
        </h1>

        {date && (
          <p className="text-notion-muted text-sm leading-relaxed mt-1">{date}</p>
        )}

        {hasTags && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            {tags.filter((id) => id !== "doc").map((tagId) => {
              const def = getTagDef(tagId)
              return (
                <Link
                  key={tagId}
                  href={`/labels/${tagId}`}
                  className={`inline-flex items-center rounded-md font-medium px-2 py-1 text-xs transition-opacity hover:opacity-80 ${def.color}`}
                  title={`${def.category}: ${def.label}`}
                >
                  {def.label}
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Before content slot (e.g. sub-docs cards) */}
      {beforeContent}

      {/* Content */}
      <div className="mt-6">
        <MarkdownRenderer content={content} />
      </div>

      {/* Extras (prev/next nav, etc.) */}
      {children}
    </div>
  )
}
