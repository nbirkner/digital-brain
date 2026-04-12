import { NextRequest, NextResponse } from "next/server"
import { routeCapture, type Attachment } from "@/lib/capture-router"
import { getFile, batchCommit, type FileChange } from "@/lib/github"
import { requireAuth } from "@/lib/require-auth"

export const maxDuration = 30

// ─── Quick note helper ────────────────────────────────────────────────────────

function todayDate(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function formatTime(): string {
  return new Date().toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
}

async function saveQuickNote(content: string): Promise<{ files: FileChange[]; summary: string }> {
  const filePath = `personal/notes/${todayDate()}.md`
  const block = `\n## ${formatTime()}\n\n${content.trim()}\n`
  const existing = await getFile(filePath)
  const newContent = (existing?.content || "") + block
  return {
    files: [{ path: filePath, content: newContent, encoding: "utf-8" }],
    summary: `Note saved to ${todayDate()}.md`,
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const unauth = await requireAuth()
  if (unauth) return unauth

  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO) {
    return NextResponse.json({ error: "GitHub not configured" }, { status: 500 })
  }

  let content = ""
  let mode: string | null = null
  const attachments: Attachment[] = []

  const contentType = req.headers.get("content-type") || ""

  if (contentType.includes("multipart/form-data")) {
    let formData: FormData
    try {
      formData = await req.formData()
    } catch {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
    }

    content = ((formData.get("content") as string) || "").trim()
    mode = (formData.get("mode") as string) || null

    const rawFiles = formData.getAll("file") as File[]
    const today = new Date().toISOString().slice(0, 10)

    for (const file of rawFiles) {
      if (!file || file.size === 0) continue
      const arrayBuffer = await file.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString("base64")
      const safeName = file.name.replace(/[^a-z0-9._-]/gi, "-").toLowerCase()
      const storagePath = `personal/docs/captures/attachments/${today}-${safeName}`
      attachments.push({ name: file.name, base64, mimeType: file.type || "application/octet-stream", storagePath })
    }
  } else {
    try {
      const body = await req.json()
      content = (body.content || "").trim()
      mode = body.mode || null
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }
  }

  if (!content) {
    return NextResponse.json({ error: "content is required" }, { status: 400 })
  }

  // ── Quick note mode: no AI, just append to today's daily note ──────────────

  if (mode === "note") {
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, 100 + Math.random() * 200))
        }
        const result = await saveQuickNote(content)
        const status = await batchCommit(result.files, `note: ${result.summary}`)
        if (status === "ok") return NextResponse.json({ success: true, summary: result.summary })
        if (status === "error") return NextResponse.json({ error: "GitHub commit failed" }, { status: 500 })
      }
      return NextResponse.json({ error: "Commit conflict after retries" }, { status: 500 })
    } catch (err) {
      console.error("[capture/note]", err)
      return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
  }

  // ── Default: AI-routed capture (command detection, trip updates, etc.) ──────

  try {
    // Retry up to 3 times on conflict (two captures landing at the same moment).
    // Each retry re-reads file state fresh so both captures' content is preserved.
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) {
        // Small jitter so concurrent retries don't collide again
        await new Promise((r) => setTimeout(r, 100 + Math.random() * 200))
      }

      const result = await routeCapture(content, attachments)
      const status = await batchCommit(result.files, `capture: ${result.summary}`)

      if (status === "ok") return NextResponse.json({ success: true, summary: result.summary })
      if (status === "error") return NextResponse.json({ error: "GitHub commit failed" }, { status: 500 })
      // "conflict" → loop and retry with fresh file reads
    }

    return NextResponse.json({ error: "Commit conflict after retries" }, { status: 500 })
  } catch (err) {
    console.error("[capture]", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
