#!/usr/bin/env node
/**
 * Generates site/.content-cache/content-cache.json at build time.
 *
 * This pre-build step is the solution to Vercel's 250MB serverless function size limit.
 * The problem: site/lib/content.ts uses fs to read from REPO_ROOT (parent of site/),
 * which causes Next.js's file tracer (nft) to bundle the entire work/, personal/,
 * and personal/ directories into every serverless function (250MB+ per function).
 *
 * The fix: generate a static JSON cache of all markdown files here, inside site/.
 * content.ts then require()s this JSON — nft traces a single ~5MB file instead of
 * 27,000+ external files.
 *
 * Run from repo root or from site/ — script handles both.
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import matter from "gray-matter"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Always resolve relative to the repo root (parent of site/)
const SITE_DIR = path.resolve(__dirname, "..")
const REPO_ROOT = path.resolve(SITE_DIR, "..")

const CACHE_DIR = path.join(SITE_DIR, ".content-cache")
const CACHE_PATH = path.join(CACHE_DIR, "content-cache.json")

// Directories to scan (relative to REPO_ROOT).
// Excludes repos (code) and .git directories.
// personal/context is excluded — private Claude reference files, not browsable content.
const SCAN_ROOTS = [
  "personal/docs",
  "personal/notes",
  "personal/site",
  "work/site/strategy",
  "work/docs",
  "work/notes",
  "external",
]

// Paths to exclude from the cache (prefix match against repoRelPath)
const EXCLUDE_PREFIXES = []

// ─── Auto-tagging (replicated from lib/auto-tagger.ts for build-time use) ──

const PATH_SEGMENT_TAGS = {
  "health": ["health"], "mental-health": ["mental-health"],
  "physical-therapy": ["health", "fitness"], "gut-health": ["health"],
  "longevity": ["health"], "fitness-diet": ["health", "fitness"],
  "health-care": ["health"], "finances": ["finance"], "finance": ["finance"],
  "career": ["career"], "career-external": ["career"],
  "work": ["work"],  // "career" intentionally removed — not all work content is career-related
  "work-meetings": ["work"], "relationship": ["relationship"],
  "spirit": ["spiritual"], "spirituality": ["spiritual"],
  "spiritual": ["spiritual"],
  "mindvalley": ["mindvalley", "learning"], "learning": ["learning"],
  "library": ["learning"], "growth": ["growth"], "side-hustles": ["side-hustle"], "travel": ["travel"],
  "housing": ["housing"], "hobbies": ["hobbies"], "plants": ["hobbies"],
  "certifications": ["career", "learning"],
  "costa-rica": ["travel"], "social": ["relationship"],
  "philosophy": ["spiritual"], "astrology": ["spiritual"],
  "journal": ["journal"], "reflections": ["reflection"],
  "notes": ["note"], "quotes": ["quote"],
  "dreams": ["dream"], "prds": ["prd"], "goals": ["goal"],
  "decisions": ["decision"], "analyses": ["analysis"], "agendas": ["agenda"],
  "strategy": ["strategy"], "guides": ["guide"], "roadmaps": ["roadmap"],
  "research": ["research"], "reviews": ["review"], "comms": ["comms"],
  "weekly-plans": ["weekly-plan"], "weekly-reviews": ["weekly-review"],
  "logs": ["log"],
  "therapy": ["mental-health"], "tms": ["mental-health"],
  "psychedelics": ["mental-health"], "acupuncture": ["mental-health"],
  "reiki": ["mental-health", "spiritual"], "eft": ["mental-health"],
  "nmt": ["mental-health"], "supplements": ["mental-health", "health"],
  "sit": ["mental-health"],  // "writing" removed — too generic, not a reliable mental-health signal
  "anti-depressants": ["mental-health"],
  "safe-and-sound-protocol": ["mental-health"],
  "tdcs-tacs-pemf": ["mental-health"],
  "astrology-energy-healers": ["spiritual", "mental-health"],
  "miracle-journal": ["spiritual", "journal"],
  "atnp": ["side-hustle"], "content-creation": ["side-hustle"],
  "main-st-businesses": ["side-hustle"], "youtube-automation": ["side-hustle"],
  "asana": ["work", "career"], "peregrine": ["work", "career"],
  "together": ["work", "career"], "private": [],
  "signs-and-symbols": ["spiritual"],
}

const FRONTMATTER_TYPE_TAGS = {
  "journal": ["journal"], "note": ["note"], "dream": ["dream"],
  "quote": ["quote"], "idea": ["note"], "articles": ["reference"],
  "reflection": ["reflection"],
}

const FRONTMATTER_JOURNAL_TYPE_TAGS = {
  "daily-journal": ["journal"], "reflections": ["reflection"],
}

const KEYWORD_RULES = [
  [/\btherap(y|ist)\b/i, ["mental-health"]], [/\bdepression\b/i, ["mental-health"]],
  [/\banxiety\b/i, ["mental-health"]], [/\bmeditation\b/i, ["spiritual"]],
  [/\bmanifest(ation|ing)?\b/i, ["spiritual"]],
  [/\bbudget\b/i, ["finance"]], [/\bnet\s*worth\b/i, ["finance"]],
  [/\binvest(ment|ing)?\b/i, ["finance"]], [/\btaxes\b/i, ["finance"]],
  [/\binsurance\b/i, ["finance"]], [/\b401k|roth\s*ira\b/i, ["finance"]],
  [/\bmonarch\s*money\b/i, ["finance"]], [/\bworkout\b/i, ["fitness"]],
  [/\b(diet|nutrition)\b/i, ["health"]], [/\bblood\s*work\b/i, ["health"]],
  [/\bdoctor\b/i, ["health"]], [/\b(job|hiring)\s+interview\b/i, ["career"]],
  [/\bresume\b/i, ["career"]], [/\bjob\s*search\b/i, ["career"]],
  [/\bperf\s*review\b/i, ["career", "work"]],
]

// LABEL_TAG_MAP maps meeting label strings → tag IDs.
// Values can be a string (single tag) or string[] (multiple tags).
// Keep in sync with classify.py TEMPLATE_NAMES — adding a new template requires a new entry here.
const LABEL_TAG_MAP = {
  "finance": "finance", "financial": "finance",
  "financial planning": "finance",
  "therapy": "mental-health",
  "individual therapy": ["mental-health", "therapy"],
  "couples therapy": ["mental-health", "therapy"],
  "spiritual": "spiritual", "reiki spiritual": "spiritual",
  "one on one": "one-on-one",
  "cross functional": "cross-functional",
  "all-hands": "all-hands", "all hands": "all-hands",
  "external": "external", "sprint cycle": "sprint-cycle",
  "technical": "technical",
  "commerce": "commerce",
  "identity & collaboration": "identity-collaboration",
  "product foundations": "product-foundations",
  // classify.py outputs these label strings — map to correct tag IDs
  "1:1": "one-on-one",
  "logistics": "life-admin",
  "personal logistics": "life-admin",
  "general": "pm",
}

/**
 * Compute auto-tags for a cache entry. Mirrors lib/auto-tagger.ts autoTag().
 * @param {string} filePath - repo-relative path
 * @param {string} [title] - display title
 * @param {string} [content] - file content (first 500 chars used)
 * @param {Record<string, string>} [frontmatter] - normalized frontmatter
 * @returns {string[]} sorted, deduplicated tag ids
 */
function computeAutoTags(filePath, title, content, frontmatter) {
  const tags = new Set()

  // Layer 1: Path-based (lowercase segments to handle filenames like SIT.md → "sit")
  for (const segment of filePath.split("/")) {
    const matched = PATH_SEGMENT_TAGS[segment.toLowerCase()]
    if (matched) for (const t of matched) tags.add(t)
  }

  // Layer 2: Frontmatter-based
  if (frontmatter) {
    const fmType = frontmatter.type?.toLowerCase()
    if (fmType && FRONTMATTER_TYPE_TAGS[fmType]) {
      for (const t of FRONTMATTER_TYPE_TAGS[fmType]) tags.add(t)
    }
    const journalType = frontmatter.journal_type?.toLowerCase()
    if (journalType && FRONTMATTER_JOURNAL_TYPE_TAGS[journalType]) {
      for (const t of FRONTMATTER_JOURNAL_TYPE_TAGS[journalType]) tags.add(t)
    }
    // category: work/personal → source tag (preferred over context field which meeting notes don't use)
    const cat = frontmatter.category?.toLowerCase()
    if (cat === "work") tags.add("work")
    if (cat === "personal") tags.add("personal")
    // legacy: context field (kept for backward compat with any non-meeting files that use it)
    const ctx = frontmatter.context?.toLowerCase()
    if (ctx === "work") tags.add("work")
    // label → area/meeting-type tag (set by meeting automation, reflects actual content category)
    // check label, meeting_type_label, AND work_area_label (newer notes use all three)
    const labelSources = [
      frontmatter.label,
      frontmatter.meeting_type_label,
      frontmatter.work_area_label,
    ]
    for (const src of labelSources) {
      const l = src?.toLowerCase().trim()
      const mapped = l && LABEL_TAG_MAP[l]
      if (mapped) {
        for (const t of Array.isArray(mapped) ? mapped : [mapped]) tags.add(t)
      }
    }
  }

  // Layer 2b: Merge explicit frontmatter.tags so manual overrides feed into autoTags.
  // frontmatter.tags is always a comma-joined string after normalizeFrontmatter().
  if (frontmatter?.tags) {
    for (const t of frontmatter.tags.split(",").map((t) => t.trim()).filter(Boolean)) {
      tags.add(t)
    }
  }

  // Layer 3: Keyword-based (scan title + first 1500 chars — meeting notes have ~300 char headers)
  const textToScan = [title || "", (content || "").slice(0, 1500)].join(" ")
  if (textToScan.trim()) {
    for (const [pattern, tagIds] of KEYWORD_RULES) {
      if (pattern.test(textToScan)) {
        for (const t of tagIds) tags.add(t)
      }
    }
  }

  return Array.from(tags).sort()
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function slugToTitle(slug) {
  const filename = slug.split("/").pop() ?? slug
  return filename
    .replace(/-+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function extractH1(content) {
  // Match # or ## headings — meeting notes commonly use ##
  const match = content.match(/^#{1,2}\s+(.+)$/m)
  if (!match) return undefined
  const heading = match[1].trim()
  // Skip headings that are pure timestamps (e.g. "Apr 8, 2026, 6:06 PM")
  // These appear in quick-capture notes and make terrible titles.
  if (/^[A-Z][a-z]+ \d{1,2}, \d{4},? \d{1,2}:\d{2}/.test(heading)) return undefined
  return heading
}

function normalizeValue(v) {
  if (v === null || v === undefined) return ""
  if (typeof v === "string") return v
  if (v instanceof Date) return v.toISOString().split("T")[0]
  return String(v)
}

function normalizeFrontmatter(data) {
  const result = {}
  for (const key of Object.keys(data)) {
    const val = data[key]
    if (Array.isArray(val)) {
      result[key] = val.map(normalizeValue).join(", ")
    } else {
      result[key] = normalizeValue(val)
    }
  }
  return result
}

/** Recursively collect all file paths under a directory */
function readDirRecursive(dirPath, base = "") {
  let entries
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true })
  } catch {
    return []
  }
  const files = []
  for (const entry of entries) {
    const relPath = base ? `${base}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      // Skip .git directories
      if (entry.name === ".git") continue
      files.push(...readDirRecursive(path.join(dirPath, entry.name), relPath))
    } else if (entry.isFile()) {
      files.push(relPath)
    }
  }
  return files
}

// ─── Main ────────────────────────────────────────────────────────────────────

/** @type {Record<string, {slug: string, frontmatter: Record<string,string>, content: string, displayTitle: string}>} */
const cache = {}
let totalFiles = 0
let skipped = 0

for (const scanRoot of SCAN_ROOTS) {
  const absDir = path.join(REPO_ROOT, scanRoot)
  if (!fs.existsSync(absDir)) {
    console.log(`  skip (not found): ${scanRoot}`)
    continue
  }

  const files = readDirRecursive(absDir)
  const mdFiles = files.filter((f) =>
    f.endsWith(".md") &&
    !f.includes("README") &&
    !f.endsWith("_traditional.md") &&
    !f.endsWith(".gitkeep")
  )

  for (const file of mdFiles) {
    const absPath = path.join(absDir, file)
    const repoRelPath = `${scanRoot}/${file}`
    const raw = fs.readFileSync(absPath, "utf-8")

    // Skip excluded paths
    if (EXCLUDE_PREFIXES.some((ex) => repoRelPath.startsWith(ex))) {
      skipped++
      continue
    }

    try {
      const { data, content } = matter(raw)
      const slug = file.replace(/\.md$/, "")
      const fm = normalizeFrontmatter(data)
      // Convention: titles should NOT contain dates. Dates live in frontmatter (date/created fields).
      const displayTitle = fm.title || extractH1(content) || slugToTitle(slug)
      // Strip leading H1 from content so detail pages don't render it twice
      // (the page header already shows displayTitle)
      const contentWithoutH1 = content.replace(/^#{1,2}\s+.+\n?/, "").trimStart()

      // Compute auto-tags at build time (deterministic from path + content)
      const autoTags = computeAutoTags(repoRelPath, displayTitle, contentWithoutH1, fm)

      // Archive paths are always hidden from the docs list
      if (repoRelPath.includes("/archive/")) {
        fm.hidden = "true"
      }

      cache[repoRelPath] = {
        slug,
        frontmatter: fm,
        content: contentWithoutH1,
        displayTitle,
        autoTags,
      }
      totalFiles++
    } catch {
      // Skip files with unparseable frontmatter
      skipped++
    }
  }
}

// Ensure output directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true })
}

const cacheJSON = JSON.stringify(cache)
fs.writeFileSync(CACHE_PATH, cacheJSON)

// Write index cache: same structure, same keys, but omit the `content` field.
// List pages use this to avoid loading 6MB+ of markdown body text at runtime.
const indexCache = {}
for (const [k, v] of Object.entries(cache)) {
  const { content, ...meta } = v
  indexCache[k] = meta
}
const INDEX_PATH = path.join(CACHE_DIR, "content-index.json")
const indexJSON = JSON.stringify(indexCache)
fs.writeFileSync(INDEX_PATH, indexJSON)

const sizeKB = Math.round(Buffer.byteLength(cacheJSON) / 1024)
const indexSizeKB = Math.round(Buffer.byteLength(indexJSON) / 1024)
console.log(
  `Content cache: ${totalFiles} files (${skipped} skipped) → .content-cache/content-cache.json (${sizeKB} KB)`
)
console.log(
  `Content index: ${totalFiles} files → .content-cache/content-index.json (${indexSizeKB} KB)`
)

// ─── Build-time tag validation ───────────────────────────────────────────────
// Warn if any autoTag ID doesn't exist in the taxonomy — catches drift before it ships.
const VALID_TAG_IDS = new Set([
  // area
  "health", "mental-health", "fitness", "finance", "career", "relationship", "pets",
  "spiritual", "learning", "mindvalley", "side-hustle", "travel", "housing", "hobbies",
  "growth", "life-admin",
  // type
  "journal", "reflection", "quote", "dream", "prd", "goal", "decision", "analysis",
  "agenda", "strategy", "guide", "roadmap", "research", "review", "comms",
  "weekly-plan", "weekly-review", "log",
  // source
  "work", "personal", "note",
  // work-area
  "commerce", "identity-collaboration", "product-foundations", "pm",
  // meeting-type
  "cross-functional", "one-on-one", "all-hands", "external", "sprint-cycle",
  "technical", "therapy", "triage",
])
const orphanTagIds = new Set()
for (const entry of Object.values(cache)) {
  for (const t of entry.autoTags) {
    if (!VALID_TAG_IDS.has(t)) orphanTagIds.add(t)
  }
}
if (orphanTagIds.size > 0) {
  console.warn(`⚠  Unknown tag IDs in autoTags (not in taxonomy): ${[...orphanTagIds].sort().join(", ")}`)
} else {
  console.log("✓  All autoTag IDs valid")
}
