#!/usr/bin/env node
/**
 * Doc audit script.
 * Usage:
 *   node site/scripts/audit-docs.mjs           # dry run, report only
 *   node site/scripts/audit-docs.mjs --fix     # auto-fix stubs + report
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SITE_DIR = path.resolve(__dirname, "..")
const REPO_ROOT = path.resolve(SITE_DIR, "..")
const CACHE_PATH = path.join(SITE_DIR, ".content-cache", "content-cache.json")

const STUB_SIZE_THRESHOLD = 500      // bytes
const STUB_CONTENT_THRESHOLD = 200   // chars after stripping frontmatter

// Cross-folder tree pair: files under docTree/ are compared against siteTree/
// by matching the relative path after the prefix.
const CROSS_FOLDER_PAIRS = [
  { docTree: "personal/docs/", siteTree: "personal/site/" },
]

function loadCache() {
  const raw = fs.readFileSync(CACHE_PATH, "utf-8")
  const cache = JSON.parse(raw)
  return Object.entries(cache).map(([filePath, data]) => ({
    filePath,
    ...data,
  }))
}

function getFileSizes(files) {
  const sizes = {}
  for (const file of files) {
    try {
      const stat = fs.statSync(path.join(REPO_ROOT, file.filePath))
      sizes[file.filePath] = stat.size
    } catch {
      sizes[file.filePath] = 0
    }
  }
  return sizes
}

function detectNotionStubs(files, sizes) {
  return files.filter((file) => {
    if (file.frontmatter?.hidden === "true") return false
    if (file.frontmatter?.source !== "notion") return false
    // Must also be small — large Notion imports have real content
    const size = sizes[file.filePath] ?? 0
    return size < STUB_SIZE_THRESHOLD
  })
}

function detectThinFiles(files, sizes) {
  return files.filter((file) => {
    if (file.frontmatter?.hidden === "true") return false
    if (file.frontmatter?.source === "notion" && (sizes[file.filePath] ?? 0) < STUB_SIZE_THRESHOLD) return false // already caught by detectNotionStubs
    const size = sizes[file.filePath] ?? 0
    if (size >= STUB_SIZE_THRESHOLD) return false
    const isThinContent = (file.content || "").trim().length < STUB_CONTENT_THRESHOLD
    return isThinContent
  })
}

function normalizeTitle(title) {
  return (title || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function detectDuplicateTitles(files, sizes) {
  const groups = {}

  for (const file of files) {
    if (file.frontmatter?.hidden === "true") continue
    const title = file.displayTitle || ""
    if (!title) continue
    const key = normalizeTitle(title)
    if (!groups[key]) groups[key] = []
    groups[key].push(file)
  }

  return Object.entries(groups)
    .filter(([, group]) => group.length > 1)
    .map(([, group]) => ({
      displayTitle: group[0].displayTitle,
      files: group.sort((a, b) => (sizes[b.filePath] ?? 0) - (sizes[a.filePath] ?? 0)),
    }))
    .sort((a, b) => b.files.length - a.files.length)
}

function detectCrossFolderDups(files, sizes) {
  const results = []

  for (const { docTree, siteTree } of CROSS_FOLDER_PAIRS) {
    const docFiles = files.filter(
      (f) => f.filePath.startsWith(docTree) && f.frontmatter?.hidden !== "true"
    )
    const siteFiles = files.filter(
      (f) => f.filePath.startsWith(siteTree) && f.frontmatter?.hidden !== "true"
    )

    // Index site files by their relative path after the prefix
    const siteIndex = {}
    for (const f of siteFiles) {
      const rel = f.filePath.slice(siteTree.length)
      siteIndex[rel] = f
    }

    for (const docFile of docFiles) {
      const rel = docFile.filePath.slice(docTree.length)
      const siteMatch = siteIndex[rel]
      if (siteMatch) {
        results.push({
          docFile,
          siteFile: siteMatch,
          docSize: sizes[docFile.filePath] ?? 0,
          siteSize: sizes[siteMatch.filePath] ?? 0,
        })
      }
    }
  }

  return results
}

function applyFixes(stubs) {
  const fixed = []

  for (const stub of stubs) {
    const absPath = path.join(REPO_ROOT, stub.filePath)
    try {
      const raw = fs.readFileSync(absPath, "utf-8")

      // Find the closing --- of frontmatter (starts at index 3 to skip the opening ---)
      const closeIdx = raw.indexOf("---", 3)
      if (closeIdx === -1) {
        console.warn(`  [skip] no frontmatter closing --- found: ${stub.filePath}`)
        continue
      }

      // Insert hidden: true on the line before the closing ---
      const before = raw.slice(0, closeIdx)
      const after = raw.slice(closeIdx)
      const fixed_content = before + "hidden: true\n" + after

      fs.writeFileSync(absPath, fixed_content, "utf-8")
      fixed.push(stub)
    } catch (err) {
      console.warn(`  [error] ${stub.filePath}: ${err.message}`)
    }
  }

  return fixed
}

function formatDate(dateStr) {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return isNaN(d) ? dateStr : d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function writeReport({ fixed, pendingNotionStubs, thinFiles, duplicateTitles, crossFolderDups, sizes, fix }) {
  const date = new Date().toISOString().slice(0, 10)
  const lines = []

  lines.push(`=== DOC AUDIT — ${date} ===\n`)

  // Auto-fixed section
  if (fix) {
    if (fixed.length) {
      lines.push(`AUTO-FIXED (${fixed.length} files)`)
      for (const f of fixed) lines.push(`  [stub] ${f.filePath}`)
    } else {
      lines.push(`AUTO-FIXED: none`)
    }
    lines.push("")
  }

  // Notion stubs (dry run only)
  if (!fix && pendingNotionStubs.length) {
    lines.push(`NOTION STUBS — would be hidden with --fix (${pendingNotionStubs.length} files)`)
    for (const f of pendingNotionStubs) {
      const kb = ((sizes[f.filePath] ?? 0) / 1024).toFixed(1)
      lines.push(`  ${f.filePath}  (${kb}KB)`)
    }
    lines.push("")
  }

  // Thin files (needs review)
  if (thinFiles.length) {
    lines.push(`NEEDS REVIEW — Thin files, may be stubs (${thinFiles.length} files)\n`)
    for (const f of thinFiles) {
      const kb = ((sizes[f.filePath] ?? 0) / 1024).toFixed(1)
      lines.push(`  ${f.filePath}  (${kb}KB)`)
    }
    lines.push("")
  }

  // Duplicate titles
  lines.push(`NEEDS REVIEW — Duplicate titles (${duplicateTitles.length} groups)\n`)
  if (duplicateTitles.length === 0) {
    lines.push("  None found.")
    lines.push("")
  }
  for (const group of duplicateTitles) {
    lines.push(`  "${group.displayTitle}" × ${group.files.length}`)
    for (const f of group.files) {
      const kb = ((sizes[f.filePath] ?? 0) / 1024).toFixed(1)
      const dateStr = f.frontmatter?.date || f.frontmatter?.created || "—"
      const name = f.filePath.split("/").pop()
      lines.push(`    ${name.padEnd(50)} ${kb.padStart(6)}KB  ${formatDate(dateStr)}`)
    }
    lines.push("")
  }

  // Cross-folder duplicates
  lines.push(`NEEDS REVIEW — Cross-folder duplicates (${crossFolderDups.length} pairs)\n`)
  if (crossFolderDups.length === 0) {
    lines.push("  None found.")
    lines.push("")
  }
  for (const { docFile, siteFile, docSize, siteSize } of crossFolderDups) {
    const docKb = (docSize / 1024).toFixed(1)
    const siteKb = (siteSize / 1024).toFixed(1)
    lines.push(`  ${docFile.filePath.padEnd(60)} ${docKb.padStart(6)}KB  ← personal/docs copy`)
    lines.push(`  ${siteFile.filePath.padEnd(60)} ${siteKb.padStart(6)}KB  ← site serves this`)
    lines.push("")
  }

  if (!fix) {
    lines.push(`Run with --fix to apply auto-fixes.`)
  }

  const reportText = lines.join("\n")
  console.log(reportText)

  // Save report as hidden doc
  const reportPath = path.join(REPO_ROOT, `work/docs/other/doc-audit-${date}.md`)
  const mdContent = `---
title: Doc Audit Report — ${date}
date: ${date}
hidden: true
---

\`\`\`
${reportText}
\`\`\`
`
  fs.writeFileSync(reportPath, mdContent, "utf-8")
  console.log(`\nReport saved to: work/docs/other/doc-audit-${date}.md`)
}

async function main() {
  const fix = process.argv.includes("--fix")

  console.log("Loading content cache...")
  const files = loadCache()

  console.log(`Scanning ${files.length} files for sizes...`)
  const sizes = getFileSizes(files)

  console.log("Running detectors...\n")
  const notionStubs = detectNotionStubs(files, sizes)
  const thinFiles = detectThinFiles(files, sizes)
  const duplicateTitles = detectDuplicateTitles(files, sizes)
  const crossFolderDups = detectCrossFolderDups(files, sizes)

  let fixed = []
  if (fix) {
    fixed = applyFixes(notionStubs)
  }

  writeReport({ fixed, pendingNotionStubs: fix ? [] : notionStubs, thinFiles, duplicateTitles, crossFolderDups, sizes, fix })
}

main().catch(console.error)
