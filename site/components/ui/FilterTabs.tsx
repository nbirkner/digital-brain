"use client"

export interface FilterTab<T extends string = string> {
  id: T
  label: string
}

interface FilterTabsProps<T extends string = string> {
  tabs: FilterTab<T>[]
  active: T
  onChange: (id: T) => void
  className?: string
}

export default function FilterTabs<T extends string>({
  tabs,
  active,
  onChange,
  className = "",
}: FilterTabsProps<T>) {
  return (
    <div className={`flex items-center gap-1 overflow-x-auto scrollbar-none ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`text-xs px-3 py-1.5 rounded-md transition-colors shrink-0 ${
            active === tab.id
              ? "bg-notion-surface border border-notion-border text-notion-text"
              : "text-notion-muted hover:text-notion-text"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
