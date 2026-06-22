"use client";

import { useId, useMemo, useState } from "react";
import type { RoiProjectionSeries } from "@/lib/roi-calculator/roi-types";

type RoiNetPositionChartProps = {
  projection: RoiProjectionSeries;
  formatMoney: (value: number) => string;
  formatPaybackDuration: (years: number) => string;
  labels: {
    heading: string;
    netPosition: string;
    breakEven: string;
    year: string;
  };
};

const YEAR_MIN = 0;
const YEAR_MAX = 20;
const WIDTH = 640;
const HEIGHT = 220;
const PAD = { top: 36, right: 20, bottom: 42, left: 52 };

const COLORS = {
  positive: "#A8C117",
  negative: "#F87171",
  zero: "rgba(255,255,255,0.35)",
  grid: "rgba(255,255,255,0.12)",
  axis: "rgba(255,255,255,0.55)",
};

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

export function RoiNetPositionChart({
  projection,
  formatMoney,
  formatPaybackDuration,
  labels,
}: RoiNetPositionChartProps) {
  const gradientId = useId();
  const [hoverYear, setHoverYear] = useState<number | null>(null);

  const points = useMemo(
    () =>
      projection.years.map((p) => ({
        year: p.year,
        net: p.cumulativeSavings - p.cumulativeCost,
        savings: p.cumulativeSavings,
        cost: p.cumulativeCost,
      })),
    [projection.years]
  );

  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;

  const { paybackYear } = projection;
  const activeYear = hoverYear ?? points[points.length - 1]?.year ?? YEAR_MAX;
  const activePoint =
    points.find((p) => p.year === activeYear) ?? points[points.length - 1];

  const valueMin = Math.min(...points.map((p) => p.net), 0);
  const valueMax = Math.max(...points.map((p) => p.net), 1);
  const padding = (valueMax - valueMin) * 0.08 || 1;
  const domainMin = valueMin - padding;
  const domainMax = valueMax + padding;

  const xForYear = (year: number) =>
    PAD.left + scaleLinear(year, [YEAR_MIN, YEAR_MAX], [0, plotW]);

  const yValue = (value: number) =>
    PAD.top + scaleLinear(value, [domainMin, domainMax], [plotH, 0]);

  const yZero = yValue(0);

  const linePath = points
    .map((point, index) => {
      const x = xForYear(point.year);
      const y = yValue(point.net);
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

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
          {labels.breakEven}: {formatPaybackDuration(paybackYear)}
        </p>
      ) : (
        <div className="mb-4" />
      )}

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
              <stop offset="0%" stopColor="rgba(168,193,23,0.2)" />
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
            const value = domainMax - ((domainMax - domainMin) / moneyTicks) * i;
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

          <line
            x1={PAD.left}
            x2={PAD.left + plotW}
            y1={yZero}
            y2={yZero}
            stroke={COLORS.zero}
            strokeWidth={1}
            strokeDasharray="4 4"
          />

          <path
            d={`${linePath} L${xForYear(YEAR_MAX)},${yZero} L${xForYear(YEAR_MIN)},${yZero} Z`}
            fill={`url(#${gradientId})`}
            opacity={0.5}
          />

          <path
            d={linePath}
            fill="none"
            stroke={COLORS.positive}
            strokeWidth={2.5}
          />

          {paybackYear != null ? (
            <>
              <line
                x1={xForYear(paybackYear)}
                x2={xForYear(paybackYear)}
                y1={PAD.top}
                y2={PAD.top + plotH}
                stroke="rgba(255,255,255,0.35)"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <circle
                cx={xForYear(paybackYear)}
                cy={yZero}
                r={5}
                fill={COLORS.positive}
                stroke="#052638"
                strokeWidth={1.5}
              />
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
                cy={yValue(activePoint.net)}
                r={4}
                fill={activePoint.net >= 0 ? COLORS.positive : COLORS.negative}
              />
            </>
          ) : null}
        </svg>

        {activePoint ? (
          <div className="mt-3 rounded-md border border-white/10 bg-[#052638]/80 p-3 text-xs sm:text-sm">
            <p className="text-white/70 font-medium mb-2">
              {labels.year} {activePoint.year}
            </p>
            <p
              className={
                activePoint.net >= 0 ? "text-[#A8C117]" : "text-red-400"
              }
            >
              {labels.netPosition}: {formatMoney(activePoint.net)}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
