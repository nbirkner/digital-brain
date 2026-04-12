# UX Heuristics & Principles

## Table of Contents
1. Nielsen's 10 Usability Heuristics
2. Cognitive Principles
3. Gestalt Principles
4. Interaction Laws
5. PM-Specific UX Rules of Thumb

---

## 1. Nielsen's 10 Usability Heuristics

The most widely applied UX framework. Each includes the PM-relevant application.

**#1 Visibility of system status**
Users should always know what's happening. Provide timely, clear feedback.
- PM application: Loading states, progress indicators, success/error messages after any action. "Did my save go through?" should never be ambiguous.

**#2 Match between system and the real world**
Use the user's language, not internal/technical language. Follow real-world conventions.
- PM application: Button labels, error messages, empty state copy. "403 Forbidden" → "You don't have access to this."

**#3 User control and freedom**
Users make mistakes. Provide clearly marked emergency exits (undo, cancel, go back).
- PM application: Destructive actions need undo or confirmation. Don't trap users in flows. Always offer a way out.

**#4 Consistency and standards**
Same actions should look the same and behave the same. Follow platform conventions.
- PM application: If "Delete" is red in one place, it should be red everywhere. If Enter submits forms in one place, it should everywhere.

**#5 Error prevention**
Better to prevent errors than to show error messages.
- PM application: Disable buttons that can't be used yet. Warn before irreversible actions. Validate inline instead of on submit.

**#6 Recognition over recall**
Don't make users remember information from one part of the interface to use in another.
- PM application: Show the project name in context, don't make users remember which ID they just copied. Persistent labels, breadcrumbs, contextual help.

**#7 Flexibility and efficiency of use**
Experts need shortcuts. Beginners need clarity. Support both.
- PM application: Keyboard shortcuts, bulk actions, and advanced filters for power users. Progressive disclosure for new users.

**#8 Aesthetic and minimalist design**
Every extra element competes with relevant information. Remove what doesn't serve the user's current goal.
- PM application: Be ruthless about what's on screen at each step. "Does this help the user do what they're trying to do right now?"

**#9 Help users recognize, diagnose, and recover from errors**
Error messages should explain the problem in plain language and suggest a solution.
- PM application: "Something went wrong" is never acceptable. Say what went wrong and what to do next.

**#10 Help and documentation**
Even if a system can be used without documentation, it may be needed. Make help easy to find and search.
- PM application: Tooltips, contextual help, empty state guidance. Don't bury help in a separate docs site if users will need it in-product.

---

## 2. Cognitive Principles

**Cognitive load**
The brain has limited working memory. Every extra choice, label, or element uses some of it.
- Rule: Reduce the number of decisions users have to make at once. One primary action per screen.
- PM application: Wizard flows for complex setup. Progressive disclosure for advanced settings. Default values that are right for most users.

**Decision fatigue**
The more decisions a user has to make, the worse the quality of later decisions (and the more they abandon).
- Rule: Reduce choices. Provide smart defaults. Make the "right" choice obvious.
- PM application: Don't ask users to configure things that have sensible defaults. "Advanced settings" should be optional.

**Mental models**
Users approach your product with expectations from similar products they've used before.
- Rule: Match or clearly break from existing mental models. Don't half-match (most dangerous).
- PM application: If your "project" works differently than GitHub's "project," make that clear immediately. Invisible differences cause the worst confusion.

**Progressive disclosure**
Show only what the user needs right now. Reveal more as they need it.
- Rule: Start simple. Layer in complexity.
- PM application: Basic settings visible by default. "Advanced" behind a toggle. Onboarding shows core flow first, edge cases later.

**Feedback loops**
Users need confirmation that their actions worked. Absence of feedback reads as failure.
- Rule: Every action needs a response, even if it's just a visual state change.
- PM application: Optimistic UI (update the UI immediately, reconcile in the background) often better than waiting for server confirmation.

---

## 3. Gestalt Principles

How the brain groups visual elements.

**Proximity** — Elements close together are perceived as related.
- Application: Group related controls. Separate unrelated ones with whitespace, not just lines.

**Similarity** — Elements that look alike are perceived as related.
- Application: Use consistent visual treatment for items of the same type. Destructive actions should look different from constructive ones.

**Continuity** — The eye follows lines and curves.
- Application: Use alignment to create visual flow. Guide the user's eye to the next step.

**Closure** — The brain fills in incomplete shapes.
- Application: Progress indicators don't need to be complete to be understood. Partial outlines work.

**Figure/ground** — Users distinguish foreground from background.
- Application: Modals must clearly sit "above" the page. Overlapping elements create ambiguity.

**Common region** — Elements within a boundary are perceived as grouped.
- Application: Cards, panels, and containers create logical groupings without explicit labels.

---

## 4. Interaction Laws

**Fitts's Law**
Time to reach a target = function of distance and target size. Bigger and closer = faster.
- Application: Primary action buttons should be large and easy to reach (especially on mobile). Don't make destructive actions easy to tap accidentally.
- PM application: CTAs should be prominently placed. Don't hide the most-used action in a dropdown.

**Hick's Law**
Time to make a decision increases with the number of choices.
- Application: Fewer options = faster decisions. Limit navigation items, filter options, and action menus.
- PM application: If you have 12 filters, consider grouping or defaulting some. Every option you add increases time to action.

**Miller's Law**
People can hold roughly 7 (±2) items in working memory at once.
- Application: Don't show more than ~7 items in a list without pagination, grouping, or search.
- PM application: Long dropdowns, long nav menus, and long settings lists all degrade usability. Group or paginate.

**Jakob's Law**
Users spend most of their time on other products. They expect your product to work the same way.
- Application: Don't reinvent common patterns unless you have a strong reason. Ctrl+Z should undo. Clicking a logo should go home.
- PM application: When deviating from conventions, the benefit must clearly outweigh the cost of relearning.

**Doherty Threshold**
Productivity soars when a computer and user respond within 400ms of each other.
- Application: Loading states matter. Optimistic UI matters. Perceived speed is as important as actual speed.
- PM application: This is why skeleton screens and optimistic updates are worth the engineering cost.

---

## 5. PM-Specific Rules of Thumb

**Measure behavior, not stated preference.**
What users say they want and what they do are often different. Watch what they do.

**The first-run experience sets expectations.**
How a user experiences your product for the first time determines how they think about it forever. Invest here disproportionately.

**Interruptions cost more than they look.**
A modal, redirect, or context switch feels minor in a demo. In real use, it breaks flow. Default to non-interrupting patterns.

**Context switches are expensive.**
Switching a user to a new view/project/context without their intent is disorienting. Always prefer user-initiated context changes.

**Empty states are features, not edge cases.**
The state before a user has any data is when they're most lost and most likely to churn. Design empty states as onboarding.

**Error states reveal character.**
How your product handles things going wrong tells users whether to trust it. Good error states prevent churn; bad ones cause it.

**Reversibility reduces anxiety.**
If an action can be undone, users are more willing to try things. If it can't, they hesitate. Prefer reversible over irreversible wherever possible.

**Power users are vocal; casual users are silent.**
Feature requests from heavy users skew your roadmap toward complexity. Check activation and retention data to understand the silent majority.
