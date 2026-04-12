import Link from "next/link"
import PageHeader from "@/components/layout/PageHeader"
import { getMarkdownFileWithPending } from "@/lib/content"
import PagePathStatic from "@/components/layout/PagePathStatic"
import LabelPageContent from "@/components/features/notes/LabelPageContent"

// Top-level sections sourced directly from the Notion page tree
const HEALTH_SECTIONS = [
  {
    icon: "🌿",
    label: "Longevity",
    slug: "longevity",
    description: "Genetic profile, supplement stack, and lab results",
    subpages: [
      { label: "Niki's Health Reference Guide", slug: "health-reference-guide" },
      { label: "23andMe Genetics", slug: "23andme-genetics" },
      { label: "23andMe ↔ Function Health", slug: "23andme-function-health-crossref" },
      { label: "Function Health Labs", slug: "function-health-labs-analysis" },
      { label: "Nutrahacker & Genetic Genie", slug: "nutrahacker-genetic-genie" },
    ],
  },
  {
    icon: "🏋️",
    label: "Fitness & Diet",
    slug: "fitness-diet",
    description: "Exercise principles, diet protocols, and cosmetic notes",
    subpages: [
      { label: "Yamahata — BA surgery", slug: "yamahata-ba-surgery" },
    ],
  },
  {
    icon: "🏥",
    label: "Health Care",
    slug: "health-care",
    description: "Insurance, medical events, and letters of necessity",
    subpages: [
      { label: "Insurance", slug: "health-plan-coverage-notice" },
      { label: "Medical Events", slug: "medical-events" },
    ],
  },
  {
    icon: "🧠",
    label: "Mental Health",
    slug: "mental-health",
    description: "Depression, anxiety, TMS, therapy, and alternative treatments",
    subpages: [
      { label: "Therapy", slug: "therapy-intake" },
      { label: "Mental Health Timeline", slug: "mental-health-timeline" },
      { label: "TMS", slug: "tms-notes" },
      { label: "Protocol Log", slug: "mental-health-protocol-log" },
      { label: "Supplements", slug: "supplements-notes" },
      { label: "Reiki", slug: "reiki-notes" },
      { label: "Acupuncture", slug: "acupuncturist-anthem-ppo" },
      { label: "NMT", slug: "nmt-sessions-index" },
      { label: "Safe and Sound Protocol", slug: "safe-and-sound-protocol" },
      { label: "SIT", slug: "sit-notes" },
      { label: "BHC Brain Health Center", slug: "bhc-brain-health-center" },
    ],
  },
  {
    icon: "🦴",
    label: "Physical Therapy",
    slug: "physical-therapy",
    description: "PT search and spine care",
    subpages: [
      { label: "PT Search Dec 2025", slug: "therapy-dec-2025-search" },
      { label: "TruSpine", slug: "truspine" },
    ],
  },
  {
    icon: "🦷",
    label: "Dental Health",
    slug: "dental-health",
    description: "Dental care notes",
    subpages: [
      { label: "Dental Follow-up", slug: "dental-follow-up" },
    ],
  },
]

// Medical events pulled from the crawled markdown index
async function getMedicalEvents() {
  const file = await getMarkdownFileWithPending("personal/docs/health/medical-events.md")
  if (!file) return []
  // Parse the list items from the markdown
  const lines = file.content.split("\n").filter((l) => l.startsWith("- ["))
  return lines.slice(0, 10).map((line) => {
    const match = line.match(/- \[(.+?)\]\((.+?)\)(?:\s*—\s*(.+))?/)
    if (!match) return null
    return { title: match[1], href: match[2], date: match[3] ?? "" }
  }).filter(Boolean) as { title: string; href: string; date: string }[]
}

// Get supplement stack summary from the crawled file
async function getSupplementSummary(): Promise<string> {
  const file = await getMarkdownFileWithPending("personal/site/health/supplement-stack.md")
  if (!file) return ""
  // Find the SPARKLE FUEL line
  const match = file.content.match(/SPARKLE FUEL[^\n]+/)
  return match ? match[0] : ""
}

export default async function HealthPage() {
  const medicalEvents = await getMedicalEvents()
  const supplementSummary = await getSupplementSummary()

  return (
    <div>
      <PagePathStatic path="niki/health" />
      <PageHeader
        icon="💚"
        title="Health"
        description="Care team, medical history, and health tracking across all areas."
      />

      {/* Health area tiles — compact grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-8">
        {HEALTH_SECTIONS.map((section) => (
          <Link
            key={section.slug}
            href={`/self/health/${section.slug}`}
            className="flex flex-col items-center gap-1.5 bg-notion-surface border border-notion-border rounded-xl p-3 hover:bg-notion-hover hover:border-notion-accent/40 transition-colors text-center group"
          >
            <span className="text-2xl">{section.icon}</span>
            <span className="text-xs font-semibold text-notion-text group-hover:text-notion-accent transition-colors leading-tight">{section.label}</span>
            {section.subpages.length > 0 && (
              <span className="text-[10px] text-notion-muted">{section.subpages.length} pages</span>
            )}
          </Link>
        ))}
      </div>

      {/* Medical events timeline */}
      {medicalEvents.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-notion-muted uppercase tracking-wider">
              Medical Events
            </h2>
            <Link
              href="/self/health/medical-events"
              className="text-xs text-notion-muted hover:text-notion-accent transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="bg-notion-surface border border-notion-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-notion-border">
                  <th className="text-left px-4 py-3 text-notion-muted font-medium">Event</th>
                  <th className="text-left px-4 py-3 text-notion-muted font-medium w-32">Date</th>
                </tr>
              </thead>
              <tbody>
                {medicalEvents.map((event, i) => (
                  <tr
                    key={event.href}
                    className={`${i < medicalEvents.length - 1 ? "border-b border-notion-border" : ""} hover:bg-notion-hover transition-colors`}
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={event.href}
                        className="text-notion-text hover:text-notion-accent transition-colors"
                      >
                        {event.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-notion-muted font-mono text-xs">
                      {event.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Supplement Stack summary */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-notion-muted uppercase tracking-wider">
            Supplement Stack
          </h2>
          <Link
            href="/life/health/supplement-stack"
            className="text-xs text-notion-muted hover:text-notion-accent transition-colors"
          >
            Full formula →
          </Link>
        </div>
        <div className="bg-notion-surface border border-notion-border rounded-xl p-4">
          {supplementSummary && (
            <p className="text-sm text-notion-text mb-3 font-medium">{supplementSummary}</p>
          )}
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="text-center py-3 bg-notion-hover rounded-lg">
              <p className="text-2xl font-bold text-notion-text">41</p>
              <p className="text-xs text-notion-muted mt-0.5">ingredients</p>
            </div>
            <div className="text-center py-3 bg-notion-hover rounded-lg">
              <p className="text-2xl font-bold text-notion-text">13</p>
              <p className="text-xs text-notion-muted mt-0.5">capsules / day</p>
            </div>
            <div className="text-center py-3 bg-notion-hover rounded-lg">
              <p className="text-2xl font-bold text-notion-text">$194</p>
              <p className="text-xs text-notion-muted mt-0.5">per month</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {[
              "Vitamin D3", "Magnesium Glycinate", "Iron", "Omega-3 EPA/DHA",
              "Alpha GPC", "Lion's Mane", "Creatine", "Rhodiola", "L-Theanine",
              "Apigenin", "Saffron",
            ].map((item) => (
              <span
                key={item}
                className="text-xs bg-notion-hover border border-notion-border rounded-full px-2.5 py-0.5 text-notion-muted"
              >
                {item}
              </span>
            ))}
            <Link
              href="/life/health/supplement-stack"
              className="text-xs text-notion-muted hover:text-notion-accent transition-colors px-2.5 py-0.5"
            >
              +30 more →
            </Link>
          </div>
        </div>
      </div>

      {/* Mental Health snapshot */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-notion-muted uppercase tracking-wider">
            Mental Health
          </h2>
          <Link
            href="/self/health/mental-health"
            className="text-xs text-notion-muted hover:text-notion-accent transition-colors"
          >
            Full page →
          </Link>
        </div>
        <div className="bg-notion-surface border border-notion-border rounded-xl p-5">
          <p className="text-sm text-notion-muted mb-4">
            Depression journey began at 18. Characterized by feeling stuck, rumination, existentialism. TMS produced the best 6 months of my life. Still pursuing a path back to that.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold text-notion-muted uppercase tracking-wider mb-2">
                Current Medications
              </h3>
              <ul className="space-y-1">
                {["Bupropion 300 mg", "Zoloft 12.5 mg"].map((med) => (
                  <li key={med} className="text-sm text-notion-text">• {med}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-notion-muted uppercase tracking-wider mb-2">
                Key Treatments
              </h3>
              <ul className="space-y-1">
                {[
                  "TMS (best 6 months of my life)",
                  "Myndlift neurofeedback",
                  "tDCS / tACS / PEMF",
                  "Reiki (Level I attunement)",
                  "Safe and Sound Protocol",
                  "NMT / SIT with Adeliz Araiza",
                ].map((t) => (
                  <li key={t} className="text-sm text-notion-text">• {t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <LabelPageContent tagId="health" />
    </div>
  )
}
