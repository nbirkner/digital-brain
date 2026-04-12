---
name: batch-historical-meetings
description: "Use when backfilling historical meeting notes, processing past meetings in bulk, or recovering from a gap where the daily automation missed meetings. Also use for first-time setup to import all historical Granola meetings. Keywords: backfill meetings, bulk import, historical notes, missed meetings, first setup."
disable-model-invocation: false
user-invocable: true
---

## Quick Start

```
/batch-historical-meetings                          → process last 90 days
/batch-historical-meetings all                      → process all time (run by month for large sets)
/batch-historical-meetings 2026-01-01 2026-01-31    → process a specific month
/batch-historical-meetings 2025-11-01 2025-11-30    → process November 2025
```

**What it does:** Fetches all meetings from Granola for the date range, classifies each into the right template, generates a structured summary, saves a `.md` file to the correct folder (work/personal/shared based on template), and stops — no Notion push. No action items are created — these are historical records.

**Scale note:** ~400 Granola meetings exist going back to March 2025. Run month by month for large backfills to avoid context overload.

---

## Step 1: Parse Date Range

From the arguments provided:
- No arguments → `start = today - 90 days`, `end = today`
- `all` → `start = 2020-01-01`, `end = today`
- `YYYY-MM-DD YYYY-MM-DD` → use as `start` and `end`

Store as `BATCH_START` and `BATCH_END`.

---

## Step 2: Fetch All Granola Meetings

```bash
python3 /Users/nikibirkner/Code/Niklaude/work/automations/meeting-summary/helpers/granola.py BATCH_START BATCH_END
```

If `all` mode: `python3 /Users/nikibirkner/Code/Niklaude/work/automations/meeting-summary/helpers/granola.py all`

Parse JSON output as meeting list.

---

## Step 3: Process Each Meeting (sorted by date ascending)

For each meeting, run steps 5a–5g:

### 3a. Normalize attendees (conference room removal)

Before classifying, strip conference rooms from the attendee list and replace with Niki Birkner (niki@together.ai).

**Known conference rooms:** Electra, Gemma, Pulsar, Eliza, Llama, Koala, Orca, Chinchilla, Vipul's Office, Red Pajama, Vicuna, Mixtral, ERNIE, BERT, Elmo, Qwen, Alpaca, Mothers Room, Whisper, Dragon Fly

**Rules (apply both):**
1. **Email check (if available):** If attendee email contains `resource.calendar.google` → replace with Niki Birkner (niki@together.ai)
2. **Name check:** If attendee name matches a known conference room name (case-insensitive) AND has no last name → replace with Niki Birkner (niki@together.ai)

After replacement, deduplicate so Niki only appears once.

### 3b. Existence check (rerun mode)

This skill runs in **rerun mode** — always regenerate every meeting with richer transcript-based content. Do NOT skip existing meetings. Always proceed to 5c.

### 3d. Classify

Apply rules in priority order:

| Template | Rule |
|---|---|
| `08_couples_therapy` | "Cheryl" AND "Juan" in attendees OR title contains "couples therapy" |
| `07_individual_therapy` | "Carolyn" in attendees OR (title contains "therapy" AND NOT title contains "couples") |
| `09_reiki_spiritual` | Title/content contains: reiki, energy work, breathwork, sound bath, meditation, spiritual, ceremony, shamanic, chakra |
| `10_financial_planning` | Title/content contains: financial zen, rick tucker, estate plan, 401k, investment review, disability insurance, tax planning |
| `03_external_vendor` | Any attendee domain is NOT `together.ai` and NOT a personal gmail |
| `04_sprint_cycle` | Title contains: kickoff, kick-off, cycle, sprint, capacity, retro, retrospective |
| `05_allhands_briefing` | 15+ attendees OR title contains: all-hands, all hands, top line, town hall, company update |
| `06_technical_architecture` | Title contains: architecture, technical sync, design review, api key, schema, migration, ums, tcloud, integration, rbac, oidc, oauth, endpoint, data model — AND 3+ technical terms in content |
| `02_one_on_one` | Exactly 2 together.ai attendees |
| `01_cross_functional` | Multiple together.ai attendees (default work) |
| `11_personal_logistics` | Fallback |

**1:1 counterpart extraction:** When classified as `02_one_on_one`, identify the other person's name by parsing the meeting title. Titles follow formats like "Niki / Shadi", "Karina / Niki", "Niki <> Derek", "1:1 with Sarah", etc. Extract the name that is NOT Niki and use it throughout the summary as the counterpart. If the title alone is ambiguous, fall back to the attendee list.

Category: templates 07–11 → `personal`, 01–06 → `work`

Subcategory mapping: `01_cross_functional` → `cross-functional`, `02_one_on_one` → `1:1`, `03_external_vendor` → `external`, `04_sprint_cycle` → `sprint-cycle`, `05_allhands_briefing` → `all-hands`, `06_technical_architecture` → `technical`, `07_individual_therapy` → `therapy`, `08_couples_therapy` → `couples-therapy`, `09_reiki_spiritual` → `reiki-spiritual`, `10_financial_planning` → `financial`, `11_personal_logistics` → `logistics`

**Label mapping** (used in frontmatter):
- `01_cross_functional` / `02_one_on_one` / `04_sprint_cycle` / `06_technical_architecture`: use `work_type` value (Commerce, Identity & Collaboration, Product Foundations, General)
- `03_external_vendor`: External
- `05_allhands_briefing`: All-Hands
- `07_individual_therapy` / `08_couples_therapy`: Therapy
- `09_reiki_spiritual`: Spiritual
- `10_financial_planning`: Finance
- `11_personal_logistics`: Personal

### 3e. Load Template

```
Read: /Users/nikibirkner/Code/Niklaude/work/automations/meeting-summary/work/templates/<template_key>.md
```

### 3f. Generate Summary

**Primary sources:**
- Use the `transcript` field as the primary source when non-empty. Fall back to `notes` when transcript is empty.

Fill every section of the template. Where information is missing, write "Not discussed". Refined Transcript: compress to ~20-30% of original length, preserve speaker attribution with real dialogue quotes.

### 3g. Save File

Sanitize meeting name: replace spaces AND `/ \ : * ? " < > |` with `_`. All filenames must use underscores, never spaces.

**Route by template:**
- Personal templates (07–11) → `/Users/nikibirkner/Code/Niklaude/personal/notes/<date>/<sanitized_name>.md`
- Work templates (01–06) → `/Users/nikibirkner/Code/Niklaude/work/notes/<date>/<sanitized_name>.md`
- Ambiguous → `/Users/nikibirkner/Code/Niklaude/personal/notes/<date>/<sanitized_name>.md`

Create the date subfolder if it doesn't exist.

**Prepend frontmatter to each saved file:**
```yaml
---
date: <date>
category: <work|personal|shared>
label: <label from label mapping>
template: <template_key>
source: granola
---
```

**No Notion push. No action items. These are historical records.**

Print: `[DONE] <name> — <date> (<template_key>) → <destination folder> [granola]`

---

## Step 4: Final Summary

```
=== Batch Historical Meetings: BATCH_START → BATCH_END ===
Total meetings: N
  Saved: N
  Failed: N

By destination:
  work/notes/: N
  personal/notes/: N
  personal/notes/: N

Files saved to:
  work/notes/<earliest_date>/ → work/notes/<latest_date>/
  personal/notes/<earliest_date>/ → personal/notes/<latest_date>/
  personal/notes/<earliest_date>/ → personal/notes/<latest_date>/
```
