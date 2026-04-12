"use client"

import { useState } from "react"
import Link from "next/link"

const PAGE_SIZE = 10

// --- Types ---

export interface NoteEntry {
  filePath: string
  title: string
  date: string
  href: string
}

export interface DocEntry {
  filePath: string
  title: string
  date: string
  href: string
  docType: string
  docTypeStyle: string
}

export interface TaskEntry {
  id: string
  content: string
  dueDate: string
  priorityClass: string
}

// --- Collapsible section with "show more" ---

function Section({
  title,
  total,
  defaultOpen = true,
  children,
}: {
  title: string
  total: number
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 border-b border-notion-border/20 mb-2 pb-1"
      >
        <svg
          className={`w-3 h-3 text-notion-muted/40 transition-transform ${open ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-notion-muted/40">
          {title}
        </span>
        <span className="text-[10px] font-mono text-notion-muted/30">
          {total}
        </span>
      </button>
      {open && children}
    </section>
  )
}

function ShowMoreList<T>({
  items,
  emptyMessage,
  renderItem,
}: {
  items: T[]
  emptyMessage: string
  renderItem: (item: T) => React.ReactNode
}) {
  const [expanded, setExpanded] = useState(false)

  if (items.length === 0) {
    return <p className="text-sm text-notion-muted/50 px-3 py-2">{emptyMessage}</p>
  }

  const needsToggle = items.length > PAGE_SIZE
  const visible = expanded ? items : items.slice(0, PAGE_SIZE)
  const hiddenCount = items.length - PAGE_SIZE

  return (
    <>
      <ul>{visible.map(renderItem)}</ul>
      {needsToggle && (
        <div className="flex justify-center pt-1 pb-1">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-notion-muted hover:text-notion-text bg-notion-hover/60 hover:bg-notion-hover rounded-full transition-all active:scale-95"
          >
            {expanded ? "Show less" : `Show all ${hiddenCount} more`}
            <svg className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
    </>
  )
}

// --- Main client component ---

interface LabelDetailClientProps {
  tasks: TaskEntry[]
  notes: NoteEntry[]
  docs: DocEntry[]
}

export default function LabelDetailClient({ tasks, notes, docs }: LabelDetailClientProps) {
  return (
    <div className="space-y-2">
      <Section title="Tasks" total={tasks.length} defaultOpen>
        <ShowMoreList
          items={tasks}
          emptyMessage="No tasks with this label"
          renderItem={(task) => (
            <li key={task.id}>
              <Link
                href={`/tasks?taskId=${task.id}`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-notion-hover transition-colors"
              >
                <span className={`text-xs ${task.priorityClass}`}>●</span>
                <span className="text-sm text-notion-text truncate flex-1">{task.content}</span>
                {task.dueDate && (
                  <span className="text-xs font-mono text-notion-muted/60 tabular-nums shrink-0">
                    {task.dueDate}
                  </span>
                )}
              </Link>
            </li>
          )}
        />
      </Section>

      <Section title="Notes" total={notes.length} defaultOpen>
        <ShowMoreList
          items={notes}
          emptyMessage="No notes with this label"
          renderItem={(note) => (
            <li key={note.filePath}>
              <Link
                href={note.href}
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-notion-hover transition-colors"
              >
                <span className="text-sm text-notion-text truncate">{note.title}</span>
                {note.date && (
                  <span className="text-xs font-mono text-notion-muted/60 tabular-nums ml-3 shrink-0">
                    {note.date}
                  </span>
                )}
              </Link>
            </li>
          )}
        />
      </Section>

      <Section title="Docs" total={docs.length} defaultOpen>
        <ShowMoreList
          items={docs}
          emptyMessage="No docs with this label"
          renderItem={(doc) => (
            <li key={doc.filePath}>
              <Link
                href={doc.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-notion-hover transition-colors"
              >
                <span className="text-sm text-notion-text truncate flex-1">{doc.title}</span>
                {doc.date && (
                  <span className="text-xs font-mono text-notion-muted/60 tabular-nums shrink-0">
                    {doc.date}
                  </span>
                )}
              </Link>
            </li>
          )}
        />
      </Section>
    </div>
  )
}
