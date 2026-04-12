# connect-mcps: Category Detection and Skill Mapping Rules

## How I Determine MCP Category

**Analytics/Metrics Keywords:**
analytics, metrics, data, dashboard, reporting, charts, insights, KPI, measurement, funnel, cohort, retention, events

**Project Management Keywords:**
tickets, issues, tasks, projects, sprints, backlog, epics, stories, roadmap, planning

**Research/Interviews Keywords:**
research, interviews, transcripts, insights, quotes, themes, tagging, synthesis, user feedback

**Transcription Keywords:**
transcription, audio, recording, speech-to-text, meeting recording, voice notes

**Communication Keywords:**
slack, email, messaging, notifications, chat, channels, DMs

**Documentation Keywords:**
docs, wiki, knowledge base, pages, workspace, notes

**Design/Prototyping Keywords:**
design, prototype, mockup, wireframe, UI, UX, Figma, components

**Web Search Keywords:**
search, browse, web, internet, competitor, market research

## Mapping Logic Examples

**Amplitude MCP detected:**
- Category: Analytics (keywords: analytics, metrics, events, funnel, cohort)
- Maps to: feature-metrics, impact-sizing, retention-analysis, activation-analysis, feature-results, metrics-framework, experiment-metrics

**Linear MCP detected:**
- Category: Project Management (keywords: issues, projects, tickets)
- Maps to: create-tickets, meeting-notes, status-update, prioritize

**Dovetail MCP detected:**
- Category: Research + Transcription (keywords: research, interviews, transcripts, insights)
- Maps to: user-interview, user-research-synthesis, interview-guide, meeting-notes

**Multi-category MCPs** are mapped to all relevant skill groups — ask the user to confirm.

## Skill File Update Template

```markdown
### Using [MCP Name] (If Connected)

[1-2 sentence description of what this MCP provides]

**Available Tools:**
- `tool_name` — [Brief description]
- `tool_name_2` — [Brief description]

**Integration Example:**
```pseudocode
# [Example showing typical usage in this skill's context]
[tool_name].method({ param1: value1, param2: value2 })
```

**Benefits:**
- [Benefit 1 — e.g., Real-time data access]
- [Benefit 2 — e.g., No manual exports needed]

**Fallback:** [What happens when MCP not available — e.g., "Upload CSV data to work/docs/analyses/ for manual analysis"]
```

## Insertion Point Logic

1. If "Prerequisites" section exists → Insert immediately after
2. If "How It Works" section exists → Insert immediately after
3. Otherwise → Insert after title and frontmatter, before main content

## CLAUDE.md Registry Format

**Registry Table:**
```markdown
| MCP | Purpose | Category | Used In | Key Tools |
|-----|---------|----------|---------|-----------|
| Amplitude | Product analytics | Analytics | feature-metrics, impact-sizing, retention-analysis | query_insights, get_funnels, cohort_analysis |
| Linear | Project management | PM Tools | create-tickets, meeting-notes, status-update | create_issue, update_issue, search_issues |
| Dovetail | User research | Research | user-interview, user-research-synthesis | search_insights, get_themes, export_quotes |
```

**Routing Logic:**
```markdown
**Analytics Queries** → Analytics MCPs (Amplitude, Mixpanel, Posthog)
- Pattern: "give me metrics on X", "show funnel for Y", "retention for Z"
- Multi-MCP: Ask user which tool to use
- Fallback: Check work/docs/analyses/

**Task Queries** → PM MCPs (Linear, Jira)
- Pattern: "show my tasks", "create ticket for X", "status of epic Y"
- Multi-MCP: Ask user which tool to use
- Fallback: Check work/notes/ for action items
```
