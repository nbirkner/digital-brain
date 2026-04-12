/**
 * External pages config — defines what's publicly accessible at /external/[slug].
 *
 * Two types:
 *   "dedicated" — standalone pages that only exist as external (no private counterpart)
 *   "published"  — private pages made public; contentPath points to the markdown file
 *                  in the repo that gets rendered at the external URL
 *
 * To publish a private page:
 *   1. Add an entry below with type: "published" and the contentPath
 *   2. Commit and push — Vercel auto-deploys
 *
 * To unpublish: remove the entry, commit, push.
 *
 * createdAt: ISO date string (e.g. "2026-04-01") indicating when the page was added.
 */

export interface DedicatedExternalPage {
  type: "dedicated"
  slug: string
  icon: string
  label: string
  description: string
  createdAt: string
}

export interface PublishedPrivatePage {
  type: "published"
  slug: string
  icon: string
  label: string
  description: string
  /** Repo-relative path to the markdown file, e.g. "personal/docs/career/resume.md" */
  contentPath: string
  /** The internal site path where this page lives, e.g. "/life/travel/sisters-trip-sedona" */
  internalPath: string
  /** Optional: human-readable source label shown in the admin hub */
  sourceLabel?: string
  createdAt: string
}

export type ExternalPage = DedicatedExternalPage | PublishedPrivatePage

export const EXTERNAL_PAGES: ExternalPage[] = [
  // --- Dedicated public pages ---
  // Add your own dedicated external pages here. Example:
  // {
  //   type: "dedicated",
  //   slug: "about",
  //   icon: "👤",
  //   label: "About Me",
  //   description: "Who I am — career, background, what I care about.",
  //   createdAt: "2026-01-01",
  // },

  // --- Published private pages ---
  // To publish a private markdown page publicly, add an entry like this:
  // {
  //   type: "published",
  //   slug: "resume",
  //   icon: "📄",
  //   label: "Resume",
  //   description: "Current professional resume.",
  //   contentPath: "personal/docs/career/resume.md",
  //   internalPath: "/self/private/resume",
  //   sourceLabel: "career",
  //   createdAt: "2026-01-01",
  // },
]
export function getDedicatedPages(): DedicatedExternalPage[] {
  return EXTERNAL_PAGES.filter((p): p is DedicatedExternalPage => p.type === "dedicated")
}

export function getPublishedPrivatePages(): PublishedPrivatePage[] {
  return EXTERNAL_PAGES.filter((p): p is PublishedPrivatePage => p.type === "published")
}

export function getPageBySlug(slug: string): ExternalPage | undefined {
  return EXTERNAL_PAGES.find((p) => p.slug === slug)
}

export function getPublishedPageByInternalPath(path: string): PublishedPrivatePage | undefined {
  return getPublishedPrivatePages().find((p) => p.internalPath === path)
}
