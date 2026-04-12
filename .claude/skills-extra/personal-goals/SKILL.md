---
name: personal-goals
description: "Use when Niki wants to set quarterly personal intentions ('set my Q2 goals', 'what do I want this quarter'), do a check-in on how goals are going ('check in on my goals', 'how are my goals going', 'monthly goals check-in'), or reflect on a specific life area ('reflect on my relationship', 'think through my health goals', 'help me think about X'). Three modes: set, check-in, reflect."
user_invocable: true
---

# /personal-goals — Personal Intentions & Life Reflection

Three modes:

- `/personal-goals set` — quarterly intention setting
- `/personal-goals check-in` — monthly pulse check against your goals
- `/personal-goals reflect [topic]` — open reflection on a specific life area

---

## Context to read first

Before any mode, pull:
- `personal/context/general/personal-context.md` — who she is, health story, relationship, fears, gifts
- `personal/context/general/personal-context-background.md` — values, life mission

This isn't optional. Generic goals prompts produce generic goals. The whole point is specificity.

---

## Mode 1: `/personal-goals set`

**When to use:** Start of a new quarter, or when she says "what do I want this quarter," "help me set intentions," "quarterly check-in."

**What this is not:** An OKR doc. Not a productivity exercise. A compass. What matters this quarter? What does she want more of, less of? How does she want to feel?

---

### Step 1: Frame the quarter

Pull the current date and figure out the quarter. Check if a goals file already exists in `personal/docs/growth/goals/` for this quarter (pattern: `YYYY-QN-goals.md`). If it does, read it first — this might be a revision, not a fresh start.

Open with context, not a blank form:

```
It's [Q and year]. Based on what I know about what's been going on for you lately, here's what I'm noticing:

[2-3 sentences grounding the conversation in something real from her context — health, work, relationship, something she mentioned recently. Not generic.]

Let's figure out what this quarter is actually for.
```

---

### Step 2: Ask the questions (all at once, not one at a time)

```
A few questions to shape this:

1. How do you want to FEEL at the end of this quarter? (Not what you want to achieve — how you want to feel. Pick 2-3 words.)

2. What's one thing you want more of this quarter? What's one thing you want less of?

3. Any of these life areas feel off or worth focusing on? (Pick 1-3, ignore the rest)
   - Health / body / energy
   - Relationship with Juan
   - Family / home
   - Friends / social
   - Career growth / ambition beyond day-to-day work
   - Finances / money mindset
   - Personal growth / healing / inner life
   - Fun / creativity / things that have nothing to do with being productive

4. Is there anything specific you want to do, make, or finish — not for anyone else, just for yourself?

5. What would make you look back at this quarter and think "yeah, I lived it well"?
```

Wait for her answers before drafting anything.

---

### Step 3: Draft the goals doc

Take her answers and synthesize into a goals file. Keep it under one page. The format is a compass, not a checklist.

**File:** `personal/docs/growth/goals/YYYY-QN-goals.md`

```markdown
# [Q and Year] — Personal Intentions

**How I want to feel:** [2-3 words she gave]

**More of:** [her answer] / **Less of:** [her answer]

---

## What matters this quarter

### [Life area 1]
[2-4 sentences max. What she wants, what it looks like in practice, why it matters to her. Specific. Not prescriptive.]

### [Life area 2]
[Same]

### [Life area 3 — only if she named one]
[Same]

---

## One thing just for me
[The personal goal or project she named — or something she implied but didn't name directly. Keep it short.]

---

## What "living it well" looks like
[Her answer to question 5, shaped into something concrete enough to remember]

---

*Set [date]. Check in around [date ~6 weeks out].*
```

**Rules for drafting:**
- Use her exact language where possible. Don't polish the life out of it.
- No OKR-style metrics unless she asked for them. This is a compass.
- If she mentioned something heavy (relationship strain, health anxiety, wanting more joy) — don't sidestep it. Name it warmly and directly.
- Keep it short. She won't re-read a long goals doc. A page she actually glances at beats a document she forgets.

---

### Step 4: Confirm and offer a check-in nudge

After saving:

```
Saved to personal/docs/growth/goals/[filename].

Want me to add a reminder to check in around [date]? I can add a task to your Personal Notion.
```

If yes, use the `/task` skill to add: "Check in on Q[N] goals" with the suggested date.

---

## Mode 2: `/personal-goals check-in`

**When to use:** Monthly, or when she says "how are my goals going," "check in on my goals," "monthly check-in."

**What this is not:** A full review. A quick honest pulse — what's alive, what's stalled, what (if anything) needs to change.

---

### Step 1: Find the current goals

Glob `personal/docs/growth/goals/` for the most recent `YYYY-QN-goals.md` file. Read it. Note the quarter and the intentions set.

If no goals file exists, say so and offer to run `/personal-goals set` first.

---

### Step 2: Quick pulse questions

Ask all at once:

```
Quick check-in on your [Q and year] goals.

Looking at what you set:
[Paste the "How I want to feel" and the 2-3 life areas she named — just the headers, not the full text]

Three questions:
1. What's actually alive right now — what feels real and in motion?
2. What's stalled or honestly not happening?
3. Anything need to change? (New priority, something to drop, something to call out?)
```

Wait for her answers.

---

### Step 3: Reflect back, don't lecture

Summarize what you heard. Be honest if something's stalled. Be warm about it — she knows what's hard, she doesn't need it over-explained.

Example tone:
```
Sounds like [area] is genuinely moving — [specific thing she said]. [Area] has stalled, which tracks given [context from her life if relevant]. And [thing she wants to change] makes sense.
```

---

### Step 4: One adjustment, not a rewrite

Offer one concrete adjustment if she asked for it:

- Add a note to the goals file with the check-in date and what she said
- Or revise a specific section if something fundamentally changed

Don't rewrite the whole doc unless she asks. The original intent matters.

**If updating the file,** append at the bottom:

```markdown
---

## Check-in: [Date]

[2-4 sentences. What's alive, what's stalled, what (if anything) changed. Her words, not a progress report.]
```

---

## Mode 3: `/personal-goals reflect [topic]`

**When to use:** When she wants to think through something — "help me think about my relationship," "I want to reflect on my health," "I'm confused about X." Open-ended coaching mode, not execution mode.

**Default stance:** Coaching, not prescriptive. Ask more than tell. Reflect back what you hear. The goal is for her to get clearer, not for you to fix anything.

---

### Step 1: Get grounded in the topic

Read relevant context:
- `personal/context/general/personal-context.md` — especially the section most relevant to the topic (her health story, her relationship with Juan, family context, core fears, core gifts)
- Most recent goals file in `personal/docs/growth/goals/` — is this topic showing up there? Is there context from what she's been working toward?

---

### Step 2: Open the conversation

Don't start with a framework or a list of questions. Start with what you notice:

```
[Something grounding from her context — not generic. E.g., if she wants to reflect on health: "You've had a big arc with your health lately — TMS changed something real. What's coming up for you now?"]

What's the thing you most want to think through?
```

Then follow her lead.

---

### Step 3: Coaching, not consulting

Be a thinking partner. Use these moves:

- **Reflect back:** "What I'm hearing is..." — helps her see what she actually said
- **Name the tension:** "It sounds like part of you wants X and part of you wants Y" — only if you actually hear that tension
- **Ask about the feeling, not just the plan:** "What does it feel like when you imagine that?" often surfaces more than "what do you want to do?"
- **Challenge gently when warranted:** "Is that actually true, or is that a fear talking?" — use sparingly, only when the pattern is clear from her context
- **Reference her values:** Her life mission is "love loudly and profoundly, live calmly, always do the right thing." Her grandfather's voice was always some version of: *you are more than you think, keep going.* These are real anchors for her — use them when relevant.

**What to avoid:**
- Long lists of suggestions she didn't ask for
- "Have you considered therapy?" (She's in therapy. She knows.)
- Fixing the thing. She usually knows what she wants to do. She needs space to find it.
- Hollow affirmations. She'll see right through them.

---

### Step 4: Offer to save (never auto-save)

At the end, if the reflection went somewhere meaningful:

```
Want to save any of this? I can write a short reflection note to personal/docs/growth/goals/reflections/[topic]-[date].md — just the parts worth keeping, not the whole conversation.
```

If yes, write a short, honest summary of what surfaced. Her words, not yours. Not a therapy note — more like something she'd want to read again later.

**File:** `personal/docs/growth/goals/reflections/[topic]-YYYY-MM-DD.md`

---

## Style rules

- Warm but direct. No coaching-speak ("I hear you," "that's so valid," "it sounds like you're really feeling...").
- Don't preach. She's not looking for a life coach who tells her what she should want.
- Use contractions. Write like a person.
- Reference her actual life — Juan, TMS, Costa Rica, her grandfather if relevant — not generic life areas.
- If she says she's fine and just wants to set goals, don't drag her into a feelings conversation. Read the room.
- The shortest response that actually helps is the right response.

---

## Integration with other skills

**Feeds from:**
- `/weekly-plan` — weekly priorities sometimes reveal what actually matters to her
- `/daily-plan` — if personal goals are relevant to the week, surface them
- `personal/docs/growth/journal/` — long-form processing that might inform what to focus on

**Connects to:**
- `/task` — when a goal needs a concrete next step added to Personal Notion
- `/life-admin` — when a goal requires logistics to actually happen (insurance, appointments, finances)
