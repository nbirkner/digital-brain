"use client"

import { Fragment, useRef, useEffect, useState } from "react"
import FilterTabs from "@/components/ui/FilterTabs"
import { getTagDef, ALL_TAGS } from "@/lib/tag-taxonomy"
import { ViewTab, PriorityFilter, GroupBy } from "./types"

// ─── constants ────────────────────────────────────────────────────────────────

const FILTER_HIDDEN_LABELS = new Set(["triage", "note", "work", "personal"])

export const availableFilterLabels = ALL_TAGS
  .filter((t) => !FILTER_HIDDEN_LABELS.has(t.id))
  .map((t) => t.id)

// ─── types ────────────────────────────────────────────────────────────────────

export interface TaskFiltersProps {
  // Stats bar
  totalCount: number
  overdueCount: number
  dueTodayCount: number
  dueFilter: "all" | "overdue" | "today"
  onDueFilterChange: (filter: "all" | "overdue" | "today") => void

  // Search
  searchQuery: string
  onSearchChange: (q: string) => void

  // Add task button
  onAddTask: () => void

  // View tabs
  activeTab: ViewTab
  onTabChange: (tab: ViewTab) => void

  // Priority filter
  priorityFilter: PriorityFilter
  onPriorityChange: (p: PriorityFilter) => void

  // Tag filter
  tagFilter: string | null
  onTagFilterChange: (tag: string | null) => void

  // Group by
  groupBy: GroupBy
  onGroupByChange: (g: GroupBy) => void
}

// ─── TaskFilters component ────────────────────────────────────────────────────

export function TaskFilters({
  totalCount,
  overdueCount,
  dueTodayCount,
  dueFilter,
  onDueFilterChange,
  searchQuery,
  onSearchChange,
  onAddTask,
  activeTab,
  onTabChange,
  priorityFilter,
  onPriorityChange,
  tagFilter,
  onTagFilterChange,
  groupBy,
  onGroupByChange,
}: TaskFiltersProps) {
  const labelDropdownRef = useRef<HTMLDivElement>(null)
  const shortcutsRef = useRef<HTMLDivElement>(null)
  const [labelOpen, setLabelOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  // Close label dropdown on outside click
  useEffect(() => {
    if (!labelOpen) return
    function handleClick(e: MouseEvent) {
      if (labelDropdownRef.current && !labelDropdownRef.current.contains(e.target as Node)) {
        setLabelOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [labelOpen])

  // Close shortcuts on outside click or Escape
  useEffect(() => {
    if (!shortcutsOpen) return
    function handleClick(e: MouseEvent) {
      if (shortcutsRef.current && !shortcutsRef.current.contains(e.target as Node)) {
        setShortcutsOpen(false)
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setShortcutsOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleEsc)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleEsc)
    }
  }, [shortcutsOpen])

  const tabs: { id: ViewTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "work", label: "Work" },
    { id: "personal", label: "Personal" },
    { id: "shared", label: "Shared" },
    { id: "waiting", label: "Waiting For" },
  ]

  const priorities: { id: PriorityFilter; label: string }[] = [
    { id: "all", label: "All priorities" },
    { id: "p1", label: "P1" },
    { id: "p2", label: "P2" },
    { id: "p3", label: "P3" },
    { id: "p4", label: "P4" },
  ]

  const groupOptions: { id: GroupBy; label: string }[] = [
    { id: "due", label: "Due date" },
    { id: "priority", label: "Priority" },
    { id: "project", label: "Project" },
    { id: "labels", label: "Labels" },
    { id: "none", label: "None" },
  ]

  return (
    <>
      {/* Stats bar */}
      <div className="flex items-center gap-6 mb-6 px-1">
        <button
          onClick={() => onDueFilterChange("all")}
          className={`flex flex-col gap-0.5 text-left transition-opacity ${dueFilter !== "all" ? "opacity-40 hover:opacity-70" : ""}`}
        >
          <span className="text-xl tabular-nums leading-none font-semibold text-notion-text">{totalCount}</span>
          <span className="text-[10px] uppercase tracking-widest text-notion-muted/50 font-medium">total</span>
        </button>
        <button
          onClick={() => onDueFilterChange(dueFilter === "overdue" ? "all" : "overdue")}
          className={`flex flex-col gap-0.5 text-left transition-opacity ${dueFilter === "today" ? "opacity-40 hover:opacity-70" : ""}`}
        >
          <span className={`text-xl tabular-nums leading-none font-semibold ${overdueCount > 0 ? "text-red-400" : "text-notion-text"}`}>{overdueCount}</span>
          <span className={`text-[10px] uppercase tracking-widest font-medium ${dueFilter === "overdue" ? "text-red-400" : "text-notion-muted/50"}`}>overdue</span>
        </button>
        <button
          onClick={() => onDueFilterChange(dueFilter === "today" ? "all" : "today")}
          className={`flex flex-col gap-0.5 text-left transition-opacity ${dueFilter === "overdue" ? "opacity-40 hover:opacity-70" : ""}`}
        >
          <span className={`text-xl tabular-nums leading-none font-semibold ${dueTodayCount > 0 ? "text-amber-400" : "text-notion-text"}`}>{dueTodayCount}</span>
          <span className={`text-[10px] uppercase tracking-widest font-medium ${dueFilter === "today" ? "text-amber-400" : "text-notion-muted/50"}`}>due today</span>
        </button>

        {/* Search input */}
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="text-sm bg-transparent border-b border-notion-border/30 text-notion-text placeholder:text-notion-muted/40 outline-none px-1 py-1 w-48 focus:border-notion-border ml-auto"
        />

        {/* Add task button */}
        <button
          onClick={onAddTask}
          title="Add task (C)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-notion-border/40 text-[11px] text-notion-muted/60 hover:text-notion-text hover:border-notion-border hover:bg-notion-hover transition-all shrink-0"
        >
          <svg className="w-3 h-3" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 2v10M2 7h10" />
          </svg>
          <span className="hidden sm:inline">Add task</span>
          <kbd className="hidden sm:inline bg-notion-hover rounded px-1 py-0.5 text-[9px] font-mono text-notion-muted/40">C</kbd>
        </button>

        {/* Keyboard shortcuts legend */}
        <div className="relative" ref={shortcutsRef}>
          <button
            onClick={() => setShortcutsOpen((v) => !v)}
            className={`w-6 h-6 flex items-center justify-center rounded-md text-[11px] transition-colors ${
              shortcutsOpen
                ? "bg-notion-surface border border-notion-border text-notion-text"
                : "text-notion-muted/40 hover:text-notion-muted hover:bg-notion-hover"
            }`}
            title="Keyboard shortcuts"
          >
            ?
          </button>
          {shortcutsOpen && (
            <div className="absolute right-0 top-full mt-2 z-50 bg-notion-bg border border-notion-border rounded-lg shadow-lg p-3 w-[260px]">
              <p className="text-[10px] uppercase tracking-widest text-notion-muted/50 font-medium mb-2">Keyboard shortcuts</p>
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
                {[
                  ["C", "Create new task"],
                  ["↑ ↓", "Navigate tasks"],
                  ["⇧↑ ⇧↓", "Select multiple"],
                  ["t", "Set to today"],
                  ["d", "Open date picker"],
                  ["p", "Set priority"],
                  ["Space", "Open task actions"],
                  ["l", "Open labels"],
                  ["e", "Complete task"],
                  ["v", "Toggle Work/Personal"],
                  ["Enter", "Open detail panel"],
                  ["← →", "Collapse/expand groups"],
                  ["Esc", "Close/deselect"],
                ].map(([key, desc]) => (
                  <Fragment key={key}>
                    <kbd className="font-mono text-[10px] bg-notion-surface px-1.5 py-0.5 rounded text-notion-text/70 text-center whitespace-nowrap">{key}</kbd>
                    <span className="text-[10px] text-notion-muted leading-relaxed">{desc}</span>
                  </Fragment>
                ))}
              </div>
              <div className="mt-3 pt-2.5 border-t border-notion-border">
                <p className="text-[10px] uppercase tracking-widest text-notion-muted/50 font-medium mb-2">Navigation</p>
                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
                  {[
                    ["g t", "Go to tasks"],
                    ["g h", "Go to home"],
                    ["g n", "Go to notes"],
                    ["g l", "Go to labels"],
                    ["g w", "Go to work"],
                    ["g p", "Go to personal"],
                  ].map(([key, desc]) => (
                    <Fragment key={key}>
                      <kbd className="font-mono text-[10px] bg-notion-surface px-1.5 py-0.5 rounded text-notion-text/70 text-center whitespace-nowrap">{key}</kbd>
                      <span className="text-[10px] text-notion-muted leading-relaxed">{desc}</span>
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View tabs */}
      <FilterTabs
        tabs={tabs}
        active={activeTab}
        onChange={(id) => onTabChange(id as ViewTab)}
        className="mb-3"
      />

      {/* Priority filter pills + Group by selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <div className="flex items-center gap-1.5 flex-wrap">
          {priorities.map((p) => (
            <button
              key={p.id}
              onClick={() => onPriorityChange(p.id)}
              className={`text-[11px] px-2.5 py-1 rounded-full transition-colors shrink-0 ${
                priorityFilter === p.id
                  ? "bg-notion-surface border border-notion-border text-notion-text"
                  : "text-notion-muted hover:text-notion-text"
              }`}
            >
              {p.label}
            </button>
          ))}
          <div className="relative" ref={labelDropdownRef}>
            <button
              onClick={() => setLabelOpen((o) => !o)}
              className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md border transition-colors ${
                tagFilter
                  ? "bg-notion-surface border-notion-border text-notion-text"
                  : "border-transparent text-notion-muted hover:text-notion-text"
              }`}
            >
              <span>{tagFilter ? getTagDef(tagFilter).label : "All Labels"}</span>
              <svg className={`w-3 h-3 transition-transform ${labelOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {labelOpen && (
              <div className="absolute left-0 top-full mt-1 z-20 min-w-[160px] max-h-56 overflow-y-auto bg-notion-bg border border-notion-border rounded-lg shadow-lg pt-0.5 pb-1 text-[11px]">
                <button
                  onClick={() => { onTagFilterChange(null); setLabelOpen(false) }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-notion-hover transition-colors ${!tagFilter ? "text-notion-text font-medium" : "text-notion-muted"}`}
                >
                  All Labels
                </button>
                {availableFilterLabels.length === 0 ? (
                  <span className="block px-3 py-1.5 text-notion-muted/50">No labels on current tasks</span>
                ) : (
                  availableFilterLabels.map((l) => (
                    <button
                      key={l}
                      onClick={() => { onTagFilterChange(l); setLabelOpen(false) }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-notion-hover transition-colors ${tagFilter === l ? "text-notion-text font-medium" : "text-notion-muted"}`}
                    >
                      {getTagDef(l).label}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[11px] text-notion-muted/50 shrink-0">Group:</span>
          {groupOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onGroupByChange(opt.id)}
              className={`text-[11px] px-2 py-1 rounded-full transition-colors shrink-0 ${
                groupBy === opt.id
                  ? "bg-notion-surface border border-notion-border text-notion-text"
                  : "text-notion-muted hover:text-notion-text"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
