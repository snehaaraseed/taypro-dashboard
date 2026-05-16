"use client";
import { useState, useEffect } from "react";
import { useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useLocale, useTranslations } from "next-intl";

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

function numberLocale(locale: string): string {
  return NUMBER_LOCALE[locale] ?? "en-IN";
}

export default function ROITayproCalculator({
  hideTitle = false,
  className = "",
}: ROICalculatorProps) {
  const t = useTranslations("PriceCalculatorPage.calculator");
  const locale = useLocale();
  const fmtLocale = numberLocale(locale);

  const doc = useRef<jsPDF | null>(null);
  if (!doc.current) {
    doc.current = new jsPDF({ unit: "pt", format: "a4" });
  }

  const [formData, setFormData] = useState({
    plantType: "groundMount" as PlantType,
    installationType: "fixedTilt" as InstallationType,
    automationLevel: "automatic" as AutomationLevel,
    plantCapacityMW: 200,
    plantCapacityKW: 200,
    electricityTariff: 3,
    moduleCapacity: 545,
  });

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

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      electricityTariff: prev.plantType === "groundMount" ? 3 : 10,
    }));
  }, [formData.plantType]);

  const calculateROI = () => {
    const {
      plantType,
      plantCapacityMW: E,
      plantCapacityKW: F,
      electricityTariff: G,
      moduleCapacity: H,
      automationLevel,
      installationType,
    } = formData;

    const capacity = plantType === "groundMount" ? E * 1000 : F;
    const annualCostLabourSaved = Math.round(capacity / (H / 1000)) * 0.5 * 20;
    const waterSavedLitres = Math.round(capacity / (H / 1000)) * 20 * 3;
    const annualCostWaterSaved = waterSavedLitres * 0.12;
    const energyFactor = plantType === "groundMount" ? 0.0295 : 0.113;
    const annualCostEnergyGain = capacity * energyFactor * 1500 * G;
    const totalMoneySavedAnnually =
      annualCostLabourSaved + annualCostWaterSaved + annualCostEnergyGain;

    const automationMultiplier = automationLevel === "automatic" ? 2.0 : 0.5;
    const installationMultiplier =
      installationType === "fixedTilt"
        ? 2.0
        : installationType === "seasonalTilt"
          ? 2.0
          : 3.0;

    const baseInvestment =
      plantType === "groundMount"
        ? E * automationMultiplier * installationMultiplier
        : (F * automationMultiplier) / 130;
    const perUnitCost = Math.max(
      42000,
      Math.min(114000, 114000 - (114000 - 42000) * (baseInvestment / 400))
    );
    const totalInvestmentRequired = baseInvestment * perUnitCost;

    const roiTimeline = totalInvestmentRequired / totalMoneySavedAnnually;
    const annualisedROI =
      (Math.pow(
        (totalMoneySavedAnnually * 20) / totalInvestmentRequired,
        1 / 20
      ) -
        1) *
      100;
    const roi20Years =
      ((totalMoneySavedAnnually * 20 * 0.9 - totalInvestmentRequired) /
        totalInvestmentRequired) *
      100;
    const annualCarbonSavings = capacity * energyFactor * 1500 * 0.496;

    setResults({
      annualCostLabourSaved,
      annualCostWaterSaved,
      annualCostEnergyGain,
      totalMoneySavedAnnually,
      totalInvestmentRequired,
      roiTimeline,
      annualisedROI,
      roi20Years,
      waterSavedAnnually: waterSavedLitres,
      annualCarbonSavings,
    });
    setShowResults(true);
  };

  const handleInput = (field: keyof typeof formData, value: unknown) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat(fmtLocale, {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(v);

  const pdfFormatCurrency = (v: number) =>
    new Intl.NumberFormat(fmtLocale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);

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
      [t("pdfElectricityTariff"), electricityTariff],
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

    const resultsRows = [
      [
        t("resultLabourSaved"),
        `Rs. ${pdfFormatCurrency(results.annualCostLabourSaved)}`,
      ],
      [
        t("resultWaterSaved"),
        `Rs. ${pdfFormatCurrency(results.annualCostWaterSaved)}`,
      ],
      [
        t("resultEnergyGain"),
        `Rs. ${pdfFormatCurrency(results.annualCostEnergyGain)}`,
      ],
      [
        t("resultTotalSaved"),
        `Rs. ${pdfFormatCurrency(results.totalMoneySavedAnnually)}`,
      ],
      [
        t("resultInvestment"),
        `Rs. ${pdfFormatCurrency(results.totalInvestmentRequired)}`,
      ],
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
              {t("electricityTariff")}
            </label>
            <input
              id="roi-electricity-tariff"
              type="number"
              step={0.1}
              value={formData.electricityTariff}
              onChange={(e) =>
                handleInput(
                  "electricityTariff",
                  Math.max(1, Math.min(50, parseFloat(e.target.value) || 0))
                )
              }
              min={1}
              max={50}
              className={inputClassName}
            />
            <div className="text-gray-400 text-xs">{t("minMaxTariff")}</div>
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

        <button type="button" onClick={calculateROI} className={primaryButtonClassName}>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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
              <span>{t("resultTotalSaved")}</span>
              <span className="font-semibold">
                {formatCurrency(results.totalMoneySavedAnnually)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span>{t("resultInvestment")}</span>
              <span className="font-semibold">
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
