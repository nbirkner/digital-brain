# connect-mcps: Recommended PM Tools Guide

Based on real PM workflows, here's which tools to connect and how. **Always check CLI viability first** — see `references/cli-build.md` for the build pattern.

## CLI Viability Summary

| Tool | CLI Viable? | Auth | Status |
|------|------------|------|--------|
| **Linear** | Yes | API key, no Bearer prefix | Built (`~/.local/bin/linear`) |
| **Notion (work)** | Yes | API key, no Bearer prefix | Built (`~/.local/bin/notion-work`) |
| **Notion (personal)** | Yes | API key, no Bearer prefix | Built (`~/.local/bin/notion-personal`) |
| **Readwise** | Yes | `Token $KEY` prefix | Built (`~/.local/bin/readwise`) |
| **GitHub** | Yes | Personal access token | Use `gh` CLI (already installed) |
| **Amplitude** | Yes | API key | Not yet built — build CLI |
| **Figma** | No | OAuth/browser | Use official remote MCP |
| **Stripe** | Yes (limited) | API key | CLI viable for read; remote MCP for write |
| **Slack** | Partial | Webhook (write) / OAuth (read) | CLI viable for posting; MCP for search |
| **Google Calendar** | No | OAuth only | Use MCP or gcalcli with OAuth setup |
| **Gmail** | No | OAuth only | Use MCP or OAuth-based CLI |

---

## Priority Tier: Start Here

Connect these first. They cover 80% of daily workflows.

### 1. Analytics Tools (Amplitude, Mixpanel, Posthog, Pendo)

**Why connect:** Self-serve analytics without waiting on a data team.

**What you can do:**
- "What's the funnel conversion rate for onboarding?"
- "Show me retention by signup cohort for last quarter"
- "Which features correlate with power user behavior?"
- "Pull session recordings for users who churned last week"

**Setup:** `/connect-mcps connect to amplitude` (or your analytics tool)

**Setup difficulty:** Medium (10-20 min) -- API key + Project ID required

**Tool details:**

| Tool | Server | Credentials Needed | Query Language |
|------|--------|-------------------|----------------|
| Amplitude | `@anthropic/amplitude-mcp` | API key, Project ID | AQL |
| Mixpanel | `mcp-server-mixpanel` (community) | Project token, API secret | JQL |
| PostHog | `@anthropic/posthog-mcp` | API key, host URL (US/EU/self-hosted) | HogQL |
| Pendo | Check Pendo docs for latest | API key, subscription key | N/A |

**Common analytics queries:**
- "What's our week-over-week active user growth?"
- "Show me the conversion funnel for checkout"
- "Which features have the highest correlation with retention?"
- "What's the statistical significance of our pricing experiment?"

---

### 2. Project Management (Linear, Jira, Asana)

**Why connect:** Batch create tickets from meeting notes. Track engineering progress without tab-switching.

**What you can do:**
- "Take these action items and create Linear tickets"
- "Show completed tickets from current sprint"
- "List all blocked tickets and their reasons"
- "Update ticket LIN-123 to mark it as done"

**Setup:** `/connect-mcps connect to linear` (or your PM tool)

**Setup difficulty:** Easy (5-10 min) -- API token only

Find API key at: https://linear.app/settings/api

---

### 3. Communication (Slack, Microsoft Teams)

**Why connect:** Share analysis summaries and search past decisions without leaving Claude.

**What you can do:**
- "Summarize this week's work and post to #engineering-updates"
- "Search Slack for conversations about pricing from last month"
- "Find the decision about API versioning we discussed"

**Setup:** `/connect-mcps connect to slack`

**Setup difficulty:** Easy (5-10 min) -- Workspace token

---

### 4. Documentation (Notion, Confluence, Google Drive)

**Why connect:** Access PRDs and specs, create documents from templates, search institutional knowledge.

**What you can do:**
- "Search my Drive for customer interview notes from Q3"
- "Create a PRD for dark mode and save to Product Docs"
- "Update the onboarding guide with new screenshots"

**Setup:** `/connect-mcps connect to notion` (or your docs tool)

**Setup difficulty:** Medium (10-20 min) -- Integration setup required

---

## High Value Tier

Not required day one, but add these once core setup is done.

### 5. Design Tools (Figma, Sketch)

**Why connect:** Reference designs in conversations, extract specs, track feedback.

**Setup:** `/connect-mcps connect to figma`

**Note:** Figma has an official remote MCP server -- easiest setup of any tool.
```bash
claude mcp add --transport http figma https://mcp.figma.com/mcp
```
Then authenticate via `/mcp` in Claude Code. No API keys needed.

**Setup difficulty:** Easy (5-10 min via remote server)

---

### 6. Calendar (Google Calendar, Outlook)

**Why connect:** Analyze time allocation, schedule research sessions, find focus time patterns.

**What you can do:**
- "Analyze my calendar this week -- where did I spend time?"
- "Find a 1-hour slot for user interviews next week"

**Setup:** `/connect-mcps connect to google-calendar`

**Setup difficulty:** Advanced (20-30 min) -- OAuth + calendar selection

---

### 7. Code Repository (GitHub, GitLab)

**Why connect:** Track engineering progress, review technical discussions.

**What you can do:**
- "What PRs were merged in the mobile repo this week?"
- "Summarize the discussion in issue #234 about performance"

**Setup:** `/connect-mcps connect to github`

**Setup difficulty:** Easy (5-10 min) -- Personal access token

---

## Specialized Tier

For specific workflows or advanced users.

### 8. Customer Support (Zendesk, Intercom)

Analyze support tickets for patterns, find common user issues, identify bug clusters.

**Setup:** `/connect-mcps connect to zendesk`

### 9. Revenue Tools (Stripe, ChartMogul)

Analyze subscription trends, track MRR changes, identify churn patterns.

**Setup:** `/connect-mcps connect to stripe`

**Note:** Stripe has a remote MCP server -- check Stripe docs for endpoint.

### 10. Social Listening (Twitter/X, Reddit)

Monitor competitor mentions, analyze user sentiment, find feature requests in the wild.

**Setup:** `/connect-mcps connect to reddit`

---

## Choosing Your Stack

| Role | Tools to Connect | Setup Time |
|------|-----------------|------------|
| Solo PM | Analytics + Project Management + Slack + Docs | 30-45 min |
| PM Team | Solo stack + Design + Calendar + GitHub | 1-2 hours |
| PM Leader | Team stack + Support + Revenue tools | 2-3 hours |

Start small. Add one MCP at a time as you discover needs. More MCPs does not equal better.

---

## Maintenance

**Weekly:** Test critical integrations with simple queries, update expiring API tokens.

**Monthly:** Update MCP servers to latest versions (`npm update`), review permissions, remove unused MCPs.

**Quarterly:** Evaluate new MCP releases, assess ROI of each integration.

**Signs you need to update:** Connection errors/timeouts, missing tools, slow responses, authentication failures.

---

## Security Best Practices

**API Keys:**
- Use read-only credentials whenever possible
- Store keys in environment variables, never in code
- Rotate keys quarterly or when team members leave
- Never share keys in Slack or email

**Permissions:**
- Grant minimum required scopes
- Audit access regularly
- Use separate keys for prod vs staging
- Revoke unused tokens immediately

**Data Privacy:**
- Don't query PII unless necessary
- Be mindful of GDPR/data regulations
- Use aggregated data when possible
- Don't export sensitive user data to logs
