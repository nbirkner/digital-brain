---
name: morning
description: "Use when Niki is starting her day and wants the full morning workflow. Trigger phrases: 'morning brief', 'morning', 'start my day', 'good morning', 'run my morning', 'morning routine'. Combines email triage + AI news digest + surfaces Tier 1 priorities in one pass. For just email: use /email. For just news: use /news."
disable-model-invocation: false
user-invocable: true
---

## Quick Start

**What to provide:** Nothing required. Just run it.

```
/morning           → Full morning brief (both inboxes, last 24h, news digest)
/morning work      → Work inbox only
/morning personal  → Personal inbox only
```

**What you get:** Email triage, AI news digest, and your Tier 1 action list, in one consolidated brief.

**Target time:** 3-5 minutes total.

---

## Purpose

One command. Everything you need to start the day oriented. Email state, news that matters, and what needs your attention before anything else does.

---

## Step 0: Acknowledge and Start

Say:

```
Running your morning brief. Grabbing email + news now — takes about 3-5 min.
```

Then proceed immediately. No need to wait for confirmation.

---

## Step 1: Run Email Triage

Follow the full `/email` workflow, with these defaults:
- **Inbox:** Both (work + personal), unless user specified work or personal in the command
- **Time range:** Last 24 hours

**Multi-account MCP (preferred):**
Search both inboxes using the multi-account Gmail MCP if available:
- Work: `gmail_search_messages(account="work", query="in:inbox newer_than:1d")`
- Personal: `gmail_search_messages(account="personal", query="in:inbox newer_than:1d")`

**Claude.ai built-in Gmail MCP (fallback):**
Use `mcp__claude_ai_Gmail__gmail_search_messages`. If only one account is accessible, note it.

Read each message, load stakeholder context from `work/context/general-context/stakeholder-template.md`, and classify into Tier 1/2/3. See the `/email` skill for full classification rules.

Store results internally. Do not display yet.

---

## Step 2: Run News Digest

Follow the full `/news` workflow with last 24h default.

Search Gmail newsletters using:
```
subject:(AI OR LLM OR "machine learning" OR "language model") newer_than:1d
subject:("morning brew" OR "tldr" OR "digest" OR "newsletter" OR "weekly") newer_than:1d
from:(substack.com OR beehiiv.com OR mailchimp.com OR convertkit.com) newer_than:1d
```

Extract key stories, classify as "Relevant to Together AI" or "Industry." See the `/news` skill for full rules.

Store results internally. Do not display yet.

---

## Step 2.5: Pull Personal Tasks (P0 / Overdue Only)

Run: `notion-personal tasks`

This queries the Personal Notion Tasks DB. Parse the output and keep only:
- Tasks marked as P0
- Tasks with a due date of today or earlier (overdue)

Discard everything else — this is a quick scan, not a full review. If the command fails or returns nothing, skip this section silently.

Store results internally. Do not display yet.

---

## Step 3: Generate Morning Brief

Now output everything in one clean block.

```
## Morning Brief — [Day], [Month DD]

**Email:** [X] Tier 1 items need a reply | [Y] to read | [Z] noise
**News:** [X] stories flagged | [Y] newsletters scanned

---

### Tier 1 — Reply Needed ([X])

- **[Subject]** from [Sender] — [1-line summary]
- **[Subject]** from [Sender] — [1-line summary]

*(No Tier 1 items? Say: "Inbox is clear — nothing needs a reply.")*

---

### AI News

**Relevant to Together AI**
- **[Headline]:** [1-sentence summary]. [Why it matters.]

**Industry**
- **[Headline]:** [1-sentence summary.]

*Sources: [newsletter names]*

---

### Top Story
[The single most important development from the news digest — the one thing worth knowing before meetings today. 2-3 sentences max. Connect it to Together AI's context if relevant.]

---

### Tier 2 — Worth Reading ([X])

- **[Subject]** from [Sender] — [1-line]
- **[Subject]** from [Sender] — [1-line]

*(Keep this section short. 3-5 items max. If there are more, just say "and [N] more newsletters/updates.")*

---

### Personal — Needs Attention

- **[Task name]** — [Due: today / overdue by X days]
- **[Task name]** — [P0]

*(Only show P0 or overdue items. If none, omit this section entirely.)*

```

**Omit sections that are empty.** If Tier 2 is empty, skip it. If there's no news, skip the news section and note it. If no personal tasks are P0 or overdue, omit the personal section.

---

## Step 4: Offer Draft Replies

After displaying the brief, ask:

```
Want me to draft any of the Tier 1 replies? Just name which one.
```

If asked to draft, follow the voice rules from `/email`:
- Direct and warm
- Contractions fine
- No em dashes
- No filler openers
- Match formality to relationship
- End with a clear next step when needed

After drafting, offer to save as a Gmail draft using `gmail_create_draft` (or `mcp__claude_ai_Gmail__gmail_create_draft`).

---

## MCP Fallback

If no Gmail MCP available:
```
I don't have Gmail access right now. I can still help if you:
1. Paste any emails you want triaged
2. Paste newsletter content for a news digest

Or connect Gmail: /connect-mcps connect to gmail
```

If Gmail is partially available (only one account):
Proceed with what's accessible and note which account was scanned.

---

## Design Notes

**Why both steps run before displaying:** Better experience to show the full brief at once rather than a partial email result, then a pause, then news. Feels like one integrated report.

**Why Tier 2 appears at the bottom:** You're most likely to act on Tier 1 and the top story. Tier 2 is for when you have a spare moment. It shouldn't compete visually with the actionable items.

**Why "Top Story" is separate:** The news digest bullets are quick skims. The Top Story is the one thing worth actually understanding. If nothing rises to that level, skip it.

---

## Integration with Other Skills

- `/email` — email triage only, with more options for time range
- `/news` — news digest only
- `/daily-plan` — use after `/morning` for full day planning (morning covers communications + news; daily-plan covers calendar, tasks, and strategic priorities)
- `/meeting-notes` — after meetings, capture outcomes
- `/slack-message` — draft any Slack follow-ups surfaced by the triage

---

## Suggested Morning Routine

```
/morning          → Get oriented (email + news) — 3-5 min
/daily-plan       → Plan the day (calendar + tasks + strategy) — 2-5 min
[Start working]
```

You don't need both every day. `/morning` is for when you want inbox + news context before planning. `/daily-plan` is for when you know what's on your plate and just need the structure.
