import PageHeader from "@/components/PageHeader"
import PagePathStatic from "@/components/PagePathStatic"
import { getMarkdownFilesWithPending } from "@/lib/content"


interface ContextSection {
  id: string
  icon: string
  label: string
  description: string
  dir: string
}

const SECTIONS: ContextSection[] = [
  {
    id: "general",
    icon: "👤",
    label: "General",
    description: "Who Niki is — personal context, background, and life overview.",
    dir: "personal/context/general",
  },
  {
    id: "life-areas",
    icon: "🗺️",
    label: "Life Areas",
    description: "Context for each life domain: health, finances, spirituality, hobbies, routine.",
    dir: "personal/context/life-areas",
  },
]

export default async function PersonalContextPage() {
  const sections = await Promise.all(
    SECTIONS.map(async (section) => {
      const allFiles = (await getMarkdownFilesWithPending(section.dir)).filter(
        (f) => f.slug !== "index" && !f.slug.endsWith("README") && !f.slug.endsWith("template")
      )
      return { ...section, files: allFiles, total: allFiles.length }
    })
  )

  return (
    <div>
      <PagePathStatic path="personal/context" />
      <PageHeader
        icon="🧭"
        title="Personal Context"
        description="Reference documentation about Niki — who she is, her life areas, and her context. Read-only."
      />

      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.id}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">{section.icon}</span>
              <h2 className="text-sm font-semibold text-notion-text">{section.label}</h2>
              <span className="text-xs text-notion-muted">— {section.description}</span>
            </div>

            {section.files.length > 0 ? (
              <div className="bg-notion-surface border border-notion-border rounded-xl overflow-hidden">
                {section.files.map((file, i) => (
                  <div
                    key={file.slug}
                    className={`flex items-center justify-between px-4 py-3 ${
                      i < section.files.length - 1 ? "border-b border-notion-border" : ""
                    }`}
                  >
                    <span className="text-sm text-notion-text truncate">{file.displayTitle}</span>
                    <span className="text-xs text-notion-muted font-mono ml-3 shrink-0">
                      {file.filePath.split("/").slice(-2).join("/")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-notion-surface border border-notion-border rounded-xl px-4 py-6 text-center text-sm text-notion-muted">
                No files found.
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 px-4 py-3 bg-notion-surface border border-notion-border rounded-xl">
        <p className="text-xs text-notion-muted">
          Read-only reference material. Files in <code className="font-mono">personal/context/</code> are manually curated — edit them directly in the repo.
        </p>
      </div>
    </div>
  )
}
