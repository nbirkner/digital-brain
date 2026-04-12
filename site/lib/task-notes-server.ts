/**
 * Server-only task-notes utilities that depend on Node's `fs` module.
 *
 * IMPORTANT: Only import this file from server components or API routes.
 * For client-safe helpers, import from `@/lib/task-notes`.
 */

import fs from "fs"
import path from "path"

import { type NoteRef } from "./task-notes"

const INDEX_PATH = path.join(process.cwd(), "site/data/task-notes-index.json")

/**
 * Read the pre-computed task→notes index from disk.
 * Returns an empty object if the file is missing or malformed.
 */
export function getTaskNotesIndex(): Record<string, NoteRef[]> {
  try {
    const raw = fs.readFileSync(INDEX_PATH, "utf-8")
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

/**
 * Convenience: get notes for a single task ID.
 */
export function getNotesForTask(taskId: string): NoteRef[] {
  const index = getTaskNotesIndex()
  return index[taskId] ?? []
}

/**
 * Build a supplemental index by searching note content for task title text.
 * Used as a fallback for tasks that weren't created from a note (no taskId link).
 * Only searches for tasks whose IDs are not already in the pre-built index.
 */
export function buildTitleIndex(
  tasks: Array<{ id: string; content: string }>,
  skipIds: Set<string> = new Set()
): Record<string, NoteRef[]> {
  const tasksToSearch = tasks.filter((t) => !skipIds.has(t.id))
  if (tasksToSearch.length === 0) return {}

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getMarkdownFiles } = require("@/lib/content") as {
    getMarkdownFiles: (prefix: string) => Array<{
      slug: string
      content: string
      displayTitle: string
      frontmatter: Record<string, string>
    }>
  }

  // Normalize each task title into a searchable phrase (first 7 words, lowercase)
  const searchMap = tasksToSearch
    .map((t) => ({
      id: t.id,
      phrase: t.content
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .trim()
        .split(/\s+/)
        .slice(0, 7)
        .join(" "),
    }))
    .filter((t) => t.phrase.split(" ").length >= 4) // skip very short/generic titles

  if (searchMap.length === 0) return {}

  const index: Record<string, NoteRef[]> = {}
  const prefixes = ["work/notes", "personal/notes"]

  for (const prefix of prefixes) {
    let files: ReturnType<typeof getMarkdownFiles>
    try {
      files = getMarkdownFiles(prefix)
    } catch {
      continue
    }

    // work/notes → /work/meetings, personal/notes → /meetings (no /personal/meetings route)
    const urlBase = prefix === "personal/notes" ? "/meetings" : "/" + prefix.replace("/notes", "/meetings")

    for (const file of files) {
      const contentLower = file.content.toLowerCase().replace(/[^a-z0-9\s]/g, "")
      const dateMatch = file.slug.match(/^(\d{4}-\d{2}-\d{2})/)
      const date = dateMatch ? dateMatch[1] : (file.frontmatter?.date ?? "")
      const href = `${urlBase}/${file.slug}`

      for (const { id, phrase } of searchMap) {
        if (!contentLower.includes(phrase)) continue
        if (!index[id]) index[id] = []
        if (!index[id].some((r) => r.href === href)) {
          index[id].push({ title: file.displayTitle, date, href })
        }
      }
    }
  }

  return index
}

/**
 * Rebuild the task-notes index by scanning all meeting markdown files.
 * Intended for one-time bootstrap or manual re-indexing, NOT for every request.
 *
 * Usage:
 *   npx tsx site/scripts/rebuild-task-notes-index.ts
 */
export function rebuildTaskNotesIndex(): Record<string, NoteRef[]> {
  // Dynamic import to avoid bundling getMarkdownFiles in the hot path
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getMarkdownFiles } = require("@/lib/content") as {
    getMarkdownFiles: (prefix: string) => Array<{
      slug: string
      content: string
      displayTitle: string
      frontmatter: Record<string, string>
    }>
  }

  const index: Record<string, NoteRef[]> = {}
  const taskIdPattern = /taskId=([A-Za-z0-9]+)/g

  const prefixes = ["work/notes", "personal/notes"]

  for (const prefix of prefixes) {
    let files: ReturnType<typeof getMarkdownFiles>
    try {
      files = getMarkdownFiles(prefix)
    } catch {
      continue
    }

    // Determine the URL base from the prefix
    // work/notes → /work/meetings
    // personal/notes → /meetings (no /personal/meetings route exists)
    const urlBase = prefix === "personal/notes" ? "/meetings" : "/" + prefix.replace("/notes", "/meetings")

    for (const file of files) {
      taskIdPattern.lastIndex = 0
      const seenIds = new Set<string>()
      let match: RegExpExecArray | null

      while ((match = taskIdPattern.exec(file.content)) !== null) {
        const taskId = match[1]
        if (seenIds.has(taskId)) continue
        seenIds.add(taskId)

        if (!index[taskId]) index[taskId] = []

        const dateMatch = file.slug.match(/^(\d{4}-\d{2}-\d{2})/)
        const date = dateMatch ? dateMatch[1] : file.frontmatter.date ?? ""

        index[taskId].push({
          title: file.displayTitle,
          date,
          href: `${urlBase}/${file.slug}`,
        })
      }
    }
  }

  // Write the index to disk
  fs.mkdirSync(path.dirname(INDEX_PATH), { recursive: true })
  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2) + "\n")

  return index
}
