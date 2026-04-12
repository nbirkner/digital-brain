---
name: delegate-work
description: "Execution orchestrator. Offloads work to sub-agents to keep the main session clean and moving fast. Two modes, auto-detected from input: (1) BATCH — user gives a list of tasks, auto-identifies which are delegatable, spins up parallel agents for each; (2) SEQUENTIAL — user gives one task, dispatches an agent, returns result, asks 'what should the next agent do?' to keep a pipeline flowing. Use when: 'do all of these', 'knock these out', 'work through my list', 'spin up agents for X', 'while I'm doing X handle Y', 'can you batch these', 'let's parallelize', 'work through my backlog', 'handle these for me', or any time there are 2+ independent tasks that could run in parallel. Also use proactively when you detect a message with 3+ distinct tasks listed."
user-invocable: true
---

# Delegate Work

Offload execution to sub-agents. Saves main session context and enables parallel work.

```
/delegate-work                   → auto-detect mode from input
/delegate-work batch             → force batch mode
/delegate-work sequential        → force sequential pipeline mode
```

## Critical Rule: Always Use run_in_background

**All agents dispatched in batch mode MUST use `run_in_background: true`.**

This prevents agent results from flooding the main context window — the #1 cause of context compaction in long sessions. With background mode, results land as notifications rather than inline walls of text, and you control when to read them.

```
Agent tool call → always include: run_in_background: true
```

Exception: sequential mode where you need the result before deciding the next step. In that case, run foreground but instruct the agent to write output to a file and return a one-line summary only.

---

## Auto-Detection Rule

| Input looks like... | Mode |
|---|---|
| A list of 2+ tasks | Batch → assess each, spin up parallel agents |
| A single task or "let's work through X" | Sequential → dispatch one, ask what's next |
| Ambiguous | Ask: "Want me to batch these or work through them one at a time?" |

---

## Batch Mode

### Step 1: Assess each task

For each task, decide: **delegatable** or **inline**?

**Delegate if:**
- Clear, self-contained scope — can be fully described in a prompt
- Doesn't need interactive user input mid-execution
- Doesn't need the current session's conversation context
- Output is verifiable (a file, a task created, a result returned)

**Do inline if:**
- Needs a decision from the user partway through
- Requires understanding of the current conversation
- Too ambiguous to write a complete agent prompt without clarifying first
- Quick enough that delegation overhead isn't worth it (<2 tool calls)

### Step 2: Show the plan

Before dispatching anything, show one line per task:

```
Here's how I'll handle these:

→ [Task A] — agent (writes to work/docs/...)
→ [Task B] — agent (searches + returns summary)
→ [Task C] — inline (needs your input on X)
→ [Task D] — agent (creates Todoist task)
```

Get a quick confirm if any task routing looks wrong.

### Step 3: Dispatch in parallel

Use the Agent tool for all delegatable tasks simultaneously. Each agent prompt must be self-contained — include all context the agent needs, since it has no visibility into this session.

**Always set `run_in_background: true`** on every agent call. This keeps results from flooding the main context. You'll be notified when each agent finishes.

Write agent prompts using this structure:
```
You are an execution agent. Complete this task and return a brief summary (2-3 lines max) of what you did.
Write all detailed output to [file path] — do NOT return it inline.

TASK: [specific, actionable description]

CONTEXT: [any relevant facts from this session the agent needs]

OUTPUT: [what to produce — file path, Todoist entry, etc.]

CONSTRAINTS:
- [file routing rules if writing files]
- [any limits on scope]
- Do not ask clarifying questions. Make reasonable decisions and note them in your summary.
- Return a 2-3 line summary only. Write everything else to the output file.
```

### Step 4: Report results

After all agents complete, return one line per task with status and what was produced.

### Step 5: Sub-docs pattern (when agents create multiple related docs)

**If agents produced 2+ docs about the same topic in one session, apply the sub-docs pattern:**

1. Designate ONE doc as the main/synthesis doc (appears in docs list)
2. All other docs get these frontmatter fields:
   ```yaml
   hidden: true
   parent: work/docs/analyses/main-doc.md  # path to the main doc
   ```
3. The main doc must link to sub-docs (a "Deep Dives" or "Reference Docs" section)

**Why:** Sub-docs clutter the docs list. The site automatically renders a card grid of sub-docs at the top of the parent page, and sub-docs still appear in global search with a "↳ Parent Title" label. This is already built into the site — just add the frontmatter.

**Do this automatically** without being asked whenever multiple related docs are created in one agent dispatch session.

---

## Sequential Mode

Use when working through a backlog or checklist one agent at a time.

### Flow

1. **Dispatch first agent** — write a complete, self-contained agent prompt and send it
2. **Return the result** — summarize what the agent produced in 2-3 lines
3. **Ask:** "What should the next agent do?" (or suggest the logical next task if one is obvious)
4. **Repeat** until user says done or the list runs out

### When to suggest the next task

If the user gave a list or implied a sequence, suggest the next logical task rather than just asking open-endedly:

```
Done — [summary of what agent produced].

Next up: [suggested next task based on the list/context]. Want me to dispatch that, or something different?
```

### When NOT to suggest

If there's no obvious next task, just ask:
```
Done — [summary]. What should the next agent do?
```

---

## Context Savings Reference

| Approach | Main session context used |
|---|---|
| 5 tasks inline (research + writes + tool calls) | ~20-35% |
| 5 tasks via batch agents | ~2-3% (summaries only) |
| Sequential (per agent) | ~0.5% per agent |

---

## Notes

- Agent prompts must be fully self-contained. Agents have no access to this conversation.
- If a task needs a file from this session (e.g., a PRD draft), paste the relevant content into the agent prompt.
- For research sub-tasks within a larger execution task, agents can use WebSearch/WebFetch freely.
- Never dispatch an agent for something that needs a yes/no from the user — ask first, then dispatch.
