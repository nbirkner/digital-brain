---
name: life-admin
description: "Use when Niki needs to deal with life logistics that are piling up or causing background anxiety. Three modes: triage (clear the backlog — 'I have a bunch of life admin to deal with', 'help me get through my life admin list'), automate (set up a recurring thing — 'help me automate X', 'I keep forgetting to do X'), track (track a one-time task to completion — 'track my insurance dispute', 'I need to deal with X')."
user_invocable: true
---

# /life-admin — Life Logistics, Without the Friction

Three modes:

- `/life-admin triage` — clear the backlog
- `/life-admin automate [thing]` — set up automation for a recurring task
- `/life-admin track [thing]` — track a one-time task to completion

Life admin is already annoying. This skill's job is to make it less so. Be concrete, fast, and useful. If something can be done right now in 2 minutes — draft the email, find the number, pull up the form — just do it.

---

## Context to check

Before any mode, scan quickly:
- `personal/context/general/personal-context-background.md` — financial context (Monarch Money, current financial state), relationship/household setup (she and Juan share a SF apartment)
- Any recent files in `personal/notes/` with `life-admin-` prefix — what's already been tracked or handled

Don't over-read. Just make sure you're not duplicating work that already has a task.

---

## Mode 1: `/life-admin triage`

**When to use:** When stuff has piled up and she needs to see it all at once and get it moving. "I have a bunch of life admin," "help me get organized," "what do I need to deal with."

---

### Step 1: Get the dump

Ask for the full list:

```
What's piling up? Dump everything — insurance, subscriptions, appointments, documents, home stuff, financial loose ends, anything you've been avoiding. Just list them, don't explain yet.
```

If she gives a partial list, ask: "Anything else you've been avoiding?"

---

### Step 2: Triage by urgency + effort

Once you have the list, sort it:

**Tier 1 — Do this week (deadline or real cost to delaying)**
**Tier 2 — Do this month (no deadline but the anxiety tax is real)**
**Tier 3 — Kill or automate (things that keep reappearing that should be set-and-forget)**

For each item, include:
- The actual next step (not "figure out insurance" — "call Blue Shield at 1-800-XXX and ask about claim #XXXXX")
- Estimated time (be honest: "10 min," "30 min," "probably 2 hours")
- Whether it can be automated, delegated to Juan, or just killed

**For financial items:** Check if Monarch Money data is relevant (connected MCP — use `mcp__monarch-money__get_accounts` or `mcp__monarch-money__get_transactions` if helpful for context like spotting an unexpected charge or expired subscription). If MCP unavailable, ask her to share the relevant numbers.

---

### Step 3: Offer to act immediately

For anything in Tier 1 that can move right now:
- Draft the email
- Find the phone number / web address
- Pull up the form
- Write the script for the phone call

Don't ask permission to do this. She came here to get it done, not to get a list.

```
Here's what I can take off your plate right now:

[Thing 1] — [what I can do: draft the email / find the number / fill out the form]
[Thing 2] — [same]

Want me to start with [highest urgency]?
```

---

### Step 4: Save the list

Save to: `personal/notes/life-admin-YYYY-MM.md`

```markdown
# Life Admin — [Month Year]

*Last updated: [date]*

## Tier 1 — This week
- [ ] [Item] — [Next action] — [Est. time] — [Deadline if any]
- [ ] [Item] — [Next action] — [Est. time]

## Tier 2 — This month
- [ ] [Item] — [Next action] — [Est. time]
- [ ] [Item] — [Next action] — [Est. time]

## Tier 3 — Kill or automate
- [ ] [Item] — [What to do with it]

---

*Triaged [date]*
```

After saving, tell her the file location. If anything moved from triage to "tracked," note it connects to `/life-admin track`.

---

## Mode 2: `/life-admin automate [thing]`

**When to use:** "I keep forgetting to pay X," "help me set up auto-pay for Y," "I want to stop thinking about Z," "help me automate X."

---

### Step 1: Diagnose the actual friction

Ask one question before suggesting anything:

```
What's the actual friction? Is it remembering to do it, the act of doing it, or tracking whether it happened?
```

- **Remembering** → calendar reminder, recurring task in Notion
- **The act** → auto-pay, subscription management, rule in email/bank
- **Tracking** → a simple log or Monarch Money category

Don't over-engineer. The simplest solution that eliminates the friction wins.

---

### Step 2: Suggest the right fix

**For financial recurring tasks (bills, subscriptions, transfers):**
- Auto-pay is almost always the answer. Find the link or phone number to set it up.
- If it's a subscription she's not sure about: check Monarch Money (`mcp__monarch-money__get_transactions`) for the charge and figure out whether to keep, cancel, or switch to auto-pay.
- For savings automation: suggest a recurring transfer rule (to which account, how much, what day).

**For appointments / renewals:**
- Create a Google Calendar recurring event with enough lead time (e.g., annual checkup: set a reminder 2 weeks before the month she typically books).
- For document renewals (passport, visa, HSA deadlines): create an event 60-90 days before expiry.
- Offer to create the event: use `mcp__claude_ai_Google_Calendar__gcal_create_event` if available.

**For remembering tasks:**
- Add a recurring task to Personal Notion via `/task` — "Pay [X] on the 1st of each month" or "Check [Y] quarterly."

**For email/Slack noise:**
- Suggest a filter or folder rule. Write out the rule so she can copy-paste it in.

---

### Step 3: Do the setup, don't just describe it

For anything that can be done in this session:
- Draft the email to cancel / set up / inquire
- Create the Google Calendar event
- Write the Notion task
- Generate the script for the phone call (with the number included)

Don't give her a tutorial on how to set up auto-pay. Do as much of it as you can, hand off only what requires her login.

---

### Step 4: Confirm and note what was done

```
Set up:
- [What was automated] — [how / where it lives]
- [What you still need to do] — [link or phone number or login they'll need]
```

If it involved a file or Notion task, note it. Don't leave loose ends.

---

## Mode 3: `/life-admin track [thing]`

**When to use:** One-time tasks that need to be tracked to completion — insurance disputes, HSA reimbursements, apartment lease renewals, visa or document renewals, deposits, refunds, anything where there are multiple steps over time and she'll need to remember where she left off.

---

### Step 1: Get the details

Ask:

```
A few quick questions:
1. What is it and what's the goal? (e.g., "dispute a charge on Blue Shield bill, claim #XXXXX, want $240 refunded")
2. What's already happened? (calls made, emails sent, reference numbers, deadlines)
3. What's the next step?
4. Any deadline?
```

---

### Step 2: Create a task log

Save to: `personal/notes/[topic]-tracker-YYYY-MM.md`

```markdown
# [Task Name] — Tracker

**Goal:** [What done looks like]
**Deadline:** [Date, or "none"]
**Status:** In progress

---

## Log

### [Date] — Started
- [What's been done so far]
- Next step: [Specific action + who to contact / what to do]

---
```

Short. Just enough to pick up where she left off.

---

### Step 3: Do the next step right now (if possible)

- Draft the email
- Find the contact number and hours
- Look up the process (e.g., "here's how HSA reimbursement works with [provider] and what form to submit")
- Write the script for the call

If it's a phone call she needs to make, give her:
- The number
- The hours they're open (PST)
- What to say in the first 30 seconds (including account/claim number fields to fill in)

---

### Step 4: Check-ins

When she mentions the thing again later, check the tracker file and surface the current status + next step. Don't make her re-explain it.

```
You have a tracker for this: personal/notes/[filename].

Last status: [what the log says]
Next step: [what needs to happen]

Want to update it now?
```

---

## Style rules for this skill

- Life admin is already annoying. Don't add friction. Be fast and concrete.
- If something can be done in 2 minutes, do it before you finish explaining it.
- No bullet-point life coaches ("here are 5 tips for managing your admin backlog"). Just do the thing.
- If a task is small and dumb, say so. "This will take 8 minutes" is more useful than treating every item like a project.
- Don't create elaborate systems. She's not going to maintain a 10-category GTD setup. A simple file she can find is better than a perfect one she never uses.
- When in doubt: next action, time estimate, done.

---

## Integration with other skills

**Feeds from:**
- `/personal-goals set` — sometimes a goal requires logistics that belong here (e.g., "I want to do annual bloodwork" → schedule the appointment)
- `/weekly-plan` (personal) — life admin items that cross a deadline threshold

**Connects to:**
- `/task` — add the next action to Personal Notion so it doesn't fall out of her head
- Monarch Money MCP — checking for unknown charges, subscription inventory, savings rate
- Google Calendar MCP — scheduling appointments, setting renewal reminders
