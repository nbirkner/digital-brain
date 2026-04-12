"use client"

import { useState, useTransition } from "react"
import FilterTabs from "@/components/ui/FilterTabs"
import EmptyState from "@/components/ui/EmptyState"
import { groupByWeek } from "@/lib/group-by-week"

// ─── types ────────────────────────────────────────────────────────────────────

export interface ContentListProps<T> {
  items: T[]
  loading?: boolean

  // Filtering
  filters?: Array<{ label: string; value: string }>
  filterFn?: (item: T, activeFilter: string) => boolean

  // Search
  searchFn?: (item: T, query: string) => boolean

  // Grouping
  groupBy?: "week" | "month" | "tag" | "none"
  getGroup?: (item: T) => string
  renderGroup?: (label: string) => React.ReactNode

  // Rendering
  renderItem: (item: T) => React.ReactNode
  emptyMessage?: string

  // Pagination
  pageSize?: number

  // URL sync — ContentList fires callbacks; caller owns URL state
  onFilterChange?: (filter: string) => void
  onSearchChange?: (query: string) => void
  initialFilter?: string
  initialSearch?: string
}

// ─── skeleton ────────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <div className="space-y-0.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-3 py-3 rounded-lg animate-pulse"
        >
          <div className="flex-1 h-4 bg-notion-border/30 rounded" />
          <div className="w-16 h-3 bg-notion-border/20 rounded" />
          <div className="w-12 h-3 bg-notion-border/20 rounded" />
        </div>
      ))}
    </div>
  )
}

// ─── group section ────────────────────────────────────────────────────────────

function DefaultGroupHeader({ label }: { label: string }) {
  return (
    <div className="border-b border-notion-border/20 mb-2 pb-1">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-notion-muted/40">
        {label}
      </span>
    </div>
  )
}

interface GroupSectionProps<T> {
  label: string
  items: T[]
  renderItem: (item: T) => React.ReactNode
  renderGroup?: (label: string) => React.ReactNode
}

function GroupSection<T>({ label, items, renderItem, renderGroup }: GroupSectionProps<T>) {
  if (items.length === 0) return null
  return (
    <div className="mb-6">
      {renderGroup ? renderGroup(label) : <DefaultGroupHeader label={label} />}
      <div className="space-y-0.5">
        {items.map((item, idx) => (
          <div key={idx}>{renderItem(item)}</div>
        ))}
      </div>
    </div>
  )
}

// ─── month grouping ───────────────────────────────────────────────────────────

function getMonthKey(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`)
  return d.toISOString().slice(0, 7) // "YYYY-MM"
}

function formatMonthLabel(monthKey: string): string {
  const d = new Date(`${monthKey}-01T12:00:00`)
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

function groupByMonth<T extends { date?: string | null }>(
  items: T[]
): { label: string; items: T[] }[] {
  const map = new Map<string, T[]>()
  const undated: T[] = []

  for (const item of items) {
    if (!item.date) {
      undated.push(item)
      continue
    }
    const key = getMonthKey(item.date)
    const existing = map.get(key)
    if (existing) existing.push(item)
    else map.set(key, [item])
  }

  const groups = Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, groupItems]) => ({ label: formatMonthLabel(key), items: groupItems }))

  if (undated.length > 0) groups.push({ label: "Undated", items: undated })

  return groups
}

// ─── tag grouping ─────────────────────────────────────────────────────────────

function groupByTag<T extends { tags?: string[] }>(
  items: T[]
): { label: string; items: T[] }[] {
  const map = new Map<string, T[]>()

  for (const item of items) {
    const tag = item.tags?.[0] ?? "Uncategorized"
    const existing = map.get(tag)
    if (existing) existing.push(item)
    else map.set(tag, [item])
  }

  return Array.from(map.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .map(([label, groupItems]) => ({ label: `${label} (${groupItems.length})`, items: groupItems }))
}

// ─── main component ───────────────────────────────────────────────────────────

export default function ContentList<T>({
  items,
  loading = false,
  filters,
  filterFn,
  searchFn,
  groupBy = "none",
  getGroup,
  renderGroup,
  renderItem,
  emptyMessage = "nothing here yet",
  pageSize,
  onFilterChange,
  onSearchChange,
  initialFilter,
  initialSearch = "",
}: ContentListProps<T>) {
  const defaultFilter = initialFilter ?? filters?.[0]?.value ?? "all"
  const [activeFilter, setActiveFilter] = useState(defaultFilter)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [page, setPage] = useState(1)
  const [, startTransition] = useTransition()

  // ─── filter ───────────────────────────────────────────────────────────────

  const filtered = items.filter((item) => {
    const passesFilter = !filterFn || activeFilter === "all" || filterFn(item, activeFilter)
    const passesSearch = !searchFn || !searchQuery.trim() || searchFn(item, searchQuery.trim())
    return passesFilter && passesSearch
  })

  // ─── paginate ─────────────────────────────────────────────────────────────

  const totalCount = filtered.length
  const totalPages = pageSize ? Math.max(1, Math.ceil(totalCount / pageSize)) : 1
  const currentPage = Math.min(page, totalPages)
  const pageItems = pageSize
    ? filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filtered

  // ─── group ────────────────────────────────────────────────────────────────

  type GroupEntry = { label: string; items: T[] }

  const computeGroups = (): GroupEntry[] => {
    if (getGroup) {
      const map = new Map<string, T[]>()
      for (const item of pageItems) {
        const key = getGroup(item)
        const existing = map.get(key)
        if (existing) existing.push(item)
        else map.set(key, [item])
      }
      return Array.from(map.entries()).map(([label, groupItems]) => ({ label, items: groupItems }))
    }

    if (groupBy === "week") {
      const { groups, undated } = groupByWeek(pageItems as (T & { date?: string | null })[], "newest")
      const result: GroupEntry[] = groups.map((g) => ({ label: g.label, items: g.items as T[] }))
      if (undated.length > 0) result.push({ label: "Undated", items: undated as T[] })
      return result
    }

    if (groupBy === "month") {
      return groupByMonth(pageItems as (T & { date?: string | null })[]) as GroupEntry[]
    }

    if (groupBy === "tag") {
      return groupByTag(pageItems as (T & { tags?: string[] })[]) as GroupEntry[]
    }

    return []
  }

  const groups = computeGroups()
  const isGrouped = groupBy !== "none" || !!getGroup
  const isEmpty = filtered.length === 0

  // ─── handlers ─────────────────────────────────────────────────────────────

  function handleFilterChange(value: string) {
    startTransition(() => {
      setActiveFilter(value)
      setPage(1)
      onFilterChange?.(value)
    })
  }

  function handleSearchChange(value: string) {
    startTransition(() => {
      setSearchQuery(value)
      setPage(1)
      onSearchChange?.(value)
    })
  }

  function handlePageChange(next: number) {
    startTransition(() => setPage(next))
  }

  // ─── filter tabs config ───────────────────────────────────────────────────

  const filterTabs = filters?.map((f) => ({ id: f.value, label: f.label }))

  // ─── render ───────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Controls row */}
      {(filterTabs || searchFn) && (
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {filterTabs && (
            <FilterTabs
              tabs={filterTabs}
              active={activeFilter}
              onChange={handleFilterChange}
            />
          )}

          {searchFn && (
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="search..."
              className="ml-auto text-xs px-3 py-1.5 rounded-md bg-notion-surface border border-notion-border text-notion-text placeholder:text-notion-muted/50 outline-none focus:border-notion-border/80 transition-colors min-w-[160px]"
            />
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <SkeletonRows />
      ) : isEmpty ? (
        <EmptyState message={emptyMessage} />
      ) : isGrouped ? (
        <div>
          {groups.map((group) => (
            <GroupSection
              key={group.label}
              label={group.label}
              items={group.items}
              renderItem={renderItem}
              renderGroup={renderGroup}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-0.5">
          {pageItems.map((item, idx) => (
            <div key={idx}>{renderItem(item)}</div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-notion-border">
          <span className="text-xs text-notion-muted font-mono">
            page {currentPage} of {totalPages} ({totalCount} items)
          </span>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-3 py-1.5 text-xs rounded-lg border border-notion-border hover:bg-notion-hover transition-colors text-notion-text"
              >
                prev
              </button>
            )}
            {currentPage < totalPages && (
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-3 py-1.5 text-xs rounded-lg border border-notion-border hover:bg-notion-hover transition-colors text-notion-text"
              >
                next
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
