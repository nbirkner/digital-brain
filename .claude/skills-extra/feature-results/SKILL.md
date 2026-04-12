---
name: feature-results
description: Use when a feature has been live for at least 2 weeks and you need to make a keep/iterate/kill decision, write a post-launch retrospective, or communicate results to stakeholders. Keywords: "what happened with X after launch", "did the feature work", "post-launch results", "analyze the experiment", "write up the results for".
disable-model-invocation: false
user-invocable: true
---

# /feature-results - Post-Launch Analysis

Document feature results and capture learnings.

## Distinguishing Launch Noise from Actual Signal

The biggest analysis mistake is looking at data too early. The first 2 weeks after launch are noisy by design. You have novelty effects, announcement traffic, and users who found the feature through the launch email (not organic discovery). These are not your steady-state users.

**Week 1-2 data tells you:**
- Whether the feature is broken
- Whether there are critical UX issues (abandonment at a specific step)
- Whether any segment immediately hates it

**Week 3-6 data tells you:**
- Whether adoption is organic (not just from the announcement)
- Whether users who tried it are coming back
- Whether it's affecting the metrics you care about (usually lagging indicators)

Don't write the formal results doc until you have at least 3-4 weeks of post-launch data for anything that requires behavior change. For pure discoverability improvements or UI changes, 2 weeks is often enough.

**The launch spike problem.** A feature can show great adoption numbers in week 1 and still be a failure. Look at weekly active usage curves: is it dropping back to baseline after the spike? A "launched and forgot" pattern (big week 1, then declining back to near-zero) means you have a discovery win but not a retention win. These require different interventions.

**When to declare an experiment inconclusive.** If your sample size is too small, your p-value never drops below 0.05, and you're at week 6, the answer isn't "the feature is fine." The answer is "we can't tell." Inconclusive is a valid outcome. The honest write-up is: "We couldn't detect a statistically significant effect with our traffic levels. Here's what we'd need to see a reliable signal and whether it's worth running longer."

## Handling Ambiguous and Mixed Results

Most real results are mixed. A primary metric hit but a guardrail metric moved. Or the overall metric was flat but one segment improved significantly while another declined.

**How to think about mixed results:**

The worst outcome is reporting the positive and burying the negative. The second-worst is reporting everything with equal weight and letting stakeholders draw their own conclusion. The right approach is to lead with the complete picture, then make a clear recommendation with your reasoning.

"Token usage increased 18% for new users but decreased 4% for existing users. We believe this is because the new onboarding flow is more effective, but the new UI confused existing users who had learned the old patterns. Recommendation: ship to new users only while we address the existing user experience, then re-evaluate in 4 weeks."

That's a mixed result handled well. It's honest, it has a clear recommendation, and it explains the reasoning.

**The partial success trap.** "It worked for some users" is not a victory. The question is: does it work for enough users, and are those the right users? A feature that works brilliantly for 5% of users and confuses the other 95% is a problem, not a feature.

## Metrics to Check for AI Infrastructure Products (Together AI)

Beyond the obvious primary metrics, always check these for Together AI features:

- **Token volume impact**: Did usage go up or down? Is that directionally correct?
- **API error rates**: Did you introduce new failure modes? Check error type breakdown, not just error rate.
- **Latency distribution**: P50 is usually fine. P95 and P99 are where you find problems. Check if your feature added tail latency.
- **Activation rate change**: Did the feature affect whether new users make their first successful API call?
- **Retention by cohort**: Did users who used the new feature retain better or worse than those who didn't? (This is the true test of whether the feature adds value.)
- **Support ticket volume**: Did support tickets related to this area go up or down? Support tickets are often the most honest signal.
- **NPS comment themes**: Not NPS score (too noisy, too slow) but qualitative themes in comments mentioning the affected area.

## What Makes a Results Doc Actually Change Future Decisions

Most results docs are written as a record, not a decision driver. They sit in a folder and nobody reads them before the next feature is built.

The difference is how you write the learnings. Instead of "the feature worked" or "the feature didn't work," write the specific belief that was confirmed or refuted.

**Not useful:** "Onboarding improvements increased activation."
**Useful:** "We confirmed that the drop in activation was caused by the API key copy step, not the docs. When we added one-click copy, activation improved 22%. This means future onboarding work should focus on reducing steps, not improving documentation."

The second version is a decision rule. Someone building the next onboarding feature can use it. The first version is trivia.

Every results doc should end with: "Based on what we learned, the next time we do X, we should Y." If you can't write that sentence, you haven't extracted the learning yet.

## Quick Start

```
/feature-results
```
Then provide:
1. **Feature name** and ship date
2. **Original hypothesis** (or I'll pull it from your PRD)
3. **Actual results** (metrics, or I'll query your analytics MCP)

I'll generate a results doc with: executive summary, results vs targets,
root cause analysis (if missed), segment breakdown, estimate calibration,
stakeholder communication guidance, and concrete next steps.

**Output:** Saved to `work/docs/analyses/feature-results-[name]-[date].md`
**Time:** ~10 min with data ready, ~20 min if we need to dig

---

## Pre-Launch Detection

Before generating a results analysis, verify the feature has actually shipped.

**Check for launch signals:**
- Does the PRD in `work/docs/prds/` or `work/docs/prds/` show status "Shipped" or "Launched"?
- Does the PM mention actual results data (not projections)?

**If the feature hasn't launched yet:**
```
It looks like [feature] hasn't shipped yet. Post-launch analysis works best with real data.

For pre-launch work, you might want:
- `/feature-metrics` - Define what you'll measure before launch
- `/impact-sizing` - Estimate expected impact
- `/experiment-decision` - Plan your A/B test or rollout
- `/launch-checklist` - Make sure you're ready to ship

Want to proceed anyway (e.g., analyzing a soft launch or pilot), or switch to one of these?
```

---

## When to Use

- After A/B test completes
- After feature reaches full rollout
- During quarterly reviews
- For portfolio analysis

---

## Quick Start Prompt

When PM types `/feature-results`, respond:

```
Let's document the results of your feature launch.

Tell me:
1. What feature shipped?
2. What were the original goals/metrics?
3. What actually happened?

I'll help you create a results doc that captures outcomes and learnings.
```

---

## Results Doc Structure

### 1. Executive Summary
- One paragraph: What shipped, did it work, what's next

### 2. Original Hypothesis
- What we expected to happen
- Why we believed it

### 3. Results
- Primary metric: Target vs. Actual
- Guardrail metrics: Any issues?
- Unexpected findings

### 4. Analysis
- Why did results occur?
- What surprised us?
- What didn't we anticipate?

### 5. Learnings
- What would we do differently?
- What should we apply elsewhere?

### 6. Next Steps
- Keep / Iterate / Kill?
- Follow-up experiments
- Related opportunities

---

## Output Template

```markdown
# Feature Results: [Feature Name]

**Ship Date:** [Date]
**Analysis Date:** [Date]
**Owner:** [PM Name]

---

## Executive Summary

[1-2 sentences: What shipped, key result, recommendation]

**Verdict:** [Ship to 100% / Iterate / Kill]

---

## Original Hypothesis

**If we** [built X],
**then** [Y would happen],
**because** [Z assumption].

**Target:** [Primary metric] would improve by [X%]

---

## Results

### Primary Metric
| Metric | Baseline | Target | Actual | Verdict |
|--------|----------|--------|--------|---------|
| [Name] | [X] | [Y] | [Z] | [Hit/Miss] |

### Statistical Significance
- Sample size: [N]
- Confidence level: [X%]
- P-value: [X]

### Guardrail Metrics
| Metric | Acceptable Range | Actual | Status |
|--------|------------------|--------|--------|
| [Metric] | [range] | [actual] | [OK/Warning] |

### Unexpected Findings
- [Finding 1]
- [Finding 2]

---

## Analysis

### Why These Results?
[Explain the underlying reasons for the results]

### What Surprised Us?
[Things we didn't expect]

### Segment Breakdown
| Segment | Result | Notes |
|---------|--------|-------|
| [Segment 1] | [+/-X%] | [insight] |
| [Segment 2] | [+/-X%] | [insight] |

---

## Learnings

### What Worked
- [Learning 1]
- [Learning 2]

### What Didn't Work
- [Learning 1]
- [Learning 2]

### Apply Elsewhere
- [Insight that applies to other features]

---

## Next Steps

**Recommendation:** [Ship / Iterate / Kill]

**If shipping:**
- [ ] Roll out to 100%
- [ ] Monitor for [X] weeks
- [ ] Update documentation

**If iterating:**
- [ ] [Specific change 1]
- [ ] [Specific change 2]
- [ ] Re-run experiment

**If killing:**
- [ ] Document why
- [ ] Rollback plan
- [ ] Communicate to stakeholders

---

## Appendix
- [Link to experiment dashboard]
- [Link to original PRD]
- [Link to detailed data]
```

---

## Root Cause Analysis

When results miss targets, diagnose using this framework:

### Discovery Problem (Users don't know it exists)
- **Check:** Feature awareness rate, in-app visibility, announcement reach
- **Common causes:** Buried in UI, no onboarding tooltip, weak announcement
- **Fix:** Improve discovery through tooltips, email campaign, in-app prompts

### Quality Problem (Users try it but it doesn't work well)
- **Check:** Error rates, completion rates, time-on-task, feedback sentiment
- **Common causes:** Bugs, poor UX, confusing workflow, slow performance
- **Fix:** Fix bugs, simplify UX, improve performance

### Relevance Problem (Users try it but it doesn't solve their problem)
- **Check:** Use case analysis, segment breakdown, feature-problem fit
- **Common causes:** Wrong target audience, edge cases not handled, misaligned with actual needs
- **Fix:** Narrow targeting, add missing use cases, revisit problem definition

### Frequency Problem (Users use it once but don't come back)
- **Check:** Repeat usage rates, habit formation metrics, triggers for return
- **Common causes:** Not integrated into daily workflow, one-time value, no triggers
- **Fix:** Add recurring value hooks, notifications, integration with other workflows

---

## Estimate vs Actual Calibration

| Metric | Original Estimate | Actual Result | Accuracy |
|--------|------------------|---------------|----------|
| [Primary metric] | [From impact-sizing] | [Actual] | [Over/Under by X%] |
| [Secondary metric] | [From impact-sizing] | [Actual] | [Over/Under by X%] |
| [Guardrail metric] | [Expected range] | [Actual] | [Within/Outside range] |

**Calibration insight:** [Are we consistently over/under-estimating? By how much? What should we adjust for next time?]

**Historical calibration pattern:**
- Look at past 3-5 feature results. If we consistently over-estimate by 30-50%, apply a discount factor to future impact-sizing.
- If we consistently under-estimate, we may be too conservative or missing amplification effects.
- Track this over time to improve estimation accuracy.

---

## Segment Breakdown Guidance

Always analyze results across these default segments. Segment analysis often reveals that an overall miss is actually a win for one segment and a miss for another.

| Segment Dimension | Why It Matters |
|-------------------|---------------|
| **New vs existing users** | New users may not find the feature; existing users may resist change |
| **Plan tier (Free/Team/Business/Enterprise)** | Feature value often varies dramatically by tier |
| **Company size** | Small teams adopt differently than large orgs |
| **Power users vs casual users** | Power users may love it; casual users may be confused |
| **Geographic region (if applicable)** | Cultural, language, and connectivity differences |

**Segment analysis template:**

| Segment | N (sample) | Primary Metric | vs Target | Insight |
|---------|-----------|---------------|-----------|---------|
| New users | [N] | [result] | [+/-X%] | [why] |
| Existing users | [N] | [result] | [+/-X%] | [why] |
| Free tier | [N] | [result] | [+/-X%] | [why] |
| Paid tier | [N] | [result] | [+/-X%] | [why] |
| Power users | [N] | [result] | [+/-X%] | [why] |
| Casual users | [N] | [result] | [+/-X%] | [why] |

---

## How to Communicate Results

**If results beat targets:** Lead with the win, credit the team, connect to strategy. Share in #product-team, include in weekly status update, highlight in next board deck.

**If results miss targets:** Lead with what you learned, not what went wrong. Frame as: "Here's what we hypothesized, here's what actually happened, here's what we're doing about it." Never hide bad results -- own them fast.

**If results are ambiguous:** Be honest about uncertainty. "We saw X but can't conclusively attribute it to Y because Z. Here's our plan to get clearer signal."

### Audience-Specific Framing

| Audience | Lead With | Include | Avoid |
|----------|-----------|---------|-------|
| **CEO/Board** | Impact on key business metrics + strategic implications | Revenue impact, user growth, competitive position | Technical details, minor metrics |
| **CPO/Manager** | Learnings + next steps + resource ask | What worked, what didn't, proposed plan | Blame, excuses |
| **Engineering team** | What worked technically + what to improve | Performance data, technical wins, tech debt notes | Business jargon |
| **Sales/CS** | Customer-facing impact + talking points | User quotes, feature highlights, objection handlers | Internal debates, negative framing |
| **Design** | User behavior changes + UX insights | Usage patterns, qualitative feedback, heatmaps | Pure metric tables without context |

---

## Example Patterns

### Pattern 1: Clear Win
**Scenario:** Feature shipped, primary metric exceeded target by 20%. Guardrails held.
**Root cause:** N/A (success)
**Action:** Scale to 100%, plan v2 based on segment insights, draft announcement via `/slack-message`, update `/status-update` with win.
**Communication:** Lead with the number, credit the team, connect to quarterly goals.

### Pattern 2: Mixed Results
**Scenario:** Primary metric hit target but guardrail metric degraded (e.g., page load time increased 15%).
**Root cause:** Quality problem -- feature added weight to core flow.
**Action:** Investigate quality regression, hold at current rollout %, fix guardrail before scaling. Create follow-up ticket via `/create-tickets`.
**Communication:** "Feature is working as intended for users, but we identified a performance regression we need to fix before full rollout."

### Pattern 3: Clear Miss
**Scenario:** Primary metric at 60% of target after 4 weeks.
**Root cause:** Discovery problem -- only 12% of eligible users found the feature. Among those who found it, conversion was above target.
**Action:** Don't kill the feature -- improve discovery (add tooltip, email campaign, onboarding mention), re-measure in 4 weeks.
**Communication:** "The feature works for users who find it, but we have a distribution problem. Plan: improve discovery and re-measure."

### Pattern 4: Kill Decision
**Scenario:** Primary metric at 30% of target after 6 weeks. Root cause is relevance -- users tried it but it doesn't solve their actual problem.
**Root cause:** Relevance problem -- hypothesis was wrong.
**Action:** Document the learning, roll back, redirect engineering effort. Draft decision doc via `/decision-doc`.
**Communication:** "We tested our hypothesis that X would solve Y. Data shows it doesn't. Here's what we learned and where we're redirecting effort."

---

## Tips

- **Be honest about failures** - Negative results are still valuable
- **Capture learnings immediately** - Don't wait; context fades
- **Share widely** - Others can learn from your experiments
- **Connect to strategy** - How does this inform our roadmap?
- **Run root cause analysis** - Don't just report the miss; diagnose why
- **Check segments** - An overall miss may hide a segment win
- **Calibrate estimates** - Track accuracy over time to improve future sizing

---

## Context Routing Strategy

When the PM uses `/feature-results`, I automatically:

### 1. Pull Original PRD & Hypothesis
**Source:** `work/docs/prds/`, conversation history
- **What I look for:** Original hypothesis, target metrics, success criteria
- **How I use it:** Compare actual results against original targets
- **Example:** Auto-populate "Original Hypothesis" section from the PRD you shared

### 2. Query Analytics MCPs
**Source:** Amplitude, Mixpanel, Posthog, Pendo (if connected)
- **What I look for:** Real-time metrics for the feature being analyzed
- **How I use it:** Populate results tables with actual data
- **Fallback:** If no MCP connected, I'll ask you to provide the metrics

### 3. Check Related Experiments
**Source:** `work/docs/analyses/`, past feature results
- **What I look for:** Similar features' results, patterns in what works
- **How I use it:** Add context like "This compares to our pricing redesign which saw 12% improvement"

### 4. Extract Guardrail Metrics
**Source:** `work/docs/analyses/`, PRD success metrics section
- **What I look for:** Metrics that must not decline (retention, NPS, etc.)
- **How I use it:** Pre-populate guardrail metrics table with relevant metrics

### 5. Identify Learnings for Portfolio
**Source:** Cross-reference with other feature results
- **What I look for:** Patterns across multiple experiments
- **How I use it:** Suggest "Apply Elsewhere" section based on similar features

### 6. Route Results for Sharing
**Routing logic:**
- **Ship to 100%:** Draft announcement for `/slack-message`
- **Iterate:** Create follow-up experiment plan with `/experiment-decision`
- **Kill:** Draft decision doc for `/decision-doc` explaining sunset
- **Executive update:** Format for `/status-update` with business impact

---

## Output Quality Self-Check

Before delivering the feature results doc, verify:

- [ ] **Executive summary** is 1-2 sentences max and includes a clear verdict (Ship/Iterate/Kill)
- [ ] **Original hypothesis** is stated in If/Then/Because format
- [ ] **Primary metric** has baseline, target, and actual with statistical significance noted
- [ ] **Guardrail metrics** are checked and status is clear (OK/Warning/Breach)
- [ ] **Root cause analysis** is included if results missed targets (Discovery/Quality/Relevance/Frequency)
- [ ] **Segment breakdown** covers at least 3 dimensions (new vs existing, tier, user type)
- [ ] **Estimate vs actual calibration** table is populated with accuracy percentages
- [ ] **Stakeholder communication** section has audience-appropriate framing
- [ ] **Next steps** are specific, actionable, and have owners
- [ ] **Learnings** include at least one "apply elsewhere" insight
- [ ] **No corporate jargon** -- results are written in plain, direct language
- [ ] **Linked to original PRD** and any related experiments
