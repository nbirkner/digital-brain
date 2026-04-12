import Link from "next/link"
import PageHeader from "@/components/PageHeader"
import PagePathStatic from "@/components/PagePathStatic"
import { getMarkdownFile, getMarkdownFilesWithPending } from "@/lib/content"

const CAR_SLUGS = ["corolla", "infiniti"]

export default async function CarsPage() {
  const indexMeta = getMarkdownFile("shared/cars/index.md")
  const totalCost = indexMeta?.frontmatter.total_monthly_cost ?? "737.50"
  const costNote = indexMeta?.frontmatter.cost_note ?? "loan + insurance"
  const costSplit = indexMeta?.frontmatter.cost_split ?? "~60–65% Juan / 35–40% Niki"

  const carFiles = CAR_SLUGS.map((slug) =>
    getMarkdownFile(`shared/cars/${slug}.md`)
  ).filter(Boolean)

  const cars = carFiles.map((f) => ({
    slug: f!.frontmatter.slug,
    nickname: f!.frontmatter.nickname,
    make: f!.frontmatter.make,
    model: f!.frontmatter.model,
    year: f!.frontmatter.year,
    license: f!.frontmatter.license,
    vin: f!.frontmatter.vin,
    color: f!.frontmatter.color,
    colorName: f!.frontmatter.color_name,
    icon: f!.frontmatter.icon,
    notes: f!.frontmatter.notes,
  }))

  return (
    <div>
      <PagePathStatic path="life/cars" />
      <PageHeader
        icon="🚗"
        title="Cars"
        description="Vehicle info, registration, and insurance details."
      />

      <div className="bg-notion-surface border border-notion-border rounded-xl p-4 mb-6">
        <p className="text-sm text-notion-muted">
          Total monthly cost:{" "}
          <span className="text-notion-text font-semibold">${totalCost}</span>{" "}
          ({costNote}). Split {costSplit}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {cars.map((car) => (
          <Link
            key={car.vin}
            href={`/life/cars/${car.slug}`}
            className="bg-notion-surface border border-notion-border rounded-xl p-5 block hover:border-notion-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{car.icon}</span>
              <div>
                <h3 className="font-bold text-notion-text">
                  {car.year} {car.make} {car.model}
                </h3>
                <p className="text-notion-muted text-xs">{car.notes}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-notion-muted">License Plate</span>
                <span className="text-notion-text font-mono font-medium">
                  {car.license}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-notion-muted">VIN</span>
                <span className="text-notion-text font-mono text-xs">
                  {car.vin}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-notion-muted">Color</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="inline-block w-3 h-3 rounded-full border border-notion-border"
                    style={{ backgroundColor: car.color }}
                  />
                  <span className="text-notion-text text-xs">{car.colorName}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-notion-accent mt-4">View details →</p>
          </Link>
        ))}
      </div>

      <AllCarFiles />
    </div>
  )
}

const KNOWN_CAR_SLUGS = new Set(["corolla", "infiniti"])

async function AllCarFiles() {
  const allFiles = (await getMarkdownFilesWithPending("shared/cars")).filter(
    (f) => !KNOWN_CAR_SLUGS.has(f.slug) && !f.slug.endsWith("README") && !f.slug.endsWith("index")
  )
  if (allFiles.length === 0) return null
  const shown = allFiles.slice(0, 30)
  return (
    <details className="group mt-6">
      <summary className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-notion-muted uppercase tracking-wider mb-3 hover:text-notion-text transition-colors">
        <svg className="w-3 h-3 group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Migrated Notes ({allFiles.length})
      </summary>
      <div className="mt-3 space-y-1">
        {shown.map((f) => (
          <Link
            key={f.slug}
            href={`/life/cars/${f.slug}`}
            className="block px-3 py-2 rounded-lg hover:bg-notion-surface border border-transparent hover:border-notion-border transition-colors"
          >
            <p className="text-sm text-notion-text leading-snug truncate">{f.displayTitle}</p>
          </Link>
        ))}
        {allFiles.length > 30 && (
          <p className="text-xs text-notion-muted px-3 py-2">{allFiles.length - 30} more files not shown.</p>
        )}
      </div>
    </details>
  )
}
