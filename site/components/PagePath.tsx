'use client'
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function PagePath() {
  const pathname = usePathname()
  const segments = pathname.replace(/^\//, "").split("/").filter(Boolean)

  const crumbs = segments.map((seg, i) => ({
    label: seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }))

  return (
    <div className="flex items-center gap-1 mb-6 text-xs text-notion-muted font-mono flex-wrap">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {i > 0 && <span className="text-notion-muted/40">/</span>}
          {crumb.isLast ? (
            <span className="text-notion-text">{crumb.label}</span>
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
