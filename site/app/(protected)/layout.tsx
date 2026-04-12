"use client"

import { useState, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"
import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"
import NavigationProgress from "@/components/NavigationProgress"
import GlobalSearch from "@/components/GlobalSearch"
import AutoRefresh from "@/components/AutoRefresh"
import TodoistQuickAdd from "@/components/TodoistQuickAdd"
import { getPublishedPageByInternalPath } from "@/data/external-published"
import { useGlobalKeyNav } from "@/hooks/useGlobalKeyNav"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()
  useGlobalKeyNav()
  const publishedPage = getPublishedPageByInternalPath(pathname)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(tag)) {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const startX = touchStartX.current
    const deltaX = e.changedTouches[0].clientX - startX
    touchStartX.current = null
    // Swipe left more than 50px closes the sidebar
    if (deltaX < -50 && sidebarOpen) {
      setSidebarOpen(false)
    }
    // Swipe right from left edge (within 40px) opens the sidebar
    if (deltaX > 60 && !sidebarOpen && startX < 40) {
      setSidebarOpen(true)
    }
  }

  return (
    <>
    <div className="flex h-screen overflow-hidden bg-notion-bg">
        <NavigationProgress />
        <AutoRefresh />
        <Sidebar
          mobileOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpen={() => setSidebarOpen(true)}
          onSearchOpen={() => setSearchOpen(true)}
        />

        {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-60">
          <Header onMenuClick={() => setSidebarOpen(true)} onSearchOpen={() => setSearchOpen(true)} />

          <main
            className="flex-1 overflow-y-auto overflow-x-hidden main-pb"
            style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
              {publishedPage && (
                <a
                  href={`${process.env.NEXTAUTH_URL ?? ""}/external/${publishedPage.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 w-fit text-xs text-blue-700 hover:bg-blue-500/15 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  <span className="font-medium">Published</span>
                  <span className="text-blue-400/60">·</span>
                  <span className="font-mono">your-domain.com/external/{publishedPage.slug}</span>
                </a>
              )}
              {children}
            </div>
          </main>
        </div>

      </div>
      <TodoistQuickAdd />
    </>
  )
}
