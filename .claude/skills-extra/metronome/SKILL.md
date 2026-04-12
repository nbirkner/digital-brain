---
name: metronome
description: Metronome lingo enforcer. Use when: (1) the user says /metronome, (2) the user is working on ECP (Enterprise Contract Policy), or (3) any document references billing architecture, contracts, commits, credits, rate cards, or pricing in the context of Together AI's Metronome implementation. Sweeps documents and writing for non-Metronome terminology and replaces with correct Metronome lingo. Goal: Derek and Elizabeth need all ECP docs to use Metronome's exact vocabulary so engineers and finance understand what's being built.
---

# Metronome Lingo Enforcer

Read `.claude/skills/metronome/references/lingo.md` before proceeding.

## What This Skill Does

Sweeps a document (or current draft) for terminology that doesn't match Metronome's official vocabulary, then fixes it. The goal is alignment — Derek and Elizabeth need every ECP doc to use the exact terms Metronome uses so there's no ambiguity when engineers implement it.

## How to Run a Sweep

1. Read the target document (ask Niki which one if not specified)
2. Read `references/lingo.md`
3. Scan every sentence for terms in the "Common Terminology Mismatches" table AND any billing concept that could be expressed in a non-Metronome way
4. Produce a findings list before making any edits:

```
LINGO SWEEP FINDINGS
====================
[term used] → [correct Metronome term] | Line/section: [location] | Context: "[brief quote]"
```

5. Ask Niki: "Found N issues. Apply all fixes?" 
6. If yes, edit the file in place. If no, discuss specific changes.

## Sweep Checklist

Check for these common mistakes:

- "prepay" / "upfront payment" → **prepaid commit**
- "minimum spend" / "floor" / "minimum commitment" → **postpaid commit**
- "credit pool" / "credit balance" / "pool of credits" → **commit balance** or **credit balance** (depending on context)
- "pricing amendment" / "contract modification" / "contract change" → **override** (multiplier, overwrite, or tiered)
- "burn-down" / "consumption" / "depletes" → **drawdown**
- "reconciliation invoice" / "shortfall charge" / "make-whole" → **true-up**
- "pricing table" / "price list" / "catalog" → **rate card**
- "pricing dimension" / "cost dimension" → **pricing group key**
- "SKU" → **product**
- "rollover credits" → **rollover commit**
- Any use of "subscription" where it means a postpaid or commit-based deal → clarify (subscription has a specific meaning in Metronome: recurring seat-based fees)

## ECP-Specific Patterns to Watch

The Enterprise Contract Policy is about how Together AI structures enterprise deals in Metronome. When sweeping ECP docs:

- "Credit pools" in ECP likely = **prepaid commits** or **credits** — clarify which and use the right term
- "Reservation" / "reserved credits" → likely **prepaid commit** with access schedule
- "Fungible credits" → likely **credits** (Metronome sense: free usage amounts) or **prepaid commits** depending on whether they're paid for
- Rate overrides on enterprise deals → **overrides** (specify type: multiplier, overwrite, or tiered)
- "SKU-level discounts" → **multiplier overrides** on specific products or product tags
- "Drawdown account" → **commit balance**

## When Writing (Not Sweeping)

When drafting new ECP content, use Metronome terms natively from the start:
- Structure deals as: rate card → contract → commits/credits + overrides + scheduled charges
- Access schedule and invoice schedule are distinct — don't conflate them
- Overage = usage beyond commit/credit balance (not "excess", not "burst")
- True-up = postpaid commit reconciliation invoice (only applies to postpaid commits, not prepaid)

## Output Format for Fixes

When editing a document, show a brief summary after:

```
Applied X lingo fixes:
• [old term] → [new term] (N occurrences)
• [old term] → [new term] (N occurrences)
```
