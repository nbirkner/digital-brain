import Link from "next/link"
import PageHeader from "@/components/layout/PageHeader"
import { getMarkdownFilesIndex } from "@/lib/content"

const AREA_CONFIG: Record<string, { label: string; icon: string; routePrefix: string; dirPrefix: string }> = {
  travel:   { label: "Travel",   icon: "✈️",  routePrefix: "/life/travel",   dirPrefix: "shared/travel/trips/" },
  housing:  { label: "Housing",  icon: "🏠",  routePrefix: "/life/housing",  dirPrefix: "shared/housing/" },
  health:   { label: "Health",   icon: "💚",  routePrefix: "/life/health",   dirPrefix: "personal/site/health/" },
  finances: { label: "Finances", icon: "💸",  routePrefix: "/life/finances", dirPrefix: "shared/finances/" },
  cars:     { label: "Cars",     icon: "🚗",  routePrefix: "/life/cars",     dirPrefix: "shared/cars/" },
  pet:      { label: "Pet",      icon: "🐾",  routePrefix: "/life/luci",     dirPrefix: "shared/luci/" },
}

interface PageEntry {
  href: string
  title: string
  date?: string
}

export default function PagesPage() {
  const allFiles = getMarkdownFilesIndex("shared")

  const grouped: Record<string, PageEntry[]> = {}

  for (const file of allFiles) {
    // Skip index/README files
    const baseName = file.slug.split("/").pop() ?? file.slug
    if (baseName === "index" || baseName === "README") continue

    // Skip hidden files
    if (file.frontmatter?.hidden === "true" || (file.frontmatter?.hidden as unknown) === true) continue

    // Find matching area
    let matched = false
    for (const [areaKey, config] of Object.entries(AREA_CONFIG)) {
      if (file.filePath.startsWith(config.dirPrefix)) {
        const relative = file.filePath.slice(config.dirPrefix.length).replace(/\.md$/, "")
        const href = `${config.routePrefix}/${relative}`
        const title = file.frontmatter?.title ?? file.displayTitle ?? file.slug

        if (!grouped[areaKey]) grouped[areaKey] = []
        grouped[areaKey].push({
          href,
          title,
          date: file.frontmatter?.date ?? file.frontmatter?.created,
        })
        matched = true
        break
      }
    }

    if (!matched) continue
  }

  return (
    <div>
      <PageHeader icon="📋" title="Pages" description="Personal reference pages, grouped by area." />
      <div className="space-y-8">
        {Object.entries(AREA_CONFIG).map(([areaKey, config]) => {
          const pages = grouped[areaKey] ?? []
          if (pages.length === 0) return null
          return (
            <section key={areaKey}>
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-notion-muted/40 mb-3 border-b border-notion-border/20 pb-2">
                {config.icon} {config.label}
              </h2>
              <div className="space-y-0.5">
                {pages.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-notion-hover transition-colors group"
                  >
                    <span className="text-sm text-notion-text group-hover:text-notion-text/80 truncate">{page.title}</span>
                    {page.date && (
                      <span className="text-xs text-notion-muted/50 ml-auto flex-shrink-0">{page.date}</span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
