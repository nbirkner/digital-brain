# Setup — Interactive Onboarding Guide

Triggered when the user says "help me get setup", "let's get started", "set up my site", or runs `/setup`.

**Announce at start:** "I'll guide you through getting your digital brain set up and deployed. We'll go phase by phase — I'll check what's already done, guide you through each step, and actually do the work with you. Ready? Let's start."

---

## Before starting: check current state

Run these checks silently before the first message, then tell the user what phase to start from:

```bash
# Check 1: Does .env.local exist?
ls .env.local 2>/dev/null && echo "EXISTS" || echo "MISSING"

# Check 2: Is shared/ submodule initialized?
ls shared/ 2>/dev/null | head -3

# Check 3: Has soul.md been filled in? (look for TODO: in it)
grep -c "TODO:" personal/context/general/soul.md 2>/dev/null || echo "0"

# Check 4: Is there a git remote set?
git remote -v
```

Based on results, skip phases already done. Tell the user: "Looks like you've already done X and Y — let's pick up at [phase]."

---

## Phase 1: Initial deploy (empty site, no content)

**Goal:** Get the site live on Vercel with just auth working — no personal content yet. This proves the setup works before we invest time in content.

### Step 1.1: Create your .env.local

```bash
cp .env.example .env.local
```

Tell the user: "I've created your .env.local. Now let's fill it in together. I'll ask for each value one at a time."

### Step 1.2: NEXTAUTH_SECRET

Run: `openssl rand -base64 32` and capture the output.
Tell the user: "Here's your NEXTAUTH_SECRET — I'll add it to your .env.local automatically." Then edit .env.local to set NEXTAUTH_SECRET.

### Step 1.3: Google OAuth

Tell the user:
"Now we need Google OAuth credentials so you can log in. Here's exactly what to do:

1. Go to console.cloud.google.com
2. Create a new project — name it anything (e.g. 'my-digital-brain')
3. In the left menu: APIs & Services → Credentials
4. Click 'Create Credentials' → 'OAuth 2.0 Client ID'
5. Application type: Web application
6. Authorized redirect URIs — add exactly this:
   `http://localhost:3000/api/auth/callback/google`
7. Click Create. You'll see a Client ID and Client Secret.

Paste your Client ID here when ready:"

Wait for user to paste Client ID. Then ask for Client Secret. Edit .env.local to set AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET.

### Step 1.4: ALLOWED_EMAIL

Ask: "What's your Google account email address? (This is the only email that can log in to your site.)"
Set ALLOWED_EMAIL in .env.local.

### Step 1.5: GITHUB_REPO

Ask: "What's your GitHub username?"
Set GITHUB_REPO in .env.local as `USERNAME/digital-brain`.

### Step 1.6: NEXTAUTH_URL

Set NEXTAUTH_URL=http://localhost:3000 in .env.local.
Tell the user: "Set to localhost for now — we'll update this after Vercel gives you a domain."

### Step 1.7: Push to GitHub

```bash
git add .gitignore  # make sure .env.local is gitignored
git status
```

Tell the user: "Your .env.local is NOT committed (it's in .gitignore — your secrets stay local). Let's push the code."

```bash
gh repo create digital-brain --public --clone=false
git remote add origin https://github.com/USERNAME/digital-brain.git
git push -u origin main
```

(Use the username from Step 1.5.)

### Step 1.8: Deploy to Vercel

Tell the user:
"Now let's deploy. Go to vercel.com:
1. Click 'Add New Project'
2. Import your GitHub repo (USERNAME/digital-brain)
3. Set Root Directory to: `site`
4. IMPORTANT: Before clicking Deploy, click 'Environment Variables' and add all the vars from your .env.local. I'll list them now:"

Print every variable from .env.local (keys only, not values) and tell user to add them all to Vercel.

"Also update NEXTAUTH_URL to your Vercel domain once you see it (e.g. https://digital-brain-abc.vercel.app)"

"Click Deploy and paste your Vercel URL here when it's live:"

Wait for user to paste URL. Confirm it works.

### Step 1.9: Update Google OAuth for production

Tell the user:
"One more thing for Google OAuth — go back to console.cloud.google.com → your project → Credentials → your OAuth client, and add this redirect URI:
`https://YOUR_VERCEL_URL/api/auth/callback/google`

Replace YOUR_VERCEL_URL with the URL you just shared."

**Phase 1 complete.** Tell the user: "Your site is live. You can log in but it'll be mostly empty — that's expected. Let's move to Phase 2: connecting your API keys."

---

## Phase 2: API keys

**Goal:** Get Todoist, Anthropic, and the shared project wired up.

### Step 2.1: Anthropic API key

Ask: "Do you already use Claude Code? If yes, you probably already have an ANTHROPIC_API_KEY — it's the key you used to set up Claude Code. If not, go to console.anthropic.com → API Keys → Create Key."

Wait for key. Set ANTHROPIC_API_KEY in .env.local AND tell them to add it to Vercel env vars.

### Step 2.2: Todoist

Ask: "Do you have a Todoist account? If not, go to todoist.com and create one — the free plan works."

"Get your API token: todoist.com/app/settings/integrations/developer → copy the token."

Set TODOIST_API_TOKEN.

"Now create two projects in Todoist: one called 'Work' and one called 'Personal'. Find each project ID by opening the project in Todoist and looking at the URL — the ID is the long string after /project/."

Set TODOIST_WORK_PROJECT_ID, TODOIST_PERSONAL_PROJECT_ID, NEXT_PUBLIC_TODOIST_WORK_PROJECT_ID, NEXT_PUBLIC_TODOIST_PERSONAL_PROJECT_ID.

### Step 2.3: Shared Todoist project

Ask: "Your partner should have invited you to a shared Todoist project. Have you accepted the invite? If yes, open that project in Todoist and copy its ID from the URL."

Set TODOIST_SHARED_PROJECT_ID and NEXT_PUBLIC_TODOIST_SHARED_PROJECT_ID.

### Step 2.4: Push env var updates to Vercel

Remind user: "Go to your Vercel project → Settings → Environment Variables and add all the new values you just set. Then trigger a redeploy."

**Phase 2 complete.** Tell the user: "All API keys are wired. Let's connect the shared content."

---

## Phase 3: Connect the shared content repo

**Goal:** Mount your partner's shared content repo so you both see the same Life Admin data.

Ask: "Your partner should give you the shared repo URL. It looks like: https://github.com/PARTNER/niki-juan-shared.git — paste it here:"

Wait for URL. Then run:

```bash
git submodule add [URL] shared
git submodule update --init
```

Verify:
```bash
ls shared/
```

Tell user what folders appeared. Then push:

```bash
git add .gitmodules shared
git commit -m "feat: add shared content submodule"
git push
```

**Phase 3 complete.** Tell the user: "Shared content is connected. Your Life Admin section will now show the same content as your partner. Let's move to what matters most: teaching Claude who you are."

---

## Phase 4: Your personal context (this is the important part)

**Goal:** Fill in the three files Claude reads to understand who you are. Be direct — there's no wrong answer.

Tell the user: "These three files are what make this system yours. Claude reads them at the start of every session. The more honest and specific you are, the more useful Claude becomes. I'll ask you questions and write the files for you."

### Step 4.1: soul.md — who you are

Ask these questions one at a time. Wait for answers before asking the next.

1. "What do you do for work? (Role, company, what you actually spend your time on)"
2. "What are you trying to accomplish in the next 3-6 months — at work and personally?"
3. "How do you like to work? (Morning person or night? Prefer short focused sessions or long blocks? How do you handle being stuck?)"
4. "What stresses you out most at work?"
5. "What are you proud of recently?"

After all answers, write `personal/context/general/soul.md` using the answers. Keep it in first person, conversational, specific. Remove all TODO: placeholders.

### Step 4.2: goals.md — current priorities

Ask:
1. "What are your top 3 priorities this quarter at work?"
2. "What are 1-2 personal priorities (health, relationships, finances, learning)?"
3. "What are you trying to finish or decide this week?"
4. "Any key dates or deadlines coming up?"

Write `personal/context/general/goals.md` with the answers.

### Step 4.3: style.md — your writing voice

Ask:
1. "How would you describe how you write? Formal or casual? Short or detailed?"
2. "Who are the main people you write to? (Manager, teammates, clients, partner?)"
3. "Is there anything you never do in writing — words you hate, styles that feel off?"
4. "Paste an example of something you've written that felt like you (a Slack message, email, doc — anything)."

Write `personal/context/writing-style/style.md` with the answers.

Commit all three files:
```bash
git add personal/context/
git commit -m "feat: add personal context files"
git push
```

**Phase 4 complete.** Tell the user: "Claude now knows who you are. Every session from here will feel much more tailored."

---

## Phase 5: Your first real content

**Goal:** Replace a piece of demo content with something real so the system starts feeling like yours.

Tell the user: "The site has placeholder content from 'Alex Chen'. Let's replace one thing with something real — your choice."

Offer these options:
1. "A work doc (PRD, decision, analysis, meeting notes)"
2. "A personal note or journal entry"
3. "Your Q1/Q2 goals doc"
4. "Skip for now — I'll add content myself later"

Based on their choice, guide them to create one real file in the right location. Help them write it if they want.

Then tell them: "You're set up. Here's what to do next:
- Add more work docs to `work/docs/`
- Daily notes go in `personal/notes/YYYY-MM-DD.md`
- Use `/daily-plan` to start each day
- Use `/meeting-notes` after any meeting
- Update `personal/context/general/goals.md` every Monday

Type `/daily-plan` to try your first skill."

---

## Notes for Claude

- Be conversational and warm throughout — this is someone's first time using the system
- Actually execute commands and edit files — don't just tell them what to do
- If a step fails, diagnose and fix it before moving on
- If they paste a key and it looks wrong (wrong format, too short), flag it
- Keep each phase tight — don't explain more than the user needs to take the next step
- The goal is: at the end of Phase 1, a real URL is live. At the end of Phase 4, Claude knows who they are.
