import { Suspense } from "react"
import PageHeader from "@/components/PageHeader"
import PagePathStatic from "@/components/PagePathStatic"
import DocsClient from "@/components/DocsClient"
import { getAllDocsMeta } from "@/lib/docs"
import LabelPageContent from "@/components/LabelPageContent"

export default async function WorkPrdsPage() {
  const docs = getAllDocsMeta()
  const prdCount = docs.filter(d => d.domain === "work" && d.docType === "PRD").length

  return (
    <div>
      <PagePathStatic path="work/prds" />
      <PageHeader
        icon="📋"
        title="PRDs"
        description={`${prdCount} product spec${prdCount !== 1 ? "s" : ""}.`}
      />
      <Suspense fallback={null}>
        <DocsClient docs={docs} defaultDomain="work" />
      </Suspense>
      <LabelPageContent tagId="prd" />
    </div>
  )
}
