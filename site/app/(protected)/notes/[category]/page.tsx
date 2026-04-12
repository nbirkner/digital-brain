import Link from "next/link"
import { notFound } from "next/navigation"
import { getFileTitlesFromGitHub } from "@/lib/content"

import NotesFilter from "@/components/NotesFilter"
import PageHeader from "@/components/PageHeader"
import PagePathStatic from "@/components/PagePathStatic"
import EmptyState from "@/components/EmptyState"


interface NoteItem {
  slug: string
  displayTitle: string
  content: string
  frontmatter: Record<string, string>
  autoTags?: string[]
}

const CATEGORY_META: Record<string, { icon: string; label: string; description: string }> = {
  articles: { icon: "📄", label: "Articles", description: "Highlights and notes from web articles." },
  books: { icon: "📚", label: "Books", description: "Quotes and notes from books." },
  people: { icon: "👥", label: "People", description: "Notes about people, relationships, and interactions." },
  "work-meetings": { icon: "💼", label: "Work Meetings", description: "Notes from work meetings and discussions." },
  work: { icon: "🏢", label: "Work", description: "General work notes and ideas." },
  tasks: { icon: "✅", label: "Tasks", description: "Task-related notes and context." },
  quotes: { icon: "💬", label: "Quotes", description: "Notable quotes and sayings." },
  learning: { icon: "🎓", label: "Learning", description: "Learning notes and study materials." },
  journal: { icon: "📓", label: "Journal", description: "Journal-style notes." },
  health: { icon: "❤️", label: "Health", description: "Health-related notes." },
  hobbies: { icon: "🎨", label: "Hobbies", description: "Hobby notes and tracking." },
  finance: { icon: "💰", label: "Finance", description: "Financial notes." },
  dreams: { icon: "🌙", label: "Dreams", description: "Dream logs and interpretations." },
  docs: { icon: "📋", label: "Docs", description: "Documentation and reference notes." },
}

export const dynamicParams = false

export async function generateStaticParams() {
  return Object.keys(CATEGORY_META).map(category => ({ category }))
}

const PER_PAGE = 100

export default async function NotesCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { category } = await params
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page || "1", 10))

  const meta = CATEGORY_META[category]
  if (!meta) notFound()

  const allNotes = await getFileTitlesFromGitHub(`personal/notes/${category}`)

  // Remap slugs to include the category prefix so links resolve correctly
  // e.g. slug "my-note" becomes "articles/my-note" -> /notes/articles/my-note
  const notes: NoteItem[] = allNotes.map((n) => ({
    ...n,
    slug: `${category}/${n.slug}`,
  }))

  const totalCount = notes.length
  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const offset = (currentPage - 1) * PER_PAGE
  const pageNotes = notes.slice(offset, offset + PER_PAGE)

  return (
    <div>
      <PagePathStatic path={`notes/${category}`} />
      <div className="mb-4">
        <Link
          href="/notes"
          className="text-xs text-notion-muted hover:text-notion-accent font-mono transition-colors"
        >
          ← notes
        </Link>
      </div>
      <PageHeader
        icon={meta.icon}
        title={meta.label}
        description={`${meta.description} ${totalCount} notes.`}
      />
      {pageNotes.length > 0 ? (
        <NotesFilter
          notes={pageNotes}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
        />
      ) : (
        <EmptyState
          icon={meta.icon}
          message={`No ${meta.label.toLowerCase()} notes yet`}
        />
      )}
    </div>
  )
}
