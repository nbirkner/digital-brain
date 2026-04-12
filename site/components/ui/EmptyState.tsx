interface EmptyStateProps {
  icon?: string
  message?: string
  hint?: string
}

export default function EmptyState({
  icon = "✦",
  message = "nothing here yet",
  hint,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center select-none">
      <div className="text-2xl mb-5 text-notion-border opacity-60">{icon}</div>
      <p className="text-notion-muted/70 text-sm font-medium">{message}</p>
      {hint && (
        <p className="text-notion-muted/40 text-xs mt-2 max-w-[240px] leading-relaxed">{hint}</p>
      )}
    </div>
  )
}
