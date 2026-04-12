import PageHeader from "@/components/layout/PageHeader"
import EmptyState from "@/components/ui/EmptyState"

interface PageShellProps {
  title: string
  subtitle?: string
  icon?: string | React.ReactNode
  loading?: boolean
  empty?: boolean
  emptyMessage?: string
  emptyIcon?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
}

export default function PageShell({
  title,
  subtitle,
  icon,
  loading = false,
  empty = false,
  emptyMessage,
  emptyIcon,
  actions,
  children,
}: PageShellProps) {
  return (
    <div>
      <PageHeader icon={icon ?? ""} title={title} description={subtitle}>
        {actions}
      </PageHeader>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-notion-border/30 rounded w-3/4" />
          <div className="h-4 bg-notion-border/30 rounded w-1/2" />
          <div className="h-4 bg-notion-border/30 rounded w-2/3" />
        </div>
      ) : empty ? (
        <EmptyState
          icon={typeof emptyIcon === "string" ? emptyIcon : undefined}
          message={emptyMessage}
        />
      ) : (
        children
      )}
    </div>
  )
}
