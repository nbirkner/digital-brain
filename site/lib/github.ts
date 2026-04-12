/**
 * github.ts
 *
 * GitHub API wrapper. Uses the Git Data API (trees + blobs) to batch
 * all file changes into a single commit, avoiding multiple Vercel deploys
 * per capture.
 */

const token = process.env.GITHUB_TOKEN
const repo = process.env.GITHUB_REPO
const branch = process.env.GITHUB_BRANCH || "main"
const API = "https://api.github.com"

function getBaseHeaders(): HeadersInit {
  if (!token) throw new Error("GITHUB_TOKEN env var is not configured")
  if (!repo) throw new Error("GITHUB_REPO env var is not configured")
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
    Accept: "application/vnd.github+json",
  }
}

export interface FileChange {
  path: string
  content: string
  encoding: "utf-8" | "base64"
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/** Read a text file. Returns null if it doesn't exist. */
export async function getFile(path: string): Promise<{ content: string; sha: string } | null> {
  const res = await fetch(`${API}/repos/${repo}/contents/${path}?ref=${branch}`, {
    headers: getBaseHeaders(),
    cache: "no-store",
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GitHub getFile failed (${res.status}) for: ${path}`)
  const data = await res.json()
  return {
    content: Buffer.from(data.content, "base64").toString("utf8"),
    sha: data.sha,
  }
}

// ─── Batch commit ─────────────────────────────────────────────────────────────

/**
 * Commit multiple file changes in a single Git commit.
 * Uses the Git Data API: blobs → tree → commit → ref update.
 * This is one commit regardless of how many files are touched,
 * so it triggers only one Vercel deployment.
 */
export type CommitResult = "ok" | "conflict" | "error"

/**
 * Commit multiple file changes in a single Git commit.
 * Returns "conflict" if another commit landed between our read and write —
 * the caller should re-read file state and retry.
 */
export async function batchCommit(files: FileChange[], message: string): Promise<CommitResult> {
  try {
    // 1. Get current HEAD sha
    const refRes = await fetch(`${API}/repos/${repo}/git/ref/heads/${branch}`, {
      headers: getBaseHeaders(),
      cache: "no-store",
    })
    if (!refRes.ok) throw new Error(`getRef failed: ${refRes.status}`)
    const { object: { sha: headSha } } = await refRes.json()

    // 2. Get base tree sha from that commit
    const commitRes = await fetch(`${API}/repos/${repo}/git/commits/${headSha}`, {
      headers: getBaseHeaders(),
    })
    if (!commitRes.ok) throw new Error(`getCommit failed: ${commitRes.status}`)
    const { tree: { sha: baseTreeSha } } = await commitRes.json()

    // 3. Create a blob for each file
    const blobs = await Promise.all(
      files.map(async (f) => {
        const blobRes = await fetch(`${API}/repos/${repo}/git/blobs`, {
          method: "POST",
          headers: getBaseHeaders(),
          body: JSON.stringify({ content: f.content, encoding: f.encoding }),
        })
        if (!blobRes.ok) throw new Error(`createBlob failed (${blobRes.status}) for: ${f.path}`)
        const { sha } = await blobRes.json()
        return { path: f.path, mode: "100644", type: "blob", sha }
      })
    )

    // 4. Create new tree on top of the existing one
    const treeRes = await fetch(`${API}/repos/${repo}/git/trees`, {
      method: "POST",
      headers: getBaseHeaders(),
      body: JSON.stringify({ base_tree: baseTreeSha, tree: blobs }),
    })
    if (!treeRes.ok) throw new Error(`createTree failed: ${treeRes.status}`)
    const { sha: newTreeSha } = await treeRes.json()

    // 5. Create commit
    const newCommitRes = await fetch(`${API}/repos/${repo}/git/commits`, {
      method: "POST",
      headers: getBaseHeaders(),
      body: JSON.stringify({ message, tree: newTreeSha, parents: [headSha] }),
    })
    if (!newCommitRes.ok) throw new Error(`createCommit failed: ${newCommitRes.status}`)
    const { sha: newCommitSha } = await newCommitRes.json()

    // 6. Update the branch ref — 422 means another commit landed first
    const updateRes = await fetch(`${API}/repos/${repo}/git/refs/heads/${branch}`, {
      method: "PATCH",
      headers: getBaseHeaders(),
      body: JSON.stringify({ sha: newCommitSha }),
    })
    if (updateRes.status === 422) return "conflict"
    if (!updateRes.ok) throw new Error(`updateRef failed: ${updateRes.status}`)

    return "ok"
  } catch (err) {
    console.error("[github.batchCommit]", err)
    return "error"
  }
}
