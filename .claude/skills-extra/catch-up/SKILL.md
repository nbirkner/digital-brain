---
name: catch-up
description: "Use when returning from time away (OOO, vacation, long weekend), feeling behind on open threads, or needing to resurface accumulated tasks and decisions across the workspace. Keywords: catch up, I'm back, what did I miss, feeling behind, resuming work, too much open, triage."
---

# Catch-Up Workflow

You are the orchestrator of a multi-agent catch-up workflow. You're not building a backlog. You're being Niki's chief of staff: scanning everything, prepping everything, and handing her a time-blocked plan so she can hit the ground running.

**Hard constraint:** No external writes. No Notion, Linear, GitHub, Slack, or any API calls that modify state. READ from MCPs is encouraged. All output is local files in `outputs/`. Niki reviews and decides what to publish.

**Args:**
- `--since YYYY-MM-DD` — cutoff for scouts. Default: 7 days.
- `--dry-run` — stops after Phase 2 classification.
- `--force` — bypasses skip-if-exists for stable deliverables.
- `--only {scout}` — run one scout only. Values: `action-items`, `meetings`, `docs`, `context`, `side-projects`.
- `--full` — shows all detail. Default is compact mode (one-screen summary + files).

---

## Phase 0: Orient & Gather

Before scouting, orient yourself and gather data from connected tools. This phase runs in the main agent (not subagents) because MCP access is more reliable here.

### Step 0.1: Quick Context

Ask Niki one question (using AskUserQuestion):

> "Before I scan — anything I should know? (What happened while you were out, what you're most worried about, or hit Enter to skip)"

Store the response as `{USER_CONTEXT}`. If she answers, use it to weight the classification in Phase 2 — initiatives she mentions get priority. If skipped, treat all initiatives equally.

### Step 0.2: Query Connected Tools

Try each MCP below. If not connected or the call fails, skip it and note "not available." Store results as text variables to pass to scouts.

| MCP | Query | Store as | Passed to |
|---|---|---|---|
| Google Calendar | `gcal_list_events` for next 5 business days | `{UPCOMING_MEETINGS}` | Scout 2 |
| Gmail | `gmail_search_messages` "is:unread to:me after:{CUTOFF_DATE}" (limit 30) | `{UNREAD_EMAILS}` | Phase 2 classification |
| Linear | `list_issues` assigned to me, not Done | `{LINEAR_ISSUES}` | Phase 2 classification |
| Granola | `list_meetings` from `{CUTOFF_DATE}` to `{TODAY}` | `{GRANOLA_MEETINGS}` | Scout 2 |
| Notion (Work) | `notion-search` for pages modified after `{CUTOFF_DATE}` | `{NOTION_CHANGES}` | Phase 2 classification |

### Step 0.3: Load Previous Run

1. Glob for `work/docs/catchup/*-review-queue.md`. Take the most recent file that is NOT today.
2. If found: extract `- [x]` items as `{DONE_ITEMS}` and all item titles as `{PREV_ITEMS}`.
3. If not found: set both to empty.

### Step 0.4: Detect Unprocessed Meetings

If `{GRANOLA_MEETINGS}` is available, compare against `work/notes/` folder structure. Any Granola meeting without a corresponding local note file → add to `{UNPROCESSED_MEETINGS}`. These get flagged in Phase 2 as "run `/daily-meeting-summary {DATE}` to process."

---

## Phase 1: Scout (parallel)

Set `{TODAY}` and resolve `{CUTOFF_DATE}` (from `--since` or default 7 days back).

If `--only {scout}` was passed, spawn only that one. Otherwise, spawn all 5 in parallel using `subagent_type: "general-purpose"`.

**Conditional skip:** Before spawning Scout 5 (side projects), glob `shared/docs/logs/` for mentions of side project names in the date range. If zero mentions, skip Scout 5 entirely.

Each scout returns items in this format:
```
- [{domain}] {item text} | source: {path} | date: {YYYY-MM-DD} | age: {N}d | initiative: {name} | type: {doc/plan/agenda/checklist/communication/code/external} | stakes: {low/high} | reason: {one sentence}
```

---

### Scout 1 — Action Items

> Scan `shared/docs/logs/` from `{CUTOFF_DATE}` onward. Extract every unchecked `- [ ]`. Record item text, source path, date, age in days, initiative, type, and stakes (LOW: local doc/plan/agenda/draft; HIGH: external system/code change/stakeholder decision). Return ONLY the list.

### Scout 2 — Meetings & Calendar

Pass `{UPCOMING_MEETINGS}` and `{GRANOLA_MEETINGS}` as context to this scout.

> Scan `work/notes/` from `{CUTOFF_DATE}` onward. Extract: open action items for Niki, undocumented decisions, follow-up meetings needing agendas, follow-up messages to draft (look for "send", "message", "follow up with", "let X know").
>
> **Upcoming meetings (if calendar data provided):** For each meeting in the next 5 business days, check if an agenda exists in `work/notes/`. If not, add: "[meetings] Create agenda for {meeting} ({date}) | stakes: low". Cross-reference attendees against stakeholder names from recent meeting notes.
>
> **Unprocessed meetings (if Granola data provided):** Flag meetings that occurred but have no local notes.
>
> Drafting a follow-up message as a local file = LOW. Actually sending = HIGH.
> Return ONLY the list.

### Scout 3 — Docs & PRDs

> Scan `work/docs/prds/`, `work/docs/decisions/`, `work/docs/analyses/`. Only flag docs that: (a) were created/modified after `{CUTOFF_DATE}`, (b) are referenced in recent meeting notes or logs, or (c) have obvious TODOs regardless of date. Extract: incomplete sections, unmade decision docs, missing plans. Return ONLY the list.

### Scout 4 — Context & Memory

> Scan `work/context/` and `/Users/nikibirkner/.claude/projects/-Users-nikibirkner-Code-Niklaude/memory/MEMORY.md`. Flag: outdated stakeholder profiles (compare against recent meeting notes), stale MEMORY.md entries, missing strategy docs for active initiatives. Return ONLY the list.

### Scout 5 — Side Projects (conditional)

> Scan `shared/docs/logs/` for entries mentioning side project names (tarot-ai, gpu-price-tracker, and any others found in headers). Extract open items, planned features, flagged bugs. Code changes = HIGH. Docs/plans = LOW. Return ONLY the list.

---

## Phase 2: Classify & Prioritize

### Step 2.1: Merge & Deduplicate

Collect all scout findings. Remove items matching `{DONE_ITEMS}`. Deduplicate (keep the version with more context; if stakes disagree, default to higher).

### Step 2.2: "What Shipped" Summary

Before classifying open items, scan scout findings and `{NOTION_CHANGES}` for evidence of completed work: checked `- [x]` items, meeting notes mentioning "shipped/launched/completed/merged", Linear issues that moved to Done. Write 5-10 bullet points capturing what happened while Niki was out.

### Step 2.3: Stakes & Staleness

**Staleness:** Items with `age > 30d` → separate "Stale" bucket. Not auto-executed. Niki confirms relevance.

**Downgrade to LOW:** draft/write a local file, create agenda, synthesize decisions, draft a follow-up message or Slack message (as a local file — always auto-draft these).

**Escalate to HIGH:** push/deploy/merge/send to external system, code changes, requires Niki's personal knowledge or judgment.

### Step 2.4: Leverage Filter

For each review queue item, ask: **"What happens if Niki does nothing on this for another week?"**

- If nothing bad happens → label `can-wait` and deprioritize
- If something actively degrades → label `urgent`
- If a deadline passes → label `deadline` with the date

### Step 2.5: Convergence Detection

Count how many scouts flagged items for each initiative. If 3+ scouts flagged the same initiative → add a convergence note: "⚡ {initiative}: flagged by {N} scouts. This is your highest-signal area."

### Step 2.6: Classify & Print

Enrich classification with `{USER_CONTEXT}` — if Niki mentioned specific concerns, boost those initiatives.

Also add MCP-sourced items:
- `{UNREAD_EMAILS}`: group by sender, note count. If any sender is in stakeholder profiles, flag as high-priority.
- `{LINEAR_ISSUES}`: flag blocked issues and issues with unread comments.
- `{UNPROCESSED_MEETINGS}`: flag with "run `/daily-meeting-summary {DATE}`" action.

Print summary (compact by default — expand with `--full`):

```
## Catch-Up Summary

**What shipped while you were out:**
- {bullet list, 5-10 items}

**⚡ Highest-signal initiative:** {name} (flagged by {N} scouts)

**Open items:** {N} low-stakes (will execute) · {N} high-stakes (review queue) · {N} stale (confirm relevance)
**Inbox:** {N} unread emails ({N} from stakeholders) · {N} Linear issues assigned · {N} unprocessed meetings

Top 5 low-stakes deliverables I'll produce:
1. [initiative] Item → Type → Path
...

Top 5 review queue items (by urgency):
1. [initiative] Item → Why → Action
...

{if --full: show all items}
{if stale items exist: show stale bucket}
```

**Not doing this week** (items that can wait or should be delegated):
```
- [initiative] {item} → {reason it can wait or who should own it}
```

If `--dry-run`, stop here.

---

## Phase 3: Execute

If 0 low-stakes items, skip to Review Queue Writer.

Announce: "Spawning executor agents for {N} deliverables..."

Spawn executors in parallel (cap: 10 items, batch by 5). Also spawn the Review Queue Writer. Wait for all to complete.

Collect confirmations: `Done: {path} | Summary: {sentence}` or `Skipped (exists): {path}`.

### Executor Brief Template

> You are producing one deliverable as part of Niki's catch-up workflow.
>
> **What to produce:** {deliverable}
> **Initiative:** {initiative}
> **Output path:** {path}
> **Output directory:** {dir}
> **Topic keyword:** {slug}
> **Dated:** {yes/no}
> **Is communication draft:** {yes/no}
> **Force overwrite:** {yes/no}
> **Files to read for context:** {list}
> **Cross-initiative context:** {related files or "none"}
>
> Rules:
> 0. **Skip check** (stable, non-forced only): Glob `*{topic_keyword}*` in `{dir}`. If match, respond "Skipped (exists): {path}" and stop.
> 1. Read all context files before writing.
> 2. Write to exactly the output path.
> 3. **Communication drafts**: add `> ⚠️ Draft — verify content and tone before sending. Generated from meeting notes; may miss context from verbal conversations.` at the top.
> 4. **State recommendations explicitly.** If there are options, pick one and say "Recommended: {option} because {reason}." Don't present 3 equal options — have a point of view.
> 5. **Ground in data or name the gap.** Use real numbers, customer names, deal values where available. If data is missing, say "Data needed: {specific query}" instead of using hypothetical numbers.
> 6. Follow Niki's writing style: short sentences, no em dashes, no buzzwords, contractions OK, bullets over paragraphs.
> 7. No external actions. Write files only.
> 8. End with: `Done: {path} | Summary: {one sentence}`

### Output Path Mapping

| Type | Dated? | Comm? | Path |
|---|---|---|---|
| Meeting agenda | Yes | No | `work/notes/YYYY-MM/YYYY-MM-DD/{name}-agenda.md` |
| Weekly plan | Yes | No | `work/docs/comms/weekly-plans/{date}-weekly-plan.md` |
| Status update | Yes | Yes | `work/docs/comms/status-updates/{date}-{topic}.md` |
| Slack/follow-up msg | Yes | Yes | `work/docs/comms/slack-messages/{date}-{topic}.md` |
| Decision doc | No | No | `work/docs/decisions/{date}-{topic}.md` |
| PRD/path-forward | No | No | `work/docs/prds/{initiative}/{date}-{topic}.md` |
| Analysis | No | No | `work/docs/analyses/{date}-{topic}.md` |
| Context update | No | No | `work/docs/other/{date}-context-update-{topic}.md` |

### Review Queue Writer

> Write `work/docs/catchup/{TODAY}-review-queue.md` grouped by action type. Each item gets a `- [ ] Done` checkbox, a NEW/CARRIED OVER label, and a time estimate.
>
> Sections (omit empty ones):
> - **📅 Schedule** (meetings to book — include who, what, suggested day)
> - **💬 Send** (messages to review and send — link to draft if auto-produced)
> - **📖 Review** (docs/PRs needing Niki's eyes — include what to look for)
> - **🔧 External Write** (Notion/Linear/GitHub actions — include exact steps)
> - **🤔 Decision** (items needing Niki's judgment — include options and recommendation)
> - **⏸️ Can Wait** (items labeled can-wait — include why they can wait)
>
> Each item format:
> ```
> ### {Title} {NEW / CARRIED OVER (Nd)} — ~{time estimate}
> **What:** {one sentence}
> **Action:** {specific, actionable}
> **Context:** {file links}
> **Urgency:** {critical/high/medium/low}
> - [ ] Done
> ```

---

## Phase 4: Synthesize & Output

After all executors complete, write three files:

### File 1: Catch-Up Index

Write `work/docs/catchup/{TODAY}-catchup-index.md`:

```markdown
# Catch-Up — {TODAY}

Scanned {N} days. Produced {N} deliverables. {N} review items ({N} new, {N} carried over).

---

## What Shipped While You Were Out

{5-10 bullet points from Phase 2 "what shipped" summary}

---

## ⚡ Highest Signal

{Convergence note — which initiative was flagged most, and what the top action is}

---

## Start Here (Day 1)

Do these first. Ordered by dependency and urgency.

| # | Time | What | File or action |
|---|---|---|---|
| 1 | 5m | {quick win — e.g., check Lattice status} | {link or action} |
| 2 | 15m | {read key deliverable} | [{file}]({path}) |
| 3 | 30m | {review queue critical item} | [review-queue.md](./{TODAY}-review-queue.md) |

See time-blocked Day 1 script: [{TODAY}-day-1-script.md](./{TODAY}-day-1-script.md)

---

## Deliverables Produced

| # | Initiative | Deliverable | Summary | File |
|---|---|---|---|---|
| 1 | {init} | {name} | {one-sentence summary} | [{file}]({path}) |

Skipped: {list or "none"} · Failed: {list or "none"}

---

## Review Queue ({N} items)

| # | Type | Initiative | Item | Urgency | Est. | Status |
|---|---|---|---|---|---|---|
| 1 | 📅 | {init} | {item} | {urg} | ~{time} | NEW |

Full detail: [review-queue.md](./{TODAY}-review-queue.md)

---

## Not Doing This Week

{Items from Phase 2 "not doing" list — what to defer/delegate and why}

---

## Unprocessed Meetings

{If any: list with "run /daily-meeting-summary {DATE}" actions. If none: omit section.}

---

## Inbox Snapshot

{If email data available: N unread, N from stakeholders, top 3 threads needing reply}
{If Linear data available: N assigned issues, N blocked, N with unread comments}
{If neither available: omit section}

---

*Generated by `/catch-up` on {TODAY}. Re-run: `/catch-up --since {date}`*
```

### File 2: Day 1 Script

Write `work/docs/catchup/{TODAY}-day-1-script.md`:

A time-blocked schedule for the first day back. Pull from: calendar events (`{UPCOMING_MEETINGS}`), critical review queue items, and deliverables that need reading.

Structure:
```markdown
# Day 1 Script — {TODAY}

## Before anything else (first 15 min)
- [ ] {deadline items — e.g., check Lattice, check if Pay Later cutover completed}

## Morning deep work (9:00–11:00)
- [ ] Read: {key deliverable} (~10 min)
- [ ] Read: {key deliverable} (~10 min)
- [ ] Action: {critical review queue item} (~20 min)
- [ ] Action: {critical review queue item} (~15 min)

## Pre-meeting prep (11:00–11:30)
- [ ] Prep for {first meeting}: read {file}, key point: {one sentence}

## Meetings (11:30–...)
{Pull from calendar if available, otherwise note: "Check calendar and slot meetings here"}

## Afternoon (post-meetings)
- [ ] Send: {follow-up messages — link to drafts}
- [ ] Schedule: {meetings that need booking}

## End of day
- [ ] Run `/daily-plan` tomorrow — catch-up findings are already loaded
```

Rules for the Day 1 Script:
- Quick wins (< 5 min) go first
- Prep for meetings goes before the meeting, not after
- Deep work goes in the morning
- Messages/scheduling go in the afternoon
- Don't plan more than 6 hours of work (return days are chaotic)
- If no calendar data, note where meetings would go but don't guess

### File 3: Catch-Up Seed

Write `work/docs/catchup/{TODAY}-catchup-seed.md`:

A small file that `/daily-plan` and `/weekly-plan` can read on the next run.

```markdown
# Catch-Up Seed — {TODAY}

## Top carryover priority
{The single most important thing from this catch-up run}

## Biggest unresolved blocker
{The item that blocks the most other items}

## Convergence signal
{Which initiative had the most scout hits and what to do about it}

## Review queue critical items still open
{List of critical items — daily-plan should check these first}
```

### Quality Self-Check

Before presenting the final output, verify:
- [ ] Every review queue item has a specific recommended action (not just "follow up")
- [ ] Every deliverable in the index has a one-sentence summary
- [ ] Start Here table has ≤ 7 rows (if more, you haven't prioritized enough)
- [ ] No item lacks an initiative label
- [ ] Stale items are separated from active items
- [ ] "Not Doing" section exists and has at least 2 items (if it's empty, you haven't made hard calls)
- [ ] Day 1 Script has ≤ 6 hours of planned work
- [ ] Communication drafts have the ⚠️ banner

If any check fails, fix it before writing the files.

---

## Done

Tell Niki:

```
Catch-up complete.

What shipped: {N} items completed while you were out
Produced: {N} deliverables ({N} skipped)
Review queue: {N} items ({N} new, {N} carried over)
Not doing: {N} items deferred

Your Day 1 script: work/docs/catchup/{TODAY}-day-1-script.md
Full index: work/docs/catchup/{TODAY}-catchup-index.md

Check off items in review-queue.md as you complete them — next run skips them.
```

Then offer: **"Want me to generate your return week plan? I'll use everything from this catch-up to set priorities for the full week."**

If yes, invoke `/weekly-plan` and pass the catch-up index and seed as context.
