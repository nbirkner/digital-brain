/**
 * Docs library — wraps getMarkdownFiles for work/docs and personal/docs,
 * adds docType and domain derivation.
 */
import { getMarkdownFiles, ContentFile } from "./content"

export type DocType =
  | "PRD"
  | "Decision"
  | "Analysis"
  | "Agenda"
  | "Meeting Notes"
  | "Comms"
  | "Career"
  | "Roadmap"
  | "Research"
  | "Review"
  | "Goals"
  | "Learning"
  | "Log"
  | "Strategy"
  | "Guide"
  | "Weekly Plan"
  | "Weekly Review"
  | "Doc"

export type DocDomain = "work" | "personal"

export interface Doc {
  slug: string
  filePath: string
  title: string
  date: string // ISO date string, may be partial (YYYY-MM)
  datePrecision: "day" | "month" | "none"
  docType: DocType
  domain: DocDomain
  content: string
  frontmatter: Record<string, string>
  autoTags: string[]
}

// Paths to exclude from the docs view
const EXCLUDE_PREFIXES = [
  "work/notes/",
  "personal/notes/",
]

function deriveDocType(filePath: string): DocType {
  if (filePath.startsWith("work/docs/prds/")) return "PRD"
  if (filePath.startsWith("work/docs/decisions/")) return "Decision"
  if (filePath.startsWith("work/docs/analyses/")) return "Analysis"
  if (filePath.startsWith("work/docs/agendas/")) return "Agenda"
  if (filePath.startsWith("work/notes/")) return "Meeting Notes"
  // Comms sub-paths: more specific before generic
  if (filePath.startsWith("work/docs/comms/weekly-plans/")) return "Weekly Plan"
  if (filePath.startsWith("work/docs/comms/weekly-reviews/")) return "Weekly Review"
  if (filePath.startsWith("work/docs/comms/slack-messages/")) return "Comms"
  if (filePath.startsWith("work/docs/comms/status-updates/")) return "Comms"
  if (filePath.startsWith("work/docs/comms/")) return "Comms"
  if (filePath.startsWith("work/docs/career/")) return "Career"
  if (filePath.startsWith("work/docs/roadmaps/")) return "Roadmap"
  if (filePath.startsWith("work/docs/research/")) return "Research"
  if (filePath.startsWith("work/docs/reviews/")) return "Review"
  if (filePath.startsWith("work/docs/guides/")) return "Guide"
  if (filePath.startsWith("work/site/strategy/")) return "Strategy"
  if (filePath.startsWith("work/docs/logs/")) return "Log"
  if (filePath.startsWith("personal/docs/logs/")) return "Log"
  if (filePath.startsWith("personal/docs/growth/")) return "Goals"
  if (filePath.startsWith("personal/docs/library/")) return "Learning"
  return "Doc"
}

function deriveDomain(filePath: string): DocDomain {
  return filePath.startsWith("personal/") ? "personal" : "work"
}

function deriveFolderHint(filePath: string): string {
  const parts = filePath.split("/")
  return parts.slice(0, -1).join("/") + "/"
}

/**
 * Extract date from a ContentFile. Priority:
 * 1. frontmatter date or created
 * 2. date embedded in path (meetings use YYYY-MM-DD in folder name)
 * 3. empty string
 */
function extractDate(file: ContentFile): { date: string; precision: "day" | "month" | "none" } {
  const fm = file.frontmatter
  const raw = fm.date ?? fm.created ?? fm.updated ?? ""

  if (raw) {
    // Check if it's a full date (YYYY-MM-DD) or just year/month
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
      return { date: raw.slice(0, 10), precision: "day" }
    }
    if (/^\d{4}-\d{2}/.test(raw)) {
      return { date: raw.slice(0, 7), precision: "month" }
    }
  }

  // Try to extract date from path (e.g. work/notes/2026-04-07/...)
  const pathDateMatch = file.filePath.match(/(\d{4}-\d{2}-\d{2})/)
  if (pathDateMatch) {
    return { date: pathDateMatch[1], precision: "day" }
  }

  const pathMonthMatch = file.filePath.match(/(\d{4}-\d{2})/)
  if (pathMonthMatch) {
    return { date: pathMonthMatch[1] + "-01", precision: "month" }
  }

  return { date: "", precision: "none" }
}

function contentFileToDoc(file: ContentFile): Doc {
  const { date, precision } = extractDate(file)
  return {
    slug: file.slug,
    filePath: file.filePath,
    title: file.displayTitle,
    date,
    datePrecision: precision,
    docType: deriveDocType(file.filePath),
    domain: deriveDomain(file.filePath),
    content: file.content,
    frontmatter: file.frontmatter,
    autoTags: file.autoTags,
  }
}

export function getAllDocsIncludingHidden(): Doc[] {
  const workFiles = getMarkdownFiles("work/docs")
  const personalFiles = getMarkdownFiles("personal/docs")
  const strategyFiles = getMarkdownFiles("work/site/strategy")

  const allFiles = [...workFiles, ...personalFiles, ...strategyFiles].filter(
    (f) => !EXCLUDE_PREFIXES.some((prefix) => f.filePath.startsWith(prefix))
  )

  return allFiles.map(contentFileToDoc).sort((a, b) => {
    if (!a.date && !b.date) return 0
    if (!a.date) return 1
    if (!b.date) return -1
    return b.date.localeCompare(a.date)
  })
}

export function getAllDocs(): Doc[] {
  const workFiles = getMarkdownFiles("work/docs")
  const personalFiles = getMarkdownFiles("personal/docs")
  const strategyFiles = getMarkdownFiles("work/site/strategy")

  const allFiles = [...workFiles, ...personalFiles, ...strategyFiles].filter(
    (f) =>
      !EXCLUDE_PREFIXES.some((prefix) => f.filePath.startsWith(prefix)) &&
      f.frontmatter.hidden !== "true"
  )

  const docs = allFiles.map(contentFileToDoc)

  // Sort newest first — docs with no date go to end
  return docs.sort((a, b) => {
    if (!a.date && !b.date) return 0
    if (!a.date) return 1
    if (!b.date) return -1
    return b.date.localeCompare(a.date)
  })
}

export function getFolderHint(filePath: string): string {
  return deriveFolderHint(filePath)
}

export function formatDocDate(doc: Doc | DocMeta): string {
  if (!doc.date) return ""
  if (doc.datePrecision === "none") return ""

  try {
    const d = new Date(doc.date + (doc.datePrecision === "month" ? "" : ""))
    if (doc.datePrecision === "day") {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
    }
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })
  } catch {
    return doc.date
  }
}

export function getMonthLabel(doc: Doc | DocMeta): string {
  if (!doc.date) return "Undated"
  try {
    const d = new Date(doc.date + "T12:00:00Z")
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })
  } catch {
    return "Undated"
  }
}

export const DOC_TYPE_STYLES: Record<DocType, string> = {
  PRD: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  Decision: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  Analysis: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  Agenda: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
  "Meeting Notes": "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  Comms: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
  Career: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
  Roadmap: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  Research: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
  Review: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
  Goals: "bg-green-500/10 text-green-400 border border-green-500/20",
  Learning: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
  Log: "bg-gray-500/10 text-gray-300 border border-gray-500/20",
  Strategy: "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20",
  Guide: "bg-lime-500/10 text-lime-400 border border-lime-500/20",
  "Weekly Plan": "bg-sky-500/10 text-sky-300 border border-sky-500/20",
  "Weekly Review": "bg-teal-500/10 text-teal-300 border border-teal-500/20",
  Doc: "bg-notion-surface border border-notion-border text-notion-muted/60",
}

export type DocMeta = Omit<Doc, "content">

export function getAllDocsMeta(): DocMeta[] {
  return getAllDocs().map(({ content, ...meta }) => meta)
}

export function getWorkDocsMeta(): DocMeta[] {
  return getAllDocsMeta().filter(d => d.domain === "work")
}

export function getWorkDocs(): Doc[] {
  return getAllDocs().filter((d) => d.domain === "work")
}

export interface SubDocItem {
  title: string
  filePath: string
  slug: string
  snippet: string
}

function makeSnippet(content: string): string {
  return content
    .replace(/^---[\s\S]*?---\n*/m, "")
    .replace(/^#+\s.+$/gm, "")
    .replace(/[#*`>_\[\]()!]/g, "")
    .replace(/\n+/g, " ")
    .trim()
    .slice(0, 100)
}

/**
 * Find all docs that declare the given filePath as their parent.
 * Searches the same directory as the parent file.
 */
export function getSubDocs(filePath: string): SubDocItem[] {
  const dir = filePath.split("/").slice(0, -1).join("/")
  if (!dir) return []
  const files = getMarkdownFiles(dir)
  return files
    .filter((f) => f.frontmatter?.parent === filePath)
    .map((f) => ({
      title: f.displayTitle,
      filePath: f.filePath,
      slug: f.slug,
      snippet: makeSnippet(f.content || ""),
    }))
}
