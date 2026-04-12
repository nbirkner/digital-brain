"use client"

import { marked, Renderer } from "marked"
import { useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { sanitizeHtml } from "@/lib/sanitize-html"

// Strip .md extension from internal links to prevent navigation to .md URLs
const renderer = new Renderer()
renderer.link = function ({ href, title, tokens }) {
  const text = tokens.map((t) => ("text" in t ? t.text : "")).join("")
  let resolvedHref = href ?? ""
  if (!resolvedHref.startsWith("http") && resolvedHref.endsWith(".md")) {
    resolvedHref = resolvedHref.replace(/\.md$/, "")
  }
  const titleAttr = title ? ` title="${title}"` : ""
  return `<a href="${resolvedHref}"${titleAttr}>${text}</a>`
}

marked.setOptions({ gfm: true, breaks: true })

interface MarkdownRendererProps {
  content: string
}

function stripLeadingH1(content: string): string {
  // Remove the first line if it's an H1 — the page header already renders the title
  return content.replace(/^#\s+.+\n?/, "")
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const html = useMemo(() => sanitizeHtml(marked(stripLeadingH1(content), { renderer }) as string), [content])
  const router = useRouter()

  // Intercept anchor clicks so internal links stay within the PWA (iOS standalone mode)
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as Element).closest("a")
    if (!target) return
    const href = target.getAttribute("href")
    if (!href) return
    const isExternal = href.startsWith("http") || href.startsWith("//") || target.getAttribute("target") === "_blank"
    if (isExternal) return
    e.preventDefault()
    router.push(href)
  }, [router])

  return (
    <div
      onClick={handleClick}
      className="prose prose-notion max-w-none
        prose-p:text-notion-text prose-p:leading-[1.8] prose-p:text-[0.9375rem]
        prose-headings:text-notion-text prose-headings:font-semibold prose-headings:tracking-tight
        prose-h1:text-2xl prose-h1:mt-8 prose-h1:mb-4
        prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-3
        prose-h3:text-base prose-h3:mt-5 prose-h3:mb-2
        prose-a:text-notion-accent prose-a:no-underline prose-a:font-medium hover:prose-a:underline
        prose-strong:text-notion-text prose-strong:font-semibold
        prose-em:text-notion-text/80
        prose-code:text-notion-text prose-code:bg-notion-surface prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[0.8em] prose-code:font-mono prose-code:border prose-code:border-notion-border
        prose-pre:bg-notion-surface prose-pre:border prose-pre:border-notion-border prose-pre:rounded-xl prose-pre:shadow-sm
        prose-blockquote:border-l-2 prose-blockquote:border-notion-accent/30 prose-blockquote:text-notion-muted prose-blockquote:not-italic prose-blockquote:pl-4
        prose-ul:text-notion-text prose-ol:text-notion-text prose-li:text-notion-text prose-li:leading-[1.7]
        prose-hr:border-notion-border/40
        prose-img:rounded-xl prose-img:shadow-md
        prose-pre:overflow-x-auto
        prose-p:break-words prose-a:break-words
        prose-table:text-notion-text prose-th:text-notion-text prose-th:border-notion-border prose-td:text-notion-text prose-td:border-notion-border
        [&_table]:block [&_table]:overflow-x-auto
        [&_li:has(>input[type='checkbox'])]:list-none [&_li:has(>input[type='checkbox'])]:pl-0
        [&>*:first-child]:mt-0
      "
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
