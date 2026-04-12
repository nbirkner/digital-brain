---
name: weekly-plan
description: "Use at the start of a new week (Monday morning, Sunday evening), or when Niki says 'plan this week', 'what should I focus on this week', 'set weekly priorities', 'plan next week', or 'weekly planning'. Also triggers after a weekly review when planning the next cycle. DO NOT trigger mid-week unless user explicitly asks to re-plan."
---

## Purpose

Generate an opinionated, high-leverage weekly priority plan grounded in real data from every source available. Not a generic planning template, but a "here's what actually matters this week and why" analysis.

## Usage

- `/weekly-plan` - Plan current or upcoming week (lightweight: meeting notes + calendar + linear + strategy)
- `/weekly-plan next` - Plan next week (when running on Friday)
- `/weekly-plan deep` - Full scan including repo activity (higher token usage)

---

## How This Differs From Generic Planning

This skill does what a great chief of staff would do: it reads everything, synthesizes across sources, and tells you the 2-3 things that actually matter. It searches:

1. **Meeting notes** (recent decisions, blockers surfaced, commitments made)
2. **Repo activity** (what shipped, what's in flight, what's stalled)
3. **Calendar** (meeting load, deep work capacity)
4. **Linear** (open tickets, blockers, upcoming milestones)
5. **Memory** (active initiatives, key dates, stakeholder context)
6. **Context library** (strategy, PRDs, decisions, metrics)
7. **Previous weekly plans and reviews** (carry-over, patterns)

The output is not a form to fill out. It's a prioritized action plan with dollar amounts, names, and deadlines attached.

---

## Workflow

### Phase 0: Calendar & Linear (Main Agent)

Before launching subagents, query Calendar and Linear directly in the main agent. This ensures MCP access is reliable.

**Google Calendar:**
- Call `mcp__claude_ai_Google_Calendar__gcal_list_events` for the target week (Monday-Friday)
- Extract: event titles, durations, attendees
- Calculate total meeting hours and identify open blocks by day
- Note top 2 meetings needing prep
- If unavailable: note it and continue

**Linear:**
- Run `linear my-issues` to get issues assigned to Niki (active only by default)
- Note any blockers or overdue items
- If unavailable: note it and continue

Store these results to pass into Phase 2 synthesis.

---

### Phase 0.5: Read Last Week's Seed

Before launching subagents, read the most recent file in `work/docs/comms/weekly-reviews/`. Find the `## Next Week Seed` section. If it exists, extract all 3 bullets (carryover priority, unresolved blocker, process improvement) and use them as the **starting input** for Phase 2 synthesis — they carry forward the thinking from last week's review automatically.

If no weekly review file exists or no `## Next Week Seed` section is found, skip this step and proceed normally.

---

### Phase 1: Gather Everything (Use Parallel Agents)

Launch 2 agents in parallel using the `haiku` model (Calendar & Linear already handled above). Only add the repo scan agent if the user ran `/weekly-plan deep`.

**Agent 1: Recent Meeting Intelligence** (model: haiku, subagent_type: Explore)
- Glob `work/notes/` to find files modified in the last 7 days only (not 14)
- Read the 8 most recent files maximum
- Extract: decisions made, action items assigned to Niki, blockers surfaced, commitments with deadlines
- Flag: anything with a deadline in the target week
- Return a concise bullet list grouped by initiative — no prose

**Agent 2: Strategic Context** (model: haiku, subagent_type: Explore)
- Read `GOALS.md` (active initiatives and current priorities)
- Read the single most recent file in `work/docs/comms/weekly-plans/` if it exists (carry-over only)
- Read the single most recent file in `work/docs/comms/weekly-reviews/` if it exists
- Read `docs/priorities/` if any files exist
- Skip `work/site/strategy/` unless nothing useful found in the above
- Return: active initiatives with phase + next milestone, carry-over items, top 2-3 strategic urgencies

**Agent 3: Repo Activity Scan** (model: haiku, subagent_type: Explore) — ONLY if `/weekly-plan deep`
- For each repo in `work/repos/`, run `git log --oneline --since="1 week ago"` (not 2 weeks)
- Return: velocity per repo (high/medium/stalled), anything needing PM attention — nothing else

---

### Phase 2: Synthesize & Prioritize

With all data gathered, apply this framework:

**Step 1: List every active initiative with its current status**

For each initiative, determine:
- Current phase (planning / building / testing / launching / monitoring)
- Next milestone and date
- Blockers (if any)
- Dollar impact or strategic importance
- Who else is driving it (can it run without Niki this week?)

**Step 2: Apply the leverage filter**

For each initiative, ask:
1. **What happens if Niki does nothing on this for a week?** If the answer is "it still moves forward" then it's not a priority. If the answer is "it stalls or fails" then it is.
2. **What's the dollar/user/strategic impact?** Rank by magnitude.
3. **Is there a hard deadline this week?** Deadlines override impact ranking.
4. **Is this reactive or proactive?** At least one priority must be proactive (strategic, not firefighting).

**Step 3: Select Top 3 (or Top 2 if meeting-heavy week)**

Rules:
- If meeting load > 20 hours: limit to 2 priorities
- Each priority gets concrete tasks, not vague goals
- Every priority has a "success looks like" that's measurable
- Include one "strategic bet" when possible (something nobody asked for but would be high-impact)

**Step 3.5: Ambition calibration — is this plan realistic?**

This is where most weekly plans fail. PMs routinely over-plan because they confuse "important" with "doable this week."

Rules for calibrating ambition:

1. **Calculate actual deep work hours first.** Take total working hours (40), subtract meeting hours from calendar, subtract 20% for reactive overhead (Slack, email, ad-hoc requests that always happen). What's left is your real budget. Don't plan more work than that budget allows.

2. **Under-planning beats over-planning.** A plan you hit 100% is worth more than a plan you hit 60%. Consistently over-planning destroys trust in your own planning. If the last two weekly reviews showed >30% carry-over, the plans are too ambitious — cut one priority.

3. **A priority that carries over 2 weeks in a row is not a priority.** It's either blocked (needs an explicit unblock action), deprioritized (remove it), or too large (break it into a sub-task that can actually land this week).

4. **At least one priority must be completable in a single deep work block.** If every priority requires 3+ days, you'll feel zero momentum by Wednesday. Include one thing you can finish start-to-finish in 2-3 hours.

5. **Warning signs the plan is too aggressive:** More than 5 concrete tasks across all priorities. Any priority whose "success looks like" statement requires another team to ship something. Any priority that depends on a decision that hasn't been made yet.

**Step 3.6: Sequence the week — don't treat all days as equal**

Monday and Tuesday are highest-leverage days for PM work. Key stakeholders are freshest, engineering has the most runway, and decisions made early compound through the week. Sequence accordingly:

- **Monday:** Alignment work — conversations, decisions, unblocking others. Don't hide at your desk writing. The leverage is in getting people pointed in the right direction at the start of the week.
- **Tuesday/Wednesday:** Deep work on highest-cognitive priorities. Protect these days from unnecessary syncs.
- **Thursday:** Reviews, prep for next week's decisions, async communication catch-up.
- **Friday:** Retrospective, status updates, close open loops. Don't start new heavy initiatives on Friday — you won't finish and it creates cognitive carry-over into the weekend.

When generating the plan, note which priority is best tackled on which day and why.

**Step 4: Identify what to explicitly NOT do**

This is as important as the priorities. List 2-3 things that feel urgent but should be delegated, deferred, or dropped. Name the person who should own each.

---

### Phase 3: Generate the Plan

Create file: `work/docs/comms/weekly-plans/YYYY-WXX-weekly-plan.md`

Use this format (not a rigid template, adapt to what the data actually says):

```markdown
---
week: YYYY-WXX
date_generated: YYYY-MM-DD
meeting_hours: X
deep_work_hours: Y
---

# Weekly Priorities: Week of [Month DD, YYYY] (W[week number])

## TL;DR (One Sentence)

[The single most important sentence about what this week is about]

## This Week's Bet

[1-2 sentences: Why these priorities over everything else? What's the theory of the case?]

---

## Priority 1: [Title]

**Why now:** [Specific trigger -- deadline, blocker, $ at risk, window closing]
**Impact:** [$ amount, user count, or strategic unlock]
**Success looks like:** [Specific, measurable outcome by Friday]

Tasks:
- [ ] [Concrete action] -- [person to engage] -- [Est: X hrs]
- [ ] [Concrete action] -- [Est: X hrs]
- [ ] [Concrete action] -- [Est: X hrs]

Depends on: [Name -- what you need from them]
Blocks: [What this unblocks downstream]

---

## Priority 2: [Title]

[Same structure]

---

## Priority 3: [Title]

[Same structure, or note "Stretch goal if P1/P2 land early"]

---

## Explicitly NOT Doing This Week

| Item | Why Not | Who Owns It Instead |
|------|---------|---------------------|
| [Thing] | [Reason] | [Name] |
| [Thing] | [Reason] | [Name] |

---

## Calendar Shape

**Meeting load:** X hours (Light/Medium/Heavy)
**Deep work blocks:** [List the actual open blocks by day]
**Highest-stakes meeting:** [Name] on [Day] -- [What to prep]

---

## Carry-Over & Patterns

[If previous week plan exists: what carried over and why]
[If pattern detected: "Third week in a row X has been deprioritized -- consider escalating or killing it"]

---

## Key Dates This Week

| Date | What | Stakes |
|------|------|--------|
| [Day] | [Event] | [Why it matters] |

---

## Risks

- [Risk]: [Mitigation]
- [Risk]: [Mitigation]

---

*Generated [timestamp] from: [X] meeting notes, [Y] repo commits, [Z] Linear tickets, calendar data*
```

---

### Phase 4: Post to Notion Tasks

After writing the plan file, create a task in the personal Notion Tasks database so the weekly plan isn't lost:

```bash
NOTION_TOKEN=$NOTION_PERSONAL_TOKEN  # set in your environment
WEEK_LABEL="Week of [Month DD, YYYY] (W[week number])"  # e.g. "Week of March 23, 2026 (W13)"

curl -s -X POST "https://api.notion.com/v1/pages" \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d "{
    \"parent\": {\"database_id\": \"2a82f4d2-943e-8112-9a73-f743c0fcf750\"},
    \"properties\": {
      \"Task name\": {\"title\": [{\"text\": {\"content\": \"⭐ Weekly Plan — $WEEK_LABEL\"}}]},
      \"Status\": {\"status\": {\"name\": \"📥 Triage\"}},
      \"Tags\": {\"multi_select\": [{\"name\": \"work\"}]},
      \"Assignee\": {\"people\": [{\"object\": \"user\", \"id\": \"d2981481-6c75-456b-ab4a-5dcfd8db938b\"}]}
    }
  }"
```

If the curl succeeds (returns a Notion URL), tell the user the task was created and show the URL.

---

### Phase 5: Present & Iterate

1. Display the plan to the user
2. Ask: "Does this match your gut? Anything feel wrong or missing?"
3. If user adjusts priorities, update the file
4. Offer: "Want me to create Linear tickets for the tasks?" (use `linear create <TEAM-KEY> <title>`)
5. Offer: "Want me to draft a Slack message sharing your priorities with Derek/Elizabeth/Karina?"

---

## MCP Usage

**Google Calendar** (`gcal_list_events`):
- Query target week Monday-Friday
- Extract: event titles, durations, attendees
- Calculate meeting load and identify open blocks

**Linear** (`linear` CLI):
- `linear my-issues` — active issues assigned to Niki
- `linear my-issues --all` — include completed/cancelled
- `linear issue <ID>` — details, comments, children

**Notion** (`notion-work search`, `notion-work meetings`):
- Search for recent meeting notes if local files are sparse
- Check task database for open items

**Granola** (`list_meetings`, `get_meeting_transcript`):
- Pull recent meeting transcripts for context on decisions/blockers

**If MCPs unavailable:** Fall back to file-based analysis (meeting notes in outputs/, git logs, memory). The plan will still be good, just less precise on calendar capacity.

---

## Quality Checks

Before presenting, verify:
- [ ] Every priority has a dollar amount, user count, or strategic reason attached (not just "it's important")
- [ ] Tasks are concrete actions with names attached, not vague goals
- [ ] "Not doing" list exists and has real items (not padding)
- [ ] Meeting load calculation is realistic (checked calendar, not guessed)
- [ ] At least one priority is proactive/strategic, not just firefighting
- [ ] Carry-over from last week is acknowledged (not silently dropped)
- [ ] The plan is achievable given the meeting load (don't plan 30 hours of work in a 15-hour deep work week)
