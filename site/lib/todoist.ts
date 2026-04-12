import { cache } from "react"

export const TODOIST_APP_URL = "https://app.todoist.com/app/task/"

export interface TodoistTask {
  id: string
  content: string
  description?: string
  priority: number
  project_id: string
  due?: { date: string; datetime?: string }
  url: string
  labels?: string[]
  is_completed?: boolean
  parent_id?: string
}

export async function getAllTasks(): Promise<TodoistTask[]> {
  const token = process.env.TODOIST_API_TOKEN
  if (!token) return []

  try {
    const res = await fetch(
      "https://api.todoist.com/api/v1/tasks",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    )

    if (!res.ok) {
      console.error("Todoist API error:", res.status, res.statusText)
      return []
    }

    const data = await res.json()
    return Array.isArray(data) ? data : (data.results ?? [])
  } catch (err) {
    console.error("Failed to fetch Todoist tasks:", err)
    return []
  }
}

/**
 * React-cached wrapper — deduplicates concurrent calls within a single render tree.
 * Use this instead of getAllTasks() in Server Components.
 */
export const getCachedTasks = cache(getAllTasks)

export async function getTodayTasks(): Promise<TodoistTask[]> {
  const token = process.env.TODOIST_API_TOKEN
  if (!token) return []

  try {
    const res = await fetch(
      "https://api.todoist.com/api/v1/tasks?filter=overdue%20%7C%20today",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 60 },
      }
    )

    if (!res.ok) {
      console.error("Todoist API error:", res.status, res.statusText)
      return []
    }

    const data = await res.json()
    const tasks: TodoistTask[] = Array.isArray(data) ? data : (data.results ?? [])

    // Sort: priority desc (4=urgent first), then by due date asc
    return tasks.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority
      const aDate = a.due?.date ?? ""
      const bDate = b.due?.date ?? ""
      return aDate.localeCompare(bDate)
    })
  } catch (err) {
    console.error("Failed to fetch Todoist tasks:", err)
    return []
  }
}
