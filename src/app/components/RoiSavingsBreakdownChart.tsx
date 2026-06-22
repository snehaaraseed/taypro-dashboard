"use client";

type SavingsSegment = {
  label: string;
  amount: number;
  color: string;
};

type RoiSavingsBreakdownChartProps = {
  title: string;
  segments: SavingsSegment[];
  total: number;
  formatMoney: (value: number) => string;
};

export function RoiSavingsBreakdownChart({
  title,
  segments,
  total,
  formatMoney,
}: RoiSavingsBreakdownChartProps) {
  return (
    <section className="rounded-lg border border-white/15 bg-[#0a3a4a]/70 p-4 sm:p-5 h-full">
      <h4 className="text-white font-semibold text-sm sm:text-base mb-4">{title}</h4>

      <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-white/15 ring-1 ring-white/10">
        {total > 0
          ? segments.map((segment) => {
              const width = (segment.amount / total) * 100;
              if (width <= 0) return null;
              return (
                <div
                  key={segment.label}
                  className="h-full min-w-[2px] transition-[width] duration-500 ease-out"
                  style={{ width: `${width}%`, backgroundColor: segment.color }}
                  title={`${segment.label}: ${formatMoney(segment.amount)}`}
                />
              );
            })
          : null}
      </div>

      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {segments.map((segment) => {
          const pct = total > 0 ? Math.round((segment.amount / total) * 100) : 0;
          return (
            <li key={segment.label} className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm ring-1 ring-white/25"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-white/90 text-xs font-medium truncate">
                  {segment.label}
                </span>
              </div>
              <p className="text-white/75 text-xs tabular-nums pl-4">
                {formatMoney(segment.amount)} ({pct}%)
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** High-contrast palette for dark calculator cards (not the print-PDF navy/teal). */
export const ROI_SAVINGS_SEGMENT_COLORS = {
  labour: "#7CB9E8",
  water: "#4ECDC4",
  energy: "#A8C117",
} as const;
