import { Suspense } from "react"
import PageHeader from "@/components/PageHeader"
import PagePathStatic from "@/components/PagePathStatic"
import DocsClient from "@/components/DocsClient"
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
