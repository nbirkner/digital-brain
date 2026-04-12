"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

const quips = [
  "You've reached the edge of my brain. It's quieter here.",
  "This thought hasn't formed yet. Check back after coffee.",
  "404: Neuron not found. Probably off doing something impulsive.",
  "You're looking for something that doesn't exist. (Relatable.)",
  "This page went on a trip and forgot to come back.",
  "The void stares back. It says hi.",
  "I had something here, I swear. Maybe I dreamed it.",
  "This is the mental equivalent of opening the fridge and forgetting why.",
  "Somewhere between intention and execution, this page got lost.",
  "Not everything in my brain is organized. Exhibit A.",
  "This page left to get oat milk and never came back.",
  "I asked AI to build this page and it simply refused.",
  "Mercury is in retrograde and so is this URL.",
  "The cards said this page would be here. The cards lied.",
  "Your intuition led you here. Your intuition was wrong. (It happens.)",
  "The universe has a plan for you. This page is not part of it.",
  "My Virgo rising would never let this happen on purpose.",
  "This page's energy was off so I cleared it. Maybe too thoroughly.",
  "I manifested this page out loud. It didn't work.",
  "My grounding cord is intact. This URL's is not.",
  "I checked my chart. Nothing in transit explains this.",
  "Error: brain returned undefined. Again.",
  "This page was last seen vibing in a coffee shop with no WiFi.",
  "The page you want exists in a parallel universe where I'm more organized.",
]

export default function NotFound() {
  const [quip, setQuip] = useState("")

  useEffect(() => {
    setQuip(quips[Math.floor(Math.random() * quips.length)])
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 animate-soft-fade relative overflow-hidden">
      {/* Logo */}
      <Link href="/" className="absolute top-5 left-5 flex items-center gap-2 text-notion-text hover:opacity-80 transition-opacity">
        <div className="w-7 h-7 rounded-lg bg-notion-accent/10 flex items-center justify-center shrink-0">
          <span className="text-base leading-none">🧠</span>
        </div>
        <span className="font-semibold text-sm tracking-tight">Niki&apos;s Brain</span>
      </Link>

      {/* Subtle radial glow behind the 404 */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--color-notion-accent, #5865f2) 0%, transparent 70%)",
          opacity: 0.06,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -60%)",
        }}
      />

      {/* Decorative stars */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
        <span className="absolute text-notion-accent/20 text-xs" style={{ top: "22%", left: "18%" }}>&#10022;</span>
        <span className="absolute text-notion-accent/15 text-[10px]" style={{ top: "30%", right: "22%" }}>&#10022;</span>
        <span className="absolute text-notion-accent/10 text-sm" style={{ bottom: "32%", left: "25%" }}>&#10022;</span>
        <span className="absolute text-notion-accent/20 text-[10px]" style={{ bottom: "28%", right: "30%" }}>&#10022;</span>
        <span className="absolute text-notion-muted/15 text-xs" style={{ top: "18%", right: "35%" }}>&#10023;</span>
        <span className="absolute text-notion-muted/10 text-xs" style={{ bottom: "38%", left: "35%" }}>&#10023;</span>
      </div>

      {/* 404 number */}
      <h1
        className="relative text-[7rem] sm:text-[9rem] leading-none font-bold select-none bg-gradient-to-b from-notion-text/15 to-notion-text/5 bg-clip-text text-transparent"
        style={{ fontFamily: "var(--font-display, serif)" }}
      >
        404
      </h1>

      {/* Thin decorative line */}
      <div className="flex items-center gap-3 mt-5 mb-4 text-notion-accent/30">
        <div className="w-8 h-px bg-notion-border/60" />
        <span className="text-[10px]">&#10022;</span>
        <div className="w-8 h-px bg-notion-border/60" />
      </div>

      {/* Quip */}
      <p className="text-base sm:text-lg text-notion-muted text-center max-w-sm leading-relaxed">
        {quip}
      </p>

      {/* Actions */}
      <div className="mt-8">
        <Link
          href="/"
          className="text-sm font-medium bg-notion-accent text-white px-5 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
