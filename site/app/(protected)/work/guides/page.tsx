import { Suspense } from "react"
import PageHeader from "@/components/layout/PageHeader"
import PagePathStatic from "@/components/layout/PagePathStatic"
import DocsClient from "@/components/features/content/DocsClient"
import { getAllDocsMeta } from "@/lib/docs"

export default async function WorkGuidesPage() {
  const docs = getAllDocsMeta()
  const guideCount = docs.filter(d => d.domain === "work" && d.docType === "Guide").length

  return (
    <div>
      <PagePathStatic path="work/guides" />
      <PageHeader
        icon="📘"
        title="Guides"
        description={`${guideCount} guide${guideCount !== 1 ? "s" : ""}.`}
      />
      <Suspense fallback={null}>
        <DocsClient docs={docs} defaultDomain="work" />
      </Suspense>
    </div>
  )
}
