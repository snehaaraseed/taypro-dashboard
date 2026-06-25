"use client";

type RoiPaybackHorizonBarProps = {
  title: string;
  paybackLabel: string;
  horizonLabel: string;
  yearsUnit: string;
  paybackYears: number;
  horizonYears?: number;
  formatPaybackDuration: (years: number) => string;
};

export function RoiPaybackHorizonBar({
  title,
  paybackLabel,
  horizonLabel,
  yearsUnit,
  paybackYears,
  horizonYears = 20,
  formatPaybackDuration,
}: RoiPaybackHorizonBarProps) {
  const capped = Math.min(Math.max(paybackYears, 0), horizonYears);
  const fillPct = horizonYears > 0 ? (capped / horizonYears) * 100 : 0;

  return (
    <section className="rounded-lg border border-white/15 bg-[#0a3a4a]/70 p-4 sm:p-5 h-full">
      <h3 className="text-white font-semibold text-sm sm:text-base mb-4">{title}</h3>

      <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#A8C117] transition-[width] duration-500 ease-out"
          style={{ width: `${Math.max(fillPct, capped > 0 ? 4 : 0)}%` }}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3 text-xs sm:text-sm">
        <p className="text-white/85">
          <span className="text-white/55">{paybackLabel}: </span>
          <span className="font-semibold text-[#A8C117]">
            {formatPaybackDuration(paybackYears)}
          </span>
        </p>
        <p className="text-white/55 tabular-nums">
          {horizonLabel}: {horizonYears} {yearsUnit}
        </p>
      </div>
    </section>
  );
}
