import { Suspense } from "react"
import PageHeader from "@/components/PageHeader"
import PagePathStatic from "@/components/PagePathStatic"
import DocsClient from "@/components/DocsClient"
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
