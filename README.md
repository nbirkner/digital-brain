# digital-brain

A personal and work OS for knowledge workers. Fork it, deploy it in 30 minutes, and replace the demo content with your own. Built for PMs, founders, operators, researchers, writers, and engineers — anyone who wants a structured OS with AI integration.

Built with Next.js, NextAuth, and Anthropic Claude. Runs on Vercel. Stores everything as markdown files in this repo — no database required.

> **If you use Claude Code, you already have everything you need.** `ANTHROPIC_API_KEY` powers the Command tab — no additional API keys required for AI features.

## What's included

- **Docs** — PRDs, decisions, analyses, comms. Searchable, tagged, filterable.
- **Notes** — Daily notes and meeting notes, organized by date.
- **Tasks** — Todoist integration. Create and view tasks without leaving the app.
- **Self** — Health tracking, routines, hobbies, quotes, certifications.
- **Life** — Housing, finances, travel, life admin.
- **Goals** — Quarterly goals, personal growth.
- **Logs** — Session logs and work logs.
- **Command tab** — Natural language commands ("add task: review the PRD Friday", "reschedule team sync to Thursday").
- **AI context** — CLAUDE.md system prompt teaches Claude Code your entire workspace.
- **Skills** — 25 slash commands for common PM and knowledge worker workflows.

## Setup (under 30 minutes)

### 1. Fork and clone

```bash
# On GitHub: click "Fork" on the digital-brain repo, then clone your fork:
gh repo clone yourname/digital-brain
cd digital-brain
```

### 2. Install dependencies

```bash
cd site
pnpm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in every variable. See comments in the file for where to find each value.

Required:
- `NEXTAUTH_SECRET` — run `openssl rand -base64 32` to generate
- `NEXTAUTH_URL` — `http://localhost:3000` for local dev
- `AUTH_GOOGLE_ID` + `AUTH_GOOGLE_SECRET` — from Google Cloud Console (OAuth 2.0 credentials)
- `ALLOWED_EMAIL` — your Google account email (only this email can log in)
- `ANTHROPIC_API_KEY` — from console.anthropic.com. Used for Command tab classification. **Claude Code users already have this — no additional setup needed.**
- `GITHUB_REPO` — `yourname/digital-brain` (your fork)

Optional (enables Tasks and Command tab task creation):
- `TODOIST_API_TOKEN` — from todoist.com/app/settings/integrations/developer
- `TODOIST_WORK_PROJECT_ID` — Todoist project ID for work tasks
- `TODOIST_PERSONAL_PROJECT_ID` — Todoist project ID for personal tasks
- `NEXT_PUBLIC_TODOIST_WORK_PROJECT_ID` — same as above (for client components)
- `NEXT_PUBLIC_TODOIST_PERSONAL_PROJECT_ID` — same as above

Optional (enables "Open in Cursor" link in Notes):
- `NEXT_PUBLIC_REPO_ROOT` — absolute path to this repo on your machine (e.g., `/Users/yourname/Code/digital-brain`)

### 4. Build content cache and run locally

```bash
# From site/ (the build:cache script lives there):
cd site
pnpm build:cache

# Then start the dev server:
pnpm dev
```

Open http://localhost:3000. Log in with your Google account.

You'll see the demo content. Browse around to understand the structure, then replace the demo files with your own.

### 5. Deploy to Vercel

1. Push your fork to GitHub
2. Go to vercel.com → New Project → Import your fork
3. Set the root directory to `site/`
4. Add all environment variables from your `.env.local` (update `NEXTAUTH_URL` to your Vercel domain)
5. **No build command override needed.** `pnpm build` in `site/` already chains `build-content-cache.mjs` + `build-search-index.mjs` + `next build` in sequence.
6. Deploy

Your site will auto-deploy on every push to main.

## Replacing demo content

The demo content uses "Alex Chen" and "Acme Corp" as placeholder names. Replace them with your own files:

### Work content

| Type | Location |
|------|----------|
| PRDs | `work/docs/prds/` — one folder per feature |
| Decisions | `work/docs/decisions/` |
| Analyses | `work/docs/analyses/` |
| Weekly plans | `work/docs/comms/weekly-plans/` |
| Weekly reviews | `work/docs/comms/weekly-reviews/` |
| Slack drafts | `work/docs/comms/slack-messages/` |
| Meeting notes | `work/notes/YYYY-MM-DD/` |

### Personal content

| Type | Location |
|------|----------|
| Daily notes | `personal/notes/YYYY-MM-DD.md` |
| Goals | `personal/docs/growth/` |
| Certifications | `personal/docs/library/certifications/` |
| Travel | `personal/site/travel/trips/` |
| Finances | `personal/site/finances/finances.md` |
| Health tracking | `personal/docs/health/` |
| Routine | `personal/docs/routine/` |
| Hobbies | `personal/docs/hobbies/` |
| Quotes | `personal/docs/library/quotes/` |
| Supplements | `personal/site/health/supplement-stack.md` |

> **Note:** `personal/context/general/soul.md`, `goals.md`, and `style.md` are read by Claude Code but are NOT indexed as browsable site pages. They won't appear in the docs list — that's intentional. They're Claude's private reference files, not viewable content.

### Context files (read by Claude)

Update these first — they teach Claude Code who you are:

- `personal/context/general/soul.md` — who you are
- `personal/context/general/goals.md` — current priorities
- `personal/context/writing-style/style.md` — your writing voice

### Frontmatter format

Every markdown file should start with:

```yaml
---
title: Your Title Here
date: YYYY-MM-DD
tags: [tag1, tag2]
---
```

Valid tags are defined in `site/lib/tag-taxonomy.ts`.

## Using skills with Claude Code

Skills are slash commands that work in Claude Code sessions. After opening the repo in Claude Code:

```
/prd-draft      — Start a new PRD
/meeting-notes  — Turn a transcript into structured notes
/daily-plan     — Plan your day
/weekly-plan    — Set up the week
/decision-doc   — Document a decision
/standup        — Write a standup update
/impact-sizing  — Size a feature or initiative
```

Full list in `.claude/skills/`. Each skill has a `SKILL.md` with instructions.

## Staying in sync with updates

This repo gets updated as new features ship. Pull improvements into your fork:

```bash
git remote add upstream https://github.com/nbirkner/digital-brain.git
git fetch upstream
git merge upstream/main
```

Releases are tagged — check the releases page for changelogs before merging.

## Stack

- **Framework:** Next.js 15 (App Router)
- **Auth:** NextAuth.js with Google OAuth
- **Styling:** Tailwind CSS
- **Content:** Gray-matter (markdown frontmatter parsing)
- **AI (Command tab):** Anthropic Claude Haiku
- **Tasks:** Todoist API
- **Hosting:** Vercel
- **Package manager:** pnpm

## License

MIT
