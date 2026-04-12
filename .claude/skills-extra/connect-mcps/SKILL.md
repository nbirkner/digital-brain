---
name: connect-mcps
description: "Use when connecting a new tool integration, adding an MCP server, or running batch MCP setup. Keywords: connect to [tool], add MCP, set up [tool] integration, batch connect, connect Amplitude/Linear/Notion/Slack/Figma. DO NOT TRIGGER for general MCP questions that don't require setup."
version: 2.0
user-invocable: true
modifies-workspace: true
---

# `/connect-mcps` - Tool Integration Manager (CLI-First)

Connect tools to your PM OS workspace. **Always tries CLI first** — CLIs have zero session overhead vs MCPs which inject schemas upfront (~28K tokens per session start). Falls back to MCP only when CLI is not viable.

## Quick Start

```
/connect-mcps connect to [tool name]   # Connect a single tool
/connect-mcps batch                    # Connect multiple tools at once
```

**Example:** `/connect-mcps connect to linear`

**Output:** CLI built at `~/.local/bin/<tool>` (preferred) OR MCP connected, skills updated, integration log saved

**Time:** 10-20 min for CLI build; 5-15 min for MCP

## CLI-First Philosophy

> "MCPs inject tool schemas at session start — that's ~28K tokens of overhead before you type a single word. A CLI has zero overhead until you call it." — Karpathy

**When to build a CLI (preferred):**
- Tool has a REST or GraphQL API
- API key auth (not OAuth-only)
- Bonus: enforces structural account separation (different tokens per wrapper = impossible to cross-post)

**When MCP is acceptable fallback:**
- Tool provides an official remote MCP with minimal local overhead (e.g., Figma, Stripe)
- API is OAuth-only with no usable REST API
- Tool has no public API at all
- CLI exists but requires complex setup worth avoiding

## How It Works

1. **Parse tool name** — normalize and check for duplicates
2. **Evaluate CLI viability** — does the tool have a REST/GraphQL API with API key auth? (see `references/cli-build.md`)
3. **If CLI viable** — build bash wrapper at `~/.local/bin/<tool>`, add permission, test, update skills
4. **If CLI not viable** — search for official remote MCP server
5. **If remote MCP found** — run `claude mcp add --transport http [tool] [url]`, authenticate
6. **If no remote MCP** — research local MCP setup (NPM/Docker) as last resort
7. **Map to PM OS skills** — update relevant skill files with CLI commands or MCP tool calls
8. **Update CLAUDE.md** — add to registry table and query routing logic
9. **Save integration log** — written to `work/docs/logs/mcp-integration-logs/[timestamp]-[tool].md`

**Priority order:**
1. **CLI** (bash wrapper at `~/.local/bin/<tool>`) — zero session overhead, structural separation
2. **Official remote MCP** (e.g., Figma at `https://mcp.figma.com/mcp`) — acceptable for tools with no good REST API
3. **Local MCP** (NPM/Docker) — last resort, adds session overhead
4. **Skip** — if integration adds more friction than value

## CLI Decision Tree

When a user asks to connect a tool, run through this before touching MCP:

```
1. Does the tool have a public REST or GraphQL API?
   NO → skip to MCP
   YES → continue

2. Does it use API key auth (not OAuth-only)?
   NO (OAuth-only) → skip to MCP
   YES → continue

3. Build the CLI. (See references/cli-build.md for template and pattern.)
   - Build bash wrapper at ~/.local/bin/<toolname>
   - Source token from env var set in ~/.claude/settings.json
   - Test with a simple read command before declaring success
   - Add Bash(<toolname>:*) to .claude/settings.local.json
   - Update relevant skills to call CLI instead of MCP
```

## Tool-to-Skill Mapping

| MCP Category | Tools | PM OS Skills Updated |
|-------------|-------|---------------------|
| Analytics | Amplitude, Mixpanel, Posthog, Pendo | feature-metrics, impact-sizing, retention-analysis, activation-analysis, feature-results, metrics-framework, experiment-metrics |
| Project Management | Linear, Jira, Asana | create-tickets, meeting-notes, status-update, prioritize |
| Research | Dovetail | user-interview, user-research-synthesis, interview-guide |
| Transcription | Otter.ai, Fireflies | meeting-notes, meeting-cleanup, user-interview |
| Communication | Slack | slack-message, status-update, meeting-notes |
| Documentation | Notion, Confluence | decision-doc, status-update, meeting-notes |
| Design | Figma | generate-ai-prototype, napkin-sketch, prototype-feedback |
| Web Search | (various) | competitor-analysis |

## Output Quality Self-Check

Before declaring an MCP connection complete, verify all of these:

- [ ] Connection tested successfully -- a simple query returned valid results
- [ ] Tools discovered and documented -- available MCP tools listed with descriptions
- [ ] Category correctly assigned -- mapped to the right category
- [ ] Relevant skills updated -- all skills that benefit have integration sections added
- [ ] CLAUDE.md registry updated -- MCP appears with purpose, category, skills, and key tools
- [ ] Routing logic updated -- natural language query patterns mapped to this MCP
- [ ] Integration log saved -- written to `outputs/mcp-integration-logs/[timestamp]-[tool].md`
- [ ] Fallback documented -- skills note what to do when this MCP is unavailable
- [ ] No duplicate entries -- MCP not listed twice in registry or skill files
- [ ] PM knows how to use it -- example natural language queries provided

If any check fails, fix it before declaring success.

## Available Reference Guides

Detailed setup knowledge is in `references/`. Load the right file when the user asks to connect a specific tool.

| Reference File | Contents |
|---------------|----------|
| `references/workflow.md` | Full 9-step workflow with templates and insertion point logic |
| `references/skill-mapping.md` | Category detection rules, CLAUDE.md registry format, skill update template |
| `references/examples.md` | Complete worked examples: Figma, Amplitude, Linear, Batch, query routing |
| `references/error-handling.md` | Error handling, edge cases, troubleshooting, common mistakes |
| `references/tool-guides.md` | Per-tool setup details, credential locations, maintenance, security |

## Loading Triggers

**MANDATORY:** Load `references/workflow.md` for every connection request — it has the step-by-step process including CLI evaluation.

**MANDATORY:** Load `references/cli-build.md` when a REST/GraphQL API is available — it has the bash wrapper template, testing pattern, and permission setup.

**MANDATORY:** Load `references/tool-guides.md` when the user names a specific tool — it has CLI viability, credentials needed, and tool-specific notes.

**Load on demand:**
- `references/examples.md` — when user wants to see what the process looks like
- `references/skill-mapping.md` — when determining category, updating skill files, or writing CLAUDE.md entries
- `references/error-handling.md` — when a connection fails or user reports issues

**Do NOT load** reference files speculatively. Only load what the current request requires.
