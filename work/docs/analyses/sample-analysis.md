---
title: Retention Drop Investigation — November Cohort
date: 2026-01-08
tags: [analysis]
---

# Retention Drop Investigation — November Cohort

## Summary

The November 2025 cohort has 22% lower 30-day retention than October. Root cause is a regression in the notification system that caused a 4-day gap in re-engagement emails for users who signed up Nov 10-18. 1,240 users affected. Fix shipped Dec 2.

## Data

| Cohort | Day 7 Retention | Day 30 Retention |
|--------|----------------|-----------------|
| September | 68% | 43% |
| October | 71% | 45% |
| November | 63% | **35%** |
| December | 69% | (in progress) |

November is the outlier. September and October track each other closely.

## Investigation

**Hypothesis 1: Product change.** We shipped the new dashboard on Nov 5. Could have broken a workflow. Checked: retention for Nov 1-9 (pre-dashboard) cohort is 67% — normal. Ruled out.

**Hypothesis 2: Email notification regression.** The email infra team migrated to a new provider on Nov 10. Checked logs: users who signed up Nov 10-18 received 0 re-engagement emails at Day 3 and Day 7. That's the exact cohort driving the drop. Confirmed root cause.

**Hypothesis 3: Seasonal effect.** November has Thanksgiving. Checked prior year: no dip. Ruled out.

## Impact

- 1,240 users missed their Day 3 and Day 7 emails
- At 45% email open rate and 12% click-through: ~67 users who would have re-engaged didn't
- Estimated MRR impact: ~$2,700 (67 users × $40 average plan)

## Actions taken

1. Fix deployed Dec 2 — new email provider fully validated
2. One-time "we missed you" email sent to the 1,240 affected users (3.1% re-engaged)
3. Email infra changes now require staging validation before production cutover

## Recommendations

Add a monitoring alert: if Day 3 email send rate drops >10% below baseline, page on-call immediately.
