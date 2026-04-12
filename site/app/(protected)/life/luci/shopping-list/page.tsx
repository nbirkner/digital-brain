import PageHeader from "@/components/PageHeader"
import PagePathStatic from "@/components/PagePathStatic"

const shoppingData = {
  date: "February 24, 2026",
  note: "Remember: 3 separate locations for water, food, cat box.",
  sections: [
    {
      priority: "P0",
      label: "Tonight — Day One Essentials",
      color: "text-red-500",
      bgColor: "bg-red-500/10 border-red-500/20",
      items: [
        { label: "Cat box", checked: true },
        { label: "Food", checked: true },
        { label: "Water", checked: true },
      ],
    },
    {
      priority: "P1",
      label: "First Week",
      color: "text-amber-600",
      bgColor: "bg-amber-500/10 border-amber-500/20",
      items: [
        { label: "Scratcher posts", checked: true },
        { label: "Spray bottle - different one", checked: true },
      ],
    },
    {
      priority: "P2",
      label: "Nice to Have",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10 border-blue-500/20",
      items: [
        { label: "Water fountain", checked: true },
        { label: "High perch", checked: true },
        { label: "Toys", checked: true },
      ],
    },
  ],
}

export default function ShoppingListPage() {
  const totalItems = shoppingData.sections.reduce((sum, s) => sum + s.items.length, 0)
  const checkedItems = shoppingData.sections.reduce(
    (sum, s) => sum + s.items.filter((i) => i.checked).length,
    0
  )

  return (
    <div>
      <PagePathStatic path="life/luci/shopping-list" />

      <PageHeader
        icon="🛒"
        title="Shopping List"
        description={`Luci's adoption day shopping list — ${shoppingData.date}`}
      />

      {/* Progress summary */}
      <div className="bg-notion-surface border border-notion-border rounded-xl p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-notion-muted">All items acquired</p>
          <p className="text-xs text-notion-muted/60 mt-0.5">{shoppingData.note}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-green-400">
            {checkedItems}/{totalItems}
          </p>
          <p className="text-xs text-notion-muted">complete</p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {shoppingData.sections.map((section) => (
          <div key={section.priority} className={`border rounded-xl p-5 ${section.bgColor}`}>
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${section.color} border-current/30`}>
                {section.priority}
              </span>
              <h2 className="text-sm font-semibold text-notion-text">{section.label}</h2>
              <span className="ml-auto text-xs text-notion-muted/60">
                {section.items.filter((i) => i.checked).length}/{section.items.length}
              </span>
            </div>
            <div className="space-y-3">
              {section.items.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                      item.checked
                        ? "bg-green-500/20 border-green-500/60"
                        : "border-notion-border"
                    }`}
                  >
                    {item.checked && <span className="text-green-400 text-xs">✓</span>}
                  </div>
                  <span
                    className={`text-sm ${
                      item.checked ? "text-notion-muted line-through" : "text-notion-text"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
