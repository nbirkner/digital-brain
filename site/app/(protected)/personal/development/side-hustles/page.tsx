import PageHeader from "@/components/layout/PageHeader"
import { getMarkdownFilesWithPending } from "@/lib/content"
import MarkdownRenderer from "@/components/ui/MarkdownRenderer"
import PagePathStatic from "@/components/layout/PagePathStatic"
import LabelPageContent from "@/components/features/notes/LabelPageContent"
import SiteTable from "@/components/data/SiteTable"
import type { SiteTableColumn } from "@/components/data/SiteTable"

const HUSTLES = [
  {
    icon: "🏪",
    label: "Main St Businesses",
    slug: "main-st-businesses",
    description: "Acquire cash-flowing small businesses. Deal box: $750K–$1.5M purchase price, $375K target cash flow.",
    status: "Research",
    statusColor: "text-amber-400",
  },
  {
    icon: "🎨",
    label: "ATNP",
    slug: "atnp",
    description: "AI art and generative NFT platform. Prompt library, AI art platforms, Greek mythology series.",
    status: "In Progress",
    statusColor: "text-blue-400",
  },
  {
    icon: "🎥",
    label: "Content Creation",
    slug: "content-creation",
    description: "TikTok strategy, video funnel, topic inspiration for social content.",
    status: "In Progress",
    statusColor: "text-blue-400",
  },
  {
    icon: "🔗",
    label: "Go Fund Me for NFTs",
    slug: "go-fund-me-nfts",
    description: "NFT-backed fundraising platform — donate in exchange for an NFT tied to a cause. % split to artist, organizer, and charity.",
    status: "Concept",
    statusColor: "text-notion-muted",
  },
  {
    icon: "🤖",
    label: "Generative Content",
    slug: "generative-content",
    description: "Startup ideas and creative projects using generative AI. Brainstorm notes from early ChatGPT era.",
    status: "Archived",
    statusColor: "text-notion-muted/60",
  },
  {
    icon: "📹",
    label: "YouTube Automation",
    slug: "youtube-automation",
    description: "Faceless YouTube automation research. Notes on making revenue without showing your face.",
    status: "Research",
    statusColor: "text-amber-400",
  },
]

const MAIN_ST_DEAL_BOX = [
  { label: "Ideal Annual Income", value: "$200,000" },
  { label: "Minimum Annual Income", value: "$150,000" },
  { label: "Operator Salary", value: "$100,000" },
  { label: "Target Business Cash Flow", value: "$300,000" },
  { label: "Debt Service Cost", value: "$75,000" },
  { label: "Total Target Cash Flow", value: "$375,000" },
  { label: "Minimum Purchase Price", value: "$750,000" },
  { label: "Maximum Purchase Price", value: "$1.5M" },
]

export default async function SideHustlesPage() {
  const docs = await getMarkdownFilesWithPending("personal/docs/work/side-hustles")

  return (
    <div>
      <PagePathStatic path="personal/development/side-hustles" />
      <PageHeader
        icon="🧩"
        title="Side Hustles"
        description="Projects, concepts, and things being built on the side."
      />

      {/* Project cards */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-notion-muted uppercase tracking-wider mb-3">Projects</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {HUSTLES.map((hustle) => (
            <div
              key={hustle.label}
              className="flex items-start gap-3 bg-notion-surface border border-notion-border rounded-xl p-4"
            >
              <span className="text-2xl flex-shrink-0">{hustle.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-notion-text text-sm">{hustle.label}</h3>
                  <span className={`text-xs ${hustle.statusColor}`}>{hustle.status}</span>
                </div>
                <p className="text-notion-muted text-xs leading-relaxed">{hustle.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main St Businesses deal box callout */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-notion-muted uppercase tracking-wider mb-3">Main St Deal Box</h2>
        <div className="bg-notion-surface border border-notion-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-notion-border">
            <p className="text-xs text-notion-muted italic">
              &quot;Finding a Main Street business with steady cash flow, acquiring it, and using the profits to live life on your terms is the smart, extremely underrated way to build extraordinary wealth.&quot;
            </p>
          </div>
          <div className="p-4">
            <p className="text-xs text-notion-muted mb-3 font-mono">
              Target income = salary + operator salary &nbsp;|&nbsp; Debt service = target income × 0.25 &nbsp;|&nbsp; Asking price = cash flow × 2–4
            </p>
            <div className="grid grid-cols-2 gap-2">
              {MAIN_ST_DEAL_BOX.map((row) => (
                <div key={row.label} className="bg-notion-hover rounded-lg px-3 py-2">
                  <p className="text-xs text-notion-muted">{row.label}</p>
                  <p className="text-sm font-semibold text-notion-text mt-0.5">{row.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ATNP info */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-notion-muted uppercase tracking-wider mb-3">ATNP — AI Art Platform</h2>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-notion-muted uppercase tracking-widest mb-2">Databases</p>
            <SiteTable<{ name: string; desc: string }>
              columns={[
                { key: "name", label: "Database" },
                { key: "desc", label: "Description" },
              ] as SiteTableColumn<{ name: string; desc: string }>[]}
              data={[
                { name: "Prompts", desc: "Library of image generation prompts" },
                { name: "AI Art Platforms", desc: "Platforms for generating and selling AI art" },
                { name: "Shared Passwords", desc: "Shared account credentials" },
              ]}
            />
          </div>
          <div className="bg-notion-surface border border-notion-border rounded-xl px-4 py-3">
            <p className="text-xs font-semibold text-notion-muted uppercase tracking-widest mb-2">Subpages</p>
            <div className="flex flex-wrap gap-2">
              {["Good settings", "Website Copy", "Brainstorm", "Greek Mythology Project", "Hashtags", "Where to get good prompts", "BrainDrops", "Webflow"].map((page) => (
                <span key={page} className="bg-notion-hover text-notion-muted text-xs px-2 py-1 rounded-md">{page}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Go Fund Me for NFTs */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-notion-muted uppercase tracking-wider mb-3">Go Fund Me for NFTs</h2>
        <div className="bg-notion-surface border border-notion-border rounded-xl p-4">
          <p className="text-sm text-notion-muted mb-3">
            Crypto has been down, and in the bear market we should be devising how it can be used for social good.
          </p>
          <p className="text-xs font-semibold text-notion-text mb-2">With this platform:</p>
          <ul className="space-y-1.5">
            {[
              "You support artists",
              "Proceeds go to fund research",
              "You can do that with any cause",
              "Same model as GoFundMe, but donors receive an NFT tied to that cause instead of a receipt",
              "% to artist, % to person starting the initiative, % to the charity",
              "Direct to charity: blockchain helps with transparency in the philanthropy industry",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-notion-muted">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-notion-muted/40 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Notes / markdown docs */}
      {docs.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-notion-muted uppercase tracking-wider mb-3">Notes</h2>
          <div className="space-y-3">
            {docs.map((file) => (
              <details key={file.slug} className="bg-notion-surface border border-notion-border rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-notion-hover select-none">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-notion-text truncate">{file.displayTitle}</p>
                    <p className="text-xs text-notion-muted mt-0.5 font-mono truncate">{file.slug}</p>
                  </div>
                  <svg className="w-4 h-4 text-notion-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 pb-4 pt-2 border-t border-notion-border">
                  <MarkdownRenderer content={file.content} />
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
      <LabelPageContent tagId="side-hustle" />
    </div>
  )
}
