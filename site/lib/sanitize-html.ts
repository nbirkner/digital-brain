/**
 * Lightweight HTML sanitizer for dangerouslySetInnerHTML content.
 * Strips script tags, on* event handlers, and javascript: hrefs.
 * Not a full sanitizer — this is a personal app with trusted content sources.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ""

  return html
    // Strip <script> tags and everything inside them
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    // Strip on* event handler attributes (onclick, onload, onerror, etc.)
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "")
    // Strip javascript: href/src values
    .replace(/\b(href|src)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, "")
    // Make all links open in a new tab safely
    .replace(/<a\s/gi, '<a target="_blank" rel="noopener noreferrer" ')
}
