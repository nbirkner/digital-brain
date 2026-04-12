# connect-mcps: Step-by-Step Workflow

Full workflow executed when you run `/connect-mcps connect to [tool name]`.

## Step 1: Parse Tool Name

- Extract and normalize the tool name
- Check if already connected (skip if duplicate, or offer reconfigure)

## Step 2: CLI Viability Check (Always Do This First)

Before touching MCP setup, evaluate whether a CLI is viable. CLI = zero session overhead. MCP = ~28K tokens injected at every session start.

**Ask:**
1. Does this tool have a public REST or GraphQL API? (Check the tool's developer docs.)
2. Does it use API key auth, or is it OAuth-only?

| API + API key auth | → **Build CLI** (see `references/cli-build.md`) |
| OAuth-only, no REST API | → Fall through to MCP |
| Official remote MCP exists | → Remote MCP acceptable (Step 3) |
| No API at all | → Skip or use browser |

**Known CLI-viable tools (from prior builds):**
- **Notion** → REST API, API key → CLI at `~/.local/bin/notion-work` + `~/.local/bin/notion-personal`
- **Linear** → GraphQL API, API key → CLI at `~/.local/bin/linear`
- **Readwise** → REST API, API key → CLI at `~/.local/bin/readwise`
- **GitHub** → REST API, personal access token → `gh` CLI already exists, no need to build
- **Amplitude** → REST API, API key → CLI viable (not yet built)
- **Slack** → REST API + OAuth, but posting via webhook is API-key only → webhook CLI viable for write; MCP for search
- **Figma** → official remote MCP (`https://mcp.figma.com/mcp`) → use remote MCP, not CLI

**If CLI viable:** Load `references/cli-build.md` and build the wrapper. Skip Steps 3-4.

**If CLI not viable:** Continue to Step 3.

## Step 3: Check for Official Remote MCP Server (Fallback #1)

Only if CLI is not viable. Remote MCPs are lower overhead than local MCPs.

Search the web for:
- "[tool name] official MCP server"
- "[tool name] remote MCP server documentation 2026"

**If remote server found** (e.g., `https://mcp.figma.com/mcp`):

Tell the user to run:
```bash
claude mcp add --transport http [tool] [url]
```

Then manage via `/mcp` in Claude Code to authenticate. No API keys needed.

**Known remote MCP servers:**
- **Figma:** `https://mcp.figma.com/mcp` — full docs at https://developers.figma.com/docs/figma-mcp-server/
- **Stripe:** Check Stripe docs for MCP endpoint
- **Others:** Search "[tool] MCP remote server"

## Step 4: Local MCP Setup (Last Resort)

Only if no remote server exists. Local MCPs add schema overhead every session — avoid unless necessary.

Search for:
- "[tool name] MCP integration guide"
- "[tool name] Claude MCP setup"
- "[tool name] API authentication requirements"

Extract from results:
- NPM package name or local server setup
- Required authentication (API keys, OAuth tokens, workspace IDs)
- Configuration parameters
- Tool names and capabilities

## Step 4b: Guide Credential Entry

Present what's needed, then prompt for each credential:

```
To connect Amplitude, I need:
1. Amplitude API Key (Settings → API Keys)
2. Project ID (Settings → Projects)

[Link to Amplitude documentation]

Enter your Amplitude API Key:
```

Credentials are handled by the MCP system securely — never stored in files.

## Step 5: Test Connection and Discover Tools

- Test the connection to verify it works
- Query the MCP server to discover available tools
- Extract tool names, descriptions, and parameters
- Document capabilities for routing

Example discovered tools for Amplitude:
- `query_insights` — Query product analytics data
- `get_funnels` — Retrieve funnel analysis
- `cohort_analysis` — Analyze user cohorts
- `event_tracking` — Track custom events

## Step 6: Intelligent Skill Mapping

Based on MCP category, automatically map to relevant skills. See `references/skill-mapping.md` for category detection rules.

**Quick reference:**
- **Analytics** (Amplitude, Mixpanel, Posthog, Pendo) → feature-metrics, impact-sizing, retention-analysis, activation-analysis, feature-results, metrics-framework, experiment-metrics
- **Project Management** (Linear, Jira) → create-tickets, meeting-notes, status-update, prioritize
- **Research** (Dovetail) → user-interview, user-research-synthesis, interview-guide
- **Transcription** (Otter.ai, Fireflies) → meeting-notes, meeting-cleanup, user-interview
- **Communication** (Slack) → slack-message, status-update, meeting-notes
- **Documentation** (Notion, Confluence) → decision-doc, status-update, meeting-notes
- **Design** (Figma) → generate-ai-prototype, napkin-sketch, prototype-feedback

## Step 7: Update Skill Files

For each mapped skill, add CLI commands (preferred) or MCP tool calls (fallback):

**If CLI was built:**
1. Read the current SKILL.md
2. Find insertion point (after Prerequisites or How It Works)
3. Add a CLI section using this template:

```markdown
### Using [Tool] CLI (If Connected)

[1-2 sentence description of what this CLI provides]

**Key Commands:**
- `<toolname> <command>` — [Brief description]
- `<toolname> <command>` — [Brief description]

**Example in this skill's context:**
```bash
<toolname> my-issues        # Get assigned issues
<toolname> create IC "..."  # Create a ticket
```

**Fallback:** [What to do if CLI unavailable or not installed]
```

**If MCP was connected (fallback path):**
1. Read the current SKILL.md
2. Find insertion point (after Prerequisites or How It Works)
3. Add an MCP integration section:

```markdown
### Using [MCP Name] (If Connected)

[1-2 sentence description]

**Available Tools:**
- `tool_name` — [Brief description]

**Fallback:** [What happens when MCP not available]
```

4. Write the updated SKILL.md back to disk
5. Log the change for the integration summary

## Step 8: Update CLAUDE.md Registry

Update two sections in CLAUDE.md:

**A) Integration Registry Table** (update to reflect CLI or MCP):
```markdown
| Tool | Purpose | Category | Used In | CLI Command |
|------|---------|----------|---------|-------------|
| Linear | Issue tracking | PM | create-tickets, meeting-notes | `linear` CLI |
| Amplitude | Product analytics | Analytics | impact-sizing, retention-analysis | MCP (no REST API) |
```

**B) Intelligent Query Routing Logic** — maps natural language queries to the CLI command or MCP tool.

## Step 9: Generate Integration Summary

- Save a detailed log to `work/docs/logs/mcp-integration-logs/[timestamp]-[tool-name].md`
- Display a summary: integration type (CLI vs MCP), commands available, skills updated
- Provide example usage so the PM can start immediately
