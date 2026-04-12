/**
 * smart-task-parser.ts
 *
 * LLM-powered parser for quick-add task input. Handles:
 *   - Project routing (Work / Personal / Waiting For)
 *   - Label matching against existing labels (fuzzy)
 *   - New label creation for person names
 *   - Multi-task splitting
 *   - Description extraction
 *   - Priority and due date inference
 *
 * Falls back to simple regex parsing if LLM is unavailable.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ParsedTask {
  content: string
  description?: string
  project: string          // "Work" | "Personal" | "Waiting For"
  priority?: number        // Todoist API: 4=urgent, 3=high, 2=medium, 1=normal
  due_string?: string
  labels: string[]         // label names (lowercase, as stored in Todoist)
  newLabels: string[]      // labels that need to be created first
}

export interface ParseResult {
  tasks: ParsedTask[]
  rawFallback: boolean     // true if LLM failed and we used regex fallback
}

// ─── Todoist API helpers ──────────────────────────────────────────────────────

interface TodoistLabel {
  id: string
  name: string
}

interface TodoistProject {
  id: string
  name: string
}

async function fetchLabels(token: string): Promise<TodoistLabel[]> {
  try {
    const res = await fetch("https://api.todoist.com/api/v1/labels", {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : (data.results ?? [])
  } catch {
    return []
  }
}

async function fetchProjects(token: string): Promise<TodoistProject[]> {
  try {
    const res = await fetch("https://api.todoist.com/api/v1/projects", {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : (data.results ?? [])
  } catch {
    return []
  }
}

export async function createLabel(token: string, name: string): Promise<string | null> {
  try {
    const res = await fetch("https://api.todoist.com/api/v1/labels", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.id || data.name || null
  } catch {
    return null
  }
}

// ─── LLM parsing ─────────────────────────────────────────────────────────────

function buildSystemPrompt(labelNames: string[], projectNames: string[]): string {
  return `You are a task parser for Todoist. Parse the user's natural language input into structured task(s).

AVAILABLE PROJECTS: ${projectNames.join(", ")}
AVAILABLE LABELS: ${labelNames.join(", ")}

LABEL TAXONOMY (for matching intent to existing labels):
- commerce: billing, payments, credits, pricing, ECP, ACH, Pay Later, token pricing
- identity-collaboration: auth, SSO, OIDC, IAM, UMS, orgs & projects, RBAC
- security / it: security reviews, IT, compliance
- work: general work tasks
- infrastructure: GPU pricing, substrate, platform
- gtm: enterprise deals, sales, BizOps
- pm-ops: roadmap, planning, perf reviews, strategy docs
- research: customer discovery, competitive analysis
- health: medical, fitness, supplements, therapy
- finance: taxes, budget, investing
- admin: apartment, errands, life admin
- travel: trips, flights, hotels
- learning: courses, books, certifications
- relationship: Juan, family, friends

PROJECT ROUTING RULES:
- "Waiting For" or "waiting on" or someone else is the actor → project "Waiting For"
- "personal" or health/finance/life/travel topics → project "Personal"
- Work topics (engineering, PM, company stuff) → project "Work"
- Default: "Personal" for ambiguous personal, "Work" for ambiguous work

LABEL RULES:
- Match user's words to the closest existing label using the taxonomy above
- "identity and collaboration" → "identity-collaboration"
- If user specifies a person name as a label (for Waiting For tasks), use that person's name lowercase
- If the label doesn't exist in the available labels list, include it in newLabels

KNOWN PEOPLE AND THEIR WORK DOMAINS:
- Karina → commerce (billing, ECP, Pay Later)
- Charles → commerce (pricing, contracts, enterprise deals)
- Mei → commerce (ACH, payments)
- AJ → identity-collaboration (OIDC, IAM, UMS)
- Derek → identity-collaboration (orgs, projects, RBAC)
- Juan → personal (Niki's partner)
- Nani → personal (Niki's family)

When a known person is the actor (not Niki), route to "Waiting For" project with their name as a label.

PRIORITY MAPPING (Todoist API values):
- p1 / urgent / asap / today deadline → priority: 4
- p2 / this week / important → priority: 3
- p3 / soon / no rush → priority: 2
- Work tasks with no signal → priority: 2
- Waiting For tasks with no signal → priority: 2
- Personal tasks with no signal → omit (defaults to p4/normal)

MULTI-TASK RULES:
- If input contains multiple distinct action items (comma-separated list, bullet points, numbered items), split into separate tasks
- If items are sub-tasks of one main task, keep as ONE task with items in the description
- Example: "Sedona remaining items: make dinner reservation, book hotel, confirm pool" → ONE task with description listing the items

DESCRIPTION RULES:
- Supplementary info that isn't the core action goes in description
- Context, notes, deadlines for sub-items, warnings ("fills up fast") → description
- Keep descriptions concise
- IMPORTANT: Separate each item with a literal newline character (\\n). Each line should start with "- " (dash space).
- Example: "- Mariposa dinner reservation (Friday)\\n- Elote Cafe reservation\\n- Confirm Grasshopper Point open for swimming"

TITLE RULES:
- Clean, action-oriented, 5-12 words
- "Verb + object" format when possible
- Don't include project/label/priority markers in the title

IMPORTANT: Always fill EVERY field. Never leave project, labels, or priority empty.
- Every task MUST have a project (Work, Personal, or Waiting For)
- Every task MUST have at least one label from the taxonomy
- Every task SHOULD have a priority (use the defaults above if no explicit signal)
- If you're unsure about a field, make your best guess based on context

Respond with JSON only. Always return an array of tasks:
{
  "tasks": [
    {
      "content": "task title",
      "description": "optional description or omit",
      "project": "Work" | "Personal" | "Waiting For",
      "priority": 4|3|2|1 or omit,
      "due_string": "natural language date" or omit,
      "labels": ["existing-label"],
      "newLabels": ["label-to-create"]
    }
  ]
}`
}

interface LLMTask {
  content: string
  description?: string
  project?: string
  priority?: number
  due_string?: string
  labels?: string[]
  newLabels?: string[]
}

async function llmParse(
  input: string,
  labelNames: string[],
  projectNames: string[]
): Promise<ParsedTask[] | null> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        system: buildSystemPrompt(labelNames, projectNames),
        messages: [{ role: "user", content: input }],
        max_tokens: 800,
      }),
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) return null

    const data = await res.json()
    const raw = data.content?.[0]?.text?.trim() ?? data.choices?.[0]?.message?.content?.trim()
    if (!raw) return null

    const parsed = JSON.parse(raw)
    const tasks: LLMTask[] = Array.isArray(parsed.tasks) ? parsed.tasks : [parsed]

    const validProjects = ["Work", "Personal", "Waiting For"]

    return tasks
      .filter((t) => t.content && typeof t.content === "string")
      .map((t) => ({
        content: t.content.trim(),
        description: t.description?.trim() || undefined,
        project: validProjects.includes(t.project || "") ? t.project! : "Personal",
        priority: [1, 2, 3, 4].includes(t.priority || 0) ? t.priority : undefined,
        due_string: t.due_string?.trim() || undefined,
        labels: Array.isArray(t.labels) ? t.labels.map((l) => String(l).toLowerCase()) : [],
        newLabels: Array.isArray(t.newLabels) ? t.newLabels.map((l) => String(l).toLowerCase()) : [],
      }))
  } catch {
    return null
  }
}

// ─── Structural regex parser ─────────────────────────────────────────────────
//
// Handles natural language task input when the LLM is unavailable.
// Parses meta-instructions, labels, descriptions, projects, priorities, dates.

const PRIORITY_MAP: Record<string, number> = { p1: 4, p2: 3, p3: 2, p4: 1 }

const DATE_KEYWORDS = [
  "today", "tomorrow", "next week",
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
  "this monday", "this tuesday", "this wednesday", "this thursday", "this friday",
  "next monday", "next tuesday", "next wednesday", "next thursday", "next friday",
]

/**
 * Split a description string into bullet-pointed lines.
 * Handles voice-to-text input where items run together without punctuation.
 * Splits on: sentence endings, commas/semicolons, em dashes, and boundaries
 * where a closing paren or lowercase word is followed by a capitalized new phrase.
 */
function splitDescriptionItems(raw: string): string {
  return raw
    .replace(/\(\)/g, "")  // clean empty parens
    .split(
      // sentence endings | commas/semicolons | em/en dashes | ) then Capital | lowercase then Capital phrase
      /(?<=[.!?])\s+|\s*[,;]\s*|\s*[—–]\s*|(?<=\))\s+(?=[A-Z])|(?<=[a-z])\s+(?=[A-Z][a-z]{2,})/
    )
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => `- ${s}`)
    .join("\n")
}

function regexFallback(raw: string): ParsedTask {
  let text = raw
  let project: string = ""
  let priority: number | undefined
  let due_string: string | undefined
  const labels: string[] = []
  const newLabels: string[] = []
  let description: string | undefined

  // ── Extract project from meta-instructions ──────────────────────────────────
  // "Waiting for task..." or "waiting on..."
  if (/\bwaiting\s+(for|on)\b/i.test(text)) {
    project = "Waiting For"
    // Strip the "Waiting for task" prefix
    text = text.replace(/^waiting\s+(for|on)\s+(task\s+)?/i, "")
  }
  // "Add a personal task..."
  if (/\bpersonal\s+(task|to.?do)\b/i.test(text)) {
    project = "Personal"
    text = text.replace(/\b(add\s+a?\s*)?personal\s+(task|to.?do)\s*(to\s+)?/i, "")
  }
  // "Work task..." or "Work [domain]:"
  if (/\bwork\s+(task|to.?do)\b/i.test(text) || /^work\s+\w/i.test(text)) {
    project = "Work"
    text = text.replace(/^work\s+(task\s+)?(to\s+)?/i, "")
  }

  // ── Extract label from "label = X" or "label: X" or "with label X" ─────────
  const labelMatch = text.match(/\b(?:with\s+)?label\s*[=:]\s*(\w+)/i)
    || text.match(/\blabel\s+(\w+)/i)
  if (labelMatch) {
    const labelName = labelMatch[1].toLowerCase()
    newLabels.push(labelName)
    text = text.replace(labelMatch[0], "")
  }

  // ── Extract description from "description:" or "and these as the description:" ──
  const descMatch = text.match(/(?:,?\s*and\s+)?(?:these\s+as\s+)?(?:the\s+)?description\s*:\s*(.+)$/i)
  if (descMatch) {
    description = splitDescriptionItems(descMatch[1])
    text = text.slice(0, text.indexOf(descMatch[0]))
  }

  // ── Extract description from colon-separated lists (no "description" keyword) ──
  if (!description) {
    const colonSplit = text.match(/^(.+?):\s*([\s\S]+)$/)
    if (colonSplit) {
      const beforeColon = colonSplit[1].trim()
      const afterColon = colonSplit[2].trim()
      // If after-colon has multiple items (commas, periods), treat as description
      if ((afterColon.match(/[,;.]/g) || []).length >= 1 && afterColon.length > 40) {
        text = beforeColon
        description = splitDescriptionItems(afterColon)
      }
    }
  }

  // ── Extract priority ────────────────────────────────────────────────────────
  text = text.replace(/\bpriority\s+(\d)\b/gi, (_, n) => {
    const num = parseInt(n)
    if (num >= 1 && num <= 4) priority = PRIORITY_MAP[`p${num}`]
    return ""
  })
  text = text.replace(/\bp([1-4])\b/gi, (_, n) => {
    priority = PRIORITY_MAP[`p${n.toLowerCase()}`]
    return ""
  })

  // ── Extract due date ────────────────────────────────────────────────────────
  const sorted = [...DATE_KEYWORDS].sort((a, b) => b.length - a.length)
  for (const kw of sorted) {
    const re = new RegExp(`\\b${kw}\\b`, "i")
    if (re.test(text)) {
      due_string = kw
      text = text.replace(re, "")
      break
    }
  }

  // ── Clean up the title ──────────────────────────────────────────────────────
  // Strip leftover meta-words
  text = text
    .replace(/\b(for|with|and|to|add|create|a|an|the|task|these|as)\b\s*/gi, " ")
    .replace(/^[\s,;:—-]+/, "")     // leading punctuation
    .replace(/[\s,;:—-]+$/, "")     // trailing punctuation
    .replace(/\s{2,}/g, " ")        // collapse whitespace
    .trim()

  // If cleaning over-stripped, restore from raw
  const content = text.length > 3 ? text : raw.trim()

  return {
    content,
    project: project || "Personal",
    priority,
    due_string,
    description,
    labels,
    newLabels,
  }
}

// ─── Smart defaults ──────────────────────────────────────────────────────────
//
// Fills in any field the LLM (or regex fallback) left blank, using
// keyword heuristics + knowledge of Niki's world.

// People Niki works with and their domains (for Waiting For + label inference)
const KNOWN_PEOPLE: Record<string, { label: string; project: string; domain?: string }> = {
  karina:  { label: "karina",  project: "Waiting For", domain: "commerce" },
  charles: { label: "charles", project: "Waiting For", domain: "commerce" },
  mei:     { label: "mei",     project: "Waiting For", domain: "commerce" },
  aj:      { label: "aj",      project: "Waiting For", domain: "identity-collaboration" },
  derek:   { label: "derek",   project: "Waiting For", domain: "identity-collaboration" },
  juan:    { label: "juan",    project: "Personal" },
  nani:    { label: "nani",    project: "Waiting For" },
  abby:    { label: "abby",    project: "Personal" },
  tyler:   { label: "tyler",   project: "Personal" },
  emily:   { label: "emily",   project: "Personal" },
}

// Work initiatives → label mapping
const INITIATIVE_KEYWORDS: [RegExp, string][] = [
  [/\b(ecp|enterprise contract|credit pool|pay later|ach|payment|billing|invoice|pricing|metr[oa]nome|stripe|token.?based)\b/i, "commerce"],
  [/\b(iam|oidc|sso|rbac|org management|orgs?.?&?.?projects?|ums|deletion flow|application registration)\b/i, "identity-collaboration"],
  [/\b(gpu pricing|substrate|motherduck|dedicated endpoint|infrastructure)\b/i, "infrastructure"],
  [/\b(enterprise deal|sales|bizops|customer success|announcement|gtm)\b/i, "gtm"],
  [/\b(roadmap|okr|perf review|lattice|strategy doc|stakeholder|sprint planning|pm.?ops)\b/i, "pm-ops"],
  [/\b(customer discovery|competitive analysis|user interview|research)\b/i, "research"],
  [/\b(security review|compliance|audit|penetration)\b/i, "security / it"],
]

// Personal domain → label mapping
const PERSONAL_KEYWORDS: [RegExp, string][] = [
  [/\b(doctor|dentist|therapy|therapist|medication|supplement|blood work|workout|gym|sleep|anxiety|health)\b/i, "health"],
  [/\b(budget|invest|tax|insurance|401k|portfolio|stock|rent|salary|net worth|finance|ira)\b/i, "finance"],
  [/\b(apartment|errand|paperwork|subscription|dmv|passport|clean|grocery|admin)\b/i, "admin"],
  [/\b(trip|flight|hotel|airbnb|reservation|travel|sedona|nashville|calgary|argentina|boston|amalfi|stanford|amsterdam|costa rica)\b/i, "travel"],
  [/\b(course|certification|book|learn|study|tutorial)\b/i, "learning"],
  [/\b(juan|family|friend|dinner with|birthday|wedding|bachelorette|bachelor)\b/i, "relationship"],
]

// Trip names → context for project routing
const TRIP_NAMES = /\b(sedona|nashville|calgary|argentina|boston|amalfi|stanford|costa rica|tinsley|amsterdam)\b/i

function applySmartDefaults(task: ParsedTask, raw: string, existingLabels: string[]): ParsedTask {
  const lower = raw.toLowerCase()
  const titleLower = task.content.toLowerCase()
  const combined = `${lower} ${titleLower}`

  // ── Project defaults ────────────────────────────────────────────────────────

  // Detect "waiting for" / "waiting on" patterns even if LLM missed them
  if (!task.project || task.project === "Personal") {
    if (/\b(waiting (for|on)|blocked on|needs? to|ask .+ to)\b/i.test(lower)) {
      task.project = "Waiting For"
    }
  }

  // Check for known people → route to their default project
  if (!task.project || task.project === "Personal") {
    for (const [name, info] of Object.entries(KNOWN_PEOPLE)) {
      if (new RegExp(`\\b${name}\\b`, "i").test(combined)) {
        // Only override project if the person implies a non-Personal project
        if (info.project === "Waiting For" && /\b(waiting|blocked|ask|needs?|follow.?up|sync|check with)\b/i.test(combined)) {
          task.project = "Waiting For"
        }
        break
      }
    }
  }

  // Work signal detection for project
  if (!task.project || task.project === "Personal") {
    const workSignals = /\b(together|standup|sprint|deploy|api|linear|pr |code review|ship|launch|stakeholder|eng|pm|product)\b/i
    if (workSignals.test(combined) || INITIATIVE_KEYWORDS.some(([re]) => re.test(combined))) {
      task.project = "Work"
    }
  }

  // Trip names → Personal (they're personal travel)
  if (TRIP_NAMES.test(combined) && task.project !== "Waiting For") {
    task.project = "Personal"
  }

  // ── Label defaults ──────────────────────────────────────────────────────────

  if (task.labels.length === 0 && task.newLabels.length === 0) {
    const existingSet = new Set(existingLabels.map((l) => l.toLowerCase()))

    // Check work initiatives first
    for (const [re, label] of INITIATIVE_KEYWORDS) {
      if (re.test(combined)) {
        if (existingSet.has(label)) {
          task.labels.push(label)
        } else {
          task.newLabels.push(label)
        }
        break
      }
    }

    // If still no label, check personal domains
    if (task.labels.length === 0 && task.newLabels.length === 0) {
      for (const [re, label] of PERSONAL_KEYWORDS) {
        if (re.test(combined)) {
          if (existingSet.has(label)) {
            task.labels.push(label)
          } else {
            task.newLabels.push(label)
          }
          break
        }
      }
    }

    // Check for known people → add their person label (for Waiting For tasks)
    if (task.project === "Waiting For") {
      for (const [name, info] of Object.entries(KNOWN_PEOPLE)) {
        if (new RegExp(`\\b${name}\\b`, "i").test(combined)) {
          if (existingSet.has(info.label)) {
            if (!task.labels.includes(info.label)) task.labels.push(info.label)
          } else {
            if (!task.newLabels.includes(info.label)) task.newLabels.push(info.label)
          }
          // Also add their domain label if known
          if (info.domain) {
            if (existingSet.has(info.domain)) {
              if (!task.labels.includes(info.domain)) task.labels.push(info.domain)
            } else {
              if (!task.newLabels.includes(info.domain)) task.newLabels.push(info.domain)
            }
          }
          break
        }
      }
    }

    // Last resort: "work" label for Work project tasks with no label
    if (task.labels.length === 0 && task.newLabels.length === 0 && task.project === "Work") {
      if (existingSet.has("work")) {
        task.labels.push("work")
      }
    }
  }

  // ── Priority defaults ───────────────────────────────────────────────────────

  if (!task.priority) {
    // Urgent signals
    if (/\b(urgent|asap|critical|eod|end of day|blocker|blocking)\b/i.test(combined)) {
      task.priority = 4
    }
    // Important signals
    else if (/\b(important|this week|before .*(meeting|sync|review)|prep for)\b/i.test(combined)) {
      task.priority = 3
    }
    // Waiting For tasks default to p3 (medium) so they don't get lost
    else if (task.project === "Waiting For") {
      task.priority = 2
    }
    // Work tasks default to p2 (normal-medium)
    else if (task.project === "Work") {
      task.priority = 2
    }
    // Personal tasks: no default priority (p4/normal in Todoist)
  }

  return task
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function parseTaskInput(raw: string, todoistToken: string): Promise<ParseResult> {
  // Fetch labels and projects in parallel for LLM context
  const [labels, projects] = await Promise.all([
    fetchLabels(todoistToken),
    fetchProjects(todoistToken),
  ])

  const labelNames = labels.map((l) => l.name)
  const projectNames = projects.map((p) => p.name)

  // Try LLM parsing first
  const llmTasks = await llmParse(raw, labelNames, projectNames)

  if (llmTasks && llmTasks.length > 0) {
    // Cross-reference labels: move any label that already exists from newLabels to labels
    for (const task of llmTasks) {
      const existingSet = new Set(labelNames.map((n) => n.toLowerCase()))
      const actualNew: string[] = []
      for (const nl of task.newLabels) {
        if (existingSet.has(nl)) {
          if (!task.labels.includes(nl)) task.labels.push(nl)
        } else {
          actualNew.push(nl)
        }
      }
      task.newLabels = actualNew
    }

    // Apply smart defaults to fill any remaining gaps
    const enriched = llmTasks.map((t) => applySmartDefaults(t, raw, labelNames))
    return { tasks: enriched, rawFallback: false }
  }

  // Regex fallback + smart defaults
  const fallback = regexFallback(raw)
  const enriched = applySmartDefaults(fallback, raw, labelNames)
  return { tasks: [enriched], rawFallback: true }
}
