"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import type {
  ProcurementModel,
  RoiCalculatorPublicResult,
  RoiProjectionSeries,
} from "@/lib/roi-calculator/roi-types";
import { buildDefaultInteractiveFormData } from "@/lib/roi-calculator/default-scenario";
import {
  formatRoiCurrency,
  formatRoiMoneyCompact,
  formatRoiNumber,
  formatRoiPaybackDuration,
  formatRoiPdfMoney,
  type PaybackDurationLabels,
} from "@/lib/roi-calculator/format-roi";
import {
  resolveRoiMarket,
  ROI_MARKET_PROFILES,
  type RoiMarketProfile,
} from "@/lib/roi-calculator/market-profiles";
import { useVisitorCountry } from "@/lib/roi-calculator/use-visitor-country";
import { isActiveLocale } from "@/i18n/markets";
import {
  trackRoiCalculatorPdf,
  trackRoiCalculatorRun,
} from "@/lib/analytics/track-event";
import { buildRoiPdfDocument } from "@/lib/roi-calculator/build-roi-pdf";
import { registerRoiPdfFonts } from "@/lib/roi-calculator/pdf-fonts";
import { loadTayproLetterheadsForPdf } from "@/lib/roi-calculator/pdf-letterhead";
import {
  getTayproEmailAddress,
  TAYPRO_SALES_PHONE_DISPLAY,
} from "@/lib/contact";
import { RoiProjectionChart } from "@/app/components/RoiProjectionChart";
import {
  RoiSavingsBreakdownChart,
  ROI_SAVINGS_SEGMENT_COLORS,
} from "@/app/components/RoiSavingsBreakdownChart";
import { RoiPaybackHorizonBar } from "@/app/components/RoiPaybackHorizonBar";
import { RoiEnvironmentalCards } from "@/app/components/RoiEnvironmentalCards";
import { RoiNetPositionChart } from "@/app/components/RoiNetPositionChart";
import { RoiYear20Snapshot } from "@/app/components/RoiYear20Snapshot";

import { SITE_URL } from "@/lib/seo/sitemap-config";

export type ROIResults = RoiCalculatorPublicResult;

type PlantType = "groundMount" | "rooftop";
type InstallationType = "fixedTilt" | "seasonalTilt" | "singleAxisTracker";
type AutomationLevel = "automatic" | "semiAutomatic";

const PROCUREMENT_OPTIONS: { value: ProcurementModel; labelKey: string }[] = [
  { value: "capex", labelKey: "procurementCapex" },
  { value: "opex", labelKey: "procurementOpex" },
];

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

export default function ROITayproCalculator({
  hideTitle = false,
  className = "",
}: ROICalculatorProps) {
  const t = useTranslations("PriceCalculatorPage.calculator");
  const locale = useLocale();
  const pathname = usePathname();
  const visitorCountry = useVisitorCountry();
  const market = useMemo(
    () =>
      resolveRoiMarket(
        isActiveLocale(locale) ? locale : "en",
        visitorCountry
      ),
    [locale, visitorCountry]
  );
  const showMarketNote = market.id !== "india";
  const regionName = showMarketNote ? t(market.regionLabelKey) : "";
  const opexMarket = ROI_MARKET_PROFILES.india;

  const [formData, setFormData] = useState(() =>
    buildDefaultInteractiveFormData(market)
  );

  const isOpexMode =
    formData.plantType === "groundMount" && formData.procurementModel === "opex";
  const showOpexInrNote = isOpexMode && market.id !== "india";

  const [results, setResults] = useState<ROIResults>({
    annualCostLabourSaved: 0,
    annualCostWaterSaved: 0,
    annualCostEnergyGain: 0,
    totalMoneySavedAnnually: 0,
    totalInvestmentRequired: 0,
    totalAmc20Years: 0,
    net20YearSavings: 0,
    roiTimeline: 0,
    annualisedROI: 0,
    roi20Years: 0,
    waterSavedAnnually: 0,
    annualCarbonSavings: 0,
    procurementModel: "capex",
  });
  const [projection, setProjection] = useState<RoiProjectionSeries | null>(null);
  const [activeProcurementModel, setActiveProcurementModel] =
    useState<ProcurementModel>("capex");
  const [calculating, setCalculating] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);

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
      ...(prev.plantType === "rooftop" ? { procurementModel: "capex" as const } : {}),
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

  const runCalculation = async () => {
    setCalculating(true);
    setCalcError(null);
    try {
      const response = await fetch("/api/roi/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          visitorCountry,
          plantType: formData.plantType,
          installationType: formData.installationType,
          automationLevel: formData.automationLevel,
          plantCapacityMW: formData.plantCapacityMW,
          plantCapacityKW: formData.plantCapacityKW,
          electricityTariff: formData.electricityTariff,
          moduleCapacityWp: formData.moduleCapacity,
          procurementModel: formData.procurementModel,
          cleaningCyclesPerMonth: formData.cleaningCyclesPerMonth,
        }),
      });

      if (!response.ok) {
        throw new Error("Calculation failed");
      }

      const data = (await response.json()) as {
        results: ROIResults;
        projection: RoiProjectionSeries;
        procurementModel: ProcurementModel;
      };

      setResults(data.results);
      setProjection(data.projection);
      setActiveProcurementModel(data.procurementModel);
      setShowResults(true);
      trackRoiCalculatorRun({
        plantType: formData.plantType,
        installationType: formData.installationType,
        automationLevel: formData.automationLevel,
        plantCapacityMw: formData.plantCapacityMW,
        marketId: market.id,
        roiTimelineYears: data.results.roiTimeline,
        pagePath: pathname,
        procurementModel: data.procurementModel,
      });
    } catch {
      setCalcError(t("calculationError"));
    } finally {
      setCalculating(false);
    }
  };

  const handleInput = (field: keyof typeof formData, value: unknown) => {
    if (field === "electricityTariff") tariffTouchedRef.current = true;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number) =>
    formatRoiCurrency(amount, market, locale);

  const formatOpexMoney = (amount: number) =>
    formatRoiCurrency(amount, opexMarket, locale);

  const formatOpexMoneyCompact = (amount: number) =>
    formatRoiMoneyCompact(amount, opexMarket, locale);

  const formatNumber = (v: number) => formatRoiNumber(v, market, locale);

  const formatMoneyCompact = (amount: number) =>
    formatRoiMoneyCompact(amount, market, locale);

  const paybackDurationLabels: PaybackDurationLabels = {
    year: t("durationYear"),
    years: t("yearsUnit"),
    month: t("durationMonth"),
    months: t("durationMonths"),
  };

  const formatPaybackDuration = (years: number) =>
    formatRoiPaybackDuration(years, paybackDurationLabels);

  const net20YearSavings = results.net20YearSavings;
  const resultsAreOpex = activeProcurementModel === "opex" && results.opex;
  const opexDetails = results.opex;

  const reportPlantName = () => {
    const trimmed = formData.plantName.trim();
    if (trimmed) return trimmed;
    if (formData.plantType === "groundMount") {
      return t("pdfDefaultPlantNameMw", {
        capacity: formatNumber(formData.plantCapacityMW),
      });
    }
    return t("pdfDefaultPlantNameKw", {
      capacity: formatNumber(formData.plantCapacityKW),
    });
  };

  const labelForPlantType = (value: PlantType) =>
    t(PLANT_TYPE_OPTIONS.find((o) => o.value === value)!.labelKey);
  const labelForInstallation = (value: InstallationType) =>
    t(INSTALLATION_OPTIONS.find((o) => o.value === value)!.labelKey);
  const labelForAutomation = (value: AutomationLevel) =>
    t(AUTOMATION_OPTIONS.find((o) => o.value === value)!.labelKey);

  const handleDownloadPdf = async () => {
    trackRoiCalculatorPdf({
      plantType: formData.plantType,
      marketId: market.id,
      pagePath: pathname,
    });
    const [{ default: jsPDF }, autoTableModule] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);
    const autoTable = autoTableModule.default;

    const {
      plantType,
      installationType,
      automationLevel,
      plantCapacityMW,
      plantCapacityKW,
      electricityTariff,
      moduleCapacity,
      plantName,
    } = formData;

    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const [letterheads] = await Promise.all([
      loadTayproLetterheadsForPdf(),
      registerRoiPdfFonts(pdf),
    ]);
    const pdfMoney = (amount: number) =>
      formatRoiPdfMoney(amount, market, locale);
    const pdfOpexMoney = (amount: number) =>
      formatRoiPdfMoney(amount, opexMarket, locale);
    const pdfNet20YearSavings = formatRoiPdfMoney(
      results.net20YearSavings,
      market,
      locale
    );
    const pdfIsOpex = resultsAreOpex && opexDetails;
    const capacityKw =
      plantType === "groundMount"
        ? plantCapacityMW * 1000
        : plantCapacityKW;
    const moduleCount = Math.round(capacityKw / (moduleCapacity / 1000));
    const generatedOn = new Intl.DateTimeFormat(market.formatLocale, {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date());
    const reportRegion = t(market.regionLabelKey);
    const plantLabel = reportPlantName();
    const trimmedPlantName = plantName.trim();
    const plantCapacityLine =
      plantType === "groundMount"
        ? `${formatNumber(plantCapacityMW)} MW`
        : `${formatNumber(plantCapacityKW)} kW`;
    const plantDetail = trimmedPlantName
      ? `${labelForPlantType(plantType)} · ${plantCapacityLine}`
      : "";

    buildRoiPdfDocument({
      pdf,
      autoTable,
      letterheads,
      market,
      results,
      moduleCount,
      formatMoney: pdfMoney,
      formatOpexMoney: pdfOpexMoney,
      formatNumber: (value, maximumFractionDigits) =>
        formatRoiNumber(value, market, locale, maximumFractionDigits),
      labels: {
        title: t("pdfTitle"),
        generatedOn: t("pdfGeneratedOn", { date: generatedOn }),
        generatedFor: t("pdfGeneratedFor", { name: plantLabel }),
        plantName: plantLabel,
        plantDetail,
        region: t("pdfRegion"),
        regionName: reportRegion,
        disclaimerShort: t("pdfDisclaimerShort"),
        summaryNarrative: pdfIsOpex
          ? t("pdfOpexSummaryNarrative", {
              annualSavings: pdfMoney(results.totalMoneySavedAnnually),
              annualOpex: pdfOpexMoney(opexDetails!.annualOpex),
              monthlyOpex: pdfOpexMoney(opexDetails!.monthlyOpex),
              cycles: String(opexDetails!.cleaningCyclesPerMonth),
              netAnnualBenefit: pdfMoney(opexDetails!.netAnnualBenefit),
              net20YearSavings: pdfNet20YearSavings,
            })
          : t("pdfSummaryNarrative", {
              paybackDuration: formatPaybackDuration(results.roiTimeline),
              annualSavings: pdfMoney(results.totalMoneySavedAnnually),
              investment: pdfMoney(results.totalInvestmentRequired),
              net20YearSavings: pdfNet20YearSavings,
            }),
        inputs: t("pdfInputs"),
        assumptions: t("pdfAssumptions"),
        environmentalImpact: t("pdfEnvironmentalImpact"),
        disclaimerHeading: t("pdfDisclaimerHeading"),
        disclaimerBody: t("pdfDisclaimerBody"),
        nextSteps: t("pdfNextSteps"),
        nextStepsBody: t("pdfNextStepsBody"),
        contactHeading: t("pdfContactHeading"),
        contactWebsite: t("pdfContactWebsite"),
        contactEmail: t("pdfContactEmail"),
        contactPhone: t("pdfContactPhone"),
        websiteUrl: SITE_URL.replace(/^https?:\/\//, ""),
        salesEmail: getTayproEmailAddress("sales"),
        salesPhone: TAYPRO_SALES_PHONE_DISPLAY,
        parameter: t("pdfParameter"),
        value: t("pdfValue"),
        highlightInvestment: t("highlightInvestment"),
        highlightMonthlyOpex: t("highlightMonthlyOpex"),
        highlightNetAnnualBenefit: t("highlightNetAnnualBenefit"),
        paybackTimeline: t("paybackTimeline"),
        annualSavings: t("annualSavings"),
        yearsUnit: t("yearsUnit"),
        result20YearNetSavings: t("result20YearNetSavings"),
        result20YearAmc: t("result20YearAmc"),
        net20YearSavingsAmcNote: t("net20YearSavingsAmcNote"),
        net20YearSavingsOpexNote: t("net20YearSavingsOpexNote"),
        pdfCarbonUnit: t("pdfCarbonUnit"),
        litersUnit: t("litersUnit"),
        assumptionModuleCount: t("pdfAssumptionModuleCount"),
        assumptionCleaningCycles: t("pdfAssumptionCleaningCycles"),
        assumptionOpexCycles: t("pdfAssumptionOpexCycles"),
        assumptionWaterPerModule: t("pdfAssumptionWaterPerModule"),
        assumptionSpecificYield: t("pdfAssumptionSpecificYield"),
        net20YearSavingsFormatted: pdfNet20YearSavings,
        pdfChartSavingsTitle: t("pdfChartSavingsTitle"),
        pdfChartPaybackTitle: t("pdfChartPaybackTitle"),
        pdfChartLabourShort: t("pdfChartLabourShort"),
        pdfChartWaterShort: t("pdfChartWaterShort"),
        pdfChartEnergyShort: t("pdfChartEnergyShort"),
        pdfChartPaybackLabel: t("pdfChartPaybackLabel"),
        pdfChartHorizonLabel: t("pdfChartHorizonLabel"),
        pdfEnvWaterShort: t("pdfEnvWaterShort"),
        pdfEnvCarbonShort: t("pdfEnvCarbonShort"),
        pdfEnvWaterDetail: t("pdfEnvWaterDetail"),
        pdfEnvCarbonDetail: t("pdfEnvCarbonDetail"),
        pdfResultsHeading: t("resultsHeading"),
        resultInvestment: t("resultInvestment"),
        resultMonthlyOpex: t("resultMonthlyOpex"),
        resultAnnualOpex: t("resultAnnualOpex"),
        resultRatePerModule: t("resultRatePerModule"),
        resultNetAnnualBenefit: t("resultNetAnnualBenefit"),
        resultOpexServiceModel: t("resultOpexServiceModel"),
        resultOpexServiceModelValue: t("resultOpexServiceModelValue"),
        resultRoiTimeline: t("resultRoiTimeline"),
        resultAnnualisedRoi: t("resultAnnualisedRoi"),
        resultTotalSaved: t("resultTotalSaved"),
        resultLabourSaved: t("resultLabourSaved"),
        resultWaterSaved: t("resultWaterSaved"),
        resultEnergyGain: t("resultEnergyGain"),
        resultWaterLiters: t("resultWaterLiters"),
        resultCarbon: t("resultCarbon"),
        projectionChartHeading: t("projectionChartHeading"),
        projectionChartSavings: t("projectionChartSavings"),
        projectionChartInvestment: t("projectionChartInvestment"),
        projectionChartOpexCost: t("projectionChartOpexCost"),
        projectionChartPayback: t("projectionChartPayback"),
        projectionChartYear: t("projectionChartYear"),
      },
      inputRows: [
        { label: t("plantName"), value: plantLabel },
        { label: t("plantType"), value: labelForPlantType(plantType) },
        ...(plantType === "groundMount"
          ? [
              {
                label: t("procurementModel"),
                value: t(
                  formData.procurementModel === "opex"
                    ? "procurementOpex"
                    : "procurementCapex"
                ),
              },
              {
                label: t("installationType"),
                value: labelForInstallation(installationType),
              },
            ]
          : []),
        ...(pdfIsOpex
          ? [
              {
                label: t("cleaningCyclesPerMonth"),
                value: String(formData.cleaningCyclesPerMonth),
              },
              {
                label: t("resultOpexServiceModel"),
                value: t("resultOpexServiceModelValue"),
              },
            ]
          : [
              {
                label: t("automationLevel"),
                value: labelForAutomation(automationLevel),
              },
            ]),
        {
          label:
            plantType === "groundMount"
              ? t("pdfPlantCapacityMw")
              : t("pdfPlantCapacityKw"),
          value: String(
            plantType === "groundMount" ? plantCapacityMW : plantCapacityKW
          ),
        },
        {
          label: `${t("pdfElectricityTariff")} (${market.currency}/kWh)`,
          value: String(electricityTariff),
        },
        { label: t("pdfModuleCapacity"), value: String(moduleCapacity) },
      ],
      projection,
      formatPaybackDuration,
    });

    const fileSlug =
      plantName
        .trim()
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40) ||
      (plantType === "groundMount"
        ? `${plantCapacityMW}MW`
        : `${plantCapacityKW}KW`);
    pdf.save(
      `Taypro-${pdfIsOpex ? "OPEX" : "ROI"}-Report-${fileSlug}.pdf`
    );
  };

  return (
    <div className={`w-full ${className}`.trim()}>
      <div className="bg-[#052638] rounded-xl p-6 sm:p-8 mb-6">
        {!hideTitle && (
          <h2 className="text-white text-2xl font-semibold mb-4">{t("title")}</h2>
        )}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="roi-plant-name"
              className="text-white/90 text-sm font-medium mb-1.5 block"
            >
              {t("plantName")}
            </label>
            <input
              id="roi-plant-name"
              type="text"
              value={formData.plantName}
              onChange={(e) => handleInput("plantName", e.target.value)}
              placeholder={t("plantNamePlaceholder")}
              maxLength={120}
              className={inputClassName}
            />
          </div>
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
                htmlFor="roi-procurement-model"
                className="text-white/90 text-sm font-medium mb-1.5 block"
              >
                {t("procurementModel")}
              </label>
              <select
                id="roi-procurement-model"
                value={formData.procurementModel}
                onChange={(e) =>
                  handleInput(
                    "procurementModel",
                    e.target.value as ProcurementModel
                  )
                }
                className={inputClassName}
              >
                {PROCUREMENT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {t(o.labelKey)}
                  </option>
                ))}
              </select>
              {isOpexMode ? (
                <p className="text-gray-400 text-xs mt-1">{t("opexServiceNote")}</p>
              ) : null}
            </div>
          )}

          {formData.plantType === "rooftop" ? (
            <p className="text-gray-400 text-sm sm:col-span-2">
              {t("opexRooftopUnavailable")}
            </p>
          ) : null}

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

          {!isOpexMode ? (
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
                  handleInput(
                    "automationLevel",
                    e.target.value as AutomationLevel
                  )
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
          ) : null}

          {isOpexMode ? (
            <div>
              <label
                htmlFor="roi-cleaning-cycles"
                className="text-white mb-1 block"
              >
                {t("cleaningCyclesPerMonth")}
              </label>
              <input
                id="roi-cleaning-cycles"
                type="number"
                value={formData.cleaningCyclesPerMonth}
                onChange={(e) =>
                  handleInput(
                    "cleaningCyclesPerMonth",
                    Math.max(3, Math.min(10, parseInt(e.target.value, 10) || 3))
                  )
                }
                min={3}
                max={10}
                step={1}
                className={inputClassName}
              />
              <div className="text-gray-400 text-xs">
                {t("cleaningCyclesPerMonthHint")}
              </div>
            </div>
          ) : null}

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

        <button
          type="button"
          onClick={runCalculation}
          disabled={calculating}
          className={primaryButtonClassName}
        >
          {calculating ? t("calculatingButton") : t("calculateButton")}
        </button>
        {calcError ? (
          <p className="mt-3 text-sm text-red-300" role="alert">
            {calcError}
          </p>
        ) : null}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {resultsAreOpex && opexDetails ? (
              <>
                <div className="rounded-lg bg-[#0f4a5c] border-2 border-[#A8C117] p-4 min-w-0 sm:col-span-2 xl:col-span-1">
                  <p className="text-white/70 text-sm mb-1">
                    {t("highlightMonthlyOpex")}
                  </p>
                  <p
                    className="text-[#A8C117] text-xl sm:text-2xl font-semibold tabular-nums leading-tight"
                    title={formatOpexMoney(opexDetails.monthlyOpex)}
                  >
                    {formatOpexMoneyCompact(opexDetails.monthlyOpex)}
                  </p>
                  <p className="text-white/55 text-xs mt-2">
                    {t("opexMonthlyDisclaimer")}
                  </p>
                  {opexDetails.minimumApplied ? (
                    <p className="text-white/45 text-xs mt-1">
                      {t("opexMinimumNote")}
                    </p>
                  ) : null}
                  {showOpexInrNote ? (
                    <p className="text-white/45 text-xs mt-1">
                      {t("opexPricingInrNote")}
                    </p>
                  ) : null}
                </div>
                <div className="rounded-lg bg-[#0f4a5c] border border-[#A8C117]/30 p-4 min-w-0">
                  <p className="text-white/70 text-sm mb-1">
                    {t("highlightNetAnnualBenefit")}
                  </p>
                  <p
                    className={`text-xl sm:text-2xl font-semibold tabular-nums leading-tight ${
                      opexDetails.netAnnualBenefit >= 0
                        ? "text-[#A8C117]"
                        : "text-red-300"
                    }`}
                    title={formatCurrency(opexDetails.netAnnualBenefit)}
                  >
                    {formatMoneyCompact(opexDetails.netAnnualBenefit)}
                  </p>
                </div>
              </>
            ) : (
              <div className="rounded-lg bg-[#0f4a5c] border-2 border-[#A8C117] p-4 min-w-0 sm:col-span-2 xl:col-span-1">
                <p className="text-white/70 text-sm mb-1">{t("highlightInvestment")}</p>
                <p
                  className="text-[#A8C117] text-xl sm:text-2xl font-semibold tabular-nums leading-tight"
                  title={formatCurrency(results.totalInvestmentRequired)}
                >
                  {formatMoneyCompact(results.totalInvestmentRequired)}
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
            )}
            {!resultsAreOpex ? (
              <div className="rounded-lg bg-[#0f4a5c] border border-[#A8C117]/30 p-4 min-w-0">
                <p className="text-white/70 text-sm mb-1">{t("paybackTimeline")}</p>
                <p className="text-[#A8C117] text-xl sm:text-2xl font-semibold tabular-nums leading-tight">
                  {formatPaybackDuration(results.roiTimeline)}
                </p>
              </div>
            ) : null}
            <div className="rounded-lg bg-[#0f4a5c] border border-[#A8C117]/30 p-4 min-w-0">
              <p className="text-white/70 text-sm mb-1">{t("annualSavings")}</p>
              <p
                className="text-[#A8C117] text-xl sm:text-2xl font-semibold tabular-nums leading-tight"
                title={formatCurrency(results.totalMoneySavedAnnually)}
              >
                {formatMoneyCompact(results.totalMoneySavedAnnually)}
              </p>
            </div>
            <div className="rounded-lg bg-[#0f4a5c] border border-[#A8C117]/30 p-4 min-w-0 sm:col-span-2 xl:col-span-1">
              <p className="text-white/70 text-sm mb-1">{t("result20YearNetSavings")}</p>
              <p
                className="text-[#A8C117] text-xl sm:text-2xl font-semibold tabular-nums leading-tight"
                title={formatCurrency(net20YearSavings)}
              >
                {formatMoneyCompact(net20YearSavings)}
              </p>
              <p className="text-white/45 text-xs mt-2 leading-snug">
                {resultsAreOpex
                  ? t("net20YearSavingsOpexNote")
                  : t("net20YearSavingsAmcNote")}
              </p>
            </div>
          </div>

          <div className="grid gap-4 mb-6 md:grid-cols-2">
            <RoiSavingsBreakdownChart
              title={t("pdfChartSavingsTitle")}
              total={results.totalMoneySavedAnnually}
              formatMoney={formatMoneyCompact}
              segments={[
                {
                  label: t("pdfChartLabourShort"),
                  amount: results.annualCostLabourSaved,
                  color: ROI_SAVINGS_SEGMENT_COLORS.labour,
                },
                {
                  label: t("pdfChartWaterShort"),
                  amount: results.annualCostWaterSaved,
                  color: ROI_SAVINGS_SEGMENT_COLORS.water,
                },
                {
                  label: t("pdfChartEnergyShort"),
                  amount: results.annualCostEnergyGain,
                  color: ROI_SAVINGS_SEGMENT_COLORS.energy,
                },
              ]}
            />
            <RoiPaybackHorizonBar
              title={t("pdfChartPaybackTitle")}
              paybackLabel={t("pdfChartPaybackLabel")}
              horizonLabel={t("pdfChartHorizonLabel")}
              yearsUnit={t("yearsUnit")}
              paybackYears={
                resultsAreOpex
                  ? projection?.paybackYear ?? results.roiTimeline
                  : results.roiTimeline
              }
              formatPaybackDuration={
                resultsAreOpex
                  ? () => t("opexImmediateBenefit")
                  : formatPaybackDuration
              }
            />
          </div>

          <div className="divide-y divide-white/10 text-white mb-2">
            {resultsAreOpex && opexDetails ? (
              <>
                <div className="flex justify-between gap-4 py-2">
                  <span>{t("resultMonthlyOpex")}</span>
                  <span
                    className="font-semibold text-[#A8C117] text-right tabular-nums shrink-0"
                    title={formatOpexMoney(opexDetails.monthlyOpex)}
                  >
                    {formatOpexMoneyCompact(opexDetails.monthlyOpex)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 py-2">
                  <span>{t("resultAnnualOpex")}</span>
                  <span
                    className="font-semibold text-right tabular-nums shrink-0"
                    title={formatOpexMoney(opexDetails.annualOpex)}
                  >
                    {formatOpexMoneyCompact(opexDetails.annualOpex)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 py-2">
                  <span>{t("resultRatePerModule")}</span>
                  <span className="font-semibold text-right tabular-nums shrink-0">
                    {formatOpexMoney(opexDetails.ratePerModulePerCycle)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 py-2">
                  <span>{t("resultOpexServiceModel")}</span>
                  <span className="font-semibold text-right shrink-0">
                    {t("resultOpexServiceModelValue")}
                  </span>
                </div>
                <div className="flex justify-between gap-4 py-2">
                  <span>{t("resultNetAnnualBenefit")}</span>
                  <span
                    className={`font-semibold text-right tabular-nums shrink-0 ${
                      opexDetails.netAnnualBenefit >= 0
                        ? "text-[#A8C117]"
                        : "text-red-300"
                    }`}
                    title={formatCurrency(opexDetails.netAnnualBenefit)}
                  >
                    {formatMoneyCompact(opexDetails.netAnnualBenefit)}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between gap-4 py-2">
                  <span>{t("resultInvestment")}</span>
                  <span
                    className="font-semibold text-[#A8C117] text-right tabular-nums shrink-0"
                    title={formatCurrency(results.totalInvestmentRequired)}
                  >
                    {formatMoneyCompact(results.totalInvestmentRequired)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 py-2">
                  <span>{t("result20YearAmc")}</span>
                  <span
                    className="font-semibold text-right tabular-nums shrink-0"
                    title={formatCurrency(results.totalAmc20Years)}
                  >
                    {formatMoneyCompact(results.totalAmc20Years)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span>{t("resultRoiTimeline")}</span>
                  <span className="font-semibold">
                    {formatPaybackDuration(results.roiTimeline)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span>{t("resultAnnualisedRoi")}</span>
                  <span className="font-semibold">
                    {formatNumber(results.annualisedROI)} %
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span>{t("result20YearRoi")}</span>
                  <span className="font-semibold">
                    {formatNumber(results.roi20Years)} %
                  </span>
                </div>
              </>
            )}
            <div className="flex justify-between gap-4 py-2">
              <span>{t("result20YearNetSavings")}</span>
              <span
                className="font-semibold text-[#A8C117] text-right tabular-nums shrink-0"
                title={formatCurrency(net20YearSavings)}
              >
                {formatMoneyCompact(net20YearSavings)}
              </span>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <span>{t("resultTotalSaved")}</span>
              <span
                className="font-semibold text-right tabular-nums shrink-0"
                title={formatCurrency(results.totalMoneySavedAnnually)}
              >
                {formatMoneyCompact(results.totalMoneySavedAnnually)}
              </span>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <span>{t("resultLabourSaved")}</span>
              <span
                className="font-semibold text-right tabular-nums shrink-0"
                title={formatCurrency(results.annualCostLabourSaved)}
              >
                {formatMoneyCompact(results.annualCostLabourSaved)}
              </span>
            </div>
            <div className="flex justify-between gap-4 py-1">
              <span>{t("resultWaterSaved")}</span>
              <span
                className="font-semibold text-right tabular-nums shrink-0"
                title={formatCurrency(results.annualCostWaterSaved)}
              >
                {formatMoneyCompact(results.annualCostWaterSaved)}
              </span>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <span>{t("resultEnergyGain")}</span>
              <span
                className="font-semibold text-right tabular-nums shrink-0"
                title={formatCurrency(results.annualCostEnergyGain)}
              >
                {formatMoneyCompact(results.annualCostEnergyGain)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span>{t("resultCarbon")}</span>
              <span className="font-semibold">
                {formatNumber(results.annualCarbonSavings)} {t("pdfCarbonUnit")}
              </span>
            </div>
          </div>

          <RoiEnvironmentalCards
            heading={t("pdfEnvironmentalImpact")}
            cards={[
              {
                shortLabel: t("pdfEnvWaterShort"),
                value: `${formatNumber(results.waterSavedAnnually)} ${t("litersUnit")}`,
                detail: t("pdfEnvWaterDetail"),
              },
              {
                shortLabel: t("pdfEnvCarbonShort"),
                value: `${formatNumber(results.annualCarbonSavings)} ${t("pdfCarbonUnit")}`,
                detail: t("pdfEnvCarbonDetail"),
              },
            ]}
          />

          {projection ? (
            <>
              <RoiProjectionChart
                projection={projection}
                formatMoney={formatMoneyCompact}
                formatNumber={(value, digits) => formatNumber(value)}
                formatPaybackDuration={formatPaybackDuration}
                labels={{
                  heading: t("projectionChartHeading"),
                  savings: t("projectionChartSavings"),
                  investment: resultsAreOpex
                    ? t("projectionChartOpexCost")
                    : t("projectionChartInvestment"),
                  payback: t("projectionChartPayback"),
                  year: t("projectionChartYear"),
                }}
              />
              <RoiNetPositionChart
                projection={projection}
                formatMoney={formatMoneyCompact}
                formatPaybackDuration={formatPaybackDuration}
                labels={{
                  heading: t("netPositionChartHeading"),
                  netPosition: t("netPositionChartLabel"),
                  breakEven: t("netPositionBreakEven"),
                  year: t("projectionChartYear"),
                }}
              />
              <RoiYear20Snapshot
                projection={projection}
                formatMoney={formatMoneyCompact}
                labels={{
                  heading: t("year20SnapshotHeading"),
                  netPosition: t("netPositionChartLabel"),
                  cumulativeSavings: t("projectionChartSavings"),
                  cumulativeInvestment: resultsAreOpex
                    ? t("projectionChartOpexCost")
                    : t("projectionChartInvestment"),
                }}
              />
            </>
          ) : null}

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
