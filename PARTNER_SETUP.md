# Setting Up Your Own digital-brain

A step-by-step guide for getting your own instance running alongside your partner's.

**Time required:** ~45 minutes  
**What you'll need:** A computer, a terminal, and accounts at GitHub, Google, Vercel, and Anthropic.

---

## Before you start

Your partner needs to do two things before you begin:

1. **Add you as a collaborator on the shared content repo** — GitHub → shared repo → Settings → Collaborators → Add people → enter your GitHub username. You'll get an email invite; accept it.
2. **Invite you to the shared Todoist project** — Todoist → open the shared project → click the three-dot menu → Invite People → enter your email. Accept the invite in Todoist.

Once you've accepted both invites, you're ready.

---

## Part 1: Prerequisites

### 1.1 Install required tools

Open your terminal (on Mac: press `Cmd+Space`, type "Terminal", hit Enter).

**Git** (usually pre-installed on Mac):
```bash
git --version
```
If you see `git version 2.x.x`, you have it. If not, install Xcode Command Line Tools:
```bash
xcode-select --install
```

**Node.js 18 or higher:**
Go to [nodejs.org](https://nodejs.org) → click the "LTS" download button → run the installer.

**pnpm** (the package manager this project uses):
```bash
npm install -g pnpm
```

**GitHub CLI** (`gh`) — lets you clone repos with one command:
Go to [cli.github.com](https://cli.github.com) → click "Download for Mac" → run the installer.

Then authenticate:
```bash
gh auth login
```
Follow the prompts: choose GitHub.com → HTTPS → Yes → Login with a web browser. It will open a browser window — log in with your GitHub account.

### 1.2 Verify installs

Run all four of these. Each should print a version number, not an error:
```bash
git --version       # e.g. git version 2.43.0
node --version      # e.g. v20.11.0
pnpm --version      # e.g. 8.15.0
gh --version        # e.g. gh version 2.44.1
```

If any of them prints "command not found", the install didn't work. Restart your terminal and try again before continuing.

---

## Part 2: Fork and clone

### 2.1 Fork the repo

On GitHub, go to the digital-brain repo page. Click the **Fork** button in the top-right corner. On the next screen:
- Repository name: leave it as `digital-brain` (or rename it if you prefer)
- Leave everything else default
- Click **Create fork**

This creates a copy of the repo under your GitHub account.

### 2.2 Clone your fork

```bash
gh repo clone YOUR_GITHUB_USERNAME/digital-brain
cd digital-brain
```

Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username (e.g., `gh repo clone jsmith/digital-brain`).

### 2.3 Install dependencies

```bash
cd site
pnpm install
```

This installs all the packages the site needs. It takes 1-2 minutes on first run.

---

## Part 3: Google OAuth (required for login)

The site uses Google sign-in. You need to register your own OAuth app in Google Cloud Console.

### 3.1 Create a Google Cloud project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Sign in with the Google account you want to use to log in to your site
3. At the top of the page, click the project dropdown (it might say "Select a project" or show an existing project name)
4. Click **New Project** in the modal that opens
5. Name it something like `digital-brain` or `my-personal-site`
6. Click **Create**
7. Wait a few seconds, then click the notification bell → select your new project, or use the dropdown at the top to switch to it

### 3.2 Enable the Google+ API

1. In the left sidebar, click **APIs & Services** → **Library**
2. Search for `Google+ API`
3. Click on it → click **Enable**

If Google+ API doesn't appear, search for `People API` instead and enable that. Either works.

### 3.3 Create OAuth credentials

1. In the left sidebar, click **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** at the top → choose **OAuth client ID**
3. If prompted to configure a consent screen first:
   - Click **Configure Consent Screen**
   - Choose **External** → click **Create**
   - Fill in **App name** (e.g., "My Digital Brain"), **User support email** (your email), **Developer contact email** (your email)
   - Click **Save and Continue** through all remaining steps (you can leave most fields blank)
   - On the last step, click **Back to Dashboard**
   - Then go back to **Credentials** → **+ Create Credentials** → **OAuth client ID**
4. For **Application type**, choose **Web application**
5. **Name**: anything, like "digital-brain web"
6. Under **Authorized redirect URIs**, click **Add URI** and add:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   (You'll add your production URL here in Part 8 after you know it.)
7. Click **Create**
8. A popup shows your **Client ID** and **Client Secret**. Copy both — you'll need them in Part 5.

---

## Part 4: Get your API keys

### 4.1 Anthropic API key (for Command tab)

> If you already use Claude Code on your computer, you have this key. Find it in `~/.claude/.env` or ask your terminal: `cat ~/.claude/.env | grep ANTHROPIC`. Skip to 4.2 if you have it.

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign in (or create an account — it's free to sign up)
3. Click **API Keys** in the left sidebar
4. Click **Create Key**
5. Give it a name like `digital-brain`
6. Copy the key (starts with `sk-ant-`) — you can only see it once

### 4.2 Todoist API token

1. Go to [todoist.com/app/settings/integrations/developer](https://todoist.com/app/settings/integrations/developer)
2. Sign in to Todoist
3. Scroll to **API token** — it's a long string of letters and numbers
4. Copy it

### 4.3 Find your Todoist project IDs

You need IDs for three projects: Work, Personal, and the shared project your partner invited you to.

**Step 1 — Make sure the projects exist.**  
Open Todoist. In the left sidebar, you should see your projects. If you don't have a "Work" project and a "Personal" project yet, create them: click **+** next to Projects → name it → hit Enter.

**Step 2 — Get the IDs via the Todoist API.**  
Run this command in your terminal, replacing `YOUR_TODOIST_TOKEN` with the token you copied in 4.2:

```bash
curl -s -H "Authorization: Bearer YOUR_TODOIST_TOKEN" \
  https://api.todoist.com/rest/v2/projects | \
  python3 -c "import sys,json; [print(f\"{p['name']}: {p['id']}\") for p in json.load(sys.stdin)]"
```

This prints a list like:
```
Inbox: 6XXXXXXXXXXXXXXX
Work: 6XXXXXXXXXXXXXXX
Personal: 6XXXXXXXXXXXXXXX
Household: 6XXXXXXXXXXXXXXX
```

Write down the IDs for:
- **Inbox** — you'll need this too (it's the default catch-all)
- **Work**
- **Personal**
- **The shared project** (the one your partner invited you to — it will appear in the list after you accept the invite)

If the shared project doesn't appear yet, accept the Todoist invite first, then re-run the command.

---

## Part 5: Set up environment variables

### 5.1 Create your .env.local

From the `site/` folder:
```bash
cp .env.example .env.local
```

Now open `.env.local` in a text editor. On Mac you can run:
```bash
open -a TextEdit .env.local
```

Or if you have VS Code: `code .env.local`

Fill in every value as follows:

---

**`NEXTAUTH_SECRET`**  
Generate a random secret by running this in your terminal:
```bash
openssl rand -base64 32
```
Copy the output (a long string of random characters) and paste it as the value.

---

**`NEXTAUTH_URL`**  
For local development, use:
```
NEXTAUTH_URL=http://localhost:3000
```
You'll update this to your Vercel URL in Part 8.

---

**`AUTH_GOOGLE_ID`**  
The **Client ID** you copied from Google Cloud Console in Part 3. It ends in `.apps.googleusercontent.com`.

---

**`AUTH_GOOGLE_SECRET`**  
The **Client Secret** you copied from Google Cloud Console in Part 3.

---

**`ALLOWED_EMAIL`**  
The email address of the Google account you'll use to log in. Only this email can access the site.
```
ALLOWED_EMAIL=yourname@gmail.com
```

---

**`ANTHROPIC_API_KEY`**  
The key from Part 4.1 (starts with `sk-ant-`).

---

**`GITHUB_REPO`**  
Your fork's repo in `owner/repo` format:
```
GITHUB_REPO=YOUR_GITHUB_USERNAME/digital-brain
```

---

**`GITHUB_TOKEN`**  
Required if you plan to use the external pages / publish feature (makes pages public from the site UI). Create one at [github.com/settings/tokens](https://github.com/settings/tokens):
- Click **Generate new token** → **Fine-grained tokens**
- Give it a name like `digital-brain`
- Under **Repository access**, choose **Only select repositories** → pick your digital-brain fork
- Under **Permissions** → **Contents** → set to **Read and write**
- Click **Generate token** → copy it immediately (you can only see it once)

If you don't plan to use external pages yet, you can leave this blank for now and add it later.

---

**`TODOIST_API_TOKEN`**  
The token from Part 4.2.

---

**`TODOIST_WORK_PROJECT_ID`** and **`NEXT_PUBLIC_TODOIST_WORK_PROJECT_ID`**  
Both get the same value: the Work project ID from Part 4.3.

---

**`TODOIST_PERSONAL_PROJECT_ID`** and **`NEXT_PUBLIC_TODOIST_PERSONAL_PROJECT_ID`**  
Both get the same value: the Personal project ID from Part 4.3.

---

**`NEXT_PUBLIC_TODOIST_INBOX_PROJECT_ID`**  
The Inbox project ID from Part 4.3.

---

**`TODOIST_SHARED_PROJECT_ID`** and **`NEXT_PUBLIC_TODOIST_SHARED_PROJECT_ID`**  
Both get the same value: the ID of the shared project your partner invited you to (from Part 4.3).

---

**`NEXT_PUBLIC_REPO_ROOT`** (optional)  
The absolute path to this repo on your computer. Enables "Open in Cursor" links in notes. Example:
```
NEXT_PUBLIC_REPO_ROOT=/Users/YOUR_USERNAME/digital-brain
```
To find your username: run `whoami` in the terminal. Leave blank if you don't use Cursor.

---

Your completed `.env.local` should have no `your-...-here` placeholders left. Every value should be filled in.

---

## Part 6: Add the shared content submodule

This connects your repo to the shared content your partner set up. You need the URL of the shared repo — your partner can give it to you (it's the GitHub URL of the private shared repo they invited you to).

```bash
# Run from the digital-brain root folder (not site/):
cd ~/digital-brain   # or wherever you cloned it
git submodule add https://github.com/PARTNERS_USERNAME/SHARED_REPO_NAME.git shared
git submodule update --init
```

Replace `PARTNERS_USERNAME` with your partner's GitHub username and `SHARED_REPO_NAME` with the name of the shared repo.

Verify it worked:
```bash
ls shared/
```

You should see the contents of the shared repo — folders like `housing/`, `finances/`, `travel/`, or whatever your partner has set up there. If the folder is empty, run:
```bash
git submodule update --init --recursive
```

---

## Part 7: Test locally

```bash
# From the site/ folder:
cd site
pnpm build:cache
pnpm build:search   # builds the search index — needed for search to work
pnpm dev
```

`build:cache` generates the content index (takes ~10 seconds). `build:search` builds the search index. `pnpm dev` starts the local server.

Open [http://localhost:3000](http://localhost:3000) in your browser.

**What to verify:**
- You can log in with your Google account (the one matching `ALLOWED_EMAIL`)
- The **Life** section shows content from the shared folder (Housing, Finances, Travel, etc.)
- The **Tasks** tab shows your Todoist tasks and has a "Shared" section with the shared project tasks
- The **Command** tab accepts input (type anything and it responds)

If something doesn't work, check the Troubleshooting section at the end.

---

## Part 8: Deploy to Vercel

### 8.1 Create your Vercel account and project

1. Go to [vercel.com](https://vercel.com) and sign up (use GitHub sign-in for easiest setup)
2. On your Vercel dashboard, click **Add New** → **Project**
3. Click **Import Git Repository** → find `YOUR_GITHUB_USERNAME/digital-brain` → click **Import**
4. On the configuration screen:
   - **Root Directory**: click **Edit** → type `site` → click **Continue**
   - **Framework Preset**: should auto-detect as Next.js
   - **Build Command**: leave as default (`pnpm build`)
   - **Output Directory**: leave as default
5. Do **not** click Deploy yet — you need to add environment variables first

### 8.2 Add environment variables

Still on the configuration screen, scroll down to **Environment Variables**. Add every variable from your `.env.local` file — all of them.

**Important:** For `NEXTAUTH_URL`, use your Vercel domain instead of `localhost`:
```
NEXTAUTH_URL=https://YOUR-PROJECT-NAME.vercel.app
```

Your Vercel domain will be shown in the browser URL bar on the configuration screen (or you can set a custom name). It follows the pattern `PROJECT-NAME.vercel.app`.

Once all variables are entered, click **Deploy**.

The first build takes 3-5 minutes. Watch the build log — if it fails, the Troubleshooting section covers the most common errors.

### 8.3 Give Vercel access to the shared repo

Because the shared repo is private, Vercel needs permission to clone it during builds.

**In most cases, this works automatically** — Vercel's GitHub integration has access to all repos your GitHub account can access, including repos you were invited to as a collaborator.

**If the build fails with an error like "fatal: repository not found" or "Permission denied":** Create a GitHub personal access token with submodule read access:

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens) → **Fine-grained tokens** → **Generate new token**
2. Name: `vercel-submodule`
3. Under **Repository access**: choose **Only select repositories** → add both your digital-brain fork AND the shared repo
4. Under **Permissions** → **Contents** → set to **Read-only**
5. Click **Generate token** → copy it
6. In Vercel: go to your project → **Settings** → **Environment Variables** → add:
   - Name: `GITHUB_TOKEN`
   - Value: the token you just created
7. Redeploy: **Deployments** → click the three-dot menu on the latest deploy → **Redeploy**

### 8.4 Update Google OAuth redirect URI

Now that you have your Vercel URL, go back to Google Cloud Console:

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → **APIs & Services** → **Credentials**
2. Click on the OAuth client you created in Part 3
3. Under **Authorized redirect URIs**, click **Add URI** and add:
   ```
   https://YOUR-PROJECT-NAME.vercel.app/api/auth/callback/google
   ```
   (Keep the localhost URI too — you need it for local development)
4. Click **Save**

If you set up a custom domain on Vercel, use that URL instead of the `.vercel.app` domain.

### 8.5 Verify the deploy

Open your Vercel URL (or custom domain) in a browser. You should be able to log in with Google and see your site. If login loops back to the sign-in page, double-check that `NEXTAUTH_URL` in Vercel matches your actual domain exactly (no trailing slash).

---

## Part 9: Set up Claude Code

Claude Code is optional but makes the repo much more useful — it's the AI assistant that knows your entire workspace.

### 9.1 Install Claude Code

If you don't have it yet:
```bash
npm install -g @anthropic-ai/claude-code
```

Authenticate it with your Anthropic API key:
```bash
claude
```
Follow the prompts to log in.

### 9.2 Open the repo

From your digital-brain folder:
```bash
claude .
```

Claude Code reads `CLAUDE.md` automatically on startup. It now knows the structure of your entire workspace.

### 9.3 Fill in your personal context files

These files teach Claude who you are. Replace the TODO placeholders with your actual information before using any skills.

**`personal/context/general/soul.md`** — who you are  
Open this file and replace the TODO sections with:
- 2-3 sentences on your background (job, how you got here, what you care about)
- What you're working on right now (current projects, initiatives)
- How you like to work (async vs sync, detail-oriented vs big-picture, what stresses you out)
- What you're trying to improve or grow toward

**`personal/context/general/goals.md`** — current priorities  
Replace the TODOs with:
- What you're focused on this week (2-3 sentences)
- Your top 3-5 priorities for the current quarter
- Open loops: decisions pending, things you've started but not finished, conversations you need to have

**`personal/context/writing-style/style.md`** — your voice  
Replace the TODOs with how you actually write: formal or casual, short or long sentences, words you use all the time, things you never say.

**`GOALS.md`** (in the repo root) — weekly context  
This is the file Claude reads first in every session. Update it every Monday with your top 3 priorities for the week and any important context Claude should know.

### 9.4 Try your first skill

```
/daily-plan
```

This generates a plan for your day based on your goals and context. It's a good test that everything is connected properly.

---

## Part 10: Replace demo content

The repo comes with placeholder content from a fictional user. Replace it with your own:

### Work content (private to you — only in your fork)

| What | Where to put it |
|------|-----------------|
| PRDs, specs, one-pagers | `work/docs/prds/` |
| Decision logs | `work/docs/decisions/` |
| Analyses | `work/docs/analyses/` |
| Meeting notes | `work/notes/YYYY-MM-DD/` (date-nested) |
| Weekly plans | `work/docs/comms/weekly-plans/` |
| Status updates | `work/docs/comms/status-updates/` |

### Personal content (private to you — only in your fork)

| What | Where to put it |
|------|-----------------|
| Daily notes | `personal/notes/YYYY-MM-DD.md` |
| Quarterly goals | `personal/docs/growth/` |
| Certifications | `personal/docs/library/certifications/` |
| Career materials | `personal/docs/career/` |

### Shared content (visible to both of you — edit in `shared/`)

| What | Where to put it |
|------|-----------------|
| Housing details | `shared/housing/` |
| Finances | `shared/finances/` |
| Trips | `shared/travel/trips/` |
| Cars | `shared/cars/` |
| Pet | `shared/luci/` (or rename the folder) |
| Relationship notes | `shared/relationship/` |

To delete the demo files: open the `work/`, `personal/`, and `shared/` folders, delete any files that don't apply to you, and add your own.

---

## Ongoing: keeping shared content in sync

### Pushing your changes to the shared repo

When you edit files inside `shared/`:

```bash
# First, commit and push the changes in the shared repo itself:
cd shared
git add .
git commit -m "update: housing info"
git push

# Then, update your main repo to point to the new shared commit:
cd ..
git add shared
git commit -m "chore: sync shared"
git push
```

Or do both in one command from the main repo root:
```bash
git push --recurse-submodules=on-demand
```

### Pulling your partner's changes

When your partner has updated shared files:
```bash
git submodule update --remote shared
git add shared
git commit -m "chore: sync shared"
git push
```

### Pulling upstream improvements to digital-brain

As the digital-brain template gets updated with new features, pull them into your fork:
```bash
git remote add upstream https://github.com/ORIGINAL_REPO_OWNER/digital-brain.git
git fetch upstream
git merge upstream/main
```

Run this every few weeks to stay current.

---

## Troubleshooting

### Login loops — sign in page appears over and over

**Cause:** `NEXTAUTH_URL` doesn't match where the site is actually running.

- Local: make sure `NEXTAUTH_URL=http://localhost:3000` (no trailing slash)
- Production: make sure it matches your exact Vercel domain (`https://your-project.vercel.app` with no trailing slash)

After changing `NEXTAUTH_URL` in Vercel, redeploy for it to take effect.

---

### Build fails with "fatal: repository not found" or "Permission denied"

**Cause:** Vercel can't access the private shared repo.

Fix: Create a `GITHUB_TOKEN` with read access to the shared repo and add it to Vercel environment variables. See Part 8.3 for exact steps.

---

### Command tab shows an error or does nothing

**Cause:** `ANTHROPIC_API_KEY` is missing or invalid.

Check: Go to Vercel → your project → Settings → Environment Variables → confirm `ANTHROPIC_API_KEY` is set and starts with `sk-ant-`. If you need a new key, generate one at [console.anthropic.com](https://console.anthropic.com).

---

### Tasks tab is empty or shows "failed to load"

**Cause:** `TODOIST_API_TOKEN` is wrong, or the project IDs don't match real projects.

Check: Run this in your terminal to verify your token works:
```bash
curl -s -H "Authorization: Bearer YOUR_TODOIST_TOKEN" \
  https://api.todoist.com/rest/v2/projects
```
If it returns an error, regenerate your token at [todoist.com/app/settings/integrations/developer](https://todoist.com/app/settings/integrations/developer).

Also verify that the project IDs in your `.env.local` (or Vercel env vars) match the IDs returned by the API command in Part 4.3.

---

### Shared content section is empty

**Cause:** The submodule wasn't initialized properly.

Fix:
```bash
git submodule update --init --recursive
```

If the `shared/` folder is empty after that, confirm you were added as a collaborator on the shared repo and accepted the invite, then try:
```bash
git submodule sync
git submodule update --init
```

---

### `pnpm build:cache` fails with "Cannot find module"

**Cause:** Dependencies aren't installed, or you're running the command from the wrong folder.

Make sure you're in the `site/` folder, not the repo root:
```bash
cd site
pnpm install
pnpm build:cache
```

---

### Site builds fine locally but fails on Vercel

**Cause:** A required environment variable is missing in Vercel.

Compare your `.env.local` (local) against the Vercel environment variables list. Any variable that exists locally but not in Vercel will cause a production-only failure. Add the missing ones and redeploy.
