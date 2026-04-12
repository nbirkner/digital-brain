import { Suspense } from "react"
import PageHeader from "@/components/PageHeader"
import PagePathStatic from "@/components/PagePathStatic"
import DocsClient from "@/components/DocsClient"
import { getAllDocsMeta } from "@/lib/docs"
import LabelPageContent from "@/components/LabelPageContent"

export default async function WorkDecisionsPage() {
  const docs = getAllDocsMeta()
  const decisionCount = docs.filter(d => d.domain === "work" && d.docType === "Decision").length

  return (
    <div>
      <PagePathStatic path="work/decisions" />
      <PageHeader
        icon="⚖️"
        title="Decision Logs"
        description={`${decisionCount} decision${decisionCount !== 1 ? "s" : ""} logged.`}
      />
      <Suspense fallback={null}>
        <DocsClient docs={docs} defaultDomain="work" />
      </Suspense>
      <LabelPageContent tagId="decision" />
    </div>
  )
}
