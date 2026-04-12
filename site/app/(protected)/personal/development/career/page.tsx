import Link from "next/link"
import PageHeader from "@/components/layout/PageHeader"
import { getMarkdownFilesWithPending, getMarkdownFile } from "@/lib/content"
import PagePathStatic from "@/components/layout/PagePathStatic"
import EmptyState from "@/components/ui/EmptyState"
import ResumePreview from "./ResumePreview"
import LabelPageContent from "@/components/features/notes/LabelPageContent"

export default async function CareerPage() {
  const allFiles = (await getMarkdownFilesWithPending("personal/docs/career")).filter(
    (f) => !f.slug.endsWith("README") && !f.slug.startsWith("resumes/")
  )

  // Load the master resume
  const resume = getMarkdownFile("personal/docs/career/resumes/master.md")

  const totalCount = allFiles.length
  const shown = allFiles.slice(0, 50)

  return (
    <div>
      <PagePathStatic path="personal/development/career" />
      <PageHeader
        icon="💼"
        title="Career"
        description="Resume, career materials, and professional reference."
      />

      {/* Resume Hero Section */}
      {resume && (
        <div className="mb-10">
          <div className="bg-notion-surface border border-notion-border rounded-xl overflow-hidden">
            {/* Header bar */}
            <div className="px-6 py-5 border-b border-notion-border/60">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-notion-text tracking-tight">
                    {resume.frontmatter.name || "Niki Birkner"}
                  </h2>
                  <p className="text-sm text-notion-muted mt-1">
                    Staff Product Manager at Together AI. Stanford &apos;20.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {resume.frontmatter.location && (
                      <span className="text-xs text-notion-muted flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {resume.frontmatter.location}
                      </span>
                    )}
                    {resume.frontmatter.email && (
                      <span className="text-xs text-notion-muted flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {resume.frontmatter.email}
                      </span>
                    )}
                    {resume.frontmatter.last_updated && (
                      <span className="text-xs text-notion-muted/60">
                        Updated {resume.frontmatter.last_updated}
                      </span>
                    )}
                  </div>
                </div>
                <a
                  href="/resume-latest.pdf"
                  download="Niki-Birkner-Resume.pdf"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-notion-accent text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shrink-0 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </a>
              </div>
            </div>

            {/* Resume content preview */}
            <ResumePreview content={resume.content} />
          </div>
        </div>
      )}

      {/* Career Documents Section */}
      {allFiles.length === 0 ? (
        <EmptyState
          icon="💼"
          message="No career docs saved yet"
          hint="Add career materials to personal/docs/career/"
        />
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-notion-muted uppercase tracking-wider">
              Career Documents
            </h2>
            {totalCount > 50 && (
              <p className="text-xs text-notion-muted">{totalCount} total · showing 50</p>
            )}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {shown.map((f) => (
              <Link
                key={f.slug}
                href={`/personal/development/career/${f.slug}`}
                className="block bg-notion-surface border border-notion-border rounded-lg px-4 py-3 hover:bg-notion-hover hover:border-notion-accent/40 transition-colors"
              >
                <p className="text-sm font-semibold text-notion-text leading-snug">{f.displayTitle}</p>
                {f.frontmatter.date && (
                  <p className="text-xs text-notion-muted mt-0.5">{f.frontmatter.date}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
      <LabelPageContent tagId="career" />
    </div>
  )
}
