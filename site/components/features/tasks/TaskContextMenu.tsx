"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { TodoistTask } from "@/lib/todoist"
import { DueDatePicker } from "@/components/features/editors/DueDatePicker"
import { ALL_TAGS } from "@/lib/tag-taxonomy"


export interface TaskContextMenuProps {
  task: TodoistTask
  position: { x: number; y: number }
  onClose: () => void
  onComplete: (task: TodoistTask) => void
  onRefresh: () => void
  onOptimisticOverride?: (id: string, update: Partial<TodoistTask>) => void
  onDelete?: (task: TodoistTask) => void
}

const CTX_HIDDEN_LABELS = new Set(["triage"])

function todoistLabelToTagId(label: string): string | null {
  const normalized = label.toLowerCase().replace(/[^a-z0-9]/g, "")
  return ALL_TAGS.find(t => t.label.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized)?.id ?? null
}

export function TaskContextMenu({ task, position, onClose, onComplete, onRefresh, onOptimisticOverride, onDelete }: TaskContextMenuProps) {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [menuSearch, setMenuSearch] = useState("")
  const menuSearchRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const labelsScrollRef = useRef<HTMLDivElement>(null)

  // Adjust position if menu would overflow viewport
  const [adjustedPos, setAdjustedPos] = useState(position)
  useEffect(() => {
    if (!menuRef.current) return
    const rect = menuRef.current.getBoundingClientRect()
    const x = position.x + rect.width > window.innerWidth ? window.innerWidth - rect.width - 8 : position.x
    const y = position.y + rect.height > window.innerHeight ? window.innerHeight - rect.height - 8 : position.y
    setAdjustedPos({ x, y })
  }, [position])

  // Auto-focus search input on mount
  useEffect(() => {
    setTimeout(() => menuSearchRef.current?.focus(), 0)
  }, [])

  // Close on click outside, escape, or scroll outside the menu
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose()
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    function handleScroll(e: Event) {
      // Only close if the scroll happened outside the menu element
      if (menuRef.current && menuRef.current.contains(e.target as Node)) return
      onClose()
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleKey)
    window.addEventListener("scroll", handleScroll, true)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleKey)
      window.removeEventListener("scroll", handleScroll, true)
    }
  }, [onClose])

  const patchTask = useCallback(async (body: Record<string, string | number | string[]>) => {
    // Apply optimistic override immediately before the API call
    if (onOptimisticOverride) {
      const override: Partial<TodoistTask> = {}
      if ("priority" in body) override.priority = body.priority as number
      if ("project_id" in body) override.project_id = body.project_id as string
      if ("labels" in body) override.labels = body.labels as string[]
      if ("due_string" in body) {
        const ds = body.due_string as string
        const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" })
        if (ds === "today" || ds === todayStr) {
          override.due = { date: todayStr }
        } else if (ds === "tomorrow") {
          const tom = new Date(); tom.setDate(tom.getDate() + 1)
          override.due = { date: tom.toLocaleDateString("en-CA") }
        } else {
          // Parse YYYY-MM-DD format dates directly
          const dateMatch = ds.match(/^\d{4}-\d{2}-\d{2}$/)
          if (dateMatch) override.due = { date: ds }
        }
      }
      if (Object.keys(override).length > 0) onOptimisticOverride(task.id, override)
    }
    try {
      const res = await fetch(`/api/todoist/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) { console.warn(`[patchTask] Failed: ${res.status}`); return }
      setTimeout(() => onRefresh(), 300)
    } catch (err) {
      console.warn("[patchTask] Network error:", err)
    }
  }, [task.id, onRefresh, onOptimisticOverride])

  const handleDateQuick = (due_string: string) => {
    patchTask({ due_string })
    onClose()
  }

  const handlePriority = (priority: number) => {
    patchTask({ priority })
    onClose()
  }

  const handleToggleLabel = (tagId: string) => {
    const current = task.labels ?? []
    const isActive = current.some(l => l === tagId || todoistLabelToTagId(l) === tagId)
    const next = isActive
      ? current.filter(l => l !== tagId && todoistLabelToTagId(l) !== tagId)
      : [...current, tagId]
    patchTask({ labels: next })
  }

  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const saturday = new Date(today)
  saturday.setDate(saturday.getDate() + (6 - today.getDay()))
  const nextMonday = new Date(today)
  nextMonday.setDate(nextMonday.getDate() + (8 - today.getDay()))

  const fmt = (d: Date) => d.toISOString().split("T")[0]

  // Show all taxonomy labels (minus hidden ones like triage)
  const taxonomyLabels = ALL_TAGS.filter((t) => !CTX_HIDDEN_LABELS.has(t.id))

  // Date options for search matching
  const dateOptions = [
    { key: "today", label: "today", date: fmt(today) },
    { key: "tomorrow", label: "tomorrow", date: fmt(tomorrow) },
    { key: "weekend", label: "weekend", date: fmt(saturday) },
    { key: "next week", label: "next week", date: fmt(nextMonday) },
    { key: "later", label: "later", date: (() => { const d = new Date(); d.setMonth(d.getMonth() + 3); return fmt(d) })() },
  ]
  const priorityOptions = [
    { key: "p1", label: "P1", val: 4 }, { key: "p2", label: "P2", val: 3 },
    { key: "p3", label: "P3", val: 2 }, { key: "p4", label: "P4", val: 1 },
    { key: "1", label: "P1", val: 4 }, { key: "2", label: "P2", val: 3 },
    { key: "3", label: "P3", val: 2 }, { key: "4", label: "P4", val: 1 },
  ]

  const menuSearchLower = menuSearch.toLowerCase().trim()

  // Multi-token parsing: split search into tokens, match each independently
  const tokens = menuSearchLower ? menuSearchLower.split(/\s+/).filter(Boolean) : []

  const matchedDateKeys = new Set<string>()
  const matchedLabelIds = new Set<string>()
  let matchedPriorityVal: number | null = null
  const labelTokens: string[] = []

  for (const token of tokens) {
    const dateMatch = dateOptions.find(d => d.key.startsWith(token) || d.label.startsWith(token))
    const priorityMatch = priorityOptions.find(p => p.key === token || p.label.toLowerCase() === token)
    if (dateMatch) {
      matchedDateKeys.add(dateMatch.key)
    } else if (priorityMatch) {
      if (matchedPriorityVal === null) matchedPriorityVal = priorityMatch.val
    } else {
      labelTokens.push(token)
    }
  }

  // Match labels against label tokens
  if (labelTokens.length > 0) {
    for (const tag of taxonomyLabels) {
      const tagLower = tag.label.toLowerCase()
      if (labelTokens.some(t => tagLower.startsWith(t) || tagLower.includes(t))) {
        matchedLabelIds.add(tag.id)
      }
    }
  }

  // Filter labels list when there are label tokens
  const visibleLabels = labelTokens.length > 0
    ? taxonomyLabels.filter(t => matchedLabelIds.has(t.id))
    : taxonomyLabels

  const datePillKeys = ["today", "tomorrow", "weekend", "next week", "later"]
  const priorityPillVals = [4, 3, 2, 1]

  // Scroll first matched label into view when matches change
  useEffect(() => {
    if (matchedLabelIds.size === 0) return
    const container = labelsScrollRef.current
    if (!container) return
    const el = container.querySelector("[data-highlighted]") as HTMLElement | null
    if (el) {
      const elTop = el.offsetTop
      const elBottom = elTop + el.offsetHeight
      if (elTop < container.scrollTop) container.scrollTop = elTop
      else if (elBottom > container.scrollTop + container.clientHeight) container.scrollTop = elBottom - container.clientHeight
    }
  }, [menuSearchLower])

  const handleMenuSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") { e.stopPropagation(); onClose(); return }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      menuRef.current?.scrollBy({ top: 40, behavior: "smooth" })
      return
    }
    if (e.key === "ArrowUp") {
      e.preventDefault()
      menuRef.current?.scrollBy({ top: -40, behavior: "smooth" })
      return
    }
    if (e.key === "Enter") {
      e.preventDefault()
      const hasAnyMatch = matchedDateKeys.size > 0 || matchedPriorityVal !== null || matchedLabelIds.size > 0
      if (!hasAnyMatch) return
      // Apply all matched filters simultaneously
      if (matchedDateKeys.size > 0) {
        const firstDateKey = Array.from(matchedDateKeys)[0]
        const dateOpt = dateOptions.find(d => d.key === firstDateKey)
        if (dateOpt) patchTask({ due_string: dateOpt.date })
      }
      if (matchedPriorityVal !== null) {
        patchTask({ priority: matchedPriorityVal })
      }
      if (matchedLabelIds.size > 0) {
        const current = task.labels ?? []
        const toAdd = Array.from(matchedLabelIds).filter(id => !current.some(l => l === id || todoistLabelToTagId(l) === id))
        if (toAdd.length > 0) patchTask({ labels: [...current, ...toAdd] })
      }
      onClose()
    }
  }

  const sectionHeader = "text-[9px] font-semibold uppercase tracking-[0.12em] text-notion-muted/40 px-3 pt-2.5 pb-1"
  const menuItem = "w-full text-left px-3 py-1.5 hover:bg-notion-hover text-notion-text text-[11px] flex items-center justify-between transition-colors"
  const shortcutCls = "text-notion-muted/40 text-[10px] font-mono"

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-notion-bg border border-notion-border rounded-lg shadow-xl py-1 min-w-[220px] max-h-[70vh] overflow-y-auto"
      style={{ left: adjustedPos.x, top: adjustedPos.y }}
    >
      {/* Search input */}
      <div className="px-3 pt-2 pb-1.5 border-b border-notion-border/30">
        <input
          ref={menuSearchRef}
          type="text"
          value={menuSearch}
          onChange={(e) => setMenuSearch(e.target.value)}
          onKeyDown={handleMenuSearchKeyDown}
          placeholder="Search..."
          className="w-full bg-transparent text-[11px] text-notion-text placeholder:text-notion-muted/40 outline-none border-b border-notion-border/30 pb-0.5 focus:border-notion-border/60"
        />
      </div>

      {/* Date section */}
      <p className={sectionHeader}>Date <span className={shortcutCls}>D</span></p>
      <div className="px-2 py-1 flex flex-wrap items-center gap-1.5">
        {([
          { key: "today", label: "Today", color: "text-amber-400", action: () => handleDateQuick(fmt(today)) },
          { key: "tomorrow", label: "Tomorrow", color: "text-blue-400", action: () => handleDateQuick(fmt(tomorrow)) },
          { key: "weekend", label: "This weekend", color: "text-purple-400", action: () => handleDateQuick(fmt(saturday)) },
          { key: "next week", label: "Next week", color: "text-green-400", action: () => handleDateQuick(fmt(nextMonday)) },
          { key: "later", label: "Later", color: "text-notion-muted", action: () => { const d = new Date(); d.setMonth(d.getMonth() + 3); handleDateQuick(fmt(d)) } },
        ] as const).map(({ key, label, color, action }) => (
          <button
            key={key}
            onClick={action}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] border transition-colors ${color} ${
              matchedDateKeys.has(key)
                ? "bg-notion-hover ring-1 ring-notion-accent/30 border-notion-accent/30"
                : "bg-notion-surface hover:bg-notion-hover border-notion-border/30"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {showDatePicker && (
        <div className="px-2 py-1" onClick={(e) => e.stopPropagation()}>
          <DueDatePicker
            currentDate={task.due?.date}
            onSave={(due_string) => { patchTask({ due_string }); onClose() }}
            onClose={() => setShowDatePicker(false)}
          />
        </div>
      )}

      <div className="border-t border-notion-border/30 my-1" />

      {/* Priority section */}
      <p className={sectionHeader}>Priority <span className={shortcutCls}>Y</span></p>
      <div className="px-2 py-1 flex items-center gap-1.5">
        {[
          { p: 4, label: "P1", color: "text-red-400 border-red-500/30" },
          { p: 3, label: "P2", color: "text-orange-400 border-orange-400/30" },
          { p: 2, label: "P3", color: "text-blue-400 border-blue-400/30" },
          { p: 1, label: "P4", color: "text-notion-muted/50 border-notion-border/40" },
        ].map(({ p, label, color }) => (
          <button
            key={p}
            onClick={() => handlePriority(p)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-semibold border transition-colors ${color} ${
              matchedPriorityVal === p
                ? "bg-notion-hover ring-1 ring-notion-accent/30"
                : task.priority === p
                ? "bg-notion-surface ring-1 ring-notion-accent/30"
                : "hover:bg-notion-hover"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="border-t border-notion-border/30 my-1" />

      {/* Labels section */}
      <p className={sectionHeader}>Labels</p>
      <div ref={labelsScrollRef} className="max-h-48 overflow-y-auto" onScroll={(e) => e.stopPropagation()}>
        {visibleLabels.map((tag) => {
          const active = (task.labels ?? []).some(l => l === tag.id || todoistLabelToTagId(l) === tag.id)
          const isHighlighted = matchedLabelIds.has(tag.id)
          return (
            <button
              key={tag.id}
              onClick={() => handleToggleLabel(tag.id)}
              {...(isHighlighted ? { "data-highlighted": true } : {})}
              className={`${menuItem} ${isHighlighted ? "bg-notion-hover" : ""}`}
            >
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${tag.color.split(" ")[0].replace("/15", "/60").replace("/10", "/60")}`} />
                <span className={active ? "text-notion-text font-medium" : isHighlighted ? "text-notion-text" : "text-notion-text/70"}>{tag.label}</span>
              </span>
              {active && (
                <svg className="w-3 h-3 text-notion-accent flex-shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="2,6 5,9 10,3" />
                </svg>
              )}
            </button>
          )
        })}
      </div>

      <div className="border-t border-notion-border/30 my-1" />

      {/* Actions */}
      <p className={sectionHeader}>Actions</p>
      <button onClick={() => { onComplete(task); onClose() }} className={menuItem}>
        <span>Complete task</span>
        <span className={shortcutCls}>&#8984;&#9166;</span>
      </button>
      <a
        href={task.url}
        target="_blank"
        rel="noopener noreferrer"
        className={menuItem}
        onClick={onClose}
      >
        <span>Open in Todoist</span>
        <span className="text-notion-muted/40 text-[10px]">&#8599;</span>
      </a>
      <button
        onClick={() => { onDelete?.(task); onClose() }}
        className={`${menuItem} text-red-400 hover:text-red-300`}
      >
        <span>Delete task</span>
      </button>
    </div>
  )
}
