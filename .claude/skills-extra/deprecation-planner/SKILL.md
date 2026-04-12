---
name: deprecation-planner
description: "Full playbook for deprecating a feature, billing model, or product behavior. Covers data segmentation (who's actually affected vs. paper affected), grandfather strategy, cutover timing, customer email, support briefing, engineering coordination, and monitoring plan. TRIGGER on: 'deprecate X', 'sunset this feature', 'remove Pay Later', 'plan the deprecation of', 'migrate users off', 'phase out', 'retire this feature'. DO NOT TRIGGER for general product decisions — use decision-doc instead."
user-invocable: true
---

# Deprecation Planner

The hardest part of a deprecation is not the engineering — it's understanding who's actually affected vs. who's technically affected, building the right grandfather strategy, and communicating clearly without triggering unnecessary panic.

## Phase 1: Segment the Impact

Before anything else, pull the data. "35,000 affected orgs" is almost never the real number.

**The four segments:**

| Segment | How to identify | What to do |
|---------|----------------|------------|
| **Paper affected** | Have the feature/config but never used it | Safe to cut. No communication needed. |
| **Dormant** | Used it once, no activity in 60+ days | Low risk. Single email, no calls. |
| **Active at low volume** | Use it but rarely | Standard customer email. Monitor post-cutover. |
| **Active at meaningful volume** | Regular use, revenue impact, or SLG | Grandfather or proactive outreach required. |

**Key insight:** In most deprecations, the "real impact" segment is 1-5% of the "paper affected" count. Find it before escalating internally or setting a timeline.

**Data pull checklist:**
- [ ] How many orgs/users have this feature enabled?
- [ ] Of those, how many have used it in the last 30/60/90 days?
- [ ] Of those, how many carry an active dependency (active negative balance, live integration, etc.)?
- [ ] Are any SLG customers in the active bucket? (Always need manual review)
- [ ] Are there fraud/abuse signals in the active bucket? (Flag separately)

## Phase 2: Grandfather Strategy

**Default rule:** SLG customers are always grandfathered unless there's a legal/compliance reason to cut them. Never surprise them.

**PLG customers:** Use data to decide.

| Scenario | Recommendation |
|----------|---------------|
| <5% of paper-affected are active | Hard cutover. Email all, grandfather none. |
| 5-20% active, low volume | Grandfather the top 10% by usage, cut the rest. |
| >20% active OR meaningful revenue | Grandfather all active, cut only dormant/paper. |
| Fraud/abuse signals present | Cut fraud orgs immediately, no grandfather. |

**Grandfather mechanism options:**
- Billing override (for billing changes): set a field override in the billing system per org
- Feature flag (for product features): create a `legacy_[feature]` flag and backfill
- Contract-level (SLG): document in their contract and billing record

**Grandfather list:** Keep a CSV. Engineering runs a script to apply overrides before cutover. Verify with a dry run.

## Phase 3: Timing

**Notice period minimums:**
- Billing changes (affects charges): 7-14 days minimum. 7 days for low-impact, 14 for anything material.
- Feature removal (breaks integrations): 30 days minimum.
- Major pricing changes: 30-60 days.

**Align cutover to natural boundaries:**
- Billing changes: align with billing rollover date (e.g., 1st of month)
- Feature removal: avoid quarter-end (sales is closing deals)
- Avoid Fridays and holiday weeks

**Cutover sequence:**
1. Engineering applies grandfather overrides + dry run verification
2. Customer email goes out
3. Support briefing (same day as customer email)
4. Cutover executes at planned date/time
5. Monitoring window: 48-72 hours post-cutover

## Phase 4: Customer Email

**Who gets it:** Active + dormant segments only. Never email paper-affected orgs — it creates confusion and tickets for something that doesn't affect them.

**Email structure:**
```
Subject: [Action required / Heads up]: [Feature name] is retiring on [date]

Body:
1. What's changing (one sentence, plain language)
2. When (exact date)
3. What it means for you (impact on their account specifically, if you can personalize)
4. What to do, if anything (often: nothing)
5. Questions? [support link or reply]
```

**Tone calibration:**
- Billing changes: neutral-informational. Not apologetic. Not "exciting news."
- Feature removal: same neutral tone. Brief rationale if helpful ("We're simplifying our billing model").
- Never frame a negative change as a benefit — users can tell and it creates distrust.

**Language rules:**
- Say "retiring" not "removing" or "deleting"
- Say "updated billing" not "new charges"
- Include exact dates. Never say "soon" or "in the coming weeks."
- For billing: state exactly what the user will see (charge amount, timing)

**What NOT to include:**
- Internal rationale or business context (nobody cares)
- Technical implementation details
- Marketing language
- More than one call to action

## Phase 5: Support Briefing

Send to support **same day as customer email**, before customers start writing in.

**Briefing structure:**
```
What's happening: [one paragraph]
Go-live date: [date]
Estimated ticket volume: [low/medium/high]

Tickets you'll see:
- "[Exact quote a user might send]" → [How to respond]
- "[Another common question]" → [How to respond]
- "[Edge case question]" → Escalate to [owner]

Grandfathered orgs: [Yes/No]. If yes: [who they are, what that means]
No action needed before [date]. After [date], for any unexpected changes: check [field/flag].
```

**Cover these ticket types at minimum:**
- "Why am I being charged?" (for billing changes)
- "I didn't get an email but my [thing] changed"
- "I had [special configuration] — am I affected?"
- "Can I get an extension?"

## Phase 6: Engineering Coordination

**Pre-cutover checklist:**
- [ ] Grandfather list finalized and reviewed
- [ ] Engineering runs dry-run script in staging
- [ ] Dry-run output reviewed: no unexpected orgs in the cut list
- [ ] Customer email copy approved
- [ ] Support briefed
- [ ] Rollback plan documented (can we un-cut if something goes wrong?)

**Rollback criteria:** Define upfront when you'd roll back.
- Billing: >X% of expected tickets = stop and investigate
- Feature: critical integration breaking for grandfathered customer = pause
- Fraud trigger: unexpected spike in abuse = immediate pause

**Post-cutover monitoring window:** 48-72 hours. Check:
- Support ticket volume vs. baseline
- Revenue impact (did billing settle as expected?)
- Error rates (any system errors from the removal?)

## Anti-Patterns

**NEVER do these:**
- Email all 35K "paper affected" orgs — creates tickets for users with zero actual impact
- Cut SLG customers without a conversation
- Set a cutover date before you have the grandfather list built
- Launch the customer email and the cutover on the same day
- Call it "an improvement" when it's removing a feature users rely on
- Skip the support briefing — first ticket always comes within 2 hours of the customer email

## Quick Reference

**Minimum viable deprecation:**
1. Pull segmentation data → find real impact count
2. Build grandfather list (SLG = always in)
3. Set cutover date (aligned to billing rollover or natural boundary)
4. Draft customer email (affected only, neutral tone, exact date)
5. Draft support briefing (same day as email)
6. Engineering dry run → verify overrides
7. Send email → brief support → execute cutover
8. Monitor 48-72 hours

**Context to check first:** `work/docs/decisions/` for past deprecation decisions, `work/context/general-context/stakeholder-template.md` for SLG customer identification.
