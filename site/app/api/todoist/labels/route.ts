import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/require-auth"

export async function GET() {
  const unauth = await requireAuth()
  if (unauth) return unauth

  const token = process.env.TODOIST_API_TOKEN
  if (!token) {
    return NextResponse.json({ error: "Todoist API token not configured" }, { status: 500 })
  }

  const res = await fetch("https://api.todoist.com/api/v1/labels", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json({ error: `Todoist error: ${res.status} ${text}` }, { status: res.status })
  }

  const data = await res.json()
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const unauth = await requireAuth()
  if (unauth) return unauth

  const token = process.env.TODOIST_API_TOKEN
  if (!token) {
    return NextResponse.json({ error: "Todoist API token not configured" }, { status: 500 })
  }

  let body: { name: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Label name is required" }, { status: 400 })
  }

  const res = await fetch("https://api.todoist.com/api/v1/labels", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: body.name.trim() }),
  })

  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json({ error: `Todoist error: ${res.status} ${text}` }, { status: res.status })
  }

  const data = await res.json()
  return NextResponse.json(data)
}
