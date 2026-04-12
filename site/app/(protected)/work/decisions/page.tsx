import { Suspense } from "react"
import PageHeader from "@/components/layout/PageHeader"
import PagePathStatic from "@/components/layout/PagePathStatic"
import DocsClient from "@/components/features/content/DocsClient"
import { getAllDocsMeta } from "@/lib/docs"
import LabelPageContent from "@/components/features/notes/LabelPageContent"

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
