/**
 * /api/command — Smart AI command executor
 *
 * Accepts natural language commands and routes them to the appropriate action:
 *   - external_page: publish a page to external-published.ts
 *   - create_tasks:  create Todoist tasks
 *   - trip_update:   update a trip markdown file
 *   - file_update:   edit content in a known personal file
 *   - quick_note:    append a timestamped note to a categorized file
 *   - create_doc:    create a new markdown document
 *   - unknown:       return a friendly error
 */

import { NextRequest, NextResponse } from "next/server"
import { getFile, batchCommit } from "@/lib/github"
import { routeCapture } from "@/lib/capture-router"
import { requireAuth } from "@/lib/require-auth"

export const maxDuration = 30

// ─── Anthropic Claude Haiku helpers ──────────────────────────────────────────
// Default: Anthropic Claude Haiku
// Claude Code users already have ANTHROPIC_API_KEY — no additional setup required.
// Optional alternative: set TOGETHER_API_KEY and swap the implementation below.

async function claudeChat(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set")
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`)
  const data = await res.json()
  return data.content[0].text
}

// Haiku handles both small and large classification tasks well.
// If you have a Together AI account, you can swap this for their API
// using model "meta-llama/Llama-3.3-70B-Instruct-Turbo" and TOGETHER_API_KEY.
const claudeChatLarge = claudeChat

// ─── Command classification ───────────────────────────────────────────────────

type CommandType = "external_page" | "create_tasks" | "trip_update" | "reschedule_task" | "file_update" | "quick_note" | "create_doc" | "unknown"

interface ClassifyResult {
  type: CommandType
  pageSlug?: string
  pageLabel?: string
  /** "dedicated" = no private counterpart | "published" = existing private page made public */
  externalPageType?: "dedicated" | "published"
  /** For published: repo-relative path to the markdown file */
  contentPath?: string
  tasks?: string[]
  taskProject?: "work" | "personal" | "shared" | null
  taskLabel?: string
  taskPriority?: "p1" | "p2" | "p3"
  taskName?: string
  dueDate?: string
  /** file_update: repo-relative path to the file to edit */
  filePath?: string
  /** file_update: natural language instruction describing the change */
  instruction?: string
  noteContent?: string
  noteCategory?: "work" | "health" | "finance" | "goals" | "personal"
  docTitle?: string
  docTopic?: "work" | "personal"
  docContent?: string
}

async function classifyCommand(content: string, routingContext: string): Promise<ClassifyResult> {
  const systemPrompt = `You are a command classifier for a personal digital OS built on digital-brain.

You have access to the command routing rules — the source of truth for command types, trip names, publishing rules, and Todoist routing.

Routing rules:
<routing_rules>
${routingContext}
</routing_rules>

Classify the command into one of these types and return JSON:
- "external_page": make a page publicly accessible (check CLAUDE.md publishing rules for dedicated vs published)
- "create_tasks": create one or more new Todoist tasks (check CLAUDE.md Todoist routing for project)
- "trip_update": update a trip file (check CLAUDE.md / capture-router for trip names)
- "reschedule_task": move/reschedule an existing task to a new date
- "file_update": edit content in a known personal file (match keywords from the file_update table to determine filePath, and extract the instruction describing what to change)
- "quick_note": a short thought, observation, or capture that isn't a task or full doc. Examples: "Note: the API latency is getting worse", "Remember that Charles prefers async", "Quick thought — we should revisit the onboarding flow"
- "create_doc": create a new markdown document. Examples: "Create a doc about X", "Draft a doc for X", "Start a doc on Y". Work topics go to work/docs/other/, personal topics go to personal/docs/other/.
- "unknown": cannot interpret

Respond ONLY with valid JSON, no markdown fences:
{
  "type": "external_page" | "create_tasks" | "trip_update" | "reschedule_task" | "file_update" | "quick_note" | "create_doc" | "unknown",
  "pageSlug": string | null,
  "pageLabel": string | null,
  "externalPageType": "dedicated" | "published" | null,
  "contentPath": string | null,
  "tasks": string[] | null,
  "taskProject": "work" | "personal" | "shared" | null,
  "taskLabel": string | null,
  "taskPriority": "p1" | "p2" | "p3" | null,
  "taskName": string | null,
  "dueDate": string | null,
  "filePath": string | null,
  "instruction": string | null,
  "noteContent": string | null,
  "docTitle": string | null,
  "docTopic": "work" | "personal" | null,
  "docContent": string | null
}`

  const raw = await claudeChat(systemPrompt, content)

  try {
    const cleaned = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim()
    const parsed = JSON.parse(cleaned)
    return {
      type: parsed.type || "unknown",
      pageSlug: parsed.pageSlug || undefined,
      pageLabel: parsed.pageLabel || undefined,
      externalPageType: parsed.externalPageType || undefined,
      contentPath: parsed.contentPath || undefined,
      tasks: parsed.tasks || undefined,
      taskProject: parsed.taskProject || undefined,
      taskLabel: parsed.taskLabel || undefined,
      taskPriority: parsed.taskPriority || undefined,
      taskName: parsed.taskName || undefined,
      dueDate: parsed.dueDate || undefined,
      filePath: parsed.filePath || undefined,
      instruction: parsed.instruction || undefined,
      noteContent: parsed.noteContent || undefined,
      docTitle: parsed.docTitle || undefined,
      docTopic: parsed.docTopic || undefined,
      docContent: parsed.docContent || undefined,
    }
  } catch {
    return { type: "unknown" }
  }
}

// ─── External page handler ────────────────────────────────────────────────────

/** Generate a minimal dedicated external page component */
function generateExternalPageComponent(slug: string, label: string, icon: string): string {
  return `import PageHeader from "@/components/layout/PageHeader"

export default function ${label.replace(/\s+/g, "")}ExternalPage() {
  return (
    <div>
      <PageHeader
        icon="${icon}"
        title="${label}"
        description="Shared publicly."
      />
      <div className="bg-notion-surface border border-notion-border rounded-xl p-6">
        <p className="text-notion-muted text-sm leading-relaxed">
          This page has been shared publicly. Content coming soon.
        </p>
      </div>
    </div>
  )
}
`
}

async function handleExternalPage(
  slug: string,
  label: string,
  pageType: "dedicated" | "published" = "dedicated",
  contentPath?: string
): Promise<{ success: boolean; message: string }> {
  const configPath = "site/data/external-published.ts"
  const routePath = `site/app/external/${slug}/page.tsx`

  const existing = await getFile(configPath)
  if (!existing) {
    return { success: false, message: "Could not read external-published.ts" }
  }

  // Check if already published
  if (existing.content.includes(`slug: "${slug}"`)) {
    return { success: false, message: `"${label}" is already published as an external page.` }
  }

  // Build the config entry based on type
  const insertion = pageType === "published" && contentPath
    ? `  {
    type: "published",
    slug: "${slug}",
    icon: "📄",
    label: "${label}",
    description: "${label}",
    contentPath: "${contentPath}",
  },\n`
    : `  {
    type: "dedicated",
    slug: "${slug}",
    icon: "📄",
    label: "${label}",
    description: "${label} — personal notes and reflections.",
  },\n`

  const updatedConfig = existing.content.replace(
    /(\n\]\s*\nexport function)/,
    `\n  // --- Added via command ---\n${insertion}]\nexport function`
  )

  if (updatedConfig === existing.content) {
    return { success: false, message: "Could not parse external-published.ts to insert entry." }
  }

  // Check if a route file already exists (skip creating stub if so)
  const existingRoute = await getFile(routePath)
  const filesToCommit: Array<{ path: string; content: string; encoding: "utf-8" | "base64" }> = [
    { path: configPath, content: updatedConfig, encoding: "utf-8" },
  ]
  if (!existingRoute) {
    filesToCommit.push({
      path: routePath,
      content: generateExternalPageComponent(slug, label, "📄"),
      encoding: "utf-8",
    })
  }

  const status = await batchCommit(filesToCommit, `feat: publish ${label} as external page`)

  if (status === "ok") {
    return { success: true, message: `Published "${label}" at /external/${slug}` }
  }
  return { success: false, message: "GitHub commit failed" }
}

// ─── Create tasks handler ─────────────────────────────────────────────────────

const TODOIST_PROJECT_IDS = {
  work: process.env.TODOIST_WORK_PROJECT_ID ?? "",
  personal: process.env.TODOIST_PERSONAL_PROJECT_ID ?? "",
  shared: process.env.TODOIST_SHARED_PROJECT_ID ?? "",
}

const PRIORITY_MAP: Record<string, number> = { p1: 4, p2: 3, p3: 2 }

async function handleCreateTasks(
  tasks: string[],
  project?: "work" | "personal" | "shared" | null,
  label?: string,
  priority?: "p1" | "p2" | "p3"
): Promise<{ success: boolean; message: string; count: number }> {
  const token = process.env.TODOIST_API_TOKEN
  if (!token) {
    return { success: false, message: "TODOIST_API_TOKEN not configured", count: 0 }
  }

  const projectId = project ? TODOIST_PROJECT_IDS[project] : undefined
  const todoistPriority = priority ? PRIORITY_MAP[priority] : undefined

  const created: string[] = []
  const failed: string[] = []

  for (const task of tasks) {
    try {
      const res = await fetch("https://api.todoist.com/api/v1/tasks", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: task,
          ...(projectId ? { project_id: projectId } : {}),
          labels: [...(label ? [label] : []), "triage"],
          ...(todoistPriority ? { priority: todoistPriority } : {}),
        }),
      })
      if (res.ok) {
        created.push(task)
      } else {
        failed.push(task)
      }
    } catch {
      failed.push(task)
    }
  }

  if (created.length === 0) {
    return { success: false, message: "Failed to create any tasks", count: 0 }
  }

  const msg =
    created.length === 1
      ? `Created task: "${created[0]}"`
      : `Created ${created.length} tasks: ${created.map((t) => `"${t}"`).join(", ")}`

  return { success: true, message: msg, count: created.length }
}

// ─── Reschedule task handler ──────────────────────────────────────────────────

async function handleRescheduleTask(
  taskName: string,
  dueDate: string
): Promise<{ success: boolean; message: string }> {
  const token = process.env.TODOIST_API_TOKEN
  if (!token) return { success: false, message: "TODOIST_API_TOKEN not configured" }

  // Search for the task by name
  const searchRes = await fetch(
    `https://api.todoist.com/api/v1/tasks?query=${encodeURIComponent(taskName)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!searchRes.ok) return { success: false, message: "Could not search Todoist tasks" }

  const tasks = await searchRes.json()
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return { success: false, message: `No task found matching "${taskName}"` }
  }

  // Pick the closest match (first result)
  const task = tasks[0]

  const updateRes = await fetch(`https://api.todoist.com/api/v1/tasks/${task.id}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ due_string: dueDate }),
  })

  if (!updateRes.ok) return { success: false, message: "Failed to update task due date" }

  return { success: true, message: `Moved "${task.content}" to ${dueDate}` }
}

// ─── File update handler ─────────────────────────────────────────────────────

/**
 * Strict allowlist of paths the LLM is permitted to write to via file_update.
 * This prevents prompt injection from redirecting writes to arbitrary files.
 */
const FILE_UPDATE_ALLOWLIST = new Set([
  "personal/site/housing/housing-and-rent.md",
  "personal/context/life-areas/routine.md",
  "personal/site/health/supplement-stack.md",
  "personal/site/travel/travel.md",
  "personal/site/finances/finances.md",
  "personal/docs/growth/2026-Q2-goals.md",
])

async function handleFileUpdate(
  filePath: string,
  instruction: string
): Promise<{ success: boolean; message: string }> {
  if (!FILE_UPDATE_ALLOWLIST.has(filePath)) {
    return { success: false, message: `File path not permitted: ${filePath}` }
  }

  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO) {
    return { success: false, message: "GitHub not configured" }
  }

  const existing = await getFile(filePath)
  if (!existing) {
    return { success: false, message: `File not found: ${filePath}` }
  }

  const updatedContent = await claudeChatLarge(
    `You maintain a personal markdown document. When given an instruction and the current file content, apply the requested change. Keep all existing content and formatting intact unless the instruction says otherwise. Return ONLY the complete updated markdown document, no commentary, no fences.`,
    `Instruction: "${instruction}"\n\nCurrent document:\n\n${existing.content}`
  )

  if (!updatedContent || updatedContent.length < existing.content.length * 0.3) {
    return { success: false, message: "LLM returned suspiciously short content, aborting to be safe" }
  }

  const fileName = filePath.split("/").pop() || filePath

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, 100 + Math.random() * 200))
    }
    const status = await batchCommit(
      [{ path: filePath, content: updatedContent, encoding: "utf-8" }],
      `command: update ${fileName}`
    )
    if (status === "ok") {
      return { success: true, message: `Updated ${fileName}` }
    }
    if (status === "error") {
      return { success: false, message: "GitHub commit failed" }
    }
  }
  return { success: false, message: "Commit conflict after retries" }
}

// ─── Create doc handler ──────────────────────────────────────────────────────

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

async function handleCreateDoc(
  title: string,
  topic: "work" | "personal" = "work",
  description?: string
): Promise<{ success: boolean; message: string }> {
  const slug = slugify(title)
  const filePath = topic === "personal"
    ? `personal/docs/other/${slug}.md`
    : `work/docs/other/${slug}.md`

  // Check if file already exists
  const existing = await getFile(filePath)
  if (existing) {
    return { success: false, message: `Document already exists at ${filePath}` }
  }

  // Generate starter content via LLM
  const prompt = description
    ? `Create a markdown document titled "${title}". Context: ${description}. Write a brief starter template with relevant sections. Keep it short — just enough structure to get started. Return ONLY the markdown, no fences.`
    : `Create a markdown document titled "${title}". Write a brief starter template with relevant sections. Keep it short — just enough structure to get started. Return ONLY the markdown, no fences.`

  const content = await claudeChat(
    "You create concise markdown document templates. Return only the markdown content, no commentary or code fences.",
    prompt
  )

  const finalContent = content || `# ${title}\n\n## Overview\n\n_TODO: Add content here._\n`

  const status = await batchCommit(
    [{ path: filePath, content: finalContent, encoding: "utf-8" }],
    `docs: create ${slug}.md via command`
  )

  if (status === "ok") {
    return { success: true, message: `Created document at ${filePath}` }
  }
  return { success: false, message: "GitHub commit failed" }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const unauth = await requireAuth()
  if (unauth) return unauth

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 })
  }

  let body: { content?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const content = body.content?.trim()
  if (!content) {
    return NextResponse.json({ error: "content is required" }, { status: 400 })
  }

  try {
    // Read command-routing.md — focused routing rules file (imported into CLAUDE.md via @).
    // Smaller and faster than reading the full 22KB CLAUDE.md.
    const routingFile = await getFile("command-routing.md")
    const routingContext = routingFile?.content ?? ""

    const classified = await classifyCommand(content, routingContext)

    switch (classified.type) {
      case "external_page": {
        if (!classified.pageSlug || !classified.pageLabel) {
          return NextResponse.json(
            {
              error: "Could not determine which page to publish.",
              understood: false,
            },
            { status: 422 }
          )
        }
        const result = await handleExternalPage(
          classified.pageSlug,
          classified.pageLabel,
          classified.externalPageType ?? "dedicated",
          classified.contentPath
        )
        if (!result.success) {
          return NextResponse.json({ error: result.message, understood: true }, { status: 500 })
        }
        return NextResponse.json({ success: true, message: result.message, type: "external_page" })
      }

      case "create_tasks": {
        if (!classified.tasks || classified.tasks.length === 0) {
          return NextResponse.json(
            { error: "Could not parse any tasks from your command.", understood: false },
            { status: 422 }
          )
        }
        const result = await handleCreateTasks(classified.tasks, classified.taskProject, classified.taskLabel, classified.taskPriority)
        if (!result.success) {
          return NextResponse.json({ error: result.message, understood: true }, { status: 500 })
        }
        return NextResponse.json({
          success: true,
          message: result.message,
          type: "create_tasks",
          count: result.count,
        })
      }

      case "trip_update": {
        // Delegate to routeCapture which handles trip detection + LLM update
        if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO) {
          return NextResponse.json({ error: "GitHub not configured" }, { status: 500 })
        }
        for (let attempt = 0; attempt < 3; attempt++) {
          if (attempt > 0) {
            await new Promise((r) => setTimeout(r, 100 + Math.random() * 200))
          }
          const result = await routeCapture(content, [])
          const status = await batchCommit(result.files, `command: ${result.summary}`)
          if (status === "ok") {
            return NextResponse.json({ success: true, message: result.summary, type: "trip_update" })
          }
          if (status === "error") {
            return NextResponse.json({ error: "GitHub commit failed" }, { status: 500 })
          }
        }
        return NextResponse.json({ error: "Commit conflict after retries" }, { status: 500 })
      }

      case "reschedule_task": {
        if (!classified.taskName || !classified.dueDate) {
          return NextResponse.json(
            { error: "Could not determine which task to reschedule or the new date.", understood: false },
            { status: 422 }
          )
        }
        const result = await handleRescheduleTask(classified.taskName, classified.dueDate)
        if (!result.success) {
          return NextResponse.json({ error: result.message, understood: true }, { status: 500 })
        }
        return NextResponse.json({ success: true, message: result.message, type: "reschedule_task" })
      }

      case "file_update": {
        if (!classified.filePath || !classified.instruction) {
          return NextResponse.json(
            { error: "Could not determine which file to update or what to change.", understood: false },
            { status: 422 }
          )
        }
        const result = await handleFileUpdate(classified.filePath, classified.instruction)
        if (!result.success) {
          return NextResponse.json({ error: result.message, understood: true }, { status: 500 })
        }
        return NextResponse.json({ success: true, message: result.message, type: "file_update" })
      }

      case "create_doc": {
        if (!classified.docTitle) {
          return NextResponse.json(
            { error: "Could not determine a document title from your command.", understood: false },
            { status: 422 }
          )
        }
        if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO) {
          return NextResponse.json({ error: "GitHub not configured" }, { status: 500 })
        }
        const docResult = await handleCreateDoc(
          classified.docTitle,
          classified.docTopic ?? "work",
          classified.docContent
        )
        if (!docResult.success) {
          return NextResponse.json({ error: docResult.message, understood: true }, { status: 500 })
        }
        return NextResponse.json({ success: true, message: docResult.message, type: "create_doc" })
      }

      case "quick_note": {
        if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO) {
          return NextResponse.json({ error: "GitHub not configured" }, { status: 500 })
        }
        const noteText = classified.noteContent || content
        for (let attempt = 0; attempt < 3; attempt++) {
          if (attempt > 0) {
            await new Promise((r) => setTimeout(r, 100 + Math.random() * 200))
          }
          const result = await routeCapture(noteText, [])
          const status = await batchCommit(result.files, `command: ${result.summary}`)
          if (status === "ok") {
            return NextResponse.json({ success: true, message: result.summary, type: "quick_note" })
          }
          if (status === "error") {
            return NextResponse.json({ error: "GitHub commit failed" }, { status: 500 })
          }
        }
        return NextResponse.json({ error: "Commit conflict after retries" }, { status: 500 })
      }

      default:
        return NextResponse.json(
          {
            error:
              "I didn't understand that command. Try: \"Make X an external page\", \"Create tasks for...\", \"Move [task] to [date]\", \"Update my supplements with...\", or \"Update [trip] with...\"",
            understood: false,
          },
          { status: 422 }
        )
    }
  } catch (err) {
    console.error("[command]", err)
    const message = err instanceof Error ? err.message : "Internal error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
