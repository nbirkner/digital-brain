---
name: pdf
description: Comprehensive PDF toolkit — create beautifully formatted PDFs from HTML/CSS using Playwright (preferred for documents), plus manipulation utilities (merge, split, extract text/tables) using pypdf and pdfplumber.
---

# PDF Skill

## Two Approaches

| Use case | Tool |
|----------|------|
| **Create a formatted document PDF** | HTML + CSS → Playwright (preferred) |
| **Manipulate existing PDFs** (merge, split, extract, forms) | pypdf / pdfplumber / reportlab |

---

## Creating Beautiful PDFs (Playwright — Preferred)

Use this for itineraries, reports, summaries, any doc where design matters.

### Step 1: Write HTML with inline CSS

- Use `Georgia` or `Helvetica` as primary fonts (system fonts — reliable in headless Chromium)
- Avoid Google Fonts CDN (`@import url(...)`) — they may not load in `file://` context
- Use `print_background=True` in Playwright so background colors render
- Keep all styles inline or in a `<style>` block — no external CSS files

### Step 2: Generate with Playwright

```python
from playwright.sync_api import sync_playwright
import os

html_path = os.path.abspath("output.html")
pdf_path = os.path.abspath("output.pdf")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto(f"file://{html_path}", wait_until="networkidle")
    page.pdf(
        path=pdf_path,
        format="Letter",          # or "A4"
        margin={"top": "0.6in", "bottom": "0.6in", "left": "0.6in", "right": "0.6in"},
        print_background=True,
    )
    browser.close()

print(f"PDF saved: {pdf_path}")
```

### Install (if needed)
```bash
pip install playwright
python -m playwright install chromium
```

---

## Manipulating Existing PDFs (pypdf / pdfplumber)

### Merge PDFs
```python
from pypdf import PdfWriter, PdfReader

writer = PdfWriter()
for pdf_file in ["doc1.pdf", "doc2.pdf"]:
    for page in PdfReader(pdf_file).pages:
        writer.add_page(page)
with open("merged.pdf", "wb") as f:
    writer.write(f)
```

### Split PDF
```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("input.pdf")
for i, page in enumerate(reader.pages):
    writer = PdfWriter()
    writer.add_page(page)
    with open(f"page_{i+1}.pdf", "wb") as f:
        writer.write(f)
```

### Extract Text
```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        print(page.extract_text())
```

### Extract Tables
```python
import pdfplumber
import pandas as pd

with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        for table in page.extract_tables():
            df = pd.DataFrame(table[1:], columns=table[0])
            print(df)
```

### Extract Metadata
```python
from pypdf import PdfReader
meta = PdfReader("document.pdf").metadata
print(meta.title, meta.author)
```

### Password Protect
```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("input.pdf")
writer = PdfWriter()
for page in reader.pages:
    writer.add_page(page)
writer.encrypt("password")
with open("protected.pdf", "wb") as f:
    writer.write(f)
```

### Install (if needed)
```bash
pip install pypdf pdfplumber
```

---

## Quick Reference

| Task | Tool |
|------|------|
| Create formatted doc | Playwright (HTML→PDF) |
| Merge / split | pypdf |
| Extract text / tables | pdfplumber |
| Protect / encrypt | pypdf |
| Fill PDF forms | pypdf or pdf-lib (JS) |
| OCR scanned PDF | pytesseract + pdf2image |

---

## Font Guidance for HTML→PDF

Reliable system fonts for headless Chromium on macOS:
- **Serif:** Georgia, Times New Roman
- **Sans-serif:** Helvetica, Arial, -apple-system
- **Monospace:** Courier New, monospace

If you want Google Fonts, serve the HTML via a local HTTP server instead of `file://`:
```python
import http.server, threading, os

os.chdir(os.path.dirname(html_path))
server = http.server.HTTPServer(("localhost", 8765), http.server.SimpleHTTPRequestHandler)
thread = threading.Thread(target=server.serve_forever)
thread.daemon = True
thread.start()

page.goto("http://localhost:8765/output.html", wait_until="networkidle")
# ... generate PDF ...
server.shutdown()
```
