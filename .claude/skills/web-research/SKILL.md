---
name: web-research
description: "Use when doing any web research, competitive analysis, or looking up current information online. Replaces default web search with Tavily (higher-quality search) + Firecrawl (clean content extraction). Trigger phrases: 'research X', 'look up X', 'find info on X', 'what's the latest on X', 'web search', 'search for X'. PREFER this over default WebSearch when research quality matters."
---

# Web Research

Higher-quality web search using Tavily for search and Firecrawl for content scraping. Saves context compared to raw WebSearch by returning clean, relevant excerpts.

## Setup (one-time, if not already done)

**Tavily** (better search results than Google first-page):
```bash
pip install tavily-python
# or via MCP:
npx @tavily-ai/tavily-mcp
# Get API key: https://tavily.com → Dashboard → API Keys
# Add to env: export TAVILY_API_KEY=...
```

**Firecrawl** (clean markdown scraping of any page):
```bash
npm install -g firecrawl-cli
# Get API key: https://firecrawl.dev → Dashboard
# Add to env: export FIRECRAWL_API_KEY=...
```

If neither is set up, fall back to `WebSearch` + `WebFetch`. Note this in your response.

---

## Research Process

### Step 1: Search

**With Tavily MCP (preferred):**
Use `tavily_search` with `search_depth: "advanced"` and `max_results: 5`.

**With Firecrawl CLI:**
```bash
firecrawl search "<query>" --limit 5
```

**Fallback (WebSearch):**
Use the built-in `WebSearch` tool. Run 2-3 targeted queries with different phrasings to compensate for lower quality.

### Step 2: Scrape top results

**With Firecrawl CLI:**
```bash
firecrawl scrape "<url>" --formats markdown
```

This returns clean markdown — no nav, no ads, just content.

**Fallback:** Use `WebFetch` with a focused prompt to extract only what's relevant.

### Step 3: Synthesize

- Pull only what's directly relevant to the research question
- Quote specific data points, dates, and numbers
- Note source and when it was published
- Flag anything that needs verification

---

## Output Format

```
## Research: [Topic]

**Query used:** [exact search terms]
**Sources:** [N] pages scraped

### Key Findings
- [Finding 1] — Source: [URL], [date]
- [Finding 2] — Source: [URL], [date]

### Details
[More context where needed]

### Gaps / Needs Verification
- [Anything uncertain or that needs a primary source]
```

---

## Context Efficiency Rules

- Never dump full page content into context. Extract and summarize.
- If a page is long, only scrape the relevant section.
- If running 5+ searches, consider `/delegate-research` instead to keep main session clean.
- Cap at 3 scraped pages unless the task explicitly needs more.
