import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/require-auth"

export async function GET() {
  const unauth = await requireAuth()
  if (unauth) return unauth

  const token = process.env.TODOIST_API_TOKEN
  if (!token) {
    return NextResponse.json({ error: "Todoist API token not configured" }, { status: 500 })
  }

  const res = await fetch("https://api.todoist.com/api/v1/projects", {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 300 }, // cache for 5 minutes
  })

  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json(
      { error: `Todoist error: ${res.status} ${text}` },
      { status: res.status }
    )
  }

  const data: unknown = await res.json()

  // Todoist may return array directly or { results: [...] }
  const projects = Array.isArray(data)
    ? data
    : (data as { results?: unknown[] }).results ?? []

  return NextResponse.json(projects)
}
