import PageHeader from "@/components/layout/PageHeader"
import PagePathStatic from "@/components/layout/PagePathStatic"

// Data sourced from Notion Financial Accounts database
// Database ID: 2a82f4d2-943e-8195-9f57-df57ef64d269
// Last synced: 2026-04-02

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

const ALL_ACCOUNTS: Account[] = [
  // Credit Cards
  { name: "Apple Card", status: "Open", tags: ["Credit card"], autopay: false, monarch: true, last4: "0576", creditLimit: 8000 },
  { name: "Amex Platinum", status: "Open", tags: ["Credit card"], shared: true, autopay: true, monarch: true },
  { name: "Chase Freedom Flex", status: "Open", tags: ["Credit card"], autopay: true, monarch: true },
  { name: "Capital One SavorOne Rewards", status: "Open", tags: ["Credit card"], shared: true, autopay: true, monarch: true, last4: "3248", creditLimit: 3000 },
  { name: "Capital One Venture X", status: "Need to close", tags: ["Credit card"], shared: true, autopay: true, monarch: true },
  { name: "Navia Mastercard (Together AI)", status: "Open", tags: ["Credit card"], autopay: false, monarch: false },
  { name: "Discover it", status: "Open", tags: ["Credit card"], autopay: true, monarch: true, last4: "8725", creditLimit: 3000 },
  { name: "Whole Foods Credit Card", status: "Open", tags: ["Credit card"], shared: true, autopay: true, monarch: true },
  { name: "Chase Freedom Unlimited", status: "Open", tags: ["Credit card"], autopay: true, monarch: true, last4: "2524", creditLimit: 5400 },
  { name: "Fidelity Rewards Visa Signature", status: "Open", tags: ["Credit card"], autopay: true, monarch: true, last4: "5885", creditLimit: 23500 },
  { name: "Amazon Store Card", status: "Open", tags: ["Credit card"], autopay: true, monarch: true, creditLimit: 5000 },
  { name: "Costco Anywhere Visa", status: "Open", tags: ["Credit card"], shared: true, autopay: true, monarch: true, last4: "0722", creditLimit: 1200 },
  { name: "BFSFCU Visa Platinum", status: "Closed", tags: ["Credit card"], last4: "1883", creditLimit: 1500 },
  { name: "Banana Republic Barclays Card", status: "Closed", tags: ["Credit card"] },
  { name: "Best Buy CC", status: "Closed", tags: ["Credit card"] },
  { name: "Capital One Venture X [Shared]", status: "Closed", tags: ["Credit card"] },
  { name: "Wayfair Credit Card", status: "Closed", tags: ["Credit card"] },
  { name: "Bilt Credit Card", status: "Closed", tags: ["Credit card"] },
  { name: "Macy's Card", status: "Closed", tags: ["Credit card"] },

  // Bank Accounts
  { name: "BFSFCU Money Management Savings", status: "Open", tags: ["Bank"], monarch: true, last4: "7612" },
  { name: "Capital One 360 Performance Savings", status: "Open", tags: ["Bank"], monarch: true },
  { name: "BFSFCU Savings", status: "Open", tags: ["Bank"], monarch: true, last4: "9407" },
  { name: "BFSFCU Checking", status: "Open", tags: ["Bank"], monarch: true, last4: "9415" },
  { name: "Capital One 360 Checking Account", status: "Open", tags: ["Bank"], monarch: true },
  { name: "Chase Savings", status: "Closed", tags: ["Bank"], last4: "4294" },
  { name: "Ally Interest Checking", status: "Closed", tags: ["Bank"], shared: true, last4: "3395" },
  { name: "Chase Total Checking", status: "Closed", tags: ["Bank"], last4: "5411" },

  // Debit Cards
  { name: "Capital One Debit Card", status: "Open", tags: ["Debit card"], monarch: false },
  { name: "Etrade Debit Card", status: "Open", tags: ["Debit card"], monarch: false },
  { name: "Apple Cash", status: "Open", tags: ["Debit card"], monarch: true },
  { name: "HoneyDue", status: "Closed", tags: ["Debit card"], shared: true, last4: "2842" },
  { name: "Chase Debit Card", status: "Closed", tags: ["Debit card"] },

  // Investments
  { name: "Fidelity Roth IRA", status: "Open", tags: ["Investment"], taxable: true, monarch: true, last4: "0790" },
  { name: "Fidelity Individual", status: "Open", tags: ["Investment"], taxable: true, monarch: true, last4: "0671" },
  { name: "Fidelity Traditional IRA", status: "Open", tags: ["Investment"], taxable: true, monarch: true, last4: "8943" },
  { name: "E-Trade Individual Brokerage", status: "Open", tags: ["Investment"], taxable: true, monarch: true, last4: "5452" },
  { name: "E-Trade Stock Plan (ASAN)", status: "Open", tags: ["Investment"], taxable: true, monarch: true, last4: "5452" },
  { name: "Empower Retirement", status: "Open", tags: ["Investment"], taxable: true, monarch: true },
  { name: "Coinbase Bitcoin Wallet", status: "Open", tags: ["Investment"], taxable: true, monarch: true, last4: "F69A" },
  { name: "Metamask + Ledger ATNP", status: "Other", tags: ["Investment"], shared: true, monarch: false, last4: "e162" },
  { name: "Betterment Personal Account", status: "Closed", tags: ["Investment"] },
  { name: "Fidelity Asana Inc 401k", status: "Closed", tags: ["Investment"], taxable: true, last4: "9449" },
  { name: "Betterment Roth IRA", status: "Closed", tags: ["Investment"] },
  { name: "TD Ameritrade Roth IRA", status: "Closed", tags: ["Investment"] },
  { name: "Betterment Traditional IRA", status: "Closed", tags: ["Investment"] },
  { name: "TD Ameritrade Individual Account", status: "Closed", tags: ["Investment"] },
  { name: "River Financial", status: "Closed", tags: ["Investment"] },

  // Loans
  { name: "BFSFCU Vehicle Loan", status: "Open", tags: ["Loan"], monarch: true },
]

const TAG_ORDER = ["Credit card", "Bank", "Debit card", "Investment", "Loan"]

const TAG_ICONS: Record<string, string> = {
  "Credit card": "💳",
  Bank: "🏦",
  "Debit card": "💰",
  Investment: "📈",
  Loan: "🏎️",
}

type StatusFilter = "all" | "open" | "closed"

function StatusBadge({ status }: { status: AccountStatus }) {
  const styles: Record<AccountStatus, string> = {
    Open: "bg-emerald-500/15 text-emerald-400",
    Closed: "bg-notion-border/50 text-notion-muted",
    "Need to close": "bg-yellow-500/15 text-yellow-400",
    "In progress": "bg-purple-500/15 text-purple-400",
    Other: "bg-blue-500/15 text-blue-400",
    "Closing in progress": "bg-orange-500/15 text-orange-400",
  }
  return (
    <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${styles[status]}`}>
      {status}
    </span>
  )
}

function AccountRow({ account }: { account: Account }) {
  return (
    <tr className="border-b border-notion-border last:border-0 hover:bg-notion-hover/50">
      <td className="px-4 py-2.5">
        <span className="text-sm text-notion-text">{account.name}</span>
        {account.shared && (
          <span className="ml-2 text-[10px] text-notion-muted bg-notion-border/40 px-1 py-0.5 rounded">shared</span>
        )}
        {account.taxable && (
          <span className="ml-1 text-[10px] text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded">taxable</span>
        )}
      </td>
      <td className="px-4 py-2.5 text-right">
        <div className="flex items-center justify-end gap-2 flex-wrap">
          {account.last4 && (
            <span className="text-[11px] text-notion-muted font-mono">···{account.last4}</span>
          )}
          {account.creditLimit && (
            <span className="text-[11px] text-notion-muted">${account.creditLimit.toLocaleString()}</span>
          )}
          {account.autopay && (
            <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">autopay</span>
          )}
          {account.monarch === false && account.status === "Open" && (
            <span className="text-[10px] text-notion-muted/60 bg-notion-border/20 px-1.5 py-0.5 rounded">not in Monarch</span>
          )}
          {account.status !== "Open" && <StatusBadge status={account.status} />}
        </div>
      </td>
    </tr>
  )
}

export default function AccountsPage() {
  const openAccounts = ALL_ACCOUNTS.filter((a) => a.status === "Open" || a.status === "Need to close" || a.status === "Other")
  const closedAccounts = ALL_ACCOUNTS.filter((a) => a.status === "Closed" || a.status === "Closing in progress")

  const openByTag: Record<string, Account[]> = {}
  const closedByTag: Record<string, Account[]> = {}

  for (const tag of TAG_ORDER) {
    const open = openAccounts.filter((a) => a.tags.includes(tag))
    const closed = closedAccounts.filter((a) => a.tags.includes(tag))
    if (open.length > 0) openByTag[tag] = open
    if (closed.length > 0) closedByTag[tag] = closed
  }

  const totalCreditLimit = openAccounts
    .filter((a) => a.tags.includes("Credit card") && a.creditLimit)
    .reduce((sum, a) => sum + (a.creditLimit ?? 0), 0)

  return (
    <div>
      <PagePathStatic path="life/finances/accounts" />

      <PageHeader
        icon="🏦"
        title="Financial Accounts"
        description={`All ${ALL_ACCOUNTS.length} accounts — ${openAccounts.length} active, ${closedAccounts.length} closed.`}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-notion-surface border border-notion-border rounded-xl p-4">
          <p className="text-xs text-notion-muted mb-1">Active accounts</p>
          <p className="text-2xl font-bold text-notion-text">{openAccounts.length}</p>
        </div>
        <div className="bg-notion-surface border border-notion-border rounded-xl p-4">
          <p className="text-xs text-notion-muted mb-1">Total credit limit</p>
          <p className="text-2xl font-bold text-notion-text">${(totalCreditLimit / 1000).toFixed(0)}k</p>
        </div>
        <div className="bg-notion-surface border border-notion-border rounded-xl p-4">
          <p className="text-xs text-notion-muted mb-1">In Monarch</p>
          <p className="text-2xl font-bold text-notion-text">
            {openAccounts.filter((a) => a.monarch !== false).length}
          </p>
        </div>
      </div>

      {/* Active accounts by category */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-notion-muted uppercase tracking-wider mb-3">Active</h2>
        <div className="space-y-4">
          {Object.entries(openByTag).map(([tag, accounts]) => (
            <div key={tag} className="bg-notion-surface border border-notion-border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-notion-border flex items-center gap-2">
                <span>{TAG_ICONS[tag]}</span>
                <h3 className="text-xs font-semibold text-notion-muted uppercase">{tag}s</h3>
                <span className="ml-auto text-xs text-notion-muted">{accounts.length}</span>
              </div>
              <table className="w-full">
                <tbody>
                  {accounts.map((acct) => (
                    <AccountRow key={acct.name} account={acct} />
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>

      {/* Closed accounts — collapsed by default */}
      <details className="group">
        <summary className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-notion-muted uppercase tracking-wider mb-3 hover:text-notion-text transition-colors">
          <svg
            className="w-3 h-3 group-open:rotate-90 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Closed Accounts ({closedAccounts.length})
        </summary>
        <div className="mt-3 space-y-4">
          {Object.entries(closedByTag).map(([tag, accounts]) => (
            <div
              key={tag}
              className="bg-notion-surface border border-notion-border rounded-xl overflow-hidden opacity-60"
            >
              <div className="px-4 py-2.5 border-b border-notion-border flex items-center gap-2">
                <span>{TAG_ICONS[tag]}</span>
                <h3 className="text-xs font-semibold text-notion-muted uppercase">{tag}s</h3>
                <span className="ml-auto text-xs text-notion-muted">{accounts.length}</span>
              </div>
              <table className="w-full">
                <tbody>
                  {accounts.map((acct) => (
                    <AccountRow key={acct.name} account={acct} />
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}
