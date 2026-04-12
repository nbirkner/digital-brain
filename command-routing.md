# Command Routing Rules

Used by: the Command tab (`/api/command`) AND Claude Code sessions
(via `@command-routing.md` import in CLAUDE.md).
To update: "update command file with X"

---

## Command Types

### `create_tasks` — create one or more Todoist tasks
Net-new tasks only. Infer: task name, project, label, priority, due date.

**Project:**
- Work (meetings, PRDs, engineering, stakeholders) → `TODOIST_WORK_PROJECT_ID`
- Personal (health, finances, errands, social, travel, family) → `TODOIST_PERSONAL_PROJECT_ID`
- Shared (tasks involving another person, household, joint decisions) → `TODOIST_SHARED_PROJECT_ID`
- Unclear → inbox

**Label — work (pick closest match):**
- 1:1s, syncs, people-specific meetings → "One On One"
- Calendar holds, meeting prep, PM admin → "PM"
- Engineering, infrastructure, APIs → "Technical"
- Cross-team coordination → "Cross Functional"
- All-hands, company-wide → "All Hands"
- External partners, vendors → "External"
- Sprint planning, delivery → "Sprint Cycle"

**Label — personal (pick closest match):**
- Physical health, doctor, workout → "Physical Health"
- Mental health, therapy (general) → "Mental Health"
- Individual therapy session → "Individual Therapy"
- Couples therapy → "Couples Therapy"
- Money, investing, taxes → "Finances"
- Financial planning, strategy → "Financial Planning"
- Trip, travel booking → "Travel"
- Home, apartment, errands → "Home & Life Admin"
- Family → "Family"
- Relationships → "Relationships"
- Books, courses, learning → "Learning & Growth"
- Creative, hobbies → "Creative Practice"
- Career → "Career Development"
- Church, spiritual, prayer → "Spiritual Practice"

**Priority:** Default p3. Urgency cues ("ASAP", "today", "urgent") → p1. "Important", "this week" → p2.
**Due date:** Parse natural language ("tomorrow", "end of week", "April 12th") into due_string.

### `reschedule_task` — move an existing Todoist task to a new date
"Move X to [date]", "push X to [date]", "reschedule X to [date]" → search by name, update due date.
CRITICAL: "move [task] to [date]" = reschedule_task, never trip_update.

### `trip_update` — update a specific trip planning file
Booking confirmations, dates, or itinerary changes for a known trip.

| Keywords | File |
|----------|------|
| My trip | `personal/site/travel/trips/my-trip.md` |

### `file_update` — edit content in a known personal file
Change a value, status, or add content to a named page.

| Keywords | File |
|----------|------|
| housing, rent, address, apartment | `personal/site/housing/housing-and-rent.md` |
| routine, morning ritual | `personal/docs/routine/morning-routine.md` |
| supplement stack, supplements | `personal/site/health/supplement-stack.md` |
| travel page, travel status | `personal/site/travel/travel.md` |
| finances, budget | `personal/site/finances/finances.md` |
| goals, quarterly goals | `personal/docs/growth/2026-Q1-goals.md` |

### `quick_note` — append a timestamped note to a categorized file
Short thought or observation. Categorized and appended, not a full doc.

- Work clues → `work/docs/other/quick-captures-YYYY-MM.md`
- Health, symptoms → `personal/notes/health-YYYY-MM.md`
- Finance, money → `personal/notes/finance-YYYY-MM.md`
- Goals, growth → `personal/docs/growth/capture-notes.md`
- Everything else → `personal/notes/YYYY-MM-DD.md`

### `update_label` — add, remove, or replace a tag/label on a note or doc
"Change the label on [note/doc] to X", "add tag Y to [file]", "remove label Z from [file]", "tag this as X".

**How to execute:**
1. Find the file — search `work/notes/`, `personal/notes/`, `work/docs/`, `personal/docs/` by title or slug.
2. Read the frontmatter. Labels live in the `tags` field as a YAML list (e.g. `tags: [finance, goal]`).
3. Edit only the `tags` field. Add, remove, or replace as requested. Do not touch any other frontmatter.
4. Valid tag IDs come from the taxonomy in `site/lib/tag-taxonomy.ts`. Use the `id` field (kebab-case), not the display label.
5. Commit with message: `chore: update tags on [filename]` and push.

**Tag ID reference (from taxonomy):**
- Area: `health`, `mental-health`, `fitness`, `finance`, `career`, `relationship`, `pets`, `spiritual`, `learning`, `side-hustle`, `travel`, `housing`, `hobbies`, `growth`, `life-admin`
- Type: `journal`, `reflection`, `quote`, `dream`, `prd`, `goal`, `decision`, `analysis`, `agenda`, `strategy`, `guide`, `roadmap`, `research`, `review`, `comms`, `weekly-plan`, `weekly-review`, `log`
- Work area: `commerce`, `identity-collaboration`, `product-foundations`, `pm`, `general`
- Meetings: `cross-functional`, `one-on-one`, `all-hands`, `external`, `sprint-cycle`, `technical`, `therapy`

### `create_doc` — create a new markdown doc in the site docs section
"Create a doc about X", "Draft a doc for X" → new markdown file with title and starter content.
- Work topic → `work/docs/other/[slug].md`
- Personal topic → `personal/docs/other/[slug].md`

### `external_page` — make a page publicly accessible
- "Create a public page about X" → `type: "dedicated"` (new route at `/external/[slug]`)
- "Publish / share my X page" → `type: "published"` (`contentPath` = repo-relative markdown path)
- "Unpublish my X" → remove from `site/data/external-published.ts`

### `unknown` — cannot interpret
Return a friendly error with examples.
