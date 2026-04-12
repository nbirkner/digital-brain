import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/require-auth"
import { ALL_TAGS } from "@/lib/tag-taxonomy"

const SKIP_IDS = new Set(["triage", "note", "work", "personal"])

interface TodoistLabel {
  id: string
  name: string
}

export async function POST() {
  const unauth = await requireAuth()
  if (unauth) return unauth

  const token = process.env.TODOIST_API_TOKEN
  if (!token) {
    return NextResponse.json({ error: "TODOIST_API_TOKEN not set" }, { status: 500 })
  }

  // Fetch existing labels from Todoist
  const listRes = await fetch("https://api.todoist.com/api/v1/labels", {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!listRes.ok) {
    return NextResponse.json({ error: "Failed to fetch Todoist labels" }, { status: 502 })
  }
  const existingLabels: TodoistLabel[] = await listRes.json()
  const existingNames = new Set(existingLabels.map((l) => l.name.toLowerCase()))

  // Determine which taxonomy IDs to sync
  const taxonomyIds = ALL_TAGS.map((t) => t.id).filter((id) => !SKIP_IDS.has(id))

  const created: string[] = []
  const skipped: string[] = []

  for (const id of taxonomyIds) {
    if (existingNames.has(id)) {
      skipped.push(id)
      continue
    }
    const createRes = await fetch("https://api.todoist.com/api/v1/labels", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: id }),
    })
    if (createRes.ok) {
      created.push(id)
    }
  }

  return NextResponse.json({ created, skipped, total: taxonomyIds.length })
}
