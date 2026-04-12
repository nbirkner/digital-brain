---
name: task
description: Quickly add a task to Todoist. Use when the user types /task [task description] or asks to add a task/to-do. Accepts free-form natural language including optional due dates, priorities, and labels.
---

# Add Task

Create a task directly in Todoist. If args are provided, create immediately. Only ask for the task name if none was given.

---

## CLI Reference

```
todoist create "Title" --project NAME --priority p1|p2|p3 --label LABEL --due "natural language" --desc "description"
todoist labels                    # list existing labels
todoist new-label "name"          # create a new label
todoist new-project "Name"        # create a new project if needed
```

Notes:
- `--due` accepts natural language: `"tomorrow"`, `"next monday"`, `"friday"`, `"april 13"`
- `--label` is singular — run one `--label` per label if adding multiple
- Labels are case-sensitive — match exactly as they appear in `todoist labels`

---

## Project Routing

| Project | When to use |
|---|---|
| `Work` | Niki's own work tasks — PM work, Together AI, engineering, strategy |
| `Personal` | Health, finance, life admin, relationships, side projects, travel |
| `Waiting For` | Task is blocked on or owned by someone else — they need to act, not Niki |

**"Waiting For" signals:** "Karina needs to...", "waiting on X", "AJ to follow up", "Charles to send", "blocked on", someone else is the actor not Niki.

---

## Label Taxonomy

### Existing labels (use as-is)
| Label | When to use |
|---|---|
| `commerce` | Billing, payments, credits, pricing — ECP, ACH, Pay Later, token pricing |
| `identity-collaboration` | Auth, SSO, OIDC, IAM, UMS, orgs & projects, RBAC, deletion flows |
| `security / it` | Security reviews, IT, compliance, access management |
| `work` | General work tasks that don't fit a specific domain |
| `karina` | Waiting on Karina (use in Waiting For project) |

### Create if needed (run `todoist labels` first to check)

**Work domain labels** — create if missing:
| Label | When to use |
|---|---|
| `infrastructure` | GPU pricing, substrate provisioning, platform, MotherDuck |
| `gtm` | Enterprise deals, sales, BizOps, customer success, announcements |
| `pm-ops` | Roadmap, planning, perf reviews (Lattice), strategy docs, stakeholder comms |
| `research` | Customer discovery, competitive analysis, user interviews |

**Personal labels** — create if missing:
| Label | When to use |
|---|---|
| `health` | Medical, fitness, supplements, labs, therapy |
| `finance` | Taxes, budget, investing, net worth, credit, insurance |
| `admin` | Apartment, errands, life admin, paperwork, subscriptions |
| `travel` | Trips, flights, hotels, Amsterdam on-site |
| `learning` | Courses, books, certifications, PM skills |
| `relationship` | Juan, family, friends, social commitments |

**Person labels (for Waiting For)** — create if missing:
`aj`, `charles`, `mei`, `derek`, `juan`, and any other named person.

---

## Priority Rules

| Infer p1 | Infer p2 | Infer p3 |
|---|---|---|
| "today", "urgent", "asap", "EOD", hard deadline ≤2 days | "this week", named colleague waiting, meeting prep | No signal, vague future, exploratory |
| Lattice/external deadline, "critical" | Post-OOO follow-ups, "soon" | Nice-to-have, someday |

---

## Due Date Inference

| Phrase | Resolves to |
|---|---|
| "today", "EOD" | `"today"` |
| "tomorrow" | `"tomorrow"` |
| "this week", "by Friday" | `"friday"` |
| "next week" | `"next monday"` |
| "end of month" | Last day of current month |
| Specific date, e.g. "April 13" | `"april 13"` |
| No signal | Omit `--due` |

---

## Steps

1. **Determine project** — Work, Personal, or Waiting For (see routing rules above).

2. **For Waiting For tasks:** identify the person. Run `todoist labels` and check if their name label exists. If not, create it first: `todoist new-label "person-name"`. Use the person's name lowercase as the label.

3. **Infer all fields:**
   - **Title**: clean, action-oriented, 5-10 words, "verb + object" format
   - **Priority**: p1/p2/p3 from rules above
   - **Label**: best-fit from taxonomy; if domain label doesn't exist yet, create it via the Todoist app or omit and note it
   - **Due date**: natural language string from inference rules, or omit
   - **Description**: scan conversation for relevant context — decisions, people involved, why it matters. 1-3 sentences. Omit if nothing beyond the title.

4. **Create the task:**

   ```bash
   todoist create "Title" --project "Project Name" --priority p1|p2|p3 --label label-name [--due "natural language"] [--desc "context"]
   ```

5. **Confirm** — one line per task:
   `[Title](https://app.todoist.com/app/task/{ID}) · Project · p1/p2/p3 · label · due (if set)`

   Parse `ID:` from CLI output to build the URL.

---

## Examples

```
/task finish ACH one-pager by Friday
→ todoist create "Finish ACH one-pager" --project Work --priority p2 --label commerce --due "friday"

/task follow up with AJ on deletion flows next week
→ todoist create "Follow up with AJ on deletion flows" --project Work --priority p2 --label identity-collaboration --due "next monday"

/task Karina to send updated ECP scenarios before stakeholder sync
→ todoist create "Karina to send updated ECP scenarios" --project "Waiting For" --priority p2 --label karina --due "friday"

/task Charles to confirm D-002 SKU-level discount approach
→ todoist create "Charles to confirm D-002 SKU-level discount approach" --project "Waiting For" --priority p1 --label charles

/task schedule dentist appointment soon
→ todoist create "Schedule dentist appointment" --project Personal --priority p2 --label health
```

---

## Notes

- Do not ask clarifying questions.
- Clean up the title — never use raw input verbatim if it's messy.
- Multiple distinct action items in one input → multiple `todoist create` commands.
- Juan's personal tasks → `--project Personal --label relationship`.
- If a label doesn't exist and can't be created via CLI, create the task without it and tell Niki which label to add manually.
