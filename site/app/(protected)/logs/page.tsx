import { Suspense } from "react"
import PageHeader from "@/components/layout/PageHeader"
import PagePathStatic from "@/components/layout/PagePathStatic"
import DocsClient from "@/components/features/content/DocsClient"
import { getAllDocsMeta } from "@/lib/docs"
import LabelPageContent from "@/components/features/notes/LabelPageContent"

export default async function LogsPage() {
  const docs = getAllDocsMeta().filter(d => d.docType === "Log")

  return (
    <div>
      <PagePathStatic path="logs" />
      <PageHeader
        icon="📋"
        title="Logs"
        description={`${docs.length} session log${docs.length !== 1 ? "s" : ""}.`}
      />
      <Suspense fallback={null}>
        <DocsClient docs={docs} />
      </Suspense>
      <LabelPageContent tagId="log" />
    </div>
  )
}
