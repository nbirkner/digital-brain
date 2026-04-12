import type { Metadata } from "next"
import { EXTERNAL_PAGES } from "@/data/external-published"

export const metadata: Metadata = {
  title: "Public Pages — Niki's Brain",
  description: "Publicly shared pages from Niki Birkner's personal OS.",
  robots: "noindex, nofollow",
}

export default function ExternalIndexPage() {
  const pages = EXTERNAL_PAGES

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-notion-text mb-2">Public Pages</h1>
        <p className="text-notion-muted text-sm">
          Pages explicitly shared from Niki&apos;s personal OS. Everything else requires login.
        </p>
      </div>

      <div className="space-y-3">
        {pages.map((page) => (
          <a
            key={page.slug}
            href={`/external/${page.slug}`}
            className="flex items-start gap-4 p-4 rounded-xl bg-notion-surface border border-notion-border hover:border-notion-accent/30 transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-notion-hover flex items-center justify-center shrink-0 text-xl">
              {page.icon}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-notion-text text-sm group-hover:text-notion-accent transition-colors">
                {page.label}
              </p>
              <p className="text-notion-muted text-xs mt-0.5 leading-relaxed">{page.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
