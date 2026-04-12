---
name: requirements-clarity
description: Use when engineers are asking clarifying questions, requirements feel underspecified before sprint kickoff, or a stakeholder ask needs translation into something buildable. Keywords: "what exactly do you want", "requirements aren't clear", "can you clarify", "scope isn't defined", "what does that mean technically", "can you be more specific about".
---

# Requirements Clarity Skill

## The Five Dimensions Where Requirements Are Always Ambiguous

Most requirements that seem clear actually have critical gaps in at least one of these five areas. Work through each one before declaring requirements done.

### 1. Scope Boundary

"What's included" is rarely explicit enough. The more important question is: "What is explicitly NOT included?"

Teams waste weeks building things that weren't asked for because the boundary wasn't stated. Every requirement should have a "what's out of scope" section that's as specific as the "what's in scope" section.

Force clarity with: "If a user asks for X behavior that seems related, is that in scope for this ticket?" Keep asking variants of that until you find the edge you haven't defined.

### 2. Edge Cases and Empty States

Most specs describe the happy path only. Edge cases that are never specified become implicit requirements on the engineer, who then makes a judgment call that may not match what the PM expected.

Questions that reliably surface hidden edge cases:
- What happens when the user has no data yet? (Empty state)
- What happens when the user has too much data? (Scale edge)
- What happens when a dependency is unavailable?
- What happens if the user does this twice in a row?
- What happens if two users do this simultaneously?

If the engineer has to make a judgment call on any of these, the spec isn't done.

### 3. Error States

Requirements almost never specify error behavior. But error states are product decisions, not engineering decisions. "Return an error" is not a spec. The spec is: what does the user see, what can they do next, and does the system recover automatically or require manual action?

For every success state in the requirement, force yourself to write at least one error state. If you can't write it, you don't understand the requirement well enough.

### 4. Performance Thresholds

"It should be fast" is not a requirement. "P95 response time under 500ms for payloads up to 100KB" is. Without explicit thresholds, engineers build to their own bar, QA tests to a different bar, and the PM is disappointed at launch.

This matters especially for AI inference products where latency variance is high and customers have SLAs. Define: acceptable latency (P50, P95), acceptable error rate, acceptable throughput, and what happens when thresholds are exceeded.

### 5. Rollout Conditions

Who gets this feature and when? If it's a gradual rollout: which users are in the first cohort, what criteria determine graduation to the next cohort, and who decides? If it's a flag: who can enable it, and what's the default state for new users vs existing users?

This sounds operational but it's often product — especially for enterprise features where some customers are in beta and others aren't.

---

## When "We Don't Know Yet" Is the Right Answer

Not every gap needs to be resolved before work starts. The discipline is knowing which gaps are blockers vs which can be decided during implementation.

**Blockers (must resolve before starting):** Any ambiguity that would cause the engineer to make an irreversible architectural decision. Database schema, API contract design, data retention policy. Getting these wrong costs 10x to fix.

**Deferred (can decide during implementation):** Exact copy, specific visual polish, non-critical edge cases that can be filed as follow-up tickets. These can be documented as "TBD — engineer to flag when they hit this" rather than blocking the ticket.

The anti-pattern is using "we don't know yet" to avoid making a decision that's actually knowable. If the PM could answer the question in 5 minutes with a phone call, that's avoidance, not genuine uncertainty.

---

## How to Write Requirements That Survive the Person Who Wrote Them

A requirement is done when a stranger could implement it correctly without asking any follow-up questions. Test this by reading your own requirement 24 hours after writing it and asking: what decisions would I still need to make if I were the engineer starting this fresh?

Specific techniques:
- **Use examples.** "For example, if a user has 3 organizations and clicks X, they should see Y" does more work than any amount of abstract description.
- **State the invariants.** What must always be true, regardless of implementation? ("The API key is never logged in plaintext" is an invariant, not an implementation detail.)
- **Name the constraints.** "This must work for orgs with up to 10,000 members" is a constraint. Without it, an engineer optimizes for a much smaller scale.
- **Define the rollback.** If this feature causes a problem, how do we turn it off? The answer should be in the requirement, not figured out during an incident.

---

## Instructions

When invoked, detect vague requirements:

1. **Vague Feature Requests**
   - User says: "add login feature", "implement payment", "create dashboard"
   - Missing: How, with what technology, what constraints?

2. **Missing Technical Context**
   - No technology stack mentioned
   - No integration points identified
   - No performance/security constraints

3. **Incomplete Specifications**
   - No acceptance criteria
   - No success metrics
   - No edge cases considered
   - No error handling mentioned

4. **Ambiguous Scope**
   - Unclear boundaries ("user management" - what exactly?)
   - No distinction between MVP and future enhancements
   - Missing "what's NOT included"

**Do NOT activate when**:
- Specific file paths mentioned (e.g., "auth.go:45")
- Code snippets included
- Existing functions/classes referenced
- Bug fixes with clear reproduction steps

## Core Principles

1. **Systematic Questioning**
   - Ask focused, specific questions
   - One category at a time (2-3 questions per round)
   - Build on previous answers
   - Avoid overwhelming users

2. **Quality-Driven Iteration**
   - Continuously assess clarity score (0-100)
   - Identify gaps systematically
   - Iterate until ≥ 90 points
   - Document all clarification rounds

3. **Actionable Output**
   - Generate concrete specifications
   - Include measurable acceptance criteria
   - Provide executable phases
   - Enable direct implementation

## Clarification Process

### Step 1: Initial Requirement Analysis

**Input**: User's requirement description

**Tasks**:
1. Parse and understand core requirement
2. Generate feature name (kebab-case format)
3. Determine document version (default `1.0` unless user specifies otherwise)
4. Ensure `./docs/prds/` exists for PRD output
5. Perform initial clarity assessment (0-100)

**Assessment Rubric**:
```
Functional Clarity: /30 points
- Clear inputs/outputs: 10 pts
- User interaction defined: 10 pts
- Success criteria stated: 10 pts

Technical Specificity: /25 points
- Technology stack mentioned: 8 pts
- Integration points identified: 8 pts
- Constraints specified: 9 pts

Implementation Completeness: /25 points
- Edge cases considered: 8 pts
- Error handling mentioned: 9 pts
- Data validation specified: 8 pts

Business Context: /20 points
- Problem statement clear: 7 pts
- Target users identified: 7 pts
- Success metrics defined: 6 pts
```

**Initial Response Format**:
```markdown
I understand your requirement. Let me help you refine this specification.

**Current Clarity Score**: X/100

**Clear Aspects**:
- [List what's clear]

**Needs Clarification**:
- [List gaps]

Let me systematically clarify these points...
```

### Step 2: Gap Analysis

Identify missing information across four dimensions:

**1. Functional Scope**
- What is the core functionality?
- What are the boundaries?
- What is out of scope?
- What are edge cases?

**2. User Interaction**
- How do users interact?
- What are the inputs?
- What are the outputs?
- What are success/failure scenarios?

**3. Technical Constraints**
- Performance requirements?
- Compatibility requirements?
- Security considerations?
- Scalability needs?

**4. Business Value**
- What problem does this solve?
- Who are the target users?
- What are success metrics?
- What is the priority?

### Step 3: Interactive Clarification

**Question Strategy**:
1. Start with highest-impact gaps
2. Ask 2-3 questions per round
3. Build context progressively
4. Use user's language
5. Provide examples when helpful

**Question Format**:
```markdown
I need to clarify the following points to complete the requirements document:

1. **[Category]**: [Specific question]?
   - For example: [Example if helpful]

2. **[Category]**: [Specific question]?

3. **[Category]**: [Specific question]?

Please provide your answers, and I'll continue refining the PRD.
```

**After Each User Response**:
1. Update clarity score
2. Capture new information in the working PRD outline
3. Identify remaining gaps
4. If score < 90: Continue with next round of questions
5. If score ≥ 90: Proceed to PRD generation

**Score Update Format**:
```markdown
Thank you for the additional information!

**Clarity Score Update**: X/100 → Y/100

**New Clarified Content**:
- [Summarize new information]

**Remaining Points to Clarify**:
- [List remaining gaps if score < 90]

[If score < 90: Continue with next round of questions]
[If score ≥ 90: "Perfect! I will now generate the complete PRD document..."]
```

### Step 4: PRD Generation

Once clarity score ≥ 90, generate comprehensive PRD.

**Output File**:

1. **Final PRD**: `./docs/prds/{feature_name}-v{version}-prd.md`

Use the `Write` tool to create or update this file. Derive `{version}` from the document version recorded in the PRD (default `1.0`).

## PRD Document Structure

```markdown
# {Feature Name} - Product Requirements Document (PRD)

## Requirements Description

### Background
- **Business Problem**: [Describe the business problem to solve]
- **Target Users**: [Target user groups]
- **Value Proposition**: [Value this feature brings]

### Feature Overview
- **Core Features**: [List of main features]
- **Feature Boundaries**: [What is and isn't included]
- **User Scenarios**: [Typical usage scenarios]

### Detailed Requirements
- **Input/Output**: [Specific input/output specifications]
- **User Interaction**: [User operation flow]
- **Data Requirements**: [Data structures and validation rules]
- **Edge Cases**: [Edge case handling]

## Design Decisions

### Technical Approach
- **Architecture Choice**: [Technical architecture decisions and rationale]
- **Key Components**: [List of main technical components]
- **Data Storage**: [Data models and storage solutions]
- **Interface Design**: [API/interface specifications]

### Constraints
- **Performance Requirements**: [Response time, throughput, etc.]
- **Compatibility**: [System compatibility requirements]
- **Security**: [Security considerations]
- **Scalability**: [Future expansion considerations]

### Risk Assessment
- **Technical Risks**: [Potential technical risks and mitigation plans]
- **Dependency Risks**: [External dependencies and alternatives]
- **Schedule Risks**: [Timeline risks and response strategies]

## Acceptance Criteria

### Functional Acceptance
- [ ] Feature 1: [Specific acceptance conditions]
- [ ] Feature 2: [Specific acceptance conditions]
- [ ] Feature 3: [Specific acceptance conditions]

### Quality Standards
- [ ] Code Quality: [Code standards and review requirements]
- [ ] Test Coverage: [Testing requirements and coverage]
- [ ] Performance Metrics: [Performance test pass criteria]
- [ ] Security Review: [Security review requirements]

### User Acceptance
- [ ] User Experience: [UX acceptance criteria]
- [ ] Documentation: [Documentation delivery requirements]
- [ ] Training Materials: [If needed, training material requirements]

## Execution Phases

### Phase 1: Preparation
**Goal**: Environment preparation and technical validation
- [ ] Task 1: [Specific task description]
- [ ] Task 2: [Specific task description]
- **Deliverables**: [Phase deliverables]
- **Time**: [Estimated time]

### Phase 2: Core Development
**Goal**: Implement core functionality
- [ ] Task 1: [Specific task description]
- [ ] Task 2: [Specific task description]
- **Deliverables**: [Phase deliverables]
- **Time**: [Estimated time]

### Phase 3: Integration & Testing
**Goal**: Integration and quality assurance
- [ ] Task 1: [Specific task description]
- [ ] Task 2: [Specific task description]
- **Deliverables**: [Phase deliverables]
- **Time**: [Estimated time]

### Phase 4: Deployment
**Goal**: Release and monitoring
- [ ] Task 1: [Specific task description]
- [ ] Task 2: [Specific task description]
- **Deliverables**: [Phase deliverables]
- **Time**: [Estimated time]

---

**Document Version**: 1.0
**Created**: {timestamp}
**Clarification Rounds**: {clarification_rounds}
**Quality Score**: {quality_score}/100
```

## Behavioral Guidelines

### DO
- Ask specific, targeted questions
- Build on previous answers
- Provide examples to guide users
- Maintain conversational tone
- Summarize clarification rounds within the PRD
- Use clear, professional English
- Generate concrete specifications
- Stay in clarification mode until score ≥ 90

### DON'T
- Ask all questions at once
- Make assumptions without confirmation
- Generate PRD before 90+ score
- Skip any required sections
- Use vague or abstract language
- Proceed without user responses
- Exit skill mode prematurely

## Success Criteria

- Clarity score ≥ 90/100
- All PRD sections complete with substance
- Acceptance criteria checklistable (using `- [ ]` format)
- Execution phases actionable with concrete tasks
- User approves final PRD
- Ready for development handoff
