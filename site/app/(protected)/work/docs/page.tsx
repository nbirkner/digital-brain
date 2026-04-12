import { Suspense } from "react"
import PageHeader from "@/components/layout/PageHeader"
import PagePathStatic from "@/components/layout/PagePathStatic"
import DocsClient from "@/components/features/content/DocsClient"
import { getAllDocsMeta } from "@/lib/docs"

export default async function WorkDocsPage() {
  const docs = getAllDocsMeta()

  return (
    <div>
      <PagePathStatic path="work/docs" />
      <PageHeader
        icon="📄"
        title="Docs"
        description={`${docs.filter(d => d.domain === "work").length} work documents.`}
      />
      <Suspense fallback={null}>
        <DocsClient docs={docs} defaultDomain="work" groupBy="label" />
      </Suspense>
    </div>
  )
}
