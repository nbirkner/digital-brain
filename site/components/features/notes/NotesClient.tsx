"use client"

import { useState, useTransition } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import EmptyState from "@/components/ui/EmptyState"
import FilterTabs from "@/components/ui/FilterTabs"
import GroupedTagDropdown from "@/components/data/GroupedTagDropdown"
import { TAGS_BY_CATEGORY, getTagDef, TAG_MAP, TagCategory } from "@/lib/tag-taxonomy"
import TagPill from "@/components/ui/TagPill"
import { groupByWeek } from "@/lib/group-by-week"

// ─── types ────────────────────────────────────────────────────────────────────

type CategoryType = "work" | "personal" | "shared"
type CategoryFilter = "all" | CategoryType
type SortOrder = "newest" | "oldest"

export interface NoteItem {
  slug: string
  displayTitle: string
  date: string
  category: CategoryType
  label?: string
  href: string
  tags: string[]
  frontmatter: Record<string, string>
}

// ─── constants ────────────────────────────────────────────────────────────────

const PER_PAGE = 100

// Tags that are redundant in this context
const META_TAGS = new Set(["log", "journal", "reflection", "goal", "prd", "dream", "quote", "work", "personal", "shared"])

// Category pill colors
const CATEGORY_STYLES: Record<CategoryType, string> = {
  work: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  personal: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  shared: "bg-notion-surface text-notion-muted border-notion-border/60",
}

const CATEGORY_LABELS: Record<CategoryType, string> = {
  work: "Work",
  personal: "Personal",
  shared: "Shared",
}

// ─── date helpers ─────────────────────────────────────────────────────────────

function formatDateShort(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// ─── sorting ──────────────────────────────────────────────────────────────────

function sortItems(items: NoteItem[], order: SortOrder): NoteItem[] {
  return [...items].sort((a, b) => {
    const da = a.date ?? ""
    const db = b.date ?? ""
    if (order === "newest") return db.localeCompare(da)
    return da.localeCompare(db)
  })
}

// Tags to skip when finding the first meaningful label pill
const SKIP_LABEL_TAGS = new Set([...Array.from(META_TAGS), "work", "personal", "note", "doc"])

const LABEL_TAG_ORDER: TagCategory[] = ["type", "work-area", "area", "meeting-type"]

function pickLabelTag(tags: string[]): string | null {
  if (!tags?.length) return null
  const candidates = tags.filter((t) => !SKIP_LABEL_TAGS.has(t))
  for (const cat of LABEL_TAG_ORDER) {
    const match = candidates.find((t) => TAG_MAP[t]?.category === cat)
    if (match) return match
  }
  return candidates[0] ?? null
}

// ─── sub-components ───────────────────────────────────────────────────────────

function NoteRow({ item }: { item: NoteItem }) {
  const router = useRouter()
  const labelTagId = pickLabelTag(item.tags)

  return (
    <div
      onClick={() => router.push(item.href)}
      className="flex items-center gap-2 px-3 py-3 rounded-lg hover:bg-notion-hover transition-colors group min-h-[44px] cursor-pointer"
    >
      <span className="flex-1 text-sm text-notion-text group-hover:text-notion-text truncate min-w-0 select-none">
        {item.displayTitle}
      </span>

      <div className="hidden sm:flex items-center gap-1 shrink-0">
        {/* Category pill */}
        <span
          className={`text-[9px] border px-1.5 py-0.5 rounded ${CATEGORY_STYLES[item.category]}`}
        >
          {CATEGORY_LABELS[item.category]}
        </span>

        {/* Taxonomy label pill — navigates to /labels/[tagId] */}
        {labelTagId && (
          <TagPill tagId={labelTagId} href={`/labels/${labelTagId}`} size="sm" />
        )}
      </div>

      {item.date && (
        <span className="shrink-0 text-xs font-mono text-notion-muted/60 tabular-nums">
          {formatDateShort(item.date)}
        </span>
      )}
    </div>
  )
}

interface WeekGroupSectionProps {
  label: string
  items: NoteItem[]
}

function WeekGroupSection({ label, items }: WeekGroupSectionProps) {
  if (items.length === 0) return null
  return (
    <div className="mb-6">
      <div className="border-b border-notion-border/20 mb-2 pb-1">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-notion-muted/40">
          {label}
        </span>
      </div>
      <div className="space-y-0.5">
        {items.map((item) => (
          <NoteRow key={`${item.category}:${item.slug}`} item={item} />
        ))}
      </div>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

interface NotesClientProps {
  items: NoteItem[]
  defaultCategory?: CategoryFilter
  hideDomainFilter?: boolean
  groupBy?: "date" | "label"
}

export default function NotesClient({ items, defaultCategory = "all", hideDomainFilter = false, groupBy = "date" }: NotesClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Read initial filters from URL
  const urlDomain = searchParams.get("domain") as CategoryFilter | null
  const urlLabel = searchParams.get("label")
  const initialCategory: CategoryFilter = urlDomain && ["work", "personal", "shared"].includes(urlDomain) ? urlDomain : defaultCategory

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(initialCategory)
  const [tagFilter, setTagFilter] = useState<string | null>(urlLabel)
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest")
  const [page, setPage] = useState(1)
  const [, startTransition] = useTransition()

  // Sync URL when filters change
  const updateUrl = (domain: CategoryFilter, label: string | null) => {
    const params = new URLSearchParams()
    if (domain !== "all") params.set("domain", domain)
    if (label) params.set("label", label)
    const query = params.toString()
    router.replace(query ? `?${query}` : "/notes", { scroll: false })
  }

  // Step 1: filter by category
  const categoryFiltered = items.filter((item) => {
    if (categoryFilter === "all") return true
    return item.category === categoryFilter
  })

  // Collect unique tags from category-filtered items
  const availableTags = Array.from(
    new Set(categoryFiltered.flatMap((i) => i.tags ?? []))
  ).sort()

  // Step 2: filter by tag
  const filtered = categoryFiltered.filter((item) => {
    if (!tagFilter) return true
    return item.tags.includes(tagFilter)
  })

  // Step 3: sort
  const sorted = sortItems(filtered, sortOrder)

  // Step 4: paginate
  const totalCount = sorted.length
  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const offset = (currentPage - 1) * PER_PAGE
  const pageItems = sorted.slice(offset, offset + PER_PAGE)

  // Step 5: group by week or label
  const { groups, undated } = groupByWeek(pageItems, sortOrder)

  // Label grouping
  const labelGroups = (() => {
    if (groupBy !== "label") return []
    const map = new Map<string, NoteItem[]>()
    for (const item of pageItems) {
      const key = item.label || "Uncategorized"
      const existing = map.get(key)
      if (existing) existing.push(item)
      else map.set(key, [item])
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .map(([label, groupItems]) => ({
        label: `${label} (${groupItems.length})`,
        items: groupItems.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "")),
      }))
  })()

  const isEmpty = filtered.length === 0

  // ─── filter change helpers ────────────────────────────────────────────────

  function handleCategoryFilter(f: CategoryFilter) {
    startTransition(() => {
      setCategoryFilter(f)
      setTagFilter(null)
      setPage(1)
      updateUrl(f, null)
    })
  }

  function handleTagFilter(t: string | null) {
    startTransition(() => {
      setTagFilter(t)
      setPage(1)
      updateUrl(categoryFilter, t)
    })
  }

  function handleSortChange(order: SortOrder) {
    startTransition(() => {
      setSortOrder(order)
      setPage(1)
    })
  }

  function handlePageChange(next: number) {
    startTransition(() => setPage(next))
  }

  // ─── tabs config ──────────────────────────────────────────────────────────

  const categoryTabs: { id: CategoryFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "work", label: "Work" },
    { id: "personal", label: "Personal" },
  ]

  return (
    <div>
      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {!hideDomainFilter && (
            <FilterTabs
              tabs={categoryTabs}
              active={categoryFilter}
              onChange={handleCategoryFilter}
            />
          )}

          {/* Tag dropdown */}
          <GroupedTagDropdown
            availableTags={availableTags}
            selected={tagFilter}
            onChange={handleTagFilter}
          />
        </div>

        {/* Sort control */}
        <div className="flex items-center gap-1 shrink-0">
          {([
            { id: "newest", label: "Newest" },
            { id: "oldest", label: "Oldest" },
          ] as { id: SortOrder; label: string }[]).map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleSortChange(opt.id)}
              className={`text-[11px] px-2 py-1 rounded-full transition-colors ${
                sortOrder === opt.id
                  ? "bg-notion-surface border border-notion-border text-notion-text"
                  : "text-notion-muted hover:text-notion-text"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Work sub-area + meeting type quick-filter pills (work domain only) */}
      {categoryFilter === "work" && (() => {
        const workTagIds = new Set([
          ...TAGS_BY_CATEGORY["work-area"].map((t) => t.id),
          ...TAGS_BY_CATEGORY["meeting-type"].map((t) => t.id),
        ])
        const presentWorkTags = Array.from(
          new Set(categoryFiltered.flatMap((i) => i.tags).filter((t) => workTagIds.has(t)))
        )
        if (presentWorkTags.length < 2) return null
        return (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {presentWorkTags.map((tagId) => {
              const def = getTagDef(tagId)
              const isActive = tagFilter === tagId
              return (
                <button
                  key={tagId}
                  onClick={() => handleTagFilter(isActive ? null : tagId)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                    isActive
                      ? `${def.color} border-current/30`
                      : "border-notion-border/40 text-notion-muted hover:text-notion-text hover:border-notion-border"
                  }`}
                >
                  {def.label}
                </button>
              )
            })}
          </div>
        )
      })()}

      {/* Content */}
      {isEmpty ? (
        <EmptyState
          icon="💭"
          message="a blank slate (rare, cherish it)"
          hint="Notes will appear here once added to work/notes or personal/notes."
        />
      ) : groupBy === "label" ? (
        <div>
          {labelGroups.map((group) => (
            <WeekGroupSection key={group.label} label={group.label} items={group.items} />
          ))}
        </div>
      ) : (
        <div>
          {groups.map((group) => (
            <WeekGroupSection key={group.weekStart} label={group.label} items={group.items} />
          ))}
          {undated.length > 0 && (
            <WeekGroupSection label="Undated" items={undated} />
          )}
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
