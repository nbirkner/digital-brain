/**
 * Task ↔ Notes bidirectional linking utilities (client-safe).
 *
 * This file contains only browser-safe code (no `fs` or `path` imports).
 * For server-only helpers (reading/writing the task-notes index from disk),
 * import from `@/lib/task-notes-server`.
 */

export interface NoteRef {
  title: string
  date: string
  href: string
}

/**
 * Parse a task description for "Note:" and "From:" lines that reference meeting notes.
 *
 * Recognized formats:
 *   Note: /work/meetings/2026-04-08/Meeting_Name
 *   From: Meeting Name
 */
export function parseNoteRefsFromDescription(
  description: string
): Array<{ title: string; href: string }> {
  if (!description) return []

  const refs: Array<{ title: string; href: string }> = []
  const lines = description.split("\n")

  for (const line of lines) {
    const trimmed = line.trim()

    // "Note: /work/meetings/2026-04-08/Meeting_Name"
    const noteMatch = trimmed.match(/^Note:\s*(\/work\/meetings\/\S+)/i)
    if (noteMatch) {
      const href = noteMatch[1]
      // Extract title from the last path segment, humanize underscores
      const segments = href.split("/")
      const raw = segments[segments.length - 1] || ""
      const title = raw.replace(/_/g, " ")
      refs.push({ title, href })
      continue
    }

    // "From: Meeting Name"
    const fromMatch = trimmed.match(/^From:\s*(.+)/i)
    if (fromMatch) {
      refs.push({ title: fromMatch[1].trim(), href: "" })
    }
  }

  return refs
}
