"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import MiniSearch from "minisearch"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface SearchEntry {
  title: string
  slug: string
  url: string
  icon: string
  section: string
  snippet: string
  date: string
  parent?: string
  parentTitle?: string
}

interface TaskResult {
  id: string
  content: string
  project_id: string
  due?: { date: string }
  priority: number
  labels?: string[]
}

interface RecentEntry {
  title: string
  url: string
  icon: string
  section: string
}

const WORK_PROJECT_ID = process.env.NEXT_PUBLIC_TODOIST_WORK_PROJECT_ID ?? ""
const PERSONAL_PROJECT_ID = process.env.NEXT_PUBLIC_TODOIST_PERSONAL_PROJECT_ID ?? ""

function projectLabel(projectId: string): string {
  if (projectId === WORK_PROJECT_ID) return "Work"
  if (projectId === PERSONAL_PROJECT_ID) return "Personal"
  return ""
}

interface Props {
  onClose: () => void
}

const RECENTS_KEY = "search-recents"
const MAX_RECENTS = 5

function loadRecents(): RecentEntry[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENTS) : []
  } catch {
    return []
  }
}

function saveRecent(entry: RecentEntry) {
  try {
    const existing = loadRecents()
    const deduped = existing.filter((r) => r.url !== entry.url)
    const updated = [entry, ...deduped].slice(0, MAX_RECENTS)
    localStorage.setItem(RECENTS_KEY, JSON.stringify(updated))
  } catch {
    // localStorage unavailable, silently ignore
  }
}

function highlightMatch(title: string, query: string): React.ReactNode {
  if (!query.trim()) return title
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const regex = new RegExp(`(${escaped})`, "gi")
  const parts = title.split(regex)
  if (parts.length === 1) return title
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="bg-notion-accent/20 text-notion-text rounded-sm">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

function groupBySection(results: SearchEntry[]): { section: string; items: SearchEntry[] }[] {
  const groups: { section: string; items: SearchEntry[] }[] = []
  const sectionMap = new Map<string, SearchEntry[]>()
  for (const r of results) {
    const key = r.section || "note"
    if (!sectionMap.has(key)) {
      const items: SearchEntry[] = []
      sectionMap.set(key, items)
      groups.push({ section: key, items })
    }
    sectionMap.get(key)!.push(r)
  }
  return groups
}

export default function GlobalSearch({ onClose }: Props) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchEntry[]>([])
  const [taskResults, setTaskResults] = useState<TaskResult[]>([])
  const [allTasks, setAllTasks] = useState<TaskResult[]>([])
  const [selected, setSelected] = useState(0)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [recents, setRecents] = useState<RecentEntry[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const searchRef = useRef<MiniSearch<SearchEntry> | null>(null)
  const router = useRouter()

  // Entrance animation + load recents
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true))
    setRecents(loadRecents())
  }, [])

  // Load search index + tasks and focus input
  useEffect(() => {
    inputRef.current?.focus()

    // Load search index via authenticated API route
    fetch("/api/search")
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load search index: ${r.status}`)
        return r.json()
      })
      .then((data: SearchEntry[]) => {
        const ms = new MiniSearch<SearchEntry>({
          fields: ["title", "snippet", "section", "tags", "subsection"],
          storeFields: ["title", "slug", "url", "icon", "section", "subsection", "snippet", "tags", "date", "parent", "parentTitle"],
          searchOptions: {
            boost: { title: 3, section: 1.5 },
            fuzzy: 0.2,
            prefix: true,
          },
        })
        ms.addAll(data.map((d, i) => ({ ...d, id: i })))
        searchRef.current = ms
        setLoading(false)
      })
      .catch((err) => {
        console.error("Search index load error:", err)
        setLoading(false)
      })

    // Load tasks for live search
    fetch("/api/todoist", { cache: "no-store", credentials: "same-origin" })
      .then((r) => {
        if (!r.ok) {
          console.error("[GlobalSearch] /api/todoist failed:", r.status, r.statusText)
          return []
        }
        return r.json()
      })
      .then((tasks: TaskResult[]) => setAllTasks(Array.isArray(tasks) ? tasks : []))
      .catch((err) => {
        console.error("[GlobalSearch] Failed to fetch tasks:", err)
        setAllTasks([])
      })
  }, [])

  // Search on query change
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setTaskResults([])
      setSelected(0)
      return
    }

    // Static index search — re-sort to boost shallower URLs (fewer path segments)
    // so section/hub pages surface above their sub-pages for the same query term.
    if (searchRef.current) {
      const raw = searchRef.current.search(query) as unknown as (SearchEntry & { score: number })[]
      const sorted = raw.slice(0, 20).sort((a, b) => {
        const depthA = (a.url || "").split("/").filter(Boolean).length
        const depthB = (b.url || "").split("/").filter(Boolean).length
        // Combine MiniSearch score with a depth penalty (shallower = better)
        const adjA = a.score - depthA * 0.5
        const adjB = b.score - depthB * 0.5
        return adjB - adjA
      })
      setResults(sorted.slice(0, 12))
    }

    // Live task filtering
    const q = query.toLowerCase()
    const matched = allTasks
      .filter((t) => t.content.toLowerCase().includes(q))
      .slice(0, 5)
    setTaskResults(matched)

    setSelected(0)
  }, [query, allTasks])

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const item = list.querySelector(`[data-search-idx="${selected}"]`) as HTMLElement | null
    item?.scrollIntoView({ block: "nearest" })
  }, [selected])

  const navigate = useCallback(
    (url: string, entry?: { title: string; icon: string; section: string }) => {
      try {
        if (entry) {
          saveRecent({ title: entry.title, url, icon: entry.icon, section: entry.section })
        }
        onClose()
        router.push(url)
      } catch (err) {
        console.error("Navigation error:", err)
      }
    },
    [onClose, router]
  )

  const totalResults = results.length + taskResults.length

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelected((s) => Math.min(s + 1, totalResults - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelected((s) => Math.max(s - 1, 0))
      } else if (e.key === "Enter") {
        e.preventDefault()
        if (selected < results.length) {
          const target = results[selected]
          if (target?.url) {
            navigate(target.url, { title: target.title, icon: target.icon, section: target.section })
          }
        } else {
          const taskIdx = selected - results.length
          const task = taskResults[taskIdx]
          if (task) {
            const url = `/tasks?taskId=${task.id}`
            navigate(url, { title: task.content, icon: "✅", section: "tasks" })
          }
        }
      }
    },
    [results, taskResults, totalResults, selected, onClose, navigate]
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [handleKey])

  // Build grouped results with a flat index for keyboard nav
  const groups = groupBySection(results)
  let flatIndex = 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      style={{
        backgroundColor: mounted ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0)",
        backdropFilter: "blur(4px)",
        transition: "background-color 150ms ease",
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="bg-notion-surface-elevated border border-notion-border/60 rounded-xl w-full max-w-lg mx-4 shadow-[0_24px_80px_rgba(0,0,0,0.5)] overflow-hidden"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "scale(1) translateY(0)" : "scale(0.98) translateY(-8px)",
          transition: "opacity 200ms cubic-bezier(0.16, 1, 0.3, 1), transform 200ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input row */}
        <div className="flex items-center gap-2 border-b border-notion-border/40 px-2 focus-within:outline-none focus-within:ring-0 focus-within:border-notion-border/40">
          <svg
            className="w-4 h-4 text-notion-muted/40 shrink-0 ml-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your brain..."
            className="no-focus-ring w-full bg-transparent px-3 py-3 text-sm text-notion-text placeholder-notion-muted/40 focus:outline-none"
          />
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-6 gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-notion-muted/30 animate-bounce"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        )}

        {/* Results list — grouped by section, then tasks */}
        {!loading && totalResults > 0 && (
          <ul ref={listRef} className="max-h-[50vh] overflow-y-auto py-1">
            {groups.map((group) => (
              <li key={group.section}>
                <div className="text-[10px] font-medium tracking-wider text-notion-muted/50 uppercase px-3 pt-2.5 pb-0.5">
                  {group.section}
                </div>
                <ul>
                  {group.items.map((r) => {
                    const idx = flatIndex++
                    return (
                      <li
                        key={r.url}
                        data-search-idx={idx}
                        className="animate-item-reveal opacity-0"
                        style={{ animationDelay: `${idx * 40}ms` }}
                      >
                        <Link
                          href={r.url}
                          onClick={(e) => {
                            e.preventDefault()
                            navigate(r.url, { title: r.title, icon: r.icon, section: r.section })
                          }}
                          className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-all ${
                            idx === selected
                              ? "bg-notion-accent/10 border-l-2 border-notion-accent"
                              : "hover:bg-notion-hover border-l-2 border-transparent"
                          }`}
                          onMouseEnter={() => setSelected(idx)}
                        >
                          <span className="text-sm shrink-0">{r.icon}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-notion-text truncate">
                              {highlightMatch(r.title, query)}
                            </p>
                            {r.parentTitle && (
                              <p className="text-[10px] text-purple-400/70 truncate mt-0.5">
                                ↳ {r.parentTitle}
                              </p>
                            )}
                          </div>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>
            ))}

            {/* Tasks section */}
            {taskResults.length > 0 && (
              <li key="tasks">
                <div className="text-[10px] font-medium tracking-wider text-notion-muted/50 uppercase px-3 pt-2.5 pb-0.5">
                  tasks
                </div>
                <ul>
                  {taskResults.map((task) => {
                    const idx = flatIndex++
                    const taskUrl = `/tasks?taskId=${task.id}`
                    const proj = projectLabel(task.project_id)
                    return (
                      <li
                        key={task.id}
                        data-search-idx={idx}
                        className="animate-item-reveal opacity-0"
                        style={{ animationDelay: `${idx * 40}ms` }}
                      >
                        <Link
                          href={taskUrl}
                          onClick={(e) => {
                            e.preventDefault()
                            navigate(taskUrl, { title: task.content, icon: "✅", section: "tasks" })
                          }}
                          className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-all ${
                            idx === selected
                              ? "bg-notion-accent/10 border-l-2 border-notion-accent"
                              : "hover:bg-notion-hover border-l-2 border-transparent"
                          }`}
                          onMouseEnter={() => setSelected(idx)}
                        >
                          <span className="text-sm shrink-0">✅</span>
                          <p className="text-sm font-medium text-notion-text truncate min-w-0 flex-1">
                            {highlightMatch(task.content, query)}
                          </p>
                          <span className="flex items-center gap-1.5 shrink-0">
                            {proj && (
                              <span className="text-[10px] text-notion-muted/50 font-medium">
                                {proj}
                              </span>
                            )}
                            {task.due?.date && (
                              <span className="text-[10px] text-notion-muted/40">
                                {task.due.date}
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
                {/* "See all" link when there might be more matches */}
                {taskResults.length >= 5 && (
                  <Link
                    href={`/tasks`}
                    onClick={(e) => {
                      e.preventDefault()
                      navigate("/tasks")
                    }}
                    className="block text-[11px] text-notion-accent/70 hover:text-notion-accent px-3 py-1.5 transition-colors"
                  >
                    See all in Tasks &rarr;
                  </Link>
                )}
              </li>
            )}
          </ul>
        )}

        {/* Empty state */}
        {query && totalResults === 0 && !loading && (
          <div className="px-5 py-6 text-center">
            <svg
              className="w-6 h-6 text-notion-muted/20 mx-auto mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-sm text-notion-muted">
              Nothing for &ldquo;{query}&rdquo; (yet)
            </p>
            <p className="text-xs text-notion-muted/40 mt-1.5">
              Try a different spelling or shorter query
            </p>
          </div>
        )}

        {/* Idle state: recents or hint */}
        {!query && !loading && (
          <div className="py-2">
            {recents.length > 0 ? (
              <>
                <div className="text-[10px] font-medium tracking-wider text-notion-muted/50 uppercase px-3 pt-2 pb-0.5">
                  Recent
                </div>
                <ul>
                  {recents.map((r, i) => (
                    <li key={r.url}>
                      <Link
                        href={r.url}
                        onClick={(e) => {
                          e.preventDefault()
                          navigate(r.url, { title: r.title, icon: r.icon, section: r.section })
                        }}
                        className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-notion-hover cursor-pointer transition-colors"
                      >
                        <span className="text-sm shrink-0">{r.icon}</span>
                        <span className="text-sm text-notion-muted truncate flex-1">{r.title}</span>
                        <span className="text-[10px] text-notion-muted/40 font-medium tracking-wide uppercase shrink-0">
                          {r.section || "note"}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="px-3 py-2 text-sm text-notion-muted">
                notes, tasks, journal, health, travel, and more — start typing
              </div>
            )}
          </div>
        )}

        {/* Footer keyboard hints — desktop only */}
        <div className="hidden sm:flex items-center gap-4 px-4 py-2 border-t border-notion-border/30">
          {query && totalResults > 0 ? (
            <span className="text-[10px] text-notion-muted/40 mr-auto">
              {totalResults} result{totalResults !== 1 ? "s" : ""}
            </span>
          ) : (
            <span className="mr-auto" />
          )}
          <span className="flex items-center gap-1.5 text-[10px] text-notion-muted/40">
            <kbd className="bg-notion-hover rounded px-1.5 py-0.5 text-[9px] font-mono">↑↓</kbd> navigate
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-notion-muted/40">
            <kbd className="bg-notion-hover rounded px-1.5 py-0.5 text-[9px] font-mono">↵</kbd> open
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-notion-muted/40">
            <kbd className="bg-notion-hover rounded px-1.5 py-0.5 text-[9px] font-mono">esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  )
}
