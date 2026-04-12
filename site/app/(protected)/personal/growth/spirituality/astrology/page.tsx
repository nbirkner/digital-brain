"use client"

import Link from "next/link"
import PageHeader from "@/components/PageHeader"
import PagePathStatic from "@/components/PagePathStatic"
import SiteTable from "@/components/SiteTable"
import type { SiteTableColumn } from "@/components/SiteTable"

const big3 = [
  {
    planet: "Rising",
    sign: "Virgo",
    degree: "18° 28'",
    icon: "♍",
    element: "Earth",
    modality: "Mutable",
    ruler: "Mercury in Cancer",
    house: "1st",
    color: "emerald",
    meaning: "Your life force. The energy others feel before you say a word.",
  },
  {
    planet: "Sun",
    sign: "Leo",
    degree: "11° 45'",
    icon: "♌",
    element: "Fire",
    modality: "Fixed",
    ruler: "Self-ruling",
    house: "12th",
    color: "amber",
    meaning: "Your conscious purpose. Built in private, expressed in depth.",
  },
  {
    planet: "Moon",
    sign: "Taurus",
    degree: "9° 51'",
    icon: "♉",
    element: "Earth",
    modality: "Fixed",
    ruler: "Venus in Virgo",
    house: "9th",
    color: "violet",
    meaning: "Your nourishment. Fed by beauty, expansion, and chosen family.",
  },
]

const planets = [
  { symbol: "☉", name: "Sun", sign: "Leo", degree: "11° 45'", house: "12th", notes: "Conjunct North Node" },
  { symbol: "☽", name: "Moon", sign: "Taurus", degree: "9° 51'", house: "9th", notes: "Square Sun" },
  { symbol: "☿", name: "Mercury", sign: "Cancer", degree: "28° 42'", house: "11th", notes: "Rx" },
  { symbol: "♀", name: "Venus", sign: "Virgo", degree: "4° 32'", house: "1st", notes: "Rx · Trine Jupiter (0°)" },
  { symbol: "♂", name: "Mars", sign: "Scorpio", degree: "13° 10'", house: "3rd", notes: "Square Uranus" },
  { symbol: "♃", name: "Jupiter", sign: "Taurus", degree: "4° 18'", house: "9th", notes: "" },
  { symbol: "♄", name: "Saturn", sign: "Taurus", degree: "16° 36'", house: "9th", notes: "Trine ASC" },
  { symbol: "♅", name: "Uranus", sign: "Aquarius", degree: "14° 56'", house: "6th", notes: "Rx" },
  { symbol: "♆", name: "Neptune", sign: "Aquarius", degree: "2° 43'", house: "6th", notes: "Rx" },
  { symbol: "♇", name: "Pluto", sign: "Sagittarius", degree: "7° 47'", house: "4th", notes: "Rx · Trine Sun" },
  { symbol: "☊", name: "North Node", sign: "Leo", degree: "12° 58'", house: "12th", notes: "Rx · Conjunct Sun" },
  { symbol: "⚷", name: "Chiron", sign: "Scorpio", degree: "27° 37'", house: "3rd", notes: "Trine Mercury" },
]

const colorMap: Record<string, string> = {
  emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-700",
  amber: "bg-amber-500/10 border-amber-500/20 text-amber-700",
  violet: "bg-violet-500/10 border-violet-500/20 text-violet-700",
}

const badgeMap: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-700",
  amber: "bg-amber-500/10 text-amber-700",
  violet: "bg-violet-500/10 text-violet-700",
}

const pages = [
  {
    href: "/personal/growth/spirituality/astrology/big-3-synthesis",
    icon: "✦",
    title: "Big 3 Synthesis",
    description: "Hollis M.M. framework applied — 5 layers for Rising, Sun, and Moon",
  },
  {
    href: "/personal/growth/spirituality/astrology/birth-chart",
    icon: "◉",
    title: "Birth Chart",
    description: "Full placements, aspects, elements, and modalities",
  },
  {
    href: "/personal/growth/spirituality/astrology/birth-chart-questions",
    icon: "◈",
    title: "Birth Chart Questions",
    description: "Deep questions for readings — love, power, purpose, voice, past lives",
  },
]

export default function AstrologyPage() {
  return (
    <div>
      <PagePathStatic path="personal/growth/spirituality/astrology" />
      <PageHeader
        icon="🔮"
        title="Astrology"
        description="Birth chart, transits, and astrological explorations."
      />

      <div className="space-y-6">

        {/* Big 3 */}
        <div>
          <p className="text-xs font-semibold text-notion-muted uppercase tracking-widest mb-3">The Big 3</p>
          <div className="grid grid-cols-3 gap-3">
            {big3.map((p) => (
              <div
                key={p.planet}
                className={`rounded-xl border p-4 ${colorMap[p.color]}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{p.icon}</span>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${badgeMap[p.color]}`}>
                    {p.house}
                  </span>
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest opacity-60 mb-0.5">{p.planet}</p>
                <p className="font-bold text-base leading-tight">{p.sign}</p>
                <p className="text-xs opacity-60 font-mono mb-2">{p.degree}</p>
                <p className="text-xs opacity-70 leading-snug">{p.meaning}</p>
                <div className="flex gap-1 mt-2 flex-wrap">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${badgeMap[p.color]} opacity-80`}>{p.element}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${badgeMap[p.color]} opacity-80`}>{p.modality}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sun conjunct North Node callout */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-700/60 mb-2">Notable — Sun ☌ North Node (1°)</p>
          <p className="text-sm text-notion-text leading-relaxed">
            Sun and North Node are both in Leo, both in the 12th house, within 1° of each other. This is rare. It means your soul&apos;s evolutionary path and your conscious identity are the same thing — not just aligned, but fused. You&apos;re not working <em>toward</em> being yourself. Being fully yourself is the work.
          </p>
        </div>

        {/* Planet table */}
        <div>
          <p className="text-xs font-semibold text-notion-muted uppercase tracking-widest mb-3">All placements</p>
          <SiteTable
            columns={[
              { key: "symbol", label: "", render: (row) => <span className="text-base text-notion-muted">{row.symbol as string}</span> },
              { key: "name", label: "Planet", render: (row) => <span className="font-medium text-notion-text">{row.name as string}</span> },
              { key: "sign", label: "Sign" },
              { key: "degree", label: "Degree", render: (row) => <span className="font-mono text-xs text-notion-muted">{row.degree as string}</span> },
              { key: "house", label: "House", render: (row) => <span className="text-xs text-notion-muted">{row.house as string}</span> },
              { key: "notes", label: "Notes", hideOnMobile: true, render: (row) => <span className="text-xs text-notion-muted">{row.notes as string}</span> },
            ] as SiteTableColumn<Record<string, unknown>>[]}
            data={planets as unknown as Record<string, unknown>[]}
          />
        </div>

        {/* Chart info */}
        <div className="bg-notion-surface border border-notion-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {[
                { label: "Ascendant", value: "18° 28' Virgo" },
                { label: "Midheaven (MC)", value: "19° 31' Gemini" },
                { label: "Chart ruler", value: "Mercury (Cancer, 11th)" },
                { label: "Dominant element", value: "Earth (Virgo, Taurus ×3)" },
                { label: "Dominant modality", value: "Fixed (Taurus, Leo, Scorpio, Aquarius)" },
              ].map((row, i, arr) => (
                <tr
                  key={row.label}
                  className={`${i < arr.length - 1 ? "border-b border-notion-border" : ""} hover:bg-notion-hover`}
                >
                  <td className="px-4 py-3 text-notion-muted font-medium w-44 text-sm">{row.label}</td>
                  <td className="px-4 py-3 text-notion-text text-sm">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sub-pages */}
        <div>
          <p className="text-xs font-semibold text-notion-muted uppercase tracking-widest mb-3">Notes</p>
          <div className="space-y-2">
            {pages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="flex items-center gap-3 bg-notion-surface border border-notion-border rounded-xl px-4 py-3 hover:bg-notion-hover transition-colors"
              >
                <span className="text-lg text-notion-muted font-mono">{page.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-notion-text">{page.title}</p>
                  <p className="text-xs text-notion-muted mt-0.5">{page.description}</p>
                </div>
                <span className="text-notion-muted/40 text-sm">→</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
