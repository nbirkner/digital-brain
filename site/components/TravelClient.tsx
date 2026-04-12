"use client"

import { useState } from "react"
import Image from "next/image"
import SiteTable from "@/components/SiteTable"
import type { SiteTableColumn, SiteTableSection } from "@/components/SiteTable"

type TripStatus =
  | "Tickets purchased"
  | "Reservations pending"
  | "Undecided"
  | "Done"
  | "Canceled"
  | "Cancelled"

type StatusFilter = "all" | TripStatus

const STATUS_STYLES: Record<string, string> = {
  "Tickets purchased": "bg-green-500/15 text-green-700 border-green-500/30",
  "Reservations pending": "bg-yellow-500/15 text-yellow-700 border-yellow-500/30",
  "Undecided": "bg-notion-surface text-notion-muted border-notion-border",
  "Done": "bg-blue-500/15 text-blue-700 border-blue-500/30",
  "Canceled": "bg-red-500/15 text-red-700 border-red-500/30",
  "Cancelled": "bg-red-500/15 text-red-700 border-red-500/30",
}

const FILTER_TABS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Tickets purchased", label: "Tickets purchased" },
  { id: "Reservations pending", label: "Reservations pending" },
  { id: "Undecided", label: "Undecided" },
  { id: "Done", label: "Done" },
  { id: "Canceled", label: "Canceled" },
]

function effectiveStatus(frontmatter: Record<string, string>): string {
  const status = frontmatter.status ?? ""
  if (status === "Canceled" || status === "Cancelled" || status === "Done") return status
  const dateEnd = frontmatter.date_end
  if (dateEnd && new Date(dateEnd + "T23:59:59") < new Date()) return "Done"
  return status
}

function isUpcoming(status: string): boolean {
  return status !== "Done" && status !== "Canceled" && status !== "Cancelled"
}

function TravelerBadges({ travelers }: { travelers: string }) {
  const showNiki = travelers === "niki" || travelers === "both"
  const showJuan = travelers === "juan" || travelers === "both"
  return (
    <div className="flex items-center -space-x-1">
      {showNiki && (
        <Image
          src="/avatars/niki.png"
          alt="Niki"
          width={24}
          height={24}
          className="rounded-full ring-2 ring-notion-bg object-cover"
          title="Niki"
        />
      )}
      {showJuan && (
        <Image
          src="/avatars/juan.jpg"
          alt="Juan"
          width={24}
          height={24}
          className="rounded-full ring-2 ring-notion-bg object-cover"
          title="Juan"
        />
      )}
    </div>
  )
}

interface Trip {
  slug: string
  displayTitle: string
  frontmatter: Record<string, string>
}

type TripRow = Trip & Record<string, unknown>

interface TravelClientProps {
  trips: Trip[]
}

const TRIP_COLUMNS: SiteTableColumn<TripRow>[] = [
  {
    key: "displayTitle",
    label: "Destination",
  },
  {
    key: "dateHuman",
    label: "Dates",
    hideOnMobile: true,
    render: (row) => (
      <span className="text-notion-muted text-xs">{row.frontmatter.date_human ?? row.frontmatter.date_start ?? ""}</span>
    ),
  },
  {
    key: "travelers",
    label: "Travelers",
    render: (row) => <TravelerBadges travelers={row.frontmatter.travelers ?? "niki"} />,
  },
  {
    key: "status",
    label: "Status",
    render: (row) => {
      const status = effectiveStatus(row.frontmatter)
      if (!status) return null
      return (
        <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[status] ?? "bg-notion-surface text-notion-muted border-notion-border"}`}>
          {status}
        </span>
      )
    },
  },
]

export default function TravelClient({ trips }: TravelClientProps) {
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [upcomingOpen, setUpcomingOpen] = useState(true)
  const [pastOpen, setPastOpen] = useState(false)

  const tripRows = trips as TripRow[]

  if (filter === "all") {
    const upcoming = tripRows
      .filter((t) => isUpcoming(effectiveStatus(t.frontmatter)))
      .sort((a, b) => (a.frontmatter.date_start ?? "").localeCompare(b.frontmatter.date_start ?? ""))

    const past = tripRows
      .filter((t) => !isUpcoming(effectiveStatus(t.frontmatter)))
      .sort((a, b) => (b.frontmatter.date_start ?? "").localeCompare(a.frontmatter.date_start ?? ""))

    return (
      <div>
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none mb-6">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors shrink-0 ${
                filter === tab.id
                  ? "bg-notion-surface border border-notion-border text-notion-text"
                  : "text-notion-muted hover:text-notion-text"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <button
            onClick={() => setUpcomingOpen((o) => !o)}
            className="flex items-center gap-1.5 mb-3 group"
          >
            <span className={`text-notion-muted transition-transform duration-150 ${upcomingOpen ? "rotate-90" : ""}`}>▶</span>
            <span className="text-sm font-semibold text-notion-muted uppercase tracking-wider group-hover:text-notion-text transition-colors">
              Upcoming ({upcoming.length})
            </span>
          </button>
          {upcomingOpen && (
            upcoming.length > 0 ? (
              <SiteTable
                columns={TRIP_COLUMNS}
                data={upcoming}
                getRowHref={(row) => `/life/travel/${row.slug}`}
              />
            ) : (
              <p className="text-notion-muted text-sm">No upcoming trips.</p>
            )
          )}
        </div>

        {past.length > 0 && (
          <div>
            <button
              onClick={() => setPastOpen((o) => !o)}
              className="flex items-center gap-1.5 mb-3 group"
            >
              <span className={`text-notion-muted transition-transform duration-150 ${pastOpen ? "rotate-90" : ""}`}>▶</span>
              <span className="text-sm font-semibold text-notion-muted uppercase tracking-wider group-hover:text-notion-text transition-colors">
                Past / Canceled ({past.length})
              </span>
            </button>
            {pastOpen && (
              <SiteTable
                columns={TRIP_COLUMNS}
                data={past}
                getRowHref={(row) => `/life/travel/${row.slug}`}
                faded
              />
            )}
          </div>
        )}
      </div>
    )
  }

  // Filtered view — flat list, no section headers
  const normalizedFilter = filter === "Canceled" ? ["Canceled", "Cancelled"] : [filter]
  const filtered = tripRows
    .filter((t) => normalizedFilter.includes(effectiveStatus(t.frontmatter)))
    .sort((a, b) => (a.frontmatter.date_start ?? "").localeCompare(b.frontmatter.date_start ?? ""))

  return (
    <div>
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none mb-6">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`text-xs px-3 py-1.5 rounded-md transition-colors shrink-0 ${
              filter === tab.id
                ? "bg-notion-surface border border-notion-border text-notion-text"
                : "text-notion-muted hover:text-notion-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <SiteTable
          columns={TRIP_COLUMNS}
          data={filtered}
          getRowHref={(row) => `/life/travel/${row.slug}`}
        />
      ) : (
        <p className="text-notion-muted text-sm">No trips with this status.</p>
      )}
    </div>
  )
}
