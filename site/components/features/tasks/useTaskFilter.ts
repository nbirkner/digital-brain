"use client"

import { useState, useMemo } from "react"
import { TodoistTask } from "@/lib/todoist"
import { DueBucket, GroupBy, GroupBucket, TaskGroup, ViewTab } from "./types"

// ─── constants ────────────────────────────────────────────────────────────────

const WORK_PROJECT_ID = "6gJQX58PhPc45mFV"
const PERSONAL_PROJECT_ID = "6gJQX59VjmrQFHMG"

// ─── date helpers ─────────────────────────────────────────────────────────────

function getTodayString(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" })
}

function getDueBucket(task: TodoistTask, today: string): DueBucket {
  if (!task.due?.date) return "none"
  if (task.due.date < today) return "overdue"
  if (task.due.date === today) return "today"
  return "later"
}

function getGroupBucket(task: TodoistTask, today: string): GroupBucket {
  if (!task.due?.date) return "none"
  if (task.due.date < today) return "overdue"
  if (task.due.date === today) return "today"

  const todayDate = new Date(today + "T12:00:00")
  const dayOfWeek = todayDate.getDay() // 0=Sun … 6=Sat

  const offset = (n: number) => {
    const d = new Date(todayDate)
    d.setDate(d.getDate() + n)
    return d.toLocaleDateString("en-CA")
  }

  const tomorrow = offset(1)
  if (task.due.date === tomorrow) return "tomorrow"

  // This weekend: coming Sat + Sun (only if they are after tomorrow)
  const daysToSat = dayOfWeek === 6 ? 7 : 6 - dayOfWeek
  const daysToSun = dayOfWeek === 0 ? 7 : 7 - dayOfWeek
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

// ─── sorting helpers ──────────────────────────────────────────────────────────

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

function applySortBy(tasks: TodoistTask[], sortBy: string): TodoistTask[] {
  if (sortBy === "date") return sortByDateThenPriority(tasks)
  // Default: priority-first
  return sortByPriorityThenDate(tasks)
}

// ─── grouping helper ──────────────────────────────────────────────────────────

interface TodoistProject {
  id: string
  name: string
}

function groupTasks(
  tasks: TodoistTask[],
  groupBy: GroupBy,
  today: string,
  projects: TodoistProject[] = []
): TaskGroup[] {
  if (groupBy === "none") {
    return [{ id: "all", label: "", tasks: sortByPriorityThenDate(tasks) }]
  }

  if (groupBy === "due") {
    const bucketOf = (t: TodoistTask) => getGroupBucket(t, today)
    return [
      { id: "overdue",      label: "Overdue",     tasks: sortByPriorityThenDate(tasks.filter((t) => bucketOf(t) === "overdue")),      accent: "red"   as const, bucket: "overdue" as DueBucket },
      { id: "today",        label: "Today",        tasks: sortByPriorityThenDate(tasks.filter((t) => bucketOf(t) === "today")),        accent: "amber" as const, bucket: "today"   as DueBucket },
      { id: "tomorrow",     label: "Tomorrow",     tasks: sortByPriorityThenDate(tasks.filter((t) => bucketOf(t) === "tomorrow")),                              bucket: "later"   as DueBucket },
      { id: "this-weekend", label: "This Weekend", tasks: sortByPriorityThenDate(tasks.filter((t) => bucketOf(t) === "this-weekend")),                          bucket: "later"   as DueBucket },
      { id: "next-week",    label: "Next Week",    tasks: sortByPriorityThenDate(tasks.filter((t) => bucketOf(t) === "next-week")),                             bucket: "later"   as DueBucket },
      { id: "later",        label: "Coming Up",    tasks: sortByDateThenPriority(tasks.filter((t) => bucketOf(t) === "later")),                                 bucket: "later"   as DueBucket },
      { id: "none",         label: "No Date",      tasks: sortByPriorityThenDate(tasks.filter((t) => bucketOf(t) === "none")),                                  bucket: "none"    as DueBucket },
    ].filter((g) => g.tasks.length > 0)
  }

  if (groupBy === "priority") {
    return [
      { id: "p1", label: "P1 — Urgent",  tasks: sortByDateThenPriority(tasks.filter((t) => t.priority === 4)) },
      { id: "p2", label: "P2 — High",    tasks: sortByDateThenPriority(tasks.filter((t) => t.priority === 3)) },
      { id: "p3", label: "P3 — Medium",  tasks: sortByDateThenPriority(tasks.filter((t) => t.priority === 2)) },
      { id: "p4", label: "P4 — None",    tasks: sortByDateThenPriority(tasks.filter((t) => t.priority === 1)) },
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

    return orderedIds
      .map((pid) => {
        let label: string
        if (pid === WORK_PROJECT_ID) label = "Work"
        else if (pid === PERSONAL_PROJECT_ID) label = "Personal"
        else label = projectMap.get(pid) ?? "Other"

        return {
          id: pid,
          label,
          tasks: sortByPriorityThenDate(tasks.filter((t) => t.project_id === pid)),
        }
      })
      .filter((g) => g.tasks.length > 0)
  }

  if (groupBy === "labels") {
    const EXCLUDED_LABEL_GROUPS = new Set(["triage"])
    const allLabels = new Set<string>()
    tasks.forEach((t) =>
      t.labels?.forEach((l) => {
        if (!EXCLUDED_LABEL_GROUPS.has(l)) allLabels.add(l)
      })
    )
    const sortedLabels = Array.from(allLabels).sort()

    const assignedIds = new Set<string>()
    const labeled: TaskGroup[] = sortedLabels.map((label) => {
      const groupTasks = sortByPriorityThenDate(
        tasks.filter((t) => t.labels?.includes(label) && !assignedIds.has(t.id))
      )
      groupTasks.forEach((t) => assignedIds.add(t.id))
      return { id: `label:${label}`, label, tasks: groupTasks }
    })

    const unlabeled = tasks.filter(
      (t) => (!t.labels || t.labels.length === 0) && !assignedIds.has(t.id)
    )
    const unlabeledGroup: TaskGroup[] =
      unlabeled.length > 0
        ? [{ id: "unlabeled", label: "Unlabeled", tasks: sortByPriorityThenDate(unlabeled) }]
        : []

    return [...labeled, ...unlabeledGroup].filter((g) => g.tasks.length > 0)
  }

  return []
}

// ─── hook ─────────────────────────────────────────────────────────────────────

export interface TaskFilterOptions {
  defaultFilter?: ViewTab
  defaultGroupBy?: GroupBy
}

export function useTaskFilter(
  tasks: TodoistTask[],
  options?: TaskFilterOptions
) {
  const [activeFilter, setActiveFilter] = useState<ViewTab>(
    options?.defaultFilter ?? "all"
  )
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("priority")
  const [groupBy, setGroupBy] = useState<GroupBy>(
    options?.defaultGroupBy ?? "due"
  )

  const today = useMemo(() => getTodayString(), [])

  // Top-level tasks only (subtasks appear in parent detail panels)
  const topLevel = useMemo(
    () => tasks.filter((t) => !t.parent_id),
    [tasks]
  )

  // Search filter
  const searchFiltered = useMemo(() => {
    if (!search) return topLevel
    const q = search.toLowerCase()
    return topLevel.filter(
      (t) =>
        t.content.toLowerCase().includes(q) ||
        (t.description?.toLowerCase().includes(q) ?? false)
    )
  }, [topLevel, search])

  // Tab / view filter
  const filtered = useMemo(() => {
    return searchFiltered.filter((t) => {
      if (activeFilter === "work") return t.project_id === WORK_PROJECT_ID
      if (activeFilter === "personal") return t.project_id === PERSONAL_PROJECT_ID
      // "all" and "waiting" — include everything that reached this stage
      return true
    })
  }, [searchFiltered, activeFilter])

  // Sort before grouping (groupTasks re-sorts internally per bucket, but this
  // also lets consumers use the flat `filtered` array in a predictable order)
  const sorted = useMemo(() => applySortBy(filtered, sortBy), [filtered, sortBy])

  // Deduplicate by ID then group
  const grouped = useMemo(() => {
    const deduped = Array.from(new Map(sorted.map((t) => [t.id, t])).values())
    return groupTasks(deduped, groupBy, today)
  }, [sorted, groupBy, today])

  return {
    filtered,
    grouped,
    activeFilter,
    setActiveFilter,
    search,
    setSearch,
    sortBy,
    setSortBy,
    groupBy,
    setGroupBy,
  }
}
