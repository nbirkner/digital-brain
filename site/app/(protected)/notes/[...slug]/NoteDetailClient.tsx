"use client"

import { useState } from "react"
import InlineBodyEditor from "@/components/features/editors/InlineBodyEditor"
import InlineFrontmatterEditor from "@/components/features/editors/InlineFrontmatterEditor"
import Link from "next/link"
import { getTagDef } from "@/lib/tag-taxonomy"

interface Props {
  slugPath: string
  initialFrontmatter: Record<string, string>
  initialBody: string
  displayTitle: string
  autoTags?: string[]
  prevSlug: string | null
  nextSlug: string | null
  prevTitle: string | null
  nextTitle: string | null
}

export default function NoteDetailClient({
  slugPath,
  initialFrontmatter,
  initialBody,
  displayTitle,
  autoTags,
  prevSlug,
  nextSlug,
  prevTitle,
  nextTitle,
}: Props) {
  const [frontmatter, setFrontmatter] = useState(initialFrontmatter)
  const [body, setBody] = useState(initialBody)
  const filePath = `personal/notes/${slugPath}.md`
  const title = frontmatter.title || displayTitle

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-notion-text tracking-tight">{title}</h1>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
          {(frontmatter.date !== undefined) && (
            <>
              <span className="text-notion-muted/30 text-xs">·</span>
              <InlineFrontmatterEditor
                filePath={filePath}
                field="date"
                value={frontmatter.date || ""}
                type="date"
                onSave={(v) => setFrontmatter((f) => ({ ...f, date: v }))}
              />
            </>
          )}
          {(frontmatter.type !== undefined) && (
            <>
              <span className="text-notion-muted/30 text-xs">·</span>
              <InlineFrontmatterEditor
                filePath={filePath}
                field="type"
                value={frontmatter.type || ""}
                type="text"
                onSave={(v) => setFrontmatter((f) => ({ ...f, type: v }))}
              />
            </>
          )}
          {(frontmatter.tags !== undefined) && (
            <>
              <span className="text-notion-muted/30 text-xs">·</span>
              <InlineFrontmatterEditor
                filePath={filePath}
                field="tags"
                value={frontmatter.tags || ""}
                type="tags"
                onSave={(v) => setFrontmatter((f) => ({ ...f, tags: v }))}
              />
            </>
          )}
        </div>
        {autoTags && autoTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {autoTags.map((tagId) => {
              const def = getTagDef(tagId)
              return (
                <Link
                  key={tagId}
                  href={`/labels/${tagId}`}
                  className={`inline-flex items-center rounded-md font-medium px-2 py-1 text-xs transition-opacity hover:opacity-80 ${def.color}`}
                  title={`${def.category}: ${def.label}`}
                >
                  {def.label}
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <InlineBodyEditor
        filePath={filePath}
        frontmatter={frontmatter}
        body={body}
        onSave={setBody}
        emptyText="Nothing here yet. Click to add..."
      />

      {(prevSlug || nextSlug) && (
        <div className="mt-12 pt-6 border-t border-notion-border flex items-center justify-between">
          {prevSlug ? (
            <Link href={`/notes/${prevSlug}`} className="group flex items-center gap-2 text-sm text-notion-muted hover:text-notion-text transition-colors max-w-[45%]">
              <span className="text-notion-muted/50">←</span>
              <div className="min-w-0">
                <div className="text-[10px] text-notion-muted/50 uppercase tracking-wider mb-0.5">Previous</div>
                <div className="truncate group-hover:text-notion-accent transition-colors">{prevTitle}</div>
              </div>
            </Link>
          ) : <div />}
          {nextSlug ? (
            <Link href={`/notes/${nextSlug}`} className="group flex items-center gap-2 text-sm text-notion-muted hover:text-notion-text transition-colors text-right max-w-[45%]">
              <div className="min-w-0">
                <div className="text-[10px] text-notion-muted/50 uppercase tracking-wider mb-0.5">Next</div>
                <div className="truncate group-hover:text-notion-accent transition-colors">{nextTitle}</div>
              </div>
              <span className="text-notion-muted/50">→</span>
            </Link>
          ) : <div />}
        </div>
      )}
    </>
  )
}
