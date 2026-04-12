import { getMarkdownFileWithPending, getMarkdownFilesWithPending, getMarkdownFiles } from "@/lib/content"
import PagePathStatic from "@/components/PagePathStatic"
import { notFound } from "next/navigation"
import GoalDetailClient from "./GoalDetailClient"


export const dynamicParams = false

export async function generateStaticParams() {
  const files = getMarkdownFiles("personal/docs/growth")
  return files.map(f => ({ slug: f.slug.split("/") }))
}

interface Props {
  params: { slug: string[] }
}

export default async function GoalDetailPage({ params }: Props) {
  const slugPath = params.slug.join("/").replace(/\.md$/, "")
  const file = await getMarkdownFileWithPending("personal/docs/growth/" + slugPath + ".md")
  if (!file) notFound()

  const allFiles = await getMarkdownFilesWithPending("personal/docs/growth")
  const currentIndex = allFiles.findIndex((f) => f.slug === slugPath || f.slug.endsWith(slugPath))
  const prevFile = currentIndex > 0 ? allFiles[currentIndex - 1] : null
  const nextFile = currentIndex < allFiles.length - 1 ? allFiles[currentIndex + 1] : null

  return (
    <div className="max-w-2xl mx-auto">
      <PagePathStatic path={"goals/" + slugPath} />
      <GoalDetailClient
        slugPath={slugPath}
        initialFrontmatter={file.frontmatter}
        initialBody={file.content}
        displayTitle={file.displayTitle}
        prevSlug={prevFile?.slug ?? null}
        nextSlug={nextFile?.slug ?? null}
        prevTitle={prevFile?.displayTitle ?? null}
        nextTitle={nextFile?.displayTitle ?? null}
      />
    </div>
  )
}
