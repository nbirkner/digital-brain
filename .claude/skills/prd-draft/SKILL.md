---
name: prd-draft
description: "Use when starting a new feature spec, preparing for a planning review, XFN kickoff, or solution review. Trigger phrases: 'write a PRD', 'spec this out', 'need a one-pager for X', 'help me write up the feature', 'preparing for kickoff on X'. Also use when moving from discovery to build, or when engineering needs written requirements before starting."
disable-model-invocation: false
user-invocable: true
---

## Quick Start

**What to provide:** A feature idea, problem statement, or rough brief. Can be detailed or rough.

```
/prd-draft                                → Start from scratch with guided questions
/prd-draft [paste your feature idea]      → I'll skip questions you already answered
/prd-draft --stage "team kickoff"         → Set the PRD stage upfront
/prd-draft --ai                           → Include AI behavior specification sections
```

**What you get:** A 1-2 page modern PRD with hypothesis, strategic fit, non-goals, success metrics, rollout plan, and optional behavior examples. Saved to `work/docs/prds/[feature-name-kebab-case]-[stage].md`. Based on `work/templates/prd-template.md`.

**Time:** 10-20 minutes for first draft. Then iterate.

**Filename convention:** `[feature-name-kebab-case]-[stage].md` (e.g., `voice-task-capture-team-kickoff.md`)

---

# /prd-draft - Modern PRD Creation

When the PM types `/prd-draft`, guide them through creating a modern, AI-era PRD.

## Context Routing Logic (Internal - for Claude)

**Automatic Context Checks:**
When this skill is invoked, immediately check:

| Source | Files/Folders | Search Terms | What to Extract |
|--------|---------------|--------------|-----------------|
| Strategy Docs | `work/site/strategy/*.md` | feature name from chat | Strategic pillar alignment |
| Related PRDs | `work/docs/prds/*.md` | feature dependencies | Related features and cross-functional impact |
| User Research | `work/docs/research/*.md` | problem related to feature | User pain points, quotes, validation |
| Business Model | `work/context/general-context/business-info-template.md` | pricing, revenue, metrics | Revenue impact, North Star alignment |
| Competitor Analysis | `work/docs/research/competitive-*.md` | feature name | Competitive positioning if relevant |
| Stakeholder Context | Stakeholder profiles | key stakeholders for this feature | Who to involve, communication style |
| Readwise Highlights | `readwise search-highlights "topic"` | feature name, problem area | Saved articles, frameworks, prior thinking on similar problems |
| Readwise Docs | `readwise search-docs "topic"` | feature name, problem area | Saved long-form content relevant to this space |

**Context Priority:**
1. Strategic fit and related PRDs FIRST
2. User research and problem statement SECOND
3. Business context and metrics THIRD
4. Competitive positioning FOURTH

**Cross-Skill Links:**
- If user problem not validated → Link to `/interview-guide` and `/user-research-synthesis`
- If impact unclear → Link to `/impact-sizing` for user/revenue impact
- If success metrics unclear → Link to `/feature-metrics` for STEDII framework
- If strategic fit unclear → Link to `/write-prod-strategy` for context

---

## Step 0: Context Gathering

Before reading files or drafting anything, use the **AskUserQuestion tool** to ask:

**Question 1:** "What PRD stage is this?"
Options: ["Team Kickoff", "Planning Review", "XFN Kickoff", "Solution Review", "Launch Readiness", "Impact Review"]
Type: single-select buttons

**Question 2:** "Do you have a feature description ready to share?"
Options: ["Yes, I'll paste it", "No, help me define it"]
Type: single-select buttons

Use the answers to adapt:
- If stage is "Team Kickoff" → shorter format, skip detailed metrics and rollout sections
- If stage is "Impact Review" → focus on results vs. targets, skip hypothesis/solution sections
- If they have a description → skip ideation questions in Step 1, jump straight to drafting

---

## Step 0.5: Understanding Your Feature Context

Before we draft, let me check what context exists...

**Checking:**
- `work/docs/prds/` for any related feature PRDs
- `work/site/strategy/` for strategic alignment
- `work/docs/research/` for user validation
- `work/context/general-context/business-info-template.md` for business context
- Stakeholder profiles for who needs to be involved

### Context Health Check

After reading context files, verify they contain real data (not placeholder brackets):

**If `business-info-template.md` contains unfilled placeholders** (e.g., `[Your Company]`, `[Your Product]`):
```
I notice your business context template hasn't been filled out yet. Your PRD will be much stronger with real company context.

Want to:
1. **Fill it out now** (5 min) - I'll ask you the key questions
2. **Proceed without it** - I'll draft the PRD but flag where company context would improve it
```

**If strategy docs are empty/missing:**
Flag this and suggest `/write-prod-strategy` or `/strategy-sprint` first.

**Based on what I find, I'll show you:**

### What We Know About This Feature

**Strategic Context:**
- [Which strategic pillar does this support? From your strategy doc]
- [Expected user impact: # of users affected]
- [Business outcome: revenue, retention, or engagement impact]

**User & Problem Validation:**
- [User research confirming this problem: quotes, frequency]
- [Current workaround: how users solve this today]
- [Problem severity: pain level from research]

**Feature Dependencies:**
- [Related features: what needs to ship first]
- [Cross-functional impact: which teams are involved]
- [Timing constraints: market window, competitive pressure]

**Requirements for what you surface (before proceeding to Step 1):**
- **Strategic pillar:** Name the exact pillar from the strategy doc (e.g., "Activation: reduce onboarding drop-off"). "Aligns with our strategy" is not acceptable — use the actual name.
- **User research:** Include a real quote or specific data point (e.g., "47% of users abandon at step 3" or "Users say: 'I can't figure out how to get started'"). Paraphrase with no data is not acceptable.
- **North Star connection:** State explicitly how this feature moves the North Star metric, and by how much (even an estimate). Every PRD must ladder up to the North Star.

If any of the above cannot be found in the workspace, flag it before drafting and ask the PM to provide it.

### PM-Specific Diagnosis Questions

1. **Problem Validation:** Is this problem validated with real users, or hypothesis?
2. **Strategic Clarity:** Do you know how this fits into your Q# roadmap?
3. **Scope Clarity:** Is this a small v1 or full-featured release?
4. **Success Metrics:** Do you know what success looks like?
5. **Execution Readiness:** Do engineering and design understand the scope?

---

## When to Use

- Starting a new feature or initiative
- Need to align cross-functional stakeholders
- Moving from prototype to formal spec
- Preparing for planning/prioritization review

## How It Works

This is a 3-step conversational workflow:

### Step 1: Clarifying Questions
### Step 2: Generate First Draft
### Step 3: Multi-Agent Review

---

## Step 1: Clarifying Questions

**Adaptive Questions Rule:** Before asking clarifying questions, check what the PM has already provided in their prompt. Skip questions that are already answered. Start with: "Based on what you shared, I have [X, Y, Z]. Let me confirm: [summary]. A few remaining questions: [only the gaps]."

If the PM provided a detailed brief, you may have enough to skip straight to Step 2. Only ask what's genuinely missing.

When the PM types `/prd-draft` with no additional context, start with:

```
Let's create a modern PRD together. I'll reference your company context and PRD template from this workspace.

Before I draft anything, I need to understand the initiative. Don't worry about structure—just talk through it. Use dictation if that's easier.

**Required context:**
1. What problem are we solving? (Be specific about the user pain)
2. What's the hypothesis? (If we build X, then Y will happen because Z)
3. How does this fit our current strategy? (Reference specific goals from business-info.md)
4. What stage is this PRD at? (Team kickoff / Planning review / XFN kickoff / Solution review / Launch readiness / Impact review)

**Important details:**
5. Is this an A/B test or full launch?
6. What are the non-goals? (What are we explicitly NOT doing?)
7. What are the success metrics? (How will we know this worked?)
8. Who are the key stakeholders? (@ mention them if you have profiles in `work/context/general-context/stakeholder-template.md` or similar)

**AI-specific (if applicable):**
9. What are example prompts or user inputs?
10. How should it handle edge cases or weird inputs?
11. What should it NEVER do? (Rejection criteria)

Take your time. I'll ask follow-up questions if needed.
```

### Follow-Up Questions

Based on what the PM shares, ask:

- **If strategy fit is unclear:** "I see this solves [problem], but how does it ladder up to our [specific strategy goal]? Or is this a bet on a new direction?"

- **If non-goals are missing:** "What are we explicitly NOT including in v1? Any trade-offs you're making?"

- **If metrics are vague:** "When you say 'increase engagement,' what's the specific metric? What's the target? What's the guardrail (metric we can't harm)?"

- **If rollout plan is missing:** "Should this be an A/B test first? What's the passing criteria to roll out to everyone?"

- **If AI behavior is unclear:** "Can you give me 3 example inputs: one that should work great, one that's borderline, and one that should be rejected?"

### What NOT to Ask

- Don't ask about technical implementation details yet (that's for engineers)
- Don't ask for exhaustive edge case lists (capture the pattern, not every scenario)
- Don't ask for final copy or UI details (PRD is about "what" not "how exactly")

---

## Step 2: Generate First Draft

Once you have enough context, say:

```
Great, I have enough to draft a first version. This will be:
- Short (1-2 pages max)
- Focused on the key sections for this stage
- At the [STAGE] stage of evolution
- Using your [AUDIENCE] writing style
- Based on work/templates/prd-template.md

I'll create it now and save it to `work/docs/prds/[feature-name-kebab-case]-[stage].md`.

After you review, we can iterate or get multi-perspective feedback.
```

### PRD Structure

**Reference the full template at `work/templates/prd-template.md`.** Include only sections relevant to the current stage. Use this structure:

```markdown
# [Feature Name]

**Stage:** [Team Kickoff / Planning Review / XFN Kickoff / Solution Review / Launch Readiness / Impact Review]
**Last Updated:** [Date]
**Owner:** [PM Name]
**Status:** [Draft / In Review / Approved]

---

## Hypothesis

[Problem Statement - What user pain are we solving?]

**If we** [build X],
**then** [Y will happen],
**because** [Z assumption about user behavior].

**Supporting Evidence:**
- [Data point or user quote]
- [Data point or user quote]

---

## Strategic Fit

**Why this? Why now?**

This supports our [Q# Goal/Strategy] by [specific connection].

**Impact Sizing:**

> Use the 4-step framework: Estimate Usage → Calculate Impact → Identify Risks → Define Takeaways

**Step 1: Estimate Usage (Funnel)**
| Stage | Users | Drop-off Reason |
|-------|-------|-----------------|
| Total users who see feature | [number] | - |
| Users eligible for feature | [number] | [reason for ineligibility] |
| Users who engage | [number] | [why they don't engage] |
| Users who complete action | [number] | [friction points] |

**Step 2: Calculate Impact**
- *Engagement Impact:* [DAU/MAU/Retention change]
- *Top-Line Impact:* [Revenue/GMV change]
- *Bottom-Line Impact:* [Contribution margin/profit change]

**Step 3: Confidence Assessment**
| Assumption | Confidence | Risk Level | De-risking Action |
|------------|------------|------------|-------------------|
| [Key assumption 1] | High/Med/Low | [risk] | [action to validate] |
| [Key assumption 2] | High/Med/Low | [risk] | [action to validate] |

**Summary:**
- Users affected: [number or %]
- Revenue impact: [estimate with confidence level]
- Strategic value: [High/Medium/Low]

**Alternatives Considered:**
- [Alternative A] - Not doing because [reason]
- [Alternative B] - Not doing because [reason]

---

## Non-Goals

What we are explicitly NOT doing in v1:
- [Non-goal 1] - [Why it's out of scope]
- [Non-goal 2] - [Why it's out of scope]

**Trade-offs Made:**
- [Trade-off] - [Rationale]

---

## Success Metrics

> **📚 Tip:** For help choosing the right metrics, see `.claude/skills/define-north-star/` (align to North Star) and `.claude/skills/experiment-metrics/` (STEDII framework for trustworthy metrics).

**Primary Metric:** [Metric name]
- Current: [baseline]
- Target: [goal]
- Timeline: [when we expect to see impact]

**Guardrail Metrics:** (Must not harm)
- [Metric 1]: [acceptable range]
- [Metric 2]: [acceptable range]

**Kill Criteria:**
If [specific condition], we will [rollback plan].

---

## Rollout Plan

**Approach:** [A/B Test / Phased Rollout / Full Launch]

**Phase 1:** [Who gets it first, when]
- Passing criteria: [What has to be true to move to Phase 2]

**Phase 2:** [Expand to, when]
- Passing criteria: [What has to be true to move to Phase 3]

**Rollback Plan:**
If [scenario], we will [specific action].

---

## AI Behavior Contract (AI features only)

> Include for AI/ML features. Delete for non-AI features. See `work/templates/prd-template.md` Section 3 for the full contract format.

| Dimension | Specification |
|-----------|--------------|
| **Primary Task(s)** | summarize / extract / classify / generate / route |
| **Inputs Available** | [fields, context, tools, RAG sources] |
| **Constraints** | [brand, privacy, compliance] |
| **Disallowed** | [PII echo, policy violations, jailbreak classes] |
| **Latency Budget** | P50: [X]ms / P95: [Y]ms |

**Behavior Examples:**

| Scenario | User Input | Expected Output | Rejection Criteria |
|----------|------------|-----------------|-------------------|
| Happy path | [Example 1] | [What should happen] | N/A |
| Edge case | [Example 2] | [Graceful handling] | N/A |
| Should reject | [Example 3] | [Error/refusal] | [Why rejected] |

---

## Solution Overview (non-AI features only)

> Include for non-AI features. Delete for AI features (use Behavior Contract above).

**User Flow:**
1. [Step 1: User does X]
2. [Step 2: System responds with Y]
3. [Step 3: User completes Z]

**Key Interactions:**
- [Interaction]: [What happens and why]

**Edge Cases:**
- [Edge case]: [How we handle it]

**Mockup/Prototype:** [Link or embed]

---

## Risks and Recovery

| Risk | Detection | Fallback | Kill Switch |
|------|-----------|----------|-------------|
| [Risk 1] | [signal/threshold] | [fallback plan] | [who owns] |
| [Risk 2] | [signal/threshold] | [fallback plan] | [who owns] |

---

## Open Questions

- [ ] [Question 1] - @[stakeholder]
- [ ] [Question 2] - @[stakeholder]

---

## Appendix

[Supporting context, research data, impact sizing detail, alternatives considered, changelog]
```

### Writing Guidelines for the Draft

**Tone:**
- Use the appropriate writing style from `work/context/writing-style/writing-style-*.md`
- Write like the PM would write (human, not AI-generated)
- Be direct and crisp

**Content:**
- Use exact quotes from user research when available
- Reference specific data from business-info.md
- Call out stakeholders by name
- Flag controversial decisions explicitly

**What to Include:**
- Real user quotes: "I'm frustrated when..."
- Actual numbers: "47% of users abandon at this step"
- Specific references: "This supports our Q2 goal of [X]"

**What to Avoid:**
- Generic statements: "Users want a better experience"
- Vague goals: "Increase engagement"
- Corporate jargon: "Leverage synergies to unlock value"

---

## Step 2.5: Generate Prototype (Optional)

After drafting the PRD, offer to create a quick prototype:

```
Want me to help you visualize this feature before engineering review?

**The $1-$10-$100 Rule:**
- $1: PM creates napkin sketch → catches issues early
- $10: Designer reworks based on feedback → moderate cost
- $100: Engineering builds wrong thing → expensive waste

Quick prototype options:
1. **Napkin Sketch** - ASCII wireframe right here
2. **v0.dev Prompt** - Generate a prompt for Vercel's v0
3. **Lovable Prompt** - Generate a prompt for Lovable.dev
4. **Figma Description** - Detailed spec for designer handoff
5. **User Flow Diagram** - Step-by-step flow visualization

Which would be helpful?
```

### Prototype Templates

**Napkin Sketch (ASCII):**
```
┌─────────────────────────────┐
│  Header / Navigation        │
├─────────────────────────────┤
│                             │
│  [Main Content Area]        │
│                             │
│  ┌─────────┐  ┌─────────┐  │
│  │ Card 1  │  │ Card 2  │  │
│  └─────────┘  └─────────┘  │
│                             │
│  [ Primary CTA Button ]     │
│                             │
└─────────────────────────────┘
```

**v0.dev / Lovable Prompt Template:**
```
Create a [component type] for [product context].

**User Goal:** [What the user is trying to accomplish]

**Key Elements:**
- [Element 1 with behavior]
- [Element 2 with behavior]
- [Element 3 with behavior]

**Interactions:**
- When user [action], [result]
- When user [action], [result]

**Style:** [Modern/minimal/playful] with [brand colors if known]

**Edge Cases:**
- Empty state: [what to show]
- Error state: [what to show]
- Loading state: [what to show]
```

**User Flow Diagram:**
```
[Entry Point] → [Step 1] → [Decision Point]
                              ↓ Yes      ↓ No
                          [Step 2A]   [Step 2B]
                              ↓           ↓
                          [Success]   [Recovery]
```

---

## Step 3: Multi-Agent Review

After generating the draft, offer:

```
First draft created! Saved to `work/docs/prds/[feature-name]-[stage].md`.

Want me to review this from multiple perspectives?
- Engineer (technical feasibility, implementation concerns)
- Designer (UX/UI, user experience)
- Executive (strategic alignment, business impact)
- Legal (compliance, risk)
- Skeptic (devil's advocate)

Just let me know which perspectives would be helpful.
```

### How to Run Multi-Agent Review

When the PM requests review:

1. **Invoke each sub-agent explicitly:**
   ```
   I'll review this from [Engineer / Designer / Executive] perspective.
   Reading from `work/sub-agents/[agent-name].md`...
   ```

2. **For each agent, provide:**
   - ✅ What looks good
   - ⚠️ Concerns or risks
   - 💡 Suggestions for improvement
   - ❓ Clarifying questions

3. **Synthesize at the end:**
   ```
   **Summary of Feedback:**
   - All reviewers agree: [common feedback]
   - Conflicting perspectives: [engineer says X, but designer says Y]
   - Highest priority fixes: [what to address first]

   Want me to update the PRD with this feedback, or would you like to iterate on specific sections?
   ```

---

## Iterating on the PRD

The PM will likely want to refine sections. Common requests:

**"Make the hypothesis stronger"**
→ Add more specific user pain, quantify the problem, tie to data

**"Add more behavior examples"**
→ Create the Good/Bad/Reject table with real scenarios

**"The non-goals aren't clear"**
→ Make them more specific, add rationale for each

**"This needs to be shorter"**
→ Move supporting details to Appendix, tighten language

**"Make it sound more like me"**
→ Reference their writing style, use their voice patterns

---

## Stage-Specific Length Guidance

Match document length to stage. Shorter is always better -- expand only as the initiative matures.

| Stage | Word Count | Focus | What to Skip |
|-------|-----------|-------|--------------|
| Team Kickoff | 300-500 words | Problem, hypothesis, high-level approach | Detailed metrics, rollout plan |
| Planning Review | 500-800 words | Strategic fit, impact sizing, alternatives | Detailed behavior examples |
| XFN Kickoff | 800-1200 words | Aligned solution, initial data, mockups | Deep edge cases |
| Solution Review | 1000-1500 words | In-depth justification, edge cases, behavior | Nothing -- this is the full spec |
| Launch Readiness | 1500-2000 words | Final details, rollback, kill criteria, go/no-go | Problem exploration (decided already) |
| Impact Review | 500-800 words | Results vs. targets, learnings, next steps | Future roadmap detail |

**Rule of thumb:** If the PRD exceeds the word count for its stage, move supporting details to the Appendix.

---

## Stage-Specific Adjustments

### Team Kickoff Stage
- Focus on: Problem, hypothesis, high-level approach
- Skip: Detailed metrics, rollout plan
- Include: Lots of open questions

### Planning Review Stage
- Focus on: Strategic fit, impact sizing, alternatives considered
- Include: Rough success metrics, estimated effort
- Skip: Detailed behavior examples

### XFN Kickoff Stage
- Focus on: Aligned solution, initial data/research
- Include: Mockups or prototype link
- Add: Stakeholder sign-offs needed

### Solution Review Stage
- Focus on: In-depth justification, edge cases, behavior examples
- Include: Detailed metrics, rollout plan
- Add: Technical feasibility assessment

### Launch Readiness Stage
- Focus on: Final details, rollback plan, kill criteria
- Include: Go/no-go checklist
- Add: Launch communication plan

### Impact Review Stage
- Focus on: Results, learnings, next steps
- Include: Actual vs. target metrics
- Add: What we'd do differently

---

## Tips for Great PRDs

**Keep gossiping to me:**
After stakeholder meetings, user research, or team discussions, tell me what happened. I'll help keep the PRD updated with:
- New insights
- Changed requirements
- Stakeholder concerns
- Shifted priorities

**Use dictation:**
Talking is faster than typing. Just ramble about the feature and I'll structure it.

**Don't aim for perfect:**
PRDs evolve. Ship the draft, get feedback, iterate.

**Add real examples:**
The best PRDs have real user quotes, actual data, and concrete examples.

**Make it yours:**
Customize the template for your company. Add sections that matter to your team.

---

## PRD Format Decision: One-Pager vs Full PRD

**Write a one-pager (300-500 words) when:**
- The feature is a contained scope change with no cross-team dependencies
- You're still in discovery and the solution isn't locked yet
- The audience is your own team only (no exec or XFN review needed)
- Engineering has already been briefed and trusts your judgment
- At Together AI scale: most features that touch a single surface (API, billing page, settings)

**Write a full PRD (800-1500 words) when:**
- The feature requires sign-off from engineering, design, and a stakeholder outside your team
- The scope is ambiguous and the document needs to create alignment, not just communicate
- There are meaningful trade-offs that need to be surfaced and locked in writing
- It's a multi-phase initiative where v1 decisions constrain v2
- At Together AI scale: anything touching IAM, billing, pricing, enterprise features, or cross-team infra

**The "engineering wants less spec" tension:** Engineering teams often resist long PRDs because they've seen specs that over-specify UI before anyone has validated the UX. The right answer isn't to write less -- it's to write the right things. Lock outcomes and constraints. Leave implementation flexible. A good PRD tells engineering *what success looks like and what constraints can't be broken*, not *how to build it*. If they're pushing back, your PRD is probably speccing the wrong layer.

**Writing PRDs for AI products where requirements evolve during build:**
AI features routinely change during build because model behavior is non-deterministic and you can't fully spec edge cases in advance. Handle this by:
1. Locking the *behavior contract* early (what the AI must/must not do, latency SLA, quality bar) -- these are hard to change
2. Treating *behavior examples* as a living list -- add to them as you discover edge cases in testing
3. Keeping the *solution overview* deliberately thin -- don't over-specify UI or flow until you've seen the model behave
4. Scheduling a "spec sync" mid-build to update the PRD with what you actually learned
At Together AI, where the product IS AI infrastructure, this especially applies to any feature that surfaces model behavior to end users.

## Anti-Patterns in PRD Writing (with Why)

**Writing requirements instead of outcomes.**
Requirements tell engineering what to build. Outcomes tell them what success looks like. When you write "the system shall display a modal with X fields," engineering builds exactly that, even if it's wrong. When you write "users can complete X in under 60 seconds without reading documentation," engineering can make smarter local decisions. Requirements also create a blame surface -- "you spec'd it that way." Outcomes create shared ownership.

**Over-specifying UX before customer validation.**
If users haven't seen a prototype, you don't know if your UX is right. A PRD that contains detailed wireframe specs before validation is a bet, not a plan. Write behavioral flows ("user can see their current plan and change it in one step") instead of UI specs ("dropdown with 3 options, right-aligned at 24px"). Save UX detail for Solution Review stage, after Figma has been tested with real users.

**Writing for the wrong audience.**
A PRD written for engineers is different from one written for executives. Most PMs write one version and send it everywhere. This guarantees it's wrong for everyone. At Together AI, you're writing for at least three audiences with conflicting needs: engineers (need precision on constraints and edge cases), execs (need strategic rationale and business impact), and XFN partners (need clarity on what they own vs don't). Write the core PRD for engineers, then extract a 3-bullet exec summary for leadership, and flag the specific asks for each XFN partner.

**Listing every edge case instead of the pattern.**
The goal of edge case documentation is to convey the *pattern* of how edge cases are handled, not enumerate all of them. Writing "if user has 0 credits, show error; if user has credits but org is suspended, show different error; if user has credits and org is active but feature is paused..." creates a spec that's immediately out of date. Instead: "When access is blocked, always show the reason and a single resolution CTA. Never leave users without a next step." Engineers can apply this pattern to edge cases you didn't anticipate.

## Common Pitfalls to Avoid

❌ **Too long** - If it's over 2 pages, move details to Appendix
❌ **Too generic** - Use specific data, quotes, and stakeholders
❌ **No non-goals** - Always clarify what you're NOT doing
❌ **Vague metrics** - "Increase engagement" is not specific enough
❌ **No rollout plan** - A/B test vs full launch matters
❌ **Missing kill criteria** - How will you know if this failed?
❌ **Sounds like AI** - Write like a human, not a chatbot

---

## After the PRD is Done

```
Great work! Your PRD is ready for review.

**Next steps:**
1. Share with stakeholders for feedback
2. Walk through it in your XFN kickoff
3. Update it as you learn more (gossip to me!)
4. Move it to the next stage when ready

**Want me to:**
- `/create-tickets` -- Turn this PRD into engineering tickets
- `/slack-message` -- Draft a Slack message announcing this PRD
- `/feature-metrics` -- Deep-dive on success metrics with STEDII
- `/impact-sizing` -- Quantify the user/revenue impact
- `/generate-ai-prototype` -- Create a prototype prompt from this spec
```

## Final Step: Push to Personal Notion Docs

After saving the PRD file to `work/docs/prds/`, push it to your Personal Notion Docs DB:

```bash
notion-personal create "2fd2f4d2-943e-8082-8c8f-e09a86954344" "[PRD title]" '{"Type": {"select": {"name": "PRD"}}}'
```

Then append the full PRD content to the newly created page using `notion-personal append "[page-id]" "[content]"`.

Tell the user: "Pushed to your Personal Notion Docs."

---

## Output Integration

### Where Files Go

**PRD documents:**
- Active work: `work/docs/prds/[feature-name]-[stage].md`
- When finalized: Move to `work/docs/prds/[feature-name].md` for historical reference
- Evolve through stages: Team Kickoff → Planning Review → XFN Kickoff → Solution Review → Launch → Impact

### Link to Other Work

After creating PRD:
- **Reference in status updates** - Feature appears in `/status-update` with link to PRD
- **Create tickets** - Use `/create-tickets` to turn PRD sections into engineering tasks
- **Plan roadmap** - PRD informs quarterly prioritization
- **Track results** - Use `/feature-results` to measure actual impact post-launch

### Cross-Skill Integration

**Feeds into:**
- `/feature-metrics` - PRD success metrics section gets detailed STEDII analysis
- `/impact-sizing` - PRD Strategic Fit section gets quantified user/revenue impact
- `/status-update` - PRD progress gets included in weekly updates
- `/feature-results` - PRD success criteria are measured here post-launch

**Pulls from:**
- `/user-research-synthesis` - User quotes and insights populate Hypothesis
- `/impact-sizing` - Usage estimates and revenue impact go into Strategic Fit
- `/interview-guide` - User research that validated the problem
- `work/site/strategy/` - Strategic pillar and alignment context
- `/define-north-star` - Ensure feature's success metrics ladder to North Star

---

---

## Output Quality Self-Check

Before presenting the PRD draft to the PM, verify:

- [ ] **Filename follows convention:** `[feature-name-kebab-case]-[stage].md` (e.g., `voice-task-capture-team-kickoff.md`)
- [ ] **Saved to correct location:** `work/docs/prds/` (NOT `work/docs/prds/`)
- [ ] **Word count matches stage:** Check against the Stage-Specific Length Guidance table
- [ ] **Hypothesis is testable:** Contains a clear "If we... then... because..." statement
- [ ] **Strategic fit references actual strategy:** Cites specific goals from `work/site/strategy/`, not generic strategy language
- [ ] **Non-goals are specific:** Each non-goal explains WHY it's excluded, not just what it is
- [ ] **Success metrics have baselines and targets:** Not just "increase X" but "X from [current] to [target] by [date]"
- [ ] **Kill criteria are realistic:** Would the team actually pull the plug at this threshold?
- [ ] **Behavior Examples vs Solution Overview:** AI features have the behavior table; non-AI features have the solution overview
- [ ] **Sounds human:** Read it aloud -- does it sound like the PM wrote it, or like an AI generated it?
- [ ] **User quotes included:** If user research exists in `work/docs/research/`, at least one real quote is referenced
- [ ] **Open questions have owners:** Every open question has a @stakeholder assigned

---

**Remember:** The PRD is a tool for alignment, not a work of art. Ship it, discuss it, iterate on it.

---

# Part 2: Full PRD Workflow

For comprehensive end-to-end PRD creation, follow this 7-step process.

## Step-by-Step Workflow

### Workflow Step 1: Gather Context (10 min)

Before touching AI, collect:

**Research & Data:**
- User research findings (interviews, surveys)
- Analytics data (usage patterns, metrics)
- Support tickets (common issues, requests)
- Competitive analysis

**Strategic Context:**
- How this ladders to OKRs
- Business case (revenue/user impact)
- Strategic importance (why now?)

**Technical Context:**
- Existing architecture constraints
- Integration requirements
- Known dependencies

### Workflow Step 2: Generate First Draft (5 min)

Use the conversational workflow in Step 1-3 above to generate your first draft.

### Workflow Step 3: Enhance Each Section (30-60 min)

**Problem Statement:**
- [ ] Add specific customer quotes
- [ ] Include quantitative data
- [ ] Connect to company strategy

**Solution:**
- [ ] Explain WHY this solution
- [ ] Detail alternatives considered
- [ ] Call out tradeoffs made

**Success Metrics:**
- [ ] Define leading AND lagging indicators
- [ ] Set specific targets
- [ ] Define success criteria

### Workflow Step 4: Multi-Perspective Review (15 min)

Use the multi-agent review in Step 3 above to get feedback from:
- Engineering (feasibility)
- Design (UX)
- Executive (strategy)
- Customer voice (user needs)

### Workflow Step 5: Human Review

**Must review with:**
- Engineering lead
- Design lead
- Your manager

**Should review with:**
- Key stakeholders
- PM peers

### Workflow Step 6: Refine & Ship (30 min)

**Final checklist:**
- [ ] Can someone unfamiliar understand it?
- [ ] All sections complete
- [ ] Dependencies identified
- [ ] Success criteria clear
- [ ] Next steps defined

### Workflow Step 7: Announce

```
Hi team,

I've published the PRD for [Feature Name]: [link]

TL;DR: [One sentence]
Why now: [Strategic rationale]
Timeline: [When we plan to start/ship]

Action needed:
- Engineering: Review technical approach by [date]
- Design: Review UX approach by [date]

Questions? Drop them in [Slack channel].
```

---

# Part 3: AI Feature PRDs

**When to use:** When building any AI-powered feature, LLM integration, or ML product.

## Why AI PRDs Are Different

AI is fundamentally different from traditional features:
- **Non-deterministic:** Same input → different outputs
- **Probabilistic:** Can't guarantee 100% accuracy
- **Context-dependent:** Quality depends on prompt, data, user intent
- **Edge cases everywhere:** Infinite ways to break it

## AI PRD Additional Sections

### Behavior Specification (Required for AI)

Create a table with three categories:

| User Input | Expected Behavior | Category |
|------------|-------------------|----------|
| [Example 1] | [What AI should do] | ✅ Good |
| [Example 2] | [What AI should do] | ✅ Good |
| [Example 3] | [Graceful handling] | ❌ Bad |
| [Example 4] | [Must refuse] | 🚫 Reject |

**Good:** AI performs correctly
**Bad:** AI should handle gracefully (don't break)
**Reject:** AI must refuse (safety, policy violations)

**Tip:** Write 10-20 examples covering edge cases.

### AI Constraints

**Model constraints:**
- Model type: (GPT-5.2, Claude Opus 4.5, etc.)
- Max tokens: input/output limits
- Latency requirements: response time SLA
- Cost constraints: $ per 1M tokens

**Quality constraints:**
- Accuracy target: % correct responses
- Hallucination rate: max % of made-up facts
- Refusal rate: % of "I don't know" responses

**Safety constraints:**
- Content filtering requirements
- PII handling policy
- Bias mitigation requirements

### Edge Case Handling

**Common AI edge cases:**

1. **Ambiguous input**
   - AI asks clarifying questions

2. **Out-of-scope request**
   - AI explains what it can help with instead

3. **Harmful/unsafe request**
   - AI refuses with explanation

4. **Insufficient context**
   - AI asks for more information

5. **Low confidence**
   - AI admits uncertainty

### Graceful Degradation

**Fallback hierarchy:**
1. Retry with modified prompt
2. Offer alternative action
3. Escalate to human
4. Fail gracefully with clear message

### AI Evaluation Plan

**Pre-launch:**
- Test set: 100-500 hand-labeled examples
- Human evaluation: Team rates 50 outputs
- Edge case coverage: Test all known failure modes

**Post-launch:**
- Thumbs up/down feedback
- Correction rate (% of edited outputs)
- Abandonment rate
- Escalation rate

## 10 Principles for AI Products

1. **Focus on user value** - Users care about outcomes, not technology
2. **Anticipate mistakes** - Show confidence, allow corrections
3. **Start simple** - One use case, nail it, expand
4. **Make AI transparent** - What it can/can't do, when uncertain
5. **Build for iteration** - Feedback loops from Day 1
6. **Design for diverse users** - Beginners and experts
7. **Control context** - System instructions, user history, RAG
8. **Optimize for latency** - Streaming, perceived performance
9. **Safety is non-negotiable** - Input/output filtering, rate limiting
10. **Measure what matters** - Satisfaction, completion, corrections

## AI PRD Template Addition

Add this to the standard PRD for AI features:

```markdown
## AI Behavior Specification

| User Input | Expected Behavior | Category |
|------------|-------------------|----------|
| [Example] | [Response] | ✅ Good |
| [Example] | [Response] | ❌ Bad |
| [Example] | [Response] | 🚫 Reject |

## AI Constraints
- Model: [GPT-5.2 / Claude Opus 4.5 / etc.]
- Latency: P95 < ___ ms
- Accuracy target: >___%
- Hallucination rate: <___%

## Safety & Compliance
- Content filtering: [policy]
- PII handling: [policy]
- Audit logging: [policy]

## Graceful Degradation
1. [First fallback]
2. [Second fallback]
3. [Human escalation]
4. [Final error state]

## AI-Specific Kill Criteria
- Accuracy < ___% after 2 weeks
- User satisfaction < ___%
- Escalation rate > ___%
```
