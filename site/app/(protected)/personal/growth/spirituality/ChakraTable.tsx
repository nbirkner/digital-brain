"use client"

import SiteTable from "@/components/data/SiteTable"
import type { SiteTableColumn } from "@/components/data/SiteTable"

interface ChakraRow {
  emoji: string
  position: string
  symbol: string
  note: string
}

const columns: SiteTableColumn<Record<string, unknown>>[] = [
  {
    key: "emoji",
    label: "",
    render: (row) => <span className="text-base">{String(row.emoji)}</span>,
  },
  {
    key: "position",
    label: "Chakra",
    render: (row) => (
      <span className="text-notion-muted text-xs font-medium">{String(row.position)}</span>
    ),
  },
  {
    key: "symbol",
    label: "Name",
    render: (row) => (
      <span className="text-notion-text font-semibold text-sm">{String(row.symbol)}</span>
    ),
  },
  {
    key: "note",
    label: "Note",
    hideOnMobile: true,
    render: (row) => (
      <span className="text-notion-muted text-xs italic leading-snug">{String(row.note)}</span>
    ),
  },
]

export default function ChakraTable({ data }: { data: ChakraRow[] }) {
  return (
    <SiteTable
      columns={columns}
      data={data as unknown as Record<string, unknown>[]}
    />
  )
}
