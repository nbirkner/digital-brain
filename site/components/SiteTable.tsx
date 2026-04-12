"use client"

import { useState } from "react"
import Link from "next/link"
import FilterTabs from "@/components/FilterTabs"

export interface SiteTableColumn<T = Record<string, unknown>> {
  key: string
  label: string
  hideOnMobile?: boolean
  render?: (row: T) => React.ReactNode
}

export interface SiteTableSection<T> {
  title: string
  rows: T[]
  defaultOpen?: boolean
}

interface SiteTableProps<T extends Record<string, unknown>> {
  columns: SiteTableColumn<T>[]
  data?: T[]
  sections?: SiteTableSection<T>[]
  filters?: { id: string; label: string }[]
  filterKey?: string
  getRowHref?: (row: T) => string | undefined
  emptyMessage?: string
  faded?: boolean
}

function TableRows<T extends Record<string, unknown>>({
  rows,
  columns,
  getRowHref,
  emptyMessage,
}: {
  rows: T[]
  columns: SiteTableColumn<T>[]
  getRowHref?: (row: T) => string | undefined
  emptyMessage?: string
}) {
  if (rows.length === 0) {
    return (
      <tr>
        <td colSpan={columns.length} className="px-4 py-8 text-center text-notion-muted text-sm">
          {emptyMessage ?? "No data found."}
        </td>
      </tr>
    )
  }

  return (
    <>
      {rows.map((row, i) => {
        const href = getRowHref?.(row)
        const isLast = i === rows.length - 1
        const rowClass = `${!isLast ? "border-b border-notion-border" : ""} hover:bg-notion-hover transition-colors`

        const cells = columns.map((col) => (
          <td
            key={col.key}
            className={`px-4 py-3 text-sm text-notion-text${col.hideOnMobile ? " hidden sm:table-cell" : ""}`}
          >
            {col.render ? col.render(row) : String(row[col.key] ?? "")}
          </td>
        ))

        if (href) {
          return (
            <tr key={i} className={rowClass}>
              {columns.map((col, ci) => {
                const isFirst = ci === 0
                return (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-sm text-notion-text${col.hideOnMobile ? " hidden sm:table-cell" : ""}${isFirst ? " font-medium" : ""}`}
                  >
                    {isFirst ? (
                      <Link href={href} className="hover:text-notion-accent transition-colors">
                        {col.render ? col.render(row) : String(row[col.key] ?? "")}
                      </Link>
                    ) : col.render ? (
                      col.render(row)
                    ) : (
                      String(row[col.key] ?? "")
                    )}
                  </td>
                )
              })}
            </tr>
          )
        }

        return (
          <tr key={i} className={rowClass}>
            {cells}
          </tr>
        )
      })}
    </>
  )
}

function TableShell<T extends Record<string, unknown>>({
  columns,
  rows,
  getRowHref,
  emptyMessage,
  faded,
}: {
  columns: SiteTableColumn<T>[]
  rows: T[]
  getRowHref?: (row: T) => string | undefined
  emptyMessage?: string
  faded?: boolean
}) {
  return (
    <div className={`bg-notion-surface border border-notion-border rounded-xl overflow-hidden${faded ? " opacity-60" : ""}`}>
      {rows.length === 0 ? (
        <p className="text-notion-muted text-sm py-8 text-center">{emptyMessage ?? "No data found."}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-notion-border">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-notion-muted/60${col.hideOnMobile ? " hidden sm:table-cell" : ""}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <TableRows
                rows={rows}
                columns={columns}
                getRowHref={getRowHref}
                emptyMessage={emptyMessage}
              />
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function CollapsibleSection<T extends Record<string, unknown>>({
  section,
  columns,
  getRowHref,
  emptyMessage,
  faded,
}: {
  section: SiteTableSection<T>
  columns: SiteTableColumn<T>[]
  getRowHref?: (row: T) => string | undefined
  emptyMessage?: string
  faded?: boolean
}) {
  const [open, setOpen] = useState(section.defaultOpen ?? true)

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 mb-3 group"
      >
        <span className={`text-notion-muted transition-transform duration-150${open ? " rotate-90" : ""}`}>▶</span>
        <span className="text-sm font-semibold text-notion-muted uppercase tracking-wider group-hover:text-notion-text transition-colors">
          {section.title} ({section.rows.length})
        </span>
      </button>
      {open && (
        section.rows.length > 0 ? (
          <TableShell
            columns={columns}
            rows={section.rows}
            getRowHref={getRowHref}
            emptyMessage={emptyMessage}
            faded={faded}
          />
        ) : (
          <p className="text-notion-muted text-sm">{emptyMessage ?? "No data found."}</p>
        )
      )}
    </div>
  )
}

export default function SiteTable<T extends Record<string, unknown>>({
  columns,
  data,
  sections,
  filters,
  filterKey,
  getRowHref,
  emptyMessage,
  faded,
}: SiteTableProps<T>) {
  const [activeFilter, setActiveFilter] = useState("all")

  const filterRows = (rows: T[]) => {
    if (!filterKey || activeFilter === "all") return rows
    return rows.filter((row) => String(row[filterKey]) === activeFilter)
  }

  const tabs = filters ?? []

  return (
    <div>
      {tabs.length > 0 && (
        <FilterTabs tabs={tabs} active={activeFilter} onChange={setActiveFilter} className="mb-4" />
      )}

      {sections ? (
        <div className="space-y-4">
          {sections
            .map((section) => ({ ...section, rows: filterRows(section.rows) }))
            .filter((section) => section.rows.length > 0)
            .map((section, i) => (
              <CollapsibleSection
                key={i}
                section={section}
                columns={columns}
                getRowHref={getRowHref}
                emptyMessage={emptyMessage}
                faded={faded}
              />
            ))}
        </div>
      ) : (
        <TableShell
          columns={columns}
          rows={filterRows(data ?? [])}
          getRowHref={getRowHref}
          emptyMessage={emptyMessage}
          faded={faded}
        />
      )}
    </div>
  )
}
