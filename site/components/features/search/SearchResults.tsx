"use client"

import { RefObject } from "react"
import Link from "next/link"

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

const WORK_PROJECT_ID = "6gJQX58PhPc45mFV"
const PERSONAL_PROJECT_ID = "6gJQX59VjmrQFHMG"

function projectLabel(projectId: string): string {
  if (projectId === WORK_PROJECT_ID) return "Work"
  if (projectId === PERSONAL_PROJECT_ID) return "Personal"
  return ""
}

export function highlightMatch(title: string, query: string): React.ReactNode {
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

export function groupBySection(results: SearchEntry[]): { section: string; items: SearchEntry[] }[] {
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

interface Props {
  query: string
  results: SearchEntry[]
  taskResults: TaskResult[]
  recents: RecentEntry[]
  loading: boolean
  selected: number
  listRef: RefObject<HTMLUListElement>
  onSelect: (idx: number) => void
  onNavigate: (url: string, entry?: { title: string; icon: string; section: string }) => void
}

export default function SearchResults({
  query,
  results,
  taskResults,
  recents,
  loading,
  selected,
  listRef,
  onSelect,
  onNavigate,
}: Props) {
  const totalResults = results.length + taskResults.length
  const groups = groupBySection(results)
  let flatIndex = 0

  return (
    <>
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
                          onNavigate(r.url, { title: r.title, icon: r.icon, section: r.section })
                        }}
                        className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-all ${
                          idx === selected
                            ? "bg-notion-accent/10 border-l-2 border-notion-accent"
                            : "hover:bg-notion-hover border-l-2 border-transparent"
                        }`}
                        onMouseEnter={() => onSelect(idx)}
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
                          onNavigate(taskUrl, { title: task.content, icon: "✅", section: "tasks" })
                        }}
                        className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-all ${
                          idx === selected
                            ? "bg-notion-accent/10 border-l-2 border-notion-accent"
                            : "hover:bg-notion-hover border-l-2 border-transparent"
                        }`}
                        onMouseEnter={() => onSelect(idx)}
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
                    onNavigate("/tasks")
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
                {recents.map((r) => (
                  <li key={r.url}>
                    <Link
                      href={r.url}
                      onClick={(e) => {
                        e.preventDefault()
                        onNavigate(r.url, { title: r.title, icon: r.icon, section: r.section })
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
    </>
  )
}
