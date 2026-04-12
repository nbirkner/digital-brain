"use client"

import { useState, useCallback, useTransition, useEffect, useRef, Fragment, useMemo } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { TodoistTask } from "@/lib/todoist"
import FilterTabs from "@/components/FilterTabs"
import TaskDetailPanel from "@/components/TaskDetailPanel"
import PropertyDropdown from "@/components/PropertyDropdown"
import { DueDatePicker } from "@/components/DueDatePicker"
import { ALL_TAGS, getTagDef } from "@/lib/tag-taxonomy"
import Link from "next/link"
import TagPill from "@/components/TagPill"
import { TaskCreateModal as CreateTaskModal } from "@/components/TaskCreateModal"
import { TaskContextMenu } from "@/components/TaskContextMenu"
import { TaskLabelPickerPopover } from "@/components/TaskLabelPickerPopover"

/** Map a Todoist label string to a taxonomy tag ID using normalized label comparison. */
function todoistLabelToTagId(label: string): string | null {
  const normalized = label.toLowerCase().replace(/[^a-z0-9]/g, "")
  return ALL_TAGS.find(
    (t) => t.label.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized
  )?.id ?? null
}

const WORK_PROJECT_ID = process.env.NEXT_PUBLIC_TODOIST_WORK_PROJECT_ID ?? ""
const PERSONAL_PROJECT_ID = process.env.NEXT_PUBLIC_TODOIST_PERSONAL_PROJECT_ID ?? ""
const INBOX_PROJECT_ID = process.env.NEXT_PUBLIC_TODOIST_INBOX_PROJECT_ID ?? ""

// ─── types ───────────────────────────────────────────────────────────────────

type ViewTab = "all" | "work" | "personal" | "waiting"

// Completed tasks have the same shape as active tasks plus completed_at
type CompletedTask = TodoistTask & { completed_at?: string }
type PriorityFilter = "all" | "p1" | "p2" | "p3" | "p4"
type DueBucket = "overdue" | "today" | "later" | "none"
type CheckState = "idle" | "loading" | "done" | "error"
type GroupBy = "due" | "priority" | "project" | "labels" | "none"

interface TodoistProject {
  id: string
  name: string
}

interface TaskGroup {
  id: string
  label: string
  tasks: TodoistTask[]
  accent?: "red" | "amber" | "default"
  bucket?: DueBucket
}

// ─── date helpers ────────────────────────────────────────────────────────────

function getTodayString(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" })
}

function getDueBucket(task: TodoistTask, today: string): DueBucket {
  if (!task.due?.date) return "none"
  if (task.due.date < today) return "overdue"
  if (task.due.date === today) return "today"
  return "later"
}

function formatDueDate(date: string, bucket: DueBucket): string {
  if (bucket === "today") return "Today"
  const d = new Date(`${date}T12:00:00`)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// ─── sorting ─────────────────────────────────────────────────────────────────

function sortByPriorityThenDate(tasks: TodoistTask[]): TodoistTask[] {
  return [...tasks].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority
    const aDate = a.due?.date ?? "9999"
    const bDate = b.due?.date ?? "9999"
    if (aDate !== bDate) return aDate.localeCompare(bDate)
    return a.content.localeCompare(b.content)
  })
}

function sortByDateThenPriority(tasks: TodoistTask[]): TodoistTask[] {
  return [...tasks].sort((a, b) => {
    const aDate = a.due?.date ?? "9999"
    const bDate = b.due?.date ?? "9999"
    if (aDate !== bDate) return aDate.localeCompare(bDate)
    if (b.priority !== a.priority) return b.priority - a.priority
    return a.content.localeCompare(b.content)
  })
}

// ─── grouping logic ───────────────────────────────────────────────────────────

type GroupBucket = "overdue" | "today" | "tomorrow" | "this-weekend" | "next-week" | "later" | "none"

function getGroupBucket(task: TodoistTask, today: string): GroupBucket {
  if (!task.due?.date) return "none"
  if (task.due.date < today) return "overdue"
  if (task.due.date === today) return "today"

  const todayDate = new Date(today + "T12:00:00")
  const dayOfWeek = todayDate.getDay() // 0=Sun … 6=Sat

  const offset = (n: number) => {
    const d = new Date(todayDate); d.setDate(d.getDate() + n)
    return d.toLocaleDateString("en-CA")
  }

  const tomorrow = offset(1)
  if (task.due.date === tomorrow) return "tomorrow"

  // This weekend: coming Sat + Sun (only if they are after tomorrow)
  const daysToSat = dayOfWeek === 6 ? 7 : (6 - dayOfWeek)
  const daysToSun = dayOfWeek === 0 ? 7 : (7 - dayOfWeek)
  const satStr = offset(daysToSat)
  const sunStr = offset(daysToSun)
  if (task.due.date === satStr || task.due.date === sunStr) return "this-weekend"

  // Next week: Monday → Sunday of the following calendar week
  const daysToNextMon = dayOfWeek === 1 ? 7 : (8 - dayOfWeek) % 7 || 7
  const nextMon = offset(daysToNextMon)
  const nextSun = offset(daysToNextMon + 6)
  if (task.due.date >= nextMon && task.due.date <= nextSun) return "next-week"

  return "later"
}

function groupTasks(tasks: TodoistTask[], groupBy: GroupBy, today: string, projects: TodoistProject[] = []): TaskGroup[] {
  if (groupBy === "none") {
    return [{ id: "all", label: "", tasks: sortByPriorityThenDate(tasks) }]
  }

  if (groupBy === "due") {
    const bucketOf = (t: TodoistTask) => getGroupBucket(t, today)
    return [
      { id: "overdue",      label: "Overdue",       tasks: sortByPriorityThenDate(tasks.filter(t => bucketOf(t) === "overdue")),      accent: "red"   as const, bucket: "overdue" as DueBucket },
      { id: "today",        label: "Today",          tasks: sortByPriorityThenDate(tasks.filter(t => bucketOf(t) === "today")),        accent: "amber" as const, bucket: "today"   as DueBucket },
      { id: "tomorrow",     label: "Tomorrow",       tasks: sortByPriorityThenDate(tasks.filter(t => bucketOf(t) === "tomorrow")),                              bucket: "later"   as DueBucket },
      { id: "this-weekend", label: "This Weekend",   tasks: sortByPriorityThenDate(tasks.filter(t => bucketOf(t) === "this-weekend")),                          bucket: "later"   as DueBucket },
      { id: "next-week",    label: "Next Week",      tasks: sortByPriorityThenDate(tasks.filter(t => bucketOf(t) === "next-week")),                             bucket: "later"   as DueBucket },
      { id: "later",        label: "Coming Up",      tasks: sortByDateThenPriority(tasks.filter(t => bucketOf(t) === "later")),                                 bucket: "later"   as DueBucket },
      { id: "none",         label: "No Date",        tasks: sortByPriorityThenDate(tasks.filter(t => bucketOf(t) === "none")),                                  bucket: "none"    as DueBucket },
    ].filter((g) => g.tasks.length > 0)
  }

  if (groupBy === "priority") {
    return [
      { id: "p1", label: "P1 — Urgent", tasks: sortByDateThenPriority(tasks.filter((t) => t.priority === 4)) },
      { id: "p2", label: "P2 — High", tasks: sortByDateThenPriority(tasks.filter((t) => t.priority === 3)) },
      { id: "p3", label: "P3 — Medium", tasks: sortByDateThenPriority(tasks.filter((t) => t.priority === 2)) },
      { id: "p4", label: "P4 — None", tasks: sortByDateThenPriority(tasks.filter((t) => t.priority === 1)) },
    ].filter((g) => g.tasks.length > 0)
  }

  if (groupBy === "project") {
    // Collect all distinct project_ids from the task list
    const seenIds = new Set<string>()
    tasks.forEach((t) => seenIds.add(t.project_id))
    const projectMap = new Map(projects.map((p) => [p.id, p.name]))

    // Known project groups first (Work, Personal), then any others by name
    const knownFirst = [WORK_PROJECT_ID, PERSONAL_PROJECT_ID]
    const orderedIds = [
      ...knownFirst.filter((id) => seenIds.has(id)),
      ...Array.from(seenIds).filter((id) => !knownFirst.includes(id)),
    ]

    return orderedIds.map((pid) => {
      let label: string
      if (pid === WORK_PROJECT_ID) label = "Work"
      else if (pid === PERSONAL_PROJECT_ID) label = "Personal"
      else label = projectMap.get(pid) ?? "Other"

      return {
        id: pid,
        label,
        tasks: sortByPriorityThenDate(tasks.filter((t) => t.project_id === pid)),
      }
    }).filter((g) => g.tasks.length > 0)
  }

  if (groupBy === "labels") {
    // Collect all distinct labels across tasks, excluding "triage" (it's a system label, not a display group)
    const EXCLUDED_LABEL_GROUPS = new Set(["triage"])
    const allLabels = new Set<string>()
    tasks.forEach((t) => t.labels?.forEach((l) => { if (!EXCLUDED_LABEL_GROUPS.has(l)) allLabels.add(l) }))
    const sortedLabels = Array.from(allLabels).sort()

    // Deduplicate: each task appears in exactly one group (first matching label, alphabetically)
    const assignedIds = new Set<string>()
    const labeled: TaskGroup[] = sortedLabels.map((label) => {
      const groupTasks = sortByPriorityThenDate(
        tasks.filter((t) => t.labels?.includes(label) && !assignedIds.has(t.id))
      )
      groupTasks.forEach((t) => assignedIds.add(t.id))
      return { id: `label:${label}`, label, tasks: groupTasks }
    })

    const unlabeled = tasks.filter((t) => (!t.labels || t.labels.length === 0) && !assignedIds.has(t.id))
    const unlabeledGroup: TaskGroup[] = unlabeled.length > 0
      ? [{ id: "unlabeled", label: "Unlabeled", tasks: sortByPriorityThenDate(unlabeled) }]
      : []

    return [...labeled, ...unlabeledGroup].filter((g) => g.tasks.length > 0)
  }

  return []
}

// ─── priority config ──────────────────────────────────────────────────────────

// Todoist API priority is inverted: 4=P1 (urgent), 3=P2, 2=P3, 1=P4 (none)
const PRIORITY_LABELS: Record<number, string> = { 4: "P1", 3: "P2", 2: "P3", 1: "P4" }
const PRIORITY_STYLES: Record<number, string> = {
  4: "text-red-500 border-red-500/30 bg-red-500/5",
  3: "text-orange-400 border-orange-400/30 bg-orange-400/5",
  2: "text-blue-400 border-blue-400/30 bg-blue-400/5",
  1: "text-notion-muted/50 border-notion-border/40 bg-transparent",
}

// ─── sub-components ──────────────────────────────────────────────────────────

interface ProjectPillProps {
  projectId: string
  nameOverride?: string
}

function ProjectPill({ projectId, nameOverride }: ProjectPillProps) {
  const isWork = projectId === WORK_PROJECT_ID
  const isPersonal = projectId === PERSONAL_PROJECT_ID
  const isKnown = isWork || isPersonal

  const baseClass = `inline-flex items-center text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0`

  if (!isKnown) {
    const label = nameOverride ?? "other"
    return (
      <span className={`${baseClass} bg-notion-surface border border-notion-border text-notion-muted/60`}>
        {label}
      </span>
    )
  }

  return (
    <span
      className={`${baseClass} ${
        isWork ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400"
      }`}
    >
      {isWork ? "work" : "personal"}
    </span>
  )
}

interface PriorityBadgeProps {
  priority: number
}

function PriorityBadge({ priority }: PriorityBadgeProps) {
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

interface CheckboxProps {
  state: CheckState
  onClick: () => void
}

function Checkbox({ state, onClick }: CheckboxProps) {
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

function PriorityPicker({ currentPriority, position, onSelect, onClose }: PriorityPickerProps) {
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

// ─── task row ────────────────────────────────────────────────────────────────

interface TaskRowProps {
  task: TodoistTask
  bucket: DueBucket
  dismissed: boolean
  onDismiss: (id: string) => void
  onComplete?: (task: TodoistTask) => void
  onOpenPanel: (task: TodoistTask) => void
  onDelete: (task: TodoistTask) => void
  projects?: TodoistProject[]
  waitingProjectId?: string | null
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

function TaskRow({ task, bucket, dismissed, onDismiss, onComplete, onOpenPanel, onDelete, projects = [], waitingProjectId, isFocused, externalDatePickerOpen, onExternalDatePickerClose, onContextMenu, isSelected, onToggleSelect, selectionMode, onOptimisticOverride, showLabel = true }: TaskRowProps) {
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
              { label: "Work",        value: WORK_PROJECT_ID,     className: "text-blue-400" },
              { label: "Personal",    value: PERSONAL_PROJECT_ID, className: "text-emerald-400" },
              ...(waitingProjectId ? [{ label: "Waiting For", value: waitingProjectId }] : []),
            ]}
            align="right"
            trigger={
              <ProjectPill
                projectId={activeProjectId}
                nameOverride={projects.find((p) => p.id === activeProjectId)?.name}
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

// ─── completed task row ───────────────────────────────────────────────────────

interface CompletedTaskRowProps {
  task: CompletedTask
  onOpenPanel: (task: TodoistTask) => void
  onReopen: (id: string) => void
  projects?: TodoistProject[]
  waitingProjectId?: string | null
}

function CompletedTaskRow({ task, onOpenPanel, onReopen, projects = [], waitingProjectId }: CompletedTaskRowProps) {
  const [reopenState, setReopenState] = useState<CheckState>("idle")
  const [optimisticPriority, setOptimisticPriority] = useState<number | null>(null)
  const [optimisticProjectId, setOptimisticProjectId] = useState<string | null>(null)
  const router = useRouter()

  const activePriority = optimisticPriority ?? task.priority
  const activeProjectId = optimisticProjectId ?? task.project_id

  const completedDate = task.completed_at
    ? (() => {
        const completed = new Date(task.completed_at!)
        const now = new Date()
        const diffMs = now.getTime() - completed.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)
        if (diffMins < 1) return "just now"
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return completed.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      })()
    : null

  const patchTask = useCallback(async (body: Record<string, string | number | string[]>) => {
    try {
      const res = await fetch(`/api/todoist/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) { console.warn(`[patchTask] Failed: ${res.status}`); return }
    } catch (err) {
      console.warn("[patchTask] Network error:", err)
    }
  }, [task.id, router])

  const handleReopen = useCallback(async () => {
    setReopenState("loading")
    try {
      const res = await fetch(`/api/todoist/${task.id}/reopen`, { method: "POST" })
      if (!res.ok) {
        setReopenState("error")
        setTimeout(() => setReopenState("idle"), 1500)
        return
      }
      setReopenState("done")
      onReopen(task.id)
      setTimeout(() => router.refresh(), 500)
    } catch {
      setReopenState("error")
      setTimeout(() => setReopenState("idle"), 1500)
    }
  }, [task.id, onReopen, router])

  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2.5 group hover:bg-notion-hover transition-all cursor-pointer opacity-60 hover:opacity-80"
      onClick={() => onOpenPanel(task)}
    >
      {/* Reopen checkbox — clicking re-opens the task */}
      <span onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleReopen}
          disabled={reopenState === "loading" || reopenState === "done"}
          className="flex-shrink-0 w-4 h-4 mt-[3px] rounded-full border border-notion-border/40 flex items-center justify-center bg-notion-hover hover:bg-notion-surface hover:border-notion-border transition-all disabled:pointer-events-none focus:outline-none focus-visible:ring-1 focus-visible:ring-notion-accent"
          aria-label="Reopen task"
          title="Reopen task"
        >
          {reopenState === "loading" && (
            <svg className="w-2.5 h-2.5 animate-spin text-notion-muted" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          )}
          {reopenState !== "loading" && (
            <svg
              className="w-2.5 h-2.5 text-notion-muted/40 group-hover:text-notion-muted/60 transition-colors"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="2,6 5,9 10,3" />
            </svg>
          )}
        </button>
      </span>

      {/* Priority badge — editable */}
      <span onClick={(e) => e.stopPropagation()}>
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
      </span>

      {/* Task title with strikethrough */}
      <span className="flex-1 text-sm text-notion-muted/50 line-through leading-snug select-none">
        {task.content}
      </span>

      {/* Right side: project pill + completed date + arrow */}
      <div className="flex items-center gap-2 flex-shrink-0 mt-[2px]" onClick={(e) => e.stopPropagation()}>
        <span className="hidden sm:block">
          <PropertyDropdown
            value={activeProjectId}
            onChange={(val) => {
              const project_id = String(val)
              setOptimisticProjectId(project_id)
              patchTask({ project_id })
            }}
            options={[
              { label: "Work",        value: WORK_PROJECT_ID,     className: "text-blue-400" },
              { label: "Personal",    value: PERSONAL_PROJECT_ID, className: "text-emerald-400" },
              ...(waitingProjectId ? [{ label: "Waiting For", value: waitingProjectId }] : []),
            ]}
            align="right"
            trigger={
              <ProjectPill
                projectId={activeProjectId}
                nameOverride={projects.find((p) => p.id === activeProjectId)?.name}
              />
            }
          />
        </span>
        {completedDate && (
          <span className="hidden sm:inline text-[11px] font-mono text-notion-muted/30">{completedDate}</span>
        )}
        <svg
          className="w-3 h-3 text-notion-muted/20 flex-shrink-0 group-hover:text-notion-muted/40 transition-colors"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4.5 2.5l4 3.5-4 3.5" />
        </svg>
      </div>
    </div>
  )
}

// ─── group section ────────────────────────────────────────────────────────────

interface GroupSectionProps {
  group: TaskGroup
  collapsed: boolean
  onToggle: () => void
  dismissed: Set<string>
  onDismiss: (id: string) => void
  onComplete?: (task: TodoistTask) => void
  onOpenPanel: (task: TodoistTask) => void
  onDelete: (task: TodoistTask) => void
  today: string
  projects?: TodoistProject[]
  waitingProjectId?: string | null
  focusedTaskId?: string | null
  kbDatePickerTaskId?: string | null
  onKbDatePickerClose?: () => void
  onContextMenu?: (e: React.MouseEvent, task: TodoistTask) => void
  selectedTaskIds?: Set<string>
  onToggleSelect?: (id: string) => void
  selectionMode?: boolean
  onOptimisticOverride?: (id: string, update: Partial<TodoistTask>) => void
  showLabel?: boolean
}

function GroupSection({ group, collapsed, onToggle, dismissed, onDismiss, onComplete, onOpenPanel, onDelete, today, projects = [], waitingProjectId, focusedTaskId, kbDatePickerTaskId, onKbDatePickerClose, onContextMenu, selectedTaskIds, onToggleSelect, selectionMode, onOptimisticOverride, showLabel = true }: GroupSectionProps) {
  const visible = group.tasks.filter((t) => !dismissed.has(t.id))
  if (visible.length === 0) return null

  const accent = group.accent ?? "default"
  const labelColorClass =
    accent === "red"
      ? "text-red-400"
      : accent === "amber"
      ? "text-amber-400"
      : "text-notion-muted/60"

  // For flat "none" grouping, render tasks without a header
  if (!group.label) {
    return (
      <div className="divide-y divide-notion-border/30">
        {group.tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            bucket={getDueBucket(task, today)}
            dismissed={dismissed.has(task.id)}
            onDismiss={onDismiss}
            onComplete={onComplete}
            onOpenPanel={onOpenPanel}
            onDelete={onDelete}
            projects={projects}
            waitingProjectId={waitingProjectId}
            isFocused={focusedTaskId === task.id}
            externalDatePickerOpen={kbDatePickerTaskId === task.id}
            onExternalDatePickerClose={onKbDatePickerClose}
            onContextMenu={onContextMenu}
            onOptimisticOverride={onOptimisticOverride}
            isSelected={selectedTaskIds?.has(task.id)}
            onToggleSelect={onToggleSelect}
            selectionMode={selectionMode}
            showLabel={showLabel}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="mb-5">
      <div
        className="flex items-center gap-2 mb-2 px-1 cursor-pointer select-none"
        onClick={onToggle}
      >
        <svg
          className={`w-3 h-3 text-notion-muted/40 transition-transform flex-shrink-0 ${collapsed ? "" : "rotate-90"}`}
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M4.5 2.5l4 3.5-4 3.5" />
        </svg>
        <p className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${labelColorClass}`}>
          {group.label}
        </p>
        <span className="text-[10px] text-notion-muted/40 font-mono">{visible.length}</span>
      </div>
      {!collapsed && (
        <div className="divide-y divide-notion-border/30">
          {group.tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              bucket={group.bucket ?? getDueBucket(task, today)}
              dismissed={dismissed.has(task.id)}
              onDismiss={onDismiss}
              onComplete={onComplete}
              onOpenPanel={onOpenPanel}
              onDelete={onDelete}
              projects={projects}
              waitingProjectId={waitingProjectId}
              isFocused={focusedTaskId === task.id}
              externalDatePickerOpen={kbDatePickerTaskId === task.id}
              onExternalDatePickerClose={onKbDatePickerClose}
              onContextMenu={onContextMenu}
              onOptimisticOverride={onOptimisticOverride}
              isSelected={selectedTaskIds?.has(task.id)}
              onToggleSelect={onToggleSelect}
              selectionMode={selectionMode}
              showLabel={showLabel}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

interface TasksClientProps {
  tasks: TodoistTask[]
  initialTaskId?: string
  initialTab?: string
  initialPriority?: string
  initialGroupBy?: string
  initialTag?: string
  waitingProjectId?: string | null
  taskNotesIndex?: Record<string, Array<{ title: string; date: string; href: string }>>
}


function SyncLabelsButton() {
  const [status, setStatus] = useState<"idle" | "syncing" | "synced">("idle")

  const handleSync = async () => {
    setStatus("syncing")
    await fetch("/api/todoist/labels/sync", { method: "POST" })
    setStatus("synced")
    setTimeout(() => setStatus("idle"), 2000)
  }

  return (
    <button
      onClick={handleSync}
      disabled={status === "syncing"}
      className="text-[10px] text-notion-muted/40 hover:text-notion-muted transition-colors px-1"
    >
      {status === "syncing" ? "syncing..." : status === "synced" ? "synced!" : "sync labels"}
    </button>
  )
}

export default function TasksClient({ tasks, initialTaskId, initialTab, initialPriority, initialGroupBy, initialTag, waitingProjectId: initialWaitingProjectId, taskNotesIndex }: TasksClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [projects, setProjects] = useState<TodoistProject[]>([])
  const [activeTab, setActiveTab] = useState<ViewTab>(() => {
    const t = initialTab ?? searchParams.get("tab")
    return (["all", "work", "personal", "waiting"].includes(t ?? "") ? t : "all") as ViewTab
  })
  const [showCompleted, setShowCompleted] = useState(false)
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([])
  const [completedLoading, setCompletedLoading] = useState(false)
  const [completedError, setCompletedError] = useState<string | null>(null)
  const completedFetched = useRef(false)
  const completedWaitingFetched = useRef(false)
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>(() => {
    const p = initialPriority ?? searchParams.get("priority")
    return (["all", "p1", "p2", "p3", "p4"].includes(p ?? "") ? p : "all") as PriorityFilter
  })
  const [tagFilter, setTagFilter] = useState<string | null>(() => initialTag ?? searchParams.get("tag"))
  const [labelDropdownOpen, setLabelDropdownOpen] = useState(false)
  const labelDropdownRef = useRef<HTMLDivElement>(null)
  const [dueFilter, setDueFilter] = useState<"all" | "overdue" | "today">("all")
  const [groupBy, setGroupBy] = useState<GroupBy>(() => {
    const g = initialGroupBy ?? searchParams.get("groupBy")
    return (["due", "priority", "project", "labels", "none"].includes(g ?? "") ? g : "due") as GroupBy
  })
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set(["next-week", "later", "none"]))
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [optimisticOverrides, setOptimisticOverrides] = useState<Map<string, Partial<TodoistTask>>>(new Map())
  const [reopenedIds, setReopenedIds] = useState<Set<string>>(new Set())
  const [selectedTask, setSelectedTask] = useState<TodoistTask | null>(null)
  const [selectedTaskIsCompleted, setSelectedTaskIsCompleted] = useState(false)
  const [, startTransition] = useTransition()
  const completedSectionRef = useRef<HTMLDivElement>(null)
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null)
  const [kbDatePickerTaskId, setKbDatePickerTaskId] = useState<string | null>(null)
  const [kbPriorityTaskId, setKbPriorityTaskId] = useState<string | null>(null)
  const [contextMenuTask, setContextMenuTask] = useState<TodoistTask | null>(null)
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [labelPickerTask, setLabelPickerTask] = useState<TodoistTask | null>(null)
  const [labelPickerPos, setLabelPickerPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const shortcutsRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Sync selectedTask with fresh task data after router.refresh()
  useEffect(() => {
    if (!selectedTask) return
    const updated = tasks.find(t => t.id === selectedTask.id)
    if (updated) setSelectedTask(updated)
  }, [tasks]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch projects once on mount for real project names
  useEffect(() => {
    fetch("/api/todoist/projects")
      .then((r) => r.ok ? r.json() : [])
      .then((data: unknown) => {
        if (Array.isArray(data)) {
          setProjects(data as TodoistProject[])
        }
      })
      .catch(() => {/* silently ignore — pill falls back to "other" */})
  }, [])

  // Close label dropdown on click outside
  useEffect(() => {
    if (!labelDropdownOpen) return
    function handleClick(e: MouseEvent) {
      if (labelDropdownRef.current && !labelDropdownRef.current.contains(e.target as Node)) {
        setLabelDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [labelDropdownOpen])

  // Close shortcuts popover on click outside or Escape
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

  // Auto-open panel if navigated here with a taskId param
  useEffect(() => {
    if (initialTaskId) {
      const task = tasks.find((t) => t.id === initialTaskId)
      if (task) setSelectedTask(task)
    }
  }, [initialTaskId, tasks])

  const handleDismiss = useCallback((id: string) => {
    if (id.startsWith("__revert__")) {
      const realId = id.replace("__revert__", "")
      setDismissed((prev) => {
        const next = new Set(prev)
        next.delete(realId)
        return next
      })
    } else {
      setDismissed((prev) => new Set(prev).add(id))
    }
  }, [])

  const applyOptimisticOverride = useCallback((id: string, update: Partial<TodoistTask>) => {
    setOptimisticOverrides((prev) => new Map(prev).set(id, { ...(prev.get(id) ?? {}), ...update }))
  }, [])

  // Optimistically add a just-completed task to the completed list
  const addToCompleted = useCallback((task: TodoistTask) => {
    const completedTask: CompletedTask = {
      ...task,
      is_completed: true,
      completed_at: new Date().toISOString(),
    }
    setCompletedTasks((prev) => [completedTask, ...prev])
  }, [])

  const handleOpenPanel = useCallback((task: TodoistTask) => {
    setSelectedTask(task)
    setSelectedTaskIsCompleted(false)
  }, [])

  const handleOpenCompletedPanel = useCallback((task: TodoistTask) => {
    setSelectedTask(task)
    setSelectedTaskIsCompleted(true)
  }, [])

  const handleClosePanel = useCallback(() => {
    setSelectedTask(null)
    setSelectedTaskIsCompleted(false)
  }, [])

  const handleRefresh = useCallback(() => {
    router.refresh()
    setOptimisticOverrides(new Map())
  }, [router])

  // Sync filter state to URL params so reloads restore the same view
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    // Always remove taskId — the detail panel is ephemeral and should never persist across navigation
    params.delete("taskId")
    // tab
    if (activeTab && activeTab !== "all") {
      params.set("tab", activeTab)
    } else {
      params.delete("tab")
    }
    // priority
    if (priorityFilter && priorityFilter !== "all") {
      params.set("priority", priorityFilter)
    } else {
      params.delete("priority")
    }
    // groupBy
    if (groupBy && groupBy !== "due") {
      params.set("groupBy", groupBy)
    } else {
      params.delete("groupBy")
    }
    // tagFilter
    if (tagFilter) {
      params.set("tag", tagFilter)
    } else {
      params.delete("tag")
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [activeTab, priorityFilter, groupBy, tagFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleReopenTask = useCallback((id: string) => {
    setReopenedIds((prev) => new Set(prev).add(id))
    // Also remove from dismissed so the task doesn't show with strikethrough in the main list
    setDismissed((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const handleToggleCompleted = useCallback(async () => {
    if (showCompleted) {
      setShowCompleted(false)
      return
    }
    setShowCompleted(true)

    const mergeCompleted = (fetched: CompletedTask[]) => {
      setCompletedTasks((prev) => {
        const existingIds = new Set(prev.map((t) => t.id))
        const newOnly = fetched.filter((t) => !existingIds.has(t.id))
        return [...prev, ...newOnly]
      })
    }

    const fetches: Promise<void>[] = []

    if (!completedFetched.current) {
      fetches.push(
        (async () => {
          const res = await fetch("/api/todoist/completed")
          if (!res.ok) throw new Error("Failed to load completed tasks.")
          const data = await res.json()
          completedFetched.current = true
          mergeCompleted(data.tasks ?? [])
        })()
      )
    }

    // When on the waiting tab, also fetch project-specific completed tasks
    // so tasks completed outside the recent 30 global results are included
    if (activeTab === "waiting" && initialWaitingProjectId && !completedWaitingFetched.current) {
      fetches.push(
        (async () => {
          const res = await fetch(`/api/todoist/completed?project_id=${initialWaitingProjectId}`)
          if (!res.ok) throw new Error("Failed to load waiting completed tasks.")
          const data = await res.json()
          completedWaitingFetched.current = true
          mergeCompleted(data.tasks ?? [])
        })()
      )
    }

    if (fetches.length === 0) return

    setCompletedLoading(true)
    setCompletedError(null)
    try {
      await Promise.all(fetches)
    } catch {
      setCompletedError("Failed to load completed tasks.")
    } finally {
      setCompletedLoading(false)
    }
  }, [showCompleted, activeTab, initialWaitingProjectId])

  const handleDelete = useCallback(async (task: TodoistTask) => {
    handleDismiss(task.id)
    try {
      const res = await fetch(`/api/todoist/${task.id}/delete`, { method: "POST" })
      if (!res.ok) { console.warn(`[handleDelete] Failed: ${res.status}`); return }
      setTimeout(() => router.refresh(), 300)
    } catch (err) {
      console.warn("[handleDelete] Network error:", err)
    }
  }, [handleDismiss, router])

  const handleContextMenu = useCallback((e: React.MouseEvent, task: TodoistTask) => {
    e.preventDefault()
    setContextMenuTask(task)
    setContextMenuPos({ x: e.clientX, y: e.clientY })
  }, [])

  const handleContextComplete = useCallback(async (task: TodoistTask) => {
    handleDismiss(task.id)
    try {
      // Remove "triage" label when completing a task
      if (task.labels?.includes("triage")) {
        fetch(`/api/todoist/${task.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ labels: (task.labels || []).filter((l) => l !== "triage") }),
        }).catch(() => {})
      }
      await fetch(`/api/todoist/${task.id}/close`, { method: "POST" })
      addToCompleted(task)
      setTimeout(() => router.refresh(), 300)
    } catch {
      handleDismiss("__revert__" + task.id)
    }
  }, [handleDismiss, addToCompleted, router])

  const handleCloseContextMenu = useCallback(() => setContextMenuTask(null), [])
  const handleCloseLabelPicker = useCallback(() => setLabelPickerTask(null), [])

  // Called by the detail panel when a task is completed from within the panel.
  // Dismisses the task from the active list and adds it to the completed list
  // so the UI updates immediately without waiting for router.refresh() to settle.
  const handlePanelComplete = useCallback((task: TodoistTask) => {
    handleDismiss(task.id)
    addToCompleted(task)
  }, [handleDismiss, addToCompleted])

  // ─── multi-select ──────────────────────────────────────────────────────────
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set())

  // Clear selection when switching tabs
  useEffect(() => {
    setSelectedTaskIds(new Set())
  }, [activeTab])

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedTaskIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleBulkComplete = useCallback(async () => {
    const ids = Array.from(selectedTaskIds)
    setSelectedTaskIds(new Set())
    ids.forEach(id => handleDismiss(id))
    const completingTasks = tasks.filter(t => ids.includes(t.id))
    try {
      await Promise.all(ids.map(id => fetch(`/api/todoist/${id}/close`, { method: "POST" })))
      completingTasks.forEach(t => addToCompleted(t))
      setTimeout(() => router.refresh(), 300)
    } catch (err) {
      console.warn("[handleBulkComplete] error:", err)
    }
  }, [selectedTaskIds, handleDismiss, tasks, addToCompleted, router])

  const handleBulkSetPriority = useCallback(async (priority: number) => {
    const ids = Array.from(selectedTaskIds)
    ids.forEach(id => applyOptimisticOverride(id, { priority }))
    setSelectedTaskIds(new Set())
    try {
      await Promise.all(ids.map(id => fetch(`/api/todoist/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority }),
      })))
      setTimeout(() => router.refresh(), 300)
    } catch (err) {
      console.warn("[handleBulkSetPriority] error:", err)
    }
  }, [selectedTaskIds, applyOptimisticOverride, router])

  const handleKbPrioritySelect = useCallback((priority: number) => {
    if (!kbPriorityTaskId) return
    applyOptimisticOverride(kbPriorityTaskId, { priority })
    fetch(`/api/todoist/${kbPriorityTaskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority }),
    }).then(() => { setTimeout(() => { router.refresh(); setOptimisticOverrides(new Map()) }, 300) })
  }, [kbPriorityTaskId, applyOptimisticOverride, router])

  const toggleCollapsed = useCallback((groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }, [])

  const today = getTodayString()

  // Use server-provided waitingProjectId, fall back to client-fetched projects
  const waitingProjectId = initialWaitingProjectId ?? projects.find((p) => p.name.toLowerCase() === "waiting for")?.id ?? null

  // Search filter helper
  const matchesSearch = (t: TodoistTask) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return t.content.toLowerCase().includes(q) || (t.description?.toLowerCase().includes(q) ?? false)
  }

  // Apply optimistic overrides so grouping/sorting updates instantly on any patch
  const effectiveTasks = tasks.map((t) => {
    const override = optimisticOverrides.get(t.id)
    return override ? { ...t, ...override } : t
  })

  // Exclude subtasks from the main list — they appear inside the parent's detail panel
  const topLevelEffectiveTasks = effectiveTasks.filter((t) => !t.parent_id)

  // Separate triage tasks (have "triage" label AND no due date, exclude Waiting For)
  const triageTasks = topLevelEffectiveTasks.filter((t) => t.labels?.includes("triage") && !t.due?.date && t.project_id !== waitingProjectId && matchesSearch(t))
  const nonTriageTasks = topLevelEffectiveTasks.filter((t) => (!(t.labels?.includes("triage") && !t.due?.date) || t.project_id === waitingProjectId) && matchesSearch(t))
  const [triageCollapsed, setTriageCollapsed] = useState(false)

  // Filter triage by active domain tab
  const filteredTriageTasks = triageTasks.filter((t) => {
    if (activeTab === "waiting") return false
    if (activeTab === "work") return t.project_id === WORK_PROJECT_ID
    if (activeTab === "personal") return t.project_id === PERSONAL_PROJECT_ID
    return true // "all" tab
  })

  // Step 1: filter by view tab
  const tabFiltered = nonTriageTasks.filter((t) => {
    if (activeTab === "work") return t.project_id === WORK_PROJECT_ID
    if (activeTab === "personal") return t.project_id === PERSONAL_PROJECT_ID
    if (activeTab === "waiting") return waitingProjectId ? t.project_id === waitingProjectId : false
    // "all" excludes the Waiting For project so it doesn't clutter the main view
    if (waitingProjectId && t.project_id === waitingProjectId) return false
    return true
  })

  // Step 2: filter by priority
  const priorityFiltered = tabFiltered.filter((t) => {
    if (priorityFilter === "p1") return t.priority === 4
    if (priorityFilter === "p2") return t.priority === 3
    if (priorityFilter === "p3") return t.priority === 2
    if (priorityFilter === "p4") return t.priority === 1
    return true
  })

  // Show all taxonomy labels in the dropdown (excludes source/system labels)
  const FILTER_HIDDEN_LABELS = new Set(["triage", "note", "work", "personal"])
  const availableLabels = ALL_TAGS
    .filter(t => !FILTER_HIDDEN_LABELS.has(t.id))
    .map(t => t.id)

  // Step 2b: filter by label tag
  const tagFiltered = priorityFiltered.filter(t => {
    if (!tagFilter) return true
    return (t.labels ?? []).some(l => l === tagFilter || todoistLabelToTagId(l) === tagFilter)
  })

  // Stats (computed from tabFiltered before due/priority filters)
  const statsOverdue = tabFiltered.filter((t) => getDueBucket(t, today) === "overdue").length
  const statsDueToday = tabFiltered.filter((t) => getDueBucket(t, today) === "today").length

  // Step 3: filter by due
  const filtered = tagFiltered.filter((t) => {
    if (dueFilter === "overdue") return getDueBucket(t, today) === "overdue"
    if (dueFilter === "today") return getDueBucket(t, today) === "today"
    return true
  })

  // Deduplicate by task ID before grouping (safety net for any upstream duplicates)
  const deduped = Array.from(new Map(filtered.map((t) => [t.id, t])).values())

  // Step 4: group
  const groups = groupTasks(deduped, groupBy, today, projects)

  const totalVisible = deduped.filter((t) => !dismissed.has(t.id)).length
  const isEmpty = totalVisible === 0 && deduped.length === 0

  // Build flat list of visible task IDs for keyboard navigation
  const allVisibleTaskIds = useMemo(() => {
    const ids: string[] = []
    // Triage tasks first (if not collapsed)
    if (filteredTriageTasks.length > 0 && !triageCollapsed) {
      filteredTriageTasks.forEach((t) => { if (!dismissed.has(t.id)) ids.push(t.id) })
    }
    // Grouped tasks
    groups.forEach((group) => {
      if (group.label && collapsedGroups.has(group.id)) return
      group.tasks.forEach((t) => { if (!dismissed.has(t.id)) ids.push(t.id) })
    })
    return ids
  }, [filteredTriageTasks, triageCollapsed, groups, collapsedGroups, dismissed])

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't interfere when context menu is open
      if (contextMenuTask) return

      // Don't interfere with typing in inputs/textareas
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return

      if (e.key === "Escape") {
        if (kbDatePickerTaskId) {
          setKbDatePickerTaskId(null)
        } else if (kbPriorityTaskId) {
          setKbPriorityTaskId(null)
        } else if (selectedTaskIds.size > 0) {
          setSelectedTaskIds(new Set())
        } else if (focusedTaskId) {
          setFocusedTaskId(null)
        }
        return
      }

      // c: Open create task modal
      if (e.key === "c" && !showCreateForm) {
        e.preventDefault()
        setShowCreateForm(true)
        return
      }

      // Shift+Arrow: extend selection
      if (e.shiftKey && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        e.preventDefault()
        if (allVisibleTaskIds.length === 0) return
        const currentIdx = focusedTaskId ? allVisibleTaskIds.indexOf(focusedTaskId) : -1
        if (currentIdx === -1) {
          const firstId = allVisibleTaskIds[0]
          setFocusedTaskId(firstId)
          setSelectedTaskIds(prev => { const n = new Set(prev); n.add(firstId); return n })
          return
        }
        const nextIdx = e.key === "ArrowDown"
          ? Math.min(currentIdx + 1, allVisibleTaskIds.length - 1)
          : Math.max(currentIdx - 1, 0)
        const nextId = allVisibleTaskIds[nextIdx]
        setSelectedTaskIds(prev => {
          const next = new Set(prev)
          if (focusedTaskId) next.add(focusedTaskId)
          next.add(nextId)
          return next
        })
        setFocusedTaskId(nextId)
        return
      }

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault()
        if (allVisibleTaskIds.length === 0) return
        if (!focusedTaskId) {
          setFocusedTaskId(allVisibleTaskIds[0])
          return
        }
        const currentIdx = allVisibleTaskIds.indexOf(focusedTaskId)
        if (e.key === "ArrowDown") {
          const nextIdx = currentIdx < allVisibleTaskIds.length - 1 ? currentIdx + 1 : currentIdx
          setFocusedTaskId(allVisibleTaskIds[nextIdx])
        } else {
          const prevIdx = currentIdx > 0 ? currentIdx - 1 : 0
          setFocusedTaskId(allVisibleTaskIds[prevIdx])
        }
        setKbDatePickerTaskId(null)
        return
      }

      if (e.key === "d" && focusedTaskId && !kbDatePickerTaskId) {
        e.preventDefault()
        setKbDatePickerTaskId(focusedTaskId)
        return
      }

      // Guard: remaining shortcuts require a focused task and no open overlays
      if (!focusedTaskId || kbDatePickerTaskId || kbPriorityTaskId || contextMenuTask || labelPickerTask) return

      const focusedTask = tasks.find((t) => t.id === focusedTaskId)
      if (!focusedTask) return

      // p: Open priority picker
      if (e.key === "p") {
        e.preventDefault()
        setKbPriorityTaskId(focusedTaskId)
        return
      }

      // t: Set focused task to today
      if (e.key === "t") {
        e.preventDefault()
        const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" })
        applyOptimisticOverride(focusedTask.id, { due: { date: todayStr } })
        fetch(`/api/todoist/${focusedTask.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ due_string: todayStr }),
        }).then(() => { setTimeout(() => { router.refresh(); setOptimisticOverrides(new Map()) }, 300) })
        return
      }

      // e: Complete the focused task
      if (e.key === "e") {
        e.preventDefault()
        handleContextComplete(focusedTask)
        // Move focus to next task
        const currentIdx = allVisibleTaskIds.indexOf(focusedTaskId)
        const nextId = allVisibleTaskIds[currentIdx + 1] ?? allVisibleTaskIds[currentIdx - 1] ?? null
        setFocusedTaskId(nextId)
        return
      }

      // Space: Open context menu for the focused task
      if (e.key === " ") {
        e.preventDefault()
        const taskEl = document.querySelector(`[data-task-id="${focusedTaskId}"]`)
        if (taskEl) {
          const rect = taskEl.getBoundingClientRect()
          setContextMenuTask(focusedTask)
          setContextMenuPos({ x: rect.left + 40, y: rect.bottom })
        } else {
          setContextMenuTask(focusedTask)
          setContextMenuPos({ x: window.innerWidth / 2 - 110, y: window.innerHeight / 3 })
        }
        return
      }

      // Enter: Open detail panel
      if (e.key === "Enter") {
        e.preventDefault()
        handleOpenPanel(focusedTask)
        return
      }

      // l: Open label picker popover anchored to the focused task row
      if (e.key === "l") {
        e.preventDefault()
        const taskEl = document.querySelector(`[data-task-id="${focusedTaskId}"]`)
        if (taskEl) {
          const rect = taskEl.getBoundingClientRect()
          setLabelPickerTask(focusedTask)
          setLabelPickerPos({ x: rect.left + 40, y: rect.bottom })
        } else {
          setLabelPickerTask(focusedTask)
          setLabelPickerPos({ x: window.innerWidth / 2 - 110, y: window.innerHeight / 3 })
        }
        return
      }

      // v: Toggle between Work and Personal project
      if (e.key === "v") {
        e.preventDefault()
        const newProjectId = focusedTask.project_id === WORK_PROJECT_ID
          ? PERSONAL_PROJECT_ID
          : WORK_PROJECT_ID
        applyOptimisticOverride(focusedTaskId, { project_id: newProjectId })
        fetch(`/api/todoist/${focusedTaskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ project_id: newProjectId }),
        }).then(() => { setTimeout(() => { router.refresh(); setOptimisticOverrides(new Map()) }, 300) })
        return
      }

      // Left/Right arrows: Collapse/expand the group containing the focused task
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const groupForTask = groups.find((g) => g.tasks.some((t) => t.id === focusedTaskId))
        if (groupForTask && groupForTask.label) {
          e.preventDefault()
          if (e.key === "ArrowLeft") {
            setCollapsedGroups((prev) => new Set(prev).add(groupForTask.id))
          } else {
            setCollapsedGroups((prev) => {
              const next = new Set(prev)
              next.delete(groupForTask.id)
              return next
            })
          }
        }
        // Also check if focused task is in triage section
        if (filteredTriageTasks.some((t) => t.id === focusedTaskId)) {
          e.preventDefault()
          setTriageCollapsed(e.key === "ArrowLeft")
        }
        return
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [focusedTaskId, kbDatePickerTaskId, kbPriorityTaskId, allVisibleTaskIds, contextMenuTask, labelPickerTask, tasks, groups, filteredTriageTasks, router, handleContextComplete, handleOpenPanel, applyOptimisticOverride, selectedTaskIds, showCreateForm])


  // ─── tabs ─────────────────────────────────────────────────────────────────

  const tabs: { id: ViewTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "work", label: "Work" },
    { id: "personal", label: "Personal" },
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

  // Reset collapsed state when grouping changes
  const handleSetGroupBy = useCallback((g: GroupBy) => {
    setGroupBy(g)
    setCollapsedGroups(new Set())
  }, [])

  // Tab-filtered completed count: only count tasks that would be visible in the current tab
  const tabFilteredCompletedCount = completedTasks.filter((task) => {
    if (reopenedIds.has(task.id)) return false
    if (activeTab === "work") return task.project_id === WORK_PROJECT_ID
    if (activeTab === "personal") return task.project_id === PERSONAL_PROJECT_ID
    if (activeTab === "waiting") return waitingProjectId ? task.project_id === waitingProjectId : false
    if (waitingProjectId && task.project_id === waitingProjectId) return false
    return true
  }).length

  return (
    <div>
      {/* Stats bar */}
      <div className="flex items-center gap-6 mb-6 px-1">
        <button
          onClick={() => setDueFilter("all")}
          className={`flex flex-col gap-0.5 text-left transition-opacity ${dueFilter !== "all" ? "opacity-40 hover:opacity-70" : ""}`}
        >
          <span className="text-xl tabular-nums leading-none font-semibold text-notion-text">{tabFiltered.filter((t) => !dismissed.has(t.id)).length}</span>
          <span className="text-[10px] uppercase tracking-widest text-notion-muted/50 font-medium">total</span>
        </button>
        <button
          onClick={() => setDueFilter(dueFilter === "overdue" ? "all" : "overdue")}
          className={`flex flex-col gap-0.5 text-left transition-opacity ${dueFilter === "today" ? "opacity-40 hover:opacity-70" : ""}`}
        >
          <span className={`text-xl tabular-nums leading-none font-semibold ${statsOverdue > 0 ? "text-red-400" : "text-notion-text"}`}>{statsOverdue}</span>
          <span className={`text-[10px] uppercase tracking-widest font-medium ${dueFilter === "overdue" ? "text-red-400" : "text-notion-muted/50"}`}>overdue</span>
        </button>
        <button
          onClick={() => setDueFilter(dueFilter === "today" ? "all" : "today")}
          className={`flex flex-col gap-0.5 text-left transition-opacity ${dueFilter === "overdue" ? "opacity-40 hover:opacity-70" : ""}`}
        >
          <span className={`text-xl tabular-nums leading-none font-semibold ${statsDueToday > 0 ? "text-amber-400" : "text-notion-text"}`}>{statsDueToday}</span>
          <span className={`text-[10px] uppercase tracking-widest font-medium ${dueFilter === "today" ? "text-amber-400" : "text-notion-muted/50"}`}>due today</span>
        </button>

        {/* Search input */}
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="text-sm bg-transparent border-b border-notion-border/30 text-notion-text placeholder:text-notion-muted/40 outline-none px-1 py-1 w-48 focus:border-notion-border ml-auto"
        />

        {/* Add task button */}
        <button
          onClick={() => setShowCreateForm(true)}
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
        onChange={(id) => startTransition(() => {
          setActiveTab(id as ViewTab)
          setTagFilter(null)
          setSearchQuery("")
          if (id === "waiting") setGroupBy("labels")
          else if (activeTab === "waiting") setGroupBy("due")
        })}
        className="mb-3"
      />

      {/* Priority filter pills + Group by selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <div className="flex items-center gap-1.5 flex-wrap">
          {priorities.map((p) => (
            <button
              key={p.id}
              onClick={() => startTransition(() => setPriorityFilter(p.id))}
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
              onClick={() => setLabelDropdownOpen(o => !o)}
              className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md border transition-colors ${
                tagFilter
                  ? "bg-notion-surface border-notion-border text-notion-text"
                  : "border-transparent text-notion-muted hover:text-notion-text"
              }`}
            >
              <span>{tagFilter ? getTagDef(tagFilter).label : "All Labels"}</span>
              <svg className={`w-3 h-3 transition-transform ${labelDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {labelDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 z-20 min-w-[160px] max-h-56 overflow-y-auto bg-notion-bg border border-notion-border rounded-lg shadow-lg pt-0.5 pb-1 text-[11px]">
                <button
                  onClick={() => { setTagFilter(null); setLabelDropdownOpen(false) }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-notion-hover transition-colors ${!tagFilter ? "text-notion-text font-medium" : "text-notion-muted"}`}
                >
                  All Labels
                </button>
                {availableLabels.length === 0 ? (
                  <span className="block px-3 py-1.5 text-notion-muted/50">No labels on current tasks</span>
                ) : (
                  availableLabels.map(l => (
                    <button
                      key={l}
                      onClick={() => { setTagFilter(l); setLabelDropdownOpen(false) }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-notion-hover transition-colors ${tagFilter === l ? "text-notion-text font-medium" : "text-notion-muted"}`}
                    >
                      {getTagDef(l).label}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <SyncLabelsButton />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[11px] text-notion-muted/50 shrink-0">Group:</span>
          {groupOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleSetGroupBy(opt.id)}
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

      {/* Triage section */}
      {filteredTriageTasks.filter((t) => !dismissed.has(t.id)).length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/[0.03]">
          <div
            className="flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none"
            onClick={() => setTriageCollapsed((v) => !v)}
          >
            <svg
              className={`w-3 h-3 text-amber-400/60 transition-transform flex-shrink-0 ${triageCollapsed ? "" : "rotate-90"}`}
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M4.5 2.5l4 3.5-4 3.5" />
            </svg>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-400">
              Triage
            </p>
            <span className="text-[10px] text-amber-400/50 font-mono">
              {filteredTriageTasks.filter((t) => !dismissed.has(t.id)).length}
            </span>
          </div>
          {!triageCollapsed && (
            <div className="divide-y divide-amber-500/10">
              {filteredTriageTasks.filter((t) => !dismissed.has(t.id)).map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  bucket={getDueBucket(task, today)}
                  dismissed={false}
                  onDismiss={handleDismiss}
                  onComplete={addToCompleted}
                  onOpenPanel={handleOpenPanel}
                  onDelete={handleDelete}
                  projects={projects}
                  waitingProjectId={waitingProjectId}
                  isFocused={focusedTaskId === task.id}
                  externalDatePickerOpen={kbDatePickerTaskId === task.id}
                  onExternalDatePickerClose={() => setKbDatePickerTaskId(null)}
                  onContextMenu={handleContextMenu}
                  onOptimisticOverride={applyOptimisticOverride}
                  isSelected={selectedTaskIds.has(task.id)}
                  onToggleSelect={handleToggleSelect}
                  selectionMode={selectedTaskIds.size > 0}
                  showLabel={activeTab !== "all"}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Task list */}
      {isEmpty ? (
        <p className="text-sm text-notion-muted px-1">{(() => {
          if (searchQuery) return `No tasks match "${searchQuery}"`
          if (tagFilter) return `No tasks tagged "${tagFilter}"`
          if (priorityFilter !== "all") return `No ${priorityFilter.toUpperCase()} tasks`
          if (activeTab === "work") return "No work tasks — all clear"
          if (activeTab === "personal") return "No personal tasks — all clear"
          if (activeTab === "waiting") return "Nothing waiting on others"
          return "All clear — nothing due"
        })()}</p>
      ) : (
        <div>
          {groups.map((group) => (
            <GroupSection
              key={group.id}
              group={group}
              collapsed={collapsedGroups.has(group.id)}
              onToggle={() => toggleCollapsed(group.id)}
              dismissed={dismissed}
              onDismiss={handleDismiss}
              onComplete={addToCompleted}
              onOpenPanel={handleOpenPanel}
              onDelete={handleDelete}
              today={today}
              projects={projects}
              waitingProjectId={waitingProjectId}
              focusedTaskId={focusedTaskId}
              kbDatePickerTaskId={kbDatePickerTaskId}
              onKbDatePickerClose={() => setKbDatePickerTaskId(null)}
              onContextMenu={handleContextMenu}
              onOptimisticOverride={applyOptimisticOverride}
              selectedTaskIds={selectedTaskIds}
              onToggleSelect={handleToggleSelect}
              selectionMode={selectedTaskIds.size > 0}
              showLabel={activeTab !== "all"}
            />
          ))}
        </div>
      )}

      {/* Context menu */}
      {contextMenuTask && (
        <TaskContextMenu
          task={effectiveTasks.find(t => t.id === contextMenuTask.id) ?? contextMenuTask}
          position={contextMenuPos}
          onClose={handleCloseContextMenu}
          onComplete={handleContextComplete}
          onRefresh={handleRefresh}
          onOptimisticOverride={applyOptimisticOverride}
          onDelete={handleDelete}
        />
      )}

      {/* Label picker popover (triggered by l key) */}
      {labelPickerTask && (
        <TaskLabelPickerPopover
          task={effectiveTasks.find(t => t.id === labelPickerTask.id) ?? labelPickerTask}
          position={labelPickerPos}
          onClose={handleCloseLabelPicker}
          onRefresh={handleRefresh}
        />
      )}

      {/* Priority picker (triggered by p key) */}
      {kbPriorityTaskId && (() => {
        const task = tasks.find(t => t.id === kbPriorityTaskId)
        const taskEl = document.querySelector(`[data-task-id="${kbPriorityTaskId}"]`)
        const rect = taskEl?.getBoundingClientRect()
        const pos = rect
          ? { top: rect.bottom + 4, left: rect.left }
          : { top: window.innerHeight / 3, left: window.innerWidth / 2 - 80 }
        return (
          <PriorityPicker
            taskId={kbPriorityTaskId}
            currentPriority={task?.priority ?? 1}
            position={pos}
            onSelect={handleKbPrioritySelect}
            onClose={() => setKbPriorityTaskId(null)}
          />
        )
      })()}

      {/* Bulk action bar — appears when tasks are selected */}
      {selectedTaskIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-notion-bg border border-notion-border rounded-full shadow-xl px-4 py-2.5">
          <span className="text-[11px] text-notion-muted font-medium tabular-nums">{selectedTaskIds.size} selected</span>
          <div className="w-px h-4 bg-notion-border/40" />
          <button
            onClick={handleBulkComplete}
            className="text-[11px] text-notion-text hover:text-notion-accent transition-colors"
          >
            Complete all
          </button>
          <div className="w-px h-4 bg-notion-border/40" />
          <span className="text-[9px] text-notion-muted/40 uppercase tracking-wider">Priority:</span>
          {[
            { p: 4, label: "P1", cls: "text-red-400 hover:bg-red-500/10 border-red-500/20" },
            { p: 3, label: "P2", cls: "text-orange-400 hover:bg-orange-400/10 border-orange-400/20" },
            { p: 2, label: "P3", cls: "text-blue-400 hover:bg-blue-400/10 border-blue-400/20" },
            { p: 1, label: "P4", cls: "text-notion-muted/50 hover:bg-notion-hover border-notion-border/40" },
          ].map(({ p, label, cls }) => (
            <button
              key={p}
              onClick={() => handleBulkSetPriority(p)}
              className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors ${cls}`}
            >
              {label}
            </button>
          ))}
          <div className="w-px h-4 bg-notion-border/40" />
          <button
            onClick={() => setSelectedTaskIds(new Set())}
            className="text-[11px] text-notion-muted/50 hover:text-notion-text transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Create task modal */}
      {showCreateForm && (
        <CreateTaskModal
          defaultProjectId={
            activeTab === "work" ? WORK_PROJECT_ID
            : activeTab === "personal" ? PERSONAL_PROJECT_ID
            : activeTab === "waiting" && waitingProjectId ? waitingProjectId
            : WORK_PROJECT_ID
          }
          onCreated={() => setShowCreateForm(false)}
          onCancel={() => setShowCreateForm(false)}
          waitingProjectId={waitingProjectId}
        />
      )}

      {/* Task detail slide-out panel */}
      <TaskDetailPanel
        task={selectedTask}
        onClose={handleClosePanel}
        onRefresh={handleRefresh}
        isCompleted={selectedTaskIsCompleted}
        onReopen={handleReopenTask}
        onComplete={handlePanelComplete}
        waitingProjectId={waitingProjectId}
        taskNotesIndex={taskNotesIndex}
        allTasks={tasks}
        onOpenTask={handleOpenPanel}
      />

      {/* Completed tasks toggle */}
      <div ref={completedSectionRef} className="mt-8 border-t border-notion-border/30 pt-5">
        <button
          onClick={() => {
            handleToggleCompleted()
            if (!showCompleted) {
              setTimeout(() => {
                completedSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
              }, 100)
            }
          }}
          className="flex items-center gap-2 text-[11px] text-notion-muted/50 hover:text-notion-muted transition-colors group"
        >
          <svg
            className={`w-3 h-3 transition-transform ${showCompleted ? "rotate-90" : ""}`}
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4.5 2.5l4 3.5-4 3.5" />
          </svg>
          <span className="uppercase tracking-widest font-semibold">
            {showCompleted ? "Hide completed" : "Show completed"}
          </span>
          {showCompleted && tabFilteredCompletedCount > 0 && (
            <span className="font-mono text-notion-muted/30">{tabFilteredCompletedCount}</span>
          )}
        </button>

        {showCompleted && (
          <div className="mt-4">
            {completedLoading && (
              <p className="text-sm text-notion-muted/50 px-1">Loading...</p>
            )}
            {completedError && (
              <div className="flex items-center gap-2 px-3 py-2">
                <span className="text-xs text-red-400">{completedError}</span>
                <button
                  onClick={() => {
                    completedFetched.current = false
                    setCompletedError(null)
                    handleToggleCompleted()
                  }}
                  className="text-xs text-notion-accent hover:underline"
                >
                  Retry
                </button>
              </div>
            )}
            {!completedLoading && !completedError && (() => {
              const visibleCompleted = completedTasks.filter((task) => {
                if (reopenedIds.has(task.id)) return false
                if (!matchesSearch(task)) return false
                if (activeTab === "work") return task.project_id === WORK_PROJECT_ID
                if (activeTab === "personal") return task.project_id === PERSONAL_PROJECT_ID
                if (activeTab === "waiting") return waitingProjectId ? task.project_id === waitingProjectId : false
                if (waitingProjectId && task.project_id === waitingProjectId) return false
                if (priorityFilter === "p1") return task.priority === 4
                if (priorityFilter === "p2") return task.priority === 3
                if (priorityFilter === "p3") return task.priority === 2
                if (priorityFilter === "p4") return task.priority === 1
                return true
              }).sort((a, b) => {
                const aDate = a.completed_at ?? ""
                const bDate = b.completed_at ?? ""
                return bDate.localeCompare(aDate)
              })
              if (visibleCompleted.length === 0) {
                return <p className="text-sm text-notion-muted/50 px-1">No completed tasks found.</p>
              }
              return (
                <div className="divide-y divide-notion-border/30">
                  {visibleCompleted.map((task) => (
                    <CompletedTaskRow
                      key={task.id}
                      task={task}
                      onOpenPanel={handleOpenCompletedPanel}
                      onReopen={handleReopenTask}
                      projects={projects}
                      waitingProjectId={waitingProjectId}
                    />
                  ))}
                </div>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}
