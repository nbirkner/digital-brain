---
name: log
description: "Use when ending a work session — Niki says 'done for today', 'wrapping up', 'that's it', 'logging off', 'end of day', 'I'm done', 'closing up', or context is approaching limits. Also triggers on the /log command. DO NOT trigger mid-session unless explicitly invoked."
user_invocable: true
model: haiku
---

# Log Work

Log session entries to the correct file based on domain. **Always use the Edit or Write tool to APPEND — never overwrite existing content. Read the file first, then append the new entry at the bottom. If the file doesn't exist, create it with `# Log: Month D, YYYY` as the header first (e.g. `# Log: April 7, 2026` — always human-readable month name, no leading zero on day).**

## File routing

| Domain | File |
|--------|------|
| Work — anything Together AI related | `work/docs/logs/YYYY-MM/YYYY-MM-DD.md` |
| Personal — everything else | `personal/docs/logs/YYYY-MM/YYYY-MM-DD.md` |

If a session has both work and personal content, write two separate entries — one to each file.

## Entry format

```markdown
## [short title]

**What:** [1-2 sentences — what was done, with file paths]
**Initiative(s):** [project name(s)]
**Done:**
- [bullet per output — include file paths for created/edited docs]

**Next:** [omit this section entirely if nothing is mid-flight]
- [ ] ...

---
```

Confirm both file paths to the user when done.
