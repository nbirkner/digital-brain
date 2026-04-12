---
name: create-tickets
description: Use when breaking down a PRD or feature into actionable engineering work, preparing for sprint planning, or when an engineer asks "what exactly do you want me to build?" Keywords: "create tickets for", "break this into tickets", "Linear tickets for", "sprint planning", "what should I put in the ticket for", "how should we scope this".
---

# Create Tickets Skill

Generate engineering tickets from PRDs, feature specs, or task lists. Supports direct creation via Linear/Jira MCP or formatted text output.

## What Makes a Ticket Engineers Actually Want to Work On

The purpose of a ticket is to transfer context, not transfer work. An engineer should be able to read a ticket and understand the outcome they're driving toward, the constraints they're working within, and the definition of done. They should not need to re-read the PRD, ping the PM, or guess at edge cases.

**Write to the outcome, not the implementation.** "Add a loading state to the API key generation flow so users don't double-click and generate duplicates" is better than "Add spinner to API key button." One describes the problem and constraint. The other describes an implementation that may or may not solve it. Give engineers the outcome and the context — they'll find the best implementation.

**The right level of granularity is the hardest part.** Too small (1-hour tasks) and you're micromanaging, creating overhead, and obscuring progress. Too big (2-week tasks) and you have no signal until something is done, and engineers can't parallelize. The sweet spot is 1-3 days: small enough to move fast, big enough to carry real context.

**Acceptance criteria serve a different function than most PMs think.** ACs aren't a description of what the feature does. They're a contract: if all these things are true, the ticket is done and you don't need to ask the PM. Write them as binary tests, not descriptions. "User sees an error message if token limit is exceeded" is a test. "Error handling works correctly" is not.

**The most under-written section is edge cases.** "What happens if X?" in a ticket body has prevented countless bugs. Explicitly include: empty states, concurrent requests, permissions edge cases, what happens if a dependency is unavailable, and any constraint the PRD mentioned but didn't fully specify.

**Tickets should survive the person who wrote them.** If the PM is out sick on the day engineering starts the ticket, can the engineer proceed? If no, the ticket isn't done yet.

## Quick Start

1. Point me to the source: PRD, feature spec, meeting action items, or describe the work
2. I break it down into well-structured tickets with acceptance criteria
3. Each ticket gets an effort estimate, dependencies, and component label
4. If Linear/Jira MCP is connected, I create tickets directly; otherwise, I generate copy-paste text
5. I provide a dependency summary and sprint assignment suggestion

**Example:** "Create tickets from work/docs/prds/checkout-redesign.md targeting a March 15 launch"

**Output:** Tickets created in Linear/Jira, or saved to `work/docs/analyses/[feature]-tickets.md`

**Time:** 15-30 minutes depending on PRD complexity

## When to Use This Skill

- Breaking down PRDs into implementation tickets
- Converting feature specs into actionable tasks
- Batch ticket creation from roadmap items
- Generating ticket text for manual entry

## Prerequisites

**Optional but Recommended:**
- `linear` CLI available (for direct ticket creation)

**Fallback:**
- Generates formatted ticket text for manual copy-paste

## Workflow

### Step 1: Gather Context

Ask the PM:
1. **Source document:** PRD, feature spec, or task list?
2. **Target system:** Linear, Jira, or text output?
3. **Project/Team:** Which project/team should receive tickets?
4. **Ticket type:** Story, Task, Bug, Epic?
5. **Priority level:** High, Medium, Low?

### Step 2: Analyze Source Material

Read the source document and identify:
- **User-facing features** (frontend work)
- **API/Backend work** (backend work)
- **Data migrations** (data engineering)
- **Infrastructure changes** (DevOps)
- **Testing requirements** (QA)
- **Documentation needs** (docs)

### Step 3: Create Ticket Structure

For each ticket, generate:

**Title Format:**
```
[Component] Action: Brief description
```
Examples:
- `[API] Add endpoint for user preferences`
- `[Frontend] Build preference selection UI`
- `[DB] Create user_preferences table`

**Ticket Body:**

```markdown
## Context
[Link to PRD or parent epic]

## Objective
[What this ticket accomplishes]

## Acceptance Criteria
- [ ] Specific outcome 1
- [ ] Specific outcome 2
- [ ] Specific outcome 3

## Technical Notes
[API contracts, data schemas, edge cases]

## Dependencies
- Blocked by: [Other ticket]
- Blocks: [Other ticket]

## Testing Requirements
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual QA steps

## Resources
- Design: [Figma link]
- API Spec: [Swagger/OpenAPI]
- Related PRD: [Link]
```

## Non-Negotiables Per Ticket

Every ticket, without exception, must include:
- **`[Component]` prefix in title**: No bare titles. Must be `[API] Add endpoint`, `[Frontend] Build UI`, `[DB] Migrate schema`.
- **Acceptance Criteria**: Minimum 3 specific, testable outcomes. "Works correctly" or "functions as expected" is not AC.
- **Effort estimate**: T-shirt size in the metadata line (not buried in the body).
- **Dependencies**: Explicit `Blocked by:` and `Blocks:` lines. Write "None" if none — never leave blank.

If any field is unknown, flag it with `[UNKNOWN — needs PM input]` rather than omitting it.

### Step 4: Create or Output Tickets

**Using `linear` CLI:**
```bash
linear create <TEAM-KEY> "<title>" "<description>" <priority 0-4>
# For tickets with parent: use create-full with JSON including parentId
linear create-full '{"teamId":"<id>","title":"<title>","description":"<desc>","priority":2,"parentId":"<parent-id>"}'
# Check teams: linear teams
```

**Fallback - Text Output:**
```
Generate formatted ticket text
Number tickets sequentially
Provide copy-paste instructions
```

## Bulk Creation

When creating 5+ tickets:

1. **Create Epic first** (if applicable)
2. **Group by component** (Frontend, Backend, Data, etc.)
3. **Order by dependency** (foundation tickets first)
4. **Add estimates** (if PM provides sizing)
5. **Link tickets** (blockers, related work)

## Effort Estimation Framework

For each ticket, include an effort estimate using T-shirt sizing:

| Size | Time | Description | Example |
|------|------|-------------|---------|
| **XS** | <2 hours | Config change, copy update, simple fix | Update error message text |
| **S** | Half day | Single-file change, straightforward logic | Add input validation to a form |
| **M** | 1-2 days | Multi-file change, moderate complexity | Build a new API endpoint with tests |
| **L** | 3-5 days | Cross-component work, integration needed | Build complete CRUD feature with UI |
| **XL** | 1-2 weeks | Large scope, multiple systems involved | New authentication system |

**Estimation rules:**
- If the PM provides estimates, use them. If not, suggest one based on typical complexity for the work type.
- Always flag **XL tickets as candidates for splitting.** Suggest how to break them down: "This XL ticket could be split into [DB migration (M)] + [API layer (M)] + [Frontend (L)]."
- Include estimate in the ticket metadata, not buried in the body.
- When in doubt, round up. Underestimates erode trust; overestimates create buffer.

### Alternative: Story Points

Some teams prefer story points over T-shirt sizes. If the team uses story points:

| Points | Complexity | Roughly Equivalent To |
|--------|-----------|----------------------|
| 1 | Trivial change, well-understood | XS (few hours) |
| 2 | Small change, minimal unknowns | S (half day - 1 day) |
| 3 | Medium change, some unknowns | M (1-2 days) |
| 5 | Significant change, moderate unknowns | L (3-5 days) |
| 8 | Large change, many unknowns | XL (1-2 weeks) |
| 13 | Very large, high uncertainty | Split this ticket |

**Which to use:** Ask the PM or check existing tickets in the project management tool. Default to T-shirt sizes if unknown -- they're more intuitive for non-engineers.

**Ticket format with estimate:**
```
=== TICKET 1 ===
Title: [API] Add CRUD endpoints for user preferences
Estimate: M (1-2 days)
...
```

## Sprint/Milestone Assignment

If the PM has a target launch date, work backwards from the deadline to suggest sprint assignments.

**Sprint grouping logic:**

```
Sprint 1 (Foundation & Blockers):
- Database migrations
- API contracts and core endpoints
- Infrastructure/DevOps setup
- Tickets that block everything else

Sprint 2 (Core Functionality):
- Frontend components
- Business logic implementation
- Integration between frontend and backend
- Core user flow working end-to-end

Sprint 3 (Polish & Edge Cases):
- Error handling and edge cases
- Performance optimization
- Accessibility fixes
- Documentation and help content
- QA and testing tickets
```

**Capacity check:**
- Assume 6-8 productive hours per developer per day
- Assume 80% utilization (meetings, reviews, context-switching)
- Sum ticket estimates per sprint and compare to available developer-days
- If estimated effort exceeds sprint capacity, flag: "Sprint 2 is overloaded by ~3 days. Consider moving [ticket X] to Sprint 3 or adding capacity."

## Handling Early-Stage or Partial PRDs

When the PRD is at Team Kickoff or Planning Review stage (requirements are still fuzzy):

**Adjust ticket creation:**
- Create "Spike" tickets for areas with high uncertainty: "[Spike] Investigate feasibility of [unclear requirement] -- Timebox: 2 days"
- Mark fuzzy requirements with a [TBD] tag: "Acceptance criteria TBD pending design review"
- Use wider T-shirt size ranges: "M-L (1-5 days) -- depends on API complexity once spike is complete"
- Add a "Requirements Checkpoint" ticket: "Review updated PRD with engineering before starting implementation"

**What NOT to do:**
- Don't create detailed acceptance criteria for fuzzy requirements (they'll change)
- Don't estimate with false precision (don't say "3 days" when you mean "1-2 weeks, maybe")
- Don't skip the tickets entirely -- even fuzzy work needs tracking

**Flag it:** Start the ticket breakdown with: "Note: PRD is at [Stage] stage. Some tickets have [TBD] acceptance criteria that will be refined as requirements solidify."

## Dependency Mapping

Identify and mark dependencies between tickets. Use explicit notation in each ticket:

```
## Dependencies
- **Blocked by:** TICKET-3 (DB schema must exist before API can be built)
- **Blocks:** TICKET-7 (Frontend needs this API to integrate)
```

**After generating all tickets, provide a dependency summary:**

```
## Dependency Summary

TICKET-1 [DB Schema] --> TICKET-3 [API Endpoints] --> TICKET-5 [Frontend Integration]
TICKET-2 [Auth Setup] --> TICKET-4 [Protected Routes] --> TICKET-5 [Frontend Integration]
TICKET-5 [Frontend Integration] --> TICKET-6 [E2E Tests]

Critical path: TICKET-1 --> TICKET-3 --> TICKET-5 --> TICKET-6
Estimated critical path duration: 7-10 days

Independent tickets (can be done in parallel):
- TICKET-7 [Documentation] -- no blockers
- TICKET-8 [Analytics instrumentation] -- no blockers
```

**Dependency rules:**
- Every ticket should state its dependencies (even if "None")
- Circular dependencies are a red flag -- restructure the tickets
- If a ticket has 3+ blockers, consider whether it should be split

## Ticket Quality Checklist

Before creating tickets, verify:
- ✅ Title is clear and specific
- ✅ Acceptance criteria are testable
- ✅ Technical context is sufficient for engineers
- ✅ Dependencies are identified
- ✅ Edge cases are documented
- ✅ Testing requirements are clear
- ✅ Links to designs/specs included

## Common Ticket Patterns

### Feature Work
```
Epic: User Preferences System
  ├── [DB] Create user_preferences table
  ├── [API] Add CRUD endpoints for preferences
  ├── [Frontend] Build preferences UI
  └── [QA] Test preferences end-to-end
```

### Bug Fixes
```
Title: [Component] Fix: Description of bug
Body:
  - Current behavior: [What's broken]
  - Expected behavior: [What should happen]
  - Repro steps: [How to reproduce]
  - Root cause: [If known]
```

### Infrastructure
```
Title: [DevOps] Setup: Description
Body:
  - Current state: [What exists]
  - Desired state: [What we need]
  - Migration plan: [How to get there]
  - Rollback plan: [How to revert if needed]
```

## Integration Examples

### Linear CLI
```bash
# Create epic
linear create IC "User Preferences System" "Epic description" 1

# Create child tickets (use create-full to set parentId)
linear create-full '{"teamId":"6b290514-3800-4e82-8efa-07b651083109","title":"Child ticket","description":"...","priority":2,"parentId":"ISSUE-ID"}'

# List teams for IDs
linear teams
```

### Jira MCP
```python
# Create epic
epic = jira.create_issue({
  "project": "PROJ",
  "issuetype": "Epic",
  "summary": "User Preferences System",
  "description": "[Epic description]"
})

# Create stories
for ticket in tickets:
  jira.create_issue({
    "project": "PROJ",
    "issuetype": "Story",
    "summary": ticket.title,
    "description": ticket.body,
    "epic_link": epic.key
  })
```

## Pro Tips

1. **One ticket, one thing:** Avoid "also do X" tickets
2. **Size appropriately:** 1-3 days ideal, split if larger
3. **Clear acceptance criteria:** Engineers know when done
4. **Link liberally:** PRDs, designs, related tickets
5. **Front-load context:** Engineers shouldn't hunt for info
6. **Call out edge cases:** "What happens if X?"
7. **Include examples:** API requests, UI states, data samples

## Output Format (Text Fallback)

```
=== TICKET 1 ===
Title: [Component] Action: Description
Project: [Project Name]
Type: Story
Priority: Medium

[Full ticket body]

=== TICKET 2 ===
...
```

## Common Mistakes to Avoid

❌ Vague titles: "Fix preferences"
✅ Specific titles: "[API] Fix: Preferences endpoint returns 500 on missing user"

❌ No acceptance criteria
✅ Clear checklist of outcomes

❌ Missing dependencies
✅ "Blocked by PROJ-123, Blocks PROJ-125"

❌ No technical context
✅ API contracts, data schemas, edge cases documented

❌ Orphan tickets (no epic/parent)
✅ Linked to parent epic or PRD

## Questions to Ask Before Creating

1. **Scope clarity:** Is this ticket too big/small?
2. **Dependencies clear:** What must happen first?
3. **Edge cases documented:** What could go wrong?
4. **Testing defined:** How will we verify this works?
5. **Rollback plan:** Can we undo if needed?

Remember: Great tickets save engineering hours. Invest time upfront to create clear, actionable work items.

---

## Context Routing Strategy

When the PM uses `/create-tickets`, I automatically:

### 1. Extract Source Material Understanding
**Source:** PRDs in `work/docs/prds/`, or uploaded documents
- **What I look for:** Acceptance criteria, technical requirements, design context
- **How I use it:** Generate detailed tickets with full context
- **Example:** "PRD says 'mobile-first', I'll note that in every ticket's technical notes"

### 2. Query Linear CLI
**Source:** `linear` CLI
- **What I look for:** Existing epics, project structure, team assignments
- **How I use it:** Auto-link tickets to correct epic, assign to right teams
- **Example:** `linear projects IC` to find epics, then use parentId in create-full

### 3. Check Dependencies Across Roadmap
**Source:** `work/docs/prds/`, related PRDs
- **What I look for:** What else is being built that might block this
- **How I use it:** Surface dependency tickets
- **Example:** "Notification system ships next sprint, Voice Feature depends on it"

### 4. Extract Acceptance Criteria from Success Metrics
**Source:** PRDs, `/feature-metrics` or `/impact-sizing` outputs
- **What I look for:** Testable success criteria
- **How I use it:** Convert metrics into ticket acceptance criteria
- **Example:** "Success metric 'adoption >60%' → AC: Feature instrumented to track adoption"

### 5. Route to Task/Ticket System
**Routing logic:**
- **Linear connected:** Create tickets directly in Linear
- **Jira connected:** Create tickets directly in Jira
- **Neither connected:** Generate formatted ticket text for manual entry
- **Complex dependencies:** Suggest ticket structure first before creation

---

## Output Quality Self-Check

Before delivering tickets, verify:

- [ ] **Every ticket has a clear, specific title** -- "[Component] Action: Description" format, no vague titles like "Fix stuff"
- [ ] **Every ticket has testable acceptance criteria** -- At least 2-3 checkboxes that define "done"
- [ ] **Every ticket has an effort estimate** -- T-shirt size (XS/S/M/L/XL) assigned to each
- [ ] **XL tickets flagged for splitting** -- Any ticket estimated at 1-2 weeks has a suggested breakdown
- [ ] **Dependencies mapped** -- "Blocked by" and "Blocks" noted; dependency summary provided at the end
- [ ] **Sprint/milestone assignment suggested** -- If launch date provided, tickets grouped into Sprint 1/2/3
- [ ] **Capacity checked** -- If sprint assignments given, total effort compared to available developer-days
- [ ] **Critical path identified** -- Longest dependency chain highlighted with duration estimate
- [ ] **PRD requirements fully covered** -- Every PRD acceptance criterion maps to at least one ticket
- [ ] **No orphan tickets** -- All tickets linked to parent epic or PRD
- [ ] **Technical context sufficient** -- Engineers should not need to ask "what exactly do you want?" after reading the ticket

If any check fails, fix it before delivering. Bad tickets slow engineering down more than no tickets at all.
