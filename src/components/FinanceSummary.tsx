const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function FinanceSummary({ total, thisMonth }: { total: number; thisMonth: number }) {
  const cards = [
    { label: "This month", value: thisMonth },
    { label: "Total spent", value: total },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
        >
          <p className="text-sm font-medium text-neutral-500">{card.label}</p>
          <p className="text-2xl font-semibold mt-1">{currency.format(card.value)}</p>
        </div>
      ))}
    </div>
  );
}
