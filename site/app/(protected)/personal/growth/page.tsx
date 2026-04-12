import Link from "next/link"
import PageHeader from "@/components/PageHeader"
import PagePathStatic from "@/components/PagePathStatic"
import LabelPageContent from "@/components/LabelPageContent"

const SECTIONS = [
  { href: "/goals", icon: "🎯", label: "Goals", description: "Quarterly intentions and life planning" },
  { href: "/learning", icon: "📖", label: "Learning", description: "Books, highlights, and courses" },
  { href: "/career-external", icon: "💼", label: "Career", description: "External career materials" },
  { href: "/personal/growth/spirituality", icon: "✨", label: "Spirituality", description: "Astrology, faith, and the inner life" },
  { href: "/life/philosophy", icon: "🌟", label: "Philosophy", description: "Values and guiding principles" },
]

export default function GrowthPage() {
  return (
    <div>
      <PagePathStatic path="personal/growth" />
      <PageHeader
        icon="🌱"
        title="Growth"
        description="Goals, learning, career, and the things that shape who you're becoming."
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="flex flex-col items-center gap-1.5 bg-notion-surface border border-notion-border rounded-xl p-3 hover:bg-notion-hover transition-colors text-center group"
          >
            <span className="text-2xl">{section.icon}</span>
            <span className="text-xs font-semibold text-notion-text group-hover:text-notion-accent transition-colors leading-tight">{section.label}</span>
          </Link>
        ))}
      </div>
      <LabelPageContent tagId="growth" />
    </div>
  )
}
