"use client"

import { useEffect, useState, useRef } from "react"
import { usePathname } from "next/navigation"

export default function NavigationProgress() {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevPathname = useRef(pathname)

  useEffect(() => {
    if (pathname === prevPathname.current) return
    prevPathname.current = pathname

    // Start progress
    setVisible(true)
    setProgress(20)

    const t1 = setTimeout(() => setProgress(60), 100)
    const t2 = setTimeout(() => setProgress(85), 300)
    const t3 = setTimeout(() => {
      setProgress(100)
      timerRef.current = setTimeout(() => {
        setVisible(false)
        setProgress(0)
      }, 300)
    }, 600)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [pathname])

  if (!visible) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-notion-accent pointer-events-none"
      style={{
        width: `${progress}%`,
        transition: progress === 0 ? "none" : "width 300ms ease",
        opacity: visible ? 1 : 0,
      }}
    />
  )
}
