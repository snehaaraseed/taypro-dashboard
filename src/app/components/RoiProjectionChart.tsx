"use client";

import { useId, useMemo, useState } from "react";
import type { RoiProjectionSeries } from "@/lib/roi-calculator/roi-types";

type RoiProjectionChartProps = {
  projection: RoiProjectionSeries;
  formatMoney: (value: number) => string;
  formatNumber: (value: number, digits?: number) => string;
  formatPaybackDuration: (years: number) => string;
  labels: {
    heading: string;
    savings: string;
    investment: string;
    payback: string;
    year: string;
  };
};

const COLORS = {
  savings: "#A8C117",
  investment: "#F59E0B",
  payback: "#FFFFFF",
  grid: "rgba(255,255,255,0.12)",
  axis: "rgba(255,255,255,0.55)",
};

const YEAR_MIN = 0;
const YEAR_MAX = 20;
const WIDTH = 640;
const HEIGHT = 280;
const PAD = { top: 40, right: 20, bottom: 42, left: 52 };

function scaleLinear(
  value: number,
  domain: [number, number],
  range: [number, number]
): number {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  if (d1 === d0) return (r0 + r1) / 2;
  return r0 + ((value - d0) / (d1 - d0)) * (r1 - r0);
}

export function RoiProjectionChart({
  projection,
  formatMoney,
  formatNumber,
  formatPaybackDuration,
  labels,
}: RoiProjectionChartProps) {
  const gradientId = useId();
  const [hoverYear, setHoverYear] = useState<number | null>(null);

  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;

  const { years, paybackYear } = projection;
  const activeYear = hoverYear ?? years[years.length - 1]?.year ?? 20;
  const activePoint = years.find((p) => p.year === activeYear) ?? years[years.length - 1];

  const moneyMax = useMemo(
    () =>
      Math.max(
        ...years.flatMap((p) => [p.cumulativeSavings, p.cumulativeCost]),
        1
      ),
    [years]
  );

  const xForYear = (year: number) =>
    PAD.left + scaleLinear(year, [YEAR_MIN, YEAR_MAX], [0, plotW]);

  const yMoney = (value: number) =>
    PAD.top + scaleLinear(value, [0, moneyMax], [plotH, 0]);

  const linePath = (accessor: (p: (typeof years)[number]) => number) =>
    years
      .map((point, index) => {
        const x = xForYear(point.year);
        const y = yMoney(accessor(point));
        return `${index === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");

  const valueAtPayback = (accessor: (p: (typeof years)[number]) => number) => {
    if (paybackYear == null || years.length === 0) return 0;
    const y0 = Math.max(YEAR_MIN, Math.min(YEAR_MAX, Math.floor(paybackYear)));
    const y1 = Math.min(YEAR_MAX, y0 + 1);
    const p0 = years.find((p) => p.year === y0) ?? years[0];
    const p1 = years.find((p) => p.year === y1) ?? years[years.length - 1];
    const t = paybackYear - y0;
    return accessor(p0) + (accessor(p1) - accessor(p0)) * t;
  };
  const onPointer = (clientX: number, rect: DOMRect) => {
    const x = ((clientX - rect.left) / rect.width) * WIDTH;
    const year = Math.round(
      scaleLinear(x, [PAD.left, PAD.left + plotW], [YEAR_MIN, YEAR_MAX])
    );
    setHoverYear(Math.min(YEAR_MAX, Math.max(YEAR_MIN, year)));
  };

  const moneyTicks = 4;

  return (
    <section className="mt-6 rounded-lg border border-white/15 bg-[#0a3a4a]/70 p-4 sm:p-5">
      <h4 className="text-white font-semibold text-base sm:text-lg mb-1">
        {labels.heading}
      </h4>
      {paybackYear != null ? (
        <p className="text-white/55 text-xs mb-4">
          {labels.payback}: {formatPaybackDuration(paybackYear)}
        </p>
      ) : (
        <div className="mb-4" />
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs mb-3">
        <span className="inline-flex items-center gap-1.5 text-white/85">
          <span className="h-0.5 w-4 rounded" style={{ background: COLORS.savings }} />
          {labels.savings}
        </span>
        <span className="inline-flex items-center gap-1.5 text-white/85">
          <span className="h-0.5 w-4 rounded" style={{ background: COLORS.investment }} />
          {labels.investment}
        </span>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full min-w-[280px] touch-none select-none"
          role="img"
          aria-label={labels.heading}
          onMouseLeave={() => setHoverYear(null)}
          onMouseMove={(event) => {
            onPointer(event.clientX, event.currentTarget.getBoundingClientRect());
          }}
          onTouchStart={(event) => {
            const touch = event.touches[0];
            if (!touch) return;
            onPointer(touch.clientX, event.currentTarget.getBoundingClientRect());
          }}
          onTouchMove={(event) => {
            const touch = event.touches[0];
            if (!touch) return;
            onPointer(touch.clientX, event.currentTarget.getBoundingClientRect());
          }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(168,193,23,0.18)" />
              <stop offset="100%" stopColor="rgba(168,193,23,0)" />
            </linearGradient>
          </defs>

          {Array.from({ length: moneyTicks + 1 }, (_, i) => {
            const y = PAD.top + (plotH / moneyTicks) * i;
            return (
              <line
                key={`grid-${i}`}
                x1={PAD.left}
                x2={PAD.left + plotW}
                y1={y}
                y2={y}
                stroke={COLORS.grid}
              />
            );
          })}

          {Array.from({ length: moneyTicks + 1 }, (_, i) => {
            const value = moneyMax - (moneyMax / moneyTicks) * i;
            const y = PAD.top + (plotH / moneyTicks) * i;
            return (
              <text
                key={`money-tick-${i}`}
                x={PAD.left - 8}
                y={y + 4}
                textAnchor="end"
                fill={COLORS.axis}
                fontSize="9"
              >
                {formatMoney(value)}
              </text>
            );
          })}

          {[0, 5, 10, 15, 20].map((year) => (
            <text
              key={`year-${year}`}
              x={xForYear(year)}
              y={HEIGHT - 14}
              textAnchor="middle"
              fill={COLORS.axis}
              fontSize="9"
            >
              {year}
            </text>
          ))}

          <path
            d={`${linePath((p) => p.cumulativeSavings)} L${xForYear(YEAR_MAX)},${PAD.top + plotH} L${xForYear(YEAR_MIN)},${PAD.top + plotH} Z`}
            fill={`url(#${gradientId})`}
            opacity={0.65}
          />

          <path
            d={linePath((p) => p.cumulativeSavings)}
            fill="none"
            stroke={COLORS.savings}
            strokeWidth={2.5}
          />
          <path
            d={linePath((p) => p.cumulativeCost)}
            fill="none"
            stroke={COLORS.investment}
            strokeWidth={2.5}
          />

          {paybackYear != null ? (
            <>
              <line
                x1={xForYear(paybackYear)}
                x2={xForYear(paybackYear)}
                y1={PAD.top}
                y2={PAD.top + plotH}
                stroke={COLORS.payback}
                strokeWidth={1.25}
                strokeDasharray="4 4"
                opacity={0.9}
              />
              <circle
                cx={xForYear(paybackYear)}
                cy={yMoney(valueAtPayback((p) => p.cumulativeSavings))}
                r={5}
                fill={COLORS.savings}
                stroke="#052638"
                strokeWidth={1.5}
              />
              <circle
                cx={xForYear(paybackYear)}
                cy={yMoney(valueAtPayback((p) => p.cumulativeCost))}
                r={5}
                fill={COLORS.investment}
                stroke="#052638"
                strokeWidth={1.5}
              />
              <text
                x={xForYear(paybackYear)}
                y={PAD.top - 10}
                textAnchor="middle"
                fill={COLORS.payback}
                fontSize="9"
                fontWeight="600"
              >
                <tspan x={xForYear(paybackYear)}>ROI</tspan>
                <tspan
                  x={xForYear(paybackYear)}
                  dy="11"
                  fontSize="8"
                  fontWeight="500"
                >
                  {formatPaybackDuration(paybackYear)}
                </tspan>
              </text>
            </>
          ) : null}

          {activePoint ? (
            <>
              <line
                x1={xForYear(activePoint.year)}
                x2={xForYear(activePoint.year)}
                y1={PAD.top}
                y2={PAD.top + plotH}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth={1}
              />
              <circle
                cx={xForYear(activePoint.year)}
                cy={yMoney(activePoint.cumulativeSavings)}
                r={4}
                fill={COLORS.savings}
              />
              <circle
                cx={xForYear(activePoint.year)}
                cy={yMoney(activePoint.cumulativeCost)}
                r={4}
                fill={COLORS.investment}
              />
            </>
          ) : null}
        </svg>

        {activePoint ? (
          <div className="mt-3 grid gap-2 rounded-md border border-white/10 bg-[#052638]/80 p-3 text-xs sm:grid-cols-2 sm:text-sm">
            <p className="sm:col-span-2 text-white/70 font-medium">
              {labels.year} {activePoint.year}
            </p>
            <p className="text-white/80">
              <span className="text-[#A8C117]">{labels.savings}:</span>{" "}
              {formatMoney(activePoint.cumulativeSavings)}
            </p>
            <p className="text-white/80">
              <span className="text-amber-400">{labels.investment}:</span>{" "}
              {formatMoney(activePoint.cumulativeCost)}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
