---
name: standup
description: "Use when Niki needs to write or prepare a daily standup update. Aggregates Linear tickets, Todoist tasks, calendar, and recent activity into a standup-format brief. Trigger phrases: 'standup', 'daily standup', 'what did I do yesterday', 'write my standup', 'standup update', 'scrum update', 'what should I say in standup'."
user-invocable: true
---

# Standup

One command. Pull together yesterday's progress, today's plan, and blockers — without tab switching.

## Quick Start

```
/standup              → Full standup brief (default: yesterday + today + blockers)
/standup async        → Formatted for posting to Slack/Notion
/standup short        → TL;DR version only (2-3 sentences)
```

---

## Data Sources

Pull from ALL of these in parallel:

### 1. Linear (work — primary source of truth)
Use `mcp__claude_ai_Linear__list_issues` to fetch:
- Issues updated or closed in the last 24-48 hours (yesterday's work)
- Issues assigned to Niki that are In Progress or Todo (today's plan)
- Issues marked as Blocked

Filter to Niki's issues only. Skip backlog items not actively worked.

### 2. Todoist (work + personal tasks)
Run `todoist list` via Bash to fetch tasks. Separate into:
- **Work tasks** (project: Work) — tasks completed recently or due today
- **Personal tasks** (project: Personal) — tasks completed recently or due today

Use this to surface non-Linear work (writing, reviews, admin, personal errands) that won't show in Linear.

### 3. Google Calendar
Use `mcp__claude_ai_Google_Calendar__gcal_list_events` to fetch:
- Yesterday's meetings (for context on what was discussed/decided)
- Today's meetings (for "heads up" section)

Calendar events inform both work and personal sections as appropriate.

### 4. Goals context
Read `personal/context/general/goals.md` for current initiative priorities. Use to flag whether yesterday's work advanced the right things.

### 5. Birthdays (personal — upcoming)
Read `personal/context/general/birthdays.md`. Check for any birthdays in the next 7 days. If any exist, surface them in the Personal section under a **Upcoming birthdays** line. Use today's date to calculate.

### 6. GitHub (optional, if relevant)
```bash
gh log --author="$(git config user.email)" --since="yesterday" --format="%s"
```
Only include if there were actual commits. Skip if Niki didn't push code.

---

## Output Format

Separate work and personal into two sections. Keep each section tight.

### Standard standup:

```
## Standup — [Day], [Month DD]

### Work

**Yesterday**
- [Initiative/ticket]: [what moved forward — 1 line]
- [Meeting]: [decision or outcome — 1 line]

**Today**
- [Top priority]: [what I'm working on]
- [Meeting at HH:MM]: [purpose]
- [Secondary focus]: [initiative or ticket]

**Blockers**
- [Blocker if any — or "None"]

---

### Personal

**Yesterday**
- [Task or event — 1 line]

**Today**
- [Task or appointment — 1 line]

**Upcoming birthdays** *(next 7 days)*
- [Name: Month DD — or omit section if none]

**Blockers**
- [Blocker if any — or "None"]
```

### Async / Slack format (work section only — don't share personal):

```
:calendar: *Standup — [Day]*

*Yesterday:* [2-3 bullets]
*Today:* [2-3 bullets]
*Blockers:* [one line or "None"]
```

### Short format:

```
Work — Yesterday: [X]. Today: [Y]. Blockers: [Z or none].
Personal — Yesterday: [X]. Today: [Y].
```

---

## Enrichment Rules

- **Translate ticket IDs to plain language.** "ENG-123 merged" → "Auth API rate limiting shipped"
- **Surface decisions, not just activity.** "Had sync with Charles" → "Synced with Charles — confirmed ECP D-002 (SKU-level discounts only)"
- **Flag misalignment.** If yesterday's work doesn't connect to Q2 priorities in personal/context/general/goals.md, note it briefly.
- **Keep it honest.** If yesterday was mostly meetings and reviews with no output, say so.
- **Async format = work only.** Never include personal tasks in Slack-formatted output.

---

## Save Output

After generating the standup, write it to:
```
shared/docs/standups/YYYY-MM-DD-standup.md
```

Use today's date in the filename (e.g., `2026-04-06-standup.md`). Create the `shared/docs/standups/` directory if it doesn't exist.

The file should contain the full standard standup output (both work and personal sections).

---

## Fallback (no MCPs)

If Linear or Calendar MCP is unavailable:
```
I don't have Linear/Calendar access. Tell me:
1. What Linear tickets did you move yesterday?
2. Any meetings with notable outcomes?
3. What's on your plate today?
4. Any personal tasks completed or due?

I'll format it from there.
```

---

## Integration

- Run after `/morning` if you want the full picture (email + news + standup)
- Run before a team standup meeting to prep your update
- Use `/slack-message` after to draft the Slack post if needed (work section only)
