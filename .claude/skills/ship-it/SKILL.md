---
name: ship-it
description: "End-to-end git workflow from uncommitted changes to merged code. Handles committing, pushing, PR creation, and merging with safety checks throughout. TRIGGER on: 'ship it', 'commit and push', 'commit my changes', 'git commit', 'stage and commit', 'split commits', 'done, push everything', 'merge and deploy', or any request to commit, push, or complete the git workflow. If user only wants to commit (not push/PR), stop after Phase 1 and report."
---

# Ship It - End-to-End Git Workflow

Complete git workflow from uncommitted changes to deployed code. Handles commits, pushes, PR creation, and merging with safety checks throughout.

## Workflow

Follow these steps in order. Stop and report errors if any step fails.

### 1. Detect Current State

Run these checks in parallel:

```bash
git status
git branch --show-current
git log --oneline -3
gh pr status 2>/dev/null || echo "No gh CLI or no PRs"
```

Determine:
- Current branch name
- Uncommitted changes (modified, untracked files)
- Recent commits
- Existing PR for this branch (if any)

### 2. Safety Pre-Flight Checks

**CRITICAL SAFETY RULES:**

- NEVER force push to main/master
- NEVER push without committing first if there are uncommitted changes
- NEVER merge without checking PR status
- ALWAYS confirm before destructive operations
- ALWAYS verify each step succeeded before proceeding

**Check for blockers:**
- Merge conflicts → report and stop
- Failed tests (if detectable) → report and ask user
- On main with uncommitted changes → ask user if they meant to create a branch first

### 3. Commit Changes (if uncommitted changes exist)

**If commit-only requested** (user says "commit this" without "push" or "ship"), complete this step and stop. Report the commit hash and message, then ask if they want to continue to push/PR.

**If there are uncommitted changes:**

a) Show the user what will be committed:
```bash
git status --short
git diff --stat
```

b) Decide: one commit or multiple?

Before staging anything, try to describe the changes in 1-2 sentences. If you can't — the commit is probably too big and should be split. Split when changes span multiple concerns:
- Feature code vs. its tests → separate commits
- Refactor vs. new behavior → separate commits
- Dependency bumps vs. product changes → separate commits
- Formatting/linting vs. logic → separate commits

c) Stage files:

For clean, whole-file changes:
```bash
git add <specific-files>   # prefer explicit files over git add .
```

For mixed changes within a single file (some hunks belong in this commit, some don't):
```bash
git add -p <file>          # interactively stage hunks
git restore --staged -p <file>  # unstage specific hunks if needed
```

d) Write the commit message:

- Format: `<type>: <description>` — e.g., `feat: add zero data retention policy`
- Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
- Subject line: ≤72 chars, imperative mood ("add" not "added")
- Body (when non-obvious): explain WHAT changed and WHY — not an implementation diary
- Read recent commits first to match team style

e) Commit:
```bash
git commit -m "$(cat <<'EOF'
<commit-message>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

f) Verify and check:
```bash
git log -1 --oneline
```
Run the repo's fastest meaningful check (lint, type-check, or fast test) before moving on. If it fails, fix before proceeding.

g) Repeat b–f for each logical unit if splitting commits.

**If no uncommitted changes:**
Skip to step 4.

### 4. Push to Remote

**Determine push strategy based on branch:**

**If on main/master:**
- Ask user for confirmation: "You're on main. Push directly to main, or create a feature branch first?"
- If confirmed, push:
  ```bash
  git push
  ```

**If on feature branch:**
- Check if branch tracks remote:
  ```bash
  git rev-parse --abbrev-ref @{upstream} 2>/dev/null
  ```
- If no upstream, push with `-u`:
  ```bash
  git push -u origin <branch-name>
  ```
- If upstream exists, push:
  ```bash
  git push
  ```

**Verify push succeeded:**
```bash
git status
```
Should show "up to date with origin".

### 5. Handle PR Flow

**Check for existing PR:**
```bash
gh pr status
```

**Scenario A: No PR exists and on feature branch**
→ Create PR

a) Generate PR title and description:
- Title: Short summary of changes (from commit messages)
- Description:
  ```
  ## Summary
  - <bullet points of changes>

  ## Test plan
  - [ ] <testing steps>

  🤖 Generated with Claude Code
  ```

b) Create PR:
```bash
gh pr create --title "<title>" --body "$(cat <<'EOF'
<description>
EOF
)"
```

c) Get PR URL and show to user

**Scenario B: PR exists and user wants to merge**
→ Merge PR

a) Check PR status:
```bash
gh pr view <pr-number> --json state,mergeable,reviewDecision,statusCheckRollup
```

b) Verify PR is mergeable:
- State: OPEN
- Mergeable: MERGEABLE
- Reviews: Approved (or user confirms to skip)
- CI checks: Passing (or user confirms to skip)

c) If checks pass or user confirms, merge:
```bash
gh pr merge <pr-number> --merge --delete-branch
```

d) Switch back to main and pull:
```bash
git checkout main && git pull
```

**Scenario C: On main with no PR needed**
→ Already done (pushed in step 4)

**Scenario D: User wants to merge ALL open PRs**
→ STOP and ask for confirmation. This is dangerous. List PRs and ask which one to merge.

### 6. Final Verification

Report summary to user:

```
✅ Shipped successfully!

- Committed: <commit-hash> <commit-message>
- Pushed to: <branch-name>
- PR: <pr-url> (<status>)
- Current branch: <branch-name>
```

Run final status check:
```bash
git status
```

## Error Handling

**Common errors and solutions:**

| Error | Solution |
|-------|----------|
| Merge conflict | Show conflict files, ask user to resolve, then re-run |
| PR checks failing | Ask user: wait for checks, or merge anyway? |
| No git repo | Report error, cannot proceed |
| No gh CLI | Can still commit and push, but cannot create/merge PRs via CLI. Offer to generate PR manually. |
| Permission denied | Check git credentials, SSH keys |
| Branch protection | Cannot push to main directly, must create PR |

**For any error:**
1. Show the full error message
2. Explain what went wrong in plain language
3. Suggest next steps
4. Don't retry the same command unless user explicitly asks

## Examples

**Example 1: Feature complete, create PR**

User: "Ship it"

Actions:
1. Detect: on `feature/auth-flow`, uncommitted changes
2. Commit changes with message "feat: add OAuth authentication flow"
3. Push to origin/feature/auth-flow
4. Create PR "Add OAuth authentication flow"
5. Report PR URL to user

**Example 2: PR approved, merge it**

User: "Merge and deploy"

Actions:
1. Detect: on `feature/metrics`, PR #123 exists and approved
2. No uncommitted changes
3. Already pushed
4. Merge PR #123
5. Switch to main, pull latest
6. Report success

**Example 3: Quick fix on main**

User: "Ship this quick fix"

Actions:
1. Detect: on `main`, small uncommitted change
2. Ask: "You're on main. Push directly, or create a feature branch?"
3. If user confirms direct push:
   - Commit with message "fix: typo in README"
   - Push to main
   - Report success

## Notes

- This skill prioritizes safety over speed
- Always show what will happen before doing it
- Never auto-merge without checks (unless user explicitly overrides)
- Follow the user's existing commit message style
- Respect branch protection rules
- Use `gh` CLI for PR operations (fallback to manual if unavailable)
