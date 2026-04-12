import { Suspense } from "react"
import PageHeader from "@/components/PageHeader"
import PagePathStatic from "@/components/PagePathStatic"
import HomeTasksWidget from "@/components/HomeTasksWidget"
import { RecentContentServer } from "@/components/RecentContent"
import SectionNavGrid, { type NavSection } from "@/components/SectionNavGrid"

export const dynamic = "force-dynamic"

const EXPLORE_SECTIONS: NavSection[] = [
  {
    href: "/work/docs",
    icon: "📄",
    label: "Docs",
    description: "PRDs, decisions, analyses, and all work documents.",
  },
  {
    href: "/work/meetings",
    icon: "🗓️",
    label: "Meetings",
    description: "Meeting notes and syncs.",
  },
  {
    href: "/work/prds",
    icon: "📋",
    label: "PRDs",
    description: "Product requirements and specs.",
  },
  {
    href: "/work/strategy",
    icon: "🎯",
    label: "Strategy",
    description: "Roadmaps, OKRs, and strategic context.",
  },
  {
    href: "/work/career",
    icon: "🚀",
    label: "Career",
    description: "Philosophy, superpowers, job history, and what's next.",
  },
  {
    href: "/work/comms",
    icon: "📢",
    label: "Comms",
    description: "Weekly plans, reviews, and status updates.",
  },
]

export default function WorkPage() {
  return (
    <div>
      <PagePathStatic path="work" />
      <PageHeader
        icon="💼"
        title="Work"
        description="Together AI, career, Asana, Peregrine, and professional life."
      />

      {/* Together AI context card */}
      <div className="bg-notion-surface border border-notion-border rounded-xl p-5 mb-8">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🤝</span>
          <div className="flex-1">
            <h3 className="font-semibold text-notion-text">Together AI</h3>
            <p className="text-notion-muted text-sm mt-1">
              PM at Together AI — the cloud platform for open-source AI. Building enterprise billing, IAM, and developer experience.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {["Orgs & Projects", "Enterprise Contract Policy", "ACH Payments", "UMS OIDC", "GPU Pricing"].map((tag) => (
                <span key={tag} className="text-xs bg-notion-hover border border-notion-border rounded px-2 py-1 text-notion-muted">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="mb-10">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-notion-muted/60 mb-4">
          Tasks
        </h2>
        <Suspense fallback={null}>
          <HomeTasksWidget filter="work" />
        </Suspense>
      </div>

      {/* Related */}
      <div className="mb-10">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-notion-muted/60 mb-4">
          Related
        </h2>
        <RecentContentServer domain="work" />
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
