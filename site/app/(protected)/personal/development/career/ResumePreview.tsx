"use client"

import { useState } from "react"

interface ResumeSection {
  type: "experience" | "education" | "leadership"
  title: string
  entries: ResumeEntry[]
}

interface ResumeEntry {
  org: string
  role: string
  location: string
  dates: string
  description?: string
  bullets: string[]
}

function parseResumeContent(content: string): ResumeSection[] {
  const sections: ResumeSection[] = []
  const lines = content.split("\n")

  let currentSection: ResumeSection | null = null
  let currentEntry: ResumeEntry | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // H1 = section header (Experience, Education, Leadership)
    if (line.startsWith("# ") && !line.startsWith("## ")) {
      const title = line.replace("# ", "").trim()
      const type = title.toLowerCase().includes("experience")
        ? "experience"
        : title.toLowerCase().includes("education")
          ? "education"
          : "leadership"
      currentSection = { type, title, entries: [] }
      sections.push(currentSection)
      currentEntry = null
      continue
    }

    // H2 = company/org name
    if (line.startsWith("## ") && currentSection) {
      const org = line.replace("## ", "").trim()
      currentEntry = { org, role: "", location: "", dates: "", bullets: [] }
      currentSection.entries.push(currentEntry)
      continue
    }

    // Bold line with role | location | dates
    if (line.startsWith("**") && currentEntry) {
      const cleaned = line.replace(/\*\*/g, "")
      const parts = cleaned.split("|").map((p) => p.trim())
      if (parts.length >= 3) {
        currentEntry.role = parts[0]
        currentEntry.location = parts[1]
        currentEntry.dates = parts[2]
      } else if (parts.length === 2) {
        currentEntry.role = parts[0]
        currentEntry.dates = parts[1]
      } else {
        currentEntry.role = parts[0]
      }
      continue
    }

    // Bullet points
    if (line.startsWith("- ") && currentEntry) {
      currentEntry.bullets.push(line.replace("- ", "").trim())
      continue
    }

    // Plain paragraph text (for leadership section, etc.)
    if (line.trim() && currentEntry && !line.startsWith("#") && !line.startsWith("**") && !line.startsWith("-")) {
      // Treat as a description paragraph for entries without bullets
      if (currentEntry.bullets.length === 0) {
        currentEntry.description = (currentEntry.description ? currentEntry.description + " " : "") + line.trim()
      }
    }
  }

  return sections
}

// Color accents for each company
const orgColors: Record<string, string> = {
  "Together AI": "bg-blue-500",
  "Asana": "bg-rose-500",
  "Peregrine Technologies": "bg-amber-500",
  "McKinsey & Company": "bg-emerald-500",
  "Fresquiticos": "bg-purple-500",
  "Stanford University": "bg-red-600",
}

function getOrgColor(org: string): string {
  return orgColors[org] || "bg-notion-accent"
}

export default function ResumePreview({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false)
  const sections = parseResumeContent(content)

  return (
    <div>
      {/* Collapsible content area */}
      <div className={`relative ${!expanded ? "max-h-[500px] overflow-hidden" : ""}`}>
        <div className="px-6 py-5 space-y-8">
          {sections.map((section, si) => (
            <div key={si}>
              <h3 className="text-xs font-semibold text-notion-muted uppercase tracking-widest mb-4">
                {section.title}
              </h3>

              <div className="space-y-5">
                {section.entries.map((entry, ei) => (
                  <div key={ei} className="relative pl-4 border-l-2 border-notion-border/40">
                    {/* Color dot */}
                    <div
                      className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${getOrgColor(entry.org)}`}
                    />

                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 mb-1">
                      <div>
                        <span className="text-sm font-semibold text-notion-text">
                          {entry.org}
                        </span>
                        {entry.role && (
                          <span className="text-sm text-notion-muted ml-2">
                            {entry.role}
                          </span>
                        )}
                      </div>
                      {entry.dates && (
                        <span className="text-xs text-notion-muted/60 shrink-0">
                          {entry.dates}
                        </span>
                      )}
                    </div>

                    {entry.location && (
                      <p className="text-xs text-notion-muted/50 mb-2">{entry.location}</p>
                    )}

                    {entry.description && (
                      <p className="text-sm text-notion-text/80 leading-relaxed">
                        {entry.description.replace(/\*\*/g, "")}
                      </p>
                    )}

                    {entry.bullets.length > 0 && (
                      <ul className="space-y-1.5 mt-1.5">
                        {entry.bullets.map((bullet, bi) => (
                          <li
                            key={bi}
                            className="text-sm text-notion-text/80 leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[9px] before:w-1.5 before:h-1.5 before:rounded-full before:bg-notion-border/60"
                          >
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Fade overlay when collapsed */}
        {!expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-notion-surface to-transparent pointer-events-none" />
        )}
      </div>

      {/* Toggle button */}
      <div className="px-6 py-3 border-t border-notion-border/40">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-center text-sm text-notion-accent font-medium hover:opacity-80 transition-opacity py-1"
        >
          {expanded ? "Show less" : "Show full resume"}
        </button>
      </div>
    </div>
  )
}
