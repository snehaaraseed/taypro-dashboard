"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useLocale, useTranslations } from "next-intl";
import { calculateRoi } from "@/lib/roi-calculator/calculate-roi";
import {
  resolveRoiMarket,
  type RoiMarketProfile,
} from "@/lib/roi-calculator/market-profiles";
import { useVisitorCountry } from "@/lib/roi-calculator/use-visitor-country";
import { isActiveLocale } from "@/i18n/markets";

export interface ROIResults {
  annualCostLabourSaved: number;
  annualCostWaterSaved: number;
  annualCostEnergyGain: number;
  totalMoneySavedAnnually: number;
  totalInvestmentRequired: number;
  roiTimeline: number;
  annualisedROI: number;
  roi20Years: number;
  waterSavedAnnually: number;
  annualCarbonSavings: number;
}

type PlantType = "groundMount" | "rooftop";
type InstallationType = "fixedTilt" | "seasonalTilt" | "singleAxisTracker";
type AutomationLevel = "automatic" | "semiAutomatic";

type ROICalculatorProps = {
  /** Hide the internal card title when the host page provides its own heading */
  hideTitle?: boolean;
  className?: string;
};

const inputClassName =
  "w-full p-2.5 bg-[#0f4a5c] text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#A8C117]/80 focus:border-transparent transition";

const primaryButtonClassName =
  "w-full mt-6 bg-[#A8C117] hover:bg-[#98B015] text-[#052638] font-semibold py-3 px-6 rounded-lg transition-colors duration-200 cursor-pointer";

const PLANT_TYPE_OPTIONS: { value: PlantType; labelKey: string }[] = [
  { value: "groundMount", labelKey: "plantTypeGroundMount" },
  { value: "rooftop", labelKey: "plantTypeRooftop" },
];

const INSTALLATION_OPTIONS: { value: InstallationType; labelKey: string }[] = [
  { value: "fixedTilt", labelKey: "installationFixedTilt" },
  { value: "seasonalTilt", labelKey: "installationSeasonalTilt" },
  { value: "singleAxisTracker", labelKey: "installationSingleAxis" },
];

const AUTOMATION_OPTIONS: { value: AutomationLevel; labelKey: string }[] = [
  { value: "automatic", labelKey: "automationAutomatic" },
  { value: "semiAutomatic", labelKey: "automationSemiAutomatic" },
];

const NUMBER_LOCALE: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  ar: "ar",
  ja: "ja-JP",
  bn: "bn-IN",
};

function numberLocale(locale: string, market: RoiMarketProfile): string {
  if (market.currency !== "INR") return market.formatLocale;
  return NUMBER_LOCALE[locale] ?? "en-IN";
}

export default function ROITayproCalculator({
  hideTitle = false,
  className = "",
}: ROICalculatorProps) {
  const t = useTranslations("PriceCalculatorPage.calculator");
  const locale = useLocale();
  const visitorCountry = useVisitorCountry();
  const market = useMemo(
    () =>
      resolveRoiMarket(
        isActiveLocale(locale) ? locale : "en",
        visitorCountry
      ),
    [locale, visitorCountry]
  );
  const fmtLocale = numberLocale(locale, market);
  const showMarketNote = market.id !== "india";
  const regionName = showMarketNote ? t(market.regionLabelKey) : "";

  const doc = useRef<jsPDF | null>(null);
  if (!doc.current) {
    doc.current = new jsPDF({ unit: "pt", format: "a4" });
  }

  const [formData, setFormData] = useState(() => ({
    plantType: "groundMount" as PlantType,
    installationType: "fixedTilt" as InstallationType,
    automationLevel: "automatic" as AutomationLevel,
    plantCapacityMW: 200,
    plantCapacityKW: 200,
    electricityTariff: market.defaultTariffGround,
    moduleCapacity: 545,
  }));

  const [results, setResults] = useState<ROIResults>({
    annualCostLabourSaved: 0,
    annualCostWaterSaved: 0,
    annualCostEnergyGain: 0,
    totalMoneySavedAnnually: 0,
    totalInvestmentRequired: 0,
    roiTimeline: 0,
    annualisedROI: 0,
    roi20Years: 0,
    waterSavedAnnually: 0,
    annualCarbonSavings: 0,
  });

  const [showResults, setShowResults] = useState(false);
  const tariffTouchedRef = useRef(false);

  const defaultTariffForPlant = (plantType: PlantType) =>
    plantType === "groundMount"
      ? market.defaultTariffGround
      : market.defaultTariffRooftop;

  // Plant-type toggle always applies fresh defaults for that type.
  useEffect(() => {
    tariffTouchedRef.current = false;
    setFormData((prev) => ({
      ...prev,
      electricityTariff: defaultTariffForPlant(prev.plantType),
    }));
    // Only re-run when the user switches ground ↔ rooftop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.plantType]);

  // Geo/locale market resolution: apply defaults once, do not wipe a custom tariff.
  useEffect(() => {
    if (tariffTouchedRef.current) return;
    setFormData((prev) => ({
      ...prev,
      electricityTariff: defaultTariffForPlant(prev.plantType),
    }));
  }, [market.id, market.defaultTariffGround, market.defaultTariffRooftop]);

  const runCalculation = () => {
    const next = calculateRoi(
      {
        plantType: formData.plantType,
        installationType: formData.installationType,
        automationLevel: formData.automationLevel,
        plantCapacityMW: formData.plantCapacityMW,
        plantCapacityKW: formData.plantCapacityKW,
        electricityTariff: formData.electricityTariff,
        moduleCapacityWp: formData.moduleCapacity,
      },
      market
    );
    setResults(next);
    setShowResults(true);
  };

  const handleInput = (field: keyof typeof formData, value: unknown) => {
    if (field === "electricityTariff") tariffTouchedRef.current = true;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(fmtLocale, {
      style: "currency",
      currency: market.currency,
      maximumFractionDigits: market.moneyMaxFractionDigits,
    }).format(amount);

  const pdfFormatCurrency = (amount: number) =>
    new Intl.NumberFormat(fmtLocale, {
      minimumFractionDigits: market.moneyMaxFractionDigits,
      maximumFractionDigits: market.moneyMaxFractionDigits,
    }).format(amount);

  const formatNumber = (v: number) =>
    new Intl.NumberFormat(fmtLocale, {
      maximumFractionDigits: 2,
    }).format(v);

  const labelForPlantType = (value: PlantType) =>
    t(PLANT_TYPE_OPTIONS.find((o) => o.value === value)!.labelKey);
  const labelForInstallation = (value: InstallationType) =>
    t(INSTALLATION_OPTIONS.find((o) => o.value === value)!.labelKey);
  const labelForAutomation = (value: AutomationLevel) =>
    t(AUTOMATION_OPTIONS.find((o) => o.value === value)!.labelKey);

  const handleDownloadPdf = () => {
    const {
      plantType,
      installationType,
      automationLevel,
      plantCapacityMW,
      plantCapacityKW,
      electricityTariff,
      moduleCapacity,
    } = formData;

    const pdf = new jsPDF({ unit: "pt", format: "a4" });

    pdf.addImage(
      "/tayproasset/taypro-logoforwhitebg.png",
      "PNG",
      40,
      30,
      80,
      40
    );
    pdf.setFontSize(18);
    pdf.setTextColor("#052638");
    pdf.text(t("pdfTitle"), 140, 55);

    let y = 100;

    pdf.setFontSize(14);
    pdf.text(t("pdfInputs"), 40, y);
    y += 10;

    const inputRows: (string | number)[][] = [
      [t("plantType"), labelForPlantType(plantType)],
      ...(plantType === "groundMount"
        ? [[t("installationType"), labelForInstallation(installationType)]]
        : []),
      [t("automationLevel"), labelForAutomation(automationLevel)],
      [
        plantType === "groundMount"
          ? t("pdfPlantCapacityMw")
          : t("pdfPlantCapacityKw"),
        plantType === "groundMount" ? plantCapacityMW : plantCapacityKW,
      ],
      [
        `${t("pdfElectricityTariff")} (${market.currency}/kWh)`,
        electricityTariff,
      ],
      [t("pdfModuleCapacity"), moduleCapacity],
    ];

    autoTable(pdf, {
      startY: y + 10,
      head: [[t("pdfParameter"), t("pdfValue")]],
      body: inputRows,
      theme: "grid",
      headStyles: {
        fillColor: [5, 38, 56],
        textColor: 255,
        halign: "center",
      },
      styles: { fontSize: 11, cellPadding: 5 },
    });

    const pdfMoney = (amount: number) =>
      `${market.currency} ${pdfFormatCurrency(amount)}`;

    const resultsRows = [
      [t("resultInvestment"), pdfMoney(results.totalInvestmentRequired)],
      [
        t("resultRoiTimeline"),
        `${formatNumber(results.roiTimeline)} ${t("yearsCapitalized")}`,
      ],
      [
        t("resultAnnualisedRoi"),
        `${formatNumber(results.annualisedROI)} %`,
      ],
      [
        t("resultRoi20Years"),
        `${formatNumber(results.roi20Years)} %`,
      ],
      [t("resultTotalSaved"), pdfMoney(results.totalMoneySavedAnnually)],
      [t("resultLabourSaved"), pdfMoney(results.annualCostLabourSaved)],
      [t("resultWaterSaved"), pdfMoney(results.annualCostWaterSaved)],
      [t("resultEnergyGain"), pdfMoney(results.annualCostEnergyGain)],
      [
        t("resultWaterLiters"),
        `${formatNumber(results.waterSavedAnnually)} L`,
      ],
      [
        t("resultCarbon"),
        `${formatNumber(results.annualCarbonSavings)} ${t("pdfCarbonUnit")}`,
      ],
    ];

    autoTable(pdf, {
      head: [[t("pdfParameter"), t("pdfValue")]],
      body: resultsRows,
      theme: "grid",
      headStyles: {
        fillColor: [5, 38, 56],
        textColor: 255,
        halign: "center",
      },
      styles: { fontSize: 11, cellPadding: 5 },
    });

    pdf.save("ROI-Report.pdf");
  };

  return (
    <div className={`w-full ${className}`.trim()}>
      <div className="bg-[#052638] rounded-xl p-6 sm:p-8 mb-6">
        {!hideTitle && (
          <h2 className="text-white text-2xl font-semibold mb-4">{t("title")}</h2>
        )}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="roi-plant-type"
              className="text-white/90 text-sm font-medium mb-1.5 block"
            >
              {t("plantType")}
            </label>
            <select
              id="roi-plant-type"
              value={formData.plantType}
              onChange={(e) =>
                handleInput("plantType", e.target.value as PlantType)
              }
              className={inputClassName}
            >
              {PLANT_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {t(o.labelKey)}
                </option>
              ))}
            </select>
          </div>

          {formData.plantType === "groundMount" && (
            <div>
              <label
                htmlFor="roi-installation-type"
                className="text-white mb-1 block"
              >
                {t("installationType")}
              </label>
              <select
                id="roi-installation-type"
                value={formData.installationType}
                onChange={(e) =>
                  handleInput(
                    "installationType",
                    e.target.value as InstallationType
                  )
                }
                className={inputClassName}
              >
                {INSTALLATION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {t(o.labelKey)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label
              htmlFor="roi-automation-level"
              className="text-white mb-1 block"
            >
              {t("automationLevel")}
            </label>
            <select
              id="roi-automation-level"
              value={formData.automationLevel}
              onChange={(e) =>
                handleInput("automationLevel", e.target.value as AutomationLevel)
              }
              className={inputClassName}
            >
              {AUTOMATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {t(o.labelKey)}
                </option>
              ))}
            </select>
          </div>

          {formData.plantType === "groundMount" ? (
            <div>
              <label
                htmlFor="roi-capacity-mw"
                className="text-white mb-1 block"
              >
                {t("plantCapacityMw")}
              </label>
              <input
                id="roi-capacity-mw"
                type="number"
                value={formData.plantCapacityMW}
                onChange={(e) =>
                  handleInput(
                    "plantCapacityMW",
                    Math.max(
                      1,
                      Math.min(10000, parseFloat(e.target.value) || 0)
                    )
                  )
                }
                min={1}
                max={10000}
                className={inputClassName}
              />
              <div className="text-gray-400 text-xs">{t("minMaxMw")}</div>
            </div>
          ) : (
            <div>
              <label
                htmlFor="roi-capacity-kw"
                className="text-white mb-1 block"
              >
                {t("plantCapacityKw")}
              </label>
              <input
                id="roi-capacity-kw"
                type="number"
                value={formData.plantCapacityKW}
                onChange={(e) =>
                  handleInput(
                    "plantCapacityKW",
                    Math.max(
                      100,
                      Math.min(10000, parseFloat(e.target.value) || 0)
                    )
                  )
                }
                min={100}
                max={10000}
                className={inputClassName}
              />
              <div className="text-gray-400 text-xs">{t("minMaxKw")}</div>
            </div>
          )}

          <div>
            <label
              htmlFor="roi-electricity-tariff"
              className="text-white mb-1 block"
            >
              {t("electricityTariffLabel")} ({market.currency}/kWh)
            </label>
            <input
              id="roi-electricity-tariff"
              type="number"
              step={market.tariffStep}
              value={formData.electricityTariff}
              onChange={(e) =>
                handleInput(
                  "electricityTariff",
                  Math.max(
                    market.tariffMin,
                    Math.min(
                      market.tariffMax,
                      parseFloat(e.target.value) || 0
                    )
                  )
                )
              }
              min={market.tariffMin}
              max={market.tariffMax}
              className={inputClassName}
            />
            <div className="text-gray-400 text-xs">
              {t("minMaxTariff", {
                min: market.tariffMin,
                max: market.tariffMax,
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="roi-module-capacity"
              className="text-white mb-1 block"
            >
              {t("moduleCapacity")}
            </label>
            <input
              id="roi-module-capacity"
              type="number"
              value={formData.moduleCapacity}
              onChange={(e) =>
                handleInput(
                  "moduleCapacity",
                  Math.max(1, Math.min(1000, parseFloat(e.target.value) || 0))
                )
              }
              min={1}
              max={1000}
              className={inputClassName}
            />
            <div className="text-gray-400 text-xs">{t("minMaxModule")}</div>
          </div>
        </div>

        <button type="button" onClick={runCalculation} className={primaryButtonClassName}>
          {t("calculateButton")}
        </button>
      </div>

      {showResults && (
        <div className="bg-[#052638] rounded-xl p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white text-2xl font-semibold">
              {t("resultsHeading")}
            </h3>
            <button
              type="button"
              className="text-white/80 text-sm hover:text-[#A8C117] transition"
              onClick={() => setShowResults(false)}
              aria-label={t("collapseResults")}
            >
              {t("hideResults")}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="rounded-lg bg-[#0f4a5c] border-2 border-[#A8C117] p-4">
              <p className="text-white/70 text-sm mb-1">{t("highlightInvestment")}</p>
              <p className="text-[#A8C117] text-2xl sm:text-3xl font-semibold">
                {formatCurrency(results.totalInvestmentRequired)}
              </p>
              <p className="text-white/55 text-xs mt-2">{t("investmentDisclaimer")}</p>
              {showMarketNote ? (
                <p className="text-white/45 text-xs mt-1">
                  {t("marketAssumptionsNote", {
                    region: regionName,
                    currency: market.currency,
                  })}
                </p>
              ) : null}
            </div>
            <div className="rounded-lg bg-[#0f4a5c] border border-[#A8C117]/30 p-4">
              <p className="text-white/70 text-sm mb-1">{t("paybackTimeline")}</p>
              <p className="text-[#A8C117] text-2xl font-semibold">
                {formatNumber(results.roiTimeline)} {t("yearsUnit")}
              </p>
            </div>
            <div className="rounded-lg bg-[#0f4a5c] border border-[#A8C117]/30 p-4">
              <p className="text-white/70 text-sm mb-1">{t("annualSavings")}</p>
              <p className="text-[#A8C117] text-2xl font-semibold">
                {formatCurrency(results.totalMoneySavedAnnually)}
              </p>
            </div>
          </div>
          <div className="divide-y divide-white/10 text-white">
            <div className="flex justify-between py-2">
              <span>{t("resultInvestment")}</span>
              <span className="font-semibold text-[#A8C117]">
                {formatCurrency(results.totalInvestmentRequired)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span>{t("resultRoiTimeline")}</span>
              <span className="font-semibold">
                {formatNumber(results.roiTimeline)} {t("yearsCapitalized")}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span>{t("resultAnnualisedRoi")}</span>
              <span className="font-semibold">
                {formatNumber(results.annualisedROI)} %
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span>{t("resultRoi20Years")}</span>
              <span className="font-semibold">
                {formatNumber(results.roi20Years)} %
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span>{t("resultTotalSaved")}</span>
              <span className="font-semibold">
                {formatCurrency(results.totalMoneySavedAnnually)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span>{t("resultLabourSaved")}</span>
              <span className="font-semibold">
                {formatCurrency(results.annualCostLabourSaved)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span>{t("resultWaterSaved")}</span>
              <span className="font-semibold">
                {formatCurrency(results.annualCostWaterSaved)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span>{t("resultEnergyGain")}</span>
              <span className="font-semibold">
                {formatCurrency(results.annualCostEnergyGain)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span>{t("resultWaterLiters")}</span>
              <span className="font-semibold">
                {formatNumber(results.waterSavedAnnually)} {t("litersUnit")}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span>{t("resultCarbon")}</span>
              <span className="font-semibold">
                {formatNumber(results.annualCarbonSavings)} {t("pdfCarbonUnit")}
              </span>
            </div>
          </div>

          <button
            type="button"
            className={primaryButtonClassName}
            onClick={handleDownloadPdf}
          >
            {t("downloadPdf")}
          </button>
        </div>
      )}
    </div>
  );
}
