---
name: news
description: "Use when Niki wants a morning news digest, wants to catch up on AI/tech news, or asks 'what's happening in AI', 'any news today', 'AI news digest', 'what did I miss'. Fetches from top AI newsletters and web search — no subscriptions needed. For the full morning workflow, use /morning instead."
disable-model-invocation: false
user-invocable: true
---

## Quick Start

**What to provide:** Nothing required. Just run it.

```
/news              → AI/tech digest from last 24h (default)
/news 48h          → Last 48 hours
/news week         → Last 7 days
```

**What you get:** 5-8 bullets covering what matters for Together AI, plus broader industry moves worth knowing. Sources are public newsletters and web search — no email subscriptions needed.

**Target time:** Under 90 seconds.

---

## Purpose

Pull the signal from the noise. You don't need to read 8 digests — you need the 3-5 things that actually matter for your work and market.

---

## Step 1: Web Search for Recent AI News

Run these searches using the WebSearch tool. Run them in parallel if possible.

```
AI infrastructure news today [current date]
LLM model releases announcements [current date]
GPU market AI chip news [current date]
OpenAI Anthropic Google Together AI news [current date]
AI funding acquisitions [current date]
```

For 48h range: add "last 2 days" to queries.
For weekly range: add "this week" to queries.

---

## Step 2: Fetch Top AI Newsletters

Use WebFetch on these public pages to pull the latest content. No subscription needed — all have free public posts.

**Tier 1 — fetch these every run (highest signal for AI/infra):**
- `https://tldr.tech/ai` — TLDR AI daily digest (top of page = latest issue)
- `https://importai.substack.com/` — Import AI by Jack Clark (OpenAI cofounder, deep technical signal)
- `https://www.interconnects.ai/` — Interconnects by Nathan Lambert (RLHF/alignment, infra-adjacent)

**Tier 2 — fetch if time allows or for 48h+ ranges:**
- `https://www.theneuronnewsletter.com/` — The Neuron (broader AI daily)
- `https://bensbites.com/` — Ben's Bites (product/startup angle)
- `https://magazine.sebastianraschka.com/` — Ahead of AI (research-heavy)
- `https://oneusefulthing.substack.com/` — One Useful Thing by Ethan Mollick (practical AI use)

For each page, use WebFetch with prompt: "Extract the headlines, key stories, and brief summaries from the most recent newsletter issue or posts. Focus on: model releases, AI infrastructure, GPU market, competitor moves, research breakthroughs, funding/acquisitions."

**Note:** Some newsletter pages show archives — grab only the most recent post(s). If a page is paywalled, extract whatever is publicly visible (headlines, preview text).

---

## Step 2b: Gmail Supplement (bonus, not required)

If Gmail MCP is available, run a quick search to catch anything not in the newsletters above:

```
subject:(AI OR LLM OR "machine learning") newer_than:1d
```

Add any non-duplicate stories to the pool. Skip this step entirely if no Gmail MCP is connected.

---

## Step 3: Extract and Deduplicate

From all sources combined, extract stories matching these signals:

**High priority (Together AI relevant):**
- Model releases or updates (any major lab)
- GPU market news (pricing, supply, new chips — relevant to Substrate)
- AI infrastructure announcements (cloud providers, hyperscalers)
- Competitor moves: OpenAI, Anthropic, Google DeepMind, Mistral, Cohere, Groq, AWS Bedrock, Azure AI, Fireworks, Modal, Replicate, Cerebras
- Major funding rounds or acquisitions in AI infra
- Regulatory or policy developments affecting AI companies
- Research breakthroughs with near-term product implications

**Lower priority (industry, worth a line):**
- Consumer AI product launches
- General ML research
- Big tech platform changes
- Interesting but peripheral news

**Skip entirely:**
- Consumer app reviews
- Opinion without new information
- Stories you've already surfaced from another source (deduplicate aggressively)

---

## Step 3: Classify Stories

Sort stories into two buckets:

**Relevant to Together AI:**
Direct impact on Together AI's business. Examples:
- A competitor cuts inference prices
- New GPU announced that affects the market
- Major customer segment (enterprise, startups) shifts behavior
- Regulatory action that could affect Together AI
- A model release that competes with or complements Together's offerings
- Infrastructure or deployment tooling that Together competes with or integrates with

**Industry:**
Broader AI/tech that's worth knowing but less directly relevant. Examples:
- General AI research progress
- Consumer AI products
- Platform/policy changes at big tech companies
- Interesting but peripheral funding news

If something doesn't fit either bucket, skip it.

---

## Step 4: Generate Digest

Keep it tight. 5-8 bullets total across both sections. Each bullet is 1-2 lines max.

```
## AI News Digest — [Day, Month DD]

### Relevant to Together AI
- **[Headline or topic]:** [1-sentence summary]. [Why it matters for Together — one phrase.]
- **[Headline or topic]:** [1-sentence summary]. [Implication.]

### Industry
- **[Headline or topic]:** [1-sentence summary.]
- **[Headline or topic]:** [1-sentence summary.]

*Sources: [Newsletter names, comma-separated]*
```

**Bullet format rules:**
- Lead with the subject, not the source ("OpenAI cuts API prices" not "According to TLDR, OpenAI...")
- Include the "so what" for Together AI bullets — don't just report, connect it
- Skip anything you can't summarize in 1-2 lines. If it needs more context, it's either not that important or it warrants a separate deep-dive

If no newsletters found in the time range:
```
No AI/tech newsletters found in the last [X] hours. Either your newsletters haven't arrived yet, or they're not in this inbox.

Try: /news 48h
Or: Check that newsletter subscriptions are on the account I'm searching.
```

---

## Step 5: Together AI Context Check

Before finalizing the digest, quickly cross-reference against what Niki is actively working on (check `work/site/strategy/` and `MEMORY.md` for current initiatives).

If a story directly connects to an active initiative, add a note:
- "(Relevant to ECP — enterprise pricing angle)"
- "(GPU pricing affects Substrate roadmap)"
- "(Competitor offering similar to what ACH customers might switch to)"

Don't force connections. Only add context when it's actually relevant.

---

## Fallback

Web search + newsletter fetching works without any MCP connected. If WebSearch or WebFetch are unavailable:
```
I can't reach the web right now. Options:
1. Paste a newsletter or article here — I'll extract key stories
2. Try again when web access is restored
```

Gmail MCP is optional — it's only a supplemental source. The digest works fully without it.

---

## Integration with Other Skills

- `/morning` — runs the news digest as part of the full morning workflow
- `/email` — handles inbox triage separately (newsletters will show as Tier 2 or Tier 3 there)
- `/competitor-analysis` — for deep-dives when a competitor story warrants more than a bullet
- `/write-prod-strategy` — surface relevant trends when updating product strategy

---

## Tips

- The digest is a starting point, not the full picture. If something catches your eye, go read the original.
- "Relevant to Together AI" is intentionally narrow. Better to surface 2 genuinely useful items than 6 loose connections.
- If the same story appears in 5 newsletters, one bullet is enough. Credit the most detailed source.
