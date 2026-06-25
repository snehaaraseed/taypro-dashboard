"use client";

import type { RoiProjectionSeries } from "@/lib/roi-calculator/roi-types";

type RoiYear20SnapshotProps = {
  projection: RoiProjectionSeries;
  formatMoney: (value: number) => string;
  labels: {
    heading: string;
    netPosition: string;
    cumulativeSavings: string;
    cumulativeInvestment: string;
  };
};

export function RoiYear20Snapshot({
  projection,
  formatMoney,
  labels,
}: RoiYear20SnapshotProps) {
  const year20 =
    projection.years.find((p) => p.year === 20) ??
    projection.years[projection.years.length - 1];

  if (!year20) return null;

  const net = year20.cumulativeSavings - year20.cumulativeCost;

  return (
    <section className="mt-4 rounded-lg border border-[#A8C117]/25 bg-[#0f4a5c]/80 p-4">
      <h3 className="text-white/80 text-sm font-semibold mb-3">{labels.heading}</h3>
      <dl className="grid gap-3 sm:grid-cols-3 text-sm">
        <div>
          <dt className="text-white/55 text-xs mb-1">{labels.netPosition}</dt>
          <dd
            className={`font-semibold tabular-nums ${
              net >= 0 ? "text-[#A8C117]" : "text-red-400"
            }`}
          >
            {formatMoney(net)}
          </dd>
        </div>
        <div>
          <dt className="text-white/55 text-xs mb-1">{labels.cumulativeSavings}</dt>
          <dd className="text-white font-semibold tabular-nums">
            {formatMoney(year20.cumulativeSavings)}
          </dd>
        </div>
        <div>
          <dt className="text-white/55 text-xs mb-1">{labels.cumulativeInvestment}</dt>
          <dd className="text-amber-400 font-semibold tabular-nums">
            {formatMoney(year20.cumulativeCost)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
