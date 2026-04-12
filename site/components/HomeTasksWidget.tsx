import { getCachedTasks } from "@/lib/todoist"
import HomeTasksWidgetClient from "./HomeTasksWidgetClient"

const WORK_PROJECT_ID = process.env.TODOIST_WORK_PROJECT_ID ?? ""
const PERSONAL_PROJECT_ID = process.env.TODOIST_PERSONAL_PROJECT_ID ?? ""

/**
 * Server wrapper — wrap in <Suspense> in parent pages.
 * Fetches tasks for the given filter, then hands off to the client component.
 */
export default async function HomeTasksWidget({
  filter,
}: {
  filter: "work" | "personal"
}) {
  const projectId = filter === "work" ? WORK_PROJECT_ID : PERSONAL_PROJECT_ID
  const allTasks = await getCachedTasks()
  const tasks = allTasks.filter((t) => t.project_id === projectId)

  return (
    <HomeTasksWidgetClient
      initialTasks={tasks}
      projectId={projectId}
      filter={filter}
    />
  )
}
