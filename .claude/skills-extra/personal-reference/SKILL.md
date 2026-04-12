---
name: personal-reference
description: Load when Niki asks about personal details — health, insurance, medications, finances, housing, subscriptions, relationships, or preferences. Gives Claude structured reference data so it can answer without asking.
---

# Personal Reference Skill

Loads structured reference data about Niki's personal life. Read the relevant reference file before answering personal factual questions.

## Which file to load
- Health, providers, supplements, labs, insurance → `references/health-reference.md`
- Finances, accounts, investments, FIRE, tax team → `references/finance-reference.md`
- Housing, apartment, lease, utilities → `references/housing-reference.md`
- Relationships, people, birthdays → `references/relationships-reference.md`
- Subscriptions, memberships, life admin, documents → `references/life-admin-reference.md`
- Behavioral patterns, working style (Claude-maintained) → `references/preferences-reference.md`

## Privacy
This data is Niki-only. Never surface in work contexts. Never include in outputs shared with others.

## How sub-agents use this
The health-coach, therapy-prep, and financial-planner sub-agents should load the relevant reference file at the start of their session. This replaces asking Niki for basics she's already provided.
