---
name: meeting-template-designer
description: Design, create, and improve meeting summary templates for the Niklaude meeting pipeline. Use when the user wants to: (1) Create a new meeting template from scratch, (2) Improve or update an existing template, (3) Ask what a good template for a specific meeting type should look like, (4) Review all templates and suggest improvements. Templates live at work/automations/meeting-summary/work/templates/ and are used by the daily-meeting-summary and batch-historical-meetings skills to generate structured meeting notes.
---

## Overview

Meeting templates are prompt instructions that Claude follows to generate structured summaries from transcripts and notes. They live at:

```
/Users/nikibirkner/Code/Niklaude/work/automations/meeting-summary/work/templates/
```

Each template is a `.md` file named `NN_category.md`. Claude reads the file, follows the instructions, and fills in every section using available transcript/notes data.

**Existing templates:**

| File | Category | Used when |
|------|----------|-----------|
| `01_cross_functional.md` | Work | Multiple together.ai attendees |
| `02_one_on_one.md` | Work | Exactly 2 together.ai attendees |
| `03_external_vendor.md` | Work | Non-together.ai external attendees |
| `04_sprint_cycle.md` | Work | Kickoff/retro/sprint keywords |
| `05_allhands_briefing.md` | Work | 15+ attendees or all-hands keywords |
| `06_technical_architecture.md` | Work | Technical/architecture keywords |
| `07_individual_therapy.md` | Personal | Carolyn in attendees or "therapy" in title |
| `08_couples_therapy.md` | Personal | Cheryl + Juan in attendees or "couples therapy" in title |
| `09_reiki_spiritual.md` | Personal | Spiritual/energy work keywords |
| `10_financial_planning.md` | Personal | Financial Zen, Rick Tucker, tax keywords |
| `11_personal_logistics.md` | Personal | Fallback for personal meetings |
| `12_panel_talk.md` | Work | Panel/conference/talk keywords |

---

## Workflow

### Mode 1: Create a new template

1. **Understand the meeting type.** Ask: What kind of meetings does this cover? Who attends? What decisions get made? What does Niki need to remember and act on afterward?

2. **Research best practices.** Use web search to pull template examples from Notion, Fellow, Granola, Fireflies, and other notetaking tools. Look for:
   - What sections do the best templates in this category include?
   - What makes the format scannable and reusable?
   - Any domain-specific conventions (e.g., therapy notes vs. investor meetings)?

3. **Read related existing templates.** Read the 1-2 most similar existing templates at `work/automations/meeting-summary/work/templates/` for style and tone conventions.

4. **Read the template design principles.** Read `references/template-principles.md` for Niki-specific formatting rules.

5. **Design the template.** Draft sections based on: what matters for this meeting type + what Niki would reread + what generates useful action items.

6. **Write the file.** Save to `work/automations/meeting-summary/work/templates/NN_category.md`. Pick the next available number prefix. Include a header instruction block at the top (1-2 sentences of context/persona for Claude).

7. **Update classification.** If this is a new meeting type, update the classification table in:
   - `.claude/skills/batch-historical-meetings/SKILL.md`
   - `.claude/commands/batch-historical-meetings.md`
   - `.claude/commands/daily-meeting-summary.md`

### Mode 2: Improve an existing template

1. **Find and read the current template.** All templates live at `work/automations/meeting-summary/work/templates/`. If the user names a meeting type but not an exact filename, glob the directory first to find the right file:
   ```
   Glob: /Users/nikibirkner/Code/Niklaude/work/automations/meeting-summary/work/templates/*.md
   ```
   Match by number prefix or keyword (e.g., "therapy" → `07_individual_therapy.md`, "1:1" → `02_one_on_one.md`, "vendor" → `03_external_vendor.md`). Then read the full file before doing anything else.

2. **Diagnose gaps.** Ask Niki: What's missing? What sections do you never read? What do you wish you had? Or surface your own observations: thin sections, generic prompts, missing specificity.

3. **Research what's possible.** Web search for best-in-class examples of this specific meeting type from Notion, Granola, Fireflies, etc. Look specifically for sections or prompts that would improve on the current template.

4. **Read `references/template-principles.md`** for the formatting and style rules.

5. **Rewrite the template.** Preserve what works. Improve what doesn't. Add new sections only if they add clear value.

6. **Save the updated file.** Overwrite the existing template in `work/automations/meeting-summary/work/templates/`.

---

## Output format for templates

Every template file follows this structure:

```
[1-2 sentence instruction block — persona and any special reading required]

## [Section title]
[Instruction for Claude on what to write here]

## [Section title]
...

---

### Refined Transcript
[Instruction for how to compress/format the transcript]
```

**Key rules (from template-principles.md):**
- Write instructions TO Claude, not section headers for humans
- Every section must tell Claude what to do when data is missing
- Personal templates read `personal/context/general/personal-context.md` first
- Therapy/spiritual templates use first person, no clinical jargon
- Work templates use "we" framing
- No em dashes anywhere in generated output

---

## Research guidance

When web-searching for template inspiration, good queries:
- `"meeting notes template" [meeting type] notion site:notion.so`
- `"therapy session notes template" best practices`
- `"one on one meeting template" manager best practices 2024`
- `granola meeting notes template examples`
- `fireflies.ai meeting summary template`
- `"board meeting minutes template" best practices`

Focus on: section names, question prompts, and what information is captured. Adapt to Niki's voice and context — don't copy verbatim.
