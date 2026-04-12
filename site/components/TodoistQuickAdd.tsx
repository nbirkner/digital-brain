"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

type Status = "idle" | "loading" | "success" | "error"
type Mode = "task" | "note" | "command"

export default function TodoistQuickAdd() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>("task")
  const [content, setContent] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [successMsg, setSuccessMsg] = useState("")
  const [successUrl, setSuccessUrl] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const router = useRouter()

  const cardRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // ── Keyboard shortcuts ───────────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (e.key === "n" && !["INPUT", "TEXTAREA"].includes(tag) && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === "Escape" && open) setOpen(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open])

  // ── Auto-focus on open ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!open) return
    requestAnimationFrame(() => {
      if (mode === "task") inputRef.current?.focus()
      else textareaRef.current?.focus()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!open) return
    requestAnimationFrame(() => {
      if (mode === "task") inputRef.current?.focus()
      else textareaRef.current?.focus()
    })
  }, [mode, open])

  // ── Close on outside click ───────────────────────────────────────────────────
  // Note: we do NOT clear state on close — drafts are preserved until Cancel or success.

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  // ── Reset & close ────────────────────────────────────────────────────────────

  function resetForm() {
    setContent("")
    setStatus("idle")
    setSuccessMsg("")
    setSuccessUrl("")
    setErrorMsg("")
  }

  function handleCancel() {
    resetForm()
    setOpen(false)
  }

  // ── Submit: task ─────────────────────────────────────────────────────────────

  async function handleSubmitTask() {
    const trimmed = content.trim()
    if (!trimmed || status === "loading") return
    setStatus("loading")
    try {
      const res = await fetch("/api/todoist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      })
      if (res.ok) {
        const data = await res.json()
        const count = data.count || 1
        // Build Todoist link from the response
        const taskData = data.task || data.tasks?.[0]
        const taskUrl = taskData?.id
          ? `https://app.todoist.com/app/task/${taskData.id}`
          : ""
        setStatus("success")
        setSuccessMsg(count > 1 ? `${count} tasks added` : "Task added")
        setSuccessUrl(taskUrl)
        setTimeout(() => router.refresh(), 1000)
        setTimeout(() => { resetForm(); setOpen(false) }, 2500)
      } else {
        setStatus("error")
        setErrorMsg("Failed to add — try again")
        setTimeout(() => setStatus("idle"), 3000)
      }
    } catch {
      setStatus("error")
      setErrorMsg("Network error — try again")
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  // ── Submit: note ─────────────────────────────────────────────────────────────

  async function handleSubmitNote() {
    const trimmed = content.trim()
    if (!trimmed || status === "loading") return
    setStatus("loading")
    try {
      const res = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed, mode: "note" }),
      })
      if (res.ok) {
        const data = await res.json()
        setStatus("success")
        setSuccessMsg(data.summary || "Note saved")
        setTimeout(() => { resetForm(); setOpen(false) }, 2000)
      } else {
        setStatus("error")
        setErrorMsg("Save failed — try again")
        setTimeout(() => setStatus("idle"), 3000)
      }
    } catch {
      setStatus("error")
      setErrorMsg("Network error — try again")
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  // ── Submit: command ──────────────────────────────────────────────────────────

  async function handleSubmitCommand() {
    const trimmed = content.trim()
    if (!trimmed || status === "loading") return
    setStatus("loading")
    try {
      const res = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setStatus("success")
        setSuccessMsg(data.message || "Done")
        setTimeout(() => { resetForm(); setOpen(false) }, 2500)
      } else if (data.understood === false) {
        setStatus("error")
        setErrorMsg(
          data.error ||
            "I didn't understand that. Try: \"Make X an external page\", \"Create tasks for...\", or \"Update [trip] with...\""
        )
        setTimeout(() => setStatus("idle"), 5000)
      } else {
        setStatus("error")
        setErrorMsg(data.error || "Command failed — try again")
        setTimeout(() => setStatus("idle"), 4000)
      }
    } catch {
      setStatus("error")
      setErrorMsg("Network error — try again")
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  function handleTaskKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter") { e.preventDefault(); handleSubmitTask() }
  }

  function handleNoteKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmitNote() }
  }

  function handleCommandKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleSubmitCommand() }
  }

  const canSubmit = content.trim().length > 0 && status !== "loading"

  function getSubmitLabel() {
    if (status === "loading") {
      if (mode === "task") return "Adding..."
      if (mode === "note") return "Saving..."
      return "Running..."
    }
    if (mode === "task") return "Add task"
    if (mode === "note") return "Save"
    return "Run"
  }

  function handleSubmit() {
    if (mode === "task") return handleSubmitTask()
    if (mode === "note") return handleSubmitNote()
    return handleSubmitCommand()
  }

  const TAB_LABELS: Record<Mode, string> = {
    task: "Task",
    note: "Note",
    command: "Command",
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div ref={cardRef} className="fixed right-6 z-50 flex flex-col items-end gap-3 fab-position">

      {/* Card */}
      {open && (
        <div className="bg-notion-surface border border-notion-border rounded-2xl shadow-2xl flex flex-col w-[calc(100vw-3rem)] max-w-[22rem] sm:max-w-96 overflow-hidden">

          {/* Mode tabs */}
          <div className="flex items-center gap-1 px-4 pt-4 pb-0">
            {(["task", "note", "command"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setErrorMsg("") }}
                className={`text-xs font-medium px-3 py-1 rounded-full transition-all duration-150 ${
                  mode === m
                    ? "bg-notion-hover text-notion-text"
                    : "text-notion-muted hover:text-notion-text"
                }`}
              >
                {TAB_LABELS[m]}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="px-4 py-3 flex flex-col gap-3">

            {/* Task input */}
            {mode === "task" && (
              <textarea
                ref={inputRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleTaskKeyDown}
                placeholder="Add task to Todoist..."
                disabled={status === "loading"}
                rows={3}
                className="w-full bg-transparent text-sm text-notion-text placeholder:text-notion-muted outline-none resize-none leading-relaxed"
              />
            )}

            {/* Note input — quick daily capture, no AI */}
            {mode === "note" && (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleNoteKeyDown}
                placeholder="Capture a quick thought..."
                disabled={status === "loading"}
                rows={3}
                className="w-full bg-transparent text-sm text-notion-text placeholder:text-notion-muted outline-none resize-none leading-relaxed"
              />
            )}

            {/* Command input — AI execution */}
            {mode === "command" && (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleCommandKeyDown}
                placeholder="Tell me what to do..."
                disabled={status === "loading"}
                rows={3}
                className="w-full bg-transparent text-sm text-notion-text placeholder:text-notion-muted outline-none resize-none leading-relaxed"
              />
            )}

          </div>

          {/* Status banner */}
          {status === "success" && (
            <div className="mx-4 mb-3 px-3 py-2 bg-notion-hover rounded-xl text-xs text-notion-text text-center flex items-center justify-center gap-2">
              <span>✓ {successMsg}</span>
              {successUrl && (
                <a
                  href={successUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-notion-accent hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Open →
                </a>
              )}
            </div>
          )}
          {status === "error" && (
            <div className="mx-4 mb-3 px-3 py-2 bg-red-500/10 rounded-xl text-xs text-red-400 text-center">
              {errorMsg}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-notion-border">
            <button
              onClick={handleCancel}
              className="text-xs text-notion-muted hover:text-notion-text transition-colors px-2 py-1 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="text-xs font-medium bg-notion-accent text-white px-3 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              {getSubmitLabel()}
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        title="Quick add (n)"
        className={`w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition-all duration-150 border ${
          open
            ? "bg-notion-hover border-notion-border text-notion-text"
            : "bg-notion-surface border-notion-border text-notion-muted hover:bg-notion-hover hover:text-notion-text"
        }`}
      >
        {open ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="7" y1="1" x2="7" y2="13"/><line x1="1" y1="7" x2="13" y2="7"/>
          </svg>
        )}
      </button>
    </div>
  )
}
