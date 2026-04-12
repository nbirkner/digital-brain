---
name: file-router
description: Routes output files to the correct outputs/ subfolder before writing. Use this skill BEFORE creating any new file in the outputs/ directory to determine where it belongs. Prevents files from floating at the outputs/ root level. Triggers automatically whenever Claude is about to write or save a new document, note, plan, review, or any other output file.
---

# File Router

Before writing any file to `outputs/`, determine the right subfolder. Never write files to the `outputs/` root.

## Known Taxonomy

| Folder | What goes here |
|--------|---------------|
| `work/docs/prds/` | PRDs, specs, one-pagers, feature briefs (nest in a subfolder per feature) |
| `work/docs/analyses/` | Impact sizing, data analysis, technical investigations, rate-limit analysis |
| `work/docs/roadmaps/` | Roadmap drafts, milestone plans |
| `work/docs/research/` | User interview synthesis, competitive research summaries |
| `work/docs/prototypes/` | Prototype prompts, wireframes, ASCII sketches |
| `work/docs/journey-maps/` | User and customer journey maps |
| `work/docs/reviews/` | Document reviews (e.g., Ralph reviews, PRD peer reviews) |
| `work/docs/decisions/` | Decision logs, trade-off docs, RFCs |
| `work/docs/career/` | Self-reviews, performance feedback, career development docs, compensation notes |
| `work/notes/YYYY-MM/YYYY-MM-DD/` | All Together AI meeting notes (always date-nested) |
| `work/docs/comms/status-updates/` | Stakeholder updates, progress reports |
| `work/docs/comms/weekly-plans/` | Weekly priority plans |
| `work/docs/comms/weekly-reviews/` | Weekly retrospectives |
| `work/docs/comms/slack-messages/` | Draft Slack messages |
| `work/docs/logs/YYYY-MM/` | Session logs for Together AI work — date-nested |
| `personal/docs/logs/YYYY-MM/` | Session logs for personal work — date-nested |
| `work/docs/logs/<subfolder>/` | System/automation logs — `logs/mcp-integration-logs/`, `logs/context-update-logs/`, `logs/automation-runs/` |
| `personal/site/finances/` | Personal finance docs, budget notes, equity/RSU information |
| `work/docs/other/` | Catch-all for Together AI work that doesn't fit any category above |

## Decision Rules

1. **Match on content type first.** A "quarterly review" is `career/`, not `reviews/`. A "feature analysis" is `analyses/`, not `prds/`.
2. **When in doubt between two categories**, pick the one that makes future retrieval most intuitive.
3. **If a new category makes obvious sense** (e.g., a legal doc, a vendor evaluation, a job description), create it rather than using `other/`. Name it clearly and add it to this taxonomy.
4. **Use `other/` only** when the file is genuinely one-off and unlikely to have companions.

## Process

1. Read the file name and, if available, the content or context of what's being created.
2. Match to a folder from the taxonomy above.
3. If no good match exists, propose a new folder name and confirm with the user before creating.
4. Announce the chosen path before writing: e.g., "Saving to `work/docs/career/lattice-self-review-2026.md`"
5. Create the directory if it doesn't exist (it will be created automatically when the file is written).

## Where New Files Go

**All new files go in `outputs/`. Never write to `work/context/`.**

`work/context/` is read-only reference material. Only the PM manually moves finalized work there.

## Context Sources

When producing any output, gather context from all relevant locations before writing:

**work/context/ (read-only reference):**
| Source | What's there |
|--------|-------------|
| `work/site/strategy/` | Strategy docs, roadmaps, OKRs, and PM framework references (7 Powers, JTBD, PLG, etc.) |
| `work/context/writing-style/` | Audience-specific writing style guides (customer, executive, internal, technical) |
| `work/context/work-context/` | PM's background, role, preferences, working style |
| `work/context/general-context/business-info-template.md` | Company and product context |
| `work/context/general-context/stakeholder-template.md` | Stakeholder profiles and preferences |
| `work/context/general-context/niklaude-learning-log.md` | Patterns and learnings from past sessions |

**outputs/ (active and historical work):**
| Source | What's there |
|--------|-------------|
| `work/docs/decisions/` | All decision logs and trade-off docs |
| `work/docs/prds/` | PRDs, specs, one-pagers (including `examples/` for reference PRDs) |
| `work/docs/analyses/` | Impact sizing, data analysis, investigations |
| `work/docs/roadmaps/` | Roadmap drafts |
| `work/docs/career/` | Self-reviews, peer reviews, career docs |
| `work/docs/comms/weekly-plans/` | Weekly priority plans |
| `work/docs/comms/weekly-reviews/` | Weekly retrospectives |
| `work/docs/comms/slack-messages/` | Draft Slack messages |
| `work/notes/` | Meeting notes (date-nested) |
| `work/docs/logs/` | Session logs for Together AI work |
| `personal/docs/logs/` | Session logs for personal work |

**work/repos/ (codebase context):**
| Source | What's there |
|--------|-------------|
| `work/repos/together-web/` | Main product codebase |
| `work/repos/mintlify-docs/` | Documentation site |

**Rule:** Always cross-reference work/context/ (permanent reference) + outputs/ (recent work) before writing. For technical tasks, also check work/repos/. Don't rely on a single source.

## Examples

| File | Correct path |
|------|-------------|
| Lattice self-review | `work/docs/career/lattice-self-review-2026.md` |
| Together AI session log | `work/docs/logs/YYYY-MM/YYYY-MM-DD.md` |
| Personal session log | `personal/docs/logs/YYYY-MM/YYYY-MM-DD.md` |
| ACH 1-pager PRD | `work/docs/prds/ach/ach-one-pager.md` |
| Pay Later cutover decision | `work/docs/decisions/pay-later-cutover.md` |
| Q1 retrospective | `work/docs/comms/weekly-reviews/q1-retro.md` |
| Vendor comparison for Lago | `work/docs/analyses/lago-vendor-comparison.md` |
| RSU education notes | `work/docs/finance/rsu-education-notes.md` |
| Slack message draft | `work/docs/comms/slack-messages/2026-03-24-topic.md` |
