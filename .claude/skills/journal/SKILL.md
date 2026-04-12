---
name: journal
description: Create a personal journal/reflection entry in Notion. Use when the user says "journal", "I want to reflect", "write this down", "how am I feeling about X", or explicitly invokes /journal.
triggers:
  - /journal
  - journal
  - I want to reflect
  - write this down
  - how am I feeling
---

# Journal

Create a personal reflection entry in Notion (Personal Reflections DB). Notion is the source of truth — no repo file needed.

## Steps

1. **Get content** — if the user invoked `/journal` with no args or said something vague like "I want to journal," ask: "What do you want to reflect on?" Wait for their response before continuing.

   If they gave a topic or content already, use it directly.

2. **Determine title** — derive a short, specific title from the content (5-8 words, not generic). Examples:
   - "Thoughts on the ECP meeting today"
   - "Feeling behind on Q2 planning"
   - "Why the ACH decision felt hard"

3. **Draft the entry** — write the journal content in first person, honest and direct. Mirror the user's tone. If they gave raw thoughts, shape them into a coherent reflection (don't sanitize — preserve the emotional truth). Aim for 150-400 words unless they want more.

4. **Create the Notion page** — run via Bash:
   ```
   notion-personal create "2ce2f4d2-943e-80fd-87b4-c3235662ca34" "[title]" '{}'
   ```
   Capture the returned page ID.

5. **Append the content** — run via Bash:
   ```
   notion-personal append "[page-id]" "[entry content]"
   ```

6. **Confirm** — reply with:
   > Saved: "[title]" — [date]

   Keep it brief. Don't repeat the entry back unless asked.

## Notes

- Don't ask clarifying questions if the user gave enough context to write. Just write.
- Keep the voice human and personal — not corporate, not clinical.
- If the user shares something emotionally heavy, acknowledge it briefly before confirming the save.
- Never write to the repo. Notion is the only destination.
