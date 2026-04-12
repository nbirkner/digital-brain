"use client"

import { useState, useRef, useEffect } from "react"

interface Props {
  filePath: string
  field: string
  value: string
  type: "text" | "date" | "tags" | "select"
  options?: string[]
  onSave: (newValue: string) => void
  className?: string
}

const MOOD_OPTIONS = [
  "energized ⚡",
  "calm 🌊",
  "reflective 🌀",
  "anxious 😰",
  "happy 😊",
  "tired 😴",
  "curious 🔍",
  "creative 🎨",
]

export default function InlineFrontmatterEditor({
  filePath,
  field,
  value,
  type,
  options,
  onSave,
  className = "",
}: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const selectRef = useRef<HTMLSelectElement>(null)

  useEffect(() => {
    if (!editing) setDraft(value)
  }, [value, editing])

  useEffect(() => {
    if (!editing) return
    setTimeout(() => {
      inputRef.current?.focus()
      selectRef.current?.focus()
    }, 50)
  }, [editing])

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
    setDraft(value)
    setEditing(false)
  }

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  async function save(valueToSave?: string) {
    if (saving) return
    const finalValue = valueToSave !== undefined ? valueToSave : draft
    if (finalValue === value) {
      setEditing(false)
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filePath,
          frontmatter: { [field]: finalValue },
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }
      showToast("success", "Saved")
      setEditing(false)
      onSave(finalValue)
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault()
      save()
    }
  }

  // Render display value
  function renderDisplay() {
    if (!value) {
      return (
        <span className="text-notion-muted/40 italic text-xs">add {field}</span>
      )
    }
    if (type === "tags") {
      const tags = value.split(",").map((t) => t.trim()).filter(Boolean)
      return (
        <span className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-notion-surface-elevated border border-notion-border text-notion-muted"
            >
              {tag}
            </span>
          ))}
        </span>
      )
    }
    return <span>{value}</span>
  }

  const selectOptions = options ?? (field === "mood" ? MOOD_OPTIONS : [])

  return (
    <>
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg
            ${toast.type === "success" ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white"}`}
        >
          {toast.message}
        </div>
      )}

      {editing ? (
        <span className={`inline-flex items-center gap-1 ${className}`}>
          {type === "select" ? (
            <select
              ref={selectRef}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value)
                save(e.target.value)
              }}
              disabled={saving}
              className="text-xs bg-notion-surface border border-notion-accent/40 rounded px-1.5 py-0.5 text-notion-text focus:outline-none focus:ring-1 focus:ring-notion-accent/40 disabled:opacity-50"
            >
              {selectOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              ref={inputRef}
              type={type === "date" ? "date" : "text"}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => save()}
              onKeyDown={handleKeyDown}
              disabled={saving}
              className="text-xs bg-notion-surface border border-notion-accent/40 rounded px-1.5 py-0.5 text-notion-text focus:outline-none focus:ring-1 focus:ring-notion-accent/40 disabled:opacity-50 font-mono"
            />
          )}
          <button
            onClick={cancel}
            disabled={saving}
            className="text-[10px] text-notion-muted/50 hover:text-notion-muted transition-colors"
          >
            ✕
          </button>
        </span>
      ) : (
        <span
          onClick={() => setEditing(true)}
          title={`Click to edit ${field}`}
          className={`group/fm inline-flex items-center gap-1 cursor-pointer relative ${className}`}
        >
          <span className="text-xs text-notion-muted font-mono hover:text-notion-text transition-colors">
            {renderDisplay()}
          </span>
          <span className="opacity-0 group-hover/fm:opacity-100 transition-opacity pointer-events-none text-[9px] text-notion-muted/40 border border-notion-border/50 rounded px-1 py-px ml-0.5">
            edit
          </span>
        </span>
      )}
    </>
  )
}
