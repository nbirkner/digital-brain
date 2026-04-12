import Link from "next/link"

export interface NavSection {
  href: string
  icon: string
  label: string
  description: string
}

export default function SectionNavGrid({ items }: { items: NavSection[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((section) => (
        <Link
          key={section.href}
          href={section.href}
          className="flex items-start gap-3 bg-notion-surface hover:bg-notion-hover border border-notion-border rounded-xl p-4 transition-colors"
        >
          <span className="text-2xl shrink-0">{section.icon}</span>
          <div>
            <h3 className="font-semibold text-notion-text">{section.label}</h3>
            <p className="text-notion-muted text-sm mt-0.5">{section.description}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
