import Link from "next/link"
import PageHeader from "@/components/layout/PageHeader"
import PagePathStatic from "@/components/layout/PagePathStatic"
import LabelPageContent from "@/components/features/notes/LabelPageContent"

const colorMap: Record<string, string> = {
  blue: "bg-blue-500/10 border-blue-500/20 text-blue-700",
  emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-700",
  violet: "bg-violet-500/10 border-violet-500/20 text-violet-700",
  amber: "bg-amber-500/10 border-amber-500/20 text-amber-700",
  rose: "bg-rose-500/10 border-rose-500/20 text-rose-700",
}

const badgeMap: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-700",
  emerald: "bg-emerald-500/10 text-emerald-700",
  violet: "bg-violet-500/10 text-violet-700",
  amber: "bg-amber-500/10 text-amber-700",
  rose: "bg-rose-500/10 text-rose-700",
}

const SUBPAGES = [
  { href: "/self/hobbies/plants", icon: "🌿", label: "Plants" },
  { href: "/self/hobbies/scrapbook-ideas", icon: "✂️", label: "Scrapbooking" },
  { href: "/self/hobbies/mindvalley", icon: "🧠", label: "Mindvalley" },
]

// Plant lineage — from personal/docs/life/hobbies/plants/plants.md
const PLANT_FAMILIES = [
  {
    name: "Julie",
    species: "Philodendron hederaceum",
    note: "Gift from Metronome for Grandma's passing",
    children: ["Chispi"],
  },
  {
    name: "Mama P",
    species: "Philodendron hederaceum",
    note: "Origin: Easy plant",
    children: ["Juniper P", "Sauna P", "Noa P", "Tidelet P", "Pixel P", "Peng P"],
    gifted: ["Netbox P (Pablo)", "Richard's P", "Sophia's P"],
  },
  {
    name: "Pilar E",
    species: "Epipremnum aureum (Pothos)",
    note: "Origin: Easy plant",
    children: ["Rio E", "Brisa E"],
  },
  {
    name: "Aura",
    species: "Epipremnum aureum (Marble Queen)",
    note: "Origin: Flower Craft",
    children: ["Halo", "Lumi"],
  },
  {
    name: "Mara",
    species: "Maranta leuconeura (Prayer Plant)",
    note: "Origin: Flower Craft",
    children: ["Mari"],
  },
  {
    name: "Olivia",
    species: "Schlumbergera (Christmas Cactus)",
    note: "Gift from Juan. Whole Foods, Jan 2026",
    children: [],
  },
  {
    name: "Puente",
    species: "Epipremnum aureum",
    note: "Bridge plant — Mama P × Pilar E lineage",
    children: [],
  },
]

const INDEPENDENT_PLANTS = [
  { name: "Figaro", common: "Fiddle Leaf Fig", origin: "EasyPlant" },
  { name: "Sentinel", common: "Snake Plant", origin: "EasyPlant" },
  { name: "Lyra", common: "Snake Plant", origin: "EasyPlant" },
  { name: "ZZ", common: "ZZ Plant", origin: "EasyPlant" },
  { name: "Otis", common: "Moon Valley Pilea", origin: "FlowerCraft" },
  { name: "Paco", common: "Prickly Pear Cactus", origin: "Whole Foods" },
  { name: "Taco", common: "Echeveria", origin: "Palace Market" },
]

const SCRAPBOOK_IDEAS = [
  "A few favorite things this month — candy wrapper, picture, song, quote",
  "A letter that was given to me and the context around it",
]

const MINDVALLEY_COURSES = [
  {
    slug: "everyday-bliss",
    title: "Everyday Bliss",
    teacher: "Paul McKenna",
    icon: "😌",
    color: "blue",
    lessons: 21,
    completed: 7,
    category: "Mind",
    description: "21 days to freedom from stress using hypnotherapy and NLP.",
  },
  {
    slug: "emotional-mastery",
    title: "Tapping into Emotional Mastery",
    teacher: "Jennifer Partridge",
    icon: "💙",
    color: "rose",
    lessons: 28,
    completed: 3,
    category: "Emotions",
    description: "28 days of EFT tapping to release emotional blocks and stored trauma.",
  },
  {
    slug: "total-transformation",
    title: "Total Transformation Training",
    teacher: "Christine Bullock",
    icon: "🔥",
    color: "emerald",
    lessons: 28,
    completed: 0,
    category: "Fitness",
    description: "28-day full-body transformation combining strength, cardio, and mindset.",
  },
  {
    slug: "modern-qigong",
    title: "Modern Qigong",
    teacher: "Lee Holden",
    icon: "🌊",
    color: "emerald",
    lessons: 30,
    completed: 0,
    category: "Energy",
    description: "30-day qigong practice for cultivating life-force energy and inner stillness.",
  },
  {
    slug: "higher-self-activation",
    title: "Higher Self Activation",
    teacher: "Ariya Lorenz",
    icon: "✨",
    color: "violet",
    lessons: 13,
    completed: 10,
    category: "Spiritual",
    description: "13-day activation to connect with your higher self and access inner wisdom.",
  },
  {
    slug: "be-extraordinary",
    title: "Be Extraordinary",
    teacher: "Vishen Lakhiani",
    icon: "⭐",
    color: "amber",
    lessons: 30,
    completed: 0,
    category: "Consciousness",
    description: "Vishen's flagship course on consciousness engineering and extraordinary living.",
  },
  {
    slug: "duality",
    title: "Duality",
    teacher: "Jeffrey Allen",
    icon: "☯️",
    color: "violet",
    lessons: 49,
    completed: 15,
    category: "Energy Healing",
    description: "7-week journey to master your personal energetic system and align body and spirit.",
  },
  {
    slug: "art-of-manifesting",
    title: "The Art of Manifesting",
    teacher: "Jeffrey Allen",
    icon: "✦",
    color: "amber",
    lessons: 0,
    completed: 0,
    category: "Manifestation",
    description: "The mechanics of manifestation — how energy creates reality and how to direct it.",
  },
  {
    slug: "quantum-jumping",
    title: "Quantum Jumping",
    teacher: "Jeffrey Allen",
    icon: "🌌",
    color: "blue",
    lessons: 0,
    completed: 0,
    category: "Consciousness",
    description: "Visualization techniques to access alternate versions of yourself with different skills and outcomes.",
  },
]

const MINDVALLEY_QUOTES = [
  { quote: "Emotions aren't problems to fix — they're information to feel and release.", source: "Jennifer Partridge · Emotional Mastery" },
  { quote: "You are not separate from your energy body. You ARE your energy body. Everything else is secondary.", source: "Jeffrey Allen · Duality" },
  { quote: "The version of you that has already solved the problem exists. The work is making contact.", source: "Jeffrey Allen · Quantum Jumping" },
]

export default async function HobbiesPage() {
  return (
    <div>
      <PagePathStatic path="niki/hobbies" />
      <PageHeader icon="🎨" title="Hobbies" description="Things I love doing outside of work." />

      <div className="space-y-10">

        {/* Subpage Navigation */}
        <div className="grid grid-cols-3 gap-2">
          {SUBPAGES.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="flex flex-col items-center gap-1.5 bg-notion-surface border border-notion-border rounded-xl p-3 hover:bg-notion-hover transition-colors text-center group"
            >
              <span className="text-xl">{page.icon}</span>
              <span className="text-xs font-medium text-notion-muted group-hover:text-notion-text transition-colors leading-tight">{page.label}</span>
            </Link>
          ))}
        </div>

        {/* Plants section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-notion-muted uppercase tracking-wider">🌿 Plant Family</h2>
            <Link href="/self/hobbies/plants" className="text-xs text-notion-accent hover:underline">
              Plants overview →
            </Link>
          </div>

          {/* Lineage families */}
          <div className="mb-4">
            <p className="text-xs text-notion-muted mb-3 font-medium uppercase tracking-wider">Lineage</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {PLANT_FAMILIES.map((plant) => (
                <div key={plant.name} className="bg-notion-surface border border-notion-border rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-notion-text">{plant.name}</h3>
                    {plant.children.length > 0 && (
                      <span className="text-xs bg-notion-accent/10 text-notion-accent border border-notion-accent/20 rounded-full px-2 py-0.5 shrink-0">
                        {plant.children.length} cuttings
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-notion-muted italic mb-2">{plant.species}</p>
                  <p className="text-xs text-notion-muted">{plant.note}</p>
                  {plant.children.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-notion-border">
                      <p className="text-xs text-notion-muted">{plant.children.join(", ")}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Independent plants */}
          <div>
            <p className="text-xs text-notion-muted mb-3 font-medium uppercase tracking-wider">Independent</p>
            <div className="bg-notion-surface border border-notion-border rounded-xl overflow-hidden">
              {INDEPENDENT_PLANTS.map((plant, i) => (
                <div
                  key={plant.name}
                  className={`flex items-center justify-between px-4 py-2.5 ${i < INDEPENDENT_PLANTS.length - 1 ? "border-b border-notion-border" : ""}`}
                >
                  <div>
                    <span className="font-medium text-sm text-notion-text">{plant.name}</span>
                    <span className="text-notion-muted text-sm"> — {plant.common}</span>
                  </div>
                  <span className="text-xs text-notion-muted shrink-0 ml-3">{plant.origin}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scrapbooking section */}
        <div>
          <h2 className="text-sm font-semibold text-notion-muted uppercase tracking-wider mb-3">✂️ Scrapbooking</h2>
          <div className="bg-notion-surface border border-notion-border rounded-xl p-5">
            <p className="text-sm text-notion-muted mb-4">Junk journaling, collage, and collecting little pieces of life.</p>
            <div className="space-y-2 mb-4">
              {SCRAPBOOK_IDEAS.map((idea, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-notion-accent text-xs mt-1">•</span>
                  <p className="text-sm text-notion-text">{idea}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 pt-3 border-t border-notion-border">
              <a
                href="https://www.vogue.com/article/junk-journaling"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-notion-accent hover:underline"
              >
                Junk journaling via Vogue ↗
              </a>
              <a
                href="https://www.pinterest.com/nbirkner99/_pins/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-notion-accent hover:underline"
              >
                Pinterest inspiration board ↗
              </a>
              <Link href="/self/hobbies/scrapbook-ideas" className="text-xs text-notion-accent hover:underline">
                Repository of ideas →
              </Link>
            </div>
          </div>
        </div>

        {/* Mindvalley section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-notion-muted uppercase tracking-wider">🧠 Mindvalley</h2>
            <Link href="/self/hobbies/mindvalley" className="text-xs text-notion-accent hover:underline">
              All courses →
            </Link>
          </div>

          {/* Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/15 via-blue-500/10 to-amber-500/15 border border-violet-500/20 p-6 mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-700/60 mb-2">Current focus</p>
            <p className="text-base font-semibold text-notion-text mb-1">Energy. Consciousness. Becoming.</p>
            <p className="text-sm text-notion-muted leading-relaxed">
              9 active courses. Jeffrey Allen, Paul McKenna, Vishen. Working through the energetic and the practical.
            </p>
          </div>

          {/* Course grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {MINDVALLEY_COURSES.slice(0, 6).map((course) => {
              const pct = course.lessons > 0 ? Math.round((course.completed / course.lessons) * 100) : null
              return (
                <Link
                  key={course.slug}
                  href={`/self/hobbies/mindvalley/${course.slug}`}
                  className="bg-notion-surface border border-notion-border rounded-xl p-4 hover:bg-notion-hover transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{course.icon}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${badgeMap[course.color]}`}>{course.category}</span>
                    </div>
                    {pct !== null && (
                      <span className="text-xs text-notion-muted font-mono shrink-0">{course.completed}/{course.lessons}</span>
                    )}
                  </div>
                  <p className="font-semibold text-sm text-notion-text group-hover:text-notion-accent transition-colors mb-0.5 leading-tight">{course.title}</p>
                  <p className="text-xs text-notion-muted">{course.teacher}</p>
                  {pct !== null && pct > 0 && (
                    <div className="mt-3">
                      <div className="h-1 bg-notion-border rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${course.color === "violet" ? "bg-violet-500" : course.color === "amber" ? "bg-amber-500" : course.color === "rose" ? "bg-rose-500" : course.color === "emerald" ? "bg-emerald-500" : "bg-blue-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </Link>
              )
            })}
          </div>

          {MINDVALLEY_COURSES.length > 6 && (
            <Link href="/self/hobbies/mindvalley" className="flex items-center justify-center gap-1 mt-3 text-xs text-notion-muted hover:text-notion-accent transition-colors">
              +{MINDVALLEY_COURSES.length - 6} more courses →
            </Link>
          )}

          {/* Key lessons */}
          <div className="mt-4 space-y-3">
            {MINDVALLEY_QUOTES.map((q, i) => (
              <div key={i} className="border-l-4 border-amber-500/30 pl-4 py-1">
                <p className="text-sm text-notion-text italic leading-relaxed mb-1">&ldquo;{q.quote}&rdquo;</p>
                <p className="text-xs text-notion-muted">— {q.source}</p>
              </div>
            ))}
          </div>
        </div>

        <LabelPageContent tagId="hobbies" />
      </div>
    </div>
  )
}
