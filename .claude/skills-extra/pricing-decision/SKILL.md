---
name: pricing-decision
description: "Framework for evaluating pricing changes, structuring enterprise deals, and designing credit/billing models. TRIGGER on: 'evaluate this pricing model', 'structure this deal', 'should we change pricing for', 'model the unit economics', 'design the credit pool', 'how do we price this', 'token-based vs seat-based', 'what should we charge', 'deal structure for', 'gross margin on this'. DO NOT TRIGGER for operational billing questions or customer support issues."
user-invocable: true
---

# Pricing Decision Framework

Pricing decisions fail in two ways: (1) setting prices without understanding unit economics, (2) building the right price but with the wrong billing model for the customer segment. This framework prevents both.

## Step 1: Classify the Decision

| Type | Examples | Key questions |
|------|---------|--------------|
| **Self-serve pricing change** | Token price update, plan tier redesign | Who's affected, elasticity, competitive benchmark |
| **Enterprise deal structure** | Committed contract, custom pricing | Margin floor, commitment mechanics, risk exposure |
| **Billing model change** | Token-based vs. seat, prepay vs. post-pay | Adoption friction, fraud risk, revenue predictability |
| **Credit/pool architecture** | How many credit pools, fungibility rules | Accounting treatment, customer experience, admin complexity |

---

## Unit Economics Check

Run this before any pricing decision. If you don't know these numbers, find them first.

**For token-based pricing:**
```
Revenue per token = [price per 1M tokens] / 1,000,000
GPU cost per token = [cost per GPU-hour] / [tokens per GPU-hour]
Gross margin = (Revenue - GPU cost) / Revenue

Example:
- Sell at $0.18/1M tokens
- GPU cost: $0.10/1M tokens
- Gross margin: (0.18 - 0.10) / 0.18 = 44%
```

**Margin thresholds to know:**
- <20% gross margin: not viable, re-examine pricing or GPU cost
- 20-35%: tight, acceptable only for strategic customers
- 35-50%: target range for volume customers
- >50%: room to use pricing competitively

**For committed contracts:**
- Calculate at minimum commit (worst-case margin)
- Calculate at expected ramp (realistic margin)
- Calculate at full commit (best-case margin)
- All three should clear your margin floor

---

## Enterprise Deal Structure

Components of a well-structured committed contract:

| Component | What to include | Common mistake |
|-----------|----------------|----------------|
| **Minimum commit** | Dollar or token floor per period | Setting commit the customer can't realistically hit |
| **Ramp schedule** | Month-by-month ramp to full commit | No ramp → customer overwhelmed in month 1 |
| **Auto-renew** | Auto-renews unless cancelled 30-60 days before | Silent contract expiry → revenue cliff |
| **MFN clause** | "Won't charge more than best commercial terms" | Omitting this → enterprise buying risk |
| **Overage pricing** | Rate above commit (usually same or slightly lower) | Making overage punitive → caps usage |
| **SKU/model allocation** | Which models/products apply to the commit | Vague allocation → disputes at reconciliation |

**Commitment sizing guide:**
- Start with their current monthly run rate (or projected run rate)
- Minimum commit = 70-80% of expected annual spend
- Ramp over 3-6 months for new customers with no run rate
- Don't commit them to more than 2x their current spend

---

## Credit Pool Architecture

When designing how credits flow through a billing system:

**Fungibility decision:**
| Pool type | When to use | Trade-off |
|-----------|-------------|-----------|
| **Fungible** (one pool) | Self-serve, simple use cases | Easy UX, harder to enforce product-specific discounts |
| **Non-fungible pools** | Separate SLG reserved capacity, distinct product lines | Enables per-SKU pricing, harder to explain to customers |
| **Hybrid** | Self-serve pool + SLG reservation pool | Recommended for platforms with both motions |

**Pool design principles:**
- Each pool should have a clear trigger for when credits enter and exit
- Credits should never move between non-fungible pools without an explicit unlock event
- SLG reservation pools lock at contract signature, not at GPU provisioning
- Keep the customer-facing view simple (1-2 pools max visible in UI) even if backend is complex

**The four-pool reference model (for AI platforms with both PLG and SLG):**
1. Self-serve prepay (fungible, any product)
2. Committed contract reservation (non-fungible, locked to contracted SKUs)
3. Auto-scale buffer (fungible, auto-tops-up from credit card)
4. Special allocations (free tier, promotional credits — non-fungible, product-specific)

---

## Billing Model Selection

**Token-based vs. seat-based:**
| Dimension | Token-based | Seat-based |
|-----------|-------------|------------|
| Best for | Variable API usage | Consistent per-user tools |
| Revenue predictability | Low (spiky) | High |
| Customer's budget certainty | Low | High |
| Gross margin visibility | High | Medium |
| Enterprise negotiability | Easy (commit on tokens) | Easy (commit on seats) |
| Fraud risk | Medium (API abuse) | Low |

**For AI infrastructure (Together's model):** Token-based with committed contracts is the right model for high-volume customers. Seat-based breaks at scale — customers don't think in "seats" when deploying AI pipelines.

**Prepay vs. post-pay (Pay Later):**
- Post-pay increases adoption (removes upfront friction) but introduces fraud risk and revenue unpredictability
- Prepay reduces fraud to near-zero but adds checkout friction
- For PLG: prepay with auto top-up is the right default
- For SLG: invoicing (net-30/60) is expected; don't fight this
- Never build post-pay without automated deprovisioning — it's your only backstop against runaway negative balances

---

## Fraud Risk Assessment

For any new payment mechanism or pricing change:

| Risk factor | Low risk | High risk |
|-------------|----------|-----------|
| Payment method | Credit card (chargeback protection) | ACH, wire, crypto |
| Customer verification | KYC completed | Anonymous/unverified |
| Usage pattern | Steady, predictable | Burst, irregular |
| Credit exposure | <$100 before payment required | >$500 before payment required |
| Deprovisioning | Automated + tested | Manual or nonexistent |

**ACH-specific risks:**
- 60-90 day chargeback window (much longer than credit cards)
- Pre-deposit model (pay before use) eliminates risk but crushes adoption
- Gradual drawdown with automated deprovisioning is the viable middle ground
- Never launch ACH without tested automated deprovisioning as a safety net

---

## Competitive Pricing Check

Before finalizing any price change:

1. What does the market charge for equivalent capacity/tokens? (Check Together's competitors)
2. Are we priced to win on cost, or win on quality/trust? (Don't confuse these positions)
3. For enterprise deals: what's our walk-away price? What's the floor we can't go below?
4. Does this price send a quality signal consistent with our positioning?

Price cuts win volume deals. Price floors protect margin. Know which you're optimizing for before the negotiation.

---

## Anti-Patterns

**NEVER do these:**
- Set committed contract minimums the customer can't realistically hit (creates resentment, churns at renewal)
- Mix SLG discounts into the PLG self-serve flow (confuses billing, creates margin leakage)
- Build credit pools that can't be audited (Metronome or equivalent must be able to report on each pool)
- Launch ACH or post-pay without automated deprovisioning (you will have fraud)
- Optimize gross margin by cutting GPU costs without validating performance impact (model quality = retention)
- Change token pricing without mapping which customers cross a pricing cliff (segmentation first)

---

## Context to check first

- `work/context/general-context/business-info-template.md` — current pricing model, revenue metrics, gross margin
- `work/docs/decisions/` — past pricing decisions (Pay Later, ACH, ECP architecture)
- `work/docs/analyses/` — any existing unit economics or billing analyses
