"use client"

import { useState, useCallback, useTransition, useEffect, useRef, useMemo } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { TodoistTask } from "@/lib/todoist"
import TaskDetailPanel from "@/components/features/tasks/TaskDetailPanel"
import { TaskCreateModal as CreateTaskModal } from "@/components/features/tasks/TaskCreateModal"
import { TaskContextMenu } from "@/components/features/tasks/TaskContextMenu"
import { TaskLabelPickerPopover } from "@/components/features/tasks/TaskLabelPickerPopover"
import { TaskFilters } from "./TaskFilters"
import { GroupSection } from "./TaskGroup"
import { TaskRow, WORK_PROJECT_ID, PERSONAL_PROJECT_ID, todoistLabelToTagId, PriorityBadge, ProjectPill, PriorityPicker, TodoistProject } from "./TaskRow"
import { ViewTab, PriorityFilter, GroupBy, DueBucket, TaskGroup, CompletedTask } from "./types"

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

// ─── sorting ──────────────────────────────────────────────────────────────────

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
  const dayOfWeek = todayDate.getDay()

  const offset = (n: number) => {
    const d = new Date(todayDate); d.setDate(d.getDate() + n)
    return d.toLocaleDateString("en-CA")
  }

  const tomorrow = offset(1)
  if (task.due.date === tomorrow) return "tomorrow"

  const daysToSat = dayOfWeek === 6 ? 7 : (6 - dayOfWeek)
  const daysToSun = dayOfWeek === 0 ? 7 : (7 - dayOfWeek)
  const satStr = offset(daysToSat)
  const sunStr = offset(daysToSun)
  if (task.due.date === satStr || task.due.date === sunStr) return "this-weekend"

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
    const seenIds = new Set<string>()
    tasks.forEach((t) => seenIds.add(t.project_id))
    const projectMap = new Map(projects.map((p) => [p.id, p.name]))

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
    const EXCLUDED_LABEL_GROUPS = new Set(["triage"])
    const allLabels = new Set<string>()
    tasks.forEach((t) => t.labels?.forEach((l) => { if (!EXCLUDED_LABEL_GROUPS.has(l)) allLabels.add(l) }))
    const sortedLabels = Array.from(allLabels).sort()

    const assignedIds = new Set<string>()
    const labeled: TaskGroup[] = sortedLabels.map((label) => {
      const groupTaskList = sortByPriorityThenDate(
        tasks.filter((t) => t.labels?.includes(label) && !assignedIds.has(t.id))
      )
      groupTaskList.forEach((t) => assignedIds.add(t.id))
      return { id: `label:${label}`, label, tasks: groupTaskList }
    })

    const unlabeled = tasks.filter((t) => (!t.labels || t.labels.length === 0) && !assignedIds.has(t.id))
    const unlabeledGroup: TaskGroup[] = unlabeled.length > 0
      ? [{ id: "unlabeled", label: "Unlabeled", tasks: sortByPriorityThenDate(unlabeled) }]
      : []

    return [...labeled, ...unlabeledGroup].filter((g) => g.tasks.length > 0)
  }

  return []
}

// ─── CompletedTaskRow ─────────────────────────────────────────────────────────

type CheckState = "idle" | "loading" | "done" | "error"

import PropertyDropdown from "@/components/data/PropertyDropdown"

interface CompletedTaskRowProps {
  task: CompletedTask
  onOpenPanel: (task: TodoistTask) => void
  onReopen: (id: string) => void
  projects?: TodoistProject[]
  waitingProjectId?: string | null
  sharedProjectId?: string | null
}

function CompletedTaskRow({ task, onOpenPanel, onReopen, projects = [], waitingProjectId, sharedProjectId }: CompletedTaskRowProps) {
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

// ─── TaskList (main component) ────────────────────────────────────────────────

export interface TaskListProps {
  tasks: TodoistTask[]
  initialTaskId?: string
  initialTab?: string
  initialPriority?: string
  initialGroupBy?: string
  initialTag?: string
  waitingProjectId?: string | null
  sharedProjectId?: string | null
  taskNotesIndex?: Record<string, Array<{ title: string; date: string; href: string }>>
}

export function TaskList({ tasks, initialTaskId, initialTab, initialPriority, initialGroupBy, initialTag, waitingProjectId: initialWaitingProjectId, sharedProjectId: initialSharedProjectId, taskNotesIndex }: TaskListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [projects, setProjects] = useState<TodoistProject[]>([])
  const [activeTab, setActiveTab] = useState<ViewTab>(() => {
    const t = initialTab ?? searchParams.get("tab")
    return (["all", "work", "personal", "waiting", "shared"].includes(t ?? "") ? t : "all") as ViewTab
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
    params.delete("taskId")
    if (activeTab && activeTab !== "all") {
      params.set("tab", activeTab)
    } else {
      params.delete("tab")
    }
    if (priorityFilter && priorityFilter !== "all") {
      params.set("priority", priorityFilter)
    } else {
      params.delete("priority")
    }
    if (groupBy && groupBy !== "due") {
      params.set("groupBy", groupBy)
    } else {
      params.delete("groupBy")
    }
    if (tagFilter) {
      params.set("tag", tagFilter)
    } else {
      params.delete("tag")
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [activeTab, priorityFilter, groupBy, tagFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleReopenTask = useCallback((id: string) => {
    setReopenedIds((prev) => new Set(prev).add(id))
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

  const waitingProjectId = initialWaitingProjectId ?? projects.find((p) => p.name.toLowerCase() === "waiting for")?.id ?? null
  const sharedProjectId = initialSharedProjectId ?? projects.find((p) => p.name.toLowerCase() === "shared")?.id ?? null

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

  const topLevelEffectiveTasks = effectiveTasks.filter((t) => !t.parent_id)

  // Separate triage tasks
  const triageTasks = topLevelEffectiveTasks.filter((t) => t.labels?.includes("triage") && !t.due?.date && t.project_id !== waitingProjectId && matchesSearch(t))
  const nonTriageTasks = topLevelEffectiveTasks.filter((t) => (!(t.labels?.includes("triage") && !t.due?.date) || t.project_id === waitingProjectId) && matchesSearch(t))
  const [triageCollapsed, setTriageCollapsed] = useState(false)

  const filteredTriageTasks = triageTasks.filter((t) => {
    if (activeTab === "waiting" || activeTab === "shared") return false
    if (activeTab === "work") return t.project_id === WORK_PROJECT_ID
    if (activeTab === "personal") return t.project_id === PERSONAL_PROJECT_ID
    return true
  })

  const tabFiltered = nonTriageTasks.filter((t) => {
    if (activeTab === "work") return t.project_id === WORK_PROJECT_ID
    if (activeTab === "personal") return t.project_id === PERSONAL_PROJECT_ID
    if (activeTab === "waiting") return waitingProjectId ? t.project_id === waitingProjectId : false
    if (activeTab === "shared") return sharedProjectId ? t.project_id === sharedProjectId : false
    if (waitingProjectId && t.project_id === waitingProjectId) return false
    return true
  })

  const priorityFiltered = tabFiltered.filter((t) => {
    if (priorityFilter === "p1") return t.priority === 4
    if (priorityFilter === "p2") return t.priority === 3
    if (priorityFilter === "p3") return t.priority === 2
    if (priorityFilter === "p4") return t.priority === 1
    return true
  })

  const tagFiltered = priorityFiltered.filter(t => {
    if (!tagFilter) return true
    return (t.labels ?? []).some(l => l === tagFilter || todoistLabelToTagId(l) === tagFilter)
  })

  const statsOverdue = tabFiltered.filter((t) => getDueBucket(t, today) === "overdue").length
  const statsDueToday = tabFiltered.filter((t) => getDueBucket(t, today) === "today").length

  const filtered = tagFiltered.filter((t) => {
    if (dueFilter === "overdue") return getDueBucket(t, today) === "overdue"
    if (dueFilter === "today") return getDueBucket(t, today) === "today"
    return true
  })

  const deduped = Array.from(new Map(filtered.map((t) => [t.id, t])).values())
  const groups = groupTasks(deduped, groupBy, today, projects)
  const totalVisible = deduped.filter((t) => !dismissed.has(t.id)).length
  const isEmpty = totalVisible === 0 && deduped.length === 0

  // Build flat list of visible task IDs for keyboard navigation
  const allVisibleTaskIds = useMemo(() => {
    const ids: string[] = []
    if (filteredTriageTasks.length > 0 && !triageCollapsed) {
      filteredTriageTasks.forEach((t) => { if (!dismissed.has(t.id)) ids.push(t.id) })
    }
    groups.forEach((group) => {
      if (group.label && collapsedGroups.has(group.id)) return
      group.tasks.forEach((t) => { if (!dismissed.has(t.id)) ids.push(t.id) })
    })
    return ids
  }, [filteredTriageTasks, triageCollapsed, groups, collapsedGroups, dismissed])

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (contextMenuTask) return
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

      if (e.key === "c" && !showCreateForm) {
        e.preventDefault()
        setShowCreateForm(true)
        return
      }

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

      if (!focusedTaskId || kbDatePickerTaskId || kbPriorityTaskId || contextMenuTask || labelPickerTask) return

      const focusedTask = tasks.find((t) => t.id === focusedTaskId)
      if (!focusedTask) return

      if (e.key === "p") {
        e.preventDefault()
        setKbPriorityTaskId(focusedTaskId)
        return
      }

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

      if (e.key === "e") {
        e.preventDefault()
        handleContextComplete(focusedTask)
        const currentIdx = allVisibleTaskIds.indexOf(focusedTaskId)
        const nextId = allVisibleTaskIds[currentIdx + 1] ?? allVisibleTaskIds[currentIdx - 1] ?? null
        setFocusedTaskId(nextId)
        return
      }

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

      if (e.key === "Enter") {
        e.preventDefault()
        handleOpenPanel(focusedTask)
        return
      }

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

  const handleSetGroupBy = useCallback((g: GroupBy) => {
    setGroupBy(g)
    setCollapsedGroups(new Set())
  }, [])

  const tabFilteredCompletedCount = completedTasks.filter((task) => {
    if (reopenedIds.has(task.id)) return false
    if (activeTab === "work") return task.project_id === WORK_PROJECT_ID
    if (activeTab === "personal") return task.project_id === PERSONAL_PROJECT_ID
    if (activeTab === "waiting") return waitingProjectId ? task.project_id === waitingProjectId : false
    if (activeTab === "shared") return sharedProjectId ? task.project_id === sharedProjectId : false
    if (waitingProjectId && task.project_id === waitingProjectId) return false
    return true
  }).length

  return (
    <div>
      {/* Filters: stats bar, tabs, priority pills, group-by */}
      <TaskFilters
        totalCount={tabFiltered.filter((t) => !dismissed.has(t.id)).length}
        overdueCount={statsOverdue}
        dueTodayCount={statsDueToday}
        dueFilter={dueFilter}
        onDueFilterChange={setDueFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddTask={() => setShowCreateForm(true)}
        activeTab={activeTab}
        onTabChange={(id) => startTransition(() => {
          setActiveTab(id)
          setTagFilter(null)
          setSearchQuery("")
          if (id === "waiting") setGroupBy("labels")
          else if (activeTab === "waiting") setGroupBy("due")
        })}
        priorityFilter={priorityFilter}
        onPriorityChange={(p) => startTransition(() => setPriorityFilter(p))}
        tagFilter={tagFilter}
        onTagFilterChange={setTagFilter}
        groupBy={groupBy}
        onGroupByChange={handleSetGroupBy}
      />

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
                  sharedProjectId={sharedProjectId}
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
              sharedProjectId={sharedProjectId}
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
        sharedProjectId={sharedProjectId}
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
                  sharedProjectId={sharedProjectId}
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
