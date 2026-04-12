---
name: mistake-memory
description: "ALWAYS invoke immediately — without being asked — whenever Niki says 'no', 'wrong', 'don't do that', 'stop', 'that's not right', 'not like that', 'I said', 'I've told you', expresses frustration, or corrects any approach/format/tool choice/behavior. Do NOT wait to be asked. Do NOT finish the current task first. Invoke this skill the moment a correction happens, capture it, confirm in one line, then continue. Also triggers on: 'remember this', 'add to memory', 'save this mistake', 'don't forget'."
user-invocable: true
---

# Mistake Memory

When you make a mistake and Niki corrects you, capture it immediately. The goal: never repeat the same mistake twice.

## When to Use

**Invoke proactively** when:
- Niki says "no", "wrong", "don't do that", "stop", "that's not right", "I've said this before"
- Niki corrects your approach, format, tone, or tool choice
- A pushback feels like a pattern (something you've probably done before)
- Niki explicitly says "remember this" or "add to memory"

Don't wait to be asked. If you got corrected on something non-trivial, offer to capture it.

---

## Step 1: Identify the Mistake

Review the exchange and extract:
- **What you did** — the specific action, output, or behavior
- **What Niki wanted instead** — the correction she provided
- **Why this matters** — the reason (if stated) or your inference

If the mistake is unclear, ask one targeted question:
```
Got it. Want me to save this to memory so I don't repeat it?
I'd capture it as: [one-line summary of the rule]
Does that capture it right?
```

---

## Step 2: Write the Feedback Memory

Create a new file in `/Users/nikibirkner/.claude/projects/-Users-nikibirkner-Code-Niklaude/memory/` named `feedback_[short_slug].md`.

Use this format:
```markdown
---
name: [short descriptive name]
description: [one-line description of what this corrects — used to surface in future sessions]
type: feedback
---

[The rule itself — stated positively where possible. 1-2 sentences.]

**Why:** [The reason Niki gave, or your inference from the correction.]

**How to apply:** [When this kicks in — specific triggers, contexts, or file types where this rule matters.]
```

### Example:
```markdown
---
name: No inline questions — use AskUserQuestion tool
description: Always use AskUserQuestion tool for questions, never ask inline as text
type: feedback
---

Always use the AskUserQuestion tool when asking questions. Never ask questions as inline text in a response.

**Why:** Inline questions get buried in text and create friction. The tool generates a proper UI that's easier to respond to.

**How to apply:** Any time you need to ask Niki something — clarifying questions, choices, confirmations. Even a single question. No exceptions.
```

---

## Step 3: Update MEMORY.md

Add a one-line entry to `/Users/nikibirkner/.claude/projects/-Users-nikibirkner-Code-Niklaude/memory/MEMORY.md` under the relevant section (or create a new section if needed):

```
- [Name](feedback_[slug].md) — [one-line hook: what this prevents]
```

Keep under 150 chars. The hook should make it obvious when this memory is relevant.

---

## Step 4: Confirm

Say:
```
Saved. I've added "[rule summary]" to memory — won't repeat that.
```

One line. No lengthy explanation. Get back to the work.

---

## Batch Mode

If Niki has multiple past mistakes to capture at once:
```
/mistake-memory [describe the mistake or paste the exchange]
```

For each one: identify the rule, write the file, update MEMORY.md.

Niki can also say "I have some examples" — ask her to share them one at a time or all at once, then process them in batch.

---

## What Makes a Good Feedback Memory

- **Specific** — "Don't summarize at the end" beats "Be more concise"
- **Actionable** — leads with the rule, includes when it applies
- **Non-judgmental** — captures what to do differently, not what went wrong
- **Positive** — state rules as "do X" not "don't do Y" where possible

Avoid saving:
- One-off mistakes that won't recur
- Mistakes caused by missing context (not a behavior pattern)
- Things already in CLAUDE.md or other memory files
