import { Suspense } from "react"
import PageHeader from "@/components/PageHeader"
import NotesClient from "@/components/NotesClient"
import type { NoteItem } from "@/components/NotesClient"
import { getMarkdownFilesIndex } from "@/lib/content"
import type { ContentFile } from "@/lib/content"

type CategoryType = "work" | "personal" | "shared"

// Extract a YYYY-MM-DD date from the slug when frontmatter has no date.
// Meeting slugs look like: "2026-04/2026-04-07/meeting-name"
// Note slugs may look like: "2026-04-07-some-note"
function extractDateFromSlug(slug: string): string {
  const match = slug.match(/(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : ""
}

function toNoteItem(file: ContentFile, defaultCategory: CategoryType): NoteItem {
  const date =
    file.frontmatter.date ??
    file.frontmatter.created ??
    extractDateFromSlug(file.slug)

  // Infer category: prefer frontmatter, fall back to path-based default
  const category: CategoryType =
    (file.frontmatter.category as CategoryType) ?? defaultCategory

  // Build href based on category and source path.
  // URL-encode each path segment so characters like # and emoji don't break browser navigation.
  const encodedSlug = file.slug.split("/").map(encodeURIComponent).join("/")
  let href: string
  if (category === "work") {
    href = `/work/meetings/${encodedSlug}`
  } else if (category === "personal") {
    href = `/meetings/${encodedSlug}`
  } else {
    href = `/notes/${encodedSlug}`
  }

  return {
    slug: file.slug,
    displayTitle: file.displayTitle,
    date,
    category,
    label: file.frontmatter.label ?? undefined,
    href,
    tags: file.autoTags,
    frontmatter: file.frontmatter,
  }
}

export default async function NotesPage() {
  const [workNotes, personalNotes] = await Promise.all([
    Promise.resolve(getMarkdownFilesIndex("work/notes")),
    Promise.resolve(getMarkdownFilesIndex("personal/notes")),
  ])

  const allItems: NoteItem[] = [
    ...workNotes.map((f) => toNoteItem(f, "work")),
    ...personalNotes.map((f) => toNoteItem(f, "personal")),
  ]

  // Deduplicate: first by slug+category (exact), then by normalized title+date+category
  // (catches same meeting saved with different filename sanitization)
  const seen = new Set<string>()
  const deduped = allItems.filter((item) => {
    const slugKey = `slug:${item.category}:${item.slug}`
    const titleKey = `title:${item.category}:${item.date}:${item.displayTitle.toLowerCase().replace(/[^a-z0-9]/g, "")}`
    if (seen.has(slugKey) || seen.has(titleKey)) return false
    seen.add(slugKey)
    seen.add(titleKey)
    return true
  })

  deduped.sort((a, b) => b.date.localeCompare(a.date))

  const totalCount = deduped.length

  return (
    <div>
      <PageHeader
        icon="💭"
        title="Notes"
        description={`Work, personal, and shared meetings. ${totalCount} total.`}
      />
      <Suspense fallback={null}>
        <NotesClient items={deduped} />
      </Suspense>
    </div>
  )
}
