"use client"

import Link from "next/link"
import { getTagDef } from "@/lib/tag-taxonomy"
import type { TagDefinition } from "@/lib/tag-taxonomy"

interface TagPillProps {
  tagId: string
  /** Size variant: "sm" for list items, "md" for detail views */
  size?: "sm" | "md"
  /** When provided, renders as a Link and stops click propagation */
  href?: string
  /** Optional click handler for filtering (ignored when href is provided) */
  onClick?: (tagId: string) => void
}

export default function TagPill({ tagId, size = "sm", href, onClick }: TagPillProps) {
  const def: TagDefinition = getTagDef(tagId)

  const sizeClasses = size === "sm"
    ? "px-2 py-0.5 text-[9px]"
    : "px-2.5 py-1 text-[10px]"

  const baseClasses = `inline-flex items-center rounded font-semibold uppercase tracking-wider ${def.color} ${sizeClasses}`

  if (href) {
    return (
      <Link
        href={href}
        onClick={(e) => e.stopPropagation()}
        className={`${baseClasses} hover:opacity-80 transition-opacity`}
        title={`${def.category}: ${def.label}`}
      >
        {def.label}
      </Link>
    )
  }

  const interactive = onClick
    ? "cursor-pointer hover:opacity-80 active:scale-95 transition-all"
    : ""

  return (
    <span
      className={`${baseClasses} ${interactive}`}
      onClick={onClick ? () => onClick(tagId) : undefined}
      title={`${def.category}: ${def.label}`}
    >
      {def.label}
    </span>
  )
}

/** Render a row of tag pills from an array of tag ids */
export function TagRow({
  tags,
  size = "sm",
  max = 4,
  onClick,
  getHref,
}: {
  tags: string[]
  size?: "sm" | "md"
  max?: number
  onClick?: (tagId: string) => void
  getHref?: (tagId: string) => string
}) {
  const filtered = tags.filter((id) => id !== "doc")
  if (!filtered.length) return null

  const visible = filtered.slice(0, max)
  const overflow = tags.length - max

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((id) => (
        <TagPill
          key={id}
          tagId={id}
          size={size}
          href={getHref ? getHref(id) : undefined}
          onClick={getHref ? undefined : onClick}
        />
      ))}
      {overflow > 0 && (
        <span className="text-xs text-notion-muted/50 font-medium">
          +{overflow}
        </span>
      )}
    </div>
  )
}
