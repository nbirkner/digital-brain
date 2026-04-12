import { NextRequest, NextResponse } from "next/server"
import { parseTaskInput, createLabel, type ParsedTask } from "@/lib/smart-task-parser"
import { requireAuth } from "@/lib/require-auth"

export const maxDuration = 15

// ─── GET: fetch all active tasks ─────────────────────────────────────────────

export async function GET() {
  const unauth = await requireAuth()
  if (unauth) return unauth

  const token = process.env.TODOIST_API_TOKEN
  if (!token) {
    return NextResponse.json({ error: "Todoist API token not configured" }, { status: 500 })
  }

  try {
    const res = await fetch("https://api.todoist.com/api/v1/tasks", {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: `Todoist error: ${res.status} ${text}` },
        { status: res.status }
      )
    }

    const data: unknown = await res.json()
    const tasks = Array.isArray(data) ? data : (data as { results?: unknown[] }).results ?? []
    return NextResponse.json(tasks)
  } catch (err) {
    console.error("[todoist GET]", err)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

// ─── Todoist API helpers ──────────────────────────────────────────────────────

async function resolveProjectId(
  token: string,
  projectName: string
): Promise<string | undefined> {
  try {
    const res = await fetch("https://api.todoist.com/api/v1/projects", {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return undefined
    const data = await res.json()
    const projects = Array.isArray(data) ? data : (data.results ?? [])
    const match = projects.find(
      (p: { name: string }) => p.name.toLowerCase() === projectName.toLowerCase()
    )
    return match?.id
  } catch {
    return undefined
  }
}

async function createTodoistTask(
  token: string,
  task: ParsedTask,
  projectId?: string
): Promise<unknown> {
  const payload: Record<string, unknown> = { content: task.content }

  if (projectId) payload.project_id = projectId
  if (task.priority) payload.priority = task.priority
  if (task.due_string) payload.due_string = task.due_string
  if (task.description) payload.description = task.description
  // Always include "triage" label for new tasks
  const labelsWithTriage = task.labels.includes("triage") ? task.labels : [...task.labels, "triage"]
  payload.labels = labelsWithTriage

  const res = await fetch("https://api.todoist.com/api/v1/tasks", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Todoist error: ${res.status} ${text}`)
  }

  return res.json()
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const unauth = await requireAuth()
  if (unauth) return unauth

  let body: { content?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const raw = body.content?.trim()
  if (!raw) {
    return NextResponse.json({ error: "content is required" }, { status: 400 })
  }

  const token = process.env.TODOIST_API_TOKEN
  if (!token) {
    return NextResponse.json({ error: "Todoist API token not configured" }, { status: 500 })
  }

  try {
    // Smart parse the input
    const { tasks } = await parseTaskInput(raw, token)

    // Create any new labels that were detected
    for (const task of tasks) {
      for (const newLabel of task.newLabels) {
        await createLabel(token, newLabel)
        // Move to labels list so it gets applied to the task
        if (!task.labels.includes(newLabel)) {
          task.labels.push(newLabel)
        }
      }
    }

    // Resolve project IDs and create tasks
    const results: unknown[] = []
    const projectCache = new Map<string, string | undefined>()

    for (const task of tasks) {
      let projectId = projectCache.get(task.project)
      if (projectId === undefined && !projectCache.has(task.project)) {
        projectId = await resolveProjectId(token, task.project)
        projectCache.set(task.project, projectId)
      }

      const created = await createTodoistTask(token, task, projectId)
      results.push(created)
    }

    return NextResponse.json({
      success: true,
      task: results.length === 1 ? results[0] : undefined,
      tasks: results.length > 1 ? results : undefined,
      count: results.length,
    })
  } catch (err) {
    console.error("[todoist]", err)
    const message = err instanceof Error ? err.message : "Internal error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
