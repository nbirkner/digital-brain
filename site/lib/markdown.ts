import { marked } from "marked"

// Parse inline markdown (bold, italic, links) without block-level wrapping.
// Adds target="_blank" + rel to external links automatically.
export function parseInlineMarkdown(text: string): string {
  try {
    const html = marked.parseInline(text) as string
    return html.replace(
      /<a href="(https?:\/\/[^"]+)"/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer"'
    )
  } catch {
    return text
  }
}
