import Link from "next/link"
import { notFound } from "next/navigation"
import PagePathStatic from "@/components/layout/PagePathStatic"

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
    duration: "21 days · 15 min/day",
    category: "Mind",
    url: "https://www.mindvalley.com/bliss",
    description: "A 21-day journey to freedom from stress using Paul McKenna's signature hypnotherapy and NLP techniques. The course conditions your nervous system to respond differently to triggers — turning anxiety into calm, and stress into signal.",
    about: "Paul McKenna, PhD, is a world-renowned hypnotherapist and NLP practitioner whose books have sold over 10 million copies in 32 languages. He's worked with everyone from celebrities to athletes to corporate leaders. His approach is clinical but grounded — results-oriented, no fluff.",
    techniques: ["Havening Technique", "NLP anchoring", "Hypnotic induction", "Pattern interruption", "Positive future pacing"],
    keyLessons: [
      "Negative triggers can be transformed into allies with the right conditioning.",
      "The body has a built-in capacity for calm — most people never learn to activate it deliberately.",
      "15 minutes of deliberate nervous system regulation outperforms hours of reactive coping.",
    ],
    quote: "Stress isn't in the event. It's in the pattern of response to the event. You can change the pattern.",
    myTake: "Still early in this one. The Havening technique is the standout — a physical tapping pattern that genuinely interrupts the stress loop faster than anything else I've tried.",
  },
  {
    slug: "emotional-mastery",
    title: "Tapping into Emotional Mastery",
    teacher: "Jennifer Partridge",
    icon: "💙",
    color: "rose",
    lessons: 28,
    completed: 3,
    duration: "28 days",
    category: "Emotions",
    url: "https://www.mindvalley.com/emotional-mastery",
    description: "A 28-day EFT (Emotional Freedom Technique) journey to release emotional blocks, stored trauma, and limiting beliefs held in the body. Tapping is a body-first approach — you don't need to fully understand what you're releasing for it to work.",
    about: "Jennifer Partridge is an EFT practitioner and trauma specialist who specializes in helping people release deeply held emotional patterns. Her approach combines the physical precision of tapping with intuitive emotional guidance.",
    techniques: ["EFT tapping", "Meridian point activation", "Somatic release", "Limiting belief reframe", "Emotional mapping"],
    keyLessons: [
      "Emotions aren't problems to fix — they're information to feel and release.",
      "The body holds what the mind refuses. Physical patterns outlast mental resolution.",
      "You don't need to understand the root of an emotion to release it through tapping.",
    ],
    quote: "Your emotions are not your enemy. They are your most faithful messengers — and they've been waiting for you to listen.",
    myTake: "Only 3 lessons in and already feeling something shift. The basic tapping sequence — karate chop to crown — activates something almost immediately. Going slow on this one intentionally.",
  },
  {
    slug: "total-transformation",
    title: "Total Transformation Training",
    teacher: "Christine Bullock",
    icon: "🔥",
    color: "emerald",
    lessons: 28,
    completed: 0,
    duration: "28 days",
    category: "Fitness",
    url: "https://www.mindvalley.com/total-transformation",
    description: "A 28-day fitness transformation program that combines strength, cardio, flexibility, and mindset work. The philosophy: physical change starts from the inside. You can out-effort a bad mindset, but you can't out-exercise it.",
    about: "Christine Bullock is a certified fitness trainer, wellness expert, and entrepreneur known for combining physical training with mental conditioning. Her programs are built on sustainability — not punishment — and she's worked with athletes and everyday people alike.",
    techniques: ["HIIT training", "Strength circuits", "Mobility work", "Mindset conditioning", "Breath activation"],
    keyLessons: [
      "Physical transformation is 20% workout, 80% mindset.",
      "The body is already capable — it's the beliefs about it that need the work.",
      "Consistency beats intensity. A 20-minute daily practice outperforms an occasional 2-hour session.",
    ],
    quote: "Your body is not the obstacle. Your relationship with your body is the obstacle.",
    myTake: "Haven't started yet. Queued for when I want to add more structure to physical movement. Will pair well with Qigong.",
  },
  {
    slug: "modern-qigong",
    title: "Modern Qigong",
    teacher: "Lee Holden",
    icon: "🌊",
    color: "emerald",
    lessons: 30,
    completed: 0,
    duration: "30 days",
    category: "Energy",
    url: "https://www.mindvalley.com/modern-qigong",
    description: "A 30-day qigong practice for cultivating life-force energy (qi), reducing stress, and building deep inner stillness. Ancient Chinese movement medicine adapted for modern life — no studio required, 10–15 minutes a day.",
    about: "Lee Holden is one of the most recognized qigong teachers in the West, with over 25 years of practice and teaching. He trained under qigong masters in China and has translated the tradition into an accessible daily practice for modern practitioners.",
    techniques: ["Qigong movement sequences", "Standing meditation", "Breath cultivation", "Energy circulation", "Five Element theory"],
    keyLessons: [
      "Qi flows where attention goes. You can direct your own life-force energy with practice.",
      "10 minutes of qigong can shift more than an hour at the gym — different kind of work.",
      "Stillness is not the absence of movement. It's movement in perfect balance.",
    ],
    quote: "In the space between breath and movement, there is health. That space is qigong.",
    myTake: "Queued. I'm drawn to this one because of how much energy work resonates with me through Jeffrey Allen. Qigong feels like the physical counterpart to what I've been doing energetically.",
  },
  {
    slug: "higher-self-activation",
    title: "Higher Self Activation",
    teacher: "Ariya Lorenz",
    icon: "✨",
    color: "violet",
    lessons: 13,
    completed: 10,
    duration: "13 days",
    category: "Spiritual",
    url: "https://www.mindvalley.com/higher-self-activation",
    description: "A 13-day activation program to connect with your higher self, access inner wisdom, and expand into higher states of consciousness. Through guided meditation and energy work, Ariya helps you bridge the gap between who you are and who you are becoming.",
    about: "Ariya Lorenz is a spiritual teacher and consciousness coach who works at the intersection of energy healing, higher-dimensional guidance, and embodied transformation. Her approach is direct and experiential — less framework, more felt sense.",
    techniques: ["Higher self meditation", "Channeled guidance", "Consciousness expansion", "Energy body activation", "Divine alignment"],
    keyLessons: [
      "The higher self isn't above you — it's the version of you that was never afraid. Activation is just remembering.",
      "You already know. The work is clearing what's in the way of knowing that you know.",
      "Higher consciousness isn't a destination — it's a frequency you learn to hold.",
    ],
    quote: "You are not broken and you do not need to be fixed. You are simply not yet fully remembering who you are.",
    myTake: "10/13 lessons complete. This one surprised me. More practical than I expected — specific techniques for connecting upward. The activation meditations work immediately. Almost too well.",
  },
  {
    slug: "be-extraordinary",
    title: "Be Extraordinary",
    teacher: "Vishen Lakhiani",
    icon: "⭐",
    color: "amber",
    lessons: 30,
    completed: 0,
    duration: "30 days",
    category: "Consciousness",
    url: "https://www.mindvalley.com/be-extraordinary",
    description: "Vishen Lakhiani's flagship consciousness engineering program. Based on his book 'The Code of the Extraordinary Mind,' it challenges the cultural defaults we live by — the 'brules' (bullshit rules) — and teaches a systematic approach to designing a life from first principles.",
    about: "Vishen Lakhiani is the founder of Mindvalley, bestselling author, and one of the most recognized voices in personal development. His Consciousness Engineering model — upgraded beliefs + upgraded systems = extraordinary life — is the intellectual backbone of Mindvalley's curriculum.",
    techniques: ["Consciousness Engineering model", "Brules identification", "Extraordinary vision setting", "Level 1/2/3 consciousness framework", "Bending reality practice"],
    keyLessons: [
      "Most people are living by a rulebook they never chose — given to them by culture, family, and circumstance.",
      "The extraordinary life isn't harder than the ordinary one. It just requires deliberately choosing your beliefs.",
      "Happiness and vision aren't opposites. You can be deeply content AND deeply driven — simultaneously.",
    ],
    quote: "The rules of the society we grew up in are not the rules of the universe. Know the difference.",
    myTake: "Haven't started yet. This is the intellectual framework course — will help contextualize everything else I'm doing on Mindvalley. Vishen's thinking on Level 3 consciousness (transcendent goals) is what most draws me in.",
  },
  {
    slug: "duality",
    title: "Duality",
    teacher: "Jeffrey Allen",
    icon: "☯️",
    color: "violet",
    lessons: 49,
    completed: 15,
    duration: "7 weeks",
    category: "Energy Healing",
    url: "https://www.mindvalley.com/duality",
    description: "A 7-week journey to master your personal energetic system. Jeffrey Allen guides you through connecting with your energy body, eliminating energy blocks, strengthening your chakras, healing yourself and others, and accessing intuitive guidance. The most rigorous energy healing curriculum available outside of formal training.",
    about: "Jeffrey Allen was a software engineer before becoming one of the world's most recognized energy healers and spiritual teachers. His transition from analytical mind to intuitive practice gives him a unique credibility — he explains energy work in terms that resonate with skeptics and believers alike. He teaches through Mindvalley and works with clients globally.",
    techniques: ["Energy body connection", "Chakra strengthening", "Block identification and release", "Intuitive guidance access", "Healing transmission", "Spirit guide connection"],
    keyLessons: [
      "You are not separate from your energy body. You ARE your energy body. Everything else is secondary.",
      "Energy blocks aren't malevolent — they're protective. They formed for a reason. Release requires understanding, not force.",
      "Intuition isn't a mystical gift. It's a developed skill — like any other — that gets stronger with practice.",
    ],
    quote: "Your energy goes where you put your attention. Put your attention on what you want, not on what you fear.",
    myTake: "15/49 lessons in and this is already the most impactful course on Mindvalley for me. The framework for understanding the energy body is precise. The guided exercises work in real time. I can feel the difference between a clear and blocked chakra now — that didn't used to be true.",
  },
  {
    slug: "art-of-manifesting",
    title: "The Art of Manifesting",
    teacher: "Jeffrey Allen",
    icon: "✦",
    color: "amber",
    lessons: 0,
    completed: 0,
    duration: "In queue",
    category: "Manifestation",
    url: "https://www.mindvalley.com/art-of-manifesting",
    description: "Jeffrey Allen's deep dive into the mechanics of manifestation — how energy creates reality and how to consciously direct that creative force toward what you genuinely want. Built on the Duality foundation but focused specifically on the creative application of energy.",
    about: "Jeffrey Allen brings his energy healing framework into the practice of conscious creation. This course is less about visualization boards and more about energetic alignment — the actual mechanics of why some things manifest and others don't.",
    techniques: ["Energetic alignment", "Manifestation mechanics", "Reality creation framework", "Intention setting with energy", "Receiving practice"],
    keyLessons: [
      "Manifestation isn't magic — it's alignment. When your energy matches what you want, the external world reorganizes itself.",
      "Most people try to manifest from a place of lack. Lack creates more lack. You must already be in the energetic state of having.",
      "Receiving is a skill. Most people are great at wanting, bad at allowing.",
    ],
    quote: "You are always manifesting. The question is whether you're doing it consciously or by default.",
    myTake: "Queued for after I finish Duality. The two are paired — Duality builds the energetic foundation, Art of Manifesting applies it.",
  },
  {
    slug: "quantum-jumping",
    title: "Quantum Jumping",
    teacher: "Jeffrey Allen",
    icon: "🌌",
    color: "blue",
    lessons: 0,
    completed: 0,
    duration: "In queue",
    category: "Consciousness",
    url: "https://www.mindvalley.com/quantum-jumping",
    description: "Visualization and consciousness techniques to access parallel versions of yourself — selves who have already solved the problems you're facing, who already have the skills, the confidence, the outcomes. You make contact with them and integrate what they know.",
    about: "Jeffrey Allen extends his energy healing work into the quantum field — the idea that consciousness isn't limited to this single timeline and that deliberate intention can access the intelligence of other versions of self. Whether you take this literally or metaphorically, the results are real.",
    techniques: ["Quantum visualization", "Parallel self access", "Consciousness expansion", "Timeline navigation", "Skill and wisdom integration"],
    keyLessons: [
      "The version of you that has already solved the problem exists. The work is making contact with that version and integrating what they know.",
      "From the perspective of consciousness, time is not linear. The future self is accessible now.",
      "Skills, wisdom, and ways of being can be 'downloaded' from your parallel selves through deliberate practice.",
    ],
    quote: "You don't have to figure it all out from where you are. You can borrow clarity from where you're going.",
    myTake: "Queued. This is the most out-there of the Jeffrey Allen courses conceptually — and probably the one I'll need the most grounding before approaching. After Duality and Art of Manifesting.",
  },
]

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return COURSES.map((c) => ({ slug: c.slug }))
}

export const dynamicParams = false

export default async function MindvalleyCourseDetailPage({ params }: Props) {
  const { slug } = await params
  const course = COURSES.find((c) => c.slug === slug)
  if (!course) notFound()

  const pct = course.lessons > 0 ? Math.round((course.completed / course.lessons) * 100) : null

  return (
    <div className="max-w-2xl mx-auto">
      <PagePathStatic path={`niki/hobbies/mindvalley/${slug}`} />

      <div className="space-y-6">

        {/* Header card */}
        <div className={`rounded-2xl border p-6 ${colorMap[course.color]}`}>
          <div className="flex items-start justify-between gap-3 mb-4">
            <span className="text-4xl">{course.icon}</span>
            <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${badgeMap[course.color]}`}>{course.category}</span>
          </div>
          <h1 className="text-2xl font-bold leading-tight mb-1">{course.title}</h1>
          <p className="text-sm opacity-70 font-medium mb-1">{course.teacher}</p>
          <p className="text-xs opacity-60">{course.duration}</p>

          {pct !== null && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs opacity-60">Progress</span>
                <span className="text-xs font-mono opacity-60">{course.completed}/{course.lessons} lessons</span>
              </div>
              <div className="h-2 bg-black/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-current opacity-60"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-notion-surface border border-notion-border rounded-xl p-5">
          <p className="text-sm text-notion-text leading-relaxed">{course.description}</p>
        </div>

        {/* My take */}
        {course.myTake && (
          <div className="border-l-4 border-notion-accent/40 pl-5 py-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-notion-muted mb-2">My take</p>
            <p className="text-sm text-notion-text leading-relaxed italic">{course.myTake}</p>
          </div>
        )}

        {/* Key quote */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-700/60 mb-3">Key quote</p>
          <blockquote className="text-base text-notion-text leading-relaxed italic mb-2">
            &ldquo;{course.quote}&rdquo;
          </blockquote>
          <p className="text-xs text-notion-muted">— {course.teacher}</p>
        </div>

        {/* Key lessons */}
        <div>
          <p className="text-xs font-semibold text-notion-muted uppercase tracking-widest mb-3">Key lessons</p>
          <div className="space-y-2">
            {course.keyLessons.map((lesson, i) => (
              <div key={i} className="flex items-start gap-3 bg-notion-surface border border-notion-border rounded-xl px-4 py-3">
                <span className="text-notion-accent text-sm mt-0.5 shrink-0">•</span>
                <p className="text-sm text-notion-text leading-relaxed">{lesson}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Techniques */}
        <div>
          <p className="text-xs font-semibold text-notion-muted uppercase tracking-widest mb-3">Techniques covered</p>
          <div className="flex flex-wrap gap-2">
            {course.techniques.map((tech) => (
              <span
                key={tech}
                className="text-xs bg-notion-surface border border-notion-border rounded-full px-3 py-1 text-notion-muted"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* About teacher */}
        <div className="bg-notion-surface border border-notion-border rounded-xl p-5">
          <p className="text-xs font-semibold text-notion-muted uppercase tracking-widest mb-3">About {course.teacher}</p>
          <p className="text-sm text-notion-text leading-relaxed">{course.about}</p>
        </div>

        {/* External link */}
        <div className="flex items-center justify-between pt-2">
          <Link href="/self/hobbies/mindvalley" className="text-xs text-notion-muted hover:text-notion-accent transition-colors">
            ← All Mindvalley courses
          </Link>
          <a
            href={course.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-notion-accent hover:underline"
          >
            View on Mindvalley ↗
          </a>
        </div>

      </div>
    </div>
  )
}
