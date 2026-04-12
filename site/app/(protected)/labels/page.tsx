import PageHeader from "@/components/layout/PageHeader"
import { TAGS_BY_CATEGORY, TagCategory } from "@/lib/tag-taxonomy"
import { getAllDocsMeta } from "@/lib/docs"
import { getMarkdownFiles } from "@/lib/content"
import TagPill from "@/components/ui/TagPill"

const CATEGORY_LABELS: Record<TagCategory, string> = {
  area: "Area",
  type: "Type",
  "work-area": "Team",
  "meeting-type": "Meetings",
}

function buildTagCounts(): Record<string, number> {
  const counts: Record<string, number> = {}
  const docs = getAllDocsMeta()
  const workNotes = getMarkdownFiles("work/notes")
  const personalNotes = getMarkdownFiles("personal/notes")

  for (const doc of docs) {
    for (const tag of doc.autoTags ?? []) {
      counts[tag] = (counts[tag] ?? 0) + 1
    }
  }
  for (const note of [...workNotes, ...personalNotes]) {
    for (const tag of note.autoTags ?? []) {
      counts[tag] = (counts[tag] ?? 0) + 1
    }
  }
  return counts
}

export default function LabelsPage() {
  const tagCounts = buildTagCounts()
  return (
    <div>
      <PageHeader
        icon="🏷️"
        title="Labels"
        description="All tags from the taxonomy, grouped by category."
      />

      <div className="space-y-8">
        {(Object.keys(TAGS_BY_CATEGORY) as TagCategory[]).map((category) => (
          <section key={category}>
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-notion-muted/40 mb-3 border-b border-notion-border/20 pb-2">
              {CATEGORY_LABELS[category]}
            </h2>
            <div className="flex flex-wrap gap-2">
              {TAGS_BY_CATEGORY[category].map((tag) => (
                <div key={tag.id} className="flex items-center gap-1.5">
                  <TagPill tagId={tag.id} href={`/labels/${tag.id}`} size="md" />
                  {tagCounts[tag.id] != null && tagCounts[tag.id] > 0 && (
                    <span className="text-[10px] opacity-60 font-normal">{tagCounts[tag.id]}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
