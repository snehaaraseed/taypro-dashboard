import {
  buildRoiProjectionSeries,
  calculateRoi,
  toPublicRoiResult,
} from "../../src/lib/roi-calculator/calculate-roi-core.ts";
import { formatRoiPaybackDuration } from "../../src/lib/roi-calculator/format-roi.ts";

export function buildRoiPdfDebugContext({ en, market, form, plantLabel, pdfMoney }) {
  const input = {
    plantType: form.plantType,
    installationType: form.installationType,
    automationLevel: form.automationLevel,
    plantCapacityMW: form.plantCapacityMW,
    plantCapacityKW: form.plantCapacityKW,
    electricityTariff: form.electricityTariff,
    moduleCapacityWp: form.moduleCapacity,
  };
  const full = calculateRoi(input, market);
  const results = toPublicRoiResult(full);
  const projection = buildRoiProjectionSeries(full);
  const capacityKw =
    form.plantType === "groundMount"
      ? form.plantCapacityMW * 1000
      : form.plantCapacityKW;
  const moduleCount = Math.round(capacityKw / (form.moduleCapacity / 1000));

  const formatPaybackDuration = (years) =>
    formatRoiPaybackDuration(years, {
      year: en.durationYear,
      years: en.yearsUnit,
      month: en.durationMonth,
      months: en.durationMonths,
    });

  const labels = {
    title: en.pdfTitle,
    generatedOn: en.pdfGeneratedOn.replace(
      "{date}",
      new Intl.DateTimeFormat(market.formatLocale, {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date())
    ),
    generatedFor: en.pdfGeneratedFor.replace("{name}", plantLabel),
    plantName: plantLabel,
    plantDetail: "",
    region: en.pdfRegion,
    regionName: en.regionIndia,
    disclaimerShort: en.pdfDisclaimerShort,
    summaryNarrative: en.pdfSummaryNarrative
      .replace("{paybackDuration}", formatPaybackDuration(results.roiTimeline))
      .replace("{annualSavings}", pdfMoney(results.totalMoneySavedAnnually))
      .replace("{investment}", pdfMoney(results.totalInvestmentRequired))
      .replace("{net20YearSavings}", pdfMoney(results.net20YearSavings)),
    inputs: en.pdfInputs,
    assumptions: en.pdfAssumptions,
    environmentalImpact: en.pdfEnvironmentalImpact,
    disclaimerHeading: en.pdfDisclaimerHeading,
    disclaimerBody: en.pdfDisclaimerBody,
    nextSteps: en.pdfNextSteps,
    nextStepsBody: en.pdfNextStepsBody,
    contactHeading: en.pdfContactHeading,
    contactWebsite: en.pdfContactWebsite,
    contactEmail: en.pdfContactEmail,
    contactPhone: en.pdfContactPhone,
    websiteUrl: "taypro.in",
    salesEmail: "sales@taypro.in",
    salesPhone: "+91 80438 43569",
    parameter: en.pdfParameter,
    value: en.pdfValue,
    highlightInvestment: en.highlightInvestment,
    paybackTimeline: en.paybackTimeline,
    annualSavings: en.annualSavings,
    yearsUnit: en.yearsUnit,
    result20YearNetSavings: en.result20YearNetSavings,
    result20YearAmc: en.result20YearAmc,
    net20YearSavingsAmcNote: en.net20YearSavingsAmcNote,
    pdfCarbonUnit: en.pdfCarbonUnit,
    litersUnit: en.litersUnit,
    assumptionModuleCount: en.pdfAssumptionModuleCount,
    assumptionCleaningCycles: en.pdfAssumptionCleaningCycles,
    assumptionWaterPerModule: en.pdfAssumptionWaterPerModule,
    assumptionSpecificYield: en.pdfAssumptionSpecificYield,
    net20YearSavingsFormatted: pdfMoney(results.net20YearSavings),
    pdfChartSavingsTitle: en.pdfChartSavingsTitle,
    pdfChartPaybackTitle: en.pdfChartPaybackTitle,
    pdfChartLabourShort: en.pdfChartLabourShort,
    pdfChartWaterShort: en.pdfChartWaterShort,
    pdfChartEnergyShort: en.pdfChartEnergyShort,
    pdfChartPaybackLabel: en.pdfChartPaybackLabel,
    pdfChartHorizonLabel: en.pdfChartHorizonLabel,
    pdfEnvWaterShort: en.pdfEnvWaterShort,
    pdfEnvCarbonShort: en.pdfEnvCarbonShort,
    pdfEnvWaterDetail: en.pdfEnvWaterDetail,
    pdfEnvCarbonDetail: en.pdfEnvCarbonDetail,
    pdfResultsHeading: en.resultsHeading,
    resultInvestment: en.resultInvestment,
    resultRoiTimeline: en.resultRoiTimeline,
    resultAnnualisedRoi: en.resultAnnualisedRoi,
    resultTotalSaved: en.resultTotalSaved,
    resultLabourSaved: en.resultLabourSaved,
    resultWaterSaved: en.resultWaterSaved,
    resultEnergyGain: en.resultEnergyGain,
    resultWaterLiters: en.resultWaterLiters,
    resultCarbon: en.resultCarbon,
    projectionChartHeading: en.projectionChartHeading,
    projectionChartSavings: en.projectionChartSavings,
    projectionChartInvestment: en.projectionChartInvestment,
    projectionChartPayback: en.projectionChartPayback,
    projectionChartYear: en.projectionChartYear,
  };

  const inputRows = [
    { label: en.plantName, value: plantLabel },
    { label: en.plantType, value: en.plantTypeGroundMount },
    { label: en.installationType, value: en.installationFixedTilt },
    { label: en.automationLevel, value: en.automationAutomatic },
    { label: en.pdfPlantCapacityMw, value: String(form.plantCapacityMW) },
    {
      label: `${en.pdfElectricityTariff} (${market.currency}/kWh)`,
      value: String(form.electricityTariff),
    },
    { label: en.pdfModuleCapacity, value: String(form.moduleCapacity) },
  ];

  return {
    results,
    projection,
    moduleCount,
    labels,
    inputRows,
    formatPaybackDuration,
  };
}
