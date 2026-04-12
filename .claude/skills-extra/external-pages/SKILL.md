# External Pages Skill

Use when creating, updating, or removing public-facing pages at `/external/[slug]` on niklaude.com.

---

## Two Page Types

### 1. Dedicated page (`type: "dedicated"`)
A standalone public page with no private counterpart. Has its own Next.js page file.
- Use when: building a new public-only page from scratch (about, philosophy, niklaude, etc.)
- Route: `/external/[slug]`
- Page file: `site/app/external/[slug]/page.tsx`

### 2. Published private page (`type: "published"`)
A private repo markdown file made publicly accessible.
- Use when: Niki wants to share an existing private page (e.g. resume, trip recap)
- Route: `/external/[slug]`
- No separate page file needed — rendered automatically by `site/app/external/[slug]/page.tsx`
- `contentPath`: repo-relative path to the markdown file
- `internalPath`: the internal site path (e.g. `/life/travel/sisters-trip-sedona`)

---

## Step-by-Step: Creating a Dedicated Page

### Step 1: Register in `site/data/external-published.ts`

Add to the `EXTERNAL_PAGES` array:
```typescript
{
  type: "dedicated",
  slug: "your-slug",          // URL: /external/your-slug
  icon: "🔢",                 // Single emoji
  label: "Short Title",       // Display name, 2-4 words
  description: "One sentence describing what this page is.",
  createdAt: "2026-04-09",    // ISO date — used for sort order in hub (newest first)
},
```

### Step 2: Create the page file

Create `site/app/external/[slug]/page.tsx`. Canonical format:

```tsx
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Page Title — Niki Birkner",
  description: "One sentence description for SEO.",
}

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`mb-14 ${className}`}>{children}</section>
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-notion-muted/50 mb-5">
      {children}
    </h2>
  )
}

export default function YourPage() {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero */}
      <Section>
        <div className="mb-6">
          <div className="w-12 h-12 rounded-xl bg-notion-accent/10 border border-notion-accent/20 flex items-center justify-center mb-5">
            <span className="text-xl">🔢</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-notion-text tracking-tight mb-3 font-display">
            Page Title
          </h1>
          <p className="text-lg text-notion-muted leading-relaxed">
            One or two sentence summary.
          </p>
        </div>
      </Section>

      {/* Content sections */}
      <Section>
        <SectionLabel>Section Name</SectionLabel>
        {/* content */}
      </Section>
    </div>
  )
}
```

Every page must have a `metadata` export with `title` and `description`.

### Step 3: Commit and push

```
git add site/data/external-published.ts site/app/external/[slug]/page.tsx
git commit -m "feat: add [slug] external page"
git push
```

Vercel auto-deploys on push. Page is live at `https://niklaude.com/external/[slug]` within ~2 minutes.

---

## Step-by-Step: Publishing a Private Page

### Step 1: Register in `site/data/external-published.ts`

```typescript
{
  type: "published",
  slug: "your-slug",
  icon: "📄",
  label: "Short Title",
  description: "One sentence description.",
  createdAt: "2026-04-09",                          // ISO date — used for sort order in hub
  contentPath: "personal/docs/path/to/file.md",   // repo-relative
  internalPath: "/life/section/page-slug",          // internal site path
  sourceLabel: "section-name",                      // optional
},
```

### Step 2: Commit and push — no page file needed.

---

## Step-by-Step: Unpublishing a Page

Remove the entry from `EXTERNAL_PAGES` in `site/data/external-published.ts`. For dedicated pages, also delete `site/app/external/[slug]/page.tsx`. Commit and push.

---

## Design System Reference

All external pages use the same Tailwind design tokens:

| Token | Usage |
|-------|-------|
| `text-notion-text` | Primary text |
| `text-notion-muted` | Secondary/body text |
| `text-notion-accent` | Accent color (purple/blue) |
| `bg-notion-surface` | Card backgrounds |
| `border-notion-border` | Card borders |
| `bg-notion-accent/10` | Icon backgrounds |
| `border-notion-accent/20` | Icon borders |
| `font-display` | Display/heading font |

Common reusable patterns from `site/app/external/niklaude/page.tsx`:
- `StatGrid` — 2×2 or 4-col grid of number + label stats
- `AccentBlock` — left-border accent callout
- `WowCard` — numbered card with title + body
- Section cards: `flex gap-4 p-4 rounded-xl bg-notion-surface border border-notion-border`

---

## Checklist

Before pushing:
- [ ] Entry added to `EXTERNAL_PAGES` with correct `type`, `slug`, `icon`, `label`, `description`
- [ ] Page file has `metadata` export (title + description)
- [ ] Hero section has emoji icon in `w-12 h-12 rounded-xl` container
- [ ] All sections use `SectionLabel` for headings
- [ ] `max-w-2xl mx-auto` wrapper on root div

---

## Files to Know

- `site/data/external-published.ts` — registry of all external pages
- `site/app/external/` — page files directory
- `site/app/external/[slug]/page.tsx` — dynamic route that renders published private pages
