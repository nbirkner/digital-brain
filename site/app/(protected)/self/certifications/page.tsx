import Link from "next/link"
import PageHeader from "@/components/layout/PageHeader"
import PagePathStatic from "@/components/layout/PagePathStatic"
import LabelPageContent from "@/components/features/notes/LabelPageContent"

const CERTIFICATIONS = [
  {
    name: "Reiki Level 1 Certification",
    slug: "reiki-level-1",
    status: "Complete",
    statusColor: "text-green-400",
    description: "Hands-on energy healing foundation — attunement to universal life force energy",
    icon: "🔮",
  },
  {
    name: "Reiki Level 2",
    slug: null,
    status: "In Progress (April 2026)",
    statusColor: "text-yellow-400",
    description: "Advanced energy work and distance healing",
    icon: "✨",
  },
  {
    name: "TMS Certification",
    slug: "tms-certification",
    status: "Complete",
    statusColor: "text-green-400",
    description: "Mind-body pain syndrome program based on Dr. John Sarno's work",
    icon: "🧠",
  },
  {
    name: "Palouse MBSR Certification",
    slug: "palouse-mbsr",
    status: "Complete",
    statusColor: "text-green-400",
    description: "Mindfulness-Based Stress Reduction — 8-week Jon Kabat-Zinn curriculum",
    icon: "🧘",
  },
  {
    name: "CPR Training",
    slug: "cpr-training",
    status: "Complete",
    statusColor: "text-green-400",
    description: "CPR / First Aid certification — completed January 2026 with Together AI",
    icon: "❤️",
  },
]

export default async function CertificationsPage() {
  return (
    <div>
      <PagePathStatic path="niki/certifications" />
      <PageHeader
        icon="📜"
        title="Certifications"
        description="Completed and in-progress certifications and programs."
      />

      <div className="space-y-3 mb-8">
        {CERTIFICATIONS.map((cert) => {
          const inner = (
            <div
              className={`flex items-start gap-4 bg-notion-surface border border-notion-border rounded-xl p-4 ${cert.slug ? "hover:bg-notion-hover transition-colors" : ""}`}
            >
              <span className="text-2xl mt-0.5">{cert.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-notion-text">{cert.name}</h3>
                  <span className={`text-xs font-medium ${cert.statusColor} whitespace-nowrap`}>
                    {cert.status}
                  </span>
                </div>
                <p className="text-notion-muted text-sm mt-0.5">{cert.description}</p>
              </div>
              {cert.slug && (
                <svg
                  className="w-4 h-4 text-notion-muted flex-shrink-0 mt-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </div>
          )

          return cert.slug ? (
            <Link key={cert.name} href={`/self/certifications/${cert.slug}`}>
              {inner}
            </Link>
          ) : (
            <div key={cert.name}>{inner}</div>
          )
        })}
      </div>

      <LabelPageContent tagId="learning" />
    </div>
  )
}
