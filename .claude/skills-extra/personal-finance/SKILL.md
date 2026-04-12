---
name: personal-finance
description: "Use for personal financial management. Three modes: 'snapshot' for a quick net worth + spending check, 'review' for a monthly deeper review, 'decide [question]' for a specific financial decision. Trigger phrases: 'run a financial snapshot', 'how am I doing financially', 'monthly money review', 'should I [financial question]', 'can I afford X', 'what should I do about my 401k', '/personal-finance'."
user_invocable: true
---

# /personal-finance

Three modes. Use them independently or chain them (snapshot → review → decide).

- `/personal-finance snapshot` — quick current state: balances, recent spend, anomalies
- `/personal-finance review` — monthly deeper look: spending trends, savings rate, investment performance, action items
- `/personal-finance decide [question]` — specific financial decision with a clear recommendation

**Data source:** `mmoney` CLI (Monarch Money) via `personal/docs/finances/snapshot.py`
**Output directory:** `personal/docs/finances/`
**Decisions log:** `personal/docs/finances/decisions/`
**Financial Zen notes:** `personal/notes/` (search for "Financial_Zen", "Jazo", "Birkner.*Jazo")

**Niki's financial context (always load before any mode):**
- **Income:** Salary at Together AI + ISO stock options (complex equity situation; vesting schedule, AMT exposure, 409A valuation matter)
- **Accounts:** Roth IRA, 401k, checking/savings, brokerage (check Monarch for current state)
- **Insurance:** Disability insurance in place
- **Advisor:** Rick Valenzi / Jazo at Financial Zen — monthly sessions. Route anything involving ISOs, AMT, Roth conversion tax strategy, or estate planning to Rick first.
- **Location:** SF — high cost of living, California tax rates apply (no capital gains preference at state level)
- **Household:** Lives with Juan (partner); shared expenses but separate finances tracked in Monarch

---

## Mode 1: `/personal-finance snapshot`

**When to use:** Quick check-in — monthly or whenever curious.

### Step 1: Run the snapshot script

```bash
python3 personal/docs/finances/snapshot.py --save
```

This handles all mmoney commands, account classification, budget vs actual with category names, and anomaly detection. Output is the full snapshot markdown.

**mmoney gotchas (verified April 2026):**
- No `--format` flag on any command. Output is flat `key=value` blocks separated by `---`.
- Cashflow details returns a `byCategory=[JSON]` line — parse line by line, not as whole file.
- Auth check: `mmoney auth status` → should say `Authenticated (keychain)`. If not, Niki must run `mmoney auth login` interactively.
- Account classification config is at the top of `snapshot.py` — update `NIKI_ACCOUNT_FRAGMENTS` etc. when accounts change.

### Step 2: Check for recent Financial Zen notes

Search for FZ meeting notes from the past 30 days:

```bash
find personal/notes -name "*.md" -newer personal/docs/finances/$(ls personal/docs/finances/ | grep snapshot | tail -2 | head -1) | xargs grep -l -i "financial.zen\|jazo\|rick valenzi" 2>/dev/null
```

Or by date: look in `personal/notes/YYYY-MM/` for the current and prior month for files matching `*Financial_Zen*` or `*Jazo*`.

If a FZ note exists from the past 30 days, read it and extract:
- Action items Rick/Jazo gave
- Topics discussed (ISOs, tax strategy, account changes, etc.)
- Anything flagged as "do before next session"

Surface these in the snapshot under a **Financial Zen** section.

### Step 3: Present and save

Print the script output plus the FZ section. If a prior snapshot exists, show month-over-month delta on net worth and savings rate at the top.

### Step 4: Confirm

```
Snapshot saved to personal/docs/finances/YYYY-MM-snapshot.md.

[Most important anomaly in one sentence, or "Looks clean."]
[If FZ notes found]: FZ note from [date] referenced — [one-line summary of key action item].
```

---

## Mode 2: `/personal-finance review`

**When to use:** Once a month, ideally before or after Financial Zen session with Rick.

### Step 1: Pull data

Run the snapshot script plus check holdings:

```bash
python3 personal/docs/finances/snapshot.py
mmoney holdings snapshots
```

Also check the most recent snapshot at `personal/docs/finances/YYYY-MM-snapshot.md` for prior context.

### Step 2: Check Financial Zen notes

Same as snapshot Step 2 — search `personal/notes/` for any FZ notes in the past 30 days. For the review, also look back 60 days to catch any that were missed.

If found, read in full. Pull out:
- Open action items (did Niki follow through?)
- Recurring themes across multiple sessions
- Anything Rick flagged that hasn't been addressed yet

### Step 3: Ask one question

```
Quick question before I pull this together: anything specific coming up financially?
(e.g., big purchase, thinking about ISO exercise, real estate decision, change in income)

[Or just say "no" to skip]
```

### Step 4: Generate the review

```markdown
## Monthly Financial Review — [Month YYYY]

### The numbers

| | This month | Last month | Change |
|--|--|--|--|
| Net worth | $X | $X | +/-$X |
| Cash | $X | $X | +/-$X |
| Monthly spend | $X | $X | +/-$X |
| Savings rate | X% | X% | +/- X pts |

### Spending breakdown

Top 5 categories this month vs last month. Flag anything that shifted >15%.

### Investments

- **Roth IRA:** $X (change: +/-$X)
- **401k:** $X (change: +/-$X)
- **Brokerage:** $X (change: +/-$X)

Don't analyze investment performance in depth — that's Rick's territory. Just report the numbers.

### Financial Zen

[If FZ notes found in past 30-60 days]
- **Last session:** [date]
- **Open action items:** [list from notes]
- **What to bring to next session:** [anything from the financial data that Rick should know about]

[If no FZ notes found]: No session notes found in the past 60 days.

### ISOs / equity

Don't speculate on ISO value. Note: "ISO situation unchanged — next Financial Zen session is the right time to revisit if anything has changed."

### Action items

Max 3. Be specific:
- "Transfer $X to Roth IRA — you have room for this contribution year"
- "Review [category] spend — it's up $X MoM for the second month in a row"
- "Bring [specific question] to Rick at next Financial Zen session"
```

### Step 5: Save and confirm

Save to `personal/docs/finances/YYYY-MM-review.md`.

```
Review saved to personal/docs/finances/YYYY-MM-review.md.
[N] action items above. Anything you want to dig into?
```

---

## Mode 3: `/personal-finance decide [question]`

**When to use:** Specific financial decision. "Can I afford X?" "Should I do a Roth conversion?" "How much to put in 401k?" "Exercise some ISOs?"

### Step 1: Classify the question

| Type | Route |
|------|-------|
| ISO exercise, AMT exposure, Roth conversion tax strategy, estate planning | **Flag for Rick** |
| 401k contribution amount, normal spending decision, emergency fund sizing, whether to buy something | **Decide directly** |
| Real estate (buy vs rent, refinance, HELOC) | **Flag for Rick** if significant leverage/tax implications; decide directly for smaller questions |
| Budget / cash flow question | **Decide directly** |

### Step 2: Pull context

```bash
python3 personal/docs/finances/snapshot.py   # current balances + cashflow
```

Also check `personal/docs/finances/` for the most recent review file, and search `personal/notes/` for recent FZ notes that might be relevant to the question.

### Step 3: Answer

```markdown
## Decision: [Restated question]

**Recommendation:** [Clear answer. "Yes." "No." "Not yet — here's why." Never "it depends" without follow-up.]

**Why:**
[2-4 bullets. Numbers where possible.]

**What you'd need to be true for a different answer:**
[1-2 conditions.]

**Rick territory?** [Yes / No]
[If yes: "Bring this to Financial Zen before acting — specifically the [ISO/AMT/tax] piece."]
[If no: "You can make this call."]
```

### Step 4: Save notable decisions

Save to `personal/docs/finances/decisions/YYYY-MM-DD-[slug].md` when the decision involves $5K+, is an ISO/equity question, or is worth tracking over time.

```markdown
## [Decision title]

**Date:** YYYY-MM-DD
**Question:** [What was asked]
**Recommendation:** [What was recommended]
**Rationale:** [2-4 bullets]
**Referred to Rick?** [Yes / No]
**Outcome:** [Leave blank — fill in later]
```

---

## Style rules

- **Lead with the number or the answer.** Never open with context or caveats.
- **Short by default.** Snapshot is a glance. Review is a page.
- **Say it directly.** "You spent $800 more on dining" beats "dining spend increased."
- **Rick owns tax strategy and equity.** Don't speculate on ISO valuation, AMT, or Roth conversion math.
- **Never use em dashes.** Commas, periods, or parentheses instead.
- **No jargon.** "Cash on hand" not "liquid reserves."

---

## Integration

**Feeds from:**
- `personal/docs/finances/snapshot.py` (mmoney CLI wrapper)
- `personal/notes/` (Financial Zen session notes)
- `personal/docs/finances/` (prior snapshots, reviews, decisions)

**Feeds into:**
- Financial Zen sessions with Rick (review output is good prep material)
- `/decision-doc` for financial decisions tied to work/compensation (e.g., ISO exercise)
- `personal/docs/finances/decisions/` as a running decision log
