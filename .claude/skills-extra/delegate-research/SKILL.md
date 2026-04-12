---
name: delegate-research
description: "Use when a research task would require 5+ tool calls or consume significant context in the main session. Spins up a sub-agent to do the research independently, returning only the synthesized findings. Trigger phrases: 'spin up an agent to research', 'use a sub-agent to look up', 'research X in the background', 'delegate this research'. Also auto-consider when research will require 10+ tool calls — delegate to preserve main context."
---

# Delegate Research

Offload research to a sub-agent to save main session context. Without delegation, a research task can cost 9%+ context. With delegation, it costs ~0.5% (just the summary).

## When to Use

Delegate when the research task:
- Requires 5+ tool calls (multiple searches + multiple page scrapes)
- Is independent from what's in the current session context
- Will take significant back-and-forth to complete
- Is a supporting task (background research for a PRD, competitor analysis, etc.)

Don't delegate when:
- The research needs the current session context (e.g., "research how this specific code works")
- It's a quick single lookup (just use WebSearch directly)

---

## How to Trigger

Two ways:

**Inline (no skill needed):** Add "spin up a sub-agent" or "use a sub-agent" to any prompt.
```
"spin up a sub-agent to research Together AI's top 3 competitors' pricing pages"
```

**Via this skill:** Run `/delegate-research [topic]`

---

## Dispatch Instructions

When delegating research, use the Agent tool with a self-contained prompt that includes:

1. **The specific research question** — be precise, not vague
2. **The output format** — bullet points, table, summary
3. **Scope limits** — how many sources, how deep
4. **What NOT to include** — to keep the result concise

### Template prompt for the sub-agent:

```
You are a research agent. Your only job is to answer this question and return a concise summary.

QUESTION: [specific research question]

INSTRUCTIONS:
- Use WebSearch and WebFetch to find answers
- Scrape up to [N] pages max
- Return findings in [format: bullets / table / paragraph]
- Include source URLs for any specific facts or numbers
- Do NOT include irrelevant context, preamble, or caveats
- Keep total response under [N] words

Do the research now and return the synthesized findings.
```

### Example:
```
You are a research agent. Your only job is to answer this question and return a concise summary.

QUESTION: What are the current prices and rate limits for OpenAI's API tiers (Free, Pay-as-you-go, Tier 1-5)?

INSTRUCTIONS:
- Use WebSearch and WebFetch to find the OpenAI pricing page and docs
- Scrape the pricing page directly
- Return findings as a markdown table: Tier | Price | Rate Limits | Notes
- Include the URL of the pricing page
- Keep total response under 300 words

Do the research now and return the synthesized findings.
```

---

## After the Sub-agent Returns

1. Include the research summary in your response to the user
2. Note which sources were used (for credibility)
3. If something needs follow-up, do one targeted lookup inline — don't spawn another agent for a tiny task

---

## Context Savings Reference

| Approach | Main session context used |
|----------|--------------------------|
| Inline research (5 searches + 3 scrapes) | ~9-15% |
| Delegated sub-agent | ~0.5% (summary only) |

Use delegation liberally for any non-trivial research. The main session stays clean and focused.
