import Link from "next/link"
import PageHeader from "@/components/PageHeader"
import PagePathStatic from "@/components/PagePathStatic"
import { getMarkdownFile, getMarkdownFilesWithPending } from "@/lib/content"
import LabelPageContent from "@/components/LabelPageContent"
import { RentSplitTable, MarketResearchTable } from "./HousingTablesClient"

interface HistoryEntry {
  address: string
  city: string
  period: string
  slug: string | null
  current?: boolean
}

interface RentSplitEntry {
  month: string
  owed: number
}

interface MarketResearchEntry {
  address: string
  sqft: number
  rent: number
  url: string | null
  current?: boolean
}

function parseJSON<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export default async function HousingPage() {
  const data = getMarkdownFile("shared/housing/index.md")
  const fm = data?.frontmatter ?? {}

  const history = parseJSON<HistoryEntry[]>(fm.history_json, [])
  const rentSplit = parseJSON<RentSplitEntry[]>(fm.rent_split_json, [])
  const marketResearch = parseJSON<MarketResearchEntry[]>(fm.market_research_json, [])

  return (
    <div>
      <PagePathStatic path="life/housing" />
      <PageHeader
        icon="🏠"
        title="Housing & Rent"
        description="Current home, rent history, and housing research."
      />

      {/* Current Home */}
      <div className="bg-notion-surface border border-notion-border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-notion-text">Current Home</h2>
          <span className="text-xs bg-green-500/15 text-green-700 border border-green-500/30 rounded-full px-2 py-0.5">Active</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="bg-notion-hover rounded-lg p-3">
            <p className="text-xs text-notion-muted">Address</p>
            <p className="text-notion-text font-medium mt-0.5">{fm.current_address ?? "1809 California St #304"}</p>
            <p className="text-notion-muted text-xs">{fm.current_city ?? "Pacific Heights, San Francisco, CA 94109"}</p>
          </div>
          <div className="bg-notion-hover rounded-lg p-3">
            <p className="text-xs text-notion-muted">Monthly Rent</p>
            <p className="text-2xl font-bold text-notion-text mt-0.5">{fm.current_rent ?? "$3,147.62"}</p>
            <p className="text-notion-muted text-xs">Original: {fm.current_rent_original ?? "$3,095"} · {fm.current_rent_note ?? ""}</p>
          </div>
          <div className="bg-notion-hover rounded-lg p-3">
            <p className="text-xs text-notion-muted">Car Parking</p>
            <p className="text-notion-text font-medium mt-0.5">{fm.current_parking ?? "$796/month"}</p>
            <p className="text-notion-muted text-xs">{fm.current_parking_note ?? ""}</p>
          </div>
          <div className="bg-notion-hover rounded-lg p-3">
            <p className="text-xs text-notion-muted">Lease Started</p>
            <p className="text-notion-text font-medium mt-0.5">{fm.current_lease_started ?? "December 2023"}</p>
            <p className="text-notion-muted text-xs">Pacific Heights neighborhood</p>
          </div>
        </div>
        <div className="mt-4">
          <Link
            href={`/life/housing/${fm.current_slug ?? "1809-california-st"}`}
            className="text-sm text-notion-accent hover:underline"
          >
            View full listing details →
          </Link>
        </div>
      </div>

      {/* Address History */}
      {history.length > 0 && (
        <div className="bg-notion-surface border border-notion-border rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-notion-text mb-4">Address History</h2>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div
                key={i}
                className={`flex items-center justify-between py-2.5 border-b border-notion-border last:border-0 ${h.current ? "text-notion-text" : "text-notion-muted"}`}
              >
                <div>
                  <p className={`text-sm font-medium ${h.current ? "text-notion-text" : "text-notion-muted"}`}>
                    {h.address}
                  </p>
                  <p className="text-xs text-notion-muted">{h.city}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <p className="text-xs text-notion-muted font-mono">{h.period}</p>
                  {h.slug && (
                    <Link
                      href={`/life/housing/${h.slug}`}
                      className="text-xs text-notion-accent hover:underline"
                    >
                      details →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rent Split — 2321 Scott St era */}
      {rentSplit.length > 0 && (
        <RentSplitTable data={rentSplit} note={fm.rent_split_note ?? ""} />
      )}

      {/* Market Research 94105 */}
      {marketResearch.length > 0 && (
        <MarketResearchTable data={marketResearch} note={fm.market_research_note ?? ""} />
      )}

      {/* 403 Main St */}
      <div className="bg-notion-surface border border-notion-border rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-notion-text mb-3">403 Main St Unit N516 — Jan 2021 – Dec 2021</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="bg-notion-hover rounded-lg p-3">
            <p className="text-xs text-notion-muted">Total Rent</p>
            <p className="text-notion-text font-medium mt-0.5">{fm.main_st_rent ?? "$2,999/mo"}</p>
            <p className="text-notion-muted text-xs">{fm.main_st_rent_note ?? "Parking + utilities included"}</p>
          </div>
          <div className="bg-notion-hover rounded-lg p-3">
            <p className="text-xs text-notion-muted">Split</p>
            <p className="text-notion-text font-medium mt-0.5">{fm.main_st_split ?? "Niki $1,700 · Juan $1,299"}</p>
          </div>
        </div>
      </div>

      {/* 4123 Dake Ave Palo Alto */}
      <div className="bg-notion-surface border border-notion-border rounded-xl p-5">
        <h2 className="font-semibold text-notion-text mb-3">4123 Dake Ave — Aug 2020 – Dec 2020</h2>
        <p className="text-sm text-notion-muted mb-4">{fm.dake_ave_note ?? "Palo Alto House w/ Friends"}</p>
        <img
          src="/images/housing/dake-ave-palo-alto.jpg"
          alt="4123 Dake Ave, Palo Alto"
          className="rounded-lg w-full max-w-md object-cover"
        />
      </div>

      <AllHousingFiles />
      <LabelPageContent tagId="housing" />
    </div>
  )
}

const KNOWN_HOUSING_SLUGS = new Set([
  "house-search-october-2022",
  "1809-california-st",
])

async function AllHousingFiles() {
  const allFiles = (await getMarkdownFilesWithPending("shared/housing")).filter(
    (f) => !KNOWN_HOUSING_SLUGS.has(f.slug) && !f.slug.endsWith("README") && !f.slug.endsWith("index")
  )
  if (allFiles.length === 0) return null
  const shown = allFiles.slice(0, 30)
  return (
    <details className="group mt-6">
      <summary className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-notion-muted uppercase tracking-wider mb-3 hover:text-notion-text transition-colors">
        <svg className="w-3 h-3 group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Migrated Notes ({allFiles.length})
      </summary>
      <div className="mt-3 space-y-1">
        {shown.map((f) => (
          <Link
            key={f.slug}
            href={`/life/housing/${f.slug}`}
            className="block px-3 py-2 rounded-lg hover:bg-notion-surface border border-transparent hover:border-notion-border transition-colors"
          >
            <p className="text-sm text-notion-text leading-snug truncate">{f.displayTitle}</p>
          </Link>
        ))}
        {allFiles.length > 30 && (
          <p className="text-xs text-notion-muted px-3 py-2">{allFiles.length - 30} more files not shown.</p>
        )}
      </div>
    </details>
  )
}
