import PageHeader from "@/components/PageHeader"
import PagePathStatic from "@/components/PagePathStatic"

export default function OfficialDocsPage() {
  return (
    <div>
      <PagePathStatic path="life/luci/official-docs" />

      <PageHeader icon="📁" title="Official Docs for Luci" description="Medical records, insurance, and vaccination history." />

      <div className="space-y-8">
        {/* Important Docs */}
        <section>
          <h2 className="text-base font-semibold text-notion-text mb-4">Important Docs</h2>
          <div className="space-y-3">
            <DocCard
              icon="📋"
              title="Complete Medical History"
              filename="complete-medical-history.pdf"
              href="/pdfs/luci/complete-medical-history.pdf"
              date="February 24, 2026"
              description="Full medical history from Milo Foundation as of adoption date."
            />
            <DocCard
              icon="✂️"
              title="Spay/Neuter Certificate"
              filename="spay-neuter-certificate.pdf"
              href="/pdfs/luci/spay-neuter-certificate.pdf"
              date="February 24, 2026"
              description="Official certificate confirming Luci is spayed."
            />
          </div>
        </section>

        {/* Pet Insurance */}
        <section>
          <h2 className="text-base font-semibold text-notion-text mb-4">Pet Insurance</h2>
          <DocCard
            icon="🛡️"
            title="Pet Insurance Policy"
            filename="pet-insurance-policy.pdf"
            href="/pdfs/luci/pet-insurance-policy.pdf"
            date="February 24, 2026"
            description="Insurance policy document for Luci."
          />
        </section>

        {/* Vaccinations */}
        <section>
          <h2 className="text-base font-semibold text-notion-text mb-4">Vaccinations</h2>
          <p className="text-sm text-notion-muted mb-4">
            Vaccination records sourced from{" "}
            <a
              href="https://adopterluv.com/animals/6831340"
              target="_blank"
              rel="noopener noreferrer"
              className="text-notion-accent hover:opacity-80 underline"
            >
              AdopterLuv
            </a>
            . Luci&apos;s foster name was Polka Dot (ID: 658895).
          </p>
          <div className="space-y-3">
            <DocCard
              icon="💉"
              title="Petcademy Vaccine Report"
              filename="vaccine-report.pdf"
              href="/pdfs/luci/vaccine-report.pdf"
              date="February 25, 2026"
              description="Official vaccine report from Petcademy for foster animal Polka Dot."
            />
            <DocCard
              icon="📷"
              title="Vaccination Record (Scanned)"
              filename="CamScanner_3-8-26_19.45_1.jpeg"
              date="March 8, 2026"
              description="Physical vaccination record scanned at home."
            />
          </div>
        </section>

        {/* Quick Reference */}
        <section>
          <h2 className="text-base font-semibold text-notion-text mb-4">Quick Reference</h2>
          <div className="bg-notion-surface border border-notion-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {[
                  { label: "Foster Name", value: "Polka Dot" },
                  { label: "AdopterLuv ID", value: "6831340" },
                  { label: "Petcademy ID", value: "658895" },
                  { label: "Microchip", value: "941000031222685" },
                  { label: "Spayed", value: "Yes (confirmed)" },
                ].map((row, i, arr) => (
                  <tr
                    key={row.label}
                    className={`${i < arr.length - 1 ? "border-b border-notion-border" : ""} hover:bg-notion-hover`}
                  >
                    <td className="px-4 py-3 text-notion-muted font-medium w-44">{row.label}</td>
                    <td className="px-4 py-3 text-notion-text font-mono text-xs">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}

function DocCard({
  icon,
  title,
  filename,
  href,
  date,
  description,
}: {
  icon: string
  title: string
  filename: string
  href?: string
  date: string
  description: string
}) {
  const inner = (
    <div className="flex items-start gap-3">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-notion-text text-sm">{title}</p>
        <p className="text-notion-muted text-xs mt-0.5">{description}</p>
        <p className="text-notion-muted/60 text-xs mt-2 font-mono truncate">{filename}</p>
        <p className="text-notion-muted/50 text-xs mt-1">{date}</p>
      </div>
      {href ? (
        <span className="text-notion-accent text-xs mt-1 flex-shrink-0">↓ Download</span>
      ) : (
        <span className="text-notion-muted/40 text-xs mt-1">PDF</span>
      )}
    </div>
  )

  if (href) {
    return (
      <a
        href={href}
        download
        className="block bg-notion-surface border border-notion-border rounded-xl p-4 hover:bg-notion-hover transition-colors"
      >
        {inner}
      </a>
    )
  }

  return (
    <div className="bg-notion-surface border border-notion-border rounded-xl p-4 hover:bg-notion-hover transition-colors">
      {inner}
    </div>
  )
}
