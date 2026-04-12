"use client"

import { createContext, useContext, useEffect, useState } from "react"

type ThemeMode = "dark" | "light" | "system"
type ResolvedTheme = "dark" | "light"

interface ThemeContextValue {
  mode: ThemeMode
  resolvedTheme: ResolvedTheme
  setMode: (mode: ThemeMode) => void
  toggleTheme: () => void // cycles dark → light → system → dark
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: "system",
  resolvedTheme: "dark",
  setMode: () => {},
  toggleTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system")
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark")
  const [mounted, setMounted] = useState(false)

  // On mount: read stored mode and resolve the actual theme
  useEffect(() => {
    const stored = localStorage.getItem("theme-mode") as ThemeMode | null
    const initialMode: ThemeMode =
      stored === "dark" || stored === "light" || stored === "system" ? stored : "system"

    const resolved: ResolvedTheme =
      initialMode === "system" ? getSystemTheme() : initialMode

    setModeState(initialMode)
    setResolvedTheme(resolved)
    setMounted(true)
  }, [])

  // Apply resolved theme class and listen for OS changes when in system mode
  useEffect(() => {
    if (!mounted) return

    const html = document.documentElement
    html.classList.remove("dark", "light")
    html.classList.add(resolvedTheme)

    if (mode !== "system") return

    const mql = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = (e: MediaQueryListEvent) => {
      const next: ResolvedTheme = e.matches ? "dark" : "light"
      setResolvedTheme(next)
      document.documentElement.classList.remove("dark", "light")
      document.documentElement.classList.add(next)
    }

    mql.addEventListener("change", handleChange)
    return () => mql.removeEventListener("change", handleChange)
  }, [mode, resolvedTheme, mounted])

  const setMode = (next: ThemeMode) => {
    const resolved: ResolvedTheme =
      next === "system" ? getSystemTheme() : next
    setModeState(next)
    setResolvedTheme(resolved)
    localStorage.setItem("theme-mode", next)
  }

  const toggleTheme = () => {
    const cycle: Record<ThemeMode, ThemeMode> = {
      dark: "light",
      light: "system",
      system: "dark",
    }
    setMode(cycle[mode])
  }

  return (
    <ThemeContext.Provider value={{ mode, resolvedTheme, setMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
