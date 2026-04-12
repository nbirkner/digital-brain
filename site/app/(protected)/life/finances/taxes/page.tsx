import PageHeader from "@/components/PageHeader"
import PagePathStatic from "@/components/PagePathStatic"

// Data sourced from Notion Taxes page
// Page ID: 2a82f4d2-943e-81e6-ab65-eab2ae1ce12c
// Last synced: 2026-04-02

interface TaxYear {
  year: string
  sections: TaxSection[]
}

interface TaxSection {
  title: string
  items: TaxItem[]
}

interface TaxItem {
  type: "bullet" | "note" | "action" | "warning"
  text: string
  detail?: string
}

const TAX_TIPS: string[] = [
  "DO NOT contribute to Roth IRA directly. Income limits apply. Do the Backdoor Roth instead.",
  "Every tax season after filing, do the Backdoor Roth for the upcoming year (Roth IRA contribution → Traditional IRA → convert).",
  "ISOs are subject to the AMT. You are taxed on the spread (FMV minus strike price) as if they are gains. At Together, that was ~$30-40k for ~8k shares when Carta estimated it. For 2025, the 401k rollover zeroed it out.",
  "For ISO questions, schedule a Carta Tax Advisory session. Ask for Chris Pun by name: 'I spoke with Chris Pun in the past and need to talk to him.'",
  "For TurboTax, always request Rafael Tous as the advisor — he knows the full situation including the Roth recharacterizations and ISO history.",
]

const TAX_YEARS: TaxYear[] = [
  {
    year: "2025",
    sections: [
      {
        title: "Pre-filing notes",
        items: [
          {
            type: "warning",
            text: "Accidentally contributed $2,333.32 to Roth IRA (over income limits).",
          },
          {
            type: "bullet",
            text: "Options: withdraw excess contributions, or recharacterize (Roth → Traditional).",
          },
          {
            type: "bullet",
            text: "Decision: recharacterization (Roth → Traditional), then contribute remaining amount to reach $7k Traditional IRA limit.",
          },
          {
            type: "note",
            text: "A conversion doesn't impact your contribution limit.",
          },
        ],
      },
      {
        title: "Post-filing",
        items: [
          {
            type: "note",
            text: "No details yet — check back after filing season.",
          },
        ],
      },
    ],
  },
  {
    year: "2024",
    sections: [
      {
        title: "Post-filing",
        items: [
          {
            type: "warning",
            text: "Received payment notices from CA franchise tax board and IRS — federal interest payments were owed. (See CA Tax Double Payment 2024 note in Notion.)",
          },
          {
            type: "bullet",
            text: "Was originally told no additional money was owed for ISOs. Initially received a reimbursement from the IRS.",
          },
          {
            type: "warning",
            text: "Chris Pun from Carta Tax flagged that taxes were filed wrong — it was assumed the stock was sold at a loss. TurboTax refiled and found ~$26k owed.",
          },
          {
            type: "bullet",
            text: "Tax provider flagged a Roth over-contribution. Fidelity showed only one contribution. Unresolved discrepancy.",
          },
          {
            type: "note",
            text: "TurboTax MAX Benefits: 877-829-9695",
          },
        ],
      },
      {
        title: "Pre-filing",
        items: [
          {
            type: "bullet",
            text: "Potential taxable events for 2024: IRA contributions and 401k activity.",
          },
        ],
      },
    ],
  },
  {
    year: "2023",
    sections: [
      {
        title: "Notes",
        items: [
          {
            type: "action",
            text: "DO NOT include 1099 form for recharacterization in next year's taxes.",
          },
          {
            type: "action",
            text: "Call Fidelity for 2023 mega-backdoor — still sitting in after-tax.",
          },
          {
            type: "action",
            text: "Recharacterize excess 2023 Roth right away.",
          },
        ],
      },
    ],
  },
  {
    year: "2022",
    sections: [
      {
        title: "Notes",
        items: [
          {
            type: "bullet",
            text: "Cost basis RSUs: $40",
          },
          {
            type: "bullet",
            text: "Recharacterization completed this year.",
          },
        ],
      },
      {
        title: "Re-characterization (Fidelity letter)",
        items: [
          {
            type: "note",
            text: "Recharacterization request was processed on September 21 for $5,862.96.",
          },
          {
            type: "bullet",
            text: "Tax forms received after recharacterization: IRS Form 5498 (original IRA contribution), IRS Form 1099-R (amount moved out), IRS Form 5498 (second IRA deposit).",
          },
          {
            type: "bullet",
            text: "Use Form 8606 to report the recharacterization to the IRS.",
          },
        ],
      },
      {
        title: "Tax expert session (Aug 25, 9:15am PDT)",
        items: [
          {
            type: "bullet",
            text: "Q: When adding Betterment 1099-R form, it said I needed to amend my 2021 return.",
          },
          {
            type: "bullet",
            text: "Q: Gain = sell price - cost basis. Taxed only on gain. $0 cost basis issue — hadn't entered purchase cost.",
          },
          {
            type: "bullet",
            text: "Q: Reported Roth IRA contributions, was told I exceeded income limits — wasn't aware limits existed.",
          },
          {
            type: "bullet",
            text: "Q: Have a mega-backdoor Roth sitting in after-tax (not yet transferred to Roth IRA) — do I need to report it?",
          },
        ],
      },
    ],
  },
]

function ItemBadge({ type }: { type: TaxItem["type"] }) {
  if (type === "warning") {
    return <span className="inline-block w-4 h-4 mr-2 flex-shrink-0 text-red-400">⚠</span>
  }
  if (type === "action") {
    return <span className="inline-block w-4 h-4 mr-2 flex-shrink-0 text-amber-400">→</span>
  }
  if (type === "note") {
    return <span className="inline-block w-4 h-4 mr-2 flex-shrink-0 text-blue-400">ℹ</span>
  }
  return <span className="inline-block w-1.5 h-1.5 rounded-full bg-notion-muted/40 mr-3 mt-2 flex-shrink-0" />
}

export default function TaxesPage() {
  return (
    <div>
      <PagePathStatic path="life/finances/taxes" />

      <PageHeader
        icon="🗒️"
        title="Taxes"
        description="Tax notes, year-by-year history, and reminders for Niki."
      />

      {/* Quick links */}
      <div className="flex flex-wrap gap-2 mb-8">
        <a
          href="https://login.mindful.tax/app/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-notion-accent bg-notion-surface border border-notion-border rounded-lg px-3 py-1.5 hover:bg-notion-hover transition-colors"
        >
          Mindful Tax →
        </a>
        <a
          href="https://turbotax.intuit.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-notion-accent bg-notion-surface border border-notion-border rounded-lg px-3 py-1.5 hover:bg-notion-hover transition-colors"
        >
          TurboTax →
        </a>
        <a
          href="https://carta.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-notion-accent bg-notion-surface border border-notion-border rounded-lg px-3 py-1.5 hover:bg-notion-hover transition-colors"
        >
          Carta (ISO/AMT) →
        </a>
      </div>

      {/* Key rules */}
      <div className="mb-8 bg-notion-surface border border-notion-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-notion-text mb-3 flex items-center gap-2">
          <span>📌</span> Top tax tips
        </h2>
        <ul className="space-y-3">
          {TAX_TIPS.map((tip, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-notion-muted">
              <span className="mt-0.5 text-notion-accent font-mono text-xs flex-shrink-0">{i + 1}.</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Year-by-year */}
      <div className="space-y-6">
        {TAX_YEARS.map((year) => (
          <div key={year.year}>
            <h2 className="text-lg font-bold text-notion-text mb-3">{year.year}</h2>
            <div className="space-y-3">
              {year.sections.map((section) => (
                <div
                  key={section.title}
                  className="bg-notion-surface border border-notion-border rounded-xl overflow-hidden"
                >
                  <div className="px-4 py-2.5 border-b border-notion-border">
                    <h3 className="text-xs font-semibold text-notion-muted uppercase tracking-wide">
                      {section.title}
                    </h3>
                  </div>
                  <ul className="divide-y divide-notion-border/50">
                    {section.items.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start px-4 py-3 text-sm text-notion-muted hover:bg-notion-hover/50"
                      >
                        <ItemBadge type={item.type} />
                        <span
                          className={
                            item.type === "warning"
                              ? "text-red-500"
                              : item.type === "action"
                              ? "text-amber-600"
                              : item.type === "note"
                              ? "text-notion-accent"
                              : ""
                          }
                        >
                          {item.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
