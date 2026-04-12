import { notFound } from "next/navigation"
import { getMarkdownFileWithPending, getMarkdownFiles } from "@/lib/content"
import PagePathStatic from "@/components/layout/PagePathStatic"
import MarkdownRenderer from "@/components/ui/MarkdownRenderer"

type LogSource = "work" | "personal"

const SOURCE_TO_DIR: Record<LogSource, string> = {
  personal: "personal/docs/logs",
  work: "work/docs/logs",
}

export const dynamicParams = false

export async function generateStaticParams() {
  const params: { slug: string[] }[] = []

  for (const [source, dir] of Object.entries(SOURCE_TO_DIR) as [LogSource, string][]) {
    const files = getMarkdownFiles(dir)
    for (const f of files) {
      params.push({ slug: [source, ...f.slug.split("/")] })
    }
  }

  return params
}

interface Props {
  params: { slug: string[] }
}

export default async function LogDetailPage({ params }: Props) {
  const [source, ...rest] = params.slug
  const dir = SOURCE_TO_DIR[source as LogSource]

  if (!dir) notFound()

  const slugPath = rest.join("/").replace(/\.md$/, "")
  const file = await getMarkdownFileWithPending(`${dir}/${slugPath}.md`)

  if (!file) notFound()

  return (
    <div>
      <PagePathStatic path={`logs/${source}/${slugPath}`} />
      <h1 className="text-2xl font-bold text-notion-text tracking-tight mb-6">
        {file.displayTitle}
      </h1>
      <div className="bg-notion-surface border border-notion-border rounded-xl p-6">
        <MarkdownRenderer content={file.content} />
      </div>
    </div>
  )
}
