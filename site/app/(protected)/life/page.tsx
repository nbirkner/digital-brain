import Link from "next/link"
import PageHeader from "@/components/layout/PageHeader"
import PagePathStatic from "@/components/layout/PagePathStatic"

const SECTIONS = [
  { href: "/life/housing", icon: "🏠", label: "Housing", description: "Pacific Heights, SF" },
  { href: "/life/cars", icon: "🚗", label: "Cars", description: "Corolla & Infiniti QX30" },
  { href: "/life/luci", icon: "🐱", label: "Luci", description: "The kitty" },
  { href: "/life/finances", icon: "💰", label: "Finances", description: "Budget, net worth, savings" },
  { href: "/life/travel", icon: "✈️", label: "Travel", description: "Trips and adventures" },
]

export default function LifePage() {
  return (
    <div>
      <PagePathStatic path="life" />
      <PageHeader
        icon="🗂️"
        title="Life Admin"
        description="Housing, logistics, money, and the practical stuff."
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
