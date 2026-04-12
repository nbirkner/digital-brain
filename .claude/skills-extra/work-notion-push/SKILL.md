---
name: work-notion-push
description: Rules for pushing content to Work Notion. Use when Niki asks to push meeting notes, docs, or any content to Work Notion. Covers routing logic, confidentiality rules, and what qualifies as a work note for auto-push.
user-invocable: false
---

# Work Notion Push Rules

## Routing (Manual Pushes)

When Niki says **"push to Notion"** (no qualifier):
→ Work Notion, **private page** (NOT the docs database)
→ Use Work Notion MCP (`mcp__notion-mcp__notion-create-pages`)

When Niki says **"push to docs"** / **"push to work docs"** / **"push to docs in Notion"**:
→ Work Notion **docs database** (`collection://1bd82894-2078-45b9-932a-98186c023d13`)
→ Use MCP first (`notion-create-pages`), not `notion-work append` (broken)

Personal Notion is being phased out. Never route to personal Notion.

## What Auto-Pushes to Work Notion

The daily-meeting-summary automation pushes to Work Notion **only** for these meeting templates:
- `01_cross_functional` — multi-person Together AI team meeting
- `03_external_vendor` — external/vendor meeting
- `04_sprint_cycle` — sprint kickoff, retro, cycle planning
- `06_technical_architecture` — architecture/technical design meeting

**Never** auto-pushed to Work Notion:
- 1:1 meetings (`02_one_on_one`) — go to personal notes only
- All-hands / briefings (`05_allhands_briefing`) — personal notes only
- Any personal meeting (therapy, spiritual, financial, logistics) — personal notes only
- Any meeting with personal email addresses in attendees
- Any meeting routed to personal-only by the 7-layer routing decision

## Confidentiality Rules (Applied at Generation Time)

Before any content reaches Work Notion, these must be stripped or omitted:

1. **No pre-meeting social content** — casual catch-up, personal life updates, anything said before the agenda starts
2. **No interpersonal dynamics or tension** — never document "X seemed frustrated" or "there's tension between X and Y"
3. **No personnel signals** — hints about performance, job security, workload struggles, or interpersonal conflict
4. **No proprietary business details** that aren't appropriate to share outside the meeting
5. **No unreleased product plans** beyond what the meeting participants already know
6. **When in doubt, leave it out** — apply this aggressively

## Notion Page Format

Work Notion pages pushed by the automation:
- **Title** = meeting name (set as Notion page title — do NOT repeat it as a heading in the body)
- **Known attendees** listed at top of body
- **Labels** = meeting type label + work area label (set as Notion page properties)
- **Frontmatter** (date, category, template, source) stays in the local `.md` file only — never rendered in Notion

## MCP vs CLI

Always try MCP first for Work Notion writes:
- MCP: `mcp__notion-mcp__notion-create-pages` (creates as Niki's account)
- CLI fallback: `notion-work` (uses `NOTION_WORK_TOKEN`)
- Never use `mcp__claude_ai_Notion__` tools — wrong workspace
