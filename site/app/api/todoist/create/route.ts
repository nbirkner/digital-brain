import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/require-auth"

export async function POST(req: NextRequest) {
  const unauth = await requireAuth()
  if (unauth) return unauth

  const token = process.env.TODOIST_API_TOKEN
  if (!token) return NextResponse.json({ error: "No token" }, { status: 500 })

  let body: {
    content?: string
    priority?: number
    project_id?: string
    due_string?: string
    labels?: string[]
    description?: string
    parent_id?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body.content?.trim()) {
    return NextResponse.json({ error: "content is required" }, { status: 400 })
  }

  const isSubtask = !!body.parent_id

  const payload: Record<string, unknown> = {
    content: body.content.trim(),
    priority: body.priority ?? 1,
  }
  if (body.project_id) payload.project_id = body.project_id
  if (body.due_string) payload.due_string = body.due_string
  if (body.description?.trim()) payload.description = body.description.trim()
  if (isSubtask) {
    payload.parent_id = body.parent_id
    // Subtasks skip the auto-triage label — they're managed through their parent
    const inputLabels = body.labels ?? []
    if (inputLabels.length > 0) payload.labels = inputLabels
  } else {
    // Always include triage label for top-level tasks created from the UI
    const inputLabels = body.labels ?? []
    payload.labels = inputLabels.includes("triage") ? inputLabels : [...inputLabels, "triage"]
  }

  const res = await fetch("https://api.todoist.com/api/v1/tasks", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json({ error: `Todoist error: ${res.status} ${text}` }, { status: res.status })
  }
  const data = await res.json()
  return NextResponse.json(data)
}
