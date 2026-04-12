# Template Design Principles — Niklaude

These rules apply to all meeting templates in `work/automations/meeting-summary/work/templates/`.

---

## Core philosophy

Templates are **prompt instructions to Claude**, not document outlines for humans. Every line should help Claude make better decisions about what to write and how.

**A great template produces output that:**
- Niki would reread weeks later and find useful
- Contains specific details, not generic summaries
- Surfaces what actually matters — decisions, tensions, next steps
- Reads like Niki wrote it, not like an AI summarized it

---

## Formatting rules

- **No em dashes** in any generated output. Use commas, periods, or parentheses instead.
- **Contractions are good.** "We're" not "We are." "I didn't" not "I did not."
- **Vary sentence length.** Mix short punchy lines with longer explanatory ones.
- **Specific over generic.** "$47K contract" beats "a significant contract." "Tristan pushed back hard" beats "there was disagreement."
- **Avoid:** leverage, utilize, robust, cutting-edge, delve, harness, streamline, unlock
- **Use real names.** Not "the other person" — the actual name.
- **Numbers and dates.** Preserve exact figures, dates, and amounts from the transcript.

---

## Section design rules

### Every section must:
1. Tell Claude what to write in that section (not just what to title it)
2. Tell Claude what to write when the information is missing
3. Be worth the space — if a section would routinely say "Not discussed," cut it or merge it

### Section types and when to use them:

**Narrative sections** (Core Struggles, What Was Discussed, Relationship Context)
- Use for context, history, and background
- Write as prose, not bullets
- First person for personal templates, "we" for work

**Bullet sections** (Key Takeaways, Decisions Made, Intelligence Gathered)
- Use for discrete facts, decisions, or signals
- Lead each bullet with the actual fact, not "we discussed X"
- Include context on why it matters

**Table sections** (Action Items, Commitments, Financial Snapshot)
- Use when tracking owner + deadline + item together
- Keep columns minimal — max 4
- Prefill with standard row headers where relevant (e.g., "Them / Us" for vendor commitments)

**Reflective/private sections** (My Read, Core Struggles, A Layer Deeper)
- Reserved for personal templates
- Written in first person, emotionally honest tone
- No clinical framing, no generic affirmations
- Should feel like a journal entry, not a report

**Transcript section** (always last, after `---`)
- Always titled `### Refined Transcript`
- Instruction: compress to ~20-30% of original, preserve speaker attribution, keep real quotes
- For personal/therapy: first-person narrative, no "I said / I mentioned" framing

---

## Personal template conventions

All personal templates (07–11) must:
- Begin with: `Before generating, read: personal/context/general/personal-context.md`
- Use first person ("I feel...", "I notice...", "I fear...")
- Write as if journaling — warm, specific, no AI-sounding language
- Reference Niki's actual life details (Juan, TMS, grandfather, Costa Rica) where relevant
- Include at least one section that digs into emotional subtext, not just surface events

**Therapy templates specifically:**
- Individual: therapist is **Carolyn Jasculca** (ongoing). Couples: **Cheryl** (Gottman method)
- `[AI Notetaker Summary]` goes at the very bottom, after the refined transcript, if notes are non-empty

---

## Work template conventions

All work templates (01–06) must:
- Use "we" framing for internal meetings
- Lead with decisions and action items — executives skim, they don't read
- Capture who said what when it matters politically
- Include at minimum: Key Decisions/Takeaways + Action Items + one section that captures subtext or internal read
- `🔒 My Read` or equivalent private section is encouraged — where Niki captures what wasn't said, dynamics she observed, risks she's holding

---

## The test for a good template

Ask: if Claude only had 3 bullet points of raw notes and ran this template, would the output still be useful? If the template depends entirely on having a full transcript to produce anything meaningful, it's too thin. Good templates produce useful structure even from sparse data.

---

## Inspiration sources

When researching template improvements:
- **Notion**: Best for structured work templates (1:1s, sprint retros, all-hands)
- **Granola**: Best for personal/emotional meeting formats (therapy, coaching)
- **Fellow**: Best for manager/1:1 and performance conversation templates
- **Fireflies.ai**: Good for external vendor and sales call templates
- **Therapist note formats (SOAP, DAP, BIRP)**: Useful structural models for therapy templates even if the labels change
