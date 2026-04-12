import Link from "next/link"

export default function StatBadge({
  label,
  value,
  href,
  accent = false,
}: {
  label: string
  value: number
  href: string
  accent?: boolean
}) {
  return (
    <Link
      href={href}
      className="flex items-baseline gap-1.5 hover:opacity-75 transition-opacity"
    >
      <span
        className="text-lg font-semibold tabular-nums"
        style={{ color: accent ? "var(--notion-accent)" : "var(--notion-text)" }}
      >
        {value}
      </span>
      <span className="text-xs text-notion-muted">{label}</span>
    </Link>
  )
}
