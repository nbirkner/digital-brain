import Image from "next/image"
import { notFound } from "next/navigation"
import { getMarkdownFileWithPending, getMarkdownFiles } from "@/lib/content"
import MarkdownRenderer from "@/components/MarkdownRenderer"
import PagePathStatic from "@/components/PagePathStatic"


export const dynamicParams = false

export async function generateStaticParams() {
  const files = getMarkdownFiles("personal/docs/library/certifications")
  return files.map(f => ({ slug: f.slug.split("/") }))
}

interface Props {
  params: { slug: string[] }
}

const FRONTMATTER_LABELS: Record<string, string> = {
  title: "Title",
  status: "Status",
  date: "Date",
  notion_id: "Notion ID",
  source: "Source",
}

// Images associated with each certification slug
const CERT_IMAGES: Record<string, { src: string; alt: string }> = {
  "reiki-level-1": {
    src: "/images/certifications/reiki-level-1-cert.jpg",
    alt: "Reiki Level 1 Certificate",
  },
  "palouse-mbsr": {
    src: "/images/certifications/palouse-mbsr-cert.jpg",
    alt: "Palouse MBSR Certificate",
  },
}

// PDF download links for certifications that have static files
const CERT_PDFS: Record<string, { href: string; label: string }> = {
  "reiki-level-1": {
    href: "/pdfs/certifications/reiki-level-1-certificate.pdf",
    label: "Reiki Level 1 Certificate",
  },
  "cpr-training": {
    href: "/pdfs/certifications/cpr-certificate.pdf",
    label: "CPR Certificate",
  },
}

export default async function CertificationDetailPage({ params }: Props) {
  const slugPath = params.slug.join("/").replace(/\.md$/, "")
  const file = await getMarkdownFileWithPending(
    `personal/docs/library/certifications/${slugPath}.md`
  )

  if (!file) notFound()

  const { frontmatter, content, displayTitle } = file

  const metaFields = Object.entries(frontmatter).filter(
    ([key, val]) => key !== "title" && key !== "icon" && val
  )

  const certImage = CERT_IMAGES[slugPath]
  const certPdf = CERT_PDFS[slugPath]

  return (
    <div className="max-w-2xl mx-auto">
      <PagePathStatic path={`niki/certifications/${slugPath}`} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-notion-text tracking-tight">
          {displayTitle}
        </h1>
      </div>

      {metaFields.length > 0 && (
        <div className="bg-notion-surface border border-notion-border rounded-xl p-4 mb-6">
          <table className="w-full text-xs">
            <tbody>
              {metaFields.map(([key, val]) => (
                <tr key={key} className="border-b border-notion-border last:border-0">
                  <td className="py-1.5 pr-4 text-notion-muted font-medium w-1/3">
                    {FRONTMATTER_LABELS[key] ?? key}
                  </td>
                  <td className="py-1.5 text-notion-text break-all">
                    {key === "source" ? (
                      <a
                        href={val}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-notion-accent hover:underline"
                      >
                        Open in Notion
                      </a>
                    ) : (
                      val
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {certPdf && (
        <div className="mb-6">
          <a
            href={certPdf.href}
            download
            className="flex items-center gap-2 bg-notion-surface border border-notion-border rounded-lg px-4 py-3 hover:bg-notion-hover transition-colors"
          >
            <span className="text-notion-muted">📄</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-notion-text">{certPdf.label}</p>
              <p className="text-xs text-notion-muted">PDF · Download</p>
            </div>
            <span className="text-xs text-notion-accent flex-shrink-0">↓</span>
          </a>
        </div>
      )}

      {certImage && (
        <div className="mb-6 bg-notion-surface border border-notion-border rounded-xl overflow-hidden">
          <Image
            src={certImage.src}
            alt={certImage.alt}
            width={800}
            height={600}
            className="w-full h-auto object-contain"
            unoptimized
          />
        </div>
      )}

      {content.trim() && (
        <div className="bg-notion-surface border border-notion-border rounded-xl p-6">
          <MarkdownRenderer content={content} />
        </div>
      )}
    </div>
  )
}
