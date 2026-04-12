import Link from "next/link"
import PageHeader from "@/components/PageHeader"
import { getMarkdownFilesWithPending, getMarkdownFileWithPending } from "@/lib/content"

import PagePathStatic from "@/components/PagePathStatic"
import EmptyState from "@/components/EmptyState"
import LabelPageContent from "@/components/LabelPageContent"

const LIFE_PRINCIPLES = [
  {
    number: "1",
    title: "Value daily progress",
    body: "Somewhere in God's Database there's a number — the days you'll work until you get there. Every day you spend seriously working decreases that N by 1. You don't get to choose it. Your only job is to whittle it down. Treat every day as progress.",
    color: "border-blue-500/20 bg-blue-500/5",
    accentColor: "text-blue-400",
  },
  {
    number: "2",
    title: "Take care of yourself",
    body: "The simple stuff is important. Sleep, exercise, real food, time with friends. The marginal hour sleeping beats the marginal hour working almost every time. Let structure be your shelter — freedom is your enemy when you're depleted.",
    color: "border-green-500/20 bg-green-500/5",
    accentColor: "text-green-400",
  },
  {
    number: "3",
    title: "Treat everything as a learning experience",
    body: "Do everything because you're interested. Stop caring about the outcome. Just go in and learn. You won't be so terrified. You'll be less attached and less crushed if you don't succeed.",
    color: "border-yellow-500/20 bg-yellow-500/5",
    accentColor: "text-yellow-400",
  },
  {
    number: "4",
    title: "Network",
    body: "Buy everyone coffee. When you meet someone, let them do the talking — otherwise you're doing it wrong. At the end, ask: \"who else should I talk to?\" People like to teach. They want to help. But they don't want to be pestered by strangers for favors.",
    color: "border-purple-500/20 bg-purple-500/5",
    accentColor: "text-purple-400",
  },
  {
    number: "5",
    title: "Keep grinding",
    body: "It's a numbers game. Keep putting yourself out there. Your habits and consistency are the chief determinants of your performance — not talent, not luck.",
    color: "border-orange-500/20 bg-orange-500/5",
    accentColor: "text-orange-400",
  },
  {
    number: "6",
    title: "Set attainable goals",
    body: "\"I want a job offer by January\" is a terrible goal — it's not up to you. \"I want to apply to 4 jobs every weekday\" is. Only set goals about your own behavior. Easy to measure. Completely in your control.",
    color: "border-red-500/20 bg-red-500/5",
    accentColor: "text-red-400",
  },
]

// Q2 focus areas parsed from 2026-Q2-goals.md
const Q2_FOCUS_AREAS = [
  {
    icon: "🧪",
    area: "Health",
    subtitle: "Close the lab gaps",
    description:
      "Vitamin D, Omega-3, Magnesium targets. Daily PT. Mental health protocol stays non-negotiable.",
  },
  {
    icon: "🌱",
    area: "Tend the thaw",
    subtitle: "Don't refreeze",
    description:
      "Daily Reiki before sleep. Ask for what you need — one real ask per week. Your fire is evidence.",
  },
  {
    icon: "💞",
    area: "Relationship",
    subtitle: "Can he meet me?",
    description:
      "Weekly Cheryl sessions. Name one thing you haven't been asking for and actually ask.",
  },
  {
    icon: "🎨",
    area: "Creative craftsmanship",
    subtitle: "Becoming an artist",
    description:
      "Scrapbooking, writing as craft, building the digital brain. Making things that belong to you.",
  },
  {
    icon: "🤝",
    area: "Community",
    subtitle: "Protect the anchors",
    description:
      "St. Dominic's Wednesdays. P13 with Jared. Workouts with Hari. These don't get sacrificed.",
  },
  {
    icon: "💰",
    area: "Financial",
    subtitle: "Clean up the ISO question",
    description:
      "ISO exercise strategy with Chris Pun. Backdoor Roth ($7K). Mid-year check-in with Rick.",
  },
  {
    icon: "💼",
    area: "Career posture",
    subtitle: "A stance, not goals",
    description:
      "ECP, ACH, orgs/projects GA. Be the steadiest person in the room because you're grounded, not performing.",
  },
]

export default async function GoalsPage() {
  const allFiles = (await getMarkdownFilesWithPending("personal/docs/growth")).filter(
    (f) =>
      !f.slug.endsWith("README") &&
      (f.autoTags.includes("goal") ||
        (Array.isArray(f.frontmatter.tags) && f.frontmatter.tags.includes("goal"))),
  )

  // Load Q2 goals file for the "how I want to feel" section
  const q2File = await getMarkdownFileWithPending(
    "personal/docs/growth/2026-Q2-goals.md",
  )
  const howIWantToFeel = q2File
    ? (q2File.content.match(/\*\*How I want to feel:\*\*\s*(.+)/)?.[1]?.trim() ?? "")
    : ""
  const feelWords = howIWantToFeel
    ? howIWantToFeel.split(",").map((w) => w.trim())
    : ["whimsy", "fulfilled", "light"]

  const totalCount = allFiles.length
  const shown = allFiles.slice(0, 50)

  return (
    <div>
      <PagePathStatic path="goals" />
      <PageHeader
        icon="🎯"
        title="Goals"
        description="Personal goals, quarterly intentions, and life planning."
      />
      {/* Q2 2026 Summary */}
      {q2File && (
        <div className="mb-10">
          {/* Quarter header */}
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-notion-accent/30 bg-notion-accent/15 px-2.5 py-1 text-xs font-semibold text-notion-accent">
              Q2 2026
            </span>
            <span className="text-sm text-notion-muted">April – June 2026</span>
          </div>

          {/* How I want to feel */}
          <div className="mb-5 rounded-xl border border-notion-border bg-notion-surface p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-notion-muted">
              How I want to feel
            </p>
            <div className="flex flex-wrap gap-2">
              {feelWords.map((word) => (
                <span
                  key={word}
                  className="rounded-full border border-notion-border bg-notion-hover px-4 py-1.5 text-sm font-medium text-notion-text"
                >
                  {word}
                </span>
              ))}
            </div>
            <div className="mt-4 space-y-1 border-t border-notion-border pt-4">
              <p className="text-xs text-notion-muted">
                <span className="font-medium text-notion-text">More of:</span> ease, expression,
                making things that are mine
              </p>
              <p className="text-xs text-notion-muted">
                <span className="font-medium text-notion-text">Less of:</span> holding
                everyone&apos;s weather, waiting for certainty before asking for what I need
              </p>
            </div>
          </div>

          {/* 7 focus areas */}
          <div className="grid gap-3 sm:grid-cols-2">
            {Q2_FOCUS_AREAS.map((area) => (
              <div
                key={area.area}
                className="rounded-xl border border-notion-border bg-notion-surface p-4 transition-colors hover:border-notion-accent/30"
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-lg">{area.icon}</span>
                  <div>
                    <h3 className="text-sm font-semibold leading-tight text-notion-text">
                      {area.area}
                    </h3>
                    <p className="text-xs text-notion-muted">{area.subtitle}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-notion-muted">{area.description}</p>
              </div>
            ))}
          </div>

          {/* Link to full doc */}
          <div className="mt-4 text-right">
            <Link
              href="/goals/2026-Q2-goals"
              className="text-xs text-notion-muted transition-colors hover:text-notion-accent"
            >
              Read full Q2 intentions →
            </Link>
          </div>
        </div>
      )}

      {/* All goals file list */}
      {allFiles.length === 0 ? (
        <EmptyState
          icon="🎯"
          message="no goals yet (or extremely good at keeping them vague)"
          hint="Add files to personal/docs/growth/ to see them here."
        />
      ) : (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-notion-muted">
              All Goals
            </h2>
            {totalCount > 50 && (
              <p className="text-xs text-notion-muted">
                {totalCount} total · showing 50 most recent
              </p>
            )}
          </div>
          <div className="space-y-1">
            {shown.map((f) => (
              <Link
                key={f.slug}
                href={`/goals/${f.slug}`}
                className="block rounded-lg border border-transparent px-3 py-2 transition-colors hover:border-notion-border hover:bg-notion-surface"
              >
                <p className="text-sm leading-snug text-notion-text">{f.displayTitle}</p>
                {f.frontmatter.date && (
                  <p className="mt-0.5 text-xs text-notion-muted">{f.frontmatter.date}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Philosophy — merged from /life/philosophy */}
      <div className="mt-16 border-t border-notion-border pt-10">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-notion-muted">
          Philosophy
        </h2>
        <p className="mb-6 text-xs text-notion-muted">Values, principles, and the big picture.</p>

        <div className="mb-10">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-notion-muted/60">
            Life
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {LIFE_PRINCIPLES.map((p) => (
              <div
                key={p.number}
                className={`rounded-xl border p-4 ${p.color}`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className={`text-xs font-bold ${p.accentColor}`}>{p.number}</span>
                  <h4 className="text-sm font-semibold text-notion-text">{p.title}</h4>
                </div>
                <p className="text-xs leading-relaxed text-notion-muted">{p.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-notion-muted/60">
            Money
          </h3>
          <div className="rounded-xl border border-notion-border bg-notion-surface p-5">
            <blockquote className="border-l-2 border-notion-accent/40 pl-4">
              <p className="text-sm italic leading-relaxed text-notion-text">
                &ldquo;I want to live in a way such that I minimize the number of years that I have to work for money. I will never spend more just because I earn more. I&rsquo;ll invest any surplus so that I can live on my own terms sooner than later.&rdquo;
              </p>
            </blockquote>
          </div>
        </div>
      </div>

      <LabelPageContent tagId="goal" />
    </div>
  )
}
