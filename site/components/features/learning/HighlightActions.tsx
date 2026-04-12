"use client"

import { useState } from "react"

interface HighlightActionsProps {
  text: string
  highlightId: number
  readwiseUrl?: string | null
  sourceTitle?: string
  sourceUrl?: string | null
}

export default function HighlightActions({ text, highlightId, readwiseUrl, sourceTitle, sourceUrl }: HighlightActionsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      let copyText = `"${text}"`
      if (sourceTitle) {
        copyText += `\n\n— ${sourceTitle}`
        if (sourceUrl) {
          copyText += `\n${sourceUrl}`
        }
      }
      await navigator.clipboard.writeText(copyText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // fallback
    }
  }

  const linkUrl = readwiseUrl || `https://readwise.io/open/${highlightId}`

  return (
    <span className="inline-flex items-center gap-1.5 ml-auto shrink-0">
      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="text-notion-muted/40 hover:text-notion-accent transition-colors"
        aria-label="Copy highlight"
        title="Copy highlight"
      >
        {copied ? (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        )}
      </button>

      {/* Readwise link */}
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-notion-muted/40 hover:text-notion-accent transition-colors"
        aria-label="View in Readwise"
        title="View in Readwise"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </a>
    </span>
  )
}
