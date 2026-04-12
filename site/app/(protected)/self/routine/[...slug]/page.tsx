import { notFound } from "next/navigation"
import { getMarkdownFileWithPending, getMarkdownFiles } from "@/lib/content"
import MarkdownRenderer from "@/components/MarkdownRenderer"
import PagePathStatic from "@/components/PagePathStatic"


export const dynamicParams = false

export async function generateStaticParams() {
  const files = getMarkdownFiles("personal/docs/routine")
  return files.map(f => ({ slug: f.slug.split("/") }))
}

interface Props {
  params: { slug: string[] }
}

export default async function RoutineDetailPage({ params }: Props) {
  const slugPath = params.slug.join("/").replace(/\.md$/, "")
  const file = await getMarkdownFileWithPending(`personal/docs/routine/${slugPath}.md`)

  if (!file) notFound()

  const metaFields = Object.entries(file.frontmatter).filter(
    ([key]) => !["title"].includes(key)
  )

  return (
    <div className="max-w-2xl mx-auto">
      <PagePathStatic path={`niki/routine/${slugPath}`} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-notion-text tracking-tight">
          {file.frontmatter.icon && <span className="mr-2">{file.frontmatter.icon}</span>}
          {file.displayTitle}
        </h1>
        {file.frontmatter.last_edited && (
          <p className="text-xs text-notion-muted mt-1 font-mono">
            Last edited: {file.frontmatter.last_edited}
          </p>
        )}
      </div>

      {metaFields.length > 0 && (
        <div className="bg-notion-surface border border-notion-border rounded-xl overflow-hidden mb-6">
          <table className="w-full text-sm">
            <tbody>
              {metaFields.map(([key, value], i) => (
                <tr
                  key={key}
                  className={i < metaFields.length - 1 ? "border-b border-notion-border" : ""}
                >
                  <td className="px-4 py-2.5 text-notion-muted font-medium capitalize w-32 shrink-0">
                    {key.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-2.5 text-notion-text">
                    {key === "source" ? (
                      <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-notion-accent transition-colors font-mono text-xs"
                      >
                        {value}
                      </a>
                    ) : (
                      value
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-notion-surface border border-notion-border rounded-xl p-6">
        <MarkdownRenderer content={file.content} />
      </div>
    </div>
  )
}
