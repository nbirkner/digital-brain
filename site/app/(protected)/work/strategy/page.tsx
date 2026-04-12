import { Suspense } from "react"
import PageHeader from "@/components/layout/PageHeader"
import PagePathStatic from "@/components/layout/PagePathStatic"
import DocsClient from "@/components/features/content/DocsClient"
import { getAllDocsMeta } from "@/lib/docs"
import LabelPageContent from "@/components/features/notes/LabelPageContent"

export default async function WorkStrategyPage() {
  const docs = getAllDocsMeta()
  const strategyCount = docs.filter(d => d.domain === "work" && d.docType === "Strategy").length

  return (
    <div>
      <PagePathStatic path="work/strategy" />
      <PageHeader
        icon="🎯"
        title="Strategy"
        description={`${strategyCount} strategy doc${strategyCount !== 1 ? "s" : ""}.`}
      />
      <Suspense fallback={null}>
        <DocsClient docs={docs} defaultDomain="work" />
      </Suspense>
      <LabelPageContent tagId="strategy" />
    </div>
  )
}
