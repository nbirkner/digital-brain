import Link from "next/link"

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface PagePathStaticProps {
  // New: explicit items array (preferred — no URL parsing)
  items?: BreadcrumbItem[]
  // Legacy: path string (kept for backward compat — pages not yet migrated)
  path?: string
  title?: string
}

// Date-like segments (YYYY, YYYY-MM, YYYY-MM-DD) are never routable pages
const isDateSegment = (seg: string) => /^\d{4}(-\d{2}(-\d{2})?)?$/.test(seg)

// Accordion-only sections — exist in the sidebar but have no routable page
const NO_LINK_PATHS = new Set([
  "self",
  "personal/growth",
  "personal/development",
  "life",
  "personal/life-admin",
])

// URL namespace prefixes that should be hidden from breadcrumbs entirely
const SKIP_SEGMENTS = new Set(["personal"])

function renderCrumbs(crumbs: Array<{ label: string; href?: string; isLast: boolean }>) {
  return (
    <div className="flex items-center gap-1 mb-6 text-xs text-notion-muted font-mono flex-wrap">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-notion-muted/40">/</span>}
          {crumb.isLast || !crumb.href ? (
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

export default function PagePathStatic({ items, path, title }: PagePathStaticProps) {
  // Prefer explicit items when provided
  if (items && items.length > 0) {
    const crumbs = items.map((item, i) => ({
      label: item.label,
      href: item.href,
      isLast: i === items.length - 1,
    }))
    return renderCrumbs(crumbs)
  }

  // Backward compat: parse path string
  const segments = (path ?? "").split("/").filter(Boolean)
  // Build full path info for every segment first, then filter out skipped ones
  const withPaths = segments.map((seg, i) => ({
    seg,
    segPath: segments.slice(0, i + 1).join("/"),
  }))
  const visible = withPaths.filter(({ seg }) => !SKIP_SEGMENTS.has(seg))
  const crumbs = visible.map(({ seg, segPath }, i) => {
    const isLast = i === visible.length - 1
    const defaultLabel = seg.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    const isDate = isDateSegment(seg)
    const isNoLink = NO_LINK_PATHS.has(segPath)
    return {
      label: isLast && title ? title : defaultLabel,
      href: isDate || isNoLink ? undefined : "/" + segPath,
      isLast,
    }
  })

  return renderCrumbs(crumbs)
}
