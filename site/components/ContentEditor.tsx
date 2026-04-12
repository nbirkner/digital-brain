"use client"

import { useState, useEffect } from "react"
import { useEditMode } from "@/context/EditModeContext"

export interface FrontmatterField {
  key: string
  label: string
  type: "text" | "date" | "select"
  options?: string[]
}

interface ContentEditorProps {
  filePath: string
  frontmatter: Record<string, string>
  rawBody: string
  frontmatterFields: FrontmatterField[]
  /** Called after a successful save so the parent can re-render with updated values */
  onSave?: (updatedFrontmatter: Record<string, string>, updatedBody: string) => void
}

export default function ContentEditor({
  filePath,
  frontmatter,
  rawBody,
  frontmatterFields,
  onSave,
}: ContentEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const { editRequested, clearEditRequest } = useEditMode()

  // Open edit mode when the floating page button requests it
  useEffect(() => {
    if (editRequested && !isEditing) {
      setIsEditing(true)
      clearEditRequest()
    }
  }, [editRequested, isEditing, clearEditRequest])

  const [editedFrontmatter, setEditedFrontmatter] = useState<Record<string, string>>(frontmatter)
  const [editedBody, setEditedBody] = useState(rawBody)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  function handleCancel() {
    setEditedFrontmatter(frontmatter)
    setEditedBody(rawBody)
    setIsEditing(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch("/api/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filePath,
          frontmatter: editedFrontmatter,
          markdownBody: editedBody,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }
      showToast("success", "Saved")
      setIsEditing(false)
      onSave?.(editedFrontmatter, editedBody)
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  function setField(key: string, value: string) {
    setEditedFrontmatter((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg transition-all
            ${toast.type === "success"
              ? "bg-green-500/90 text-white"
              : "bg-red-500/90 text-white"
            }`}
        >
          {toast.message}
        </div>
      )}

      {/* Edit / Save / Cancel buttons */}
      {!isEditing ? (
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-notion-border bg-notion-surface hover:bg-notion-hover hover:border-notion-accent/40 hover:text-notion-accent text-notion-muted transition-all shrink-0"
          title="Edit this page"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Edit
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-xs px-3 py-1.5 rounded-md bg-notion-accent text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="text-xs px-3 py-1.5 rounded-md border border-notion-border text-notion-muted hover:text-notion-text transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Inline edit form (shown only in edit mode, rendered below the page header by the parent) */}
      {isEditing && (
        <div className="mt-6 bg-notion-surface border border-notion-border rounded-xl p-6 space-y-4">
          {frontmatterFields.map((field) => (
            <div key={field.key} className="flex flex-col gap-1">
              <label className="text-xs text-notion-muted font-medium">{field.label}</label>
              {field.type === "select" && field.options ? (
                <select
                  value={editedFrontmatter[field.key] ?? ""}
                  onChange={(e) => setField(field.key, e.target.value)}
                  className="w-full text-sm bg-notion-bg border border-notion-border rounded-md px-3 py-1.5 text-notion-text focus:outline-none focus:ring-1 focus:ring-notion-accent"
                >
                  <option value="">—</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type === "date" ? "date" : "text"}
                  value={editedFrontmatter[field.key] ?? ""}
                  onChange={(e) => setField(field.key, e.target.value)}
                  className="w-full text-sm bg-notion-bg border border-notion-border rounded-md px-3 py-1.5 text-notion-text focus:outline-none focus:ring-1 focus:ring-notion-accent"
                />
              )}
            </div>
          ))}

          <div className="flex flex-col gap-1">
            <label className="text-xs text-notion-muted font-medium">Content</label>
            <textarea
              value={editedBody}
              onChange={(e) => setEditedBody(e.target.value)}
              rows={16}
              className="w-full text-sm bg-notion-bg border border-notion-border rounded-md px-3 py-2 text-notion-text font-mono focus:outline-none focus:ring-1 focus:ring-notion-accent resize-y"
            />
          </div>
        </div>
      )}
    </>
  )
}
