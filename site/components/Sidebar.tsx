"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { signOut } from "next-auth/react"

// Bottom nav items — shown only on mobile
const BOTTOM_NAV = [
  { href: "/", icon: "🏠", label: "Home" },
  { href: "/tasks", icon: "✅", label: "Tasks" },
  { href: "/notes", icon: "📝", label: "Notes" },
]

function BottomNav({ onSearchOpen, onMenuOpen }: { onSearchOpen: () => void; onMenuOpen: () => void }) {
  const pathname = usePathname()

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch bg-notion-surface border-t border-notion-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)", height: "calc(56px + env(safe-area-inset-bottom))" }}
    >
      {BOTTOM_NAV.map((item) => {
        const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] transition-colors ${
              active ? "text-notion-accent" : "text-notion-muted"
            }`}
          >
            <span className="relative">
              <span className="text-xl leading-none">{item.icon}</span>
              {active && (
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-notion-accent" />
              )}
            </span>
            <span className={`text-xs leading-none ${active ? "font-medium" : ""}`}>{item.label}</span>
          </Link>
        )
      })}

      {/* Search */}
      <button
        onClick={onSearchOpen}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] text-notion-muted transition-colors"
        aria-label="Search"
      >
        <span className="text-xl leading-none">🔍</span>
        <span className="text-xs leading-none">Search</span>
      </button>

      {/* Menu — opens full sidebar */}
      <button
        onClick={onMenuOpen}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] text-notion-muted transition-colors"
        aria-label="Open menu"
      >
        <span className="text-xl leading-none">☰</span>
        <span className="text-xs leading-none">Menu</span>
      </button>
    </nav>
  )
}

interface NavItem {
  href?: string
  label: string
  icon: string
  children?: NavItem[]
}

const TOP_NAV: NavItem[] = [
  { href: "/", icon: "🏠", label: "Home" },
  { href: "/tasks", icon: "✅", label: "Tasks" },
  { href: "/notes", icon: "📝", label: "Notes" },
  { href: "/docs", icon: "📄", label: "Docs" },
  { href: "/pages", icon: "📋", label: "Pages" },
  { href: "/labels", icon: "🏷️", label: "Labels" },
]

const WORK_ITEMS: NavItem[] = [
  { href: "/work", icon: "🏠", label: "Home" },
  { href: "/logs", icon: "📋", label: "Logs" },
]

const PERSONAL_ITEMS: NavItem[] = [
  { href: "/personal", icon: "🏠", label: "Home" },
  {
    href: "/life",
    icon: "🏡",
    label: "Life Admin",
    children: [
      { href: "/life/housing", icon: "🔑", label: "Housing" },
      { href: "/life/cars", icon: "🚗", label: "Cars" },
      { href: "/life/luci", icon: "🐱", label: "Luci" },
      { href: "/life/finances", icon: "💰", label: "Finances" },
      { href: "/life/travel", icon: "✈️", label: "Travel" },
    ],
  },
  {
    href: "/self",
    icon: "🪞",
    label: "Self",
    children: [
      { href: "/self/health", icon: "🌿", label: "Health" },
      { href: "/self/hobbies", icon: "🎨", label: "Hobbies" },
      { href: "/self/routine", icon: "🧘", label: "Routine" },
    ],
  },
  {
    icon: "🌱",
    label: "Growth",
    children: [
      { href: "/goals", icon: "⭐", label: "Goals" },
      {
        icon: "📖",
        label: "Learning",
        children: [
          { href: "/learning", icon: "📚", label: "All" },
          { href: "/self/quotes", icon: "💬", label: "Quotes" },
        ],
      },
      { href: "/self/certifications", icon: "🎓", label: "Certifications" },
    ],
  },
  {
    icon: "🚀",
    label: "Development",
    children: [
      { href: "/personal/development/career", icon: "💼", label: "Career" },
      { href: "/personal/development/side-hustles", icon: "🧩", label: "Side Hustles" },
    ],
  },
  { href: "/personal/external", icon: "🌐", label: "External" },
]

function isDescendantActive(item: NavItem, pathname: string): boolean {
  if (!item.children) return false
  return item.children.some(
    (child) =>
      (child.href !== undefined && (pathname === child.href || pathname.startsWith(child.href + "/"))) ||
      isDescendantActive(child, pathname)
  )
}

function NavLink({ item, depth = 0, onClick }: { item: NavItem; depth?: number; onClick?: () => void }) {
  const pathname = usePathname()
  const linkActive = !!item.href && pathname === item.href
  const ancestorActive = isDescendantActive(item, pathname)
  const [open, setOpen] = useState(linkActive || ancestorActive)
  const childrenEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (linkActive || ancestorActive) setOpen(true)
  }, [linkActive, ancestorActive])

  const hasChildren = !!item.children

  // Items with children: clicking toggles collapse, no navigation
  // Leaf items: clicking navigates
  const sharedClasses = `flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all min-h-[32px] ${
    linkActive
      ? "bg-notion-hover text-notion-text font-medium"
      : ancestorActive && hasChildren
        ? "text-notion-text font-medium"
        : "text-notion-muted hover:bg-notion-hover hover:text-notion-text"
  }`
  const sharedStyle = {
    paddingLeft: `${(depth + 1) * 12}px`,
  }

  function handleToggle() {
    const willOpen = !open
    setOpen(willOpen)
    if (willOpen) {
      // After children render, scroll the last child into view
      requestAnimationFrame(() => {
        childrenEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
      })
    }
  }

  return (
    <div>
      <div className="flex items-center">
        {hasChildren ? (
          <button
            onClick={handleToggle}
            className={sharedClasses}
            style={sharedStyle}
            aria-expanded={open}
          >
            <span className="w-4 h-4 flex items-center justify-center text-sm leading-none shrink-0">{item.icon}</span>
            <span className="truncate">{item.label}</span>
            <svg
              className={`w-3 h-3 ml-auto text-notion-muted/50 transition-transform ${open ? "rotate-90" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : item.href ? (
          <Link
            href={item.href}
            onClick={onClick}
            className={sharedClasses}
            style={sharedStyle}
          >
            <span className="w-4 h-4 flex items-center justify-center text-sm leading-none shrink-0">{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </Link>
        ) : null}
      </div>
      {hasChildren && open && (
        <div>
          {item.children!.map((child) => (
            <NavLink key={child.href ?? child.label} item={child} depth={depth + 1} onClick={onClick} />
          ))}
          <div ref={childrenEndRef} />
        </div>
      )}
    </div>
  )
}

function SectionHeader({
  label,
  collapsed,
  onToggle,
}: {
  label: string
  collapsed: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-1 px-4 pt-2 pb-1 group"
      aria-expanded={!collapsed}
    >
      <span className="flex-1 text-left text-[10px] font-semibold text-notion-muted/50 tracking-[0.1em] uppercase">
        {label}
      </span>
    </button>
  )
}

const SECTIONS_STORAGE_KEY = "sidebar-sections-collapsed"

interface SidebarProps {
  mobileOpen: boolean
  onClose: () => void
  onOpen?: () => void
  onSearchOpen?: () => void
}

export default function Sidebar({ mobileOpen, onClose, onOpen, onSearchOpen }: SidebarProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SECTIONS_STORAGE_KEY)
      if (stored) setCollapsed(JSON.parse(stored))
    } catch { /* ignore */ }
    setMounted(true)
  }, [])

  function toggle(key: string) {
    setCollapsed((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      try { localStorage.setItem(SECTIONS_STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }

  const isCollapsed = (key: string) => mounted && !!collapsed[key]

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-notion-surface border-r border-notion-border z-30 flex flex-col transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 border-b border-notion-border shrink-0" style={{ paddingTop: "env(safe-area-inset-top)", minHeight: "calc(48px + env(safe-area-inset-top))" }}>
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-lg bg-notion-accent/10 flex items-center justify-center shrink-0 overflow-visible">
              <span style={{ fontSize: "16px", lineHeight: 1 }}>🧠</span>
            </div>
            <span className="font-semibold text-notion-text text-sm tracking-tight">digital-brain</span>
          </Link>
          <button
            onClick={onClose}
            className="ml-auto lg:hidden text-notion-muted hover:text-notion-text"
            aria-label="Close menu"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-2 pt-1.5 pb-0.5 shrink-0">
          <button
            onClick={() => onSearchOpen?.()}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-all group bg-notion-hover/50 hover:bg-notion-hover"
          >
            <svg className="w-3.5 h-3.5 shrink-0 text-notion-muted/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="flex-1 text-left text-notion-muted/50 text-sm">Search...</span>
            <kbd className="hidden lg:flex items-center text-[10px] border border-notion-border/30 rounded px-1.5 py-0.5 text-notion-muted/40 font-mono">⌘K</kbd>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5" style={{ scrollbarWidth: "none" }}>

          {/* Navigation */}
          <div>
            <SectionHeader label="Navigation" collapsed={isCollapsed("nav")} onToggle={() => toggle("nav")} />
            {!isCollapsed("nav") && TOP_NAV.map((item) => (
              <NavLink key={item.href} item={item} onClick={onClose} />
            ))}
          </div>

          {/* Work */}
          <div>
            <div className="mx-3 my-2 h-px bg-notion-border/40" />
            <SectionHeader label="Work" collapsed={isCollapsed("work")} onToggle={() => toggle("work")} />
            {!isCollapsed("work") && WORK_ITEMS.map((item) => (
              <NavLink key={item.href} item={item} onClick={onClose} />
            ))}
          </div>

          {/* Personal */}
          <div>
            <div className="mx-3 my-2 h-px bg-notion-border/40" />
            <SectionHeader label="Personal" collapsed={isCollapsed("personal")} onToggle={() => toggle("personal")} />
            {!isCollapsed("personal") && PERSONAL_ITEMS.map((item) => (
              <NavLink key={item.href} item={item} onClick={onClose} />
            ))}
          </div>

        </nav>

        {/* Footer */}
        <div className="border-t border-notion-border/50 px-3 py-3 shrink-0">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-notion-muted/60 hover:bg-notion-hover hover:text-notion-muted transition-all"
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>

          {mobileOpen && (
            <div className="lg:hidden flex justify-center mt-3">
              <div className="w-10 h-1 rounded-full bg-notion-border" aria-hidden="true" />
            </div>
          )}
        </div>
      </aside>

      {/* Bottom navigation bar — mobile only */}
      <BottomNav
        onSearchOpen={() => onSearchOpen?.()}
        onMenuOpen={() => onOpen?.()}
      />
    </>
  )
}
