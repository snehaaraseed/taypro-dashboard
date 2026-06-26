"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { GenericContactLeadButton } from "@/app/components/GenericContactLeadButton";
import {
  calculateSoilingLoss,
  SOILING_REGION_PRESETS,
} from "@/lib/roi-calculator/calculate-soiling-loss-core";
import { resolveRoiMarket } from "@/lib/roi-calculator/market-profiles";

function formatInr(value: number): string {
  if (value >= 1_00_00_000) {
    return `₹${(value / 1_00_00_000).toFixed(2)} Cr`;
  }
  if (value >= 1_00_000) {
    return `₹${(value / 1_00_000).toFixed(2)} L`;
  }
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function formatMwh(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} GWh`;
  }
  return `${value.toFixed(1)} MWh`;
}

type SoilingLossCalculatorProps = {
  className?: string;
};

export default function SoilingLossCalculator({
  className = "",
}: SoilingLossCalculatorProps) {
  const locale = useLocale();
  const t = useTranslations("SoilingLossCalculatorPage.soilingTool");
  const market = resolveRoiMarket(locale, "IN");

  const [capacityMw, setCapacityMw] = useState(100);
  const [soilingPercent, setSoilingPercent] = useState(12);
  const [tariff, setTariff] = useState(3.5);

  const result = useMemo(
    () =>
      calculateSoilingLoss({
        plantCapacityMW: capacityMw,
        soilingLossPercent: soilingPercent,
        electricityTariff: tariff,
        specificYieldKwhPerKw: market.economics.specificYieldKwhPerKw,
      }),
    [capacityMw, soilingPercent, tariff, market.economics.specificYieldKwhPerKw]
  );

  return (
    <div
      className={`max-w-4xl mx-auto rounded-2xl bg-white p-4 sm:p-6 shadow-lg ring-1 ring-gray-200/80 ${className}`}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-5">
          <div>
            <label
              htmlFor="soiling-capacity"
              className="block text-sm font-medium text-[#052638] mb-1"
            >
              {t("capacityLabel")}
            </label>
            <input
              id="soiling-capacity"
              type="number"
              min={1}
              max={500}
              step={1}
              value={capacityMw}
              onChange={(e) =>
                setCapacityMw(Math.max(1, Number(e.target.value) || 1))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[#052638]"
            />
          </div>

          <div>
            <label
              htmlFor="soiling-percent"
              className="block text-sm font-medium text-[#052638] mb-1"
            >
              {t("soilingLabel")}
            </label>
            <input
              id="soiling-percent"
              type="range"
              min={1}
              max={30}
              step={0.5}
              value={soilingPercent}
              onChange={(e) => setSoilingPercent(Number(e.target.value))}
              className="w-full accent-[#A8C117]"
            />
            <p className="text-sm text-[#27415c] mt-1">
              {soilingPercent}% — {t("soilingHint")}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {SOILING_REGION_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSoilingPercent(preset.percent)}
                  className="text-xs px-2 py-1 rounded-md border border-gray-200 text-[#27415c] hover:border-[#A8C117] hover:text-[#052638]"
                >
                  {t(preset.labelKey)} ({preset.percent}%)
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="soiling-tariff"
              className="block text-sm font-medium text-[#052638] mb-1"
            >
              {t("tariffLabel")}
            </label>
            <input
              id="soiling-tariff"
              type="number"
              min={0.5}
              max={20}
              step={0.1}
              value={tariff}
              onChange={(e) =>
                setTariff(Math.max(0, Number(e.target.value) || 0))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[#052638]"
            />
            <p className="text-xs text-gray-500 mt-1">{t("tariffHint")}</p>
          </div>
        </div>

        <div className="rounded-xl bg-[#f4f7f9] p-5 space-y-4">
          <h3 className="text-[#052638] font-semibold text-lg">{t("resultsHeading")}</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[#27415c]">{t("annualGeneration")}</dt>
              <dd className="font-medium text-[#052638]">
                {formatMwh(result.annualGenerationMwh)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#27415c]">{t("annualLoss")}</dt>
              <dd className="font-medium text-[#c45a00]">
                {formatMwh(result.annualLossMwh)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#27415c]">{t("annualRevenueLoss")}</dt>
              <dd className="font-semibold text-[#052638] text-base">
                {formatInr(result.annualRevenueLoss)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#27415c]">{t("monthlyRevenueLoss")}</dt>
              <dd className="font-medium text-[#052638]">
                {formatInr(result.monthlyRevenueLoss)}
              </dd>
            </div>
          </dl>
          <p className="text-xs text-[#5c6f82] leading-relaxed border-t border-gray-200 pt-3">
            {t("disclaimer")}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <Link
              href="/solar-panel-cleaning-robot-price-calculator#calculator"
              className="inline-flex justify-center px-4 py-2 rounded-lg bg-[#A8C117] text-[#052638] text-sm font-semibold hover:bg-[#b3cf3d]"
            >
              {t("ctaRoi")}
            </Link>
            <GenericContactLeadButton
              source="soiling_calculator"
              analyticsFormType="soiling_study_inquiry"
              className="inline-flex justify-center px-4 py-2 rounded-lg border border-[#052638]/20 text-[#052638] text-sm font-medium hover:border-[#A8C117]"
            >
              {t("ctaStudy")}
            </GenericContactLeadButton>
          </div>
        </div>
      </div>
    </div>
  );
}
