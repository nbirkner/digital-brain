---
name: pm-brand
description: "Use when Niki wants to capture a work win ('I just shipped X, log it', 'add this to my wins log', 'log this win'), OR when she needs to create career or brand content ('write a LinkedIn post about X', 'help me prep for perf review', 'create a talk pitch', 'update my bio', 'write perf bullets'). Two modes: log-win (quick capture mid-flow) and create-content (batch content sessions)."
user_invocable: true
---

# /pm-brand - PM Brand + Career Evidence

Two modes. Use them independently or chain them together.

- `/pm-brand log-win` — capture a win in 2 minutes, mid-flow
- `/pm-brand create-content [type]` — turn logged wins into polished content

**Output file:** `work/docs/career/wins-log.md`

---

## Mode 1: `/pm-brand log-win`

**When to use:** Right after something noteworthy happens. Ship, decision, alignment win, customer insight that changed the roadmap, metric that moved. Don't let it slip.

**Trigger phrases:**
- "I just shipped X, log it"
- "log this win"
- "add to my wins log"
- "capture this"
- "I want to remember this"

---

### How it works

**Step 1: Gather the raw facts**

Ask Niki three questions (all at once, not one at a time):

```
Quick capture. Three questions:

1. What happened? (1-2 sentences, plain English)
2. What was the impact? (users affected, ARR influenced, time saved, decision unblocked — any data you have)
3. Any evidence? (link to PRD, Notion doc, Linear ticket, Slack thread, metrics screenshot — optional but valuable)
```

If she gives a quick one-liner ("just shipped Orgs M5.1"), pull additional context from:
- `work/docs/prds/` for scope and metrics
- `work/notes/` for recent meeting notes related to the initiative
- `work/site/strategy/` for strategic tie-in
- MEMORY.md for current initiative status

**Step 2: Classify the win type**

Categorize before writing it up:

| Type | Description | Example |
|------|-------------|---------|
| **Ship** | Feature or product launched | Orgs & Projects M5.1 went live |
| **Decision** | Made or drove a key call | Chose four-credit-pool architecture for ECP |
| **Influence** | Changed minds, unblocked, aligned | Got legal/finance/eng aligned on ECP model |
| **Discovery** | Found insight that changed direction | Customer discovery revealed ACH fraud risk |
| **Scale** | Moved a metric or grew something | MiniMax deal: $7.4M, ~45% gross margin |
| **Build** | Created something durable | Built GPU pricing app, now daily workflow for field |

**Step 3: Write the entry**

Append to `work/docs/career/wins-log.md`. Format:

```markdown
## [Date] — [Initiative]: [One-line summary]

**Type:** [Ship / Decision / Influence / Discovery / Scale / Build]
**What I did:** [2-3 sentences. Your specific contribution, not just what the team did. Start with a verb.]
**Impact:** [Numbers if you have them. Users affected, ARR influenced, time saved, decisions unblocked.]
**Evidence:** [Link to PRD, Notion page, Linear ticket, metric, or Slack thread — or "internal" if no shareable link]
**Strategic tie-in:** [One sentence connecting this to company goals or a longer arc]

---
```

**Step 4: Confirm and suggest**

After appending:

```
Logged. Saved to work/docs/career/wins-log.md.

This looks like a [type] win. Good material for:
- [perf-review-bullet / linkedin-post / talk-pitch] — [why]

Run `/pm-brand create-content [type]` when you're ready to use it.
```

---

### Win capture guidelines

**Specificity over completeness.** A rough entry with real numbers beats a polished entry with placeholders. Fill in "[ARR TBD]" and move on — you can sharpen it later.

**Your contribution, not the team's.** "We shipped Orgs M5.1" is a fact. "I defined the access model, drove alignment with three engineering teams, and made the call to scope out multi-org membership for M5.2" is a win.

**More often than feels necessary.** Most PMs under-log. A shipped feature with no log entry is invisible at review time. Default to capturing, even for "small" things.

**Evidence decays fast.** Log the Notion link, Linear ticket, or Slack thread while you still know where it is. You won't find it in 6 months.

---

## Mode 2: `/pm-brand create-content [type]`

**Types:**
- `linkedin-post` — external thought leadership, story-first
- `talk-pitch` — conference or internal talk proposal
- `bio-update` — profile bio for conference, LinkedIn, job application
- `perf-review-bullet` — tight, impact-first bullets for Lattice or promo packets

**Trigger phrases:**
- "help me prep for perf review"
- "write a LinkedIn post about [topic or win]"
- "I want to pitch a talk about [topic]"
- "update my bio"
- "write perf bullets for [review cycle]"
- `/pm-brand create-content [type]`

---

### Context routing

Before generating content, pull from:

1. `work/docs/career/wins-log.md` — the source of truth for wins and evidence
2. `work/docs/prds/` — for scope, metrics targets, and technical detail
3. `work/docs/decisions/` — for decision rationale and trade-offs
4. `work/notes/` — for customer quotes and stakeholder context
5. `work/site/strategy/` — for strategic framing and company mission
6. `work/docs/career/` — for previous self-reviews and perf bullets (style calibration)

Ask what to focus on if unclear:

```
I'll pull from your wins log and recent PRDs.

Anything specific you want to highlight? Or should I pick the strongest material?
[optional: time range, initiative, theme]
```

---

### linkedin-post

**Voice rules:**
- First person, past tense for stories ("I shipped X" not "excited to share that we launched X")
- No "thrilled to announce," no "I'm humbled," no "excited to share"
- No corporate jargon. Treat readers like smart adults who will tune out if you're performing
- Show the messy reality, not just the clean outcome. The interesting part is the constraint you hit or the assumption you had to challenge
- End with a real takeaway, not a question-bait ("what do you think?")
- 150-300 words is the sweet spot. Short enough to read, long enough to be useful
- One main idea per post

**Structure options (pick based on the win):**

Option A — The Insight Story
```
[Counterintuitive opening line — something specific that subverts expectations]

[2-3 sentences of context: what you were working on, what you assumed]

[The moment where you were wrong, or learned something real]

[What you actually did / decided]

[The outcome, with a number if possible]

[One sentence takeaway that's transferable to anyone reading this]
```

Option B — The Ship Story
```
[What shipped, one sentence, no fluff]

[The one constraint or trade-off that shaped everything]

[What you chose and why — the actual reasoning, not the sanitized version]

[Result]

[What you'd do differently or what surprised you]
```

Option C — The "Here's what I learned" post
```
[The thing you now believe that you didn't before]

[Context: where this came from — specific project or situation]

[Evidence: 2-3 concrete examples or data points]

[The implication for how you work now]
```

After drafting, ask:
```
Draft above. Want me to:
- Make it shorter
- Add more texture to [section]
- Try a different angle (I have [X] other wins this could draw from)
- Run it through /humanizer to sharpen the voice
```

---

### talk-pitch

**Format:** 200-300 word pitch for a conference CFP or internal talk proposal

**Structure:**

```
**Talk title:** [Specific, not generic. "How we [did X] at Together AI" beats "Lessons from AI infrastructure"]

**The problem this talk solves:**
[One paragraph. Who's in the audience and what do they struggle with that this talk helps with?]

**The story arc:**
[3-4 bullets. What does the audience experience from start to finish? Not slide titles — narrative beats.]
- Open with: [The hook / surprising fact / failure moment]
- Middle: [The insight or framework you built, with a concrete example]
- Middle: [What you got wrong first / the tension]
- Close with: [What they can apply Monday morning]

**Why Niki is the right person to tell this:**
[2-3 sentences. Specific credentials: role, scope of work, what makes her POV distinct. Not "she's passionate about X."]

**Formats this works for:**
[Conference talk / internal all-hands / podcast / blog post / workshop]
```

Ask what conference/audience if not specified. Different audiences need different angles on the same story.

---

### bio-update

**Modes:**
- Short (1-2 sentences): conference speaker intro, Twitter/X bio, Slack profile
- Medium (1 paragraph): LinkedIn about section, job application, conference program
- Long (2-3 paragraphs): website, portfolio, detailed speaker bio

**Principles:**
- Lead with role + company + the thing that makes the work interesting (not just title)
- One specific, concrete accomplishment (with a number if possible)
- End with something that signals curiosity or taste, not just credentials
- No "passionate about" or "dedicated to" language
- Write in third person for speaker bios, first person for LinkedIn

**Draft approach:**
Pull the 2-3 strongest recent wins from the wins log. Frame around the through-line of her work (billing, IAM, enterprise at AI infrastructure scale) rather than just listing initiatives.

---

### perf-review-bullet

**Use for:** Lattice self-reviews, promo packets, manager calibration docs

**Format for each bullet:**
```
[Verb] [what you did] — [measurable outcome or scale of impact]. [Optional: strategic context in one clause.]
```

**Rules:**
- Impact-first. The number or scope goes early, not at the end as an afterthought
- Verb is specific: "Defined," "Led," "Shipped," "Drove alignment on," "Closed," "Built" — not "Helped," "Supported," "Worked on"
- One bullet per distinct win. Don't smash unrelated things together
- Include the ARR, user count, or org count whenever it's there
- If no hard metric: use scale ("across 10K active orgs"), speed ("shipped in 6 weeks"), or complexity ("across 3 engineering teams and legal")

**Grouping:**
Organize bullets by review category if Niki specifies (e.g., Lattice competencies). Otherwise group by initiative with a one-line header.

**After drafting, ask:**
```
[X] bullets above, grouped by [initiative / competency].

Anything missing? Want me to add evidence links so you can paste into Lattice with supporting docs?
```

---

## Output quality self-check

Before delivering any content:

- [ ] **Specific over generic:** Real numbers, real initiative names, real outcomes. No "significant impact" or "meaningful results"
- [ ] **Her contribution, not the team's:** "I led," "I made the call," "I drove alignment" — not "we shipped"
- [ ] **Voice check (LinkedIn/bio):** Read it out loud. Would Niki actually say this? Does it sound like AI?
- [ ] **Perf bullets:** Every bullet has a verb, a specific action, and a measurable or scoped outcome
- [ ] **No forbidden words:** "leverage," "utilize," "harness," "streamline," "robust," "cutting-edge," "thrilled to announce," "I'm humbled"
- [ ] **No em dashes:** Use commas, periods, or parentheses instead
- [ ] **Wins log updated:** If content came from a session where new wins were discussed, confirm log is current

---

## Integration with other skills

**Feeds from:**
- `/weekly-review` — surface wins from the week to log
- `/feature-results` — post-launch metrics are the strongest perf bullet evidence
- `/decision-doc` — decision rationale becomes talk pitch material
- `/prd-draft` — PRD scope and targets give context for impact claims

**Feeds into:**
- `/humanizer` — run LinkedIn drafts through this before posting
- `/status-update` — perf bullets inform manager 1:1 updates
- `work/docs/career/` — all output lives here alongside self-reviews and peer feedback
