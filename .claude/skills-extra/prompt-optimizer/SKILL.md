---
name: prompt-optimizer
description: Use when a prompt, agent instruction, or automation template is inconsistent or unreliable and you want to systematically improve it through automated testing. Trigger phrases: "optimize this prompt", "make this instruction more reliable", "run autoresearch on", "this prompt works sometimes but not always", or any request to iteratively improve an AI instruction via scored experiments.
  for the full explanation.

  Trigger proactively when: user says "this keeps getting it wrong", "this automation output
  is inconsistent", "how do I make this more reliable", "this prompt fails sometimes",
  "I keep seeing the same mistake", or any complaint about a repeating AI output quality issue.

  Also triggered by: "autoresearch", "run the Karpathy loop", "optimize this prompt/template",
  "make this more reliable", "improve this agent instruction".
---

# Autoresearch (Karpathy Loop)

## How This Skill Works

You collect 3 things from the user, run a dry run so they can confirm the outputs look right, then launch the overnight loop. Claude handles all execution — the user never needs to touch a terminal.

**The loop (automated):**
1. Execute prompt N times against test inputs
2. Score every output against binary yes/no checks
3. Find which check fails most
4. Mutate ONE thing in the prompt to fix it
5. `git commit` if improved, `git reset` if not
6. Repeat until 95%+

---

## Step 1: Collect the 3 inputs

Ask the user for all three in a single message if not already provided:

> "To run the optimizer I need three things:
> 1. **Which prompt/skill file** do you want to optimize? (e.g. `.claude/skills/meeting-notes/SKILL.md`)
> 2. **2-3 test inputs** — realistic examples of what this prompt will actually receive in production (paste them directly)
> 3. **3-6 quality checks** — binary yes/no criteria. What does a good output look like? Be specific. E.g. 'Every action item has a named owner' not 'Output is good'."

**Good check examples to suggest if they're stuck:**
- "Every action item has a named owner"
- "Decisions are in their own section"
- "Output is under 300 words"
- "No filler phrases like 'it was discussed that'"
- "Open questions are captured separately"
- "The first line is the direct answer, not context"

---

## Step 2: Run a dry run first

Before launching the full loop, always run a dry run so the user can confirm outputs look right.

Read the prompt file, then run:

```bash
python .claude/skills/prompt-optimizer/scripts/optimize_prompt.py \
  --prompt <file> \
  --inputs "<input1>" "<input2>" "<input3>" \
  --checks "<check1>" "<check2>" "<check3>" \
  --dry-run
```

The dry run:
- Runs the prompt once per test input (3 calls total)
- Prints each output in full
- Scores each output against the checks
- Shows a pass-rate bar per criterion
- Exits without making any changes

Show the user the output and ask: **"Do these outputs look like what you'd expect from this prompt? If yes, I'll launch the overnight run."**

If something looks off — wrong format, hallucinated content, prompt not working as expected — fix the prompt or the checks before proceeding.

---

## Step 3: Launch the overnight run

Once the user confirms the dry run looks right, create a branch and launch:

```bash
git checkout -b prompt-optimizer/<skill-name>
```

Then launch with `nohup` so it survives terminal close, `--delay 15` to spread over ~8 hours, output piped to a log file:

```bash
mkdir -p work/docs/logs/optimizer-runs/<skill-name>

nohup python3 .claude/skills/prompt-optimizer/scripts/optimize_prompt.py \
  --prompt <file> \
  --inputs "<input1>" "<input2>" "<input3>" \
  --checks "<check1>" "<check2>" "<check3>" \
  --rounds 30 \
  --delay 15 \
  --output-dir work/docs/logs/optimizer-runs/<skill-name> \
  > work/docs/logs/optimizer-runs/<skill-name>/run.out 2>&1 &

echo "Optimizer running as PID $!"
echo "Check progress: tail -f work/docs/logs/optimizer-runs/<skill-name>/run.out"
```

**Why `--delay 15`:** Each round makes ~37 claude calls. At 15s delay: 37 × 15s × 30 rounds ≈ 5.5 hours. Spreads cleanly across a night without hammering rate limits.

Tell the user:
- PID so they can kill it if needed: `kill <PID>`
- How to check progress: `tail -f work/docs/logs/optimizer-runs/<skill-name>/run.out`
- What they'll wake up to in `work/docs/logs/optimizer-runs/<skill-name>/`:
  - `summary.md` — clean results: score delta, what changed, links to files (start here)
  - `<skill>-optimized.md` — the best version of the prompt
  - `changelog.md` — every round with kept/reverted detail
  - `results.log` — raw JSON per round

---

## Step 4: Morning review

When the user comes back, help them review results:

1. Read `work/docs/logs/optimizer-runs/<skill-name>/summary.md` — start here, clean recap
2. Read the diff between original and `<skill>-optimized.md` if they want to see the changes
3. Ask: "Want to merge this branch into main?"

If they're happy: `git checkout main && git merge prompt-optimizer/<skill-name>`

---

## All script options (for reference)

| Flag | Default | Description |
|------|---------|-------------|
| `--prompt` | required | Path to the prompt file |
| `--inputs` | required | 2-3 test inputs (quote each) |
| `--checks` | required | 3-6 binary quality checks |
| `--dry-run` | false | Show sample outputs + scores, then exit |
| `--target` | 95 | Target pass rate % |
| `--rounds` | 50 | Max rounds (use 30 for overnight) |
| `--executions` | 5 | Runs per input per round |
| `--delay` | 3 | Seconds between claude calls (use 15 for overnight) |
| `--model` | CLI default | Optional model override |
| `--output-dir` | same as prompt | Where to write logs |
