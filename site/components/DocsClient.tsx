"use client"

import { useState, useCallback, useTransition, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import FilterTabs from "@/components/FilterTabs"
import { DocMeta, formatDocDate } from "@/lib/docs"
import { TAG_MAP, TagCategory } from "@/lib/tag-taxonomy"
import TagPill from "@/components/TagPill"
import GroupedTagDropdown from "@/components/GroupedTagDropdown"
import { groupByWeek } from "@/lib/group-by-week"

// ─── types ────────────────────────────────────────────────────────────────────

type DomainFilter = "all" | "work" | "personal"
type SortOrder = "newest" | "oldest"

// ─── doc row ──────────────────────────────────────────────────────────────────

const SKIP_TAGS = new Set(["work", "personal", "doc"])

type DomainType = "work" | "personal"

const DOMAIN_STYLES: Record<DomainType, string> = {
  work: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  personal: "bg-purple-500/10 text-purple-400 border-purple-500/20",
}

const DOMAIN_LABELS: Record<DomainType, string> = {
  work: "Work",
  personal: "Personal",
}

const LABEL_TAG_ORDER: TagCategory[] = ["type", "work-area", "area", "meeting-type"]

function pickLabelTag(tags: string[]): string | null {
  if (!tags?.length) return null
  const candidates = tags.filter((t) => !SKIP_TAGS.has(t))
  for (const cat of LABEL_TAG_ORDER) {
    const match = candidates.find((t) => TAG_MAP[t]?.category === cat)
    if (match) return match
  }
  return candidates[0] ?? null
}

function DocRow({ doc, isFocused }: { doc: DocMeta; isFocused?: boolean }) {
  const router = useRouter()
  const dateLabel = formatDocDate(doc)
  const fullPageHref = `/docs/${doc.filePath.replace(/\.md$/, "")}`

  const labelTag = pickLabelTag(doc.autoTags ?? [])

  const domainKey = doc.domain as DomainType | undefined

  return (
    <div
      onClick={() => router.push(fullPageHref)}
      className={`flex items-center gap-2 px-3 py-3 rounded-lg transition-colors cursor-pointer group min-h-[44px] ${
        isFocused
          ? "bg-notion-hover/50 ring-1 ring-inset ring-notion-accent/20"
          : "hover:bg-notion-hover"
      }`}
    >
      <span className="flex-1 text-sm text-notion-text truncate min-w-0 select-none">
        {doc.title}
      </span>
      <div className="hidden sm:flex items-center gap-1 shrink-0">
        {domainKey && DOMAIN_STYLES[domainKey] && (
          <span className={`text-[9px] border px-1.5 py-0.5 rounded ${DOMAIN_STYLES[domainKey]}`}>
            {DOMAIN_LABELS[domainKey]}
          </span>
        )}
        {labelTag && (
          <TagPill tagId={labelTag} href={`/labels/${labelTag}`} size="sm" />
        )}
      </div>
      {dateLabel && (
        <span className="shrink-0 text-xs font-mono text-notion-muted/60 tabular-nums">
          {dateLabel}
        </span>
      )}
    </div>
  )
}

// ─── week group section ───────────────────────────────────────────────────────

function WeekGroupSection({ label, items, focusedFilePath }: { label: string; items: DocMeta[]; focusedFilePath?: string | null }) {
  if (items.length === 0) return null
  return (
    <div className="mb-6">
      <div className="border-b border-notion-border/20 mb-2 pb-1">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-notion-muted/40">
          {label}
        </span>
      </div>
      <div className="space-y-0.5">
        {items.map((doc) => (
          <DocRow key={doc.filePath} doc={doc} isFocused={focusedFilePath === doc.filePath} />
        ))}
      </div>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

const PER_PAGE = 100

interface DocsClientProps {
  docs: DocMeta[]
  hideDomainFilter?: boolean
  defaultDomain?: DomainFilter
  groupBy?: "week" | "label"
}

export default function DocsClient({ docs, hideDomainFilter = false, defaultDomain = "all", groupBy = "week" }: DocsClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const initialDomain = (searchParams.get("domain") as DomainFilter) || defaultDomain
  const initialDocType = searchParams.get("docType") || null

  const [domainFilter, setDomainFilter] = useState<DomainFilter>(initialDomain)
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest")
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [docTypeFilter, setDocTypeFilter] = useState<string | null>(initialDocType)
  const [page, setPage] = useState(1)
  const [focusedFilePath, setFocusedFilePath] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const updateUrl = useCallback((domain: string, docType: string | null) => {
    const params = new URLSearchParams()
    if (domain !== "all") params.set("domain", domain)
    if (docType) params.set("docType", docType)
    const query = params.toString()
    router.replace(query ? `?${query}` : "/docs", { scroll: false })
  }, [router])

  // Filter by domain
  const filtered = docs.filter((doc) => {
    if (domainFilter === "work") return doc.domain === "work"
    if (domainFilter === "personal") return doc.domain === "personal"
    return true
  })

  // Collect available tags from domain-filtered docs
  const availableTags = Array.from(
    new Set(filtered.flatMap(d => d.autoTags ?? []))
  ).sort()

  // Filter by tag
  const tagFiltered = filtered.filter(doc => {
    if (!tagFilter) return true
    return doc.autoTags?.includes(tagFilter) ?? false
  })

  // Filter by docType
  const docTypeFiltered = tagFiltered.filter(doc => {
    if (!docTypeFilter) return true
    return doc.docType === docTypeFilter
  })

  // Collect available docTypes from domain-filtered docs (before docType filter)
  const _availableDocTypes = Array.from(
    new Set(tagFiltered.map(d => d.docType))
  ).sort() as string[]

  // Sort
  const sorted = [...docTypeFiltered].sort((a, b) => {
    const da = a.date ?? ""
    const db = b.date ?? ""
    if (sortOrder === "newest") return db.localeCompare(da)
    return da.localeCompare(db)
  })

  // Paginate
  const totalCount = sorted.length
  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  // Group by week or label
  const { groups, undated } = groupByWeek(pageItems, sortOrder)

  // Label grouping
  const labelGroups = (() => {
    if (groupBy !== "label") return []
    const map = new Map<string, DocMeta[]>()
    for (const doc of pageItems) {
      const key = doc.docType
      const existing = map.get(key)
      if (existing) existing.push(doc)
      else map.set(key, [doc])
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .map(([label, groupDocs]) => ({
        label: `${label} (${groupDocs.length})`,
        items: groupDocs.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "")),
      }))
  })()

  // Flat list of visible doc filePaths for keyboard navigation
  const allVisibleFilePaths = useMemo(() => pageItems.map((d) => d.filePath), [pageItems])

  // Keyboard navigation: j=down, k=up, Enter=open focused doc
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't interfere with typing in inputs/textareas
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return

      if (e.key === "Escape") {
        setFocusedFilePath(null)
        return
      }

      if (e.key === "j" || e.key === "k") {
        e.preventDefault()
        if (allVisibleFilePaths.length === 0) return
        if (!focusedFilePath) {
          setFocusedFilePath(allVisibleFilePaths[0])
          return
        }
        const currentIdx = allVisibleFilePaths.indexOf(focusedFilePath)
        if (e.key === "j") {
          const nextIdx = currentIdx < allVisibleFilePaths.length - 1 ? currentIdx + 1 : currentIdx
          setFocusedFilePath(allVisibleFilePaths[nextIdx])
        } else {
          const prevIdx = currentIdx > 0 ? currentIdx - 1 : 0
          setFocusedFilePath(allVisibleFilePaths[prevIdx])
        }
        return
      }

      if (e.key === "Enter" && focusedFilePath) {
        e.preventDefault()
        const href = `/docs/${focusedFilePath.replace(/\.md$/, "")}`
        router.push(href)
        return
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [allVisibleFilePaths, focusedFilePath, router])

  const tabs: { id: DomainFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "work", label: "Work" },
    { id: "personal", label: "Personal" },
  ]

  return (
    <div>
      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {!hideDomainFilter && (
            <FilterTabs tabs={tabs} active={domainFilter} onChange={(id) => {
              startTransition(() => {
                const newDomain = id as DomainFilter
                setDomainFilter(newDomain)
                setTagFilter(null)
                setDocTypeFilter(null)
                setPage(1)
                updateUrl(newDomain, null)
              })
            }} />
          )}
          <GroupedTagDropdown
            availableTags={availableTags}
            selected={tagFilter}
            onChange={(tag) => {
              if (tag) {
                router.push(`/labels/${tag}`)
              } else {
                setTagFilter(null)
                setPage(1)
              }
            }}
          />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {(["newest", "oldest"] as SortOrder[]).map((opt) => (
            <button
              key={opt}
              onClick={() => startTransition(() => { setSortOrder(opt); setPage(1) })}
              className={`text-[11px] px-2 py-1 rounded-full transition-colors ${
                sortOrder === opt
                  ? "bg-notion-surface border border-notion-border text-notion-text"
                  : "text-notion-muted hover:text-notion-text"
              }`}
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {docTypeFiltered.length === 0 ? (
        <p className="text-sm text-notion-muted px-1">No docs match this filter.</p>
      ) : groupBy === "label" ? (
        <div>
          {labelGroups.map((group) => (
            <WeekGroupSection key={group.label} label={group.label} items={group.items} focusedFilePath={focusedFilePath} />
          ))}
        </div>
      ) : (
        <div>
          {groups.map((group) => (
            <WeekGroupSection key={group.weekStart} label={group.label} items={group.items} focusedFilePath={focusedFilePath} />
          ))}
          {undated.length > 0 && (
            <WeekGroupSection label="Undated" items={undated} focusedFilePath={focusedFilePath} />
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
                onClick={() => startTransition(() => setPage(currentPage - 1))}
                className="px-3 py-1.5 text-xs rounded-lg border border-notion-border hover:bg-notion-hover transition-colors text-notion-text"
              >
                prev
              </button>
            )}
            {currentPage < totalPages && (
              <button
                onClick={() => startTransition(() => setPage(currentPage + 1))}
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
