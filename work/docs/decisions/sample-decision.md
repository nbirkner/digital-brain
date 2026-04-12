---
title: Adopt Feature Flags for Gradual Rollouts
date: 2026-01-12
tags: [decision, technical]
---

# Decision: Adopt Feature Flags for Gradual Rollouts

## Status

Decided — implementing in Q1 2026

## Context

We've been doing big-bang feature launches and getting burned. The mobile nav redesign in December broke the experience for 15% of users on Android 12 for 6 hours before we caught it. We need a safer way to ship.

## Options considered

**Option A — LaunchDarkly**
Pros: Best-in-class, tons of integrations, great analytics. Cons: $400/month at our scale, overkill for what we need now.

**Option B — Unleash (self-hosted)**
Pros: Free, full control, no data leaving our infra. Cons: We have to run it ourselves, ops burden.

**Option C — Simple env-var flags in our codebase**
Pros: Zero cost, no new infra, works today. Cons: Doesn't support gradual rollouts by user segment, requires a deploy to change a flag.

**Option D — GrowthBook (chosen)**
Pros: Free tier covers our needs, supports percentage rollouts + user targeting, has a decent SDK, cloud-hosted so no ops burden. Cons: Smaller ecosystem than LaunchDarkly.

## Decision

GrowthBook. It gets us 80% of LaunchDarkly's feature set at 0% of the cost for the next 12 months. We'll revisit if we hit growth-stage scale.

## Consequences

- All new features ship behind a flag starting Feb 1
- Eng adds the GrowthBook SDK this sprint
- PM workflow: create flag in GrowthBook, define rollout stages in the PRD
- Risk: vendor dependency, but GrowthBook is open source so we can self-host if needed
