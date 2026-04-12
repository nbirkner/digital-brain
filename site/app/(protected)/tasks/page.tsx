import { getAllTasks, TODOIST_APP_URL } from "@/lib/todoist"
import PageHeader from "@/components/layout/PageHeader"
import EmptyState from "@/components/ui/EmptyState"
import TasksClient from "@/components/features/tasks/TaskList"
import { getTaskNotesIndex, buildTitleIndex } from "@/lib/task-notes-server"

export const dynamic = "force-dynamic"

async function getWaitingProjectId(): Promise<string | null> {
  const token = process.env.TODOIST_API_TOKEN
  if (!token) return null
  try {
    const res = await fetch("https://api.todoist.com/api/v1/projects", {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    const data = await res.json()
    const list: { id: string; name: string }[] = Array.isArray(data) ? data : (data?.results ?? [])
    return list.find((p) => p.name.toLowerCase() === "waiting for")?.id ?? null
  } catch {
    return null
  }
}

async function cleanupTriageTasks(allTasks: Awaited<ReturnType<typeof getAllTasks>>) {
  const token = process.env.TODOIST_API_TOKEN
  if (!token) return

  // Find tasks with both "triage" label and a due date
  const toClean = allTasks.filter(
    (t) => t.labels?.includes("triage") && t.due?.date
  )

  if (toClean.length === 0) return

  // Remove "triage" from each
  await Promise.allSettled(
    toClean.map((t) =>
      fetch(`https://api.todoist.com/api/v1/tasks/${t.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          labels: (t.labels || []).filter((l) => l !== "triage"),
        }),
      })
    )
  )
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ taskId?: string; tab?: string; priority?: string; groupBy?: string; tag?: string }>
}) {
  const { taskId, tab, priority, groupBy, tag } = await searchParams
  const [allTasks, waitingProjectId] = await Promise.all([getAllTasks(), getWaitingProjectId()])

  // Auto-remove triage label from tasks that already have a due date.
  // Fire-and-forget — don't block the render on write calls to Todoist.
  void cleanupTriageTasks(allTasks)
  // After cleanup, mark cleaned tasks as no longer triage locally
  const tasksWithCleanedTriage = allTasks.map((t) => {
    if (t.labels?.includes("triage") && t.due?.date) {
      return { ...t, labels: (t.labels || []).filter((l) => l !== "triage") }
    }
    return t
  })

  const taskNotesIndex = getTaskNotesIndex()
  const alreadyLinked = new Set(Object.keys(taskNotesIndex))
  const titleIndex = buildTitleIndex(tasksWithCleanedTriage, alreadyLinked)
  const mergedTaskNotesIndex = { ...titleIndex, ...taskNotesIndex }
  const total = tasksWithCleanedTriage.length

  return (
    <div>
      <PageHeader icon="✅" title="Tasks" description="To triage, add a date.">
        <a
          href={TODOIST_APP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-notion-muted hover:text-notion-accent transition-colors mt-1 inline-block"
        >
          Open Todoist ↗
        </a>
      </PageHeader>

      {total === 0 ? (
        <EmptyState
          icon="✅"
          message="no open tasks"
          hint="Create tasks via Claude Code or Todoist."
        />
      ) : (
        <TasksClient tasks={tasksWithCleanedTriage} initialTaskId={taskId} initialTab={tab} initialPriority={priority} initialGroupBy={groupBy} initialTag={tag} waitingProjectId={waitingProjectId} taskNotesIndex={mergedTaskNotesIndex} />
      )}
    </div>
  )
}
