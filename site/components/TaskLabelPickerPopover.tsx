"use client"

import { useState, useEffect, useRef } from "react"
import { TodoistTask } from "@/lib/todoist"
import { ALL_TAGS } from "@/lib/tag-taxonomy"

export interface TaskLabelPickerPopoverProps {
  task: TodoistTask
  position: { x: number; y: number }
  onClose: () => void
  onRefresh: () => void
}

const LABEL_PICKER_HIDDEN = new Set(["triage"])

function todoistLabelToTagId(label: string): string | null {
  const normalized = label.toLowerCase().replace(/[^a-z0-9]/g, "")
  return ALL_TAGS.find(t => t.label.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized)?.id ?? null
}

export function TaskLabelPickerPopover({ task, position, onClose, onRefresh }: TaskLabelPickerPopoverProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Auto-focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [])

  // Adjust position if popover would overflow viewport
  const [adjustedPos, setAdjustedPos] = useState(position)
  useEffect(() => {
    if (!popoverRef.current) return
    const rect = popoverRef.current.getBoundingClientRect()
    const x = position.x + rect.width > window.innerWidth ? window.innerWidth - rect.width - 8 : position.x
    const y = position.y + rect.height > window.innerHeight ? window.innerHeight - rect.height - 8 : position.y
    setAdjustedPos({ x, y })
  }, [position])

  // Close on click outside or Escape
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) onClose()
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") { e.stopPropagation(); onClose() }
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleKey, true)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleKey, true)
    }
  }, [onClose])

  const allLabels = ALL_TAGS.filter((t) => !LABEL_PICKER_HIDDEN.has(t.id))
  const filtered = searchQuery
    ? allLabels.filter((t) => t.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : allLabels

  const toggleLabel = async (labelId: string) => {
    const current = task.labels ?? []
    const isActive = current.some(l => l === labelId || todoistLabelToTagId(l) === labelId)
    const next = isActive
      ? current.filter(l => l !== labelId && todoistLabelToTagId(l) !== labelId)
      : [...current, labelId]
    try {
      const res = await fetch(`/api/todoist/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labels: next }),
      })
      if (!res.ok) { console.warn(`[toggleLabel] Failed: ${res.status}`); return }
      setTimeout(() => onRefresh(), 400)
    } catch (err) {
      console.warn("[toggleLabel] Network error:", err)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filtered.length > 0) {
      e.preventDefault()
      toggleLabel(filtered[0].id)
    }
  }

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 bg-notion-bg border border-notion-border rounded-lg shadow-xl py-1 w-[220px] max-h-[60vh] flex flex-col"
      style={{ left: adjustedPos.x, top: adjustedPos.y }}
    >
      <div className="px-2 py-1.5 border-b border-notion-border/30">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search labels..."
          className="w-full bg-transparent text-[12px] text-notion-text placeholder:text-notion-muted/40 outline-none"
        />
      </div>
      <div className="overflow-y-auto flex-1">
        {filtered.length === 0 ? (
          <p className="text-[11px] text-notion-muted/50 px-3 py-2">No matches</p>
        ) : (
          filtered.map((tag) => {
            const active = (task.labels ?? []).some(l => l === tag.id || todoistLabelToTagId(l) === tag.id)
            const dotColor = tag.color.split(" ")[0].replace("/15", "/60").replace("/10", "/60")
            return (
              <button
                key={tag.id}
                onClick={() => toggleLabel(tag.id)}
                className="w-full text-left px-3 py-1.5 hover:bg-notion-hover text-[11px] flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
                  <span className={active ? "text-notion-text font-medium" : "text-notion-text/70"}>{tag.label}</span>
                </span>
                {active && (
                  <svg className="w-3 h-3 text-notion-accent flex-shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2,6 5,9 10,3" />
                  </svg>
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
