import { notFound } from "next/navigation"
import { getMarkdownFileWithPending, getMarkdownFilesWithPending, getMarkdownFiles } from "@/lib/content"
import PagePathStatic from "@/components/layout/PagePathStatic"
import NoteDetailClient from "./NoteDetailClient"


export const dynamicParams = false

export async function generateStaticParams() {
  const files = getMarkdownFiles("personal/notes")
  return files.map(f => ({ slug: f.slug.split("/") }))
}

interface Props {
  params: { slug: string[] }
}

export default async function NoteDetailPage({ params }: Props) {
  const slugPath = params.slug.join("/").replace(/\.md$/, "")
  const file = await getMarkdownFileWithPending(`personal/notes/${slugPath}.md`)

  if (!file) notFound()

  const allFiles = await getMarkdownFilesWithPending("personal/notes")
  const currentIndex = allFiles.findIndex((f) => f.slug === slugPath || f.slug.endsWith(slugPath))
  const prevFile = currentIndex > 0 ? allFiles[currentIndex - 1] : null
  const nextFile = currentIndex < allFiles.length - 1 ? allFiles[currentIndex + 1] : null

  const bodyWithoutTitle = file.content.replace(/^\s*#+\s+.+\n?/, "")

  return (
    <div className="max-w-2xl mx-auto">
      <PagePathStatic path={`notes/${slugPath}`} />
      <NoteDetailClient
        slugPath={slugPath}
        initialFrontmatter={file.frontmatter}
        initialBody={bodyWithoutTitle}
        displayTitle={file.displayTitle}
        autoTags={file.autoTags}
        prevSlug={prevFile?.slug ?? null}
        nextSlug={nextFile?.slug ?? null}
        prevTitle={prevFile?.displayTitle ?? null}
        nextTitle={nextFile?.displayTitle ?? null}
      />
    </div>
  )
}
