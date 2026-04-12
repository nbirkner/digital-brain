---
name: email
description: "Use when Niki wants to triage email, check inbox, process messages, or run morning email. Trigger phrases: 'check my email', 'what's in my inbox', 'triage email', 'email triage', 'any emails?', 'check inbox'. For the full morning workflow including news and priorities, use /morning instead."
disable-model-invocation: false
user-invocable: true
---

## Quick Start

**What to provide:** Nothing required. Just run it.

```
/email              → Triage last 24h (default: asks which inbox)
/email work         → Work inbox only, last 24h
/email personal     → Personal inbox only, last 24h
/email both         → Both inboxes, last 24h
```

**What you get:** Emails sorted into 3 tiers with draft offer for anything that needs a reply.

**Target time:** Under 2 minutes.

---

## Purpose

Triage your inbox fast. No reading every email, no context switching. Three tiers: reply, read, or ignore. Drafts for anything in Tier 1 are one ask away.

---

## Step 0: Check Which Account Is Connected

Before doing anything else, call `mcp__claude_ai_Gmail__gmail_get_profile` to see which Gmail account is live.

Display:
```
Gmail connected: [email address]
```

Then ask which inbox they want if not already specified (work, personal, or both).

**If the connected account is the wrong one** (e.g., they want personal but work is connected, or vice versa), say:

```
You're connected to [current email] but want [requested inbox].

To switch, run these two commands in your terminal (or paste them here with ! prefix):

  claude mcp remove "claude.ai Gmail"
  claude mcp add --transport http "claude.ai Gmail" https://gmail.mcp.claude.com/mcp

Then run `/mcp` to authenticate with the other Google account, and restart Claude Code.
Come back and run `/email [work|personal]` again once reconnected.
```

Stop here — don't proceed with triage until they've switched and confirmed.

**If the connected account matches what they want**, continue to Step 1.

---

## Step 1: Get Inputs

If no inbox specified in the command, ask:

```
Which inbox?
1. Work (Together AI)
2. Personal (Gmail)
3. Both

Time range?
1. Last 24 hours (default)
2. Last 48 hours
3. Last 7 days
```

If the user types `/email work`, `/email personal`, or `/email both`, skip asking and use that selection with 24h as the default range.

---

## Step 2: Fetch Emails

**Multi-account MCP (preferred):**
If a multi-account Gmail MCP is available with an `account` parameter, use it:
- For Work: `gmail_search_messages(account="work", query="in:inbox after:[date]")`
- For Personal: `gmail_search_messages(account="personal", query="in:inbox after:[date]")`

**Claude.ai built-in Gmail MCP (fallback):**
If only the built-in tools are available, use `mcp__claude_ai_Gmail__gmail_search_messages`.
- Note: the built-in MCP likely connects to one account. Use what's available and tell the user which account you're seeing.

**Search queries by time range:**
- Last 24h: `in:inbox after:[YYYY/MM/DD]` (yesterday's date)
- Last 48h: `in:inbox after:[YYYY/MM/DD]` (2 days ago)
- Last 7 days: `in:inbox newer_than:7d`

Read each result with `gmail_read_message` (or `mcp__claude_ai_Gmail__gmail_read_message`). Read the subject, sender, snippet, and enough of the body to classify it. You don't need to read every word — skim for intent.

---

## Step 3: Load Stakeholder Context

Before classifying, read `work/context/general-context/stakeholder-template.md` to identify key senders:
- Founders and CEO
- Direct manager
- Key cross-functional partners
- External customers or partners

Any email from a named stakeholder automatically gets elevated attention during classification.

---

## Step 4: Classify Emails

Assign each email to exactly one tier.

### Tier 1 — Reply Needed
Emails that require a response from Niki specifically. Include:
- Direct questions addressed to Niki
- Requests for approval or sign-off
- Decisions waiting on Niki
- External partners or customers waiting for a response
- Anything from key stakeholders (from the stakeholder profiles) that isn't purely FYI
- Meeting requests that haven't been accepted/declined

### Tier 2 — Read
Emails worth skimming but no reply needed. Include:
- FYI loops and CC'd threads where Niki isn't the DRI
- Newsletters and industry digests (note: `/news` processes these separately)
- Team announcements
- Meeting notes or summaries sent after the fact
- Automated reports with useful data

### Tier 3 — Archive
Pure noise. No action, no reading needed. Include:
- Marketing emails
- Automated system notifications (GitHub PRs you're not on, calendar auto-invites, billing receipts)
- Social media notifications
- Newsletters already covered by `/news`
- Promotional emails

---

## Step 5: Generate Triage Output

Assign every email a letter label (A, B, C...) sequentially across all tiers. Display all emails — no email is skipped or collapsed into a count.

```
## Inbox Triage — [Day, Month DD], [account(s)]

### Reply Needed
A. [Sender Name] — [1-line: what they want/need from Niki]
B. [Sender Name] — [1-line summary]

### Read
C. [Sender Name] — [1-line summary]
D. [Sender Name] — [1-line summary]

### Archive (suggested)
E. [Sender Name] — [1-line: what it is]
F. [Sender Name] — [1-line: what it is]
```

Every email gets a label and a one-liner. No exceptions. Tier 3 emails get brief but real summaries (e.g. "Apple Card — monthly statement", "Nextdoor — neighborhood Chinese food post").

If zero Reply Needed: say "Inbox is clear — nothing needs a reply."

---

## Step 6: Action Prompts

Immediately after the triage list, show this block:

```
---
**What would you like me to do?**

📥 **Archive** — which letters? I'll generate a Gmail search URL to bulk-select them
↩️ **Draft a reply** — which letters?
💾 **Save draft to Gmail** — I'll write it and save it ready to send

Just reply with the action and letters, e.g: "archive Q R S, draft A"
You can combine actions in one message.
```

**Processing responses:**

**Archive requests:**
The Gmail MCP is read-only — it can't modify labels. Instead, generate a Gmail search URL covering the requested senders and give it to Niki to open and bulk-archive in one click.

To build the URL:
1. Look up the `From:` address for each requested letter
2. Extract sender domains (e.g. `nextdoor.com`, `circleback.ai`)
3. Build a search query: `from:(domain1 OR domain2 OR ...) newer_than:7d`
4. URL-encode it and prepend `https://mail.google.com/mail/u/0/#search/`
5. Present as: "Open this in Gmail → select all → Archive:"

Note any senders that share a domain with emails the user wants to keep — flag those as "archive manually" with a subject-specific search instead.

**Draft reply:**
Write the reply inline, then ask "Want me to save this to Gmail drafts?"

**Save to Gmail:** use `mcp__claude_ai_Gmail__gmail_create_draft`

Confirm after, e.g.: "Here's the archive link (covers Q–AW minus AU/AI/AH). Here's a draft for B:"

**Draft voice rules:**
- Direct and warm. No corporate jargon.
- Contractions are fine (I'll, we're, that's).
- Vary sentence length. No em dashes.
- Don't open with "Hope this finds you well" or any filler.
- Match formality to the relationship.
- End with a clear next step when needed.

---

## MCP Fallback

If no Gmail MCP is available at all:
```
I don't have Gmail access right now. You can:
1. Forward me specific emails to review
2. Paste the email text here and I'll classify + draft a reply
3. Connect Gmail: run /connect-mcps connect to gmail
```

---

## Integration with Other Skills

- `/morning` — runs email triage as part of the full morning workflow
- `/news` — processes newsletters separately (they'll show as Tier 2 or Tier 3 here)
- `/daily-plan` — surfaces important email context in your daily plan

---

## Tips

- Run this before your first meeting, not after — catch anything that needs a response before the day gets away.
- Tier 1 doesn't mean "reply immediately." It means "this needs you." You pick the timing.
- If someone's email keeps landing in Tier 2 and you never read them, that's a signal to unsubscribe.
