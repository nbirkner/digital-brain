"use client"

import SiteTable from "@/components/data/SiteTable"
import type { SiteTableColumn } from "@/components/data/SiteTable"

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

const rentSplitColumns: SiteTableColumn<Record<string, unknown>>[] = [
  { key: "month", label: "Month" },
  {
    key: "owed",
    label: "Total Owed",
    render: (row) => {
      const entry = row as unknown as RentSplitEntry
      return (
        <span className="font-mono">
          {entry.owed === 0
            ? "—"
            : `$${entry.owed.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
        </span>
      )
    },
  },
]

const marketResearchColumns: SiteTableColumn<Record<string, unknown>>[] = [
  {
    key: "address",
    label: "Address",
    render: (row) => {
      const r = row as unknown as MarketResearchEntry
      return r.url ? (
        <a
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-xs hover:text-notion-accent underline underline-offset-2${r.current ? " font-semibold" : ""}`}
        >
          {r.address}
        </a>
      ) : (
        <span className={`text-xs${r.current ? " font-semibold" : " font-medium"}`}>{r.address}</span>
      )
    },
  },
  {
    key: "sqft",
    label: "Sq Ft",
    render: (row) => (
      <span className="font-mono text-xs text-notion-muted">
        {(row as unknown as MarketResearchEntry).sqft.toLocaleString()}
      </span>
    ),
  },
  {
    key: "rent",
    label: "Monthly",
    render: (row) => (
      <span className="font-mono text-xs">
        ${(row as unknown as MarketResearchEntry).rent.toLocaleString()}
      </span>
    ),
  },
]

export function RentSplitTable({ data, note }: { data: RentSplitEntry[]; note?: string }) {
  return (
    <div className="bg-notion-surface border border-notion-border rounded-xl p-5 mb-6">
      <h2 className="font-semibold text-notion-text mb-1">2321 Scott St — Rent Split Calculations</h2>
      <p className="text-xs text-notion-muted mb-4">{note ?? ""}</p>
      <SiteTable
        columns={rentSplitColumns}
        data={data as unknown as Record<string, unknown>[]}
      />
    </div>
  )
}

export function MarketResearchTable({ data, note }: { data: MarketResearchEntry[]; note?: string }) {
  return (
    <div className="bg-notion-surface border border-notion-border rounded-xl p-5 mb-6">
      <h2 className="font-semibold text-notion-text mb-1">Market Research — 94105 / SoMa</h2>
      <p className="text-xs text-notion-muted mb-4">{note ?? ""}</p>
      <SiteTable
        columns={marketResearchColumns}
        data={data as unknown as Record<string, unknown>[]}
      />
    </div>
  )
}
