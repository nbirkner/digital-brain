import { Suspense } from "react"
import PageHeader from "@/components/layout/PageHeader"
import PagePathStatic from "@/components/layout/PagePathStatic"
import DocsClient from "@/components/features/content/DocsClient"
import { getAllDocsMeta } from "@/lib/docs"

export default async function DocsPage() {
  const docs = getAllDocsMeta()

  return (
    <div>
      <PagePathStatic path="docs" />
      <PageHeader
        icon="📄"
        title="Docs"
        description="All output documents from work and personal — PRDs, decisions, analyses, comms, and more."
      />
      <Suspense fallback={null}>
        <DocsClient docs={docs} />
      </Suspense>
    </div>
  )
}
