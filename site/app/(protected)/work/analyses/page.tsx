import { Suspense } from "react"
import PageHeader from "@/components/layout/PageHeader"
import PagePathStatic from "@/components/layout/PagePathStatic"
import DocsClient from "@/components/features/content/DocsClient"
import { getAllDocsMeta } from "@/lib/docs"
import LabelPageContent from "@/components/features/notes/LabelPageContent"

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
