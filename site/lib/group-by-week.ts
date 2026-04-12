// ─── shared week-grouping utilities ──────────────────────────────────────────
// Used by NotesClient and DocsClient (and any future list views).

export function getWeekStart(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().slice(0, 10)
}

export function formatWeekLabel(weekStart: string): string {
  const d = new Date(`${weekStart}T12:00:00`)
  return `Week of ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
}

export interface WeekGroup<T> {
  weekStart: string
  label: string
  items: T[]
}

/**
 * Groups an array of items by calendar week (Monday-start).
 * Items without a `date` field are collected into the `undated` bucket.
 * Groups are sorted newest-first by default; pass order "oldest" to reverse.
 */
export function groupByWeek<T extends { date?: string | null }>(
  items: T[],
  order: "newest" | "oldest"
): { groups: WeekGroup<T>[]; undated: T[] } {
  const map = new Map<string, T[]>()
  const undated: T[] = []

  for (const item of items) {
    if (!item.date) {
      undated.push(item)
      continue
    }
    const ws = getWeekStart(item.date)
    const existing = map.get(ws)
    if (existing) {
      existing.push(item)
    } else {
      map.set(ws, [item])
    }
  }

  const groups: WeekGroup<T>[] = Array.from(map.entries()).map(([ws, groupItems]) => ({
    weekStart: ws,
    label: formatWeekLabel(ws),
    items: groupItems,
  }))

  if (order === "oldest") {
    groups.sort((a, b) => a.weekStart.localeCompare(b.weekStart))
  } else {
    groups.sort((a, b) => b.weekStart.localeCompare(a.weekStart))
  }

  return { groups, undated }
}
