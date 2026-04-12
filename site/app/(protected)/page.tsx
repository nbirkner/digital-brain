import Link from "next/link"
import { Suspense } from "react"
import { getCachedTasks, TODOIST_APP_URL, type TodoistTask } from "@/lib/todoist"
import StatBadge from "@/components/ui/StatBadge"
import TasksPreview from "@/components/features/tasks/TasksPreview"
import { RecentContentServer } from "@/components/ui/RecentContent"

export const dynamic = "force-dynamic"

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

function getWeekBounds(): { weekStart: Date; weekEnd: Date; todayStr: string } {
  const now = new Date()
  const todayStr = now.toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" })
  const day = now.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() + diffToMonday)
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)
  return { weekStart, weekEnd, todayStr }
}

function isOverdue(task: TodoistTask, todayStr: string): boolean {
  if (!task.due?.date) return false
  return task.due.date < todayStr
}

function isDueToday(task: TodoistTask, todayStr: string): boolean {
  return task.due?.date === todayStr
}

function isDueThisWeek(
  task: TodoistTask,
  weekStart: Date,
  weekEnd: Date,
  todayStr: string
): boolean {
  if (!task.due?.date) return false
  const d = new Date(task.due.date + "T00:00:00")
  return d >= weekStart && d <= weekEnd && task.due.date > todayStr
}

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

const QUICK_LINKS = [
  { href: "/work", icon: "🖥️", label: "Work" },
  { href: "/tasks", icon: "✅", label: "Tasks" },
  { href: "/notes", icon: "💭", label: "Notes" },
  { href: "/goals", icon: "🎯", label: "Goals" },
  { href: "/life/finances", icon: "💰", label: "Finances" },
  { href: "/life/travel", icon: "✈️", label: "Travel" },
]

export default async function HomePage() {
  const { weekStart, weekEnd, todayStr } = getWeekBounds()
  const allTasks = await getCachedTasks()

  const overdueTasks = allTasks.filter((t) => isOverdue(t, todayStr))
  const todayTasks = allTasks.filter((t) => isDueToday(t, todayStr))
  const weekAheadTasks = allTasks.filter((t) =>
    isDueThisWeek(t, weekStart, weekEnd, todayStr)
  )

  const byDay: Record<string, TodoistTask[]> = {}
  for (const task of weekAheadTasks) {
    const day = task.due!.date
    if (!byDay[day]) byDay[day] = []
    byDay[day].push(task)
  }
  const weekDays = Object.keys(byDay).sort().slice(0, 4)

  const totalOpen = allTasks.length
  const overdueCount = overdueTasks.length
  const dueTodayCount = todayTasks.length
  const dueThisWeekCount = weekAheadTasks.length

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="max-w-3xl">
      {/* Greeting */}
      <div className="mb-8 stagger-item">
        <h1
          className="text-4xl font-normal text-notion-text tracking-tight leading-tight"
          style={{ fontFamily: "var(--font-display, var(--font-sans))" }}
        >
          {getGreeting()}, Niki 👋
        </h1>
        <p
          className="text-notion-muted text-xs mt-2 uppercase font-medium"
          style={{ letterSpacing: "0.12em" }}
        >
          {today}
        </p>
      </div>

      {/* Overdue callout */}
      {overdueCount > 0 && (
        <div className="mb-6 stagger-item">
          <Link
            href="/tasks"
            className="flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors group"
            style={{
              background: "color-mix(in srgb, var(--notion-accent) 6%, transparent)",
              borderColor: "color-mix(in srgb, var(--notion-accent) 30%, transparent)",
            }}
          >
            <span className="text-base">⚠️</span>
            <span className="text-sm font-medium" style={{ color: "var(--notion-accent)" }}>
              {overdueCount} overdue {overdueCount === 1 ? "task" : "tasks"}
            </span>
            <span className="text-xs text-notion-muted ml-auto group-hover:text-notion-accent transition-colors">
              View →
            </span>
          </Link>
        </div>
      )}

      {/* Quick stats */}
      {totalOpen > 0 && (
        <div className="mb-8 stagger-item">
          <div className="flex items-center gap-4 flex-wrap">
            <StatBadge label="open" value={totalOpen} href="/tasks" />
            {overdueCount > 0 && (
              <StatBadge label="overdue" value={overdueCount} href="/tasks" accent />
            )}
            <StatBadge label="due today" value={dueTodayCount} href="/tasks" />
            {dueThisWeekCount > 0 && (
              <StatBadge label="this week" value={dueThisWeekCount} href="/tasks" />
            )}
          </div>
        </div>
      )}

      {/* Focus */}
      <div className="mb-8 stagger-item">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-notion-muted/60">
            Focus
          </h2>
          <a
            href={TODOIST_APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-notion-muted text-xs hover:text-notion-accent transition-colors"
          >
            Open Todoist ↗
          </a>
        </div>
        <Suspense fallback={null}>
          <TasksPreview filter="all" />
        </Suspense>
      </div>

      {/* Ahead this week */}
      {weekDays.length > 0 && (
        <div className="mb-8 stagger-item">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-notion-muted/60">
              Ahead this week
            </h2>
            <Link
              href="/tasks"
              className="text-notion-muted text-xs hover:text-notion-accent transition-colors"
            >
              All tasks
            </Link>
          </div>
          <div className="space-y-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="bg-notion-surface border border-notion-border rounded-lg p-3"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-notion-muted/50 mb-1.5">
                  {formatDayLabel(day)}
                </p>
                <ul className="space-y-1">
                  {byDay[day].slice(0, 4).map((task) => (
                    <li key={task.id} className="text-sm text-notion-text truncate">
                      <Link
                        href={`/tasks?taskId=${task.id}`}
                        className="hover:text-notion-accent transition-colors"
                      >
                        · {task.content}
                      </Link>
                    </li>
                  ))}
                  {byDay[day].length > 4 && (
                    <li className="text-xs text-notion-muted/50 pl-3">
                      +{byDay[day].length - 4} more
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick access */}
      <div className="mb-8 stagger-item">
        <h2 className="text-[10px] font-semibold text-notion-muted/60 uppercase tracking-[0.12em] mb-3">
          Quick access
        </h2>
        <div className="flex flex-wrap gap-2">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1.5 bg-notion-surface hover:bg-notion-hover border border-notion-border px-3 py-1.5 text-sm text-notion-muted hover:text-notion-text transition-all rounded-full hover:scale-[1.02] hover:shadow-sm"
            >
              <span className="text-sm">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recently captured */}
      <div className="stagger-item">
        <h2 className="text-[10px] font-semibold text-notion-muted/60 uppercase tracking-[0.12em] mb-3">
          Recently captured
        </h2>
        <RecentContentServer domain="all" />
      </div>
    </div>
  )
}
