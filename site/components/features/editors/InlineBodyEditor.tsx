"use client"

import { useState, useRef, useEffect } from "react"
import MarkdownRenderer from "@/components/ui/MarkdownRenderer"

interface Props {
  filePath: string
  frontmatter: Record<string, string>
  body: string
  onSave?: (newBody: string) => void
  emptyText?: string
}

export default function InlineBodyEditor({
  filePath,
  frontmatter,
  body,
  onSave,
  emptyText = "Nothing here yet. Click to add...",
}: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(body)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Keep draft in sync when body prop updates (e.g., after save)
  useEffect(() => {
    if (!editing) setDraft(body)
  }, [body, editing])

  // Focus and move cursor to end when editing starts
  useEffect(() => {
    if (!editing) return
    const el = textareaRef.current
    if (!el) return
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(el.value.length, el.value.length)
    }, 50)
  }, [editing])

  // Esc to cancel
  useEffect(() => {
    if (!editing) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") cancel()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing])

  function cancel() {
    setDraft(body)
    setEditing(false)
  }

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  async function save() {
    if (saving) return
    setSaving(true)
    try {
      const res = await fetch("/api/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath, frontmatter, markdownBody: draft }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }
      showToast("success", "Saved")
      setEditing(false)
      onSave?.(draft)
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg
          ${toast.type === "success" ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white"}`}
        >
          {toast.message}
        </div>
      )}

      {editing ? (
        <div className="space-y-3">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={saving}
            rows={Math.max(12, draft.split("\n").length + 3)}
            className="w-full text-sm bg-notion-bg border border-notion-accent/40 rounded-xl px-4 py-3 text-notion-text font-mono focus:outline-none focus:ring-2 focus:ring-notion-accent/30 resize-y disabled:opacity-50 shadow-[0_0_0_3px_var(--notion-glow)]"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="text-xs px-3 py-1.5 rounded-md bg-notion-accent text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={cancel}
              disabled={saving}
              className="text-xs px-3 py-1.5 rounded-md border border-notion-border text-notion-muted hover:text-notion-text transition-colors"
            >
              Cancel
            </button>
            <span className="text-[10px] text-notion-muted/40 ml-auto">Esc to cancel</span>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setEditing(true)}
          className="group relative bg-notion-surface border border-notion-border hover:border-notion-accent/30 rounded-xl p-6 cursor-text transition-colors"
        >
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <span className="text-[10px] text-notion-muted/50 bg-notion-surface-elevated border border-notion-border rounded px-1.5 py-0.5">
              click to edit
            </span>
          </div>
          {body.trim() ? (
            <MarkdownRenderer content={body} />
          ) : (
            <p className="text-notion-muted/50 text-sm italic">{emptyText}</p>
          )}
        </div>
      )}
    </>
  )
}
