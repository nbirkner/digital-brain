"use client"

import { useTheme } from "@/components/ThemeProvider"

interface HeaderProps {
  onMenuClick: () => void
  onSearchOpen?: () => void
}

const modeIcons: Record<string, string> = {
  dark: "🌙",
  light: "☀️",
  system: "💻",
}

export default function Header({ onMenuClick, onSearchOpen }: HeaderProps) {
  const { mode, toggleTheme } = useTheme()

  return (
    <header className="border-b border-notion-border/50 flex items-center px-4 gap-3 bg-notion-bg/80 backdrop-blur-md sticky top-0 z-10" style={{ paddingTop: "env(safe-area-inset-top)", minHeight: "calc(48px + env(safe-area-inset-top))" }}>
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-1 text-notion-muted hover:text-notion-text min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Search button — mobile only, hidden on desktop (sidebar has search) */}
      {onSearchOpen && (
        <button
          onClick={onSearchOpen}
          className="lg:hidden p-2 text-notion-muted hover:text-notion-text min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Search"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      )}

      <button
        onClick={toggleTheme}
        title={`Switch theme (currently ${mode})`}
        className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs text-notion-muted hover:text-notion-text hover:bg-notion-hover transition-all border border-transparent hover:border-notion-border min-h-[44px]"
      >
        <span className="text-sm">{modeIcons[mode]}</span>
        <span className="hidden sm:inline text-[10px] font-medium tracking-wide uppercase opacity-60">{mode}</span>
      </button>
    </header>
  )
}
