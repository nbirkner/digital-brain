# Autoresearch — The Karpathy Concept

## The core idea

Autoresearch means: **if you can score it, a loop can improve it automatically.**

Karpathy coined the term in the context of ML training. The insight was that gradient descent — the algorithm that trains neural networks — is just a loop:

1. Run the model on some inputs
2. Measure how wrong the outputs are (the "loss")
3. Adjust the weights slightly in the direction that reduces loss
4. Repeat thousands of times

No human is in that loop. The human's only job is to define what "wrong" means (the loss function). Once the score is defined, the loop finds improvements the human never would have found manually.

His observation: **the loop doesn't care what it's optimizing.** It only needs:
- Something it can change (one variable, one file, one set of weights)
- A number that goes up or down (the score)
- A rule for keeping improvements and discarding regressions

## Applied to AI instructions

Training loss is a score. A binary checklist on prompt output quality is also a score.

The same loop applies:
1. Run the prompt on 2-3 realistic inputs
2. Score every output against binary yes/no checks (your "loss function")
3. Mutate one thing in the prompt to improve the weakest check
4. If score improved → git commit (keep). If not → git reset (revert)
5. Repeat until 95%+

The human's job shifts from **manually tweaking prompts** to **defining what good looks like** (the checklist). That's actually the harder and more valuable problem — and it's a one-time cost.

## Why "autoresearch" and not "auto-tuning"

Research implies searching a space you don't fully understand. When you manually tweak a prompt, you're guessing — you don't know which change will help. The loop searches the space systematically, running experiments you'd never have time to run by hand. 100 experiments overnight vs. 5 in a work session.

## The key constraint: scoring

This only works if you can define quality precisely enough to score it. That's why binary yes/no checks matter. "The output is good" can't be scored. "Every action item has a named owner" can.

Bad score → loop optimizes for the wrong thing
Good score → loop finds improvements you'd never find manually

## What qualifies for autoresearch

Any text instruction that:
- Runs automatically (cron job, webhook, automation, agent)
- Produces output you care about being consistent
- Has failure modes you can articulate as binary checks

Not worth it for prompts you invoke manually and review every time — your eyes are already the quality gate. The value is in automations that run silently.

## The Karpathy framing in one sentence

> "If you can score it, you can autoresearch it."
