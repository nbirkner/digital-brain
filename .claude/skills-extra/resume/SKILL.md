---
name: resume
description: "Update and manage Niki's resume. Two modes: (1) '/resume update [change]' for quick edits like 'got promoted to Staff PM' or 'add bullet about ECP launch', (2) '/resume review' for a guided walkthrough of each section. Also '/resume pdf' to generate a PDF from current master. Triggers on: 'update my resume', 'add this to my resume', 'resume review', 'generate resume PDF', 'I need my resume', '/resume'."
---

# /resume - Resume Manager

## File Structure

```
personal/docs/career/resumes/
  master.md          ← canonical source of truth (YAML frontmatter + markdown)
  template.html      ← HTML/CSS template for PDF generation
  logos/              ← company logo assets (SVG/JPEG)
  versions/           ← dated snapshots (YYYY-MM-DD-variant.md)
  pdfs/               ← generated PDFs
```

## Hard Rules

- **One page only.** Never generate a resume PDF that exceeds one page unless Niki explicitly asks.
- **Iterate on markdown first, PDF second.** Edit `master.md`, show the changes, ask "Ready to generate the PDF?" Only produce the PDF after confirmation.
- **Auto-open PDFs.** After generating any PDF, run `open <path>` to open it in Preview.
- **Date every version.** When saving a snapshot, use `YYYY-MM-DD-variant.md` (e.g., `2026-04-08-default.md`).
- **Update frontmatter.** Always update `last_updated` in master.md after any edit.

## Mode 1: `/resume update [change]`

Quick edit. Niki describes what changed in plain English.

1. Read `personal/docs/career/resumes/master.md`.
2. Apply the change. Show a diff summary (what was added/modified/removed).
3. Ask: "Does this look right? Any tweaks before I save?"
4. On approval, write the updated `master.md` and update `last_updated`.
5. Ask: "Want me to generate the PDF now?"
6. If yes, run the PDF generation flow (see below).

## Mode 2: `/resume review`

Guided walkthrough. Walk through each section and suggest improvements.

1. Read `personal/docs/career/resumes/master.md`.
2. For each section (Experience by company, Education, Leadership):
   - Show current content.
   - Suggest specific improvements: stronger verbs, sharper metrics, tighter phrasing, missing wins.
   - Ask for approval or edits before moving to the next section.
3. After all sections reviewed, save updated `master.md`.
4. Save a dated version to `versions/YYYY-MM-DD-variant.md`.
5. Ask: "Ready to generate the PDF?"

## Mode 3: `/resume pdf`

Generate PDF from current master without editing.

1. Read `master.md` and `template.html`.
2. Build the HTML by injecting master.md content into the template structure.
3. Generate PDF and open it.

## PDF Generation Flow

Read `personal/docs/career/resumes/template.html` as the base. The template uses:
- **Fonts:** Cormorant Garamond (headings) + Source Sans 3 (body) via Google Fonts CDN
- **Logos:** Base64-encoded in the HTML. Source files in `logos/` directory.
- **Layout:** Single column, logos in left margin (absolute positioned), 28px content indent.

To generate:

1. Read `template.html` and `master.md`.
2. Build the full HTML by updating the template with current master.md content. Preserve the exact CSS, logo base64 URIs, and layout structure from the template.
3. Write HTML to `_temp/resume-build.html`.
4. Run Playwright to generate PDF:

```python
from playwright.sync_api import sync_playwright
import os

html_path = os.path.abspath("_temp/resume-build.html")
pdf_path = os.path.abspath("personal/docs/career/resumes/pdfs/YYYY-MM-DD-variant.pdf")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto(f"file://{html_path}", wait_until="networkidle")
    height = page.evaluate("document.body.scrollHeight")
    # One-page check: height must be <731px for letter with current margins
    if height > 731:
        print(f"WARNING: {height}px exceeds one-page limit (731px). Tighten spacing.")
    page.pdf(path=pdf_path, format="Letter", print_background=True)
    browser.close()
```

5. Copy the PDF to `site/public/resume-latest.pdf` for the site download link.
6. Run `open <pdf_path>` to open in Preview.

## Variations

When Niki asks for a role-targeted version (e.g., "make a founder-track version"):

1. Copy `master.md` to `versions/YYYY-MM-DD-[variant-name].md`.
2. Adjust emphasis, bullet order, or framing for the target audience.
3. Generate PDF with variant name: `pdfs/YYYY-MM-DD-[variant-name].pdf`.

Variant names: `default`, `founder`, `technical-pm`, `growth`, `platform`, `infra`.

## Content Quality Checklist (for review mode)

- Every bullet starts with a strong verb (Led, Built, Launched, Directed, Saved, Drove, Shipped, Delivered).
- Metrics are specific: dollar amounts, percentages, user counts, team sizes.
- No em dashes. Use commas, semicolons, or periods.
- No "leverage," "utilize," "streamline," "robust," "cutting-edge."
- Together AI section reflects current title (Staff PM) and latest shipped work.
- One page. Always.
