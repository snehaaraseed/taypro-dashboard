"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  calculateOpexCost,
  OPEX_CYCLES_PER_MONTH_MAX,
  OPEX_CYCLES_PER_MONTH_MIN,
  OPEX_RATE_MAX_INR,
  OPEX_RATE_MIN_INR,
} from "@/lib/roi-calculator/calculate-opex-core";
import { formatRoiCurrency } from "@/lib/roi-calculator/format-roi";
import { resolveRoiMarket } from "@/lib/roi-calculator/market-profiles";

const SAMPLE_PLANTS = [
  { mw: 25, labelKey: "plant25" as const },
  { mw: 50, labelKey: "plant50" as const },
  { mw: 100, labelKey: "plant100" as const },
  { mw: 300, labelKey: "plant300" as const },
] as const;

const MODULE_WP = 540;
const CYCLES = 6;
const INSTALLATION = "fixedTilt" as const;

export default function OpexPricingTable() {
  const t = useTranslations("SolarCleaningOpexPricingPage.opexTable");
  const locale = useLocale();
  const market = resolveRoiMarket(locale, "IN");

  const rows = useMemo(
    () =>
      SAMPLE_PLANTS.map(({ mw, labelKey }) => {
        const result = calculateOpexCost({
          plantCapacityMW: mw,
          moduleCapacityWp: MODULE_WP,
          installationType: INSTALLATION,
          cleaningCyclesPerMonth: CYCLES,
        });
        const perMwMonthly = result.monthlyOpex / mw;
        return {
          labelKey,
          mw,
          modules: result.moduleCount,
          rate: result.ratePerModulePerCycle,
          monthly: result.monthlyOpex,
          annual: result.annualOpex,
          perMwMonthly,
          minimumApplied: result.minimumApplied,
        };
      }),
    []
  );

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full min-w-[640px] text-sm text-left">
        <thead>
          <tr className="bg-[#052638] text-white">
            <th className="px-4 py-3 font-semibold">{t("colPlant")}</th>
            <th className="px-4 py-3 font-semibold">{t("colModules")}</th>
            <th className="px-4 py-3 font-semibold">{t("colRate")}</th>
            <th className="px-4 py-3 font-semibold">{t("colMonthly")}</th>
            <th className="px-4 py-3 font-semibold">{t("colPerMw")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.mw}
              className="border-t border-gray-100 even:bg-[#f8fafb]"
            >
              <td className="px-4 py-3 font-medium text-[#052638]">
                {t(row.labelKey)}
              </td>
              <td className="px-4 py-3 text-[#27415c]">
                {row.modules.toLocaleString(locale)}
              </td>
              <td className="px-4 py-3 text-[#27415c]">
                ₹{row.rate.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-[#27415c]">
                {formatRoiCurrency(row.monthly, market, locale)}
                {row.minimumApplied ? (
                  <span className="block text-xs text-[#5c6f82]">
                    {t("minimumNote")}
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-3 font-medium text-[#052638]">
                {formatRoiCurrency(row.perMwMonthly, market, locale)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-4 py-3 text-xs text-[#5c6f82] border-t border-gray-100 bg-[#f8fafb]">
        {t("footnote", {
          minRate: OPEX_RATE_MIN_INR.toFixed(2),
          maxRate: OPEX_RATE_MAX_INR.toFixed(2),
          minCycles: OPEX_CYCLES_PER_MONTH_MIN,
          maxCycles: OPEX_CYCLES_PER_MONTH_MAX,
          cycles: CYCLES,
          moduleWp: MODULE_WP,
        })}
      </p>
    </div>
  );
}
