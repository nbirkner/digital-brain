import type { Metadata } from "next"
import CopyUrlButton from "./CopyUrlButton"

export const metadata: Metadata = {
  robots: "noindex, nofollow",
}

export default function ExternalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-notion-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-notion-border/40 px-6 py-3 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-notion-accent/10 flex items-center justify-center shrink-0">
              <span className="text-base leading-none">🧠</span>
            </div>
            <span className="font-semibold text-notion-text text-sm tracking-tight">
              digital-brain
            </span>
          </div>
          <CopyUrlButton />
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        {children}
      </main>

      {/* Persistent footer disclaimer */}
      <footer className="shrink-0 border-t border-notion-border/30 bg-notion-surface/60 backdrop-blur-sm px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <p className="text-xs text-notion-muted/50 leading-relaxed">
            This is a publicly published page from{" "}
            <span className="text-notion-muted/70 font-medium">digital-brain</span>
            {" "}— a personal digital OS. Only pages explicitly shared are accessible here.
          </p>
          <a
            href="your domain"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-notion-muted/30 shrink-0 hidden sm:block hover:text-notion-muted/60 transition-colors"
          >
            your domain
          </a>
        </div>
      </footer>
    </div>
  )
}
