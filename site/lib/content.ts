/**
 * Content library — reads from a pre-built JSON cache.
 *
 * The cache is generated at build time by scripts/build-content-cache.mjs and
 * lives at site/.content-cache/content-cache.json. This approach keeps all
 * file I/O out of Next.js serverless functions (which would cause nft to bundle
 * the entire repo into every function, exceeding Vercel's 250 MB limit).
 *
 * The require() below is a static string literal — nft traces it to the single
 * JSON file inside site/, not to the entire parent directory tree.
 */
/**
 * Strip redundant date strings from display titles.
 * Dates are shown as metadata elsewhere, so they're noise in the title.
 *
 * Handles:
 *   Trailing with separator:  "Title — 2026-02-27"  "Title - 20260227"
 *   Trailing without separator: "Title 2026-02-27"
 *   Leading with separator:  "2026-02-27 - Title"  "2026-02-27_Title"
 *   Leading bare:            "2026-02-27 Title"
 *
 * If the entire title IS a date (nothing left after stripping), keep it as-is.
 */
function cleanTitle(title: string): string {
  const date = String.raw`\d{4}-\d{2}-\d{2}|\d{8}` // YYYY-MM-DD or YYYYMMDD

  // Try stripping trailing date (with optional separator)
  let cleaned = title.replace(new RegExp(`\\s*(?:—|-)?\\s*(?:${date})\\s*$`), "")
  if (cleaned.length > 0 && cleaned !== title) return cleaned.trim()

  // Try stripping leading date (with optional separator or underscore)
  cleaned = title.replace(new RegExp(`^(?:${date})\\s*(?:—|-|_)?\\s*`), "")
  if (cleaned.length > 0 && cleaned !== title) return cleaned.trim()

  // Nothing matched or title would be empty — return original
  return title.trim()
}

export interface ContentFile {
  slug: string
  frontmatter: Record<string, string>
  content: string
  filePath: string
  displayTitle: string
  /** Auto-inferred tags based on path, frontmatter, and content keywords */
  autoTags: string[]
}

interface CacheEntry {
  slug: string
  frontmatter: Record<string, string>
  content: string
  displayTitle: string
  /** Auto-tags computed at build time by build-content-cache.mjs */
  autoTags: string[]
}

// Static require — nft traces this to site/.content-cache/content-cache.json only.
// Built by: node scripts/build-content-cache.mjs (runs before next build).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _rawCache: Record<string, CacheEntry> = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("../.content-cache/content-cache.json")
  } catch {
    // Cache not yet built (e.g. fresh clone before running build:cache).
    // Run: pnpm build:cache — then restart dev server.
    console.warn("[content] Cache not found. Run `pnpm build:cache` to generate it.")
    return {}
  }
})()

// Index cache: same keys, same metadata, but `content` is omitted.
// List pages use this to avoid deserializing full markdown bodies.
// Built alongside content-cache.json by build-content-cache.mjs.
type IndexEntry = Omit<CacheEntry, "content">
const _rawIndex: Record<string, IndexEntry> = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("../.content-cache/content-index.json")
  } catch {
    // Fall back to the full cache if index hasn't been built yet.
    return _rawCache
  }
})()

function cacheEntryToContentFile(repoRelPath: string, entry: CacheEntry, slug: string): ContentFile {
  return {
    slug,
    frontmatter: entry.frontmatter,
    content: entry.content,
    filePath: repoRelPath,
    displayTitle: cleanTitle(entry.displayTitle),
    autoTags: entry.autoTags ?? [],
  }
}

export function getMarkdownFiles(relativePath: string): ContentFile[] {
  // Normalize to ensure trailing slash for prefix matching
  const prefix = relativePath.endsWith("/") ? relativePath : relativePath + "/"

  const results: ContentFile[] = []
  for (const [repoRelPath, entry] of Object.entries(_rawCache)) {
    if (repoRelPath.startsWith(prefix)) {
      // Slug is relative to the requested directory — matches original fs behavior
      const slug = repoRelPath.slice(prefix.length).replace(/\.md$/, "")
      results.push(cacheEntryToContentFile(repoRelPath, entry, slug))
    }
  }

  return results.sort((a, b) => {
    const rawA = a.frontmatter.date ?? a.frontmatter.created ?? ""
    const rawB = b.frontmatter.date ?? b.frontmatter.created ?? ""
    return rawB.localeCompare(rawA)
  })
}

export function getMarkdownFile(
  relativePath: string
): { frontmatter: Record<string, string>; content: string; displayTitle: string; autoTags: string[] } | null {
  // Normalize: strip leading slash if any, ensure .md extension
  const key = relativePath.startsWith("/") ? relativePath.slice(1) : relativePath
  const entry = _rawCache[key]
  if (!entry) return null
  return {
    frontmatter: entry.frontmatter,
    content: entry.content,
    displayTitle: cleanTitle(entry.displayTitle),
    autoTags: entry.autoTags ?? [],
  }
}

/**
 * Formerly fetched titles from GitHub API. Now reads from cache at build time.
 * Kept as async for drop-in compatibility with existing page components.
 */
export async function getFileTitlesFromGitHub(relativePath: string): Promise<ContentFile[]> {
  return getMarkdownFiles(relativePath)
}

/**
 * Formerly merged GitHub files with a Redis pending buffer. Now reads from cache.
 * Kept as async for drop-in compatibility with existing page components.
 */
export async function getMarkdownFilesWithPending(relativePath: string): Promise<ContentFile[]> {
  return getMarkdownFiles(relativePath)
}

/**
 * Reads from the index cache (no `content` field) instead of the full cache.
 * Use for list pages that only need metadata — avoids loading the full 6MB+ cache body.
 * Returns ContentFile with `content: ""` so callers that spread ContentFile still type-check.
 */
export function getMarkdownFilesIndex(relativePath: string): ContentFile[] {
  const prefix = relativePath.endsWith("/") ? relativePath : relativePath + "/"

  const results: ContentFile[] = []
  for (const [repoRelPath, entry] of Object.entries(_rawIndex)) {
    if (repoRelPath.startsWith(prefix)) {
      const slug = repoRelPath.slice(prefix.length).replace(/\.md$/, "")
      results.push({
        slug,
        frontmatter: entry.frontmatter,
        content: "",
        filePath: repoRelPath,
        displayTitle: cleanTitle(entry.displayTitle),
        autoTags: entry.autoTags ?? [],
      })
    }
  }

  return results.sort((a, b) => {
    const rawA = a.frontmatter.date ?? a.frontmatter.created ?? ""
    const rawB = b.frontmatter.date ?? b.frontmatter.created ?? ""
    return rawB.localeCompare(rawA)
  })
}

/**
 * Async wrapper for getMarkdownFilesIndex — drop-in for getMarkdownFilesWithPending
 * on list pages that don't need full content.
 */
export async function getMarkdownFilesIndexWithPending(relativePath: string): Promise<ContentFile[]> {
  return getMarkdownFilesIndex(relativePath)
}

/**
 * Formerly checked Redis buffer then GitHub. Now reads from cache.
 * Kept as async for drop-in compatibility with existing page components.
 */
export async function getMarkdownFileWithPending(
  relativePath: string
): Promise<{ frontmatter: Record<string, string>; content: string; displayTitle: string; autoTags: string[] } | null> {
  return getMarkdownFile(relativePath)
}
