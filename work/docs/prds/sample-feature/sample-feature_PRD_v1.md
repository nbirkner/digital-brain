---
title: User Onboarding Redesign
date: 2026-01-10
tags: [prd, commerce]
---

# User Onboarding Redesign

## Problem

47% of new users abandon the setup flow before completing their first action. Exit surveys cite confusion about what the product does and what to do first. This is costing us ~$120K MRR in missed activations.

## Goal

Reduce time-to-first-value from 8 minutes to under 3 minutes. Increase activation rate (first meaningful action within 7 days) from 41% to 60%.

## Solution

Replace the current 6-step wizard with a contextual onboarding flow that adapts based on the user's role (Admin vs. Contributor). Show the product in action immediately — guided tour of the core loop before asking for any configuration.

## Key decisions

- **Skip the import step at signup.** Move it to a later nudge (day 3 email). Reduces friction in the critical first 90 seconds.
- **Role detection via single question**, not a multi-field form. "Are you setting this up for your team, or joining an existing workspace?"
- **Interactive product demo** on first login, not a static walkthrough video.

## Out of scope

- Mobile onboarding (separate initiative)
- Enterprise SSO provisioning flow
- Billing plan selection during onboarding

## Success metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Activation rate | 41% | 60% | Users completing first core action within 7 days |
| Time to first value | 8 min | < 3 min | Median session time on onboarding flow |
| Drop-off rate | 47% | < 20% | Users who exit before completing step 1 |

## Timeline

- Week 1-2: Design + prototype
- Week 3: Eng builds, QA
- Week 4: Staged rollout (10% → 50% → 100%)

## Open questions

1. Do we gate the demo behind signup, or show it on the marketing page first?
2. How do we handle users invited to an existing workspace — do they see the same flow?
