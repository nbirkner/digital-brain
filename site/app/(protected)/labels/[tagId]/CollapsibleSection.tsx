"use client"

import { useState } from "react"

interface CollapsibleSectionProps {
  title: string
  count: number
  defaultOpen?: boolean
  children: React.ReactNode
}

export default function CollapsibleSection({ title, count, defaultOpen = true, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 border-b border-notion-border/20 mb-2 pb-1 group"
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
          {count}
        </span>
      </button>
      {open && children}
    </section>
  )
}
