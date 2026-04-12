import { Suspense } from "react"
import PageHeader from "@/components/layout/PageHeader"
import PagePathStatic from "@/components/layout/PagePathStatic"
import DocsClient from "@/components/features/content/DocsClient"
import { getAllDocsMeta } from "@/lib/docs"
import LabelPageContent from "@/components/features/notes/LabelPageContent"

export default async function WorkCommsPage() {
  const docs = getAllDocsMeta()
  const commsCount = docs.filter(d => d.domain === "work" && d.docType === "Comms").length

  return (
    <div>
      <PagePathStatic path="work/comms" />
      <PageHeader
        icon="📣"
        title="Comms"
        description={`${commsCount} comm${commsCount !== 1 ? "s" : ""}.`}
      />
      <Suspense fallback={null}>
        <DocsClient docs={docs} defaultDomain="work" />
      </Suspense>
      <LabelPageContent tagId="comms" />
    </div>
  )
}
