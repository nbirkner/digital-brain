# Common Product UI Patterns

## Table of Contents
1. Feedback Patterns (toasts, banners, inline)
2. Confirmation Patterns (modals, undo, warnings)
3. Navigation Patterns (after creation, after deletion, after save)
4. State Patterns (empty, loading, error, success)
5. Onboarding Patterns
6. Progressive Disclosure Patterns

---

## 1. Feedback Patterns

### Toast / Snackbar
**What:** Temporary non-blocking notification that appears and auto-dismisses.
**Use when:** Confirming a low-stakes action that the user initiated (save, copy, send).
**Duration:** 3-5 seconds. Destructive undos need longer (5-8s).
**Include CTA when:** The next logical action can be offered (e.g., "Project created — Switch to it").
**Don't use when:** The message is critical and must be acted on, or when the action could fail and needs a retry.

### Inline feedback
**What:** Status shown within the element that triggered the action (button changes state, field shows checkmark).
**Use when:** The feedback is directly tied to a specific input or control.
**Better than toasts when:** The connection between action and feedback needs to be visually obvious.

### Banner / Alert
**What:** Persistent message at the top of a section or page.
**Use when:** Something requires the user's attention before they can proceed, or a persistent state needs to be visible (e.g., trial expiring, quota exceeded).
**Don't overuse:** Multiple banners compete. One per page max.

### No feedback (silent action)
**Use when:** The action result is immediately and obviously visible in the UI (e.g., an item appears in a list, a toggle visually changes). Adding a toast on top of a visible result is redundant.

---

## 2. Confirmation Patterns

### Modal confirmation dialog
**Use when:** Action is irreversible AND high-stakes (delete, remove access, cancel subscription).
**Don't use when:** Action is reversible, low-stakes, or frequent — dialogs interrupt flow and users start clicking through them without reading.
**Anti-pattern:** Asking "Are you sure?" for every action. It's friction without safety — users learn to dismiss it.

### Undo (instead of confirm)
**Use when:** Action is reversible within a short window (archive, delete, move).
**Better than confirm dialogs because:** It lets the user act fast and recover if wrong, rather than slowing everyone down to protect the few.
**Pattern:** "Project deleted. [Undo]" toast with 5-8 second window.

### Inline warning
**Use when:** Wanting to flag risk without blocking the user (e.g., "This will affect 3 other members").
**Use near the action, not before it.**

### Typing to confirm
**Use when:** Action is catastrophic and irreversible (delete workspace, delete all data).
**Pattern:** "Type DELETE to confirm."
**Overuse is common** — reserve for truly irreversible, high-blast-radius actions only.

---

## 3. Navigation Patterns (what happens after an action)

### Stay in place
**Use when:** User is in a flow with more actions to take (creating multiple items, reviewing a list).
**Pattern:** Update the UI in place (e.g., add the new item to the list). Show confirmation via toast or inline feedback.

### Navigate to the new thing
**Use when:** There's a single, obvious next step that follows creation (e.g., user just created their first project and clearly needs to start configuring it).
**Risk:** If the user didn't expect the navigation, they feel disoriented. Use only when intent is clear.
**Better pattern:** Offer navigation via a CTA in the success toast: "Project created — [Go to settings]".

### Redirect after deletion
**Use when:** The current page's subject no longer exists. Navigate to the parent or list view.
**Anti-pattern:** Staying on a 404 or blank page after deleting the thing you were viewing.

### Context switch on creation (e.g., switching to a newly created project)
**Use only when:** The user clearly intends to start working in the new context immediately AND they won't be creating multiple items in sequence.
**Prefer:** User-initiated switch via CTA rather than automatic switch. Automatic context changes are disorienting, especially in apps that manage context persistently (like project/org switching).

---

## 4. State Patterns

### Empty state
**What:** What the user sees before any content exists.
**Must include:** A clear explanation of what this section is for + a primary CTA to create the first thing.
**Best empty states:** Show a preview of what it looks like when populated. Reduce the intimidation of "nothing here."
**Anti-pattern:** Blank space with no guidance.

### Loading state
**For < 1 second:** Skeleton screen or shimmer (layout placeholder). No spinner needed.
**For 1-3 seconds:** Skeleton + progress indicator.
**For 3+ seconds:** Progress indicator + estimated time or step indicator. Consider whether the wait is avoidable.
**Anti-pattern:** Blank white screen during load. Users interpret it as broken.

### Error state (page-level)
**Must include:** What went wrong (in plain language), what the user can do about it (specific action, not just "try again"), a way to get help.
**Types:**
- 404: "This page doesn't exist. [Back to projects]"
- 403: "You don't have access. [Request access] or [Contact admin]"
- 500: "Something went wrong on our end. We're working on it. [Status page link]"

### Partial error state (form/action-level)
**Show errors:** Inline, next to the field that failed. Not in a toast that disappears.
**Preserve input:** Never clear a form on error. That's a cardinal sin.

### Success state
**For simple actions:** Toast is sufficient.
**For complex flows (e.g., multi-step setup):** A dedicated success screen with a clear "what's next" CTA. Don't just drop the user back to a blank state.

---

## 5. Onboarding Patterns

### Progressive onboarding (preferred)
**What:** Teach the user through doing, in context, as they encounter features.
**Use when:** The product has a clear activation path and users can get value quickly.
**Pattern:** Empty states with CTAs, contextual tooltips, inline hints.

### Checklist / setup guide
**What:** A visible list of setup tasks in a sidebar or dashboard widget.
**Use when:** Setup requires multiple steps and users may not naturally discover them.
**Pattern:** Show completion progress. Mark items done automatically when detected.
**Anti-pattern:** Never-dismissible setup checklists. Always let users dismiss.

### Wizard / guided setup
**What:** Step-by-step modal or page flow for initial configuration.
**Use when:** The user cannot get value from the product without completing some setup (e.g., connecting an API key, creating first workspace).
**Keep short:** 3-5 steps max. Every additional step drops completion rate.
**Always offer skip:** Let advanced users bypass what they already know.

### Tooltips and coachmarks
**Use for:** Pointing out non-obvious features a user has access to but hasn't discovered.
**Don't use for:** Teaching users how to do basic tasks — that belongs in empty states and onboarding flows.
**One at a time:** Never show more than one coachmark simultaneously.

---

## 6. Progressive Disclosure Patterns

### Show/hide advanced settings
**Pattern:** Basic settings visible by default. "Advanced settings" section collapsed or behind a toggle.
**Use when:** Most users don't need the advanced options, but power users do.

### Expandable rows / accordions
**Use when:** Each item in a list has detail that only some users need to see.
**Anti-pattern:** Expanding everything by default defeats the purpose.

### Overflow menus (...)
**Use when:** There are more than 3-4 actions available, but only 1-2 are used frequently.
**Primary actions:** Always visible. Secondary/rare actions: in overflow menu.
**Anti-pattern:** Putting the most-used action inside the overflow menu.

### Tiered navigation
**Level 1:** High-level categories (global nav).
**Level 2:** Section-specific nav (sidebar or tabs).
**Level 3+:** Contextual (in-page tabs, settings subcategories).
**Rule:** Don't exceed 3 levels of navigation. If you need 4, you have an information architecture problem.
