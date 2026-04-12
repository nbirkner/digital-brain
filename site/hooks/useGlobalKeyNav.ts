"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function useGlobalKeyNav() {
  const router = useRouter()
  useEffect(() => {
    let gPressed = false
    let gTimer: ReturnType<typeof setTimeout> | null = null

    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
      const isEditable = (e.target as HTMLElement)?.isContentEditable
      if (isEditable) return

      if (e.key === "g" && !e.metaKey && !e.ctrlKey) {
        gPressed = true
        if (gTimer) clearTimeout(gTimer)
        gTimer = setTimeout(() => { gPressed = false }, 1000)
        return
      }

      if (gPressed) {
        gPressed = false
        if (gTimer) clearTimeout(gTimer)
        switch (e.key) {
          case "t": e.preventDefault(); router.push("/tasks"); break
          case "h": e.preventDefault(); router.push("/"); break
          case "n": e.preventDefault(); router.push("/notes"); break
          case "l": e.preventDefault(); router.push("/labels"); break
          case "w": e.preventDefault(); router.push("/work"); break
          case "p": e.preventDefault(); router.push("/personal"); break
        }
      }
    }

    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [router])
}
