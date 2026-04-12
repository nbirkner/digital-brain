"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"

const WORK_PROJECT_ID = "6gJQX58PhPc45mFV"
const PERSONAL_PROJECT_ID = "6gJQX59VjmrQFHMG"
const SHARED_PROJECT_ID = process.env.NEXT_PUBLIC_TODOIST_SHARED_PROJECT_ID ?? ""

export interface TaskCreateModalProps {
  defaultProjectId: string
  onCreated: () => void
  onCancel: () => void
  waitingProjectId?: string | null
  sharedProjectId?: string | null
}

export function TaskCreateModal({ defaultProjectId, onCreated, onCancel, waitingProjectId, sharedProjectId }: TaskCreateModalProps) {
  const [content, setContent] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState(1)
  const [projectId, setProjectId] = useState(defaultProjectId)
  const [dueString, setDueString] = useState<string | null>("today")
  const [isTriage, setIsTriage] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true))
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!content.trim() || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/todoist/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          priority,
          project_id: projectId,
          due_string: dueString ?? undefined,
          ...(isTriage ? { labels: ["triage"] } : {}),
          ...(description.trim() ? { description: description.trim() } : {}),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Failed to create task")
        setSubmitting(false)
        return
      }
      setTimeout(() => router.refresh(), 300)
      onCreated()
    } catch {
      setError("Failed to create task")
      setSubmitting(false)
    }
  }, [content, description, priority, projectId, dueString, isTriage, submitting, router, onCreated])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === "Escape") {
      e.preventDefault()
      onCancel()
    }
  }

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === "Escape") {
      e.preventDefault()
      onCancel()
    }
  }

  // Global escape handler (catches Escape even when input isn't focused)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { e.preventDefault(); onCancel() }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      style={{
        backgroundColor: mounted ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0)",
        backdropFilter: "blur(4px)",
        transition: "background-color 150ms ease",
      }}
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create task"
        className="bg-notion-surface-elevated border border-notion-border/60 rounded-xl w-full max-w-2xl mx-4 shadow-[0_24px_80px_rgba(0,0,0,0.5)] overflow-hidden"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "scale(1) translateY(0)" : "scale(0.98) translateY(-8px)",
          transition: "opacity 200ms cubic-bezier(0.16, 1, 0.3, 1), transform 200ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Task name input */}
        <div className="flex items-center gap-2 border-b border-notion-border/40 px-4">
          <svg
            className="w-4 h-4 text-notion-muted/40 shrink-0"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 2v10M2 7h10" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Task name..."
            className="no-focus-ring w-full bg-transparent px-2 py-3.5 text-sm text-notion-text placeholder-notion-muted/40 focus:outline-none"
          />
        </div>

        {/* Description textarea */}
        <div className="px-4 pt-2 pb-1">
          <textarea
            ref={textareaRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleTextareaKeyDown}
            placeholder="Add description... (markdown renders in task view)"
            rows={3}
            className="w-full bg-transparent text-xs text-notion-muted/70 placeholder-notion-muted/30 resize-none focus:outline-none focus:text-notion-text/80 transition-colors leading-relaxed"
          />
        </div>

        {/* Quick-set options */}
        <div className="px-4 py-3 flex flex-wrap items-center gap-1.5">

          {/* Priority pills */}
          {[
            { p: 4, label: "P1", cls: "text-red-400 border-red-500/30" },
            { p: 3, label: "P2", cls: "text-orange-400 border-orange-400/30" },
            { p: 2, label: "P3", cls: "text-blue-400 border-blue-400/30" },
            { p: 1, label: "P4", cls: "text-notion-muted/50 border-notion-border/40" },
          ].map(({ p, label, cls }) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`px-2 py-0.5 rounded border text-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-notion-accent/60 ${cls} ${
                priority === p ? "bg-notion-hover ring-1 ring-notion-accent/20" : "bg-transparent hover:bg-notion-hover"
              }`}
            >
              {label}
            </button>
          ))}

          <div className="w-px h-3.5 bg-notion-border/30 mx-0.5" />

          {/* Due date quick-picks */}
          {[
            { label: "Today", value: "today", triage: false, cls: "text-amber-400 border-amber-500/20" },
            { label: "Tmrw", value: "tomorrow", triage: false, cls: "text-blue-400 border-blue-500/20" },
            { label: "Triage", value: null, triage: true, cls: "text-notion-muted/50 border-notion-border/30" },
          ].map(({ label, value, triage, cls }) => (
            <button
              key={label}
              type="button"
              onClick={() => { setDueString(value); setIsTriage(triage) }}
              className={`px-2 py-0.5 rounded border text-[10px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-notion-accent/60 ${cls} ${
                triage ? (isTriage ? "bg-notion-hover ring-1 ring-notion-accent/20" : "hover:bg-notion-hover") : (dueString === value && !isTriage ? "bg-notion-hover ring-1 ring-notion-accent/20" : "hover:bg-notion-hover")
              }`}
            >
              {label}
            </button>
          ))}

          <div className="w-px h-3.5 bg-notion-border/30 mx-0.5" />

          {/* Project pills */}
          {[
            { id: WORK_PROJECT_ID, label: "Work", cls: "text-blue-400 border-blue-500/20 bg-blue-500/5" },
            { id: PERSONAL_PROJECT_ID, label: "Personal", cls: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" },
            ...((sharedProjectId || SHARED_PROJECT_ID) ? [{ id: sharedProjectId ?? SHARED_PROJECT_ID, label: "Shared", cls: "text-rose-400 border-rose-500/20 bg-rose-500/5" }] : []),
            ...(waitingProjectId ? [{ id: waitingProjectId, label: "Waiting", cls: "text-purple-400 border-purple-500/20 bg-purple-500/5" }] : []),
          ].map(({ id, label, cls }) => (
            <button
              key={id}
              type="button"
              onClick={() => setProjectId(id)}
              className={`px-2 py-0.5 rounded border text-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-notion-accent/60 ${cls} ${
                projectId === id ? "ring-1 ring-notion-accent/30 opacity-100" : "opacity-50 hover:opacity-80"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && <p className="px-4 pb-2 text-[11px] text-red-400">{error}</p>}

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-notion-border/30">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!content.trim() || submitting}
            className="px-3 py-1.5 rounded-md bg-notion-accent text-white text-[12px] font-medium disabled:opacity-40 hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-notion-accent/60"
          >
            {submitting ? "Adding..." : "Add task"}
          </button>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-notion-muted/40 hidden sm:block">
              <kbd className="bg-notion-hover rounded px-1.5 py-0.5 text-[9px] font-mono">⌘↵</kbd> save
            </span>
            <span className="text-[10px] text-notion-muted/40 hidden sm:block">
              <kbd className="bg-notion-hover rounded px-1.5 py-0.5 text-[9px] font-mono">esc</kbd> close
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
