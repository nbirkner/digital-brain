import Link from "next/link"
import PageHeader from "@/components/PageHeader"
import PagePathStatic from "@/components/PagePathStatic"

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

const progressBarMap: Record<string, string> = {
  blue: "bg-blue-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
}

const COURSES = [
  {
    slug: "everyday-bliss",
    title: "Everyday Bliss",
    teacher: "Paul McKenna",
    icon: "😌",
    color: "blue",
    lessons: 21,
    completed: 7,
    category: "Mind",
    description: "21 days to freedom from stress using hypnotherapy and NLP. 15 minutes a day — Paul McKenna's signature techniques to reprogram your mind and body's response to stress, fear, and anxiety.",
    tags: ["Hypnotherapy", "NLP", "Stress Relief"],
    keyLesson: "Negative triggers can be transformed into allies. The body already knows how to be calm — we just need to remind it.",
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
    description: "28 days of EFT (emotional freedom technique) tapping to release emotional blocks, stored trauma, and limiting beliefs held in the body.",
    tags: ["EFT", "Tapping", "Trauma Release"],
    keyLesson: "Emotions aren't problems to fix — they're information to feel and release. The body holds what the mind refuses.",
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
    description: "28-day full-body transformation program combining strength, cardio, and mindset work for sustainable physical change.",
    tags: ["Fitness", "Strength", "Transformation"],
    keyLesson: "Physical transformation is 20% workout, 80% mindset. The body is already capable — it's the beliefs that need the work.",
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
    description: "30-day qigong practice for cultivating life-force energy, reducing stress, and building inner stillness through ancient Chinese movement medicine.",
    tags: ["Qigong", "Energy", "Movement"],
    keyLesson: "Qi flows where attention goes. 10 minutes of qigong shifts more than an hour at the gym.",
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
    description: "A 13-day activation to connect with your higher self, access inner wisdom, and expand into higher states of consciousness.",
    tags: ["Higher Self", "Consciousness", "Activation"],
    keyLesson: "The higher self isn't above you — it's the version of you that was never afraid. Activation is just remembering.",
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
    description: "Vishen's flagship program on consciousness engineering — moving through the levels to live a life of extraordinary meaning, purpose, and impact.",
    tags: ["Consciousness", "Purpose", "Vision"],
    keyLesson: "Humanity runs by default on cultural programs that were never chosen. Waking up is the first step. Then you get to choose.",
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
    description: "A 7-week journey to master your personal energetic system. Connect with your energy body, eliminate blocks, strengthen your chakras, and align on both the physical and spiritual planes.",
    tags: ["Energy Healing", "Intuition", "Chakras"],
    keyLesson: "You are not separate from your energy body. You ARE your energy body. Everything else is secondary.",
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
    description: "Jeffrey Allen's deep dive into the mechanics of manifestation — how energy creates reality and how to consciously direct that process toward what you want.",
    tags: ["Manifestation", "Energy", "Creation"],
    keyLesson: "Manifestation isn't magic — it's alignment. When your energy matches what you want, the external world reorganizes itself.",
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
    description: "Visualization and consciousness techniques to access parallel versions of yourself — selves who have already solved the problems you're facing now.",
    tags: ["Quantum", "Visualization", "Parallel Reality"],
    keyLesson: "The version of you that has already solved the problem exists. The work is making contact with that version and integrating what they know.",
  },
]

const TEACHERS = [
  {
    name: "Jeffrey Allen",
    icon: "☯️",
    color: "violet",
    courses: ["Duality", "The Art of Manifesting", "Quantum Jumping"],
    description: "Former software engineer turned energy healer. The most science-grounded approach to energy work I've found. His Duality framework changed how I experience my own body.",
  },
  {
    name: "Vishen Lakhiani",
    icon: "🌟",
    color: "amber",
    courses: ["Be Extraordinary"],
    description: "Mindvalley's founder. Consciousness engineering — the idea that belief systems are software and you can upgrade them. Be Extraordinary is his manifesto.",
  },
  {
    name: "Paul McKenna",
    icon: "😌",
    color: "blue",
    courses: ["Everyday Bliss"],
    description: "World-renowned hypnotherapist and NLP practitioner. His stress-release techniques are immediately practical. The Havening Technique is something I use weekly.",
  },
  {
    name: "Jennifer Partridge",
    icon: "💙",
    color: "rose",
    courses: ["Tapping into Emotional Mastery"],
    description: "EFT practitioner specializing in trauma release and emotional healing. The tapping approach to stored emotion resonates deeply — body-first, brain second.",
  },
]

const totalCompleted = COURSES.reduce((sum, c) => sum + c.completed, 0)
const totalLessons = COURSES.filter(c => c.lessons > 0).reduce((sum, c) => sum + c.lessons, 0)
const coursesInProgress = COURSES.filter(c => c.completed > 0).length

export default function MindvalleyPage() {
  return (
    <div>
      <PagePathStatic path="niki/hobbies/mindvalley" />
      <PageHeader
        icon="🧠"
        title="Mindvalley"
        description="Courses on consciousness, energy, mindset, and becoming."
      />

      <div className="space-y-8">

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-notion-surface border border-notion-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-notion-text">{COURSES.length}</p>
            <p className="text-xs text-notion-muted mt-1">Courses</p>
          </div>
          <div className="bg-notion-surface border border-notion-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-notion-text">{coursesInProgress}</p>
            <p className="text-xs text-notion-muted mt-1">In progress</p>
          </div>
          <div className="bg-notion-surface border border-notion-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-notion-text">{totalCompleted}</p>
            <p className="text-xs text-notion-muted mt-1">Lessons done</p>
          </div>
        </div>

        {/* All courses */}
        <div>
          <p className="text-xs font-semibold text-notion-muted uppercase tracking-widest mb-3">All Courses</p>
          <div className="space-y-2">
            {COURSES.map((course) => {
              const pct = course.lessons > 0 ? Math.round((course.completed / course.lessons) * 100) : null
              return (
                <Link
                  key={course.slug}
                  href={`/self/hobbies/mindvalley/${course.slug}`}
                  className="flex items-start gap-4 bg-notion-surface border border-notion-border rounded-xl p-4 hover:bg-notion-hover transition-colors group"
                >
                  <span className="text-2xl mt-0.5">{course.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <p className="font-semibold text-sm text-notion-text group-hover:text-notion-accent transition-colors leading-tight">{course.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-mono shrink-0 ${badgeMap[course.color]}`}>{course.category}</span>
                    </div>
                    <p className="text-xs text-notion-muted mb-2">{course.teacher}</p>
                    {pct !== null && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-notion-border rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${progressBarMap[course.color]}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-notion-muted font-mono shrink-0">{course.completed}/{course.lessons}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-notion-muted/40 text-sm self-center shrink-0">→</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Teachers */}
        <div>
          <p className="text-xs font-semibold text-notion-muted uppercase tracking-widest mb-3">Teachers</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TEACHERS.map((teacher) => (
              <div
                key={teacher.name}
                className={`rounded-xl border p-5 ${colorMap[teacher.color]}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{teacher.icon}</span>
                  <p className="font-bold text-sm">{teacher.name}</p>
                </div>
                <p className="text-xs opacity-75 leading-snug mb-3">{teacher.description}</p>
                <div className="flex flex-wrap gap-1">
                  {teacher.courses.map((c) => (
                    <span key={c} className={`text-xs px-2 py-0.5 rounded-full font-mono ${badgeMap[teacher.color]}`}>{c}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key lessons */}
        <div>
          <p className="text-xs font-semibold text-notion-muted uppercase tracking-widest mb-3">Lessons That Stuck</p>
          <div className="space-y-3">
            {COURSES.filter(c => c.keyLesson).map((course) => (
              <div key={course.slug} className="border-l-4 border-amber-500/30 pl-4 py-1">
                <p className="text-sm text-notion-text italic leading-relaxed mb-1">&ldquo;{course.keyLesson}&rdquo;</p>
                <p className="text-xs text-notion-muted">— {course.teacher} · {course.title}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <Link href="/self/hobbies" className="text-xs text-notion-muted hover:text-notion-accent transition-colors">
            ← Back to Hobbies
          </Link>
        </div>

      </div>
    </div>
  )
}
