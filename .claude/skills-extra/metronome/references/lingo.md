# Metronome Terminology Reference

Source: [Metronome Documentation](https://docs.metronome.com)

---

## Core Entities

| Term | Definition | Notes |
|------|-----------|-------|
| **Customer** | The end company or account being billed in Metronome | Not "account", "org", or "client" unless referring to Together AI's own model |
| **Product** | A billable item or service offering (analogous to a SKU). Products determine charging methodology and invoice line items. | **Products have no prices** — pricing is always set on rate cards or contracts |
| **Billable Metric** | A measurable unit of usage that drives charges on usage products. One metric per product; metrics can serve multiple products | Not "usage metric" or "event type" |
| **Rate Card** | The centralized source of truth for pricing. All contracts are built on top of a rate card | Not "price list", "pricing table", or "catalog" |
| **Contract** | A billing agreement for a customer, built on a rate card. Can include commits, credits, overrides, and scheduled charges | Not "deal", "agreement", or "subscription" (unless it's specifically a subscription product) |
| **Invoice** | The generated bill for a customer for a given period | Not "bill" or "charge" |

---

## Product Types

| Term | Definition |
|------|-----------|
| **Usage Product** | Priced variably based on customer consumption; requires an associated billable metric |
| **Subscription Product** | Recurring fee billed on a schedule (seat billing, platform fees, recurring charges) |
| **Composite Product** | Percentage-based charge applied to groups of applicable products |
| **Fixed Product** | Powers scheduled charges, commits, and credits |

---

## Rate Types

| Term | Definition |
|------|-----------|
| **Flat Rate** | Fixed price per unit (`rate_type: "FLAT"`) |
| **Tiered Rate** | Rate applied depends on quantity used so far in billing period; min values exclusive, max values inclusive (`rate_type: "tiered"`) |
| **Usage-Based Rate** | Pricing tied to consumption metrics |
| **Dimensional Pricing** | Many rates per product using pricing group keys (e.g., region, cloud provider, model type) — avoids creating separate products per dimension |

---

## Pricing Structure

| Term | Definition | Notes |
|------|-----------|-------|
| **Pricing Group Keys** | Dimensional parameters (e.g., region, cloud provider, model) that allow rate variation without creating separate products | Not "pricing dimensions" or "cost dimensions" |
| **Presentation Group Keys** | Control how invoice line items are grouped for display | Not "display groups" or "line item groups" |
| **Override** | A contract-level modification to a rate card price. Three types: multiplier, overwrite, tiered | Not "amendment", "discount", or "pricing change" — overrides are the Metronome term |
| **Multiplier Override** | Applies a percentage discount/markup to a product or product tag (e.g., 0.9 = 10% discount) | |
| **Overwrite Override** | Replaces a rate entirely with a new value | |
| **Rate Card Alias** | Alternative identifier for a rate card used in API integrations | |

---

## Commits & Credits

### Key Distinction
- **Credits** = dollar amounts of *free* usage (trials, SLA reimbursements, promotions)
- **Commits** = contractual spend obligations (prepaid or postpaid) — the customer has committed to spend a certain amount

### Commit Types

| Term | Definition | Notes |
|------|-----------|-------|
| **Prepaid Commit** | Payment collected upfront before usage occurs. Invoiced on the invoice schedule; usage drawn from access schedule | Not "prepay", "upfront credit", or "pre-purchase" |
| **Postpaid Commit** | Usage occurs first; payment collected in arrears. If actual spend < committed amount, a true-up invoice covers the difference | Not "minimum commit" or "floor commitment" |
| **Rollover Commit** | Unused balance from a prepaid commit that carries forward to a renewed contract. Burns down before other commit types | |

### Scheduling

| Term | Definition |
|------|-----------|
| **Access Schedule** | Defines when funds (commit or credit) become available — the spend allotments associated with specific date ranges. Has "hour-aligned" precision |
| **Invoice Schedule** | Defines when payment is due — separate from access schedule. Can be installment-based. Includes a "Do not invoice" option |
| **Scheduled Charge** | A one-time fee billed on a specific date, associated with a product (e.g., a $5,000 professional services fee in month 3) |

### Consumption & Balance

| Term | Definition | Notes |
|------|-----------|-------|
| **Drawdown** | The reduction of a commit or credit balance through customer usage; updates in real time | Not "consumption", "burn", or "deduction" |
| **Balance** | Current remaining amount in a commit or credit allocation; updated continuously in real time | |
| **Overage** | Usage exceeding the available commit or credit balance; appears as a separate invoice line item | Not "excess usage" or "overrun" |
| **True-up** | Final invoice reconciling actual spend against a postpaid commitment when actual spend < committed amount | Not "reconciliation invoice" or "shortfall charge" |
| **Rollover Fraction** | The percentage of unused prepaid commit balance that carries forward to a renewed contract (e.g., 0.25 = 25%) | |

---

## Prioritization Rules

When multiple commits/credits apply, Metronome burns down in this order:

1. **Rollover commits** (postpaid before prepaid)
2. **Prepaid commits and credits**
3. **Postpaid commits**

Within the same commit type, priority is determined by:
- Priority field value
- Cost basis ($0 cost basis burns first, then paid)
- Product applicability (fewest applicable products first)
- Usage applicability (fewest group value specifiers first)
- `ending_before` timestamp (earlier expiration dates first)
- `starting_on` timestamp (earlier start dates first)
- Contract applicability (fewest applicable contracts first)

---

## Contract Structure

| Term | Definition |
|------|-----------|
| **Contract Transition** | Mechanism for starting a replacement contract while tracking the relationship to the original (used in renewals with rollover) |
| **Contract Amendment** | Not a standard Metronome API term — Metronome uses **overrides** and **edits** for contract modifications |
| **Product Tags** | Groupings that enable batch overrides across products without specifying individual product IDs |
| **Custom Pricing Units** | Non-dollar currency units for billing (e.g., tokens, credits in a custom unit) |

---

## Common Terminology Mismatches

Use this table when sweeping documents for non-Metronome lingo:

| Non-Metronome Term | Correct Metronome Term |
|-------------------|----------------------|
| prepay / upfront payment | prepaid commit |
| minimum spend / floor | postpaid commit |
| credit pool / balance pool | commit balance or credit balance |
| pricing amendment | override (multiplier, overwrite, or tiered) |
| contract modification | override or edit |
| burn-down / consumption | drawdown |
| reconciliation invoice / shortfall | true-up |
| usage tiers | tiered rate |
| rollover credits | rollover commit |
| pricing table / price list | rate card |
| pricing dimension | pricing group key |
| SKU | product |
| usage event | usage event (✓ — this one is fine) |
| billing period | billing period (✓ — this one is fine) |

---

## Invoicing Concepts

| Term | Definition |
|------|-----------|
| **Arrears** | Billing after usage occurs (pay-as-you-go, postpaid commits) |
| **Credit Memo** | Issued to adjust/reduce a prior invoice |
| **Revenue Recognition (Rev-rec)** | Financial reporting mechanism tracking when revenue is earned; ASC 606 compliant |
| **Threshold Notification** | Alert triggered when a customer reaches a specified balance or spend threshold |
| **Prepaid Balance Threshold** | Alert mechanism for when prepaid balances fall below a set level |
