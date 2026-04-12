import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/require-auth"

/**
 * POST /api/todoist/triage-cleanup
 *
 * Auto-removes the "triage" label from any task that has both "triage" and a due date.
 * Called server-side when the tasks page loads.
 */
export async function POST() {
  const unauth = await requireAuth()
  if (unauth) return unauth

  const token = process.env.TODOIST_API_TOKEN
  if (!token) {
    return NextResponse.json({ error: "Todoist API token not configured" }, { status: 500 })
  }

  try {
    // Fetch all tasks
    const res = await fetch("https://api.todoist.com/api/v1/tasks", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
    }

    const data = await res.json()
    const tasks = Array.isArray(data) ? data : (data.results ?? [])

    // Find tasks with both "triage" label and a due date
    const toClean = tasks.filter(
      (t: { labels?: string[]; due?: { date: string } }) =>
        t.labels?.includes("triage") && t.due?.date
    )

    // Remove "triage" from each
    const results = await Promise.allSettled(
      toClean.map((t: { id: string; labels?: string[] }) =>
        fetch(`https://api.todoist.com/api/v1/tasks/${t.id}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            labels: (t.labels || []).filter((l: string) => l !== "triage"),
          }),
        })
      )
    )

    const cleaned = results.filter((r) => r.status === "fulfilled").length

    return NextResponse.json({ success: true, cleaned })
  } catch (err) {
    console.error("[triage-cleanup]", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
