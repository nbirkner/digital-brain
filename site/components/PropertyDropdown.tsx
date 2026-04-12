"use client"

import { useState, useRef, useEffect } from "react"

export interface DropdownOption {
  label: string
  value: string | number
  className?: string
}

interface PropertyDropdownProps {
  options: DropdownOption[]
  value: string | number
  onChange: (value: string | number) => void
  /** The trigger element — the button face shown at rest */
  trigger: React.ReactNode
  align?: "left" | "right"
}

/**
 * Custom property dropdown — no native <select>.
 * Wraps any trigger node, shows a floating option list on click.
 * Closes on outside click or Escape. Stops propagation so parent
 * row clicks don't fire.
 */
export default function PropertyDropdown({
  options,
  value,
  onChange,
  trigger,
  align = "left",
}: PropertyDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function keyHandler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    document.addEventListener("keydown", keyHandler)
    return () => {
      document.removeEventListener("mousedown", handler)
      document.removeEventListener("keydown", keyHandler)
    }
  }, [open])

  return (
    <div
      ref={ref}
      className="relative flex-shrink-0"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center focus:outline-none focus-visible:ring-1 focus-visible:ring-notion-accent/60 rounded"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {trigger}
      </button>

      {open && (
        <div
          className={`absolute top-full mt-1 z-50 bg-notion-surface border border-notion-border rounded-lg shadow-xl py-1 min-w-[110px] ${
            align === "right" ? "right-0" : "left-0"
          }`}
          role="listbox"
        >
          {options.map((opt) => (
            <button
              key={String(opt.value)}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
              className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-notion-hover ${
                opt.value === value
                  ? "text-notion-text font-semibold"
                  : "text-notion-muted"
              } ${opt.className ?? ""}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
