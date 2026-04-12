"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { TodoistTask } from "@/lib/todoist"
import TaskDetailPanel from "@/components/features/tasks/TaskDetailPanel"

function getTodayString(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" })
}

function getTomorrowString(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" })
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number)
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const PRIORITY_COLORS: Record<number, string> = {
  4: "bg-red-400",
  3: "bg-orange-400",
  2: "bg-blue-400",
  1: "bg-notion-muted/30",
}

// ─── Section ──────────────────────────────────────────────────────────────────

function TaskSection({
  label,
  tasks,
  isOverdue,
  onSelect,
}: {
  label: string
  tasks: TodoistTask[]
  isOverdue?: boolean
  onSelect: (task: TodoistTask) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const PREVIEW = 3
  const visible = expanded ? tasks : tasks.slice(0, PREVIEW)
  const hidden = tasks.length - PREVIEW

  if (tasks.length === 0) return null

  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-notion-muted/40 mb-1.5">
        {label} <span className="text-notion-muted/30">({tasks.length})</span>
      </p>
      {visible.map((task) => (
        <button
          key={task.id}
          onClick={() => onSelect(task)}
          className="w-full flex items-center gap-2 px-1 py-1 rounded hover:bg-notion-hover transition-colors text-left"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS[1]}`}
          />
          <span className="flex-1 text-sm text-notion-text truncate hover:text-notion-accent transition-colors">
            {task.content}
          </span>
          {task.due?.date && (
            <span
              className={`text-xs font-mono shrink-0 ${
                isOverdue ? "text-red-400" : "text-notion-muted/50"
              }`}
            >
              {formatDate(task.due.date)}
            </span>
          )}
        </button>
      ))}
      {!expanded && hidden > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="text-xs text-notion-muted/50 hover:text-notion-accent transition-colors pl-1 mt-0.5"
        >
          View more (+{hidden})
        </button>
      )}
    </div>
  )
}

// ─── Inline task creation ─────────────────────────────────────────────────────

function AddTaskForm({
  projectId,
  onAdded,
}: {
  projectId: string
  onAdded: (task: TodoistTask) => void
}) {
  const [value, setValue] = useState("")
  const [status, setStatus] = useState<"idle" | "added" | "error">("idle")
  const [, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const content = value.trim()
    if (!content) return

    try {
      const res = await fetch("/api/todoist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, project_id: projectId }),
      })

      if (!res.ok) throw new Error("Failed")

      const data = await res.json()
      const created: TodoistTask = data.task ?? data.tasks?.[0]

      startTransition(() => {
        setValue("")
        setStatus("added")
        if (created) onAdded(created)
        setTimeout(() => setStatus("idle"), 1800)
      })
    } catch {
      setStatus("error")
      setTimeout(() => setStatus("idle"), 2000)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={
          status === "added"
            ? "Added ✓"
            : status === "error"
            ? "Error — try again"
            : "Add a task…"
        }
        className="bg-notion-surface border border-notion-border rounded-lg px-3 py-2 text-sm text-notion-text placeholder:text-notion-muted/40 outline-none focus:border-notion-accent w-full transition-colors"
      />
    </form>
  )
}

// ─── Main client export ───────────────────────────────────────────────────────

export default function HomeTasksWidgetClient({
  initialTasks,
  projectId,
  filter,
}: {
  initialTasks: TodoistTask[]
  projectId: string
  filter: "work" | "personal"
}) {
  const router = useRouter()
  const [tasks, setTasks] = useState<TodoistTask[]>(initialTasks)
  const [selectedTask, setSelectedTask] = useState<TodoistTask | null>(null)

  const today = getTodayString()
  const tomorrow = getTomorrowString()

  const overdue = tasks.filter((t) => t.due?.date && t.due.date < today)
  const todayTasks = tasks.filter((t) => t.due?.date === today)
  const tomorrowTasks = tasks.filter((t) => t.due?.date === tomorrow)

  const isEmpty =
    overdue.length === 0 && todayTasks.length === 0 && tomorrowTasks.length === 0

  function handleAdded(task: TodoistTask) {
    setTasks((prev) => [...prev, task])
  }

  return (
    <div className="space-y-4">
      {isEmpty ? (
        <p className="text-sm text-notion-muted/40 text-center py-4">
          Clear for now ✦
        </p>
      ) : (
        <div className="space-y-4">
          <TaskSection label="Overdue" tasks={overdue} isOverdue onSelect={setSelectedTask} />
          <TaskSection label="Today" tasks={todayTasks} onSelect={setSelectedTask} />
          <TaskSection label="Tomorrow" tasks={tomorrowTasks} onSelect={setSelectedTask} />
        </div>
      )}

      <AddTaskForm projectId={projectId} onAdded={handleAdded} />

      <Link
        href={`/tasks?tab=${filter}`}
        className="block text-xs text-notion-muted/50 hover:text-notion-accent transition-colors text-center pt-1"
      >
        See all tasks →
      </Link>

      <TaskDetailPanel
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onRefresh={() => router.refresh()}
        onComplete={(task) => {
          setTasks((prev) => prev.filter((t) => t.id !== task.id))
          setSelectedTask(null)
        }}
      />
    </div>
  )
}
