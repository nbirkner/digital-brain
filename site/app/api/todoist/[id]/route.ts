import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/require-auth"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const unauth = await requireAuth()
  if (unauth) return unauth

  const { id } = params

  if (!id) {
    return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
  }

  const token = process.env.TODOIST_API_TOKEN
  if (!token) {
    return NextResponse.json({ error: "Todoist API token not configured" }, { status: 500 })
  }

  let body: { content?: string; description?: string; priority?: number; project_id?: string; due_string?: string; labels?: string[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const update: Record<string, string | number | string[]> = {}
  if (body.content !== undefined) update.content = body.content
  if (body.description !== undefined) update.description = body.description
  if (body.priority !== undefined) update.priority = body.priority
  if (body.due_string !== undefined) update.due_string = body.due_string
  if (body.labels !== undefined) update.labels = body.labels

  // Only call the main update endpoint if there are fields to update
  if (Object.keys(update).length > 0) {
    const res = await fetch(`https://api.todoist.com/api/v1/tasks/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(update),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: `Todoist error: ${res.status} ${text}` },
        { status: res.status }
      )
    }
  }

  // Project changes use a separate /move endpoint
  if (body.project_id !== undefined) {
    const moveRes = await fetch(`https://api.todoist.com/api/v1/tasks/${id}/move`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ project_id: body.project_id }),
    })

    if (!moveRes.ok) {
      const text = await moveRes.text()
      return NextResponse.json(
        { error: `Todoist move error: ${moveRes.status} ${text}` },
        { status: moveRes.status }
      )
    }
  }

  return NextResponse.json({ success: true })
}
