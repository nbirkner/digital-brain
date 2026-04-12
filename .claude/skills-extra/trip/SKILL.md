---
name: trip
description: "Use when Niki wants to add a new trip to the travel page, log a trip she's planning, get help planning/researching a trip, or update a trip's status. Triggers on: 'add a trip', 'I'm going to X', 'help me plan X', 'plan a trip to X', '/trip', 'add this to my travel page', 'log a trip', 'mark X as done', 'update trip status', 'I booked X', 'X is canceled'."
user-invocable: true
---

## Quick Start

```
/trip add                  → Add a new trip entry to personal/site/travel/trips/
/trip plan                 → Research + build an itinerary for a trip
/trip add + plan           → Both: add the entry AND build an itinerary
/trip status               → Update the status of an existing trip
```

Or just describe what you want:
- "I'm going to Tokyo in October" → prompts for details, then adds + asks if you want planning help
- "Help me plan Costa Rica" → jumps straight to planning mode
- "Add Nashville bachelorette, June 18–21, tickets purchased" → adds it
- "Mark Argentina as Done" → updates status directly, no prompts needed
- "I booked Tinsley Island" → infers status → "Tickets purchased", confirms + updates

---

## Mode 1: Add a Trip

### Step 1: Gather info

Ask for anything missing (can be one message):

| Field | Required | Notes |
|-------|----------|-------|
| Destination/name | Yes | e.g. "Tokyo solo trip", "Austin work trip" |
| Dates | Yes | Start and end |
| Status | Yes | Tickets purchased / Reservations pending / Undecided / Done / Canceled |
| With who | No | If with Juan, note it |
| Notes | No | Hotel, airline, context |

If the user gave everything inline (e.g. "Tokyo, Oct 5–12, tickets purchased"), skip asking.

### Step 2: Create the file

**Slug**: kebab-case destination name, e.g. `tokyo-solo-trip`, `austin-work-trip`

**File path**: `personal/site/travel/trips/<slug>.md`

**Frontmatter template:**
```yaml
---
title: "<Title>"
status: "<status>"
date_start: "<YYYY-MM-DD>"
date_end: "<YYYY-MM-DD>"
date_human: "<human readable range>"
---
```

**date_human format:**
- Same month: "May 8–11, 2026"
- Cross-month: "March 27 – April 5, 2026"
- Cross-year: "Dec 18, 2026 – Jan 3, 2027"
- Single day: "Sep 17, 2025"

**Body**: If the user gave notes (hotel, airline, context), add them as plain text. Otherwise leave body empty — no placeholder text.

### Step 3: Confirm + offer next step

Tell the user the file was created at `personal/site/travel/trips/<slug>.md`.

Then ask:
- "Want me to ship this to the site now?" (runs `/ship-it` if yes)
- "Want help planning the itinerary?" (runs planning mode if yes)

---

## Mode 2: Plan a Trip

Research and build a practical itinerary. Use web search freely.

### Step 1: Understand the trip

Ask for anything missing:
- Destination
- Dates / duration
- Who's going (solo, with Juan, group)
- Vibe (adventure, relaxed, cultural, beach, mix)
- Budget range (budget / mid-range / splurge)
- Any anchors (weddings, events, must-sees already locked in)

### Step 2: Research

Use web search to look up:
- Best neighborhoods to stay
- Top things to do (mix popular + local)
- Seasonal notes for those dates
- Getting around (car vs. transit vs. rideshare)
- Budget estimates for flights, hotels, food, activities
- Any alerts (busy season, closures, visa requirements)

### Step 3: Build the plan

Produce a day-by-day itinerary in this format:

```markdown
## [Destination] — [Dates]

[1-2 sentence trip overview: vibe, occasion if any]

### Day-by-day

**Day 1 | [Day, Date] — [Theme]**
- Morning: ...
- Afternoon: ...
- Evening: ...
- Sleep: [hotel area or specific]

[repeat for each day]

---

### Where to Stay

[2-3 neighborhood options with tradeoffs + 2-3 specific hotel picks per budget tier]

---

### Getting Around

[practical transport notes]

---

### Budget Estimate

| Category | Est. (per person or for 2) |
|----------|---------------------------|
| Flights | |
| Hotel (X nights) | |
| Food (daily avg) | |
| Activities | |
| Transport | |
| **Total** | |

---

### Notes + Tips

[seasonal tips, what to book in advance, local quirks, packing notes]
```

### Step 4: Offer to save

After delivering the plan, ask:
- "Want me to save this to your trip file at `personal/site/travel/trips/<slug>.md`?"
- If the trip isn't added yet, offer to add it too.

---

## Mode 3: Update Trip Status

Use when Niki says something like "mark Argentina as Done", "I booked Tinsley Island", "Calgary trip got canceled", "update Amalfi to reservations pending".

### Step 1: Identify the trip

Match the trip name to a file in `personal/site/travel/trips/`. If ambiguous (e.g. "the Costa Rica trip"), list the matching options and ask which one.

### Step 2: Infer status if not stated

| What Niki says | Status to set |
|----------------|---------------|
| "I booked it", "got tickets", "flights are booked" | `Tickets purchased` |
| "made a reservation", "hotel is booked" | `Reservations pending` |
| "we went", "just got back", "it's done" | `Done` |
| "canceled", "not going anymore", "fell through" | `Canceled` |
| "still deciding", "not sure yet" | `Undecided` |

If the status isn't obvious from context, ask: "What status — Tickets purchased, Reservations pending, Undecided, Done, or Canceled?"

### Step 3: Update the file

Edit the `status` field in the frontmatter of `personal/site/travel/trips/<slug>.md`. Don't touch anything else.

### Step 4: Confirm + offer to ship

Tell Niki: "Updated [Trip Name] → [New Status]."

Then ask: "Want me to ship this to the site?"

---

## Skill Notes

- Trip files live at `personal/site/travel/trips/` — never anywhere else
- Valid statuses: `Tickets purchased`, `Reservations pending`, `Undecided`, `Done`, `Canceled`
- After creating/editing any trip file, always offer to ship (push → auto-deploys via Vercel)
- The travel page URL is [nikilaude.vercel.app/life/travel](https://nikilaude.vercel.app/life/travel)
- Past trips (Done/Canceled) appear in a separate faded section — still worth logging
