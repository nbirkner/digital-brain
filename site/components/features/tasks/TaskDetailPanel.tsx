"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import Link from "next/link"
import { marked } from "marked"
import { sanitizeHtml } from "@/lib/sanitize-html"
import { TodoistTask } from "@/lib/todoist"
import PropertyDropdown from "@/components/data/PropertyDropdown"
import { DueDateField } from "@/components/features/editors/DueDatePicker"
import { parseNoteRefsFromDescription, type NoteRef } from "@/lib/task-notes"
import { TAG_MAP, ALL_TAGS, getTagDef } from "@/lib/tag-taxonomy"
import TagPill from "@/components/ui/TagPill"
import { ProjectPill } from "@/components/features/tasks/TaskRow"

/** Map a Todoist label string to a taxonomy tag ID by normalized label comparison. */
function todoistLabelToTagId(label: string): string | null {
  const normalized = label.toLowerCase().replace(/[^a-z0-9]/g, "")
  return ALL_TAGS.find(
    (t) => t.label.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized
  )?.id ?? null
}

// Render task description markdown to HTML — lightweight, no prose plugin needed.
// GFM checkboxes (- [ ] / - [x]) are rendered as disabled inputs styled with Tailwind.
marked.use({ gfm: true, breaks: true })

function renderDescriptionMarkdown(text: string): string {
  try {
    return marked(text) as string
  } catch {
    return text
  }
}

type DeleteState = "idle" | "confirm" | "deleting"
type ReopenState = "idle" | "loading"
type CompleteState = "idle" | "loading"

interface LabelDropdownProps {
  activeLabels: string[]
  allLabels: string[]
  onToggle: (label: string) => void
  onClose: () => void
}

function LabelDropdown({ activeLabels, allLabels, onToggle, onClose }: LabelDropdownProps) {
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [onClose])

  const filtered = allLabels.filter((l) => {
    const displayName = getTagDef(l).label
    return displayName.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div
      ref={ref}
      className="absolute left-0 top-full mt-1 w-52 bg-notion-surface border border-notion-border rounded-lg shadow-xl py-1 z-50"
    >
      <div className="px-2 pb-1">
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose()
          }}
          placeholder="Search labels…"
          className="w-full bg-notion-bg border border-notion-border rounded px-2 py-1 text-xs text-notion-text placeholder:text-notion-muted/40 outline-none focus:border-notion-accent transition-colors"
        />
      </div>

      <div className="max-h-48 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="text-[11px] text-notion-muted/50 px-3 py-2">No labels found</p>
        )}
        {filtered.map((label) => {
          const displayName = getTagDef(label).label
          const checked = activeLabels.some(
            (l) => l === label || todoistLabelToTagId(l) === label
          )
          return (
            <button
              key={label}
              onClick={() => onToggle(label)}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-left hover:bg-notion-hover transition-colors group"
            >
              <span className={`w-3.5 h-3.5 flex-shrink-0 rounded-sm border flex items-center justify-center transition-colors ${
                checked
                  ? "bg-notion-accent border-notion-accent"
                  : "border-notion-border group-hover:border-notion-muted"
              }`}>
                {checked && (
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="text-[12px] text-notion-text">{displayName}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function formatShortDate(dateStr: string): string {
  if (!dateStr) return ""
  const [, m, d] = dateStr.split("-")
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}`
}

function NotesRow({ task, taskNotesIndex }: { task: TodoistTask; taskNotesIndex?: Record<string, NoteRef[]> }) {
  const notes = useMemo(() => {
    const descRefs = parseNoteRefsFromDescription(task.description ?? "")
    const indexRefs = taskNotesIndex?.[task.id] ?? []

    // Combine and deduplicate by href, with title fallback for same-note-different-path duplicates.
    // When the index has two entries for the same note (e.g. one from work/notes and one from
    // personal/notes), both hrefs are different but the titles match — only keep the work/ version.
    const seenHrefs = new Set<string>()
    const seenTitles = new Set<string>()
    const combined: Array<{ title: string; date: string; href: string }> = []

    // Sort indexRefs so work/ paths are preferred over personal/ when titles collide
    const sortedIndexRefs = [...indexRefs].sort((a, b) => {
      const aWork = a.href.startsWith("/work/") ? 0 : 1
      const bWork = b.href.startsWith("/work/") ? 0 : 1
      return aWork - bWork
    })

    for (const ref of sortedIndexRefs) {
      if (ref.href && !seenHrefs.has(ref.href) && !seenTitles.has(ref.title)) {
        seenHrefs.add(ref.href)
        seenTitles.add(ref.title)
        combined.push(ref)
      }
    }
    for (const ref of descRefs) {
      if (ref.href && !seenHrefs.has(ref.href) && !seenTitles.has(ref.title)) {
        seenHrefs.add(ref.href)
        seenTitles.add(ref.title)
        combined.push({ title: ref.title, date: "", href: ref.href })
      } else if (!ref.href) {
        // "From:" refs without hrefs, add if title not already present
        if (!combined.some((c) => c.title === ref.title)) {
          combined.push({ title: ref.title, date: "", href: "" })
        }
      }
    }

    return combined
  }, [task.id, task.description, taskNotesIndex])

  return (
    <div className="flex items-start gap-3">
      <span className="text-xs text-notion-muted w-16 flex-shrink-0 pt-0.5">Notes</span>
      <div className="flex flex-wrap items-center gap-1">
        {notes.length === 0 ? (
          <span className="text-[10px] text-notion-muted/40 italic">No linked notes</span>
        ) : (
          notes.map((note, i) => {
            const label = `\u{1F4DD} ${note.title}${note.date ? ` (${formatShortDate(note.date)})` : ""}`
            if (note.href) {
              return (
                <Link
                  key={note.href}
                  href={note.href}
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:border-blue-400/40 transition-colors"
                >
                  {label}
                </Link>
              )
            }
            return (
              <span
                key={`from-${i}`}
                className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400/60"
              >
                {label}
              </span>
            )
          })
        )}
      </div>
    </div>
  )
}

interface DescriptionFieldProps {
  value: string
  onChange: (v: string) => void
  onBlur: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
}

function DescriptionField({ value, onChange, onBlur, onKeyDown }: DescriptionFieldProps) {
  const [editing, setEditing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus()
      // Place cursor at end
      const len = textareaRef.current.value.length
      textareaRef.current.setSelectionRange(len, len)
    }
  }, [editing])

  const renderedHtml = useMemo(() => {
    if (!value.trim()) return ""
    return renderDescriptionMarkdown(value)
  }, [value])

  function handleBlur() {
    setEditing(false)
    onBlur()
  }

  return (
    <div className="space-y-1.5">
      <span className="text-xs text-notion-muted">Description</span>

      {editing ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
          rows={12}
          placeholder="Add a description..."
          className="bg-notion-surface border border-notion-accent rounded-lg p-3 text-sm text-notion-text placeholder:text-notion-muted/40 w-full outline-none resize-none transition-colors min-h-[200px]"
        />
      ) : (
        <div
          onClick={(e) => {
            // Don't enter edit mode when clicking a link — let the browser follow it
            if ((e.target as HTMLElement).closest("a")) return
            setEditing(true)
          }}
          className="min-h-[200px] bg-notion-surface border border-notion-border rounded-lg p-3 cursor-text hover:border-notion-border/80 transition-colors"
        >
          {renderedHtml ? (
            <div
              className="
                text-sm text-notion-text leading-relaxed [overflow-wrap:anywhere]
                [&_p]:mb-2 [&_p:last-child]:mb-0
                [&_ul]:mb-2 [&_ul]:space-y-0.5
                [&_ol]:mb-2 [&_ol]:space-y-0.5
                [&_li]:ml-4
                [&_ul>li]:list-disc [&_ul>li]:marker:text-notion-muted/60
                [&_ol>li]:list-decimal [&_ol>li]:marker:text-notion-muted/60
                [&_li:has(>input[type='checkbox'])]:list-none [&_li:has(>input[type='checkbox'])]:ml-0 [&_li:has(>input[type='checkbox'])]:flex [&_li:has(>input[type='checkbox'])]:items-start [&_li:has(>input[type='checkbox'])]:gap-2
                [&_input[type='checkbox']]:mt-[3px] [&_input[type='checkbox']]:flex-shrink-0 [&_input[type='checkbox']]:cursor-default [&_input[type='checkbox']]:accent-notion-accent [&_input[type='checkbox']]:w-3.5 [&_input[type='checkbox']]:h-3.5
                [&_strong]:font-semibold [&_strong]:text-notion-text
                [&_em]:italic [&_em]:text-notion-text/80
                [&_code]:text-[0.8em] [&_code]:font-mono [&_code]:bg-notion-bg [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:border [&_code]:border-notion-border/60
                [&_a]:text-notion-accent [&_a]:underline [&_a]:cursor-pointer
                [&_blockquote]:border-l-2 [&_blockquote]:border-notion-border [&_blockquote]:pl-3 [&_blockquote]:text-notion-muted
              "
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(renderedHtml) }}
            />
          ) : (
            <span className="text-sm text-notion-muted/40">Add a description...</span>
          )}
        </div>
      )}
    </div>
  )
}

interface SubtasksSectionProps {
  task: TodoistTask
  subtasks: TodoistTask[]
  onRefresh: () => void
  onOpenTask?: (task: TodoistTask) => void
}

function SubtasksSection({ task, subtasks, onRefresh, onOpenTask }: SubtasksSectionProps) {
  const [localSubtasks, setLocalSubtasks] = useState<TodoistTask[]>(subtasks)
  const [adding, setAdding] = useState(false)
  const [newContent, setNewContent] = useState("")
  const [completing, setCompleting] = useState<Set<string>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync incoming subtasks but keep any optimistically added ones
  useEffect(() => {
    setLocalSubtasks(prev => {
      // Keep any optimistically-added temp items not yet confirmed
      const tempItems = prev.filter(s => s.id.startsWith("temp-"))
      // Merge server items with temp items (temp items go at end)
      const serverIds = new Set(subtasks.map(s => s.id))
      const stillPendingTemps = tempItems.filter(t => !serverIds.has(t.id))
      return [...subtasks, ...stillPendingTemps]
    })
  }, [subtasks])

  useEffect(() => {
    if (adding) {
      inputRef.current?.focus()
    }
  }, [adding])

  async function handleComplete(subtask: TodoistTask) {
    setCompleting((prev) => new Set(prev).add(subtask.id))
    // Optimistically fade out, then remove
    setTimeout(() => {
      setLocalSubtasks((prev) => prev.filter((s) => s.id !== subtask.id))
      setCompleting((prev) => {
        const next = new Set(prev)
        next.delete(subtask.id)
        return next
      })
    }, 1500)
    try {
      await fetch(`/api/todoist/${subtask.id}/close`, { method: "POST" })
      setTimeout(() => onRefresh(), 1800)
    } catch {
      // already optimistically removed, refresh will restore it
    }
  }

  async function handleDelete(subtask: TodoistTask) {
    setLocalSubtasks((prev) => prev.filter((s) => s.id !== subtask.id))
    try {
      await fetch(`/api/todoist/${subtask.id}/delete`, { method: "POST" })
      setTimeout(() => onRefresh(), 500)
    } catch {
      // restore on failure
      setLocalSubtasks((prev) => [...prev, subtask])
    }
  }

  async function handleCreate() {
    const content = newContent.trim()
    if (!content) return

    // Optimistically add
    const tempId = `temp-${Date.now()}`
    const optimistic: TodoistTask = {
      id: tempId,
      content,
      priority: 1,
      project_id: task.project_id,
      url: "",
      parent_id: task.id,
    }
    setLocalSubtasks((prev) => [...prev, optimistic])
    setNewContent("")

    try {
      const res = await fetch("/api/todoist/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          parent_id: task.id,
          project_id: task.project_id,
          priority: 1,
        }),
      })
      if (res.ok) {
        const created = await res.json()
        // Replace temp with real
        setLocalSubtasks((prev) =>
          prev.map((s) => (s.id === tempId ? created : s))
        )
      } else {
        // Remove temp on failure
        setLocalSubtasks((prev) => prev.filter((s) => s.id !== tempId))
      }
    } catch {
      setLocalSubtasks((prev) => prev.filter((s) => s.id !== tempId))
    }
  }

  const count = localSubtasks.length

  return (
    <div className="space-y-2">
      <span className="text-xs text-notion-muted">
        Subtasks{count > 0 ? ` (${count})` : ""}
      </span>

      {localSubtasks.length > 0 && (
        <div className="space-y-0.5">
          {localSubtasks.map((subtask) => {
            const isCompleting = completing.has(subtask.id)
            return (
              <div
                key={subtask.id}
                className={`flex items-center gap-2 group py-1 transition-all duration-700 ${
                  isCompleting ? "opacity-30" : "opacity-100"
                }`}
              >
                {/* Circle checkbox */}
                <button
                  onClick={() => !isCompleting && handleComplete(subtask)}
                  disabled={isCompleting}
                  className="flex-shrink-0 w-3.5 h-3.5 rounded-full border border-notion-border/60 hover:border-notion-accent flex items-center justify-center transition-colors disabled:cursor-default"
                  aria-label={`Complete "${subtask.content}"`}
                >
                  {isCompleting && (
                    <svg className="w-2 h-2 text-notion-muted" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                {/* Content */}
                <span
                  onClick={() => !isCompleting && onOpenTask?.(subtask)}
                  className={`text-xs flex-1 min-w-0 truncate ${
                    isCompleting ? "line-through text-notion-muted/50" : "text-notion-text hover:text-notion-accent cursor-pointer transition-colors"
                  }`}
                >
                  {subtask.content}
                </span>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(subtask)}
                  className="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center text-notion-muted/40 hover:text-notion-muted opacity-0 group-hover:opacity-100 transition-all"
                  aria-label={`Delete "${subtask.content}"`}
                >
                  <span className="text-[11px] leading-none">×</span>
                </button>
              </div>
            )
          })}
        </div>
      )}

      {adding ? (
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-shrink-0 w-3.5 h-3.5 rounded-full border border-notion-border/40" />
          <input
            ref={inputRef}
            type="text"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); handleCreate() }
              if (e.key === "Escape") { setAdding(false); setNewContent("") }
            }}
            placeholder="Subtask name..."
            className="flex-1 bg-transparent border-b border-notion-border/40 focus:border-notion-accent outline-none text-xs text-notion-text placeholder:text-notion-muted/40 py-0.5 transition-colors"
          />
          <button
            onClick={handleCreate}
            disabled={!newContent.trim()}
            className="text-[10px] text-notion-accent hover:text-notion-accent/80 disabled:text-notion-muted/40 disabled:cursor-default transition-colors flex-shrink-0"
          >
            Add
          </button>
          <button
            onClick={() => { setAdding(false); setNewContent("") }}
            className="text-[10px] text-notion-muted/50 hover:text-notion-muted transition-colors flex-shrink-0"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-[11px] text-notion-muted/50 hover:text-notion-muted transition-colors mt-0.5"
        >
          <span className="text-[13px] leading-none">+</span>
          <span>Add subtask</span>
        </button>
      )}
    </div>
  )
}

const WORK_PROJECT_ID = "6gJQX58PhPc45mFV"
const PERSONAL_PROJECT_ID = "6gJQX59VjmrQFHMG"
const INBOX_PROJECT_ID = "6Crg96g4Vf64cf3W"

const PRIORITY_LABELS: Record<number, string> = { 4: "P1", 3: "P2", 2: "P3", 1: "P4" }
const PRIORITY_STYLES: Record<number, string> = {
  4: "text-red-500 border-red-500/30 bg-red-500/5",
  3: "text-orange-400 border-orange-400/30 bg-orange-400/5",
  2: "text-blue-400 border-blue-400/30 bg-blue-400/5",
  1: "text-notion-muted/50 border-notion-border/40 bg-transparent",
}

interface TaskDetailPanelProps {
  task: TodoistTask | null
  onClose: () => void
  onRefresh: () => void
  isCompleted?: boolean
  onReopen?: (id: string) => void
  onComplete?: (task: TodoistTask) => void
  waitingProjectId?: string | null
  sharedProjectId?: string | null
  taskNotesIndex?: Record<string, NoteRef[]>
  allTasks?: TodoistTask[]
  onOpenTask?: (task: TodoistTask) => void
}

export default function TaskDetailPanel({ task, onClose, onRefresh, isCompleted = false, onReopen, onComplete, waitingProjectId, sharedProjectId, taskNotesIndex, allTasks, onOpenTask }: TaskDetailPanelProps) {
  const [titleValue, setTitleValue] = useState("")
  const [descValue, setDescValue] = useState("")
  const [smartValue, setSmartValue] = useState("")
  const [optimisticPriority, setOptimisticPriority] = useState<number | null>(null)
  const [optimisticProjectId, setOptimisticProjectId] = useState<string | null>(null)
  const [deleteState, setDeleteState] = useState<DeleteState>("idle")
  const [reopenState, setReopenState] = useState<ReopenState>("idle")
  const [completeState, setCompleteState] = useState<CompleteState>("idle")
  const [optimisticLabels, setOptimisticLabels] = useState<string[] | null>(null)
  const [labelDropdownOpen, setLabelDropdownOpen] = useState(false)

  const titleRef = useRef<HTMLTextAreaElement>(null)
  const savedTitle = useRef<string>("")
  const savedDesc = useRef<string>("")
  const lastFocusRef = useRef<Element | null>(null)
  const prevTaskRef = useRef<TodoistTask | null>(null)

  // Restore focus when panel closes
  useEffect(() => {
    if (prevTaskRef.current && !task) {
      if (lastFocusRef.current instanceof HTMLElement) {
        lastFocusRef.current.focus()
      }
    }
    prevTaskRef.current = task
  }, [task])

  // Reset state when task changes (including when task goes null then back to same id)
  useEffect(() => {
    if (!task) {
      // Reset transient UI state when panel closes so stale state doesn't show on reopen
      setDeleteState("idle")
      setReopenState("idle")
      setCompleteState("idle")
      setLabelDropdownOpen(false)
      return
    }
    // Capture which element was focused before panel opened so we can restore it on close
    lastFocusRef.current = document.activeElement
    setTitleValue(task.content)
    setDescValue(task.description ?? "")
    setOptimisticPriority(null)
    setOptimisticProjectId(null)
    setDeleteState("idle")
    setReopenState("idle")
    setCompleteState("idle")
    setOptimisticLabels(null)
    setLabelDropdownOpen(false)
    savedTitle.current = task.content
    savedDesc.current = task.description ?? ""
    // Auto-size title textarea after content loads
    // Use a short delay to allow the slide-in transition to complete before measuring scrollHeight
    const timer = setTimeout(() => {
      if (titleRef.current) {
        titleRef.current.style.height = "auto"
        titleRef.current.style.height = titleRef.current.scrollHeight + "px"
      }
    }, 50)
    return () => clearTimeout(timer)
  }, [task?.id])

  const LABEL_HIDDEN = new Set(["triage", "note", "work", "personal"])
  const allLabels = ALL_TAGS.filter((t) => !LABEL_HIDDEN.has(t.id)).map((t) => t.id)

  const patchTask = useCallback(
    async (body: { content?: string; description?: string; priority?: number; project_id?: string; due_string?: string; labels?: string[] }) => {
      try {
        const res = await fetch(`/api/todoist/${task?.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (!res.ok) { console.warn(`[patchTask] Failed: ${res.status}`); return }
        setTimeout(() => onRefresh(), 500)
      } catch (err) {
        console.warn("[patchTask] Network error:", err)
      }
    },
    [task?.id, onRefresh]
  )

  const handleTitleBlur = useCallback(() => {
    if (!task) return
    const trimmed = titleValue.trim()
    if (trimmed && trimmed !== savedTitle.current) {
      savedTitle.current = trimmed
      patchTask({ content: trimmed })
    }
  }, [task, titleValue, patchTask])

  const handlePriorityChange = useCallback(
    (value: string | number) => {
      const priority = Number(value)
      setOptimisticPriority(priority)
      patchTask({ priority })
    },
    [patchTask]
  )

  const handleProjectChange = useCallback(
    (value: string | number) => {
      const project_id = String(value)
      setOptimisticProjectId(project_id)
      patchTask({ project_id })
    },
    [patchTask]
  )

  const handleDescBlur = useCallback(() => {
    if (!task) return
    if (descValue !== savedDesc.current) {
      savedDesc.current = descValue
      patchTask({ description: descValue })
    }
  }, [task, descValue, patchTask])

  const handleDescKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Escape") {
        setDescValue(savedDesc.current)
        e.currentTarget.blur()
      }
    },
    []
  )

  const handleDelete = useCallback(async () => {
    if (!task) return
    setDeleteState("deleting")
    try {
      const res = await fetch(`/api/todoist/${task.id}/delete`, { method: "POST" })
      if (!res.ok) { console.warn(`[handleDelete] Failed: ${res.status}`); setDeleteState("idle"); return }
      onClose()
      setTimeout(() => onRefresh(), 300)
    } catch (err) {
      console.warn("[handleDelete] Network error:", err)
      setDeleteState("idle")
    }
  }, [task, onClose, onRefresh])

  const handleReopen = useCallback(async () => {
    if (!task) return
    setReopenState("loading")
    try {
      const res = await fetch(`/api/todoist/${task.id}/reopen`, { method: "POST" })
      if (!res.ok) { console.warn(`[handleReopen] Failed: ${res.status}`); setReopenState("idle"); return }
      onReopen?.(task.id)
      onClose()
      setTimeout(() => onRefresh(), 300)
    } catch (err) {
      console.warn("[handleReopen] Network error:", err)
      setReopenState("idle")
    }
  }, [task, onReopen, onClose, onRefresh])

  const handleComplete = useCallback(async () => {
    if (!task) return
    setCompleteState("loading")
    try {
      const res = await fetch(`/api/todoist/${task.id}/close`, { method: "POST" })
      if (!res.ok) { console.warn(`[handleComplete] Failed: ${res.status}`); setCompleteState("idle"); return }
      onComplete?.(task)
      onClose()
      setTimeout(() => onRefresh(), 300)
    } catch (err) {
      console.warn("[handleComplete] Network error:", err)
      setCompleteState("idle")
    }
  }, [task, onComplete, onClose, onRefresh])

  // Keyboard shortcuts for panel — must be after handleComplete declaration
  useEffect(() => {
    if (!task) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return }
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) return
      if (e.key === "e" && !isCompleted) {
        e.preventDefault()
        handleComplete()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [task, onClose, handleComplete, isCompleted])

  const handleLabelToggle = useCallback(
    (label: string) => {
      const current = optimisticLabels ?? task?.labels ?? []
      const newLabels = current.includes(label)
        ? current.filter((l) => l !== label)
        : [...current, label]
      setOptimisticLabels(newLabels)
      patchTask({ labels: newLabels })
    },
    [optimisticLabels, task?.labels, patchTask]
  )

const activePriority = optimisticPriority ?? task?.priority ?? 1
  const activeProjectId = optimisticProjectId ?? task?.project_id ?? ""
  const activeLabels = optimisticLabels ?? task?.labels ?? []

  function parseSmartInput(text: string): { priority?: number; due_string?: string } {
    const result: { priority?: number; due_string?: string } = {}
    const prioMatch = text.match(/\bp([1-4])\b/i)
    if (prioMatch) result.priority = 5 - parseInt(prioMatch[1]) // p1→4, p2→3, p3→2, p4→1
    const lower = text.toLowerCase()
    if (/\btoday\b/.test(lower)) result.due_string = "today"
    else if (/\btomorrow\b/.test(lower)) result.due_string = "tomorrow"
    else if (/\bthis weekend\b/.test(lower)) result.due_string = "this weekend"
    else if (/\bnext week\b/.test(lower)) result.due_string = "next week"
    else if (/\bmonday\b|\bmon\b/.test(lower)) result.due_string = "monday"
    else if (/\btuesday\b|\btue\b/.test(lower)) result.due_string = "tuesday"
    else if (/\bwednesday\b|\bwed\b/.test(lower)) result.due_string = "wednesday"
    else if (/\bthursday\b|\bthu\b/.test(lower)) result.due_string = "thursday"
    else if (/\bfriday\b|\bfri\b/.test(lower)) result.due_string = "friday"
    else if (/\bsaturday\b|\bsat\b/.test(lower)) result.due_string = "saturday"
    else if (/\bsunday\b|\bsun\b/.test(lower)) result.due_string = "sunday"
    return result
  }

  function handleSmartSubmit() {
    const parsed = parseSmartInput(smartValue.trim())
    if (Object.keys(parsed).length === 0) return
    if (parsed.priority !== undefined) setOptimisticPriority(parsed.priority)
    patchTask(parsed)
    setSmartValue("")
  }

  const isOpen = task !== null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-200 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-80 md:w-96 flex flex-col bg-notion-bg border-l border-notion-border shadow-2xl transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Task detail"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-notion-border flex-shrink-0">
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded text-notion-muted hover:text-notion-text hover:bg-notion-hover transition-colors text-lg font-medium"
            aria-label="Close panel"
          >
            ×
          </button>
          {task && (
            <a
              href={`https://app.todoist.com/app/task/${task.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-notion-muted hover:text-notion-accent transition-colors py-2 px-1 -my-2"
            >
              Open in Todoist
              <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 2H2v8h8V7M7 2h3v3M10 2L5.5 6.5" />
              </svg>
            </a>
          )}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {task && (
            <>
              {/* Title with checkbox */}
              <div className="flex items-start gap-3">
                {/* Priority-colored circular checkbox */}
                {(() => {
                  if (isCompleted) {
                    return (
                      <button
                        onClick={handleReopen}
                        disabled={reopenState === "loading"}
                        className="flex-shrink-0 mt-1 w-[18px] h-[18px] rounded-full bg-notion-muted/40 border border-notion-muted/40 flex items-center justify-center transition-colors hover:bg-notion-muted/30 disabled:opacity-50"
                        aria-label="Reopen task"
                      >
                        <svg className="w-2.5 h-2.5 text-notion-bg" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    )
                  }
                  return (
                    <button
                      onClick={handleComplete}
                      disabled={completeState === "loading"}
                      className="flex-shrink-0 mt-1 w-[18px] h-[18px] rounded-full border-2 border-notion-border/60 hover:bg-notion-hover flex items-center justify-center transition-colors disabled:opacity-50"
                      aria-label="Complete task"
                    />
                  )
                })()}

                <textarea
                  ref={titleRef}
                  value={titleValue}
                  onChange={(e) => {
                    setTitleValue(e.target.value)
                    e.target.style.height = "auto"
                    e.target.style.height = e.target.scrollHeight + "px"
                  }}
                  onBlur={handleTitleBlur}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      titleRef.current?.blur()
                    }
                    if (e.key === "Escape") {
                      setTitleValue(savedTitle.current)
                      titleRef.current?.blur()
                    }
                  }}
                  rows={1}
                  className={`text-lg font-semibold bg-transparent border-none outline-none w-full resize-none overflow-hidden break-words ${
                    isCompleted ? "line-through text-notion-muted/50" : "text-notion-text"
                  }`}
                  aria-label="Task title"
                />
              </div>

              {/* Smart set */}
              <input
                type="text"
                value={smartValue}
                onChange={(e) => setSmartValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); handleSmartSubmit() }
                  if (e.key === "Escape") setSmartValue("")
                }}
                placeholder="Quick set: tomorrow p2, next week p1…"
                className="w-full bg-notion-surface border border-notion-border rounded-lg px-3 py-2 text-xs text-notion-text placeholder:text-notion-muted/40 outline-none focus:border-notion-accent transition-colors"
              />

              {/* Properties grid */}
              <div className="space-y-3">
                {/* Priority */}
                <div className="grid grid-cols-[4.5rem_1fr] items-center gap-3">
                  <span className="text-xs text-notion-muted">Priority</span>
                  <PropertyDropdown
                    value={activePriority}
                    onChange={handlePriorityChange}
                    options={[
                      { label: "P1 — Urgent", value: 4, className: "text-red-400" },
                      { label: "P2 — High",   value: 3, className: "text-orange-400" },
                      { label: "P3 — Medium", value: 2, className: "text-blue-400" },
                      { label: "P4 — None",   value: 1 },
                    ]}
                    trigger={
                      <span className={`text-xs font-semibold px-2 py-1 rounded border ${PRIORITY_STYLES[activePriority]}`}>
                        {PRIORITY_LABELS[activePriority]}
                      </span>
                    }
                  />
                </div>

                {/* Project */}
                <div className="grid grid-cols-[4.5rem_1fr] items-center gap-3">
                  <span className="text-xs text-notion-muted">Project</span>
                  <PropertyDropdown
                    value={activeProjectId}
                    onChange={handleProjectChange}
                    options={[
                      { label: "Work",        value: WORK_PROJECT_ID },
                      { label: "Personal",    value: PERSONAL_PROJECT_ID },
                      ...(sharedProjectId ? [{ label: "Shared", value: sharedProjectId }] : []),
                      ...(waitingProjectId ? [{ label: "Waiting For", value: waitingProjectId }] : []),
                    ]}
                    trigger={
                      <ProjectPill
                        projectId={activeProjectId}
                        sharedProjectId={sharedProjectId}
                      />
                    }
                  />
                </div>

                {/* Due */}
                <div className="grid grid-cols-[4.5rem_1fr] items-center gap-3">
                  <span className="text-xs text-notion-muted">Due</span>
                  <DueDateField task={task} onSave={(due_string) => patchTask({ due_string })} />
                </div>

                {/* Labels */}
                <div className="grid grid-cols-[4.5rem_1fr] items-start gap-3">
                  <span className="text-xs text-notion-muted pt-[3px]">Labels</span>
                  <div className="flex flex-wrap items-center gap-1 relative">
                    {activeLabels.map((label) => {
                      const tagId = todoistLabelToTagId(label)
                      const tagDef = tagId ? TAG_MAP[tagId] : null
                      if (tagId && tagDef) {
                        return (
                          <TagPill key={label} tagId={tagId} href={`/labels/${tagId}`} size="sm" />
                        )
                      }
                      return (
                        <button
                          key={label}
                          onClick={() => handleLabelToggle(label)}
                          title={`Remove "${label}"`}
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-notion-surface border border-notion-border text-notion-muted hover:border-notion-accent cursor-pointer transition-colors"
                        >
                          {label}
                        </button>
                      )
                    })}
                    <button
                      onClick={() => setLabelDropdownOpen((v) => !v)}
                      className="text-[11px] text-notion-muted/50 hover:text-notion-muted border border-dashed border-notion-border/50 rounded px-1.5 py-0.5 transition-colors"
                    >
                      {activeLabels.length === 0 ? "add label…" : "+"}
                    </button>
                    {labelDropdownOpen && (
                      <LabelDropdown
                        activeLabels={activeLabels}
                        allLabels={allLabels}
                        onToggle={handleLabelToggle}
                        onClose={() => setLabelDropdownOpen(false)}
                      />
                    )}
                  </div>
                </div>

                {/* Notes */}
                <NotesRow task={task} taskNotesIndex={taskNotesIndex} />
              </div>

              {/* Subtasks */}
              {(() => {
                const subtasks = (allTasks ?? []).filter((t) => t.parent_id === task.id)
                return (
                  <SubtasksSection
                    task={task}
                    subtasks={subtasks}
                    onRefresh={onRefresh}
                    onOpenTask={onOpenTask}
                  />
                )
              })()}

              {/* Description */}
              <DescriptionField
                value={descValue}
                onChange={setDescValue}
                onBlur={handleDescBlur}
                onKeyDown={handleDescKeyDown}
              />

              {/* Delete */}
              <div className="pt-1">
                {deleteState === "idle" && (
                  <button
                    onClick={() => setDeleteState("confirm")}
                    className="text-red-400 hover:text-red-300 text-xs border border-red-400/20 hover:border-red-400/40 rounded-lg px-3 py-1.5 transition-colors"
                  >
                    Delete task
                  </button>
                )}
                {deleteState === "confirm" && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-notion-muted">Are you sure?</span>
                    <button
                      onClick={handleDelete}
                      className="text-red-400 hover:text-red-300 text-xs border border-red-400/20 hover:border-red-400/40 rounded-lg px-3 py-1.5 transition-colors"
                    >
                      Yes, delete
                    </button>
                    <button
                      onClick={() => setDeleteState("idle")}
                      className="text-notion-muted hover:text-notion-text text-xs border border-notion-border rounded-lg px-3 py-1.5 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                {deleteState === "deleting" && (
                  <span className="text-xs text-notion-muted">Deleting...</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
