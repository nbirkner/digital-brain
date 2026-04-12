"use client"

import { useState } from "react"
import InlineBodyEditor from "@/components/features/editors/InlineBodyEditor"
import Link from "next/link"
import Breadcrumb from "@/components/ui/Breadcrumb"

interface Props {
  slugPath: string
  initialFrontmatter: Record<string, string>
  initialBody: string
  displayTitle: string
  prevSlug: string | null
  nextSlug: string | null
  prevTitle: string | null
  nextTitle: string | null
}

export default function GoalDetailClient({
  slugPath,
  initialFrontmatter,
  initialBody,
  displayTitle,
  prevSlug,
  nextSlug,
  prevTitle,
  nextTitle,
}: Props) {
  const [frontmatter] = useState(initialFrontmatter)
  const [body, setBody] = useState(initialBody)
  const title = frontmatter.title || displayTitle

  return (
    <>
      <Breadcrumb items={[{ label: "goals", href: "/goals" }, { label: title }]} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-notion-text tracking-tight">{title}</h1>
        <p className="text-xs text-notion-muted mt-1 font-mono">
          {slugPath}
          {frontmatter.date && ` · ${frontmatter.date}`}
          {frontmatter.timeframe && ` · ${frontmatter.timeframe}`}
        </p>
      </div>

      <InlineBodyEditor
        filePath={`personal/docs/growth/${slugPath}.md`}
        frontmatter={frontmatter}
        body={body}
        onSave={setBody}
        emptyText="No notes on this goal yet. Click to add..."
      />

      {(prevSlug || nextSlug) && (
        <div className="mt-12 pt-6 border-t border-notion-border flex items-center justify-between">
          {prevSlug ? (
            <Link href={`/goals/${prevSlug}`} className="group flex items-center gap-2 text-sm text-notion-muted hover:text-notion-text transition-colors max-w-[45%]">
              <span className="text-notion-muted/50">←</span>
              <div className="min-w-0">
                <div className="text-[10px] text-notion-muted/50 uppercase tracking-wider mb-0.5">Previous</div>
                <div className="truncate group-hover:text-notion-accent transition-colors">{prevTitle}</div>
              </div>
            </Link>
          ) : <div />}
          {nextSlug ? (
            <Link href={`/goals/${nextSlug}`} className="group flex items-center gap-2 text-sm text-notion-muted hover:text-notion-text transition-colors text-right max-w-[45%]">
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
