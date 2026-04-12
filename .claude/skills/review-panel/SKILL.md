---
name: review-panel
description: Dispatch a panel of specialized reviewer agents to audit any implementation — code, rules, systems, or content. Returns a prioritized list of bugs, gaps, and proposals.
---

# Review Panel

Dispatches 3 specialized agents in parallel to review what was just built. Each looks through a different lens. Results are synthesized into a ranked action list.

## Auto-Triggers

Invoke this skill automatically (or offer it unprompted) when:

| Signal | Why |
|--------|-----|
| "I just built X" / "just implemented X" / "just shipped X" | Implementation is done, review is the natural next step |
| A classification, tagging, routing, or rules system was changed | Silent failures are the risk — correctness + edge cases matter |
| A script or automation was written or modified | Automations run unattended; bugs are invisible until they compound |
| A config file that controls behavior was updated | Config drift and missing entries are classic failure modes |
| A data pipeline or transformation was completed | Wrong outputs propagate silently |
| Niki asks "does this look right?" / "anything I'm missing?" after building something | She's asking for review |
| A backfill or migration ran across many files | Easy to miss a class of inputs |
| Multiple files/rules were changed in one session | More surface area = more likely something was missed |

Not for PRDs (use `/prd-review-panel`). Not for UI (use `/ux-judgment`). This is for systems and code.

## How to Invoke

```
/review-panel [describe what was built in 1-2 sentences]
```

Example:
```
/review-panel auto-tagging system in build-content-cache.mjs that assigns labels to markdown files based on path, frontmatter, and keyword rules
```

**No need to combine with `/delegate-work`** — this skill dispatches agents itself.

---

## Step 1 — Frame the Work

Before dispatching agents, extract from the user's description (or ask if missing):
- **What was built**: system name, file(s), purpose
- **What it does**: inputs → outputs
- **What correct looks like**: how would we know it's working?
- **Key risks**: what kinds of failures matter most?

---

## Step 2 — Dispatch 3 Reviewers in Parallel

**Always dispatch agents yourself — do not ask the user to `/delegate-work`.** All agents run in background (`run_in_background: true`). Each gets a self-contained prompt with the file path(s) and enough context to work independently.

### Reviewer 1: Correctness Spot-Check
**Lens**: Does the implementation actually do what it claims?
- Samples real inputs (20-30 files, rows, entries)
- Manually traces through the rules for each
- Reports: false positives, missing outputs, wrong classifications
- Finds: the thing that looks fine in code but breaks on real data

Prompt template:
```
You are a correctness reviewer. Sample [N] real [files/records/inputs] and manually trace through the rules in [file]. For each, compute expected output vs what the rules actually produce. Report only actual discrepancies — false positives, missing outputs, or wrong classifications. Max 15 lines, no preamble.
```

### Reviewer 2: Edge Case + False Positive Hunter
**Lens**: What inputs weren't considered?
- Reads every rule
- For each rule: what non-obvious input could trigger it falsely?
- Checks regex patterns for alternation/boundary bugs
- Looks for overly broad matches, missing anchors, ambiguous keywords
- Finds: the thing that works on the happy path but breaks on edge cases

Prompt template:
```
You are an edge case reviewer. Read every rule in [file]. For each rule, identify: (1) non-obvious inputs that trigger it falsely, (2) regex/logic bugs (especially alternation without word boundaries), (3) common words in this codebase that would hit the wrong rule. Propose specific fixes. Max 15 lines, prioritized by severity.
```

### Reviewer 3: Maintainability + Future-Proofing
**Lens**: What breaks next month?
- Finds values duplicated across multiple files that could drift
- Identifies implicit contracts (X must match Y or things break silently)
- Looks for missing validation, logging, or test coverage
- Asks: if someone adds a new [template/category/rule] without reading all the code, what silently breaks?
- Finds: the time bomb

Prompt template:
```
You are a maintainability reviewer. Read [file(s)]. Find: (1) values duplicated across files that could drift, (2) implicit contracts with no enforcement, (3) silent failure modes, (4) anything that breaks when a new [template/category/rule] is added without updating everything. Propose specific fixes. Max 15 lines, prioritized by impact.
```

---

## Step 3 — Synthesize Results

When all 3 agents complete, produce a ranked list:

```
## Review Findings — [system name]

### Must Fix (breaks correctness)
1. [Issue] — [which reviewer found it] — Fix: [specific change]

### Should Fix (creates drift or silent failures)
2. [Issue] — Fix: [specific change]

### Nice to Have (polish, edge cases)
3. [Issue] — Fix: [specific change]

### No Issues Found
- [area]: all sampled cases correct
```

Ask: "Want me to implement any of these?"

---

## Notes

- Agents have no session context — write fully self-contained prompts with file paths
- For large codebases: give agents specific files, not "look at the repo"
- If a reviewer returns "no issues found" — that's a valid result, not a failure
- The value is the parallel independent reads: 3 reviewers catch more than 1
