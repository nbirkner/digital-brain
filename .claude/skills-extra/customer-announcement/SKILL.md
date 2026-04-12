---
name: customer-announcement
description: "Draft external customer-facing announcements for product launches, billing changes, deprecations, policy updates, or new features. TRIGGER on: 'write customer email', 'draft announcement', 'customer comms', 'email affected users', 'announce this to customers', 'write the launch email', 'customer-facing comms for'. DO NOT TRIGGER for: internal Slack messages (use /slack-message), stakeholder updates (use /status-update), support team briefings (use /deprecation-planner)."
user-invocable: true
---

# Customer Announcement

The goal is a single email (or changelog entry) that a real person reads in 30 seconds and immediately knows: what changed, does it affect me, what do I need to do. Nothing else.

## First: Pick the Right Audience

**Common mistake:** Emailing all users when only a subset is affected. Match distribution to impact.

| Change type | Who to email |
|-------------|-------------|
| Billing change | Only orgs with the affected billing config |
| Feature removal | Only users who have used the feature |
| New feature | All users OR targeted segment by usage/tier |
| Policy update | Everyone if legal/compliance requires it; otherwise affected only |
| Product launch | Depends on access model (waitlist → waitlist only; GA → all) |

## Email Structure

**Subject line formula:**
- Negative/neutral change: `[Product area]: [What's changing] on [date]`
  - "API pricing: token pricing update on May 1"
  - "Billing: Pay Later is retiring on April 1"
- Positive change: `[Product area] update: [What's new]`
  - "New: Instant Clusters now available for all users"
- Action required: Lead with that
  - "Action required: update your API key format by March 15"

**Never:** Clickbait subject lines. "Exciting news about your account" is the fastest way to get ignored.

---

**Body structure (4 elements, in order):**

**1. What's changing** (1-2 sentences, plain language)
State the fact. No framing, no spin.

> "Starting April 1, Pay Later billing is being retired. All accounts will move to prepaid billing."

> "We're updating our token pricing for MiniMax models effective May 1."

**2. What it means for you** (personalized if possible, otherwise generic)
The user's actual impact — not the internal reason.

> "Your account currently has a -$47 balance. This will be charged at your next billing rollover (April 1)."

> "Your current API usage will not change. New pricing applies to new requests after May 1."

**3. What to do** (often: nothing)
Be explicit. If they don't need to do anything, say so.

> "No action needed. Your account will be updated automatically."

> "If you have integrations using the legacy endpoint, update them to [new endpoint] before March 15."

**4. Questions** (one line)
Simple support CTA. No paragraph.

> "Questions? [help.together.ai/pay-later](support link) or reply to this email."

---

## Tone Calibration

**Billing changes (neutral-informational):**
- State facts plainly. No excitement. No excessive apology.
- Avoid: "We're thrilled to announce...", "We're so sorry for any inconvenience..."
- Use: "Starting [date], [thing] is changing. Here's what that means for you."

**Feature launches (warm but not hype):**
- One line of genuine excitement is fine. Then get to the facts.
- Avoid: three paragraphs of vision before the actual feature description
- Use: "You can now [do specific thing]. Here's how to get started."

**Deprecations (matter-of-fact):**
- Don't apologize for the decision, but do acknowledge the disruption if it's meaningful
- Brief rationale is fine if it adds trust ("We're simplifying our billing model")
- Never call a removal "an improvement" — users can tell

**Outages or errors (acknowledge, own, fix):**
- Lead with what happened and how it affected users
- State what was done to fix it and what's in place to prevent recurrence
- Don't over-explain or be defensive

## Length Rules

**Aim for: read in 30 seconds.**

| Email type | Word count |
|------------|-----------|
| Billing change | 80-120 words |
| Feature deprecation | 100-150 words |
| New feature launch | 100-200 words |
| Policy update | 150-250 words |

If you're over: cut the rationale first, then cut the context, then cut the background. Users want to know what changed and what to do — not why you made the decision.

## Language Rules

**Use:**
- "retiring" not "removing" or "deleting" (for deprecations)
- "updated" not "new charges" (for price increases)
- Exact dates. Never "soon" or "in the coming weeks."
- Plain words. If a 10-year-old can't read it, simplify.

**Never use:**
- "leverage" / "utilize" / "unlock" / "streamline"
- "we're excited to share that"
- "rest assured" / "please be advised"
- Passive voice for impact statements ("your account will be affected" not "accounts may be affected by this change")
- More than one call to action per email

## Anti-Patterns

**NEVER do these:**
- Start with company/team context before user impact ("At Together AI, we believe in...")
- Include internal rationale users don't care about
- Send to all users when only 2% are affected
- Announce a pricing increase as a "new feature" or "improvement"
- Include 5 links — pick one
- Write a novel — if you need >200 words, something is wrong with your framing

## Changelog Format (if writing a changelog entry)

```
### [Date] — [Feature/Change name]

**What changed:** [One sentence]
**Why:** [Optional — only include if it builds trust or answers an obvious question]
**What to do:** [Action required] OR [No action needed]
[Link to docs]
```

## Context to check first

Before drafting, read:
- The relevant decision doc in `work/docs/decisions/` (for context on the change)
- `work/context/writing-style/writing-style-external.md` (if exists, for brand voice)
- Recent customer emails in `work/docs/comms/` (to match established tone)
