import PageHeader from "@/components/layout/PageHeader"
import PagePathStatic from "@/components/layout/PagePathStatic"
import LearningClient from "@/components/features/learning/LearningClient"
import { fetchBooks, fetchHighlights } from "@/lib/readwise"
import LabelPageContent from "@/components/features/notes/LabelPageContent"

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
