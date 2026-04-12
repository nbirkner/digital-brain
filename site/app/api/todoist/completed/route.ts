import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/require-auth"

export async function GET(req: NextRequest) {
  const unauth = await requireAuth()
  if (unauth) return unauth

  const token = process.env.TODOIST_API_TOKEN
  if (!token) {
    return NextResponse.json({ error: "Todoist API token not configured" }, { status: 500 })
  }

  const projectId = req.nextUrl.searchParams.get("project_id")
  const url = new URL("https://api.todoist.com/api/v1/tasks/completed")
  url.searchParams.set("limit", "30")
  if (projectId) url.searchParams.set("project_id", projectId)

  const res = await fetch(
    url.toString(),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  )

  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json(
      { error: `Todoist error: ${res.status} ${text}` },
      { status: res.status }
    )
  }

  const data = await res.json()
  // v1 completed endpoint returns { items: [...] } with completed_at on each
  const items = data.items ?? []
  // Map to match our CompletedTask shape (completed endpoint uses task_id, not id)
  const tasks = items.map((item: Record<string, unknown>) => ({
    id: item.task_id ?? item.id,
    content: (item.content as string)?.replace(/@\S+/g, "").trim() ?? "",
    completed_at: item.completed_at,
    project_id: item.project_id,
    priority: 1,
    labels: [],
    is_completed: true,
  }))
  return NextResponse.json({ tasks })
}
