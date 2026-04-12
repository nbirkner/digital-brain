import PageHeader from "@/components/PageHeader"
import PagePathStatic from "@/components/PagePathStatic"
import MarkdownRenderer from "@/components/MarkdownRenderer"
import { getMarkdownFileWithPending } from "@/lib/content"
import LabelPageContent from "@/components/LabelPageContent"

const ROUTINE_SECTIONS = [
  {
    id: "mental-health",
    icon: "🧠",
    label: "Mental Health",
    description: "2-3 of these per day",
    items: [
      "Myndlift neurofeedback session x 30 min",
      "Pulsetto session x 10 min (twice a day)",
      "Neuromyst tDCS x 20 min",
      "Luminette's light therapy glasses x 20 min",
      "Meditation x 20 min (Dave Potter from MBSR program, Insight Timer)",
      "Reiki before sleeping",
      "Tapping / Somatics",
      "Journaling / Reading",
    ],
  },
  {
    id: "physical",
    icon: "🏋️",
    label: "Physical",
    description: "2-3 of these per day",
    items: [
      "Sauna x 20 min",
      "Koapro fascia massage tool x 2-3 min",
      "Jen PT (App) daily exercises",
      "1 Classpass class a day x 50 min",
    ],
  },
  {
    id: "skin",
    icon: "✨",
    label: "Skin",
    description: "2-3 of these per day",
    items: [
      "Red light machine for face (Omnilux) — skip if you did Sauna since it already has RLT",
      "Night time face wash + sleep mask (YTTP Superberry Hydrate + Glow Dream Mask or Kiehl's Midnight Recovery)",
      "Night time acne cream (Azalta Gel — Tretinoin 0.025%, Niacinamide 2%, Spironolactone 5%)",
      "Daytime YTTP moisturizer + sunscreen",
      "Carepod for skin and sleep",
    ],
  },
  {
    id: "meds",
    icon: "💊",
    label: "Medication & Supplements",
    items: [
      "Bupropion 300 mg",
      "Zoloft 12.5 mg",
      "Supplement Stack (see Health page for full stack)",
    ],
  },
]

const CLASSPASS_SCHEDULE = [
  { studio: "Mighty Pilates", frequency: "2-3x / week" },
  { studio: "Baptiste", frequency: "1-2x / week" },
  { studio: "P13", frequency: "1x / week" },
  { studio: "Move SF", frequency: "1x / week" },
]

const SOCIAL_ANCHORS = [
  "St Dominic's Young Adults Group — Wednesdays 7:30 pm in the Parish Hall",
  "P13 Social Events (ask Jared to add to mailing list)",
  "Workouts with Hari",
]

const FASCIA_STEPS = [
  { emoji: "🦶", area: "Ankles", duration: "1 min", instruction: "Seated on bed. Slow circles each direction × 8–10, then flex/point × 10. Both feet." },
  { emoji: "🦵", area: "Knees", duration: "1 min", instruction: "Standing. Small slow circles × 8–10 each direction. Then gentle easy bends." },
  { emoji: "🍑", area: "Hips", duration: "1 min", instruction: "Hands on hips. Big slow circles clockwise + counterclockwise. Add figure-8s if it feels good." },
  { emoji: "🌀", area: "Spine", duration: "1 min", instruction: "Cat-cow on all fours × 8–10, moving like liquid. Then slow side bends or a gentle forward fold." },
  { emoji: "🙌", area: "Shoulders", duration: "1 min", instruction: "Arm swings forward/back, slow shoulder rolls, then big arm circles both directions." },
]

export default async function RoutinePage() {
  const file = await getMarkdownFileWithPending("personal/docs/routine/index.md")

  return (
    <div>
      <PagePathStatic path="niki/routine" />
      <PageHeader
        icon="🎖️"
        title="My Routine"
        description="Daily rituals, physical practices, mental health anchors, and weekly rhythms."
      />

      {/* Grounding quotes */}
      <div className="space-y-3 mb-10">
        <blockquote className="border-l-2 border-notion-border pl-4 py-1 text-notion-muted italic text-sm">
          Human beings were never designed for the poorly nourished, sedentary, indoor, sleep-deprived, socially isolated, frenzied pace of twenty-first-century life.
        </blockquote>
        <blockquote className="border-l-2 border-notion-border pl-4 py-1 text-notion-muted italic text-sm">
          I wipe my tears away. I will get out of bed. I will shower. I will get dressed. I will conquer this day like I do every day.
        </blockquote>
      </div>

      {/* Morning Fascia Ritual */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-notion-muted uppercase tracking-wider mb-4">
          Morning Fascia Ritual
        </h2>
        <div className="bg-notion-surface border border-notion-border rounded-xl p-5">
          <p className="text-xs text-notion-muted mb-4 italic">
            Slow &amp; circular — you&apos;re re-liquifying, not stretching. 5 minutes total.{" "}
            <a
              href="https://substack.com/@stayyoung/note/c-197626962?r=p1eth&utm_medium=ios&utm_source=notes-share-action"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-notion-text transition-colors"
            >
              Source
            </a>
          </p>
          <div className="space-y-3">
            {FASCIA_STEPS.map((step) => (
              <div key={step.area} className="flex gap-3 items-start">
                <span className="text-lg shrink-0">{step.emoji}</span>
                <div>
                  <p className="text-sm font-medium text-notion-text">
                    {step.area} <span className="text-notion-muted font-normal">({step.duration})</span>
                  </p>
                  <p className="text-xs text-notion-muted mt-0.5">{step.instruction}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-notion-muted mt-4 pt-4 border-t border-notion-border">
            ✨ Finish: 3 deep breaths + a glass of water.
          </p>
        </div>
      </div>

      {/* Daily Routine Sections */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-notion-muted uppercase tracking-wider mb-4">
          Daily Practice Menu
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ROUTINE_SECTIONS.map((section) => (
            <div
              key={section.id}
              className="bg-notion-surface border border-notion-border rounded-xl p-5"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{section.icon}</span>
                <h3 className="font-semibold text-notion-text text-sm">{section.label}</h3>
              </div>
              {section.description && (
                <p className="text-xs text-notion-muted mb-3 ml-7">{section.description}</p>
              )}
              <ul className="space-y-1.5 ml-7">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-notion-muted">
                    <span className="mt-1 w-1 h-1 rounded-full bg-notion-border shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ClassPass weekly schedule */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-notion-muted uppercase tracking-wider mb-4">
          ClassPass Weekly Schedule
        </h2>
        <div className="bg-notion-surface border border-notion-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-notion-border">
                <th className="text-left px-4 py-3 text-notion-muted font-medium">Studio</th>
                <th className="text-left px-4 py-3 text-notion-muted font-medium">Frequency</th>
              </tr>
            </thead>
            <tbody>
              {CLASSPASS_SCHEDULE.map((row, i) => (
                <tr
                  key={row.studio}
                  className={`${i < CLASSPASS_SCHEDULE.length - 1 ? "border-b border-notion-border" : ""} hover:bg-notion-hover transition-colors`}
                >
                  <td className="px-4 py-3 text-notion-text font-medium">{row.studio}</td>
                  <td className="px-4 py-3 text-notion-muted">{row.frequency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Social anchors */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-notion-muted uppercase tracking-wider mb-4">
          Social Connection
        </h2>
        <div className="bg-notion-surface border border-notion-border rounded-xl p-5">
          <ul className="space-y-2">
            {SOCIAL_ANCHORS.map((anchor) => (
              <li key={anchor} className="flex items-start gap-2 text-sm text-notion-muted">
                <span className="mt-1 w-1 h-1 rounded-full bg-notion-border shrink-0" />
                {anchor}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Raw markdown fallback if file exists with extra content */}
      {file && file.content.trim().length > 0 && (
        <details className="bg-notion-surface border border-notion-border rounded-xl overflow-hidden">
          <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-notion-hover select-none text-sm text-notion-muted">
            <span>View raw Notion content</span>
            <svg className="w-4 h-4 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-4 pb-4 pt-2 border-t border-notion-border">
            <MarkdownRenderer content={file.content} />
          </div>
        </details>
      )}
      <LabelPageContent tagId="life-admin" />
    </div>
  )
}
