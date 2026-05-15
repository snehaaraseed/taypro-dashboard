"use client";
import { useState, useEffect } from "react";
import { useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

type ROICalculatorProps = {
  /** Hide the internal card title when the host page provides its own heading */
  hideTitle?: boolean;
  className?: string;
};

const inputClassName =
  "w-full p-2.5 bg-[#0f4a5c] text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#A8C117]/80 focus:border-transparent transition";

const primaryButtonClassName =
  "w-full mt-6 bg-[#A8C117] hover:bg-[#98B015] text-[#052638] font-semibold py-3 px-6 rounded-lg transition-colors duration-200 cursor-pointer";

export default function ROITayproCalculator({
  hideTitle = false,
  className = "",
}: ROICalculatorProps) {
  const doc = useRef<jsPDF | null>(null);
  if (!doc.current) {
    doc.current = new jsPDF({ unit: "pt", format: "a4" });
  }

  const [formData, setFormData] = useState({
    plantType: "Ground Mount",
    installationType: "Fixed Tilt",
    automationLevel: "Waterless Automatic Solar Panel Cleaning Robots",
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

  const plantTypeOptions = ["Ground Mount", "Rooftop"];
  const installationTypeOptions = [
    "Fixed Tilt",
    "Seasonal Tilt",
    "Single Axis Tracker",
  ];
  const automationLevelOptions = [
    "Waterless Automatic Solar Panel Cleaning Robots",
    "Waterless Semi-Automatic Solar Panel Cleaning Robots",
  ];

  // update tariff value
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      electricityTariff: prev.plantType === "Ground Mount" ? 3 : 10,
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

    const capacity = plantType === "Ground Mount" ? E * 1000 : F;
    const annualCostLabourSaved = Math.round(capacity / (H / 1000)) * 0.5 * 20;
    const waterSavedLitres = Math.round(capacity / (H / 1000)) * 20 * 3;
    const annualCostWaterSaved = waterSavedLitres * 0.12;
    const energyFactor = plantType === "Ground Mount" ? 0.0295 : 0.113;
    const annualCostEnergyGain = capacity * energyFactor * 1500 * G;
    const totalMoneySavedAnnually =
      annualCostLabourSaved + annualCostWaterSaved + annualCostEnergyGain;

    // Multipliers
    const automationMultiplier = automationLevel.includes("Automatic")
      ? 2.0
      : 0.5;
    const installationMultiplier =
      installationType === "Fixed Tilt"
        ? 2.0
        : installationType === "Seasonal Tilt"
        ? 2.0
        : 3.0;

    // Investment
    const baseInvestment =
      plantType === "Ground Mount"
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
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(v);

  const pdfFormatCurrency = (v: number) =>
    new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);

  const formatNumber = (v: number) =>
    new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(v);

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

    const doc = new jsPDF({ unit: "pt", format: "a4" });

    //  heaader
    doc.addImage(
      "/tayproasset/taypro-logoforwhitebg.png",
      "PNG",
      40,
      30,
      80,
      40
    );
    doc.setFontSize(18);
    doc.setTextColor("#052638");
    doc.text("ROI Calculator Report", 140, 55);

    let y = 100;

    // table
    doc.setFontSize(14);
    doc.text("Inputs", 40, y);
    y += 10;

    const inputRows = [
      ["Plant Type", plantType],
      ...(plantType === "Ground Mount"
        ? [["Installation Type", installationType]]
        : []),
      ["Automation Level", automationLevel],
      [
        plantType === "Ground Mount"
          ? "Plant Capacity (MW)"
          : "Plant Capacity (KW)",
        plantType === "Ground Mount" ? plantCapacityMW : plantCapacityKW,
      ],
      ["Electricity Tariff (Rs/kWh)", electricityTariff],
      ["Module Capacity (Wp)", moduleCapacity],
    ];

    autoTable(doc, {
      startY: y + 10,
      head: [["Parameter", "Value"]],
      body: inputRows,
      theme: "grid",
      headStyles: {
        fillColor: [5, 38, 56],
        textColor: 255,
        halign: "center",
      },
      styles: { fontSize: 11, cellPadding: 5 },
    });

    // roi calculations
    doc.setFontSize(14);

    const resultsRows = [
      [
        "Annual Cost Of Labour Saved",
        `Rs. ${pdfFormatCurrency(results.annualCostLabourSaved)}`,
      ],
      [
        "Annual Cost Of Water Saved",
        `Rs. ${pdfFormatCurrency(results.annualCostWaterSaved)}`,
      ],
      [
        "Annual Cost Of Energy Gain",
        `Rs. ${pdfFormatCurrency(results.annualCostEnergyGain)}`,
      ],
      [
        "Total Money Saved Annually",
        `Rs. ${pdfFormatCurrency(results.totalMoneySavedAnnually)}`,
      ],
      [
        "Total Investment Required",
        `Rs. ${pdfFormatCurrency(results.totalInvestmentRequired)}`,
      ],
      [
        "Return On Investment Timeline",
        `${formatNumber(results.roiTimeline)} Years`,
      ],
      [
        "Annualised Return On Investment",
        `${formatNumber(results.annualisedROI)} %`,
      ],
      [
        "ROI for 20 Years of Operation",
        `${formatNumber(results.roi20Years)} %`,
      ],
      [
        "Amount Of Water Saved Annually (Liters)",
        `${formatNumber(results.waterSavedAnnually)} L`,
      ],
      [
        "Annual Carbon Savings (kg CO2)",
        `${formatNumber(results.annualCarbonSavings)} kg CO2`,
      ],
    ];

    autoTable(doc, {
      head: [["Parameter", "Value"]],
      body: resultsRows,
      theme: "grid",
      headStyles: {
        fillColor: [5, 38, 56],
        textColor: 255,
        halign: "center",
      },
      styles: { fontSize: 11, cellPadding: 5 },
    });

    doc.save("ROI-Report.pdf");
  };

  return (
    <div className={`w-full ${className}`.trim()}>
      <div className="bg-[#052638] rounded-xl p-6 sm:p-8 mb-6">
        {!hideTitle && (
          <h2 className="text-white text-2xl font-semibold mb-4">ROI Calculator</h2>
        )}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* A: Plant Type */}
          <div>
            <label htmlFor="roi-plant-type" className="text-white/90 text-sm font-medium mb-1.5 block">
              Plant Type
            </label>
            <select
              id="roi-plant-type"
              value={formData.plantType}
              onChange={(e) => handleInput("plantType", e.target.value)}
              className={inputClassName}
            >
              {plantTypeOptions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>

          {/* B: Installation Type (Ground only) */}
          {formData.plantType === "Ground Mount" && (
            <div>
              <label htmlFor="roi-installation-type" className="text-white mb-1 block">Installation Type</label>
              <select
                id="roi-installation-type"
                value={formData.installationType}
                onChange={(e) =>
                  handleInput("installationType", e.target.value)
                }
                className={inputClassName}
              >
                {installationTypeOptions.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          )}

          {/* C: Automation Level */}
          <div className="">
            <label htmlFor="roi-automation-level" className="text-white mb-1 block">Automation Level</label>
            <select
              id="roi-automation-level"
              value={formData.automationLevel}
              onChange={(e) => handleInput("automationLevel", e.target.value)}
              className={inputClassName}
            >
              {automationLevelOptions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>

          {/* E or F */}
          {formData.plantType === "Ground Mount" ? (
            <div>
              <label htmlFor="roi-capacity-mw" className="text-white mb-1 block">
                Plant Capacity (MW)
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
              <div className="text-gray-400 text-xs">Min:1 Max:10000</div>
            </div>
          ) : (
            <div>
              <label htmlFor="roi-capacity-kw" className="text-white mb-1 block">
                Plant Capacity (KW)
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
              <div className="text-gray-400 text-xs">Min:100 Max:10000</div>
            </div>
          )}

          {/* G: Electricity Tariff */}
          <div>
            <label htmlFor="roi-electricity-tariff" className="text-white mb-1 block">
              Electricity Tariff (₹/kWh)
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
            <div className="text-gray-400 text-xs">Min:1 Max:50</div>
          </div>

          {/* H: Module Capacity */}
          <div>
            <label htmlFor="roi-module-capacity" className="text-white mb-1 block">
              Module Capacity (Wp)
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
            <div className="text-gray-400 text-xs">Min:1 Max:1000</div>
          </div>
        </div>

        <button type="button" onClick={calculateROI} className={primaryButtonClassName}>
          Calculate ROI
        </button>
      </div>

      {showResults && (
        <div className="bg-[#052638] rounded-xl p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white text-2xl font-semibold">Your estimate</h3>
            <button
              type="button"
              className="text-white/80 text-sm hover:text-[#A8C117] transition"
              onClick={() => setShowResults(false)}
              aria-label="Collapse results"
            >
              Hide ▲
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="rounded-lg bg-[#0f4a5c] border border-[#A8C117]/30 p-4">
              <p className="text-white/70 text-sm mb-1">Payback timeline</p>
              <p className="text-[#A8C117] text-2xl font-semibold">
                {formatNumber(results.roiTimeline)} years
              </p>
            </div>
            <div className="rounded-lg bg-[#0f4a5c] border border-[#A8C117]/30 p-4">
              <p className="text-white/70 text-sm mb-1">Annual savings</p>
              <p className="text-[#A8C117] text-2xl font-semibold">
                {formatCurrency(results.totalMoneySavedAnnually)}
              </p>
            </div>
          </div>
          <div className="divide-y divide-white/10 text-white">
            <div className="flex justify-between py-2">
              <span>Annual Cost Of Labour Saved</span>
              <span className="font-semibold">
                {formatCurrency(results.annualCostLabourSaved)}
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span>Annual Cost Of Water Saved</span>
              <span className="font-semibold">
                {formatCurrency(results.annualCostWaterSaved)}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span>Annual Cost Of Energy Gain</span>
              <span className="font-semibold">
                {formatCurrency(results.annualCostEnergyGain)}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span>Total Money Saved Annually</span>
              <span className="font-semibold">
                {formatCurrency(results.totalMoneySavedAnnually)}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span>Total Investment Required</span>
              <span className="font-semibold">
                {formatCurrency(results.totalInvestmentRequired)}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span>Return On Investment Timeline</span>
              <span className="font-semibold">
                {formatNumber(results.roiTimeline)} Years
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span>Annualised Return On Investment</span>
              <span className="font-semibold">
                {formatNumber(results.annualisedROI)} %
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span>ROI for 20 Years of Operation</span>
              <span className="font-semibold">
                {formatNumber(results.roi20Years)} %
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span>Amount Of Water Saved Annually (Liters)</span>
              <span className="font-semibold">
                {formatNumber(results.waterSavedAnnually)} Liters
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span>Annual Carbon Savings (kg CO₂)</span>
              <span className="font-semibold">
                {formatNumber(results.annualCarbonSavings)} kg CO₂
              </span>
            </div>
          </div>

          <button
            type="button"
            className={primaryButtonClassName}
            onClick={handleDownloadPdf}
          >
            Download complete report (PDF)
          </button>
        </div>
      )}
    </div>
  );
}
