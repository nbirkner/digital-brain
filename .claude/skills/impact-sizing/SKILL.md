---
name: impact-sizing
description: "Use when estimating feature value, scoping an opportunity, or justifying prioritization with numbers. Trigger phrases: 'how big is this?', 'what's the impact of X?', 'help me size this', 'I need a business case for Y', 'how do I prioritize this vs that?', 'what's the revenue opportunity?'. Also use when an exec asks 'why are we doing this?' and you need quantified answers, or before committing engineering resources to a multi-quarter initiative."
disable-model-invocation: false
user-invocable: true
---

# /impact-sizing - Quantify Feature Value

Systematically estimate the impact of a feature using the 4-step framework.

## Context Routing Logic (Internal - for Claude)

**Automatic Context Checks:**
When this skill is invoked, immediately check:

| Source | Files/Folders | Search Terms | What to Extract |
|--------|---------------|--------------|-----------------|
| Current PRD | `work/docs/prds/*.md` | feature name from chat | User impact, problem severity |
| User Research | `work/docs/research/*.md` | feature problem, user quotes | Addressable users, pain severity |
| Business Model | `work/context/general-context/business-info-template.md` | pricing, revenue model, TAM | Revenue impact drivers |
| Historical Data | `work/docs/analyses/*.md` | similar features, baseline conversion | Reference adoption rates |
| Strategy | `work/site/strategy/*.md` | feature strategic fit | Resource availability, priority context |

**Context Priority:**
1. Feature definition and user impact FIRST
2. Business model and pricing SECOND
3. User base size and addressable segment THIRD
4. Historical precedent for similar features FOURTH

**Cross-Skill Links:**
- If sizing is unclear → Link to `/impact-sizing` (this skill)
- If comparing options → Use this to inform `/experiment-decision`
- If building business case → Reference in PRD and `/write-prod-strategy`
- If identifying leading metrics → Connect to `/feature-metrics` and `/metrics-framework`

---

## Step 0: Understanding What We're Sizing

Before we estimate impact, let me check what context exists...

**Checking:**
- `work/docs/prds/` for the feature definition
- `work/docs/research/` for user research on this problem
- `work/context/general-context/business-info-template.md` for business model context
- `work/docs/analyses/` for comparable feature data

**Based on what I find, I'll show you:**

### What We Know About This Feature

**Feature Definition:**
- [What problem does it solve?]
- [Who does it affect? Total addressable users: X]
- [User segment: SMB / Enterprise / Consumer / etc.]

**User Impact:**
- [Problem severity: from user research]
- [Expected behavior change: what users do differently]
- [Current workaround cost: time/money users waste today]

**Business Context:**
- [Revenue model: how does this make money?]
- [Existing similar features: what was their adoption?]
- [Resource constraints: time/team availability]

### PM-Specific Diagnosis Questions

1. **Addressability:** Can you reach the entire user population, or only a segment?
2. **Adoption Curve:** Will this be immediate adoption or gradual ramp?
3. **Monetization:** Is this a direct revenue play or indirect (retention/expansion)?
4. **Confidence:** What data do you have vs what are you assuming?
5. **Execution Risk:** What could go wrong with adoption or implementation?

---

## When to Use

- Prioritizing features in planning
- Justifying resource allocation
- Building business cases for executives
- Comparing multiple feature options

---

## The 4-Step Framework

### Step 1: Estimate Usage (Funnel)

Create a funnel from exposure to usage:

```
Total users who see feature: [number]
    ↓ (Drop-off: [reason])
Users eligible for feature: [number]
    ↓ (Drop-off: [reason])
Users who engage: [number]
    ↓ (Drop-off: [reason])
Users who complete action: [number]
```

**Gotchas to consider:**
- How many users are actually eligible?
- How often will users be exposed?
- What's the expected adoption curve?

### Step 2: Calculate Impact

Progress through three levels:

**Engagement Impact:**
- DAU/MAU change
- Retention rate change
- Session frequency/duration

**Top-Line Impact:**
- Revenue change
- GMV change
- Conversion rate change

**Bottom-Line Impact:**
- Contribution margin
- Customer acquisition cost
- Lifetime value change

### Step 3: Identify & De-Risk Assumptions

For each assumption, assess risk and plan mitigation:

| Assumption | Confidence | Risk | De-risking Action |
|------------|------------|------|-------------------|
| [Assumption] | High/Med/Low | [Risk if wrong] | [Action] |

**Common de-risking actions:**
- Old data → Work with analytics for fresh numbers
- Usability question → Test with prototype
- Similar to competitors → Benchmark research
- Industry standard → Collect benchmarks

### Step 4: Define Takeaways

Three buckets:

1. **Planning:** Use for prioritization decisions
2. **Experiment Execution:** Determine experiment duration for stat sig
3. **Feature Design:** Identify levers to increase impact

---

## Quick Start Prompt

When PM types `/impact-sizing`, respond:

```
Let's size the impact of your feature. I'll walk you through the 4-step framework.

**Step 1: Estimate Usage**
- What feature are we sizing?
- Who sees this feature? (total addressable users)
- What are the steps from seeing → using?

Once you share this, I'll help build the funnel and calculate impact.
```

---

## Output Template

```markdown
# Impact Sizing: [Feature Name]

## Usage Funnel
| Stage | Users | Drop-off Rate | Reason |
|-------|-------|---------------|--------|
| See feature | [X] | - | - |
| Eligible | [X] | [Y%] | [reason] |
| Engage | [X] | [Y%] | [reason] |
| Complete | [X] | [Y%] | [reason] |

## Impact Estimates

**Engagement Impact:**
- Metric: [metric]
- Current: [baseline]
- Expected change: [+/- X%]
- Confidence: [High/Med/Low]

**Top-Line Impact:**
- Metric: [revenue/GMV]
- Expected change: [$X / +Y%]
- Confidence: [High/Med/Low]

**Bottom-Line Impact:**
- Metric: [margin/LTV]
- Expected change: [$X / +Y%]
- Confidence: [High/Med/Low]

## Confidence Assessment
| Assumption | Confidence | De-risking Action |
|------------|------------|-------------------|
| [assumption] | [level] | [action] |

## Recommendation
[Proceed / De-risk first / Deprioritize]
Rationale: [why]
```

---

## Driver Tree Example

Connect feature to business metrics:

```
Feature: [Name]
    ↓
[Engagement metric] +X%
    ↓
[Conversion metric] +Y%
    ↓
[Revenue metric] +$Z
    ↓
[Profit metric] +$W
```

---

## Output Integration

### Where Files Go

**Impact sizing analysis:**
- Active work: `work/docs/analyses/impact-sizing-[feature-name]-[date].md`
- When finalized: Reference in PRD in `Strategic Fit` section
- Archive: Move to `work/docs/prds/` as historical reference when feature ships

### Link to Other Work

After sizing impact:
- **Reference in PRD** - "Users affected: X, revenue impact: $Y, confidence: [High/Med/Low]"
- **Use in prioritization** - Helps decide if this should be in Q# roadmap
- **Support pitches** - Share with executives when requesting resources
- **Inform metrics** - Use impact estimates to set success metric targets

### Cross-Skill Integration

**Feeds into:**
- `/prd-draft` - Impact sizing goes into "Strategic Fit" section
- `/write-prod-strategy` - Feature impact informs strategic pillar priorities
- `/feature-metrics` - Usage estimates inform what metrics can detect changes
- `/experiment-decision` - Impact size determines experiment duration/sample size

**Pulls from:**
- `work/docs/research/` - User pain and adoption patterns
- `/user-research-synthesis` - Qualitative insights about addressable users
- `work/context/general-context/business-info-template.md` - Business model and growth drivers
- `work/docs/analyses/` - Historical data on similar features

---

## B2B vs B2C Sizing: Different Approaches

**B2C (consumer/self-serve, like Together AI's individual developers):**
- Funnel math: start with MAU, apply exposure rate, then adoption rate
- Key variables: feature discovery rate (often 20-40% if prominently placed), adoption among discoverers (10-30% for optional features), usage frequency
- Revenue link: usually indirect (retention improvement, upsell to paid tier, reduced churn)
- Anti-pattern: overestimating discovery. If a feature is buried in settings, 80% of users will never find it.

**B2B (enterprise/team, like Together AI's enterprise contracts):**
- Deal-based math: start with number of enterprise accounts at risk or in play, estimate deal size impact
- Key variables: how many open opportunities this unblocks, what ACV increase it enables, how many churned accounts it might win back
- Revenue link: usually direct (closes deals, expands contract size, prevents churn on renewal)
- Anti-pattern: conflating "this would help enterprises" with "this would close enterprise deals." The test is whether a specific buyer is making a decision based on this feature right now.

**For Together AI specifically (AI infrastructure, token-based pricing):**

The most important sizing dimensions aren't users -- they're token volume, compute margin, and customer concentration.

**Token volume impact sizing:**
```
Feature: [e.g., improved batch inference routing]

Addressable token volume: [X tokens/month from eligible customers]
Expected efficiency gain: [Y% reduction in inference latency or cost]
Margin impact: [Z% gross margin improvement on those tokens]
Monthly bottom-line impact: $[addressable volume × efficiency gain × margin per token]
```

**Customer concentration risk:**
At Together AI, a small number of customers likely drive a disproportionate share of token volume (classic power law). When sizing, ask: does this feature help the top 10 customers by volume, or the long tail? The same feature can look very different depending on which segment it moves.

**Compute cost as a variable:**
For AI infra features, the "cost" side of the equation often involves GPU compute directly. A feature that increases GPU utilization by 5% can have larger margin impact than one that acquires 100 new users. Include compute efficiency in your sizing when relevant.

---

## When You Don't Have the Data: Proxies and Approaches

"We don't have that data" is the most common objection to doing impact sizing. Here's how to work around it:

**Proxy approach:** Find a metric you DO have that correlates with the one you need.
- Don't have adoption rate for a new feature? Use adoption rate of the last 3 similar features shipped.
- Don't have enterprise deal size impact? Look at win/loss notes for any deals where a similar capability was mentioned.
- Don't have token volume by customer segment? Use billing data as a proxy.

**Analogue approach:** Find a comparable product decision at a company with public data.
- Stripe, Twilio, and Datadog have published usage/adoption numbers for some features in investor materials and conference talks.
- Industry benchmarks (e.g., "B2B SaaS features typically see 15-25% adoption among active users in the first 90 days") are better than nothing.
- State the analogue explicitly so the reader can judge its validity.

**Back-of-envelope vs Fermi:** Know which you're doing.
- Back-of-envelope: you have most of the numbers, you're just doing quick math. Confidence: Medium-High.
- Fermi: you're estimating from first principles with minimal data. Confidence: Low-Medium. Be explicit about this.

**When to stop and just do the work:** If you've spent more than 2 hours trying to estimate something and every path leads back to "we don't know," that's a signal. Either (a) run a quick research spike to get the data, or (b) acknowledge the uncertainty explicitly in the doc and de-risk before committing. Don't keep estimating -- get the data.

---

## Expressing Uncertainty Honestly Without Undermining the Estimate

The worst impact sizing docs do one of two things: they pretend false precision ("this will generate $847,000 in ARR"), or they hedge so much the estimate is useless ("somewhere between $0 and $10M").

**The right pattern: range + confidence + key variable**

Instead of a point estimate, express three scenarios driven by a single key variable:

| Scenario | Key Assumption | Revenue Impact |
|----------|---------------|----------------|
| Conservative | 10% enterprise adoption, 5% deal unlock rate | $200K ARR |
| Expected | 20% enterprise adoption, 15% deal unlock rate | $450K ARR |
| Optimistic | 35% enterprise adoption, 25% deal unlock rate | $900K ARR |

**Key variable = the one assumption that drives most of the range.** If you can only validate one thing before shipping, validate that.

Then state explicitly: "Our expected case assumes [key variable at X value]. If this is wrong by 2x, the impact is [Y]."

This is credible because it's honest. Executives and engineers trust ranges with named assumptions more than confident point estimates.

---

## Tips

- **Do the amount that fits your world** - Few weeks? Address top assumption. More time? Go deeper.
- **Never done** - You can always upgrade the model as you learn more
- **Connect to what matters** - Executives care about revenue/profit, not engagement metrics alone
- **Validate assumptions** - The biggest unknowns are usually adoption rate and addressable market
- **De-risking matters** - Knowing what you don't know is worth more than precise wrong estimates

---

## Output Quality Self-Check

Before presenting output to the PM, verify:

- [ ] **File saved to correct location:** Output saved to `work/docs/analyses/impact-sizing-[feature-name]-[date].md`
- [ ] **Context routing table was checked:** Reviewed `work/context/general-context/business-info-template.md`, `work/site/strategy/`, and `work/docs/analyses/` for relevant context
- [ ] **Driver tree has specific numbers:** Every node in the driver tree contains actual estimates (not placeholders like "[X]" or "[number]")
- [ ] **Confidence levels assigned:** Each assumption in the confidence assessment table has a High/Med/Low rating with justification
- [ ] **Revenue/user impact calculated with clear methodology:** Impact estimates show the math (e.g., "10,000 eligible users x 30% adoption x $5 ARPU = $15,000/month"), not just final numbers
- [ ] **De-risking actions identified:** Every Low-confidence assumption has a specific, actionable de-risking step (not generic "do more research")
- [ ] **Impact tied to strategic goal:** The recommendation section explicitly references a strategic goal or OKR from `work/site/strategy/`
- [ ] **Sensitivity analysis included:** Output shows best-case, worst-case, and expected-case scenarios with the key variable that drives the range
