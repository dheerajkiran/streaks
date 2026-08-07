const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export type CategorySpend = { name: string; amount: number };

export function CategorySpendBreakdown({ items }: { items: CategorySpend[] }) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
      <h2 className="text-sm font-medium text-neutral-500">Spending by category · this month</h2>

      {items.length === 0 ? (
        <p className="text-sm text-neutral-400">No spending yet this month.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const max = items[0].amount;
            const widthPct = max > 0 ? Math.max((item.amount / max) * 100, 3) : 0;
            return (
              <div
                key={item.name}
                className="flex items-center gap-3"
                title={`${item.name}: ${currency.format(item.amount)}`}
              >
                <span className="w-24 shrink-0 truncate text-sm text-neutral-600 dark:text-neutral-300">
                  {item.name}
                </span>
                <div className="h-3 flex-1 overflow-hidden rounded-r-[4px] bg-neutral-100 dark:bg-neutral-900">
                  <div
                    className="h-full rounded-r-[4px] bg-[#2a78d6] dark:bg-[#3987e5]"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right text-sm font-medium tabular-nums">
                  {currency.format(item.amount)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
