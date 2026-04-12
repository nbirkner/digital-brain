---
name: billing-debug
description: Use when a customer reports a billing issue — failed payment, API cutoff, usage discrepancy, invoice problem, or charge dispute. Guides through triage, Admin Panel, Stripe, and Hex.
---

# Billing Debug Runbook

## Overview

Structured triage for customer billing issues. Follows three stages: Admin Panel → Stripe → Hex. Start with triage, then route to the right stage based on the symptom.

---

## Step 1: First Triage

Ask for (or pull from admin):

| Info | Why it matters |
|------|---------------|
| Org ID or org link | Required for Hex queries |
| Invoice ID(s) | Narrows to specific charge |
| Billing period | Scopes the data pull |
| Product type | Inference vs. fine-tuning vs. storage |
| Usage visible in analytics or invoice? | Rules out $0 edge case |
| Account deleted? | Changes available data paths |

---

## Step 2: Route by Symptom

| Symptom | Go to |
|---------|-------|
| API cutoff / blocked | Stage 1 (Admin Panel) |
| Usage discrepancy | Stage 1 → Stage 3 (Hex) |
| Failed or declined payment | Stage 2 (Stripe) |
| Invoice overdue / unpaid | Stage 2 (Stripe) |
| Wrong charge / duplicate | Stage 2 (Stripe) → Stage 3 (Hex) |
| Can't download invoice | Stage 1 (check for $0 period) |
| Customer disputes specific charges | Stage 3 (Hex) |

---

## Stage 1: Admin Panel — Billing Settings

Navigate to the customer's Billing Settings page in the Admin panel.

Quick-access buttons: Manage Organization, Metronome, Stripe, Current Usage, Billing Analytics.

**Click Current Usage and check:**
- Is the customer cut off?
- What are their negative limits?
- Current usage for the billing period
- Metronome balance

**"Why can't I download my invoice?"**
- Check if billing period had $0 usage. If so, Stripe may not have generated a PDF — the download link will appear broken or 404.
- If invoice is prior to October 2025, it's likely a Lago invoice. Use the historical Lago invoice runbook.

---

## Stage 2: Stripe — Failed Payments

Navigate to Stripe via the customer's Billing Settings page.

**Debugging a failed payment:**
1. Check the Payments tab
2. Read the failure reason (issuer decline vs. Radar block)
3. Check the payment method (expired card, wrong details)
4. Check the Invoice status

**Radar Rules and fraud:**
- If blocked by Radar (not a card decline), you'll see a Radar flag on the transaction
- Check past payment history and past refund requests
- Many refund requests + no payment history = likely fraudulent
- If they look legit: click "Add to allow list" on the right side of the transaction

**3D Secure (3DS):**
- Payment marked as requiring authentication
- Customer must complete the challenge via their bank's verification page (they get an email)
- If 3DS incomplete, payment will fail — ask the customer to click through the invoice email payment link

**Common resolutions:**

| Failure | Resolution |
|---------|-----------|
| Expired card | Ask customer to update payment method |
| Insufficient funds | Ask customer to resolve with their bank |
| 3DS required | Ask customer to complete authentication via invoice email |
| Radar-blocked (legit customer) | Add to allow list |
| Persistent failures | Escalate to Commerce with Stripe payment IDs |

---

## Stage 3: Hex — Usage Data Queries

Use the **Billing Debugging Dashboard** in Hex first. If it doesn't cover the specific question, use ad-hoc queries via the Hex AI assistant.

**When to use ad-hoc Hex queries:**
- Customer disputes specific charges and you need event-level data
- Need usage for a specific model, API key, or time range
- Cross-referencing usage events with Metronome
- Billing reconciliation

**Ready-to-use query prompts** (swap in the real org ID and dates):

**All usage for an org:**
```
Show me all usage for organization_id = 'ORG_ID' from MONTH DAY YEAR to MONTH DAY YEAR
```

**Usage by API key:**
```
Show me daily usage and cost for organization_id = 'ORG_ID' grouped by api_key_id from MONTH DAY YEAR to MONTH DAY YEAR
```

**Inference trace data (MotherDuck):**
```
Using the MotherDuck trace data, show me the trace IDs and associated IP addresses for organization_id = 'ORG_ID' where model_name = 'MODEL_NAME' on DATE
```

> For Inference data: select the MotherDuck data source in Hex. For billing/Metronome data: select the appropriate billing data source.

---

## Escalation

When to escalate to Commerce (with full context):
- Persistent Stripe failures after trying common resolutions
- Usage discrepancy not explainable by Hex data
- Refund, invoice void, or invoice regeneration needed (Commerce owns Metronome operations)
- Fraud suspected but unclear

Include in escalation: org ID, invoice IDs, billing period, what you checked, what you found.
