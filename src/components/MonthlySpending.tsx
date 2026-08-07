const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export type CategorySpend = { name: string; amount: number };

export function MonthlySpending({
  total,
  breakdown,
}: {
  total: number;
  breakdown: CategorySpend[];
}) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-2">
      <h2 className="text-sm font-medium text-neutral-500">This month&rsquo;s spending</h2>
      <p className="text-2xl font-semibold tabular-nums">{currency.format(total)}</p>

      {breakdown.length > 0 && (
        <ul className="space-y-1 pt-1">
          {breakdown.slice(0, 5).map((c) => (
            <li key={c.name} className="flex items-center justify-between gap-2 text-xs text-neutral-400">
              <span className="truncate">{c.name}</span>
              <span className="shrink-0 tabular-nums">{currency.format(c.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
