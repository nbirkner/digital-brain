// Shared types for the tasks feature. All files in features/tasks/ import from here.

import { TodoistTask } from "@/lib/todoist"

// ─── view / filter ────────────────────────────────────────────────────────────

/** Top-level tab filter: which project bucket to show. */
export type ViewTab = "all" | "work" | "personal" | "waiting" | "shared"

/** Priority filter pill. "all" means no filter applied. */
export type PriorityFilter = "all" | "p1" | "p2" | "p3" | "p4"

// ─── grouping ─────────────────────────────────────────────────────────────────

/** How to group the task list. */
export type GroupBy = "due" | "priority" | "project" | "labels" | "none"

/**
 * Coarse due-date bucket used for filtering/sorting.
 * "none" = task has no due date.
 */
export type DueBucket = "overdue" | "today" | "later" | "none"

/**
 * Fine-grained due-date bucket used for grouping rows in the task list.
 * More granular than DueBucket — splits "later" into tomorrow / this-weekend / next-week.
 */
export type GroupBucket =
  | "overdue"
  | "today"
  | "tomorrow"
  | "this-weekend"
  | "next-week"
  | "later"
  | "none"

// ─── data shapes ──────────────────────────────────────────────────────────────

/** A Todoist project as returned by the /projects endpoint. */
export interface TodoistProject {
  id: string
  name: string
}

/** A rendered group of tasks shown in the list UI. */
export interface TaskGroup {
  id: string
  label: string
  tasks: TodoistTask[]
  accent?: "red" | "amber" | "default"
  bucket?: DueBucket
}

/** Completed tasks share the TodoistTask shape but include a completion timestamp. */
export type CompletedTask = TodoistTask & { completed_at?: string }
