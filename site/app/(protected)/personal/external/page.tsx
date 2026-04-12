"use client"

import { useState } from "react"
import PageHeader from "@/components/PageHeader"
import PagePathStatic from "@/components/PagePathStatic"
import { EXTERNAL_PAGES } from "@/data/external-published"
import type { PublishedPrivatePage } from "@/data/external-published"

const PAGE_SIZE = 5

function CopyButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    const url = `${window.location.origin}/external/${slug}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
        copied
          ? "bg-green-500/10 border-green-500/30 text-green-600"
          : "bg-notion-accent/10 border-notion-accent/20 text-notion-accent hover:bg-notion-accent/20"
      }`}
    >
      {copied ? "✓ Copied!" : "Copy link"}
    </button>
  )
}

function UnpublishButton({ slug }: { slug: string }) {
  const [state, setState] = useState<"idle" | "confirm" | "loading" | "done">("idle")

  async function handleUnpublish() {
    if (state === "idle") { setState("confirm"); return }
    setState("loading")
    try {
      const res = await fetch("/api/unpublish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      })
      if (!res.ok) throw new Error("Failed")
      setState("done")
    } catch {
      setState("idle")
      alert("Unpublish failed — check console or try again.")
    }
  }

  if (state === "done") {
    return (
      <span className="text-xs px-3 py-1.5 rounded-lg bg-notion-hover border border-notion-border text-notion-muted">
        Redeploying (~1 min)
      </span>
    )
  }

  return (
    <button
      onClick={handleUnpublish}
      disabled={state === "loading"}
      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
        state === "confirm"
          ? "bg-red-500/10 border-red-500/30 text-red-600 hover:bg-red-500/20"
          : "bg-notion-hover border-notion-border text-notion-muted hover:text-red-500 hover:border-red-500/30"
      }`}
    >
      {state === "loading" ? "Unpublishing…" : state === "confirm" ? "Confirm?" : "Unpublish"}
    </button>
  )
}

function PageRow({
  icon,
  label,
  description,
  slug,
  showUnpublish,
  internalPath,
  createdAt,
}: {
  icon: string
  label: string
  description: string
  slug: string
  showUnpublish?: boolean
  internalPath?: string
  createdAt?: string
}) {
  const dateLabel = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null

  return (
    <div className="bg-notion-surface border border-notion-border rounded-xl p-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-2xl shrink-0">{icon}</span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {internalPath ? (
              <a href={internalPath} className="font-medium text-notion-text text-sm hover:underline">{label}</a>
            ) : (
              <p className="font-medium text-notion-text text-sm">{label}</p>
            )}
            {dateLabel && (
              <span className="text-[11px] text-notion-muted/60">{dateLabel}</span>
            )}
          </div>
          <p className="text-notion-muted text-xs mt-0.5 truncate">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {internalPath && (
          <a
            href={internalPath}
            className="text-xs px-3 py-1.5 rounded-lg bg-notion-hover border border-notion-border text-notion-muted hover:text-notion-text transition-colors"
          >
            View page
          </a>
        )}
        <a
          href={`/external/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-3 py-1.5 rounded-lg bg-notion-hover border border-notion-border text-notion-muted hover:text-notion-text transition-colors"
        >
          Preview ↗
        </a>
        <CopyButton slug={slug} />
        {showUnpublish && <UnpublishButton slug={slug} />}
      </div>
    </div>
  )
}

function PaginatedSection({
  items,
  sectionPage,
  setSectionPage,
}: {
  items: typeof EXTERNAL_PAGES
  sectionPage: number
  setSectionPage: (p: number) => void
}) {
  const totalPages = Math.ceil(items.length / PAGE_SIZE)
  const paginated = items.slice(sectionPage * PAGE_SIZE, (sectionPage + 1) * PAGE_SIZE)
  const showPagination = items.length > PAGE_SIZE

  return (
    <>
      <div className="space-y-1.5">
        {paginated.map((p) => (
          <PageRow
            key={p.slug}
            icon={p.icon}
            label={p.label}
            description={p.description}
            slug={p.slug}
            createdAt={p.createdAt}
            internalPath={p.type === "published" ? (p as PublishedPrivatePage).internalPath : undefined}
            showUnpublish={p.type === "published"}
          />
        ))}
      </div>

      {showPagination && (
        <div className="flex items-center justify-center gap-4 mt-3">
          <button
            onClick={() => setSectionPage(Math.max(0, sectionPage - 1))}
            disabled={sectionPage === 0}
            className="text-xs px-3 py-1.5 rounded-lg border border-notion-border bg-notion-hover text-notion-muted hover:text-notion-text transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            ← Prev
          </button>
          <span className="text-xs text-notion-muted/60">
            {sectionPage + 1} of {totalPages}
          </span>
          <button
            onClick={() => setSectionPage(Math.min(totalPages - 1, sectionPage + 1))}
            disabled={sectionPage === totalPages - 1}
            className="text-xs px-3 py-1.5 rounded-lg border border-notion-border bg-notion-hover text-notion-muted hover:text-notion-text transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            Next →
          </button>
        </div>
      )}
    </>
  )
}

export default function ExternalHubPage() {
  const [dedicatedPage, setDedicatedPage] = useState(0)
  const [publishedPage, setPublishedPage] = useState(0)

  const dedicated = [...EXTERNAL_PAGES]
    .filter((p) => p.type === "dedicated")
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))

  const published = [...EXTERNAL_PAGES]
    .filter((p) => p.type === "published")
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))

  return (
    <div>
      <PagePathStatic path="personal/external" />
      <PageHeader
        icon="🔗"
        title="External Pages"
        description="Public pages — anyone with the link can view. Not indexed by search engines."
      />

      {/* Dedicated public pages */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-notion-muted/60 uppercase tracking-wider mb-3">
          Public Pages
        </h2>
        <PaginatedSection
          items={dedicated}
          sectionPage={dedicatedPage}
          setSectionPage={setDedicatedPage}
        />
      </section>

      {/* Published private pages */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-notion-muted/60 uppercase tracking-wider mb-3">
          Private Pages Made Public
        </h2>
        {published.length === 0 ? (
          <div className="bg-notion-surface border border-notion-border border-dashed rounded-xl p-6 text-center">
            <p className="text-notion-muted text-sm">No private pages published yet.</p>
            <p className="text-notion-muted/60 text-xs mt-1">
              To share a private page, ask Claude to add it to{" "}
              <code className="bg-notion-hover px-1 py-0.5 rounded">site/data/external-published.ts</code>{" "}
              with <code className="bg-notion-hover px-1 py-0.5 rounded">type: &quot;published&quot;</code>.
              It gets its own public URL at{" "}
              <code className="bg-notion-hover px-1 py-0.5 rounded">/external/[slug]</code> while staying private on the site.
            </p>
          </div>
        ) : (
          <PaginatedSection
            items={published}
            sectionPage={publishedPage}
            setSectionPage={setPublishedPage}
          />
        )}
      </section>

      <p className="text-notion-muted/40 text-xs">
        External pages show only their content — no sidebar, no navigation, no auth. Recipients see nothing else.
      </p>
    </div>
  )
}
