/**
 * Tag Taxonomy — the canonical list of tags, their categories, and visual styling.
 *
 * Four tag categories:
 *   1. Area — the life domain (Health, Finance, Career, etc.)
 *   2. Type — the content format (Journal, PRD, Decision, etc.)
 *   3. Work Area — work-specific sub-areas (Commerce, I&C, etc.)
 *   4. Meeting Type — meeting format labels (Cross Functional, 1:1, etc.)
 *
 * Each tag has:
 *   - id: kebab-case unique identifier
 *   - label: human-readable display name
 *   - category: which dimension it belongs to
 *   - color: Tailwind classes for pill styling (bg + text + border)
 */

// ─── Tag Categories ─────────────────────────────────────────────────────────

export type TagCategory = "area" | "type" | "work-area" | "meeting-type"

export interface TagDefinition {
  id: string
  label: string
  category: TagCategory
  /** Tailwind classes: "bg-X text-Y border border-Z" */
  color: string
}

// ─── Area Tags ──────────────────────────────────────────────────────────────

const AREA_TAGS: TagDefinition[] = [
  { id: "health",        label: "Health",        category: "area", color: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-400/20" },
  { id: "mental-health", label: "Mental Health", category: "area", color: "bg-teal-500/10 text-teal-500 border border-teal-500/20 dark:bg-teal-400/10 dark:text-teal-300 dark:border-teal-400/20" },
  { id: "fitness",       label: "Fitness",       category: "area", color: "bg-lime-500/10 text-lime-500 border border-lime-500/20 dark:bg-lime-400/10 dark:text-lime-300 dark:border-lime-400/20" },
  { id: "finance",       label: "Finance",       category: "area", color: "bg-green-500/10 text-green-500 border border-green-500/20 dark:bg-green-400/10 dark:text-green-300 dark:border-green-400/20" },
  { id: "career",        label: "Career",        category: "area", color: "bg-blue-500/10 text-blue-500 border border-blue-500/20 dark:bg-blue-400/10 dark:text-blue-300 dark:border-blue-400/20" },
  { id: "relationship",  label: "Relationship",  category: "area", color: "bg-pink-500/10 text-pink-500 border border-pink-500/20 dark:bg-pink-400/10 dark:text-pink-300 dark:border-pink-400/20" },
  { id: "pets",          label: "Pets",          category: "area", color: "bg-rose-500/10 text-rose-500 border border-rose-500/20 dark:bg-rose-400/10 dark:text-rose-300 dark:border-rose-400/20" },
  { id: "spiritual",     label: "Spiritual",     category: "area", color: "bg-violet-500/10 text-violet-500 border border-violet-500/20 dark:bg-violet-400/10 dark:text-violet-300 dark:border-violet-400/20" },
  { id: "learning",      label: "Learning",      category: "area", color: "bg-amber-500/10 text-amber-500 border border-amber-500/20 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-400/20" },
  { id: "mindvalley",    label: "Mindvalley",    category: "area", color: "bg-purple-500/10 text-purple-500 border border-purple-500/20 dark:bg-purple-400/10 dark:text-purple-300 dark:border-purple-400/20" },
  { id: "side-hustle",   label: "Side Hustle",   category: "area", color: "bg-orange-500/10 text-orange-500 border border-orange-500/20 dark:bg-orange-400/10 dark:text-orange-300 dark:border-orange-400/20" },
  { id: "travel",        label: "Travel",        category: "area", color: "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 dark:bg-cyan-400/10 dark:text-cyan-300 dark:border-cyan-400/20" },
  { id: "housing",       label: "Housing",       category: "area", color: "bg-slate-500/8 text-slate-500 border border-slate-500/15 dark:bg-slate-400/10 dark:text-slate-400 dark:border-slate-400/15" },
  { id: "hobbies",       label: "Hobbies",       category: "area", color: "bg-fuchsia-500/10 text-fuchsia-500 border border-fuchsia-500/20 dark:bg-fuchsia-400/10 dark:text-fuchsia-300 dark:border-fuchsia-400/20" },
  { id: "growth",        label: "Growth",        category: "area", color: "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 dark:bg-indigo-400/10 dark:text-indigo-300 dark:border-indigo-400/20" },
  { id: "life-admin",    label: "Life Admin",    category: "area", color: "bg-slate-500/8 text-slate-500 border border-slate-500/15 dark:bg-slate-400/10 dark:text-slate-400 dark:border-slate-400/15" },
]

// ─── Type Tags ──────────────────────────────────────────────────────────────

const TYPE_TAGS: TagDefinition[] = [
  { id: "journal",       label: "Journal",       category: "type", color: "bg-purple-500/10 text-purple-500 border border-purple-500/20 dark:bg-purple-400/10 dark:text-purple-300 dark:border-purple-400/20" },
  { id: "reflection",    label: "Reflection",    category: "type", color: "bg-violet-500/10 text-violet-500 border border-violet-500/20 dark:bg-violet-400/10 dark:text-violet-300 dark:border-violet-400/20" },
  { id: "quote",         label: "Quote",         category: "type", color: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-400/20" },
  { id: "dream",         label: "Dream",         category: "type", color: "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 dark:bg-indigo-400/10 dark:text-indigo-300 dark:border-indigo-400/20" },
  { id: "prd",           label: "PRD",           category: "type", color: "bg-sky-500/10 text-sky-500 border border-sky-500/20 dark:bg-sky-400/10 dark:text-sky-300 dark:border-sky-400/20" },
  { id: "goal",          label: "Goal",          category: "type", color: "bg-amber-500/10 text-amber-500 border border-amber-500/20 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-400/20" },
  { id: "decision",      label: "Decision",      category: "type", color: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 dark:bg-yellow-400/10 dark:text-yellow-300 dark:border-yellow-400/20" },
  { id: "analysis",      label: "Analysis",      category: "type", color: "bg-purple-500/10 text-purple-500 border border-purple-500/20 dark:bg-purple-400/10 dark:text-purple-300 dark:border-purple-400/20" },
  { id: "agenda",        label: "Agenda",        category: "type", color: "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 dark:bg-cyan-400/10 dark:text-cyan-300 dark:border-cyan-400/20" },
  { id: "strategy",      label: "Strategy",      category: "type", color: "bg-teal-500/10 text-teal-500 border border-teal-500/20 dark:bg-teal-400/10 dark:text-teal-300 dark:border-teal-400/20" },
  { id: "guide",         label: "Guide",         category: "type", color: "bg-lime-500/10 text-lime-500 border border-lime-500/20 dark:bg-lime-400/10 dark:text-lime-300 dark:border-lime-400/20" },
  { id: "roadmap",       label: "Roadmap",       category: "type", color: "bg-orange-500/10 text-orange-500 border border-orange-500/20 dark:bg-orange-400/10 dark:text-orange-300 dark:border-orange-400/20" },
  { id: "research",      label: "Research",      category: "type", color: "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 dark:bg-indigo-400/10 dark:text-indigo-300 dark:border-indigo-400/20" },
  { id: "review",        label: "Review",        category: "type", color: "bg-teal-500/10 text-teal-500 border border-teal-500/20 dark:bg-teal-400/10 dark:text-teal-300 dark:border-teal-400/20" },
  { id: "comms",         label: "Comms",         category: "type", color: "bg-sky-500/10 text-sky-500 border border-sky-500/20 dark:bg-sky-400/10 dark:text-sky-300 dark:border-sky-400/20" },
  { id: "weekly-plan",   label: "Weekly Plan",   category: "type", color: "bg-sky-500/10 text-sky-500 border border-sky-500/20 dark:bg-sky-400/10 dark:text-sky-300 dark:border-sky-400/20" },
  { id: "weekly-review", label: "Weekly Review", category: "type", color: "bg-teal-500/10 text-teal-500 border border-teal-500/20 dark:bg-teal-400/10 dark:text-teal-300 dark:border-teal-400/20" },
  { id: "log",           label: "Log",           category: "type", color: "bg-slate-500/8 text-slate-500 border border-slate-500/15 dark:bg-slate-400/10 dark:text-slate-400 dark:border-slate-400/15" },
]

// ─── Source Tags ────────────────────────────────────────────────────────────

const SOURCE_TAGS: TagDefinition[] = [
  { id: "work",     label: "Work",     category: "area", color: "bg-blue-500/10 text-blue-500 border border-blue-500/20 dark:bg-blue-400/10 dark:text-blue-300 dark:border-blue-400/20" },
  { id: "personal", label: "Personal", category: "area", color: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-400/20" },
  { id: "note",     label: "Note",     category: "type", color: "bg-slate-500/8 text-slate-500 border border-slate-500/15 dark:bg-slate-400/10 dark:text-slate-400 dark:border-slate-400/15" },
]

// ─── Work Area Tags ─────────────────────────────────────────────────────────

const WORK_AREA_TAGS: TagDefinition[] = [
  { id: "commerce",               label: "Commerce",                 category: "work-area", color: "bg-blue-500/10 text-blue-500 border border-blue-500/20 dark:bg-blue-400/10 dark:text-blue-300 dark:border-blue-400/20" },
  { id: "identity-collaboration", label: "Identity & Collaboration", category: "work-area", color: "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 dark:bg-indigo-400/10 dark:text-indigo-300 dark:border-indigo-400/20" },
  { id: "product-foundations",    label: "Product Foundations",      category: "work-area", color: "bg-violet-500/10 text-violet-500 border border-violet-500/20 dark:bg-violet-400/10 dark:text-violet-300 dark:border-violet-400/20" },
  { id: "pm",                     label: "PM",                       category: "work-area", color: "bg-blue-500/10 text-blue-500 border border-blue-500/20 dark:bg-blue-400/10 dark:text-blue-300 dark:border-blue-400/20" },
]

// ─── Meeting Type Tags ──────────────────────────────────────────────────────

const MEETING_TYPE_TAGS: TagDefinition[] = [
  { id: "cross-functional", label: "Cross Functional", category: "meeting-type", color: "bg-slate-500/8 text-slate-500 border border-slate-500/15 dark:bg-slate-400/10 dark:text-slate-400 dark:border-slate-400/15" },
  { id: "one-on-one",       label: "One On One",       category: "meeting-type", color: "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 dark:bg-indigo-400/10 dark:text-indigo-300 dark:border-indigo-400/20" },
  { id: "all-hands",        label: "All Hands",        category: "meeting-type", color: "bg-blue-500/10 text-blue-500 border border-blue-500/20 dark:bg-blue-400/10 dark:text-blue-300 dark:border-blue-400/20" },
  { id: "external",         label: "External",         category: "meeting-type", color: "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 dark:bg-cyan-400/10 dark:text-cyan-300 dark:border-cyan-400/20" },
  { id: "sprint-cycle",     label: "Sprint Cycle",     category: "meeting-type", color: "bg-violet-500/10 text-violet-500 border border-violet-500/20 dark:bg-violet-400/10 dark:text-violet-300 dark:border-violet-400/20" },
  { id: "technical",        label: "Technical",        category: "meeting-type", color: "bg-slate-500/8 text-slate-500 border border-slate-500/15 dark:bg-slate-400/10 dark:text-slate-400 dark:border-slate-400/15" },
  { id: "therapy",          label: "Therapy",          category: "meeting-type", color: "bg-rose-500/10 text-rose-500 border border-rose-500/20 dark:bg-rose-400/10 dark:text-rose-300 dark:border-rose-400/20" },
  { id: "triage",           label: "Triage",           category: "meeting-type", color: "bg-amber-500/10 text-amber-500 border border-amber-500/20 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-400/20" },
]

// ─── Exports ────────────────────────────────────────────────────────────────

export const ALL_TAGS: TagDefinition[] = [...AREA_TAGS, ...TYPE_TAGS, ...WORK_AREA_TAGS, ...MEETING_TYPE_TAGS, ...SOURCE_TAGS]

/** Lookup map: tag id -> TagDefinition */
export const TAG_MAP: Record<string, TagDefinition> = Object.fromEntries(
  ALL_TAGS.map((t) => [t.id, t])
)

/** Get a TagDefinition by id, with a fallback for unknown tags */
export function getTagDef(id: string): TagDefinition {
  return TAG_MAP[id] ?? {
    id,
    label: id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    category: "area",
    color: "bg-notion-hover text-notion-muted",
  }
}

/** All tag ids grouped by category */
export const TAGS_BY_CATEGORY: Record<TagCategory, TagDefinition[]> = {
  area: [...AREA_TAGS, ...SOURCE_TAGS.filter((t) => t.category === "area")],
  type: [...TYPE_TAGS, ...SOURCE_TAGS.filter((t) => t.category === "type")],
  "work-area": WORK_AREA_TAGS,
  "meeting-type": MEETING_TYPE_TAGS,
}
