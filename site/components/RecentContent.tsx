"use client"

import { useState } from "react"
import Link from "next/link"
import TagPill from "@/components/TagPill"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NoteItem {
  title: string
  date: string
  href: string
  key: string
}

export interface DocItem {
  title: string
  date: string | null
  href: string
  filePath: string
  autoTags: string[]
}

export interface RecentContentProps {
  notes: NoteItem[]
  docs: DocItem[]
  notesHref: string
  docsHref: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SKIP_TAGS = new Set(["work", "personal", "doc"])

function formatShortDate(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00Z" : ""))
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
}

function firstContentTag(autoTags: string[]): string | null {
  return autoTags.find((t) => !SKIP_TAGS.has(t)) ?? null
}

// ─── Collapsible section ──────────────────────────────────────────────────────

function Section({
  title,
  total,
  seeAllHref,
  children,
}: {
  title: string
  total: number
  seeAllHref: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)

  return (
    <section>
      <div className="flex items-center border-b border-notion-border/20 mb-2 pb-1">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 flex-1 min-w-0"
        >
          <svg
            className={`w-3 h-3 text-notion-muted/40 transition-transform shrink-0 ${open ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-notion-muted/40">
            {title}
          </span>
          <span className="text-[10px] font-mono text-notion-muted/30">{total}</span>
        </button>
        <Link
          href={seeAllHref}
          className="text-[10px] text-notion-muted/50 hover:text-notion-accent transition-colors shrink-0 ml-2"
        >
          See all →
        </Link>
      </div>
      {open && children}
    </section>
  )
}

// ─── Client component (accepts pre-fetched props) ─────────────────────────────

export default function RecentContent({ notes, docs, notesHref, docsHref }: RecentContentProps) {
  return (
    <div className="space-y-6">
      {notes.length > 0 && (
        <Section title="Notes" total={notes.length} seeAllHref={notesHref}>
          <ul>
            {notes.map((note) => (
              <li key={note.key}>
                <Link
                  href={note.href}
                  className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-notion-hover transition-colors group"
                >
                  <span className="text-sm text-notion-text truncate">{note.title}</span>
                  {note.date && (
                    <span className="text-xs text-notion-muted/50 font-mono shrink-0">
                      {formatShortDate(note.date)}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {docs.length > 0 && (
        <Section title="Docs" total={docs.length} seeAllHref={docsHref}>
          <ul>
            {docs.map((doc) => {
              const tag = firstContentTag(doc.autoTags)
              return (
                <li key={doc.filePath}>
                  <Link
                    href={doc.href}
                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-notion-hover transition-colors group"
                  >
                    <span className="text-sm text-notion-text truncate flex-1">{doc.title}</span>
                    {tag && (
                      <TagPill tagId={tag} href={"/labels/" + tag} size="sm" />
                    )}
                    {doc.date && (
                      <span className="text-xs text-notion-muted/50 font-mono shrink-0">
                        {formatShortDate(doc.date)}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </Section>
      )}
    </div>
  )
}

// ─── Server component — fetches data, passes to client ───────────────────────

import { getMarkdownFilesIndex } from "@/lib/content"
import { getWorkDocsMeta, getAllDocsMeta } from "@/lib/docs"

function extractDate(slug: string, frontmatter: Record<string, string>): string {
  const d = frontmatter.date ?? frontmatter.created ?? ""
  if (d) return d
  const m = slug.match(/(\d{4}-\d{2}-\d{2})/)
  return m ? m[1] : ""
}

export function RecentContentServer({ domain }: { domain: "work" | "personal" | "all" }) {
  // Notes
  const workNoteFiles =
    domain === "work" || domain === "all"
      ? getMarkdownFilesIndex("work/notes").map((f) => {
          const cat = (f.frontmatter.category as string) ?? "work"
          // URL-encode each path segment so # and emoji don't break browser navigation.
          const encodedSlug = f.slug.split("/").map(encodeURIComponent).join("/")
          const href = cat === "personal" ? `/meetings/${encodedSlug}` : `/work/meetings/${encodedSlug}`
          return {
            title: f.displayTitle,
            date: extractDate(f.slug, f.frontmatter),
            href,
            key: `work:${f.slug}`,
          }
        })
      : []

  const personalNoteFiles =
    domain === "personal" || domain === "all"
      ? getMarkdownFilesIndex("personal/notes").map((f) => {
          const cat = (f.frontmatter.category as string) ?? "personal"
          // URL-encode each path segment so # and emoji don't break browser navigation.
          const encodedSlug = f.slug.split("/").map(encodeURIComponent).join("/")
          const href = cat === "work" ? `/work/meetings/${encodedSlug}` : `/meetings/${encodedSlug}`
          return {
            title: f.displayTitle,
            date: extractDate(f.slug, f.frontmatter),
            href,
            key: `personal:${f.slug}`,
          }
        })
      : []

  const notes = [...workNoteFiles, ...personalNoteFiles]
    .filter((n) => !!n.date)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)

  // Docs
  const rawDocs =
    domain === "work"
      ? getWorkDocsMeta()
      : domain === "personal"
        ? getAllDocsMeta().filter((d) => d.domain === "personal")
        : getAllDocsMeta()

  const docs = rawDocs
    .filter((d) => !!d.date)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
    .slice(0, 5)
    .map((d) => ({
      title: d.title,
      date: d.date,
      href: `/docs/${d.filePath.replace(/\.md$/, "")}`,
      filePath: d.filePath,
      autoTags: d.autoTags,
    }))

  // "See all" hrefs — notes always use /notes, docs use domain-specific
  const notesHref = "/notes"
  const docsHref =
    domain === "work" ? "/work/docs" : domain === "personal" ? "/personal/docs" : "/docs"

  return <RecentContent notes={notes} docs={docs} notesHref={notesHref} docsHref={docsHref} />
}
