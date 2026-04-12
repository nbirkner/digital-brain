import PageHeader from "@/components/PageHeader"
import Link from "next/link"
import PagePathStatic from "@/components/PagePathStatic"
import LabelPageContent from "@/components/LabelPageContent"

export default function LuciPage() {
  return (
    <div>
      <PagePathStatic path="life/luci" />
      <PageHeader icon="🐱" title="Luci" description="Formerly known as Polka Dot." />

      <div className="space-y-6">
        {/* Photo gallery placeholder */}
        <div className="grid grid-cols-3 gap-3">
          <div className="aspect-square bg-notion-surface border border-notion-border rounded-xl overflow-hidden flex items-center justify-center">
            <span className="text-4xl">🐱</span>
          </div>
          <div className="aspect-square bg-notion-surface border border-notion-border rounded-xl overflow-hidden flex items-center justify-center">
            <span className="text-4xl">🐾</span>
          </div>
          <div className="aspect-square bg-notion-surface border border-notion-border rounded-xl overflow-hidden flex items-center justify-center">
            <span className="text-4xl">✨</span>
          </div>
        </div>

        {/* Cat details */}
        <div className="bg-notion-surface border border-notion-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {[
                { label: "Foster Name", value: "Polka Dot" },
                { label: "Birthday", value: "June 7, 2025" },
                { label: "Breed", value: "Domestic Shorthair" },
                { label: "Weight", value: "7.6 lb" },
                { label: "Spayed", value: "Yes" },
                { label: "Microchip", value: "941000031222685" },
              ].map((row, i, arr) => (
                <tr
                  key={row.label}
                  className={`${i < arr.length - 1 ? "border-b border-notion-border" : ""} hover:bg-notion-hover`}
                >
                  <td className="px-4 py-3 text-notion-muted font-medium w-40">{row.label}</td>
                  <td className="px-4 py-3 text-notion-text">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* External links */}
        <div className="bg-notion-surface border border-notion-border rounded-xl p-4">
          <p className="text-sm text-notion-muted mb-2 font-medium">Adoption Resources</p>
          <div className="flex gap-4 text-sm">
            <a
              href="https://app.petcademy.org/hub/my-pets"
              target="_blank"
              rel="noopener noreferrer"
              className="text-notion-accent hover:opacity-80 underline"
            >
              Petacademy
            </a>
            <a
              href="https://adopterluv.com/animals/6831340"
              target="_blank"
              rel="noopener noreferrer"
              className="text-notion-accent hover:opacity-80 underline"
            >
              AdopterLuv
            </a>
          </div>
        </div>

        {/* The meaning of Lucia */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-6">
          <h2 className="font-semibold text-notion-text mb-3">On the name Lucía</h2>
          <div className="space-y-3 text-sm text-notion-muted leading-relaxed">
            <p>
              Lucia means light — and light is the oldest name we have for universal life force energy. Every tradition
              that has ever tried to describe the animating force of the universe has reached for the same word:{" "}
              <em className="text-notion-text">prana</em>, <em className="text-notion-text">chi</em>,{" "}
              <em className="text-notion-text">ki</em>, divine light. Reiki itself is the practice of channeling that
              light through your hands. When you named her Lucia, you named her after the very energy you&apos;ve been
              trained to hold.
            </p>
            <p className="text-notion-text/80 italic">She came bearing her own name. 🕯️🐱</p>
          </div>
        </div>

        {/* Subpages */}
        <div>
          <h2 className="text-sm font-semibold text-notion-text mb-3">Pages</h2>
          <div className="space-y-2">
            {[
              {
                href: "/life/luci/official-docs",
                icon: "📁",
                title: "Official Docs",
                description: "Medical records, insurance, vaccination history",
              },
              {
                href: "/life/luci/shopping-list",
                icon: "🛒",
                title: "Shopping List",
                description: "Adoption day shopping checklist — all 8 items complete",
              },
              {
                href: "/life/luci/milo-instructions",
                icon: "🏠",
                title: "Milo Animals Instructions",
                description: "Official adoption instructions from Milo Foundation",
              },
            ].map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="flex items-center gap-3 bg-notion-surface border border-notion-border rounded-xl px-4 py-3 hover:bg-notion-hover transition-colors"
              >
                <span className="text-xl">{page.icon}</span>
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
      <LabelPageContent tagId="pets" />
    </div>
  )
}
