"use client"

import { RefObject } from "react"

interface Props {
  query: string
  onChange: (value: string) => void
  inputRef: RefObject<HTMLInputElement>
}

export default function SearchInput({ query, onChange, inputRef }: Props) {
  return (
    <div className="flex items-center gap-2 border-b border-notion-border/40 px-2 focus-within:outline-none focus-within:ring-0 focus-within:border-notion-border/40">
      <svg
        className="w-4 h-4 text-notion-muted/40 shrink-0 ml-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search your brain..."
        className="no-focus-ring w-full bg-transparent px-3 py-3 text-sm text-notion-text placeholder-notion-muted/40 focus:outline-none"
      />
    </div>
  )
}
