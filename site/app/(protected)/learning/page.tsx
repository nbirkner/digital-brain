import PageHeader from "@/components/PageHeader"
import PagePathStatic from "@/components/PagePathStatic"
import LearningClient from "@/components/LearningClient"
import { fetchBooks, fetchHighlights } from "@/lib/readwise"
import LabelPageContent from "@/components/LabelPageContent"

export const revalidate = 60 // ISR: revalidate every 60 seconds

export default async function LearningPage() {
  const [books, highlights] = await Promise.all([fetchBooks(), fetchHighlights()])

  const totalHighlightsRaw = highlights.length // already deduplicated by fetchHighlights

  return (
    <div>
      <PagePathStatic path="learning" />
      <PageHeader
        icon="📖"
        title="Learning"
        description="Books, highlights, and notes from things that matter."
      />
      <LearningClient
        books={books}
        highlights={highlights}
        totalHighlightsRaw={totalHighlightsRaw}
      />
      <LabelPageContent tagId="learning" />
    </div>
  )
}
