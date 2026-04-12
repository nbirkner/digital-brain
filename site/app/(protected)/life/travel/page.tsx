import PageHeader from "@/components/PageHeader"
import PagePathStatic from "@/components/PagePathStatic"
import TravelClient from "@/components/TravelClient"
import { getMarkdownFilesWithPending } from "@/lib/content"
import LabelPageContent from "@/components/LabelPageContent"

export default async function TravelPage() {
  const tripFiles = await getMarkdownFilesWithPending("personal/site/travel/trips")

  const trips = tripFiles.map((f) => ({
    slug: f.slug,
    displayTitle: f.displayTitle,
    frontmatter: f.frontmatter as Record<string, string>,
  }))

  return (
    <div>
      <PagePathStatic path="life/travel" />
      <PageHeader
        icon="✈️"
        title="Travel"
        description="Upcoming trips, important dates, and adventures."
      />
      <TravelClient trips={trips} />
      <LabelPageContent tagId="travel" />
    </div>
  )
}
