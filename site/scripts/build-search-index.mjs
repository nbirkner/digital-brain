#!/usr/bin/env node
/**
 * Generates /public/search-index.json at build time.
 * Run from repo root (digital-brain/) or from site/ — script handles both.
 *
 * SECTIONS maps filesystem paths (relative to REPO_ROOT) to site URL prefixes.
 * These must match the actual paths used by getMarkdownFiles() in site/app/ pages.
 * When adding new content directories, add a corresponding entry here.
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import matter from "gray-matter"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Always resolve relative to the repo root (parent of site/)
const SITE_DIR = path.resolve(__dirname, "..")
const REPO_ROOT = path.resolve(SITE_DIR, "..")

const SECTIONS = [
  // ── Notes & captures ──
  { path: "personal/notes", urlPrefix: "/notes", icon: "💭", section: "notes" },

  // ── Goals & growth ──
  { path: "personal/docs/growth", urlPrefix: "/goals", icon: "🎯", section: "goals" },

  // ── Career ──
  { path: "personal/docs/career", urlPrefix: "/career-external", icon: "💼", section: "career" },

  // ── Learning ──
  { path: "personal/docs/learning", urlPrefix: "/learning", icon: "📖", section: "learning" },

  // ── Self section (generic — health, routine, hobbies, quotes, certifications) ──
  { path: "personal/docs/health", urlPrefix: "/self/health", icon: "💚", section: "self" },
  { path: "personal/docs/routine", urlPrefix: "/self/routine", icon: "🧘", section: "self" },
  { path: "personal/docs/hobbies", urlPrefix: "/self/hobbies", icon: "🎨", section: "self" },
  { path: "personal/docs/library/quotes", urlPrefix: "/self/quotes", icon: "💬", section: "self" },
  { path: "personal/docs/library/certifications", urlPrefix: "/self/certifications", icon: "🎓", section: "self" },

  // ── Life section ──
  { path: "shared/finances", urlPrefix: "/life/finances", icon: "💰", section: "life" },
  { path: "shared/travel/trips", urlPrefix: "/life/travel", icon: "✈️", section: "life" },
  { path: "shared/housing", urlPrefix: "/life/housing", icon: "🔑", section: "life" },
  { path: "shared/cars", urlPrefix: "/life/cars", icon: "🚗", section: "life" },
  { path: "shared/luci", urlPrefix: "/life/luci", icon: "🐱", section: "life" },
  { path: "shared/relationship", urlPrefix: "/self/relationship", icon: "❤️", section: "self" },

  // ── Work section (served via /docs/[...slug] catch-all) ──
  { path: "work/docs/prds", urlPrefix: "/docs/work/docs/prds", icon: "📋", section: "work" },
  { path: "work/docs/decisions", urlPrefix: "/docs/work/docs/decisions", icon: "⚖️", section: "work" },
  { path: "work/docs/analyses", urlPrefix: "/docs/work/docs/analyses", icon: "📊", section: "work" },
  { path: "work/docs/comms", urlPrefix: "/docs/work/docs/comms", icon: "📣", section: "work" },
  { path: "work/notes", urlPrefix: "/work/meetings", icon: "📝", section: "work" },

  // ── Logs (served via /docs/[...slug] catch-all) ──
  { path: "personal/docs/logs", urlPrefix: "/docs/personal/docs/logs", icon: "📓", section: "logs" },
  { path: "work/docs/logs", urlPrefix: "/docs/work/docs/logs", icon: "📓", section: "logs" },

  // ── Personal meetings ──
  { path: "personal/notes", urlPrefix: "/meetings", icon: "🗓️", section: "meetings" },

  // ── Library ──
  { path: "personal/docs/library", urlPrefix: "/learning", icon: "📖", section: "learning" },

  // ── External published content ──
  { path: "external", urlPrefix: "/docs", icon: "📄", section: "docs" },

]

function slugToTitle(slug) {
  const filename = slug.split("/").pop() ?? slug
  return filename
    .replace(/-+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function extractH1(content) {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : undefined
}

function readDirRecursive(dirPath, base = "") {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const relPath = base ? `${base}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      files.push(...readDirRecursive(path.join(dirPath, entry.name), relPath))
    } else if (entry.isFile()) {
      files.push(relPath)
    }
  }
  return files
}

function getMarkdownFiles(relativePath) {
  const dir = path.join(REPO_ROOT, relativePath)
  if (!fs.existsSync(dir)) return []

  const files = readDirRecursive(dir)
  return files
    .filter((f) => f.endsWith(".md") && !f.includes("README") && !f.endsWith("_traditional.md"))
    .flatMap((file) => {
      const filePath = path.join(dir, file)
      const raw = fs.readFileSync(filePath, "utf-8")
      try {
        const { data, content } = matter(raw)
        const slug = file.replace(".md", "")
        const title =
          data.title ||
          extractH1(content) ||
          slugToTitle(slug)
        const date =
          data.date
            ? (data.date instanceof Date ? data.date.toISOString().split("T")[0] : String(data.date))
            : ""
        // Extract tags from frontmatter
        const tags = Array.isArray(data.tags) ? data.tags.join(", ") : (data.tags || "")
        // Sub-doc support: hidden docs are sub-pages of a parent doc
        const parent = data.parent || null

        // Extract subsection from file path (parent directory within section)
        const fileDir = path.dirname(file)
        const subsection = fileDir && fileDir !== "." ? fileDir.split("/")[0] : ""

        // Strip frontmatter + markdown syntax for snippet
        const snippet = content
          .replace(/^---[\s\S]*?---\n*/m, "")       // frontmatter
          .replace(/!\[([^\]]*)\]\([^)]*\)/g, "")   // images ![alt](url)
          .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")  // links [text](url) → text
          .replace(/<[^>]+>/g, "")                   // HTML tags
          .replace(/[#*`>_\[\]()]/g, "")             // remaining markdown syntax
          .replace(/\n+/g, " ")
          .trim()
          .slice(0, 500)
        return [{ slug, title, date, snippet, tags, subsection, parent }]
      } catch {
        return []
      }
    })
}

// Sort SECTIONS so more-specific paths come first (longer path = more specific).
// This way, personal/docs/growth/self-improvement is matched before personal/docs/growth.
const sortedSections = [...SECTIONS].sort((a, b) => b.path.length - a.path.length)

// Build a filePath → title map so sub-docs can show their parent's title in search
const filePathToTitle = new Map()
for (const section of sortedSections) {
  const files = getMarkdownFiles(section.path)
  for (const f of files) {
    const filePath = `${section.path}/${f.slug}.md`
    filePathToTitle.set(filePath, f.title)
  }
}

// Static nav pages (Next.js route pages, not markdown files, that should appear in search).
// These are important hub/section pages that have no markdown source.
const NAV_PAGES = [
  { title: "Health", url: "/self/health", icon: "💚", section: "self", snippet: "Health tracking, medications, and wellness notes" },
  { title: "Routine", url: "/self/routine", icon: "🧘", section: "self", snippet: "Morning routine and daily habits" },
  { title: "Hobbies", url: "/self/hobbies", icon: "🎨", section: "self", snippet: "Hobbies, interests, and creative projects" },
  { title: "Tasks", url: "/tasks", icon: "✅", section: "work", snippet: "Task list, to-dos, and priorities" },
]

// Track files already indexed by their final URL to avoid duplicates
// (the same content may exist in both personal/site/ and personal/docs/).
const seen = new Set()
const entries = []

// Add static nav pages first (they get a priority boost from being shorter URLs)
for (const page of NAV_PAGES) {
  if (seen.has(page.url)) continue
  seen.add(page.url)
  entries.push({ ...page, slug: page.url, tags: "", date: "", subsection: "" })
}

for (const section of sortedSections) {
  const files = getMarkdownFiles(section.path)
  for (const f of files) {
    const url = `${section.urlPrefix}/${f.slug}`
    if (seen.has(url)) continue
    seen.add(url)

    const parentTitle = f.parent ? (filePathToTitle.get(f.parent) || null) : null

    entries.push({
      title: f.title,
      slug: f.slug,
      url: `${section.urlPrefix}/${f.slug}`,
      icon: section.icon,
      section: section.section,
      subsection: f.subsection,
      snippet: f.snippet,
      tags: f.tags,
      date: f.date,
      ...(f.parent ? { parent: f.parent, parentTitle } : {}),
    })
  }
}

// Write to site/data/ (not public/) so it's served behind auth via /api/search.
// This prevents private journal/reflection snippets from being publicly accessible.
const dataDir = path.join(SITE_DIR, "data")
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
const outPath = path.join(dataDir, "search-index.json")
fs.writeFileSync(outPath, JSON.stringify(entries))
console.log(`Search index: ${entries.length} entries → data/search-index.json`)
