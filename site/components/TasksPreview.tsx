import Link from "next/link"
import { getCachedTasks } from "@/lib/todoist"

const WORK_PROJECT_ID = process.env.TODOIST_WORK_PROJECT_ID ?? ""
const PERSONAL_PROJECT_ID = process.env.TODOIST_PERSONAL_PROJECT_ID ?? ""

function getTodayString(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" })
}

/**
 * Async server component — wrap in <Suspense> in parent pages.
 * Uses getCachedTasks() so concurrent calls in the same render tree share one API request.
 */
export default async function TasksPreview({
  filter,
}: {
  filter: "all" | "work" | "personal"
}) {
  const allTasks = await getCachedTasks()
  const todayStr = getTodayString()

  const filtered =
    filter === "all"
      ? allTasks
      : allTasks.filter(
          (t) =>
            t.project_id ===
            (filter === "work" ? WORK_PROJECT_ID : PERSONAL_PROJECT_ID)
        )

  const urgentTasks = filtered.filter(
    (t) =>
      t.priority === 4 &&
      t.due?.date &&
      t.due.date <= todayStr
  )
  const otherTasks = filtered.filter(
    (t) =>
      t.priority < 4 &&
      t.due?.date === todayStr
  )

  const tabParam = filter === "all" ? "" : `?tab=${filter}`
  const seeAllHref = `/tasks${tabParam}`

  if (urgentTasks.length === 0 && otherTasks.length === 0) {
    return (
      <div className="text-center py-6 text-notion-muted/40">
        <p className="text-sm">Clear slate today ✦</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <Link
          href={seeAllHref}
          className="text-notion-muted text-xs hover:text-notion-accent transition-colors"
        >
          All tasks →
        </Link>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {urgentTasks.length > 0 && (
          <div
            className="bg-notion-surface border border-notion-border rounded-lg p-4 shadow-sm min-w-0 overflow-hidden"
            style={{ borderLeft: "3px solid var(--notion-accent)" }}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-2.5"
              style={{ color: "var(--notion-accent)" }}
            >
              Urgent
            </p>
            <ul className="space-y-1.5">
              {urgentTasks.slice(0, 5).map((task) => (
                <li key={task.id} className="text-sm text-notion-text truncate">
                  <Link
                    href={`/tasks?taskId=${task.id}`}
                    className="hover:text-notion-accent transition-colors"
                  >
                    · {task.content}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        {otherTasks.length > 0 && (
          <div className="bg-notion-surface border border-notion-border rounded-lg p-4 shadow-sm min-w-0 overflow-hidden">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-notion-muted/60 mb-2.5">
              Today
            </p>
            <ul className="space-y-1.5">
              {otherTasks.slice(0, 5).map((task) => (
                <li key={task.id} className="text-sm text-notion-text truncate">
                  <Link
                    href={`/tasks?taskId=${task.id}`}
                    className="hover:text-notion-accent transition-colors"
                  >
                    · {task.content}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
