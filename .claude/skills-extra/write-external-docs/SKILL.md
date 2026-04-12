---
name: write-external-docs
description: Use when writing external-facing documentation for Together.ai — API references, quickstarts, tutorials, integration guides, or conceptual docs. Trigger phrases: "write docs for", "create external docs for", "document the new API", "I need a quickstart guide for", "write a tutorial for".
---

# Write External-Facing Documentation

Create world-class external documentation for Together.ai, inspired by the best in the industry (Stripe, Twilio, Plaid, OpenAI, Anthropic).

## When to Use

Trigger this skill when the user wants to:
- Document a new API endpoint or feature
- Create a quickstart guide
- Write a tutorial
- Build integration documentation
- Update existing documentation

**Triggers:**
- "write docs for [feature]"
- "create external facing docs for [API]"
- "document the new [endpoint]"
- "build a quickstart for [use case]"

## Workflow

Follow these steps in order.

### Step 1: Understand What to Document

The user will provide one of:
1. **Direct description**: "Document the new batch API endpoint"
2. **Internal doc reference**: "Base it on this PRD: [link or file]"
3. **Resources to review**: "Check out these links: [urls]"

**Ask clarifying questions:**
- What type of doc is this? (API reference / Quickstart / Tutorial / Conceptual guide / Integration guide)
- Who's the audience? (Beginners / Experienced developers / ML engineers)
- What's the goal? (Get started in 5 minutes / Deep dive / Specific use case)
- Any specific examples or code you want included?

### Step 2: Gather Context

**Check these sources in order:**

1. **Together.ai's existing docs** (work/repos/mintlify-docs if available, or docs.together.ai)
   - Understand current structure and organization
   - Extract voice, tone, and style patterns
   - Find similar doc pages to use as templates
   - Note Mintlify features used (tabs, callouts, cards, code blocks)

2. **Internal context** (work/context/)
   - Check PRDs for feature details
   - Check strategy docs for positioning
   - Check research for user pain points

3. **User-provided resources**
   - Review any links, specs, or docs the user shared
   - Extract technical details, code examples, use cases

4. **Great doc examples** (for inspiration)
   - Stripe (API design, interactive examples)
   - Twilio (quickstarts, copy-paste samples)
   - OpenAI (cookbook style, prompt guidance)
   - Anthropic (clear guides, prompt engineering)
   - Vercel (clean design, concise)

**Output a brief context summary:**
```
## Context Gathered

**Doc Type:** API Reference for Batch Inference endpoint
**Audience:** ML engineers familiar with APIs
**Goal:** Enable batch processing for cost savings

**From Together docs:**
- Voice: Direct, technical, example-driven
- Style: Code-first, with prose explaining why
- Structure: Overview → Quickstart → API Reference → Advanced

**From PRD:**
- New endpoint: POST /v1/batch
- Key benefit: 50% cost reduction
- Use case: Processing large datasets overnight

**Similar docs to reference:**
- /docs/inference-rest (similar structure)
- /docs/fine-tuning-guide (similar code examples)
```

### Step 3: Draft the Documentation

**Structure based on doc type:**

**API Reference:**
```markdown
# [API Name]

[One-line description of what it does and why it matters]

## Overview

[2-3 paragraphs explaining the feature, use cases, and benefits]

## Quick Start

[Minimal code example to get started in <5 minutes]

### Prerequisites
- [What you need before starting]

### Step 1: [First step]
```python
# Code example with comments
```

### Step 2: [Second step]
```typescript
// Alternative language example
```

## API Reference

### Endpoint
`POST /v1/[endpoint]`

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `param1` | string | Yes | [Clear description] |

### Response

```json
{
  "field": "value"
}
```

## Advanced Usage

### [Advanced Feature 1]
[Explanation + code example]

## Best Practices

- [Tip 1]
- [Tip 2]

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `error_code` | [Why it happens] | [How to fix] |

## Next Steps

- [Related doc 1]
- [Related doc 2]
```

**Quickstart Guide:**
```markdown
# Quickstart: [Use Case]

[One sentence: What you'll build and why it's useful]

## What You'll Learn

- [Outcome 1]
- [Outcome 2]

## Prerequisites

- [Requirement 1]
- [Requirement 2]

## Step 1: [Setup]

[Brief explanation]

```bash
# Installation or setup command
```

## Step 2: [First Task]

[Explanation with code]

```python
# Working code example
```

## Step 3: [Next Task]

[Continue building...]

## Full Code

<details>
<summary>Complete example</summary>

```python
# Full working code users can copy-paste
```

</details>

## Next Steps

- [Go deeper with Tutorial]
- [Explore Advanced Features]
```

**Tutorial (Building Something Real):**
```markdown
# Tutorial: Build [Real Thing]

[What you'll build, what you'll learn, and why it's useful]

## What We're Building

[Screenshot or diagram of final result]

- Feature 1
- Feature 2

**Time:** ~15 minutes

## Step 1: [Foundation]

[Why this step matters]

```python
# Code with inline comments
```

**What's happening:** [Plain English explanation]

## Step 2: [Build on It]

[Next piece]

## Final Result

[Working demo or code]

## What You Learned

- [Concept 1]
- [Concept 2]

## Go Further

- [Extension idea 1]
- [Extension idea 2]
```

**Conceptual Guide (The "Why"):**
```markdown
# Understanding [Concept]

[One-line: What this is and why it matters]

## The Problem

[What problem does this solve? Real-world scenario]

## How It Works

[High-level explanation, maybe with diagram]

## When to Use It

**Use [Feature] when:**
- [Scenario 1]
- [Scenario 2]

**Don't use it when:**
- [Anti-pattern 1]

## Example

[Concrete example showing the concept in action]

## Trade-offs

| Approach | Pros | Cons |
|----------|------|------|
| [Option A] | [Benefits] | [Drawbacks] |

## Learn More

- [Hands-on tutorial]
- [API reference]
```

**Writing Style Guidelines (Together.ai voice):**

Based on analysis of docs.together.ai:

- **Direct and technical** - Assume developer audience
- **Code-first** - Show working examples immediately
- **Explain the "why"** - Don't just show "how", explain value
- **Use tabs** for multiple language examples (Python, TypeScript, cURL)
- **Use callouts** for important notes, tips, warnings
- **Short paragraphs** - 2-3 sentences max
- **Active voice** - "You can", not "One can"
- **Concrete examples** - Real use cases, not abstract
- **Copy-pasteable code** - All examples should run as-is

**Mintlify-specific features to use:**

```markdown
<Note>
Important information users should know
</Note>

<Warning>
Critical warning about common mistakes
</Warning>

<Tip>
Pro tip for advanced usage
</Tip>

<CodeGroup>
```python
# Python example
```

```typescript
// TypeScript example
```

```bash
# cURL example
```
</CodeGroup>

<Card title="Related Guide" icon="book" href="/docs/other-guide">
Check out this related documentation
</Card>
```

### Step 4: Show Preview & Review

After drafting, show the user:

```
## Documentation Preview

I've drafted [doc type] for [feature]. Here's what I created:

**Structure:**
- Overview (explains what and why)
- Quick Start (working code in <5 min)
- API Reference (full parameter details)
- Advanced Usage (power user features)
- Best Practices (tips from experience)

**Code examples:**
- Python ✓
- TypeScript ✓
- cURL ✓

**Mintlify features used:**
- Tabs for code examples
- Note callouts for prerequisites
- Warning for common errors

---

[Show full doc content here]

---

## Review Questions

1. **Accuracy:** Is the technical information correct?
2. **Completeness:** Missing any important details or examples?
3. **Clarity:** Anything confusing or need more explanation?
4. **Code examples:** Do they cover the main use cases?

**Ready to publish?**
- Say "go" to create a PR in mintlify-docs
- Or tell me what to change
```

### Step 5: Push to mintlify-docs Repo

When user approves (says "go", "ship it", "looks good", etc.):

**Check repo setup:**
```bash
# Check if mintlify-docs repo exists in work/repos/
ls work/repos/mintlify-docs 2>/dev/null || echo "Repo not found"
```

**If repo doesn't exist:**
```
I don't see work/repos/mintlify-docs in your workspace.

To set up:
1. Clone the repo: `git clone [mintlify-docs-url] work/repos/mintlify-docs`
2. Or tell me the repo location and I'll set it up

Once set up, I can push directly.
```

**If repo exists:**

1. **Create a new branch**
```bash
cd work/repos/mintlify-docs
git checkout -b docs/[feature-name]
```

2. **Determine file path**

Based on doc type and Together's structure:
- API docs → `/docs/api/[endpoint].mdx`
- Quickstarts → `/docs/quickstart/[name].mdx`
- Tutorials → `/docs/tutorials/[name].mdx`
- Guides → `/docs/guides/[name].mdx`

3. **Write the file**
```bash
# Create the .mdx file with the documentation content
```

4. **Commit and push**
```bash
git add [file]
git commit -m "docs: add [doc type] for [feature]

- Added [doc type] documentation
- Includes code examples in Python, TypeScript, cURL
- Covers [key sections]

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git push -u origin docs/[feature-name]
```

5. **Create PR (if gh CLI available)**
```bash
gh pr create --title "Add [doc type] for [feature]" --body "$(cat <<'EOF'
## Summary
New documentation for [feature]

## Changes
- Added [file path]
- [Doc type]: [brief description]

## Preview
[Key highlights or screenshot]

## Checklist
- [ ] Code examples tested
- [ ] Links verified
- [ ] Mintlify syntax validated

🤖 Generated with Claude Code
EOF
)"
```

6. **Report to user**
```
✅ Documentation published!

**Branch:** docs/[feature-name]
**File:** /docs/[path]/[filename].mdx
**PR:** [PR URL from gh]

**Next steps:**
1. Review the PR in GitHub
2. Preview on Mintlify (if auto-deploy enabled)
3. Request review from team
4. Merge when ready

Want me to make any changes? I can update the branch.
```

## Best Practices

### Learn from the Best

When drafting, reference these patterns:

**Stripe-style (API Reference):**
- Sidebar with "Try it live" interactive examples
- Clear parameter tables
- Multiple language tabs
- Error handling section

**Twilio-style (Quickstart):**
- "5-minute quickstart" promise
- Copy-paste code that just works
- Clear prerequisites
- Build something real (send SMS, make call)

**OpenAI-style (Guides):**
- Cookbook format (practical recipes)
- Prompt engineering tips
- Clear use case scenarios
- Playground integration mentions

**Anthropic-style (Conceptual):**
- Explain the "why" first
- Clear examples of good vs bad
- Prompt engineering best practices
- Safety and responsible use

**Vercel-style (Structure):**
- Clean, scannable headers
- Progressive disclosure (basic → advanced)
- Visual examples where helpful
- Concise prose

### Code Example Quality

**Every code example should:**
- Run as-is (no placeholders like `YOUR_API_KEY` without setup instructions)
- Include error handling (at least basic)
- Have inline comments explaining key parts
- Show output/response
- Be in 2-3 languages (Python + TypeScript + cURL minimum)

**Bad example:**
```python
client.chat(model="meta-llama/Llama-3-70b-chat-hf", messages=[{"role": "user", "content": "Hello"}])
```

**Good example:**
```python
from together import Together

# Initialize client with API key
client = Together(api_key="YOUR_API_KEY")  # Get key at api.together.ai

# Send a chat completion request
response = client.chat.completions.create(
    model="meta-llama/Llama-3-70b-chat-hf",
    messages=[
        {"role": "user", "content": "Explain quantum computing"}
    ],
    max_tokens=512
)

print(response.choices[0].message.content)
# Output: "Quantum computing is a type of computing that uses..."
```

### Documentation Checklist

Before showing preview, verify:

- [ ] **Clear value prop** - First paragraph explains what and why
- [ ] **Quick win** - User can get something working in <5 min
- [ ] **Code examples** - At least 2 languages, preferably 3
- [ ] **Error handling** - Common errors documented
- [ ] **Next steps** - Links to related docs or deeper dives
- [ ] **Mintlify syntax** - Proper use of tabs, callouts, code groups
- [ ] **Voice consistency** - Matches Together.ai tone
- [ ] **No broken links** - All internal links valid
- [ ] **Copy-pasteable** - Code works without modification

## Common Patterns

### Multi-Language Code Examples

Always use Mintlify CodeGroup:

```markdown
<CodeGroup>

```python Python
from together import Together

client = Together(api_key=os.environ.get("TOGETHER_API_KEY"))
response = client.chat.completions.create(...)
```

```typescript TypeScript
import Together from "together-ai";

const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });
const response = await together.chat.completions.create(...);
```

```bash cURL
curl https://api.together.xyz/v1/chat/completions \
  -H "Authorization: Bearer $TOGETHER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

</CodeGroup>
```

### Prerequisites Section

Always include if needed:

```markdown
## Prerequisites

Before you begin, make sure you have:

- A Together AI account ([sign up here](https://api.together.ai))
- API key ([get it here](https://api.together.ai/settings/api-keys))
- Python 3.8+ or Node.js 16+ installed
```

### Next Steps Section

Always end with:

```markdown
## Next Steps

Now that you've [completed this], you can:

- [Related guide 1] - [What it enables]
- [Related guide 2] - [What it enables]
- [API reference] - [Deep dive]

**Need help?** Join our [Discord community](https://discord.gg/together) or check [troubleshooting guide].
```

## Error Handling

**If work/repos/mintlify-docs not found:**
- Ask user for repo URL or location
- Offer to clone it for them
- Fall back to showing the doc content for manual copy-paste

**If PR creation fails:**
- Still push the branch
- Provide manual PR creation link
- Show the doc content as backup

**If unsure about structure:**
- Check existing similar docs in mintlify-docs
- Ask user which existing doc to use as template
- Default to API reference structure

## Examples

### Example 1: API Endpoint Documentation

**User:** "Document the new batch inference endpoint"

**Process:**
1. Gather context from PRD, API spec, existing /docs/inference-rest
2. Analyze Together voice from docs.together.ai
3. Draft API reference with quickstart, full reference, examples
4. Show preview
5. User approves
6. Push to work/repos/mintlify-docs/docs/api/batch-inference.mdx
7. Create PR

### Example 2: Quickstart Guide

**User:** "Create a quickstart for RAG with Together"

**Process:**
1. Check existing quickstarts structure
2. Draft 5-minute "Build a RAG chatbot" tutorial
3. Include embeddings + chat completion + vector search
4. Show working code users can copy-paste
5. Preview → Approve → Push to docs/quickstart/rag.mdx

### Example 3: Tutorial

**User:** "Write a tutorial for fine-tuning Llama"

**Process:**
1. Review fine-tuning API docs, PRDs
2. Draft step-by-step tutorial building a real model
3. Include dataset prep, training, inference
4. Show before/after comparison
5. Push to docs/tutorials/fine-tuning-llama.mdx

---

## Summary

This skill transforms internal knowledge into world-class external documentation by:
1. **Understanding** what to document through conversation
2. **Gathering** context from repos, docs, and resources
3. **Analyzing** Together.ai's voice and structure
4. **Drafting** in Mintlify format with great examples
5. **Reviewing** with user before publishing
6. **Shipping** directly to mintlify-docs repo

The result: Documentation that developers love, inspired by the best (Stripe, Twilio, OpenAI), and perfectly matches Together.ai's voice.
