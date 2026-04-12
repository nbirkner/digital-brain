---
name: decision-doc
description: "Use when you've made a significant product decision and need to document the reasoning, alternatives considered, and trade-offs for future reference or stakeholder alignment. Trigger phrases: 'document this decision', 'write up the rationale for X', 'we decided to Y, need to capture why', 'I need a decision log', 'stakeholders are questioning why we chose X'. Also use before a decision meeting to force-structure the options, or after a contentious debate that got resolved."
disable-model-invocation: false
user-invocable: true
---

# /decision-doc - Document Strategic Decisions That Stick

When the PM types `/decision-doc`, start with context gathering before reading files or generating content.

## Step 0: Context Gathering

Use the **AskUserQuestion tool** to ask:

**Question 1:** "What's the status of this decision?"
Options: ["Already made — documenting it", "Need to make — exploring options", "Presenting for approval"]
Type: single-select buttons

**Question 2:** "Who's the primary audience for this doc?"
Options: ["My team", "Executives", "Cross-functional partners", "Mixed / All of the above"]
Type: single-select buttons

Use the answers to adapt:
- "Already made" → skip options exploration, go straight to rationale and implementation
- "Need to make" → run the full options framework with trade-offs
- "Presenting for approval" → lead with recommendation and TL;DR, use exec-friendly format
- Executive audience → use the shorter format with clear TL;DR and explicit ask

---

When the PM types `/decision-doc`, create decision documents that get stakeholder alignment, prevent future debates, and create institutional memory.

## When to Use

- Making a significant product direction choice
- Evaluating build vs. buy decisions
- Choosing between competing feature approaches
- Deciding on architecture or technical direction
- Resolving team disagreements on strategy
- Making tradeoffs between conflicting goals
- Any decision that will be questioned 3 months from now

---

## How It Works

This is a 4-step process:

### Step 1: Frame the Decision
### Step 2: Present Options with Tradeoffs
### Step 3: Make a Recommendation
### Step 4: Document the Decision

---

## Step 1: Frame the Decision

When the PM types `/decision-doc`, I'll start with:

```
Let's document this decision so it sticks.

**What decision are you making?**

Frame it as a clear choice:
- "Should we build feature X in-house or integrate with Partner Y?"
- "Should we launch with A/B test or full rollout?"
- "Should we prioritize mobile app or web improvements in Q2?"

**Why does this decision matter?**
- What's the impact if we get it right?
- What's the cost if we get it wrong?
- Who else needs to be involved?

**What's your timeline?**
- When do you need to decide?
- What forces the decision? (deadline, customer commitment, etc.)
- What happens if we delay?

Tell me about the decision and I'll help structure the document.
```

---

## Step 0.5: Auto-Challenge the Frame (Proactive)

**Before proceeding to options, automatically dispatch `@skeptic` to challenge whether this is the right decision to make.**

Skeptic's challenge prompts (ask these before presenting options):
1. Is this truly a binary choice, or is there a third path being ignored?
2. Who else should be making this decision — is this ours to make?
3. What would change your mind about the decision frame itself?
4. Is there an assumption baked into how this is framed that we haven't questioned?

**Show the skeptic's questions first.** Let the PM respond before moving to options. This often surfaces a better decision frame or reveals the decision doesn't actually need to be made.

---

### What Makes a Good Decision to Document

**Do document:**
- ✅ Decisions with significant resource commitment
- ✅ Decisions with long-term consequences
- ✅ Decisions where reasonable people disagree
- ✅ Decisions that will be questioned later
- ✅ Decisions that set precedent for future choices
- ✅ Decisions involving multiple stakeholders

**Don't document:**
- ❌ Trivial tactical choices
- ❌ Decisions that can be easily reversed
- ❌ Decisions only affecting one person
- ❌ Decisions that are obvious/uncontroversial

---

## Step 2: Present Options with Tradeoffs

Once I understand the decision:

```
Great. Now let's map out your options.

**How many options are you considering?**
(Usually 2-4 options. More than 4 means you need to narrow first)

For each option, I need to understand:
- What it is (clear description)
- Why it's appealing (upsides)
- Why it's risky (downsides)
- What it costs (time, money, opportunity cost)
- What assumptions it requires

You can either:
- Tell me about each option
- Upload analysis you've already done
- Let me help you brainstorm options you might have missed

I'll structure this into a clear comparison framework.
```

### The Options Framework

For each option, I'll create:

```markdown
## Option [1/2/3]: [Name of Option]

### Description
[Clear, jargon-free explanation of what this option means]

**One-sentence summary:** [What this is in plain language]

### Pros (Why This Could Work)
- **[Pro 1]:** [Explanation and impact]
- **[Pro 2]:** [Explanation and impact]
- **[Pro 3]:** [Explanation and impact]

### Cons (Why This Could Fail)
- **[Con 1]:** [Explanation and risk]
- **[Con 2]:** [Explanation and risk]
- **[Con 3]:** [Explanation and risk]

### Costs & Resources Required
**Engineering:** [X weeks/people]
**Design:** [X weeks/people]
**Other Teams:** [Who else needs to be involved]
**Timeline:** [How long until we see results]
**Budget:** [Any direct costs - tools, services, licenses]

### Key Assumptions
[What needs to be true for this to work]

**Example assumptions:**
- "Assumes customers will adopt new workflow within 30 days"
- "Assumes partner API is stable and well-documented"
- "Assumes we can hire 2 senior engineers by Q2"

### Success Criteria
[How we'll know this option worked]

**Example criteria:**
- "Adoption >60% within first month"
- "Implementation completed in <8 weeks"
- "No degradation in core metrics"

### Risks & Mitigation
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk 1] | High/Med/Low | High/Med/Low | [How we'd address it] |
| [Risk 2] | High/Med/Low | High/Med/Low | [How we'd address it] |

### Dependencies
- [Other team/project that must happen first]
- [External factor we can't control]
- [Technical prerequisite]

### Example: Mobile App vs Web

**Option 1: Build Native Mobile App**
- **Pro:** Better performance, offline support, push notifications
- **Con:** 6 month build time, need to hire mobile engineers, maintenance overhead
- **Cost:** 2 iOS engineers + 2 Android engineers for 6 months ($500K+)
- **Assumption:** 40% of usage will shift to mobile within 6 months
- **Risk:** Mobile engineers are hard to hire, could delay 3+ months
```

---

## Step 3: Make a Recommendation

After laying out options:

```
You've mapped the options clearly. Now it's time to make a call.

**What's your recommendation?**

Remember: The goal isn't to make everyone happy. It's to make the right 
decision for the business and clearly explain why.

A strong recommendation includes:
- **The choice:** Which option you're choosing
- **The why:** Your reasoning (data + logic)
- **The confidence level:** How certain you are (high/medium/low)
- **The failure mode:** What you'd do if you're wrong

Don't hedge. Make a clear call, even if you're not 100% certain.

I'll help you structure a compelling recommendation.
```

### Recommendation Structure

```markdown
## Recommendation: [Option Name]

### The Decision
I recommend we **[clear statement of choice]**.

**Example:** "I recommend we build a native mobile app starting Q2, 
rather than continuing to improve the mobile web experience."

### Rationale

**Why this option wins:**
1. **[Primary reason]** - [Data or logic supporting this]
2. **[Secondary reason]** - [Data or logic supporting this]
3. **[Tertiary reason]** - [Data or logic supporting this]

**Why alternatives fall short:**
- **[Alternative 1]** - [Specific reason it's not as good]
- **[Alternative 2]** - [Specific reason it's not as good]

**Key tradeoffs we're accepting:**
- We're trading [X] for [Y] because [reason]
- We're deprioritizing [A] to focus on [B] because [reason]

**Example:**
- We're trading faster time-to-market for better performance because 
  our user research shows performance is the #1 complaint
- We're deprioritizing web improvements to focus on mobile because 
  45% of usage is now mobile and growing 15% QoQ

### Confidence Level

**Confidence:** [High / Medium / Low]

**What would increase confidence:**
- [Test/data that would make you more certain]
- [Validation that's still needed]

**Example:**
- **Confidence:** Medium-High (75%)
- **Would increase to High if:** We validate mobile engineers can be 
  hired within 6 weeks, and tech lead confirms 6-month timeline is realistic

### What If We're Wrong?

**How we'll know:**
- [Leading indicator that this isn't working]
- [Timeline for when we should see results]

**Pivot plan:**
- [What we'd do if this fails]
- [How easily we could reverse course]

**Example:**
- **How we'll know:** If after 2 months we haven't hired mobile engineers, 
  or if recruitment timeline slips past 12 weeks
- **Pivot plan:** Pause mobile app, redirect resources to mobile web 
  improvements as interim solution

### What This Unlocks

**Positive outcomes if we're right:**
- [Business impact]
- [User impact]
- [Strategic advantage]

**Example:**
- Unlock 45% of our user base who prefer native apps
- Enable offline mode, which is #2 feature request
- Position us competitively against Competitor X who just launched mobile
```

---

## Step 3b: Pre-Commit Risk Gate

**Before finalizing the recommendation, dispatch these agents in parallel to catch blockers:**

- **@legal-advisor** — Any compliance, IP, contract, or regulatory risks with this decision?
- **@billing-economics-reviewer** — If the decision involves pricing, billing, or commerce: revenue implications?
- **@cross-team-dependency-reviewer** — If the decision has execution implications: coordination risks?
- **@enterprise-sales-reviewer** — If the decision affects enterprise features: deal enablement impact?

Only dispatch agents that are relevant based on the decision topic. Present any blockers found before saving the decision doc.

**This is a blocking step.** If a critical risk is surfaced, the recommendation should be updated before documenting.

---

## Step 4: Document the Decision

Finally, I'll create the complete decision document:

```
I'll create your decision document in the format that works best for 
your culture and stakeholders.

**Choose format:**
1. **Standard** - Comprehensive doc for important decisions
2. **DACI** - When you need clear roles and accountability
3. **One-Way Door** - For irreversible decisions (à la Amazon)
4. **Lightweight** - For smaller decisions that still need documentation

**Distribution:**
- Who needs to approve this?
- Who needs to be consulted?
- Who just needs to be informed?

I'll also create:
- Email/Slack summary to announce the decision
- FAQ section for common objections
- Timeline and next steps

Let's build this...
```

---

## Standard Decision Doc Template

```markdown
# Decision Document: [Decision Title]

**Date:** [Date]
**Owner:** [Your name]
**Status:** [Proposed / Approved / Implemented]
**Decision Deadline:** [When we need to decide by]

---

## TL;DR

**Decision:** [One sentence: What we're deciding]

**Recommendation:** [One sentence: What you recommend]

**Impact:** [One sentence: Why this matters]

---

## Context

### Prior Decisions (Required)

Before writing any context, search `work/docs/decisions/` for related past decisions.

**If this updates or overrides a past decision:**
- Name it: "This updates [Filename — linked]"
- State what changed: "Previously we decided X. We're changing this because Y."
- Do NOT re-explain the original rationale at length — reference the prior doc and explain only the delta.

**If this is truly new:**
- Confirm that briefly: "No prior decision on this topic found in decisions/."

This section is not optional. Future readers need to know whether this is net-new thinking or a course correction.

---

### Why We're Making This Decision

[Background and situation that created the need for this decision]

**What triggered this:**
- [Event/data/feedback that forced the decision]

**Current state:**
- [Where things stand today]
- [What's not working]
- [What's at stake]

**Example:**
- **Trigger:** 45% of our traffic is now from mobile devices, up from 25% 
  a year ago
- **Current state:** Mobile web experience has 35% bounce rate vs. 18% on 
  desktop
- **At stake:** Losing 2,000+ potential users per month due to poor mobile 
  experience

### Scope

**In scope:**
- [What this decision covers]

**Out of scope:**
- [What this decision does NOT cover]
- [Related decisions that will be made separately]

**Example:**
- **In scope:** Whether to build native iOS/Android apps
- **Out of scope:** Specific features for v1 (separate PRD), launch timing 
  (separate decision)

### Constraints

**Technical:**
- [Technology limitations]

**Resource:**
- [Budget/people limitations]

**Timeline:**
- [Time constraints]

**Business:**
- [Strategic or market constraints]

---

## Options Considered

[Full breakdown of each option using the framework from Step 2]

### Option 1: [Name]
[Complete analysis]

### Option 2: [Name]
[Complete analysis]

### Option 3: [Name]
[Complete analysis]

---

## Decision Criteria

**How we're evaluating options:**

| Criteria | Weight | Option 1 | Option 2 | Option 3 |
|----------|--------|----------|----------|----------|
| [Criterion 1] | High | 8/10 | 5/10 | 6/10 |
| [Criterion 2] | High | 6/10 | 9/10 | 7/10 |
| [Criterion 3] | Medium | 7/10 | 7/10 | 9/10 |
| **Total** | | **XXX** | **XXX** | **XXX** |

**Criteria definitions:**
- **[Criterion 1]:** [What this means and why it matters]
- **[Criterion 2]:** [What this means and why it matters]

**Example Criteria:**
- **User Impact** (High): How much this improves core user experience
- **Time to Value** (High): How quickly we can ship and see results
- **Resource Efficiency** (Medium): How efficiently this uses our limited resources
- **Strategic Alignment** (Medium): How well this supports our Q2 strategy

---

## Recommendation

[Complete recommendation using the framework from Step 3]

---

## Stakeholder Input

### Consulted

**Engineering:**
- [Name]: [Their input/concerns]
- [Name]: [Their input/concerns]

**Design:**
- [Name]: [Their input/concerns]

**Leadership:**
- [Name]: [Their input/concerns]

### Key Concerns Raised

**Concern 1:** [Stakeholder concern]
**Response:** [How you're addressing it]

**Concern 2:** [Stakeholder concern]
**Response:** [How you're addressing it]

### Unresolved Disagreements

[If anyone strongly disagrees, document it]

**[Name] believes:** [Their position]
**My reasoning for proceeding anyway:** [Why you're still recommending this]

---

## Success Metrics

**How we'll measure success:**

**Primary Metric:**
- [Metric]: [Current] → [Target] by [Date]

**Secondary Metrics:**
- [Metric]: [Current] → [Target] by [Date]
- [Metric]: [Current] → [Target] by [Date]

**Guardrail Metrics** (must not decline):
- [Metric]: Must stay above [threshold]
- [Metric]: Must stay above [threshold]

**Example:**
- **Primary:** Mobile user retention: 45% → 65% by end of Q3
- **Secondary:** 
  - Mobile DAU: 50K → 80K by end of Q3
  - Time in app: 12 min → 20 min by end of Q3
- **Guardrails:**
  - Overall retention must stay >60%
  - NPS must stay >40

### Leading Indicators (Early Signals)

**After 1 month:**
- [What we should see]

**After 3 months:**
- [What we should see]

**Example:**
- **After 1 month:** 2 mobile engineers hired, tech stack decided
- **After 3 months:** MVP in beta with 1,000 users, NPS >45

---

## Implementation Plan

### Timeline

| Phase | Milestone | Owner | Target Date |
|-------|-----------|-------|-------------|
| Phase 1 | [Milestone] | @[Owner] | [Date] |
| Phase 2 | [Milestone] | @[Owner] | [Date] |
| Phase 3 | [Milestone] | @[Owner] | [Date] |

### Next Steps

**Immediate (This Week):**
1. [Action item] - @[Owner]
2. [Action item] - @[Owner]

**Short-term (Next 2 Weeks):**
1. [Action item] - @[Owner]
2. [Action item] - @[Owner]

**Medium-term (Next Month):**
1. [Action item] - @[Owner]

### Dependencies

**Blockers:**
- [What must happen before we start]

**Parallel Work:**
- [What can happen at the same time]

---

## Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation | Owner |
|------|--------|------------|------------|-------|
| [Risk 1] | High/Med/Low | High/Med/Low | [Plan] | @[Owner] |
| [Risk 2] | High/Med/Low | High/Med/Low | [Plan] | @[Owner] |

---

## Decision Log

**Proposed:** [Date] by [Name]
**Discussed:** [Date] in [Meeting/Channel]
**Approved:** [Date] by [Name]
**Implemented:** [Date]
**Reviewed:** [Date] - [Outcome]

---

## Appendix

### Supporting Data
- [Link to research]
- [Link to analysis]
- [Link to competitive intel]

### References
- [Related PRDs]
- [Related decisions]
- [Research documents]

### FAQ

**Q: [Common question]**
A: [Answer]

**Q: [Common question]**
A: [Answer]
```

---

## Alternative Formats

### DACI Format (When You Need Clear Roles)

```markdown
# DACI: [Decision Title]

## Roles

**Driver (owns the decision):** @[Name]
**Approver (makes the final call):** @[Name]
**Contributors (provide input):** @[Name], @[Name], @[Name]
**Informed (need to know outcome):** @[Name], @[Name]

## Decision
[What we're deciding]

## Recommendation
[Driver's recommendation]

## Context & Options
[Summary of situation and options]

## Approval Status
- [ ] Approver has reviewed
- [ ] Approver approves recommendation
- [ ] Decision communicated to Informed group
- [ ] Implementation started

**Date Approved:** [Date]
**Approver Comments:** [Any caveats or conditions]
```

### One-Way Door Format (For Irreversible Decisions)

```markdown
# One-Way Door Decision: [Title]

**Type:** ONE-WAY DOOR (Hard to reverse)

## Why This Is One-Way

[Explanation of why this decision is hard or impossible to reverse]

**Examples:**
- Architecture choices that lock us into a tech stack
- Partnerships with long-term contracts
- Decisions that create customer expectations
- Resource commitments that can't be unwound

## Extra Scrutiny Required

Because this is one-way, we're applying extra rigor:

**Questions we MUST answer:**
1. [Critical question 1]
2. [Critical question 2]
3. [Critical question 3]

**Validation we MUST do before deciding:**
- [Proof point 1]
- [Proof point 2]
- [Proof point 3]

**Dissenting voices we MUST hear from:**
- [Skeptic 1]: [Their concern]
- [Skeptic 2]: [Their concern]

**Example:**
- **Must answer:** Can we build this with our current team's skill set?
- **Must validate:** Talk to 3 companies who made similar decision - what 
  do they wish they knew?
- **Must hear from:** VP Eng (concerns about tech debt) and Lead Designer 
  (concerns about user impact)

## [Rest of standard decision doc]
```

### Lightweight Format (For Smaller Decisions)

```markdown
# Quick Decision: [Title]

**Date:** [Date]
**Owner:** [Name]

## The Decision
[What we're deciding in 1-2 sentences]

## Options
1. **[Option A]:** [Pro/Con in one line each]
2. **[Option B]:** [Pro/Con in one line each]

## Recommendation
**Go with [Option X]** because [one sentence reasoning].

## Next Steps
- [Action 1] - @[Owner] - [Date]
- [Action 2] - @[Owner] - [Date]

## How We'll Know It Worked
[One metric or signal]
```

---

## Decision Rigor by Type: How Much Is Enough?

Not every decision needs a 10-page doc. Match your rigor to the decision's reversibility and blast radius.

**Lightweight doc (use the Quick Decision format):**
- Reversible within a sprint if wrong
- Affects one team or one surface
- Low ambiguity -- most people would make the same call
- Example: which error message copy to use, which endpoint to deprecate first

**Standard doc:**
- Takes more than a sprint to reverse (or reversal has meaningful cost)
- Affects multiple teams or external customers
- Reasonable people disagree and the doc is meant to end that disagreement
- Example: billing model for a new tier, feature flag strategy, IAM data model choice

**One-Way Door doc (maximum rigor):**
- Structural: reversal would require re-architecting or re-contracting
- External commitment: customers or partners will rely on this decision
- Precedent-setting: future decisions will anchor on this one
- Example: choosing a credit system vs seat-based pricing, multi-tenancy architecture, data residency approach

**Signs you need to upgrade your format:** Someone is relitigating a decision you already made. A new team member is confused about why the product works a certain way. You're about to make decision B and realize it depends on decision A that was never written down.

---

## Documenting the Decision You DIDN'T Make

This is the most skipped section in decision docs and the most valuable when you're reading a doc 12 months later.

**Why it matters:** When the context changes -- new competitor, new pricing, new exec -- people will want to revisit decisions. If you only documented the winner, they have to reconstruct why the alternatives were rejected, often incorrectly. They'll relitigate what was already settled.

**How to write the counterfactual well:**
- Name the alternative specifically (not "we considered other approaches" -- name them)
- Give it a fair hearing -- steel-man it. What would have to be true for this to be the right choice?
- State the specific reason it lost. Not "it didn't fit our strategy" but "it required a full data migration that would take Q2, and we couldn't delay the enterprise launch"
- Note whether the rejection is permanent or conditional: "We're not doing X now because of Y constraint. If Y changes, reopen this."

**Template for the rejected option:**

> **Option: [Name]**
> **Best case for it:** [Steel-man argument]
> **Why we didn't choose it:** [Specific, concrete reason]
> **Conditions under which we'd revisit:** [Be explicit -- "if we raise a Series B and can fund 2 more months of infra work" is better than "maybe later"]

---

## Writing a Decision That Survives Team Turnover

A good decision doc is institutional memory. It should be useful to someone who joins 18 months from now and is confused about why the product works a certain way.

**Things that make decision docs die:**
- They assume the reader knows the context (org structure, customer commitments, market conditions) that existed when the decision was made
- They use internal shorthand without defining it
- The "why we decided" section is really "what we decided" in disguise
- No timestamp on the decision log, so future readers can't calibrate how stale it is

**Things that make decision docs survive:**
- **Context snapshot:** One paragraph capturing the market/company state at time of decision. "In Q1 2026, Together AI had ~10K MAUs, no enterprise contracts, and was pre-Series B. This context shaped the risk tolerance." This paragraph alone doubles the useful life of the doc.
- **The "if I'm wrong" section:** State your most vulnerable assumption explicitly. If that assumption later turns out to be false, the reader knows which decisions to revisit.
- **Decision log with dates:** Every status change gets a date and a name. Who proposed it, who approved it, when it was implemented. This creates accountability and helps future readers understand the timeline.
- **Link to the PRD or ticket that resulted:** Without this link, the decision is orphaned from its consequences.

---

## Decisions Under Uncertainty: How to Document When You Don't Know

At Together AI's current stage (600% YoY growth, rapidly shifting market), many decisions are made under significant uncertainty. The mistake is either (a) pretending you have confidence you don't have, or (b) refusing to decide because you don't have enough data.

**The right move:** Document the uncertainty explicitly as part of the decision. Not as a hedge, but as a commitment -- "we're making this call with incomplete data, and here's what would cause us to reverse it."

**Uncertainty documentation pattern:**

| What we know | Confidence | Source |
|--------------|------------|--------|
| Enterprise customers want SSO | High | 6 sales calls, 2 churned customers cited it |
| Price sensitivity at the $500/mo tier | Medium | 3 conversations, not a formal study |
| Whether OIDC or SAML matters more | Low | No direct data, industry assumption |

Then: "We're deciding to build OIDC first because [reason]. If we learn in Q2 that SAML is the blocker for our largest deals, we'll revisit."

**Don't confuse "we don't have perfect data" with "we shouldn't decide."** The decision doc is how you commit to moving forward while being honest about your bets.

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Analysis Without Recommendation

**Bad:** "Here are 3 options, all with pros and cons. Thoughts?"
**Good:** "I recommend Option 2 because [reasoning]. Here's why I'm not choosing the others."

### ❌ Mistake 2: Hiding the Tradeoffs

**Bad:** Only showing upsides of your preferred option
**Good:** Honest about what you're giving up: "We're trading speed for quality because..."

### ❌ Mistake 3: Decision by Committee

**Bad:** Trying to get everyone to agree
**Good:** Get input from stakeholders, but make a clear call as the owner

### ❌ Mistake 4: Vague Success Criteria

**Bad:** "Success means users are happier"
**Good:** "Success means mobile NPS increases from 40 to 55 within 3 months"

### ❌ Mistake 5: No Failure Plan

**Bad:** Not addressing what happens if you're wrong
**Good:** "If after 2 months we haven't hit 60% adoption, we'll pivot to..."

### ❌ Mistake 6: Too Much Detail

**Bad:** 20-page document that no one reads
**Good:** TL;DR at top, details in appendix, clear recommendation

---

## After the Decision

### Push to Personal Notion Docs

After saving the decision file to `work/docs/decisions/`, push it to your Personal Notion Docs DB:

```bash
notion-personal create "2fd2f4d2-943e-8082-8c8f-e09a86954344" "[Decision title]" '{"Type": {"select": {"name": "Decision"}}}'
```

Then append the full decision content to the newly created page using `notion-personal append "[page-id]" "[content]"`.

Tell the user: "Pushed to your Personal Notion Docs."

---

### Announcing the Decision

```
Use `/slack-message` to announce your decision.

I'll create:
- **For leadership:** Executive summary of decision and rationale
- **For team:** Full context and next steps
- **For stakeholders:** How this affects their work

**Announcement should include:**
- What was decided
- Why (brief rationale)
- What happens next
- Who owns implementation
- How to provide feedback if people disagree
```

### Following Up

```markdown
## Decision Review Checkpoints

**After 1 month:**
- Review leading indicators
- Adjust course if needed
- Document what we learned

**After 3 months:**
- Measure success metrics
- Compare to predictions
- Share results with stakeholders

**After 6 months:**
- Full retrospective
- Update decision doc with "What We Learned"
- Use insights for future decisions
```

### When to Revisit

```markdown
## Triggers to Revisit This Decision

**Automatic review if:**
- [ ] Success metrics aren't tracking toward targets
- [ ] Key assumption proves false
- [ ] Major market change makes this less relevant
- [ ] Resource constraints significantly change
- [ ] Stakeholder requests formal review

**Scheduled review:**
- [Date] - First checkpoint
- [Date] - Full review
```

---

## Integration With Other Commands

### Informed by Competitive Analysis

```
Use `/competitor-analysis` first to understand market context.

Your decision doc should reference:
- Competitive positioning
- Market gaps you're exploiting
- Risks from competitive moves
```

### Feeds Into PRD

```
After the decision is approved, use `/prd-draft`.

I'll auto-populate:
- Strategic rationale from your decision doc
- Success metrics
- Non-goals (from rejected options)
- Open questions
```

### Tracked in Status Updates

```
Use `/status-update` to track implementation progress.

I'll reference:
- Timeline from decision doc
- Success metrics to track
- Risks to monitor
```

---

## Pro Tips

### 1. Write It Before the Meeting

Don't start the decision doc during the meeting. Write it before, circulate for async review, use meeting time for discussion.

### 2. Make Your Recommendation Clear

Don't hedge. Even if you're only 60% confident, make a clear call and explain your confidence level.

### 3. Steel-Man the Alternatives

Make the strongest possible case for options you're NOT choosing. This builds credibility and shows you thought it through.

### 4. Use Data, But Tell a Story

Numbers matter, but humans make decisions based on narratives. Weave data into a compelling story.

### 5. Document Disagreement

If someone strongly disagrees, document their position respectfully. Don't pretend everyone agrees.

### 6. Set Review Dates Up Front

Decide now when you'll check if this was the right call. Put it on the calendar.

### 7. Keep It Alive

Link to this doc in PRDs, Slack threads, and other places. Make it easy to find when people ask "why did we do this?"

---

**Remember:** The point of a decision doc isn't to be right—it's to be clear about what you're deciding, why you're deciding it, and how you'll know if it worked.

---

## Context Routing Strategy

When the PM uses `/decision-doc`, I automatically:

### 1. Check Strategic Alignment
**Source:** `work/site/strategy/`, `work/docs/prds/`
- **What I look for:** Current roadmap, strategic pillars, OKRs, company direction
- **How I use it:** Ensure recommendation aligns with broader strategy
- **Example:** If your strategy is "focus on activation," I'll note if this decision supports or conflicts with that

### 2. Identify Affected Stakeholders
**Source:** `work/context/general-context/stakeholder-template.md` + profiles
- **What I look for:** Who has input on this decision, who needs to approve, who will be affected
- **How I use it:** Build stakeholder consultation section automatically
- **Example:** If this decision affects Sales, I'll ask you to consult with VP Sales and note their input

### 3. Research Past Related Decisions
**Source:** `work/docs/decisions/`
- **What I look for:** Similar decisions made before, how they were analyzed, what succeeded/failed
- **How I use it:** Reference precedent, avoid contradictory decisions, build on learnings
- **Example:** "In November we decided to focus on mobile. This decision respects that commitment by..."

### 4. Pull Success Metrics Framework
**Source:** `work/docs/analyses/`, this chat thread
- **What I look for:** How you typically measure success, what metrics you care about
- **How I use it:** Suggest relevant metrics for this decision
- **Example:** If you've defined "activation rate" as key metric in past PRDs, I'll use that metric in success criteria

### 5. Extract Competitive Context
**Source:** `work/docs/research/competitive-*.md`, web search if needed
- **What I look for:** Competitor moves, market trends, positioning implications
- **How I use it:** Include competitive rationale in decision reasoning
- **Example:** "If Competitor X launches this first, we'll lose positioning advantage"

### 5b. Check Readwise for Prior Thinking
**Source:** `readwise search-highlights "decision topic"` and `readwise search-docs "decision topic"`
- **What I look for:** Saved articles, frameworks, or research relevant to this decision area
- **How I use it:** Surface any prior reading that should inform the options or recommendation
- **Example:** If you saved something about build-vs-buy frameworks, I'll pull the relevant highlights before presenting options

### 6. Route Decision for Approval
**Routing logic:**
- **CEO/Board level decisions:** Flag as one-way door, require extra scrutiny
- **Cross-functional decisions:** Ensure all department heads are consulted
- **Tactical decisions:** Route to relevant team owner
- **Reversible decisions:** Use lightweight format

---

## Output Quality Self-Check

Before presenting output to the PM, verify:

- [ ] **File saved to correct location:** Output saved to `work/docs/decisions/decision-[topic]-[date].md`
- [ ] **Context routing table was checked:** Reviewed `work/docs/decisions/` for past decisions, `work/site/strategy/` for alignment, and `work/context/general-context/stakeholder-template.md` for stakeholder context
- [ ] **Decision framed as clear question:** The decision is stated as a specific, answerable question with 2-4 distinct options (not open-ended or vague)
- [ ] **Each alternative has pros, cons, and trade-offs:** Every option includes at least 2 pros, 2 cons, and explicit trade-offs with the other options
- [ ] **Recommendation includes explicit rationale:** The recommendation states which option is chosen and provides numbered reasons why, with data or logic supporting each
- [ ] **Stakeholders who need to sign off are named:** Specific people (not roles) are listed as approvers, contributors, and informed parties
- [ ] **Reversibility assessment included:** The document explicitly states whether this is a one-way door or two-way door decision, with reasoning
- [ ] **Conflicts with existing strategy or past decisions flagged:** Any tension with decisions in `work/docs/decisions/` or goals in `work/site/strategy/` is called out with explanation of how the conflict is resolved
