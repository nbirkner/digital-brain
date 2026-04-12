"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import MiniSearch from "minisearch"
import { useRouter } from "next/navigation"
import SearchInput from "./SearchInput"
import SearchResults from "./SearchResults"

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
        <SearchInput query={query} onChange={setQuery} inputRef={inputRef} />

        <SearchResults
          query={query}
          results={results}
          taskResults={taskResults}
          recents={recents}
          loading={loading}
          selected={selected}
          listRef={listRef}
          onSelect={setSelected}
          onNavigate={navigate}
        />

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
