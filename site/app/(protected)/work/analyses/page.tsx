import { Suspense } from "react"
import PageHeader from "@/components/PageHeader"
import PagePathStatic from "@/components/PagePathStatic"
import DocsClient from "@/components/DocsClient"
import { getAllDocsMeta } from "@/lib/docs"
import LabelPageContent from "@/components/LabelPageContent"

export default async function WorkAnalysesPage() {
  const docs = getAllDocsMeta()
  const analysisCount = docs.filter(d => d.domain === "work" && d.docType === "Analysis").length

  return (
    <div>
      <PagePathStatic path="work/analyses" />
      <PageHeader
        icon="📊"
        title="Analyses"
        description={`${analysisCount} analysis document${analysisCount !== 1 ? "s" : ""}.`}
      />
      <Suspense fallback={null}>
        <DocsClient docs={docs} defaultDomain="work" />
      </Suspense>
      <LabelPageContent tagId="analysis" />
    </div>
  )
}
