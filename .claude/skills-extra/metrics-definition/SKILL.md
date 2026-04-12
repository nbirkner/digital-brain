---
name: metrics-definition
description: Define success metrics for features or experiments using the STEDII framework. Use when launching a new feature (to pick what to measure) or designing an A/B test (to select trustworthy experiment metrics). TRIGGER on: 'define metrics', 'what should we measure', 'success metrics for', 'experiment metrics', 'which metrics to track', 'how do we measure this'. DO NOT TRIGGER for analyzing existing results — use feature-results or retention-analysis instead.
user-invocable: true
---

# /metrics-definition - Define Success Metrics

**Which mode?**
- **Feature mode** — You have a feature launching and need to define success metrics
- **Experiment mode** — You're designing an A/B test and need trustworthy experiment metrics

---

## Context Routing Logic (Internal - for Claude)

When this skill is invoked, immediately check:

| Source | Files/Folders | Search Terms | What to Extract |
|--------|---------------|--------------|-----------------|
| Current PRD | `work/docs/prds/*.md` | feature name from chat | Hypothesis, problem statement, user impact |
| Business Info | `work/context/general-context/business-info-template.md` | business model, growth stage, metrics | Product strategy, current North Star |
| Metrics Context | `work/docs/analyses/*.md` | baseline numbers, historical data | Current metric baselines, ranges |
| Strategy | `work/site/strategy/*.md` | feature related to strategic pillar | Strategic fit and expected outcomes |
| Meetings | `work/notes/*.md` | feature name, "success metrics" | Stakeholder expectations, past decisions |

**Context Priority:**
1. Current PRD and feature context FIRST
2. Business model and strategy SECOND
3. Historical metrics and baselines THIRD
4. Stakeholder expectations FOURTH

**Cross-Skill Links:**
- If feature is part of larger product strategy → Link to `/write-prod-strategy`
- If deciding whether to test at all → Link to `/experiment-decision`
- If metric is North Star related → Link to `/define-north-star`
- If sizing impact → Link to `/impact-sizing` for usage estimates
- If tracking retention → Link to `/retention-analysis` for cohort analysis

---

## Quick Start

When the PM invokes `/metrics-definition`, respond:

```
Let's define metrics. I'll use the STEDII framework.

First: are we defining metrics for a feature launch or an A/B experiment?

Then tell me:
1. What are we measuring?
2. What user behavior does it change?
3. What business outcome do we expect?

I'll help you select a primary metric, guardrails, and kill criteria.
```

---

## The STEDII Framework

The shared foundation for both modes. Every good metric should pass all 6 criteria.

### S - Sensitive
Can the metric detect changes from your feature?
- Will it move meaningfully within your measurement window?
- Is the expected effect large enough to be detectable given current traffic?

**Bad:** Monthly Active Users for an onboarding improvement (too coarse — takes months to move)
**Good:** Day 7 activation rate (directly reflects onboarding quality within a week)

### T - Timely
How quickly does the metric respond?
- Can you measure it within your experiment window?
- Leading indicators beat lagging indicators for speed

**Bad:** 90-day retention (takes 90 days to know if it worked)
**Good:** Day 7 retention + leading indicators that correlate with long-term retention

**Tradeoff:** Sometimes you need slow metrics (LTV, annual retention). In those cases, use leading indicators to get fast signal and validate with lagging metrics on a sample.

### E - Efficient / Easy to Understand
Two things to check here:

**Efficient (statistical power):** Can you detect the effect with a reasonable sample size?
- Higher variance metrics need larger samples and longer experiments
- If you need >1M users to detect a 5% lift, the metric isn't efficient enough

**Easy to understand:** Can stakeholders interpret it without training?
- Apply the grandma test: can you explain it in one sentence?
- Avoid complex weighted formulas, "quality-adjusted" anything, or black-box composites

**Bad:** "Quality-adjusted sessions per visitor" or "Engagement score"
**Good:** "% of users who complete onboarding" or "Click-through rate"

### D - Debuggable / Directional
Two things to check here:

**Debuggable:** When something goes wrong, can you figure out why?
- Clear numerator and denominator
- Can be broken down by segments
- Can view user-level data

**Directional:** Is improvement unambiguous?
- Up = good or down = good? Be explicit upfront
- Avoid metrics where the direction of "good" is unclear

**Red flags:** Proprietary engagement scores, metrics with 5+ variables, ML model output composites

### I - Implementable / Isolated
Two things to check here:

**Implementable:** Can you actually track this metric?
- Data exists or can be collected
- Engineering effort to instrument is reasonable
- Named data source (e.g., "Amplitude event: task_created")

**Isolated:** Does the metric move because of your change — not external factors?
- Could seasonality, marketing campaigns, or other experiments affect it?
- Network effects or cross-contamination between treatment and control?

**Common isolation failures:** Social features with network effects, holiday seasonality, simultaneous campaigns, treatment bleeding into control group

---

## STEDII Scoring Table

Use this when evaluating multiple candidate metrics (especially in Experiment mode):

| Metric | Sensitive | Timely | Efficient | Debuggable | Interpretable | Isolated | Score |
|--------|-----------|--------|-----------|------------|---------------|----------|-------|
| Metric 1 | 2/3 | 3/3 | 2/3 | 3/3 | 3/3 | 2/3 | 15/18 |
| Metric 2 | 3/3 | 1/3 | 3/3 | 2/3 | 3/3 | 3/3 | 15/18 |

Scoring: 3 = Excellent, 2 = Acceptable, 1 = Poor, 0 = Fails

Primary metric should score 15+/18.

---

## Metric Types

### Primary Metric
The one metric that defines success. Directly tied to the feature goal. Single source of truth for go/no-go. Must pass all STEDII criteria.

### Guardrail Metrics (3-5)
Metrics that must NOT get worse. Protect against unintended harm. Set acceptable ranges — these are not targets.
Common guardrails: revenue, page load time, error rate, NPS, support ticket volume

### Kill Criteria (Experiment mode)
When to stop early and rollback.
- Serious negative impact threshold
- Safety concerns
- Automatic rollback triggers

---

## Feature Mode

Use when you have a feature launching and need to define what success looks like before launch.

### Step 0: Check What Already Exists

Before defining metrics, check:
- `work/docs/prds/` for any existing PRD for this feature
- `work/context/general-context/business-info-template.md` for North Star and company metrics
- `work/docs/analyses/` for historical baseline data
- `work/notes/` for stakeholder expectations

**If PRD exists:** "I found your [Feature Name] PRD from [date]. It mentions [hypothesis/goal]. Let me use that as context."
**If baselines exist:** "I found historical data: [Metric] baselines are currently [values]. I'll use this as reference."

### Clarifying Questions

1. **Feature Scope:** Small UX improvement, new capability, or major overhaul?
2. **User Segment:** All users, specific segment, or internal teams?
3. **Impact Type:** Growth, engagement, retention, monetization, or efficiency?
4. **Measurement Window:** How long before we expect to see signal?
5. **Business Context:** Speed or certainty more important right now?

### Common Metric Pairs by Feature Type

| Feature Type | Primary Metric | Common Guardrails |
|--------------|----------------|-------------------|
| Growth | Signups, Activation rate | D7 retention, Quality score |
| Engagement | DAU, Sessions per user | Load time, Error rate |
| Revenue | Conversion rate, ARPU | Refunds, Churn rate |
| Retention | D7/D30 retention | NPS, Support tickets |
| Efficiency | Task completion rate | Time on task, Error rate |

### Feature Mode Output Template

```markdown
# Feature Metrics: [Feature Name]

## Primary Metric
**Metric:** [Name]
**Definition:** [Exactly how it's calculated]
**Data source:** [e.g., Amplitude event: task_created]
**Current baseline:** [X]
**Target:** [Y] ([+/- Z%])
**Timeline:** [When we expect to see impact]

**STEDII Check:**
- [x] Sensitive — [why]
- [x] Timely — [why]
- [x] Efficient — [sample size needed vs. current traffic]
- [x] Debuggable — [how to investigate if it moves unexpectedly]
- [x] Interpretable — [plain English definition]
- [x] Isolated — [external factors controlled for]

**Ladders to North Star:** [How this connects upward to company North Star]

## Guardrail Metrics
| Metric | Acceptable Range | Why It Matters |
|--------|------------------|----------------|
| [Metric 1] | [range] | [protects against] |
| [Metric 2] | [range] | [protects against] |

## Kill Criteria
If any of these occur, immediately rollback:
- [Metric] drops below [threshold]
- [Metric] increases above [threshold]
- [Qualitative signal] occurs

## Measurement Plan
- **Data source:** [where data comes from]
- **Tracking:** [how it's instrumented]
- **Dashboard:** [where to monitor]
- **Review cadence:** [how often to check]
```

### Where Feature Metrics Files Go

- Active: Add to PRD in the success metrics section
- Finalized: Reference in `/experiment-decision` for A/B testing approach
- Archive: `work/docs/analyses/[feature-name]-baseline.md`

---

## Experiment Mode

Use when you're designing an A/B test and need to select metrics you can trust.

**Framework credit:** Adapted from Aakash Gupta's STEDII framework. Full article: https://www.news.aakashg.com/p/metrics-experiments

### Step 1: List Candidate Metrics

Start by brainstorming 5-10 candidate metrics. Prompt:
```
I'm running an experiment to: [describe your experiment]
Help me brainstorm candidate metrics we could measure.
```

### Step 2: Score Each Metric Against STEDII

Use the scoring table above. Identify your top 1-2 candidates for primary metric.

### Step 3: Select Primary + Guardrails

**Primary metric:** The ONE metric the experiment is designed to move. Score 15+/18 on STEDII. The metric you'll make the go/no-go call on.

**Guardrail metrics (3-5):** What you don't want to hurt.
- Example primary: Day 7 activation rate
- Example guardrails: Revenue per user, Daily active users, Customer satisfaction, Page load time

### Step 4: Pre-Experiment Checks

Before launching:

1. **A:A Test** — Run the experiment with no actual change. Both groups should be identical. If metrics differ, you have a setup problem.
2. **Sample Ratio Check** — Verify the 50/50 split is actually 50/50. If you see 52/48 or worse, investigate before launching.
3. **Metric Stability** — Check historical variance. High variance = longer experiment needed.

**Power calculation:**
```
Minimum sample size = (Z_α + Z_β)² × (σ² / δ²)
Where:
- Z = confidence level (1.96 for 95%)
- σ = standard deviation of metric
- δ = minimum detectable effect
```

### Common Experiment Mistakes

**Mistake 1: Only one metric**
Always define guardrail metrics. Optimizing one thing without guardrails is how you break another.

**Mistake 2: Confusing leading and lagging metrics**
Lagging metrics (LTV, annual retention, NPS) are slow but represent the outcome you care about. Leading metrics (D7 retention, activation rate) give fast signal. Use leading to move quickly, validate with lagging on a sample when the decision is critical.

**Mistake 3: Metric dilution**
Testing a checkout button change but measuring total monthly revenue? Only 5% of users see checkout — the signal is buried. Measure metrics scoped to exposed users: revenue per checkout visitor, or conversion rate (checkout started → completed).

**Mistake 4: Simpson's Paradox**
Aggregate metric moves one direction, segments move the opposite. Example: overall conversion +5%, but mobile -10% and desktop -5%. The mix shift from more mobile traffic masked the segment-level declines. Always segment results (new vs returning, mobile vs desktop, geography).

### Real-World Examples

**Netflix Thumbnail Test**

Bad metric: Monthly viewing hours (too aggregated, too slow, affected by content releases)
Good metric: Click-through rate on thumbnails — Sensitive (directly measures appeal), Timely (results in 1-2 days), Efficient (lots of impressions), Debuggable (see which thumbnails work), Interpretable ("% who click"), Isolated (measures only the thumbnail change)

**Booking.com Urgency Message Test ("Only 2 rooms left!")**

Bad metric: Bookings per visitor (high variance, slow conversion cycle)
Good metrics:
- Primary: Booking conversion rate
- Guardrail: Customer satisfaction score
- Guardrail: Return visit rate

Result: +2.5% conversion, but -5% satisfaction and -3% return visits. Decision: don't ship. The guardrails caught a bad long-term trade-off.

### Experiment Mode Checklist

Before launching:

- [ ] Primary metric clearly defined (what, how calculated, minimum detectable effect)
- [ ] STEDII score 15+/18
- [ ] Guardrails defined (3-5 metrics with acceptable ranges)
- [ ] Statistical plan complete (significance level, sample size, experiment duration)
- [ ] A:A test passed
- [ ] Sample ratio check planned
- [ ] Segmentation plan defined (new vs returning, mobile vs desktop, geo)
- [ ] No conflicting experiments running on the same user population

---

## Common Tips (Both Modes)

- **One primary metric** — Multiple "primary" metrics means no primary metric
- **Guardrails are not goals** — You're not trying to improve them, just protect them
- **Leading beats lagging** — Measure what you can act on quickly
- **Avoid vanity metrics** — Page views don't matter if nobody converts
- **Baseline always** — Know your current numbers before you start
- **Name the data source** — Every metric should have a named source before you lock it in

---

## Cross-Skill Integration

**Feeds into:**
- `/experiment-decision` — Primary metric determines test design and duration
- `/feature-results` — These metrics become the baseline for post-launch analysis
- `/impact-sizing` — Guardrails validate usage estimates
- `/metrics-framework` — Primary metric may become a leading indicator for North Star

**Pulls from:**
- `/define-north-star` — Ensure primary metric ladders up to North Star
- `/impact-sizing` — Usage estimates inform what metrics can detect changes
- `work/context/general-context/business-info-template.md` — Company metrics and baselines

---

## Output Quality Self-Check

Before presenting output, verify:

- [ ] **Context checked:** Reviewed `work/docs/prds/` for feature context, `work/context/general-context/business-info-template.md` for North Star, and `work/docs/analyses/` for baselines and past experiments
- [ ] **Metrics pass STEDII:** Each metric evaluated against all 6 dimensions with reasoning
- [ ] **Primary metric has baseline and target:** Not "improve" or "increase" — a specific number with a timeline
- [ ] **Guardrail metrics defined:** At least 3, each with an acceptable range and explanation
- [ ] **Metrics ladder to North Star:** Output explicitly shows the connection upward
- [ ] **Data source named for each metric:** e.g., "Amplitude event: task_created" or "database query on users table"
- [ ] **Metric sensitivity addressed:** Is the expected impact detectable given current traffic and variance?
- [ ] **No vanity metrics without justification:** If page views or total signups are included, explain why they're valid here
- [ ] **[Experiment mode only] Sample size calculated:** Minimum sample size estimate included for primary metric
- [ ] **[Experiment mode only] Pre-experiment checks listed:** A:A test, sample ratio check, metric stability
