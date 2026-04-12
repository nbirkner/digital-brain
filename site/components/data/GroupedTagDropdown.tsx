"use client"

import { useState, useRef, useEffect } from "react"
import { TAGS_BY_CATEGORY, TagCategory, getTagDef } from "@/lib/tag-taxonomy"

const CATEGORY_ORDER: TagCategory[] = ["type", "area", "work-area", "meeting-type"]

// Domain tags are redundant with the domain filter tabs (All/Work/Personal)
const HIDDEN_TAGS = new Set(["work", "personal"])

const CATEGORY_LABELS: Record<TagCategory, string> = {
  type: "Type",
  area: "Area",
  "work-area": "Team",
  "meeting-type": "Meetings",
}

interface GroupedTagDropdownProps {
  availableTags: string[]
  selected: string | null
  onChange: (tag: string | null) => void
}

export default function GroupedTagDropdown({ availableTags, selected, onChange }: GroupedTagDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  const availableSet = new Set(availableTags)

  // Build groups: only categories that have at least one available tag, excluding hidden domain tags
  const knownTagIds = new Set<string>()
  const groups = CATEGORY_ORDER
    .map((cat) => ({
      category: cat,
      label: CATEGORY_LABELS[cat],
      tags: TAGS_BY_CATEGORY[cat].filter((t) => {
        if (availableSet.has(t.id) && !HIDDEN_TAGS.has(t.id)) {
          knownTagIds.add(t.id)
          return true
        }
        return false
      }),
    }))
    .filter((g) => g.tags.length > 0)

  // Tags not in the taxonomy (e.g. free-text Todoist labels) shown as "Other"
  const ungrouped = availableTags.filter((t) => !knownTagIds.has(t) && !HIDDEN_TAGS.has(t)).sort()

  // Hide entirely if no tags to show (either no input or all filtered out)
  if (availableTags.length === 0 || (groups.length === 0 && ungrouped.length === 0)) return null

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md border transition-colors ${
          selected
            ? "bg-notion-surface border-notion-border text-notion-text"
            : "border-transparent text-notion-muted hover:text-notion-text"
        }`}
      >
        <span>{selected ? getTagDef(selected).label : "All Tags"}</span>
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-20 min-w-[180px] max-h-72 overflow-y-auto bg-notion-bg border border-notion-border rounded-lg shadow-lg py-1">
          <button
            onClick={() => { onChange(null); setOpen(false) }}
            className={`w-full text-left px-3 py-1.5 hover:bg-notion-hover transition-colors text-[11px] ${
              !selected ? "text-notion-text font-medium" : "text-notion-muted"
            }`}
          >
            All Tags
          </button>
          {groups.map((group) => (
            <div key={group.category}>
              <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-notion-muted/40 px-3 pt-2 pb-1">
                {group.label}
              </div>
              {group.tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => { onChange(tag.id); setOpen(false) }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-notion-hover transition-colors text-[11px] ${
                    selected === tag.id ? "text-notion-text font-medium" : "text-notion-muted"
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          ))}
          {ungrouped.length > 0 && (
            <div>
              {groups.length > 0 && (
                <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-notion-muted/40 px-3 pt-2 pb-1">
                  Other
                </div>
              )}
              {ungrouped.map((tag) => (
                <button
                  key={tag}
                  onClick={() => { onChange(tag); setOpen(false) }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-notion-hover transition-colors text-[11px] ${
                    selected === tag ? "text-notion-text font-medium" : "text-notion-muted"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
