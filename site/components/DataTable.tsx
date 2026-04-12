"use client"

import { useState } from "react"
import FilterTabs from "@/components/FilterTabs"

export interface TableColumn<T = Record<string, unknown>> {
  key: string
  label: string
  hideOnMobile?: boolean
  render?: (row: T) => React.ReactNode
}

export interface TableFilter {
  label: string
  value: string
}

interface DataTableProps<T = Record<string, unknown>> {
  columns: TableColumn<T>[]
  data: T[]
  filterKey?: string
  filters?: TableFilter[]
  emptyMessage?: string
  indicatorKey?: string
  indicatorTitle?: string
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  filterKey,
  filters,
  emptyMessage = "No data found.",
  indicatorKey,
  indicatorTitle,
}: DataTableProps<T>) {
  const [activeFilter, setActiveFilter] = useState("all")

  const tabs = filters
    ? filters.map((f) => ({ id: f.value, label: f.label }))
    : []

  const filtered =
    !filterKey || activeFilter === "all"
      ? data
      : data.filter((row) => String(row[filterKey]) === activeFilter)

  return (
    <div>
      {tabs.length > 0 && (
        <FilterTabs tabs={tabs} active={activeFilter} onChange={setActiveFilter} className="mb-4" />
      )}

      <div className="bg-notion-surface border border-notion-border rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-notion-muted text-sm py-8 text-center">{emptyMessage}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-notion-border">
                  {indicatorKey && <th className="px-3 py-2.5 w-4" />}
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
                {filtered.map((row, i) => (
                  <tr
                    key={i}
                    className={`${i < filtered.length - 1 ? "border-b border-notion-border" : ""} hover:bg-notion-hover transition-colors`}
                  >
                    {indicatorKey && (
                      <td className="px-3 py-3">
                        {!!row[indicatorKey] && (
                          <span
                            className="block w-1.5 h-1.5 rounded-full bg-emerald-500"
                            title={indicatorTitle}
                          />
                        )}
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 text-sm text-notion-text${col.hideOnMobile ? " hidden sm:table-cell" : ""}`}
                      >
                        {col.render ? col.render(row) : String(row[col.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
