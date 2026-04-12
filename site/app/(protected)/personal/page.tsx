import { Suspense } from "react"
import PageHeader from "@/components/PageHeader"
import PagePathStatic from "@/components/PagePathStatic"
import HomeTasksWidget from "@/components/HomeTasksWidget"
import { RecentContentServer } from "@/components/RecentContent"
import SectionNavGrid, { type NavSection } from "@/components/SectionNavGrid"

export const dynamic = "force-dynamic"

const EXPLORE_SECTIONS: NavSection[] = [
  { href: "/life/finances", icon: "💰", label: "Finances", description: "Budget, investments, and financial planning." },
  { href: "/life/travel", icon: "✈️", label: "Travel", description: "Trip planning, bookings, and travel notes." },
  { href: "/personal/health", icon: "💚", label: "Health", description: "Wellness, routines, and body." },
  { href: "/career-external", icon: "💼", label: "Career", description: "External career and opportunities." },
  { href: "/personal/growth/spirituality", icon: "🙏", label: "Spirituality", description: "Faith, prayer, and inner life." },
  { href: "/personal/external", icon: "🔗", label: "External", description: "Public pages and shareable links." },
]

export default function PersonalPage() {
  return (
    <div>
      <PagePathStatic path="personal" />
      <PageHeader
        icon="👤"
        title="Personal"
        description="Your inner world — health, growth, spirit, and depth."
      />

      {/* Tasks */}
      <div className="mb-10">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-notion-muted/60 mb-4">
          Tasks
        </h2>
        <Suspense fallback={null}>
          <HomeTasksWidget filter="personal" />
        </Suspense>
      </div>

      {/* Related */}
      <div className="mb-10">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-notion-muted/60 mb-4">
          Related
        </h2>
        <RecentContentServer domain="personal" />
      </div>

      {/* Explore */}
      <div className="mb-10">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-notion-muted/60 mb-4">
          Explore
        </h2>
        <SectionNavGrid items={EXPLORE_SECTIONS} />
      </div>
    </div>
  )
}
