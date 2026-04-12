interface PageHeaderProps {
  icon: string | React.ReactNode
  title?: string
  description?: string
  children?: React.ReactNode
}

export default function PageHeader({ icon, title, description, children }: PageHeaderProps) {
  const isEmoji = typeof icon === "string"
  return (
    <div className="mb-8 pb-6 border-b border-notion-border/40">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className={isEmoji ? "text-4xl mb-3" : "mb-3"}>{icon}</div>
          {title && (
          <h1
            className="text-3xl font-bold text-notion-text tracking-tight"
            style={{ fontFamily: "var(--font-display, var(--font-sans))" }}
          >
            {title}
          </h1>
          )}
          {description && (
            <p className="text-notion-muted text-sm leading-relaxed mt-1">{description}</p>
          )}
        </div>
        {children && <div>{children}</div>}
      </div>
    </div>
  )
}
