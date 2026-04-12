import Link from "next/link"

interface PagePathStaticProps {
  path: string // e.g. "niki/health" or "life/travel"
}

// Date-like segments (YYYY, YYYY-MM, YYYY-MM-DD) are never routable pages
const isDateSegment = (seg: string) => /^\d{4}(-\d{2}(-\d{2})?)?$/.test(seg)

export default function PagePathStatic({ path }: PagePathStaticProps) {
  const segments = path.split("/").filter(Boolean)
  const crumbs = segments.map((seg, i) => ({
    label: seg.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
    isDate: isDateSegment(seg),
  }))

  return (
    <div className="flex items-center gap-1 mb-6 text-xs text-notion-muted font-mono flex-wrap">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {i > 0 && <span className="text-notion-muted/40">/</span>}
          {crumb.isLast || crumb.isDate ? (
            <span className={crumb.isLast ? "text-notion-text" : undefined}>{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-notion-accent transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </div>
  )
}
