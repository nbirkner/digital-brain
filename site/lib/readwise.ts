// ─── Readwise API types ───────────────────────────────────────────────────────

export type ReadwiseCategory = "books" | "articles" | "tweets" | "podcasts" | "supplementals"

export interface ReadwiseBook {
  id: number
  title: string
  author: string | null
  category: ReadwiseCategory
  cover_image_url: string | null
  num_highlights: number
  last_highlight_at: string | null
  updated: string
  highlights_url: string
  source_url: string | null
}

export interface ReadwiseHighlight {
  id: number
  text: string
  note: string | null
  highlighted_at: string | null
  created_at: string
  book_id: number
  url: string | null
  readwise_url: string | null
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  results: T[]
}

// ─── paginated fetch helper ───────────────────────────────────────────────────

async function fetchAllPages<T>(
  startUrl: string,
  token: string
): Promise<T[]> {
  const all: T[] = []
  let url: string | null = startUrl

  while (url) {
    const res = await fetch(url, {
      headers: { Authorization: `Token ${token}` },
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      console.error(`[readwise] fetch error ${res.status} for ${url}`)
      break
    }

    const data: PaginatedResponse<T> = await res.json()
    all.push(...data.results)
    url = data.next
  }

  return all
}

// ─── public fetch functions ───────────────────────────────────────────────────

export async function fetchBooks(): Promise<ReadwiseBook[]> {
  const token = process.env.READWISE_API_TOKEN
  if (!token) return []

  try {
    return await fetchAllPages<ReadwiseBook>(
      "https://readwise.io/api/v2/books/?page_size=1000",
      token
    )
  } catch (err) {
    console.error("[readwise] fetchBooks error:", err)
    return []
  }
}

export async function fetchBookById(id: number): Promise<ReadwiseBook | null> {
  const token = process.env.READWISE_API_TOKEN
  if (!token) return null

  try {
    const res = await fetch(`https://readwise.io/api/v2/books/${id}/`, {
      headers: { Authorization: `Token ${token}` },
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    return (await res.json()) as ReadwiseBook
  } catch (err) {
    console.error("[readwise] fetchBookById error:", err)
    return null
  }
}

export async function fetchBookHighlights(
  bookId: number
): Promise<ReadwiseHighlight[]> {
  const token = process.env.READWISE_API_TOKEN
  if (!token) return []

  try {
    const raw = await fetchAllPages<ReadwiseHighlight>(
      `https://readwise.io/api/v2/highlights/?book_id=${bookId}&page_size=1000`,
      token
    )
    return deduplicateHighlights(raw)
  } catch (err) {
    console.error("[readwise] fetchBookHighlights error:", err)
    return []
  }
}

export async function fetchHighlights(): Promise<ReadwiseHighlight[]> {
  const token = process.env.READWISE_API_TOKEN
  if (!token) return []

  try {
    const raw = await fetchAllPages<ReadwiseHighlight>(
      "https://readwise.io/api/v2/highlights/?page_size=1000",
      token
    )
    return deduplicateHighlights(raw)
  } catch (err) {
    console.error("[readwise] fetchHighlights error:", err)
    return []
  }
}

// ─── Reader API (v3) ─────────────────────────────────────────────────────────

export async function fetchReaderSummary(sourceUrl: string | null, title: string): Promise<string | null> {
  const token = process.env.READWISE_API_TOKEN
  if (!token) return null

  try {
    // Try by source_url first if available
    const params = new URLSearchParams({ page_size: "1" })
    if (sourceUrl) {
      params.set("url", sourceUrl)
    } else {
      // Fall back to title search — not ideal but covers books without source_url
      params.set("title", title)
    }

    const res = await fetch(`https://readwise.io/api/v3/list/?${params}`, {
      headers: { Authorization: `Token ${token}` },
      next: { revalidate: 60 },
    })

    if (!res.ok) return null

    const data = await res.json()
    const doc = data.results?.[0]
    return doc?.summary || null
  } catch (err) {
    console.error("[readwise] fetchReaderSummary error:", err)
    return null
  }
}

// ─── deduplication ────────────────────────────────────────────────────────────

// Readwise sometimes saves the same highlight multiple times with minor
// variations — trailing punctuation, stray brackets, etc.
// Strategy:
//   Pass 1 — exact match on normalized text (lowercase, stripped punctuation).
//   Pass 2 — containment check within same book: if one normalized highlight
//             is ≥80% the length of another and is fully contained within it,
//             they're the same quote — keep the longer version.

function normalizeForDedup(text: string): string {
  return text
    .toLowerCase()
    // Strip leading/trailing punctuation, brackets, quotes, ellipsis
    .replace(/^[\s()\[\]{}"'\u2018\u2019\u201C\u201D.,!?;:\u2026\-]+/g, "")
    .replace(/[\s()\[\]{}"'\u2018\u2019\u201C\u201D.,!?;:\u2026\-]+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export function deduplicateHighlights(
  highlights: ReadwiseHighlight[]
): ReadwiseHighlight[] {
  // Pass 1: exact match on normalized text, keep highest id
  const seenByNorm = new Map<string, ReadwiseHighlight>()
  for (const h of highlights) {
    const key = normalizeForDedup(h.text)
    const existing = seenByNorm.get(key)
    if (!existing || h.id > existing.id) {
      seenByNorm.set(key, h)
    }
  }

  // Pass 2: containment check within the same book
  // Group by book_id for efficiency (only compare within same source)
  const byBook = new Map<number, ReadwiseHighlight[]>()
  for (const h of Array.from(seenByNorm.values())) {
    const list = byBook.get(h.book_id) ?? []
    list.push(h)
    byBook.set(h.book_id, list)
  }

  const toRemove = new Set<number>()
  for (const group of Array.from(byBook.values())) {
    // Sort longest normalized text first
    const withNorm = group
      .map((h: ReadwiseHighlight) => ({ h, norm: normalizeForDedup(h.text) }))
      .sort((a: { norm: string }, b: { norm: string }) => b.norm.length - a.norm.length)

    for (let i = 0; i < withNorm.length; i++) {
      if (toRemove.has(withNorm[i].h.id)) continue
      for (let j = i + 1; j < withNorm.length; j++) {
        if (toRemove.has(withNorm[j].h.id)) continue
        const longer = withNorm[i].norm
        const shorter = withNorm[j].norm
        // If shorter is at least 80% the length of longer and is contained within it
        if (shorter.length >= longer.length * 0.8 && longer.includes(shorter)) {
          // Keep whichever has the higher id (more recently saved); drop the other
          if (withNorm[i].h.id >= withNorm[j].h.id) {
            toRemove.add(withNorm[j].h.id)
          } else {
            toRemove.add(withNorm[i].h.id)
          }
        }
      }
    }
  }

  return Array.from(seenByNorm.values()).filter((h: ReadwiseHighlight) => !toRemove.has(h.id))
}
