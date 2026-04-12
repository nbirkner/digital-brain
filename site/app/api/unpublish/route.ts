import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/require-auth"

const BRANCH = process.env.GITHUB_BRANCH ?? "main"
const FILE_PATH = "site/data/external-published.ts"

/**
 * Removes a published private page entry from external-published.ts via GitHub API.
 * Auth-protected — only callable with a valid session.
 *
 * POST /api/unpublish
 * Body: { slug: string }
 */
export async function POST(req: NextRequest) {
  const unauth = await requireAuth()
  if (unauth) return unauth

  const REPO = process.env.GITHUB_REPO
  if (!REPO) {
    return NextResponse.json({ error: "GITHUB_REPO env var not set" }, { status: 500 })
  }

  const token = process.env.GITHUB_TOKEN
  if (!token) {
    return NextResponse.json({ error: "GitHub token not configured" }, { status: 500 })
  }

  let body: { slug?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const slug = body.slug?.trim()
  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 })
  }

  const apiBase = `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  }

  // Fetch current file
  const getRes = await fetch(`${apiBase}?ref=${BRANCH}`, { headers })
  if (!getRes.ok) {
    return NextResponse.json({ error: "Failed to fetch file from GitHub" }, { status: 502 })
  }
  const { content: encoded, sha } = await getRes.json()
  const original = Buffer.from(encoded, "base64").toString("utf-8")

  // Find and remove the entry block for this slug
  const updated = removePublishedEntry(original, slug)
  if (updated === original) {
    return NextResponse.json({ error: `Slug "${slug}" not found in published pages` }, { status: 404 })
  }

  // Commit the updated file
  const putRes = await fetch(apiBase, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `unpublish: remove ${slug} from external-published.ts`,
      content: Buffer.from(updated).toString("base64"),
      sha,
      branch: BRANCH,
    }),
  })

  if (!putRes.ok) {
    const err = await putRes.text()
    return NextResponse.json({ error: `GitHub commit failed: ${err}` }, { status: 502 })
  }

  return NextResponse.json({ success: true, slug })
}

/**
 * Removes the published entry block for a given slug from the file content.
 * Matches object literals of the form:
 *   {
 *     type: "published",
 *     slug: "SLUG",
 *     ...
 *   },
 */
function removePublishedEntry(content: string, slug: string): string {
  const lines = content.split("\n")
  const result: string[] = []
  let i = 0

  while (i < lines.length) {
    const trimmed = lines[i].trim()

    // Detect start of an object block
    if (trimmed === "{") {
      // Collect the full block until closing },
      const block: string[] = [lines[i]]
      i++

      while (i < lines.length) {
        block.push(lines[i])
        const t = lines[i].trim()
        if (t === "}," || t === "}") {
          i++
          break
        }
        i++
      }

      const blockText = block.join("\n")
      const hasPublished = blockText.includes(`type: "published"`)
      const hasSlug = blockText.includes(`slug: "${slug}"`)

      if (hasPublished && hasSlug) {
        // Skip this block and consume any blank line immediately after
        if (result.length > 0 && result[result.length - 1] === "") {
          // also remove trailing blank line before
        }
        continue
      } else {
        result.push(...block)
      }
    } else {
      result.push(lines[i])
      i++
    }
  }

  return result.join("\n")
}
