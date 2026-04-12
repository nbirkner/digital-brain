"use client"

import Link from "next/link"
import SiteTable from "@/components/data/SiteTable"
import type { SiteTableColumn } from "@/components/data/SiteTable"
import type { MedicalEvent } from "@/lib/medical-events"

const TYPE_STYLES: Record<string, string> = {
  "Routine": "bg-emerald-500/10 text-emerald-700",
  "Labs": "bg-blue-500/10 text-blue-700",
  "Injury/Disease": "bg-amber-500/10 text-amber-700",
  "Emergency": "bg-rose-500/10 text-rose-700",
}

const FILTERS = [
  { id: "all", label: "All" },
  { id: "Routine", label: "Routine" },
  { id: "Injury/Disease", label: "Injury/Disease" },
  { id: "Labs", label: "Labs" },
  { id: "Emergency", label: "Emergency" },
]

type MedicalEventRow = MedicalEvent & Record<string, unknown>

const MEDICAL_EVENT_COLUMNS: SiteTableColumn<MedicalEventRow>[] = [
  {
    key: "name",
    label: "Event",
    render: (row) => (
      <>
        <Link
          href={`/self/health/health-care/${row.slug}`}
          className="text-sm text-notion-text font-medium hover:text-notion-accent transition-colors"
        >
          {row.name}
        </Link>
        <p className="text-xs text-notion-muted sm:hidden mt-0.5">{row.date}</p>
      </>
    ),
  },
  {
    key: "date",
    label: "Date",
    hideOnMobile: true,
    render: (row) => (
      <span className="text-xs text-notion-muted font-mono whitespace-nowrap">{row.date}</span>
    ),
  },
  {
    key: "type",
    label: "Type",
    hideOnMobile: true,
    render: (row) => {
      const typeStyle = TYPE_STYLES[row.type] ?? "bg-gray-500/10 text-gray-600"
      return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${typeStyle}`}>
          {row.type}
        </span>
      )
    },
  },
  {
    key: "location",
    label: "Provider",
    render: (row) => (
      <span className="text-xs text-notion-muted">{row.location}</span>
    ),
  },
  {
    key: "docs",
    label: "Docs",
    render: (row) => {
      const hasReports = row.reports && (row.reports as unknown[]).length > 0
      if (!hasReports) return null
      const count = (row.reports as unknown[]).length
      return (
        <span className="text-xs text-notion-muted/50 font-mono">
          {count === 1 ? "1 doc" : `${count} docs`}
        </span>
      )
    },
  },
]

interface MedicalEventsTableProps {
  events: MedicalEvent[]
}

export default function MedicalEventsTable({ events }: MedicalEventsTableProps) {
  const rows = events as MedicalEventRow[]

  return (
    <SiteTable
      columns={MEDICAL_EVENT_COLUMNS}
      data={rows}
      filters={FILTERS}
      filterKey="type"
      emptyMessage="No events found."
    />
  )
}
