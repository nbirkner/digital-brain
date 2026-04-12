/**
 * capture-router.ts
 *
 * Routes a quick capture to the right file(s) in the repo. Returns
 * a list of FileChange objects that can be committed in one batch.
 *
 * Two modes:
 *   - Command: "Update Sedona trip with this booking" → applies the change to the target file
 *   - Note: free-form text → appends to the right destination file
 *
 * For commands with image attachments, Together AI vision extracts
 * the text before it's applied.
 */

import { getFile, type FileChange } from "./github"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Attachment {
  name: string
  base64: string
  mimeType: string
  storagePath: string // where this binary file will be committed in the repo
}

export interface CaptureResult {
  files: FileChange[]
  summary: string
}

// ─── Trip index ───────────────────────────────────────────────────────────────

const TRIPS = [
  { key: "Sedona", keywords: ["sedona", "sisters trip"], filePath: "personal/site/travel/trips/sisters-trip-sedona.md" },
  { key: "Argentina", keywords: ["argentina", "holy week", "buenos aires", "patagonia"], filePath: "personal/site/travel/trips/argentina-holy-week.md" },
  { key: "Nashville", keywords: ["nashville", "abby bachelorette", "bachelorette"], filePath: "personal/site/travel/trips/abbys-bachelorette-nashville.md" },
  { key: "Calgary", keywords: ["calgary", "tyler bachelor", "bachelor party"], filePath: "personal/site/travel/trips/tyler-bachelor-party-calgary.md" },
  { key: "Tinsley Island", keywords: ["tinsley"], filePath: "personal/site/travel/trips/tinsley-island.md" },
  { key: "Costa Rica", keywords: ["costa rica"], filePath: "personal/site/travel/trips/costa-rica-nikis-bday.md" },
  { key: "Boston", keywords: ["boston", "abby tyler wedding", "abby wedding"], filePath: "personal/site/travel/trips/boston-abby-tyler-wedding.md" },
  { key: "Amalfi Coast", keywords: ["amalfi", "italy", "emily nate", "emily wedding"], filePath: "personal/site/travel/trips/amalfi-coast-emily-nate-wedding.md" },
  { key: "Stanford", keywords: ["stanford reunion", "stanford"], filePath: "personal/site/travel/trips/stanford-reunion.md" },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayDate(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function yearMonth(): string {
  return todayDate().slice(0, 7)
}

function formatTimestamp(): string {
  return new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true })
}

function buildNoteBlock(content: string, attachmentPaths: string[]): string {
  let block = `\n## ${formatTimestamp()}\n\n${content.trim()}`
  for (const p of attachmentPaths) {
    block += `\n\n[Attachment](/${p})`
  }
  return block + "\n"
}

// ─── Command detection ────────────────────────────────────────────────────────

const COMMAND_PATTERNS = [
  /^(update|edit|modify|change|fix|add to|append to|include in|incorporate into)\b/i,
  /\b(update|add|include|incorporate|put|save).{0,30}\b(trip|file|notes?|doc|itinerary)\b/i,
]

function isCommand(text: string): boolean {
  return COMMAND_PATTERNS.some((p) => p.test(text.trim()))
}

function findTripTarget(text: string): (typeof TRIPS)[0] | null {
  const lower = text.toLowerCase()
  for (const trip of TRIPS) {
    if (trip.keywords.some((kw) => lower.includes(kw))) return trip
  }
  return null
}

// ─── Anthropic Claude helpers ─────────────────────────────────────────────────

async function claudeChat(systemPrompt: string, userMessage: string, maxTokens: number): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return ""
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      max_tokens: maxTokens,
    }),
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) return ""
  const data = await res.json()
  return data.content?.[0]?.text?.trim() || ""
}

/** Extract readable text + key facts from an image using Claude's vision. */
async function extractImageText(base64: string, mimeType: string): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return "[image attached — text extraction unavailable without ANTHROPIC_API_KEY]"

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
        max_tokens: 600,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mimeType, data: base64 } },
            { type: "text", text: "Extract all text and key information. If it's a booking confirmation, list: property name, dates, confirmation number, address, cost. If it's a screenshot of text, transcribe it fully. Format as clear bullet points." },
          ],
        }],
      }),
      signal: AbortSignal.timeout(12000),
    })
    if (!res.ok) return "[image — extraction failed]"
    const data = await res.json()
    return data.content?.[0]?.text?.trim() || "[image — no content extracted]"
  } catch {
    return "[image — extraction timed out]"
  }
}

/** Apply a command to a file using an LLM. Falls back to append. */
async function applyCommandToFile(
  command: string,
  extractedInfo: string,
  existingContent: string,
  targetName: string
): Promise<string> {
  const ts = formatTimestamp()
  const fallback = existingContent + `\n\n## Update — ${ts}\n\n${extractedInfo}\n`

  const result = await claudeChat(
    `You maintain a personal trip planning document. When given a command and new information, update the document to incorporate it. Keep all existing content and formatting intact. Add new info to the appropriate section (Accommodations, Flights, Activities, etc.). If no section fits, create one. Return ONLY the complete updated markdown document — no commentary, no fences.`,
    `Command: "${command}"\n\nNew information:\n${extractedInfo}\n\nCurrent document for "${targetName}":\n\n${existingContent}`,
    4000
  )

  if (!result || result.length < existingContent.length * 0.5) {
    // Sanity check: if LLM returned something suspiciously short, fall back
    return fallback
  }

  return result
}

// ─── Category routing ─────────────────────────────────────────────────────────

type Category = "work" | "goals" | "health" | "finance" | "personal"

function quickCategoryRule(lower: string): Category | null {
  if (/\b(okr|sprint|roadmap|stakeholder|launch|ship|deploy|backend|frontend|linear|jira|ticket|pr review|standup)\b/.test(lower)) return "work"
  if (/\b(goal|intention|quarterly|personal growth|habit|q[1-4]\b)\b/.test(lower)) return "goals"
  if (/\b(doctor|dentist|symptom|medication|workout|therapy|blood work|health|anxiety|sleep)\b/.test(lower)) return "health"
  if (/\b(budget|invest|tax|insurance|savings|401k|portfolio|stock|etf|rent|salary|income|expense)\b/.test(lower)) return "finance"
  return null
}

async function llmCategory(content: string): Promise<Category> {
  const result = await claudeChat(
    "Classify this note into one word: work, goals, health, finance, personal. Reply with only that word.",
    content.slice(0, 400),
    10
  )
  const valid: Category[] = ["work", "goals", "health", "finance", "personal"]
  return valid.includes(result as Category) ? (result as Category) : "personal"
}

function categoryToPath(cat: Category): { filePath: string; summary: string } {
  switch (cat) {
    case "work":    return { filePath: `work/notes/${todayDate()}-quick-notes.md`, summary: "Saved to work notes" }
    case "goals":   return { filePath: "personal/docs/growth/capture-notes.md", summary: "Saved to goals notes" }
    case "health":  return { filePath: `personal/notes/health-${yearMonth()}.md`, summary: "Saved to health notes" }
    case "finance": return { filePath: `personal/notes/finance-${yearMonth()}.md`, summary: "Saved to finance notes" }
    default:        return { filePath: `personal/notes/${todayDate()}-quick-notes.md`, summary: "Saved to personal notes" }
  }
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function routeCapture(text: string, attachments: Attachment[]): Promise<CaptureResult> {
  const lower = text.toLowerCase()
  const files: FileChange[] = []

  // Always commit binary attachments as part of the same batch
  const attachmentPaths: string[] = []
  for (const att of attachments) {
    files.push({ path: att.storagePath, content: att.base64, encoding: "base64" })
    attachmentPaths.push(att.storagePath)
  }

  // ── Command path ────────────────────────────────────────────────────────────

  if (isCommand(text)) {
    const tripTarget = findTripTarget(text)

    if (tripTarget) {
      // Extract info from images (if any), then apply the command to the trip file
      let extractedInfo = text
      const imageAttachments = attachments.filter((a) => a.mimeType.startsWith("image/"))
      if (imageAttachments.length > 0) {
        const parts = await Promise.all(imageAttachments.map((a) => extractImageText(a.base64, a.mimeType)))
        extractedInfo = `${text}\n\nExtracted from attached image(s):\n${parts.join("\n\n")}`
      }

      const existing = await getFile(tripTarget.filePath)
      const currentContent = existing?.content || `# ${tripTarget.key} Trip\n`
      const updatedContent = await applyCommandToFile(text, extractedInfo, currentContent, tripTarget.key)

      files.push({ path: tripTarget.filePath, content: updatedContent, encoding: "utf-8" })
      return { files, summary: `Updated ${tripTarget.key} trip` }
    }
  }

  // ── Note path ───────────────────────────────────────────────────────────────

  // Trip match (keyword)
  for (const trip of TRIPS) {
    if (trip.keywords.some((kw) => lower.includes(kw))) {
      const appendContent = buildNoteBlock(text, attachmentPaths)
      const existing = await getFile(trip.filePath)
      const newContent = (existing?.content || `# ${trip.key} Trip\n`) + appendContent
      files.push({ path: trip.filePath, content: newContent, encoding: "utf-8" })
      return { files, summary: `Saved to ${trip.key} trip notes` }
    }
  }

  // Category routing
  const quickCat = quickCategoryRule(lower)
  const category = quickCat ?? (await llmCategory(text))
  const { filePath, summary } = categoryToPath(category)

  const categoryTag = category === "work" ? "[work]" : "[personal]"
  const appendContent = buildNoteBlock(`${categoryTag} ${text}`, attachmentPaths)
  const existing = await getFile(filePath)
  const frontmatter = `---\ntitle: Quick Notes\ndate: ${todayDate()}\ntype: quick-note\n---\n`
  const newContent = existing?.content
    ? existing.content + appendContent
    : frontmatter + appendContent
  files.push({ path: filePath, content: newContent, encoding: "utf-8" })

  return { files, summary }
}
