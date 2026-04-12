---
name: glossary-proposals
description: "Use when running the weekly glossary gap-finder, proposing new glossary terms to Notion, or manually triggering the automation that finds missing terms in the Together AI Notion workspace. Runs automatically on Mondays but can be triggered manually. Keywords: glossary, missing terms, propose terms, Together AI glossary."
user-invocable: true
---

# Glossary Proposals

Find terms missing from the Together AI glossary and create draft entries for review.

## Constants

- **Glossary DB ID:** `2e9b878a-ad1a-806a-a44a-c9228ec4e437`
- **Niki's Notion user ID:** `87a40f3f-4fb2-420a-92ba-e553478b7004`
- **Max proposals:** 15
- **Status for new entries:** `Proposed by AI`
- **Categories:** Concept, Tool, Product, Architecture, Governance, Pattern

---

## Step 1: Fetch Existing Glossary Terms

Query the glossary database to get all terms already defined:

```bash
notion-work query 2e9b878a-ad1a-806a-a44a-c9228ec4e437
```

Collect all `Term` property values (title field). Store as a lowercase set for dedup.

If the database returns paginated results, continue fetching until exhausted.

Print: `Found N existing glossary terms.`

---

## Step 2: Search Notion Workspace

Run `notion-work search` for each of the following queries. Collect unique page titles across all results (deduplicate by URL or title):

```
"cluster GPU compute infrastructure billing"
"organization workspace project team enterprise"
"instant cluster reserved on-demand pricing"
"heartbeat billing pay later rate limit deprecation"
"passthrough models serverless dedicated capacity"
"fraud prevention credits ACH payment orchestration"
"orgs projects RBAC OAuth SSO identity collaboration"
```

For each search, collect page titles from the results. Skip pages with generic titles (meeting notes, weekly sync, planning doc, etc.). Aim for 50–150 unique page titles total.

Print: `Found N unique pages from workspace search.`

---

## Step 3: Identify New Terms

You are analyzing Together AI's internal Notion workspace to find terms that should be added to a product glossary.

**Company context:** Together AI is an AI inference platform. Products include serverless inference, dedicated GPU clusters (Instant Clusters), a billing system (credits, contracts, Heartbeat Billing, Prepaid), and collaboration features (Orgs, Projects). Key tools: Metronome (metering), Stripe (invoicing), Salesforce (CRM), NetSuite (RevRec).

From the page titles collected in Step 2:

1. Identify terms that are **company-specific, product-specific, or technical jargon** worth defining
2. **Skip** anything already in the existing glossary (case-insensitive match)
3. **Skip** generic titles: meeting notes, planning docs, retros, syncs, concepts everyone already knows
4. For each candidate term, write a **concise 1-2 sentence definition** grounded in Together AI context
5. Assign a **category**: Concept, Tool, Product, Architecture, Governance, or Pattern
6. Select up to **15 terms** — prioritize specificity and uniqueness to Together AI

Print a summary table of proposed terms before creating them:
```
| Term | Category | Definition (truncated) |
|------|----------|----------------------|
| ...  | ...      | ...                  |
```

---

## Step 4: Create Glossary Entries

For each proposed term (up to 15), create a new page in the glossary database using the `notion-work` CLI:

```bash
notion-work create 2e9b878a-ad1a-806a-a44a-c9228ec4e437 "<term>" \
  '{"Term": {"title": [{"text": {"content": "<term>"}}]}, "Definition": {"rich_text": [{"text": {"content": "<definition>"}}]}, "Status": {"select": {"name": "Proposed by AI"}}, "Category": {"select": {"name": "<category>"}}, "Owner": {"people": [{"id": "87a40f3f-4fb2-420a-92ba-e553478b7004"}]}}'
```

**Database:** `2e9b878a-ad1a-806a-a44a-c9228ec4e437`

**Properties for each entry:**
- `Term` (title): the term name
- `Definition` (rich_text): the 1-2 sentence definition
- `Status` (select): `Proposed by AI`
- `Owner` (people): Niki's user ID `87a40f3f-4fb2-420a-92ba-e553478b7004`
- `Category` (select): one of Concept, Tool, Product, Architecture, Governance, Pattern

Before creating each entry, do a final check: if the term (case-insensitive) is already in the existing terms set, skip it.

Print each result:
```
✓  Term Name  (Category)
SKIP  Term Name  (already exists)
ERR  Term Name  (error message)
```

---

## Step 5: Summary

Print a final summary:
```
=== Glossary Proposals Complete ===
Created: N
Skipped: N (already existed)
Errors:  N

Review "Proposed by AI" entries in the Together Glossary DB to approve or reject.
```
