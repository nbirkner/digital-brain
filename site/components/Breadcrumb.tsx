import Link from "next/link"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-0 mb-6 flex-wrap" aria-label="Breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={i} className="flex items-center">
            {i > 0 && (
              <span className="text-notion-muted/30 mx-1.5 text-xs">·</span>
            )}
            {isLast || !item.href ? (
              <span className={isLast ? "text-xs text-notion-muted font-medium" : "text-xs text-notion-muted/60"}>
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-xs text-notion-muted/60 hover:text-notion-muted transition-colors"
              >
                {item.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
