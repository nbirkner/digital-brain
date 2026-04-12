import PageHeader from "@/components/layout/PageHeader"
import { getMarkdownFilesWithPending, getMarkdownFileWithPending } from "@/lib/content"
import MarkdownRenderer from "@/components/ui/MarkdownRenderer"
import PagePathStatic from "@/components/layout/PagePathStatic"
import LabelPageContent from "@/components/features/notes/LabelPageContent"

// Career file slugs that map to specific display names
const CAREER_FILE_LABELS: Record<string, string> = {
  "lattice-self-review-2026": "Lattice Self-Review (Sep 2025 – Mar 2026)",
  "performance-review-evidence": "Performance Review Evidence (2025–2026)",
  "whats-special-about-niki": "What's Special About Niki",
  "peregrine-achievements": "Peregrine — Career Achievement Story",
  "career-achievements-journal": "Career Achievements Journal",
  "job-search": "Job Search History",
}

const MAYFIELD_SUPERPOWERS = [
  {
    title: "Introspectiveness",
    description: "A rare quality — Niki turns inward with the same rigor she applies outward. She doesn't just react; she reflects.",
  },
  {
    title: "Vulnerability + Strength",
    description: "She shows up fully, openly, and powerfully. Vulnerability isn't a crack in Niki — it's the design.",
  },
  {
    title: "Growth Mindset",
    description: "Niki approaches every challenge as a chance to learn. She's not attached to being right; she's attached to getting better.",
  },
  {
    title: "Passion",
    description: "She brings real energy to the things she cares about. You can feel it in how she talks, how she works, how she builds.",
  },
  {
    title: "Creating Space to Grow",
    description: "One of her most distinctive gifts — she builds conditions where the people around her can also become more.",
  },
]

const PAST_COMPANIES = [
  {
    name: "Together AI",
    period: "2024 – Present",
    role: "Product Manager",
    description: "Cloud platform for open-source AI inference. PM for enterprise billing, IAM, and developer experience.",
    highlights: ["Orgs & Projects", "Enterprise Contract Policy", "GPU Pricing App", "ACH Payments", "UMS OIDC"],
    icon: "🤝",
  },
  {
    name: "Peregrine",
    period: "2022 – 2024",
    role: "Product Manager",
    description: "Public safety AI platform. Rich achievement history.",
    highlights: [
      "Grew active users from 0 to 33 in first quarter",
      "17 WAU on core product",
      "Cal OES enterprise deal",
      "Built core investigation workflow from scratch",
    ],
    icon: "🦅",
  },
  {
    name: "Asana",
    period: "Before Peregrine",
    role: "Product",
    description: "Work management platform. Foundational PM experience.",
    highlights: [],
    icon: "📋",
  },
]

export default async function CareerPage() {
  const philosophy = await getMarkdownFileWithPending("personal/context/work-context/philosophy.md") ||
    await getMarkdownFileWithPending("personal/context/work-context/product-philosophy.md")

  // Ordered career docs for the expandable section
  const PRIORITY_SLUGS = [
    "whats-special-about-niki",
    "lattice-self-review-2026",
    "performance-review-evidence",
    "peregrine-achievements",
    "career-achievements-journal",
    "job-search",
  ]
  const allCareerFiles = await getMarkdownFilesWithPending("personal/docs/career")
  const careerFilesOrdered = [
    ...PRIORITY_SLUGS.flatMap((slug) => allCareerFiles.filter((f) => f.slug === slug)),
    ...allCareerFiles.filter((f) => !PRIORITY_SLUGS.includes(f.slug)),
  ]

  return (
    <div>
      <PagePathStatic path="work/career" />
      <PageHeader
        icon="🚀"
        title="Career"
        description="Philosophy, superpowers, company history, and what's next."
      />

      {/* Philosophy section */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-notion-muted uppercase tracking-wider mb-4">
          My Philosophy for Product
        </h2>
        {philosophy ? (
          <div className="bg-notion-surface border border-notion-border rounded-xl p-5">
            <MarkdownRenderer content={philosophy.content} />
          </div>
        ) : (
          <div className="bg-notion-surface border border-dashed border-notion-border rounded-xl p-5 text-center">
            <p className="text-notion-muted text-sm">Content to be added — save to <code className="text-xs bg-notion-hover px-1 py-0.5 rounded">personal/context/work-context/philosophy.md</code></p>
          </div>
        )}
      </div>

      {/* Mayfield Superpowers */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-notion-muted uppercase tracking-wider mb-4">
          ✨ Mayfield Superpowers
        </h2>
        <p className="text-notion-muted text-sm mb-4">Written by peers and colleagues — an outside-in view of what makes Niki, Niki.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MAYFIELD_SUPERPOWERS.map((power) => (
            <div
              key={power.title}
              className="bg-notion-surface border border-notion-border rounded-xl p-4"
            >
              <h3 className="font-semibold text-notion-accent text-sm mb-2">{power.title}</h3>
              <p className="text-notion-muted text-sm leading-relaxed">{power.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Career narrative */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-notion-muted uppercase tracking-wider mb-4">
          Career Narrative
        </h2>
        <div className="bg-notion-surface border border-notion-border rounded-xl p-5">
          <p className="text-notion-muted text-sm mb-3">What Niki wants out of her career (in her own words):</p>
          <div className="border-l-2 border-notion-accent pl-4 text-notion-text text-sm leading-relaxed">
            <p className="mb-2">
              &quot;I want to build products that genuinely help people — not in the abstract, but concretely. I want to feel the thing I&apos;m working on matters to someone&apos;s day.&quot;
            </p>
            <p className="mb-2">
              &quot;I care deeply about the people I work with. I want to be somewhere I can grow, where feedback is real, and where being honest is valued more than being comfortable.&quot;
            </p>
            <p>
              &quot;Long-term: I want to lead product at a company where the mission resonates — AI, climate, health, or something I haven&apos;t discovered yet.&quot;
            </p>
          </div>
        </div>
      </div>

      {/* Past companies */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-notion-muted uppercase tracking-wider mb-4">
          Past Companies
        </h2>
        <div className="space-y-4">
          {PAST_COMPANIES.map((company) => (
            <div
              key={company.name}
              className="bg-notion-surface border border-notion-border rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{company.icon}</span>
                  <div>
                    <h3 className="font-semibold text-notion-text">{company.name}</h3>
                    <p className="text-notion-muted text-sm">{company.role} · {company.period}</p>
                  </div>
                </div>
              </div>
              <p className="text-notion-muted text-sm mb-3">{company.description}</p>
              {company.highlights.length > 0 && (
                <ul className="space-y-1">
                  {company.highlights.map((h) => (
                    <li key={h} className="text-sm text-notion-text flex items-start gap-2">
                      <span className="text-notion-accent mt-0.5">→</span>
                      {h}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Placeholder sections */}
      <div className="grid gap-3 sm:grid-cols-2 mb-10">
        <div className="bg-notion-surface border border-dashed border-notion-border rounded-xl p-4">
          <h3 className="font-medium text-notion-muted text-sm mb-1">📋 Guide to Niki</h3>
          <p className="text-notion-muted/60 text-xs">Full guide to working with Niki — to be added manually.</p>
        </div>
        <div className="bg-notion-surface border border-dashed border-notion-border rounded-xl p-4">
          <h3 className="font-medium text-notion-muted text-sm mb-1">💌 Goodbye Letter</h3>
          <p className="text-notion-muted/60 text-xs">Archive of heartfelt goodbye from past team — to be added.</p>
        </div>
      </div>

      {/* Career documents — dynamically loaded from Notion migration */}
      {careerFilesOrdered.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-notion-muted uppercase tracking-wider mb-4">
            Career Documents
          </h2>
          <div className="space-y-3">
            {careerFilesOrdered.map((file) => {
              const label = CAREER_FILE_LABELS[file.slug] || file.displayTitle
              return (
                <details
                  key={file.slug}
                  className="bg-notion-surface border border-notion-border rounded-xl overflow-hidden"
                >
                  <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-notion-hover select-none">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-notion-text truncate">{label}</p>
                      <p className="text-xs text-notion-muted mt-0.5 font-mono truncate">{file.slug}</p>
                    </div>
                    <svg className="w-4 h-4 text-notion-muted ml-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-4 pb-4 pt-2 border-t border-notion-border">
                    <MarkdownRenderer content={file.content} />
                  </div>
                </details>
              )
            })}
          </div>
        </div>
      )}
      <LabelPageContent tagId="career" />
    </div>
  )
}
