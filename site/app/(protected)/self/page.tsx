import Link from "next/link"
import PageHeader from "@/components/layout/PageHeader"
import PagePathStatic from "@/components/layout/PagePathStatic"

const SECTIONS = [
  { href: "/self/health", icon: "🌿", label: "Health", description: "Medical records, wellness" },
  { href: "/self/relationship", icon: "❤️", label: "Relationship", description: "Personal" },
  { href: "/self/routine", icon: "🧘", label: "Routine", description: "Daily and weekly rhythms" },
  { href: "/self/beauty", icon: "💅", label: "Beauty", description: "Hair, skincare, makeup" },
]

export default function NikiPage() {
  return (
    <div>
      <PagePathStatic path="niki" />
      <PageHeader
        icon="🪞"
        title="Self"
        description="Health, relationships, daily practices, and personal care."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="flex items-start gap-3 bg-notion-surface hover:bg-notion-hover border border-notion-border rounded-xl p-4 transition-colors"
          >
            <span className="text-2xl">{section.icon}</span>
            <div>
              <h3 className="font-semibold text-notion-text">{section.label}</h3>
              <p className="text-notion-muted text-sm mt-0.5">{section.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
