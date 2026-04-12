import Link from "next/link"
import PageHeader from "@/components/PageHeader"
import PagePathStatic from "@/components/PagePathStatic"
import { getMarkdownFile, getMarkdownFilesWithPending } from "@/lib/content"
import LabelPageContent from "@/components/LabelPageContent"

// Data sourced from shared/finances/accounts.md and overview.md
// Edit those files to update accounts, tools, team, and tax tips.

type AccountStatus = "Open" | "Closed" | "Need to close" | "In progress" | "Other" | "Closing in progress"

interface Account {
  name: string
  status: AccountStatus
  tags: string[]
  shared?: boolean
  taxable?: boolean
  autopay?: boolean
  monarch?: boolean
  last4?: string
  creditLimit?: number
}

interface Tool {
  name: string
  url: string
  description: string
  icon: string
}

interface TeamMember {
  name: string
  role: string
  firm: string
  link?: string
  boardLink?: string
  icon: string
  note?: string
}

const TAG_ORDER = ["Credit card", "Bank", "Debit card", "Investment", "Loan"]

const TAG_ICONS: Record<string, string> = {
  "Credit card": "💳",
  Bank: "🏦",
  "Debit card": "💰",
  Investment: "📈",
  Loan: "🏎️",
}

function groupByTag(accounts: Account[]) {
  const groups: Record<string, Account[]> = {}
  for (const tag of TAG_ORDER) {
    const tagged = accounts.filter((a) => a.tags.includes(tag))
    if (tagged.length > 0) groups[tag] = tagged
  }
  return groups
}

function StatusBadge({ status }: { status: AccountStatus }) {
  const colors: Record<AccountStatus, string> = {
    Open: "bg-emerald-500/15 text-emerald-400",
    Closed: "bg-notion-border/50 text-notion-muted",
    "Need to close": "bg-yellow-500/15 text-yellow-400",
    "In progress": "bg-purple-500/15 text-purple-400",
    Other: "bg-blue-500/15 text-blue-400",
    "Closing in progress": "bg-orange-500/15 text-orange-400",
  }
  return (
    <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${colors[status]}`}>
      {status}
    </span>
  )
}

function AccountTable({ accounts }: { accounts: Account[] }) {
  return (
    <table className="w-full text-sm">
      <tbody>
        {accounts.map((acct, i) => (
          <tr
            key={acct.name}
            className={`${i < accounts.length - 1 ? "border-b border-notion-border" : ""} hover:bg-notion-hover`}
          >
            <td className="px-4 py-2.5 text-notion-text">
              <span>{acct.name}</span>
              {acct.shared && (
                <span className="ml-1.5 text-[10px] text-notion-muted bg-notion-border/40 px-1 py-0.5 rounded">shared</span>
              )}
            </td>
            <td className="px-4 py-2.5 text-right">
              <div className="flex items-center justify-end gap-2">
                {acct.last4 && (
                  <span className="text-[11px] text-notion-muted font-mono">···{acct.last4}</span>
                )}
                {acct.autopay && (
                  <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1 py-0.5 rounded">autopay</span>
                )}
                {acct.taxable && (
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded">taxable</span>
                )}
                {acct.status !== "Open" && <StatusBadge status={acct.status} />}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function parseJsonField<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value.trim()) as T
  } catch {
    return fallback
  }
}

export default async function FinancesPage() {
  // Load from markdown frontmatter
  const accountsFile = getMarkdownFile("shared/finances/accounts.md")
  const overviewFile = getMarkdownFile("shared/finances/overview.md")

  const accounts = parseJsonField<Account[]>(accountsFile?.frontmatter.accounts_json, [])
  const closedAccounts = parseJsonField<Account[]>(accountsFile?.frontmatter.closed_accounts_json, [])
  const tools = parseJsonField<Tool[]>(overviewFile?.frontmatter.tools_json, [])
  const team = parseJsonField<TeamMember[]>(overviewFile?.frontmatter.team_json, [])
  const taxTips = parseJsonField<string[]>(overviewFile?.frontmatter.tax_tips_json, [])

  const activeGroups = groupByTag(accounts)
  const closedGroups = groupByTag(closedAccounts)

  return (
    <div>
      <PagePathStatic path="life/finances" />
      <PageHeader
        icon="💸"
        title="Finances"
        description="Accounts, tools, team, and tax notes."
      />

      {/* Subpages */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-notion-muted uppercase tracking-wider mb-3">Pages</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/life/finances/accounts"
            className="flex items-center gap-3 bg-notion-surface hover:bg-notion-hover border border-notion-border rounded-xl p-4 transition-colors"
          >
            <span className="text-xl">🏦</span>
            <div>
              <h3 className="font-medium text-notion-text text-sm">Financial Accounts</h3>
              <p className="text-notion-muted text-xs mt-0.5">All 47 accounts — active and closed</p>
            </div>
            <svg className="w-4 h-4 text-notion-muted ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/life/finances/taxes"
            className="flex items-center gap-3 bg-notion-surface hover:bg-notion-hover border border-notion-border rounded-xl p-4 transition-colors"
          >
            <span className="text-xl">🗒️</span>
            <div>
              <h3 className="font-medium text-notion-text text-sm">Taxes</h3>
              <p className="text-notion-muted text-xs mt-0.5">Year-by-year notes, ISO/AMT tips, Roth reminders</p>
            </div>
            <svg className="w-4 h-4 text-notion-muted ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Quick links / Tools */}
      {tools.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-notion-muted uppercase tracking-wider mb-3">Tools</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {tools.map((tool) => (
              <a
                key={tool.name}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 bg-notion-surface hover:bg-notion-hover border border-notion-border rounded-xl p-4 transition-colors"
              >
                <span className="text-xl">{tool.icon}</span>
                <div>
                  <h3 className="font-medium text-notion-text text-sm">{tool.name}</h3>
                  <p className="text-notion-muted text-xs mt-0.5">{tool.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Financial Team */}
      {team.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-notion-muted uppercase tracking-wider mb-3">Team</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {team.map((member) => (
              <div key={member.name} className="bg-notion-surface border border-notion-border rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">{member.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-notion-text text-sm">{member.name}</h3>
                    <p className="text-notion-muted text-xs">{member.role}</p>
                    <p className="text-notion-muted/60 text-xs">{member.firm}</p>
                    {member.note && (
                      <p className="text-notion-muted text-xs mt-1.5 italic">{member.note}</p>
                    )}
                    {member.link && (
                      <a
                        href={member.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-notion-accent hover:underline mt-1.5 block"
                      >
                        Open portal →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Accounts */}
      {accounts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-notion-muted uppercase tracking-wider mb-3">Active Accounts</h2>
          <div className="space-y-4">
            {Object.entries(activeGroups).map(([tag, accts]) => (
              <div key={tag} className="bg-notion-surface border border-notion-border rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 border-b border-notion-border flex items-center gap-2">
                  <span>{TAG_ICONS[tag] ?? "📁"}</span>
                  <h3 className="text-xs font-semibold text-notion-muted uppercase">{tag}s</h3>
                  <span className="ml-auto text-xs text-notion-muted">{accts.length}</span>
                </div>
                <AccountTable accounts={accts} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tax Notes */}
      {taxTips.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-notion-muted uppercase tracking-wider mb-3">Tax Notes</h2>
          <div className="bg-notion-surface border border-notion-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🗒️</span>
              <p className="text-sm font-medium text-notion-text">Key reminders (Niki)</p>
            </div>
            <ul className="space-y-2">
              {taxTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-notion-muted">
                  <span className="mt-0.5 text-notion-muted/40 flex-shrink-0">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-3 border-t border-notion-border">
              <a
                href="https://login.mindful.tax/app/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-notion-accent hover:underline"
              >
                Open Mindful Tax →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Closed Accounts (collapsed) */}
      {closedAccounts.length > 0 && (
        <details className="group">
          <summary className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-notion-muted uppercase tracking-wider mb-3 hover:text-notion-text transition-colors">
            <svg className="w-3 h-3 group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Closed Accounts ({closedAccounts.length})
          </summary>
          <div className="mt-3 space-y-4">
            {Object.entries(closedGroups).map(([tag, accts]) => (
              <div key={tag} className="bg-notion-surface border border-notion-border rounded-xl overflow-hidden opacity-60">
                <div className="px-4 py-2.5 border-b border-notion-border flex items-center gap-2">
                  <span>{TAG_ICONS[tag] ?? "📁"}</span>
                  <h3 className="text-xs font-semibold text-notion-muted uppercase">{tag}s</h3>
                  <span className="ml-auto text-xs text-notion-muted">{accts.length}</span>
                </div>
                <AccountTable accounts={accts} />
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Migrated Notes */}
      <FinancesNotes />
      <LabelPageContent tagId="finance" />
    </div>
  )
}

async function FinancesNotes() {
  const allFiles = (await getMarkdownFilesWithPending("shared/finances")).filter(
    (f) =>
      !f.slug.endsWith("README") &&
      !f.slug.endsWith("index") &&
      !f.slug.endsWith("accounts") &&
      !f.slug.endsWith("overview")
  )
  if (allFiles.length === 0) return null
  const shown = allFiles.slice(0, 30)
  return (
    <details className="group mt-6">
      <summary className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-notion-muted uppercase tracking-wider mb-3 hover:text-notion-text transition-colors">
        <svg className="w-3 h-3 group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Finance Notes ({allFiles.length})
      </summary>
      <div className="mt-3 space-y-1">
        {shown.map((f) => (
          <Link
            key={f.slug}
            href={`/life/finances/${f.slug}`}
            className="block px-3 py-2 rounded-lg hover:bg-notion-surface border border-transparent hover:border-notion-border transition-colors"
          >
            <p className="text-sm text-notion-text leading-snug truncate">{f.displayTitle}</p>
            {f.frontmatter.date && (
              <p className="text-xs text-notion-muted mt-0.5">{f.frontmatter.date}</p>
            )}
          </Link>
        ))}
        {allFiles.length > 30 && (
          <p className="text-xs text-notion-muted px-3 py-2">{allFiles.length - 30} more notes not shown.</p>
        )}
      </div>
    </details>
  )
}
