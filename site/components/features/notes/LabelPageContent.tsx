import { getMarkdownFiles } from "@/lib/content"
import type { ContentFile } from "@/lib/content"
import { getAllTasks } from "@/lib/todoist"
import LabelDetailClient from "@/app/(protected)/labels/[tagId]/LabelDetailClient"
import type { NoteEntry, DocEntry, TaskEntry } from "@/app/(protected)/labels/[tagId]/LabelDetailClient"

// --- Helpers ---

function extractDate(file: ContentFile): string {
  const fromFm = file.frontmatter.date ?? file.frontmatter.created
  if (fromFm) return fromFm
  const match = file.slug.match(/(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : ""
}

function formatDateShort(dateStr: string): string {
  if (!dateStr) return ""
  try {
    const d = new Date(`${dateStr}T12:00:00`)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  } catch {
    return dateStr
  }
}

function noteHref(file: ContentFile, defaultCategory: "work" | "personal" | "shared"): string {
  const category = (file.frontmatter.category as string) ?? defaultCategory
  if (category === "work") return `/work/meetings/${file.slug}`
  return `/meetings/${file.slug}`
}

function inferDocType(filePath: string): string {
  if (filePath.includes("/prds/")) return "PRD"
  if (filePath.includes("/decisions/")) return "Decision"
  if (filePath.includes("/analyses/")) return "Analysis"
  if (filePath.includes("/comms/")) return "Comms"
  if (filePath.includes("/roadmaps/")) return "Roadmap"
  if (filePath.includes("/career/")) return "Career"
  if (filePath.includes("/research/")) return "Research"
  return "Doc"
}

const DOC_TYPE_COLORS: Record<string, string> = {
  PRD: "bg-sky-500/20 text-sky-400",
  Decision: "bg-amber-500/20 text-amber-400",
  Analysis: "bg-violet-500/20 text-violet-400",
  Comms: "bg-green-500/20 text-green-400",
  Roadmap: "bg-blue-500/20 text-blue-400",
  Career: "bg-pink-500/20 text-pink-400",
  Research: "bg-teal-500/20 text-teal-400",
  Doc: "bg-gray-500/20 text-gray-400",
}

const PRIORITY_CLASSES: Record<number, string> = {
  4: "text-red-400",
  3: "text-orange-400",
  2: "text-yellow-400",
  1: "text-notion-muted/40",
}

// --- Server component ---

interface LabelPageContentProps {
  tagId: string
}

export default async function LabelPageContent({ tagId }: LabelPageContentProps) {
  // Notes
  const workMeetings = getMarkdownFiles("work/notes")
  const personalMeetings = getMarkdownFiles("personal/notes")
  const noteItems: NoteEntry[] = [
    ...workMeetings.filter((f) => f.autoTags.includes(tagId)).map((f) => ({ file: f, category: "work" as const })),
    ...personalMeetings.filter((f) => f.autoTags.includes(tagId)).map((f) => ({ file: f, category: "personal" as const })),
  ]
    .sort((a, b) => extractDate(b.file).localeCompare(extractDate(a.file)))
    .map(({ file, category }) => ({
      filePath: file.filePath,
      title: file.displayTitle,
      date: formatDateShort(extractDate(file)),
      href: noteHref(file, category),
    }))

  // Docs
  const workFiles = getMarkdownFiles("work/docs")
  const personalFiles = getMarkdownFiles("personal/docs")

  const docItems: DocEntry[] = [...workFiles, ...personalFiles]
    .filter((f) => !f.filePath.includes("/meetings/") && !f.filePath.includes("/logs/"))
    .filter((f) => f.autoTags.includes(tagId))
    .sort((a, b) => extractDate(b).localeCompare(extractDate(a)))
    .map((file) => {
      const docType = inferDocType(file.filePath)
      return {
        filePath: file.filePath,
        title: file.displayTitle,
        date: formatDateShort(extractDate(file)),
        href: `/docs/${file.filePath.replace(/\.md$/, "")}`,
        docType,
        docTypeStyle: DOC_TYPE_COLORS[docType] ?? DOC_TYPE_COLORS.Doc,
      }
    })

  // Tasks
  const allTasks = await getAllTasks()
  const taskItems: TaskEntry[] = allTasks
    .filter((t) => t.labels?.some((l) => l.toLowerCase().replace(/\s+/g, "-") === tagId))
    .sort((a, b) => {
      const aDate = a.due?.date ?? "9999"
      const bDate = b.due?.date ?? "9999"
      return aDate.localeCompare(bDate)
    })
    .map((t) => ({
      id: t.id,
      content: t.content,
      dueDate: t.due ? formatDateShort(t.due.date) : "",
      priorityClass: PRIORITY_CLASSES[t.priority] ?? PRIORITY_CLASSES[1],
    }))

  // Skip rendering if there's nothing to show
  if (taskItems.length === 0 && noteItems.length === 0 && docItems.length === 0) {
    return null
  }

  return (
    <div className="mt-12 pt-8 border-t border-notion-border">
      <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-notion-muted/50 mb-4">
        Related
      </h2>
      <LabelDetailClient tasks={taskItems} notes={noteItems} docs={docItems} />
    </div>
  )
}
