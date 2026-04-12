"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TodoistTask } from "@/lib/todoist"
import PropertyDropdown from "@/components/data/PropertyDropdown"
import { DueDatePicker } from "@/components/features/editors/DueDatePicker"
import { ALL_TAGS, getTagDef } from "@/lib/tag-taxonomy"
import TagPill from "@/components/ui/TagPill"
import { DueBucket } from "./types"

// ─── constants ────────────────────────────────────────────────────────────────

export const WORK_PROJECT_ID = "6gJQX58PhPc45mFV"
export const PERSONAL_PROJECT_ID = "6gJQX59VjmrQFHMG"
export const INBOX_PROJECT_ID = "6Crg96g4Vf64cf3W"

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Map a Todoist label string to a taxonomy tag ID using normalized label comparison. */
export function todoistLabelToTagId(label: string): string | null {
  const normalized = label.toLowerCase().replace(/[^a-z0-9]/g, "")
  return ALL_TAGS.find(
    (t) => t.label.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized
  )?.id ?? null
}

export function formatDueDate(date: string, bucket: DueBucket): string {
  if (bucket === "today") return "Today"
  const d = new Date(`${date}T12:00:00`)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// ─── priority config ──────────────────────────────────────────────────────────

// Todoist API priority is inverted: 4=P1 (urgent), 3=P2, 2=P3, 1=P4 (none)
export const PRIORITY_LABELS: Record<number, string> = { 4: "P1", 3: "P2", 2: "P3", 1: "P4" }
export const PRIORITY_STYLES: Record<number, string> = {
  4: "text-red-500 border-red-500/30 bg-red-500/5",
  3: "text-orange-400 border-orange-400/30 bg-orange-400/5",
  2: "text-blue-400 border-blue-400/30 bg-blue-400/5",
  1: "text-notion-muted/50 border-notion-border/40 bg-transparent",
}

// ─── sub-components ───────────────────────────────────────────────────────────

interface ProjectPillProps {
  projectId: string
  nameOverride?: string
  sharedProjectId?: string | null
}

export function ProjectPill({ projectId, nameOverride, sharedProjectId }: ProjectPillProps) {
  const isWork = projectId === WORK_PROJECT_ID
  const isPersonal = projectId === PERSONAL_PROJECT_ID
  const isShared = !!sharedProjectId && projectId === sharedProjectId

  const baseClass = `inline-flex items-center text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0`

  if (isWork) return <span className={`${baseClass} bg-blue-500/10 text-blue-400`}>work</span>
  if (isPersonal) return <span className={`${baseClass} bg-emerald-500/10 text-emerald-400`}>personal</span>
  if (isShared) return <span className={`${baseClass} bg-notion-surface border border-notion-border text-notion-muted`}>shared</span>

  const label = nameOverride ?? "other"
  return (
    <span className={`${baseClass} bg-notion-surface border border-notion-border text-notion-muted/60`}>
      {label}
    </span>
  )
}

interface PriorityBadgeProps {
  priority: number
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center text-[9px] font-semibold px-1 py-0.5 rounded border flex-shrink-0 tabular-nums leading-none ${
        PRIORITY_STYLES[priority] ?? PRIORITY_STYLES[1]
      }`}
    >
      {PRIORITY_LABELS[priority] ?? "P4"}
    </span>
  )
}

type CheckState = "idle" | "loading" | "done" | "error"

interface CheckboxProps {
  state: CheckState
  onClick: () => void
}

export function Checkbox({ state, onClick }: CheckboxProps) {
  return (
    <button
      onClick={onClick}
      disabled={state === "loading" || state === "done"}
      className="flex-shrink-0 w-4 h-4 rounded-full border border-notion-border/60 flex items-center justify-center hover:border-notion-accent hover:bg-notion-hover transition-all disabled:pointer-events-none focus:outline-none focus-visible:ring-1 focus-visible:ring-notion-accent"
      aria-label="Complete task"
    >
      {state === "loading" && (
        <svg className="w-2.5 h-2.5 animate-spin text-notion-muted" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {state === "done" && (
        <svg className="w-2.5 h-2.5 text-notion-accent" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="2,6 5,9 10,3" />
        </svg>
      )}
      {state === "error" && (
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
      )}
    </button>
  )
}

// ─── PriorityPicker ───────────────────────────────────────────────────────────

interface PriorityPickerProps {
  taskId: string
  currentPriority: number
  position: { top: number; left: number }
  onSelect: (priority: number) => void
  onClose: () => void
}

export function PriorityPicker({ currentPriority, position, onSelect, onClose }: PriorityPickerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
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

  const options = [
    { priority: 4, label: "P1", cls: "text-red-400 border-red-500/30 hover:bg-red-500/10" },
    { priority: 3, label: "P2", cls: "text-orange-400 border-orange-400/30 hover:bg-orange-400/10" },
    { priority: 2, label: "P3", cls: "text-blue-400 border-blue-400/30 hover:bg-blue-400/10" },
    { priority: 1, label: "P4", cls: "text-notion-muted/50 border-notion-border/40 hover:bg-notion-hover" },
  ]

  return (
    <div
      ref={ref}
      className="fixed z-[200] bg-notion-surface border border-notion-border rounded-lg shadow-xl p-2 flex gap-1.5"
      style={{ top: position.top, left: position.left }}
    >
      {options.map(({ priority, label, cls }) => (
        <button
          key={priority}
          onClick={() => { onSelect(priority); onClose() }}
          className={`px-2.5 py-1 rounded border text-[11px] font-semibold transition-colors ${cls} ${
            currentPriority === priority ? "ring-1 ring-notion-accent/40" : ""
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── TaskRow ──────────────────────────────────────────────────────────────────

export interface TodoistProject {
  id: string
  name: string
}

export interface TaskRowProps {
  task: TodoistTask
  bucket: DueBucket
  dismissed: boolean
  onDismiss: (id: string) => void
  onComplete?: (task: TodoistTask) => void
  onOpenPanel: (task: TodoistTask) => void
  onDelete: (task: TodoistTask) => void
  projects?: TodoistProject[]
  waitingProjectId?: string | null
  sharedProjectId?: string | null
  isFocused?: boolean
  externalDatePickerOpen?: boolean
  onExternalDatePickerClose?: () => void
  onContextMenu?: (e: React.MouseEvent, task: TodoistTask) => void
  isSelected?: boolean
  onToggleSelect?: (id: string) => void
  selectionMode?: boolean
  onOptimisticOverride?: (id: string, update: Partial<TodoistTask>) => void
  showLabel?: boolean
}

export function TaskRow({ task, bucket, dismissed, onDismiss, onComplete, onOpenPanel, onDelete, projects = [], waitingProjectId, sharedProjectId, isFocused, externalDatePickerOpen, onExternalDatePickerClose, onContextMenu, isSelected, onToggleSelect, selectionMode, onOptimisticOverride, showLabel = true }: TaskRowProps) {
  const [checkState, setCheckState] = useState<CheckState>("idle")
  const [optimisticPriority, setOptimisticPriority] = useState<number | null>(null)
  const [optimisticProjectId, setOptimisticProjectId] = useState<string | null>(null)
  const [datePicker, setDatePicker] = useState(false)
  const [patchError, setPatchError] = useState<string | null>(null)
  const datePickerVisible = datePicker || (externalDatePickerOpen ?? false)
  const router = useRouter()

  const activePriority = optimisticPriority ?? task.priority
  const activeProjectId = optimisticProjectId ?? task.project_id

  const dateLabel = task.due?.date ? formatDueDate(task.due.date, bucket) : ""

  const patchTask = useCallback(async (body: Record<string, string | number | string[]>) => {
    // Apply optimistic override immediately so parent re-groups instantly
    if (onOptimisticOverride) {
      const override: Partial<TodoistTask> = {}
      if ("priority" in body) override.priority = body.priority as number
      if ("project_id" in body) override.project_id = body.project_id as string
      if ("due_string" in body) {
        // Optimistically set a rough due date from the string
        const ds = body.due_string as string
        const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" })
        if (ds === "today" || ds === todayStr) {
          override.due = { date: todayStr }
        } else if (ds === "tomorrow") {
          const tom = new Date()
          tom.setDate(tom.getDate() + 1)
          override.due = { date: tom.toLocaleDateString("en-CA") }
        }
        // For other date strings, the override may not be perfect but the refresh will correct it quickly
      }
      if (Object.keys(override).length > 0) onOptimisticOverride(task.id, override)
    }
    try {
      const res = await fetch(`/api/todoist/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        console.warn(`[patchTask] Failed: ${res.status}`)
        setPatchError("Failed to save")
        setTimeout(() => setPatchError(null), 2000)
        return
      }
    } catch (err) {
      console.warn("[patchTask] Network error:", err)
      setPatchError("Failed to save")
      setTimeout(() => setPatchError(null), 2000)
    }
  }, [task.id, router, onOptimisticOverride])

  const handleCheck = useCallback(async () => {
    setCheckState("loading")
    onDismiss(task.id)
    try {
      // Remove "triage" label when completing a task
      if (task.labels?.includes("triage")) {
        fetch(`/api/todoist/${task.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ labels: (task.labels || []).filter((l) => l !== "triage") }),
        }).catch(() => {})
      }
      const res = await fetch(`/api/todoist/${task.id}/close`, { method: "POST" })
      if (!res.ok) {
        onDismiss("__revert__" + task.id)
        setCheckState("error")
        setTimeout(() => setCheckState("idle"), 1500)
        return
      }
      setCheckState("done")
      onComplete?.(task)
      setTimeout(() => router.refresh(), 2000)
    } catch {
      onDismiss("__revert__" + task.id)
      setCheckState("error")
      setTimeout(() => setCheckState("idle"), 1500)
    }
  }, [task.id, task.labels, onDismiss, onComplete, router])

  const handleRowClick = useCallback(() => {
    if (dismissed) return
    onOpenPanel(task)
  }, [dismissed, onOpenPanel, task])

  return (
    <div
      data-task-id={task.id}
      className={`relative flex items-center gap-2.5 px-3 py-2.5 group transition-all duration-200 cursor-pointer ${
        dismissed
          ? "opacity-30 pointer-events-none"
          : isSelected
          ? "bg-notion-accent/5 ring-1 ring-inset ring-notion-accent/15"
          : isFocused
          ? "bg-notion-hover/50 ring-1 ring-inset ring-notion-accent/20"
          : "hover:bg-notion-hover"
      }`}
      onClick={handleRowClick}
      onContextMenu={(e) => onContextMenu?.(e, task)}
    >
      {/* Selection checkbox — visible on hover, or always when in selection mode */}
      <span
        onClick={(e) => { e.stopPropagation(); onToggleSelect?.(task.id) }}
        className={`flex-shrink-0 w-4 h-4 transition-all duration-150 ${
          isSelected || selectionMode ? "opacity-100" : "opacity-0 group-hover:opacity-60"
        }`}
      >
        <button
          className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
            isSelected
              ? "bg-notion-accent border-notion-accent"
              : "border-notion-border/60 hover:border-notion-accent bg-transparent"
          }`}
          aria-label="Select task"
          tabIndex={-1}
        >
          {isSelected && (
            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="2,6 5,9 10,3" />
            </svg>
          )}
        </button>
      </span>

      {/* Complete checkbox */}
      <span onClick={(e) => e.stopPropagation()} className="contents">
        <Checkbox state={checkState} onClick={handleCheck} />
      </span>

      {/* Priority — inline editable dropdown */}
      <PropertyDropdown
        value={activePriority}
        onChange={(val) => {
          const priority = Number(val)
          setOptimisticPriority(priority)
          patchTask({ priority })
        }}
        options={[
          { label: "P1 — Urgent", value: 4, className: "text-red-400" },
          { label: "P2 — High",   value: 3, className: "text-orange-400" },
          { label: "P3 — Medium", value: 2, className: "text-blue-400" },
          { label: "P4 — None",   value: 1 },
        ]}
        trigger={<PriorityBadge priority={activePriority} />}
      />

      {/* Task title */}
      <span
        className={`flex-1 min-w-0 text-sm leading-snug select-none truncate ${
          dismissed ? "line-through text-notion-muted" : "text-notion-text"
        }`}
      >
        {task.content}
      </span>

      {/* Right side: project pill + date + arrow */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* Project — inline editable dropdown, hidden on small screens */}
        <span className="hidden sm:block">
          <PropertyDropdown
            value={activeProjectId}
            onChange={(val) => {
              const project_id = String(val)
              setOptimisticProjectId(project_id)
              patchTask({ project_id })
            }}
            options={[
              { label: "Work",        value: WORK_PROJECT_ID },
              { label: "Personal",    value: PERSONAL_PROJECT_ID },
              ...(sharedProjectId ? [{ label: "Shared", value: sharedProjectId }] : []),
              ...(waitingProjectId ? [{ label: "Waiting For", value: waitingProjectId }] : []),
            ]}
            align="right"
            trigger={
              <ProjectPill
                projectId={activeProjectId}
                nameOverride={projects.find((p) => p.id === activeProjectId)?.name}
                sharedProjectId={sharedProjectId}
              />
            }
          />
        </span>

        {/* Label pill — first taxonomy-matched label, hidden on mobile and on "All" tab */}
        {showLabel && (() => {
          const tagId = (task.labels ?? []).reduce<string | null>((found, l) => found ?? todoistLabelToTagId(l), null)
          if (!tagId) return null
          return (
            <TagPill tagId={tagId} href={`/labels/${tagId}`} size="sm" />
          )
        })()}

        <div className="relative flex-shrink-0 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {bucket !== "today" && (
            <button
              onClick={() => patchTask({ due_string: "today" })}
              title="Set due today"
              className="w-4 h-4 flex items-center justify-center rounded opacity-30 group-hover:opacity-70 sm:opacity-0 sm:group-hover:opacity-70 hover:!opacity-100 text-notion-muted hover:text-orange-400 transition-all duration-150"
            >
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="8" r="6.5" />
                <circle cx="8" cy="8" r="2" />
              </svg>
            </button>
          )}
          {dateLabel && (
            <button
              onClick={() => setDatePicker((v) => !v)}
              className={`text-[11px] font-mono flex items-center justify-center transition-colors ${
                bucket === "overdue" ? "text-red-400 hover:text-red-300" : "text-notion-muted hover:text-notion-text"
              }`}
            >
              {dateLabel}
            </button>
          )}
          {datePickerVisible && (
            <DueDatePicker
              currentDate={task.due?.date}
              onSave={(due_string) => { patchTask({ due_string }); setDatePicker(false); onExternalDatePickerClose?.() }}
              onClose={() => { setDatePicker(false); onExternalDatePickerClose?.() }}
              style={{ position: "absolute", top: "100%", right: 0 }}
            />
          )}
        </div>

        {/* Trash — reserved slot so arrow doesn't shift */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(task) }}
          title="Delete task"
          className="w-4 h-4 flex-shrink-0 flex items-center justify-center rounded opacity-30 group-hover:opacity-70 sm:opacity-0 sm:group-hover:opacity-70 hover:!opacity-100 text-notion-muted hover:text-red-400 transition-all duration-150"
        >
          <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 4h11M6 4V2.5h4V4M4 4l.75 9.5h6.5L12 4" />
          </svg>
        </button>

        {/* Mobile three-dot menu — hidden on desktop where right-click works */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onContextMenu?.(e, task)
          }}
          className="sm:hidden flex-shrink-0 w-6 h-6 flex items-center justify-center rounded text-notion-muted/50 hover:text-notion-muted hover:bg-notion-hover transition-colors text-sm leading-none"
          aria-label="Task options"
        >
          ⋯
        </button>

      </div>

      {patchError && (
        <span className="absolute right-3 text-[10px] text-red-400 pointer-events-none">
          {patchError}
        </span>
      )}
    </div>
  )
}
