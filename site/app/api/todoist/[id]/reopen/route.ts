import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/require-auth"

export async function POST(
  _req: NextRequest,
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

  const res = await fetch(`https://api.todoist.com/api/v1/tasks/${id}/reopen`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (res.status === 204) {
    return NextResponse.json({ success: true })
  }

  const text = await res.text()
  return NextResponse.json(
    { error: `Todoist error: ${res.status} ${text}` },
    { status: res.status }
  )
}
