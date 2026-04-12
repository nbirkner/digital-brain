import { notFound } from "next/navigation"
import { getMarkdownFileWithPending, getMarkdownFiles } from "@/lib/content"
import MarkdownRenderer from "@/components/MarkdownRenderer"
import PagePathStatic from "@/components/PagePathStatic"


interface Props {
  params: { slug: string[] }
}

const FIELD_LABELS: Record<string, string> = {
  make: "Make",
  model: "Model",
  year: "Year",
  license: "License Plate",
  vin: "VIN",
  color: "Color",
  role: "Role",
}

const SKIP_FIELDS = new Set(["title", "notion_id", "source"])

// Static PDFs available for each car slug
const CAR_PDFS: Record<string, { href: string; label: string }[]> = {
  corolla: [
    { href: "/pdfs/cars/auto-insurance-contract.pdf", label: "Auto Insurance Contract" },
    { href: "/pdfs/cars/vsc-contract.pdf", label: "VSC (Vehicle Service Contract)" },
  ],
}

export const dynamicParams = false

export async function generateStaticParams() {
  const files = getMarkdownFiles("personal/site/cars")
  return files.map(f => ({ slug: f.slug.split("/") }))
}

export default async function CarDetailPage({ params }: Props) {
  const slugPath = params.slug.join("/").replace(/\.md$/, "")
  const file = await getMarkdownFileWithPending(`personal/site/cars/${slugPath}.md`)

  if (!file) notFound()

  const metaFields = Object.entries(file.frontmatter).filter(
    ([key]) => !SKIP_FIELDS.has(key)
  )

  const carPdfs = CAR_PDFS[slugPath] ?? []

  return (
    <div className="max-w-2xl mx-auto">
      <PagePathStatic path={`life/cars/${slugPath}`} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-notion-text tracking-tight">
          {file.displayTitle}
        </h1>
      </div>

      {metaFields.length > 0 && (
        <div className="bg-notion-surface border border-notion-border rounded-xl p-5 mb-6">
          <h2 className="text-xs font-semibold text-notion-muted uppercase tracking-wider mb-3">
            Vehicle Info
          </h2>
          <div className="space-y-2">
            {metaFields.map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-notion-muted">
                  {FIELD_LABELS[key] ?? key}
                </span>
                <span className="text-notion-text font-mono">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {carPdfs.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-notion-muted uppercase tracking-wider mb-3">Documents</h2>
          <div className="space-y-2">
            {carPdfs.map((pdf) => (
              <a
                key={pdf.href}
                href={pdf.href}
                download
                className="flex items-center gap-2 bg-notion-surface border border-notion-border rounded-lg px-4 py-3 hover:bg-notion-hover transition-colors"
              >
                <span className="text-notion-muted">📄</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-notion-text">{pdf.label}</p>
                  <p className="text-xs text-notion-muted">PDF · Download</p>
                </div>
                <span className="text-xs text-notion-accent flex-shrink-0">↓</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="bg-notion-surface border border-notion-border rounded-xl p-6">
        <MarkdownRenderer content={file.content} />
      </div>
    </div>
  )
}
