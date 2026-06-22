import type { jsPDF } from "jspdf";
import type { RoiCalculatorPublicResult, RoiProjectionSeries } from "@/lib/roi-calculator/roi-types";
import type { RoiMarketProfile } from "@/lib/roi-calculator/market-profiles";
import type { TayproPdfLetterheadSet } from "@/lib/roi-calculator/pdf-letterhead";
import {
  BODY_BOTTOM,
  BODY_TOP_INNER,
  CONTENT_W,
  drawContactBox,
  drawEnvRow,
  drawKeyValueTable,
  drawKpiRow,
  drawNotice,
  drawPageFooter,
  drawPaybackBlock,
  drawPlantHeader,
  drawProjectionChart,
  drawSavingsBlock,
  drawSectionTitle,
  drawSummaryBox,
  drawWrapped,
  DETAILS_SECTION_GAP,
  MARGIN,
  SECTION_GAP,
  paintCoverPage,
  paintInnerPage,
  SAVINGS_CHART_COLORS,
  setActivePdfLetterheads,
} from "@/lib/roi-calculator/pdf-visuals";

export interface RoiPdfLabels {
  title: string;
  generatedOn: string;
  generatedFor: string;
  plantName: string;
  plantDetail: string;
  region: string;
  regionName: string;
  disclaimerShort: string;
  summaryNarrative: string;
  inputs: string;
  assumptions: string;
  environmentalImpact: string;
  disclaimerHeading: string;
  disclaimerBody: string;
  nextSteps: string;
  nextStepsBody: string;
  contactHeading: string;
  contactWebsite: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl: string;
  salesEmail: string;
  salesPhone: string;
  parameter: string;
  value: string;
  highlightInvestment: string;
  paybackTimeline: string;
  annualSavings: string;
  yearsUnit: string;
  result20YearNetSavings: string;
  result20YearAmc: string;
  net20YearSavingsAmcNote: string;
  pdfCarbonUnit: string;
  litersUnit: string;
  assumptionModuleCount: string;
  assumptionCleaningCycles: string;
  assumptionWaterPerModule: string;
  assumptionSpecificYield: string;
  net20YearSavingsFormatted: string;
  pdfChartSavingsTitle: string;
  pdfChartPaybackTitle: string;
  pdfChartLabourShort: string;
  pdfChartWaterShort: string;
  pdfChartEnergyShort: string;
  pdfChartPaybackLabel: string;
  pdfChartHorizonLabel: string;
  pdfEnvWaterShort: string;
  pdfEnvCarbonShort: string;
  pdfEnvWaterDetail: string;
  pdfEnvCarbonDetail: string;
  pdfResultsHeading: string;
  resultInvestment: string;
  resultRoiTimeline: string;
  resultAnnualisedRoi: string;
  resultTotalSaved: string;
  resultLabourSaved: string;
  resultWaterSaved: string;
  resultEnergyGain: string;
  resultWaterLiters: string;
  resultCarbon: string;
  projectionChartHeading: string;
  projectionChartSavings: string;
  projectionChartInvestment: string;
  projectionChartPayback: string;
  projectionChartYear: string;
}

export interface RoiPdfInputRow {
  label: string;
  value: string;
}

type AutoTableFn = (doc: jsPDF, options: Record<string, unknown>) => void;

function buildCoverPage(
  pdf: jsPDF,
  labels: RoiPdfLabels,
  results: RoiCalculatorPublicResult,
  formatMoney: (n: number) => string,
  formatNumber: (n: number, d?: number) => string,
  formatPaybackDuration: (years: number) => string
): void {
  pdf.setPage(1);
  paintCoverPage(pdf, labels.title);

  let y = drawPlantHeader(
    pdf,
    labels.plantName,
    labels.plantDetail,
    labels.generatedOn,
    `${labels.region}: ${labels.regionName}`
  );
  y = drawNotice(pdf, labels.disclaimerShort, y);
  y += SECTION_GAP;
  y = drawKpiRow(pdf, y, [
    { label: labels.highlightInvestment, value: formatMoney(results.totalInvestmentRequired) },
    {
      label: labels.paybackTimeline,
      value: formatPaybackDuration(results.roiTimeline),
    },
    { label: labels.annualSavings, value: formatMoney(results.totalMoneySavedAnnually) },
    { label: labels.result20YearNetSavings, value: labels.net20YearSavingsFormatted },
  ]);
  y = drawSummaryBox(pdf, labels.summaryNarrative, y);
  y += SECTION_GAP;
  y = drawPaybackBlock(
    pdf,
    y,
    labels.pdfChartPaybackTitle,
    results.roiTimeline,
    20,
    formatPaybackDuration(results.roiTimeline),
    labels.yearsUnit,
    labels.pdfChartPaybackLabel,
    labels.pdfChartHorizonLabel,
    (n) => formatNumber(n)
  );
  y = drawSavingsBlock(
    pdf,
    y,
    labels.pdfChartSavingsTitle,
    [
      {
        label: labels.pdfChartLabourShort,
        amount: results.annualCostLabourSaved,
        color: SAVINGS_CHART_COLORS.labour,
      },
      {
        label: labels.pdfChartWaterShort,
        amount: results.annualCostWaterSaved,
        color: SAVINGS_CHART_COLORS.water,
      },
      {
        label: labels.pdfChartEnergyShort,
        amount: results.annualCostEnergyGain,
        color: SAVINGS_CHART_COLORS.energy,
      },
    ],
    results.totalMoneySavedAnnually,
    formatMoney
  );
  y = drawSectionTitle(pdf, labels.environmentalImpact, y, {
    topGap: SECTION_GAP,
  });
  drawEnvRow(pdf, y, [
    {
      shortLabel: labels.pdfEnvWaterShort,
      value: formatNumber(results.waterSavedAnnually),
      detail: labels.pdfEnvWaterDetail,
    },
    {
      shortLabel: labels.pdfEnvCarbonShort,
      value: formatNumber(results.annualCarbonSavings),
      detail: labels.pdfEnvCarbonDetail,
    },
  ]);
}

function buildFinancialPage(
  pdf: jsPDF,
  labels: RoiPdfLabels,
  results: RoiCalculatorPublicResult,
  projection: RoiProjectionSeries | null,
  formatMoney: (n: number) => string,
  formatNumber: (n: number, d?: number) => string,
  formatPaybackDuration: (years: number) => string
): void {
  pdf.addPage();
  let page = pdf.getNumberOfPages();
  pdf.setPage(page);
  paintInnerPage(pdf, labels.title);

  const tableOpts = {
    startPage: page,
    docTitle: labels.title,
    bottom: BODY_BOTTOM,
    topY: BODY_TOP_INNER,
    onNewPage: (p: number) => {
      page = p;
      pdf.setPage(p);
      paintInnerPage(pdf, labels.title);
    },
  };

  let y = BODY_TOP_INNER;
  y = drawSectionTitle(pdf, labels.pdfResultsHeading, y);
  ({ y, page } = drawKeyValueTable(
    pdf,
    y,
    [labels.parameter, labels.value],
    [
      [labels.resultInvestment, formatMoney(results.totalInvestmentRequired)],
      [labels.result20YearAmc, formatMoney(results.totalAmc20Years)],
      [labels.resultRoiTimeline, formatPaybackDuration(results.roiTimeline)],
      [
        labels.resultAnnualisedRoi,
        `${formatNumber(results.annualisedROI)} %`,
      ],
      [labels.result20YearNetSavings, labels.net20YearSavingsFormatted],
      [labels.resultTotalSaved, formatMoney(results.totalMoneySavedAnnually)],
      [labels.resultLabourSaved, formatMoney(results.annualCostLabourSaved)],
      [labels.resultWaterSaved, formatMoney(results.annualCostWaterSaved)],
      [labels.resultEnergyGain, formatMoney(results.annualCostEnergyGain)],
      [
        labels.resultWaterLiters,
        `${formatNumber(results.waterSavedAnnually)} ${labels.litersUnit}`,
      ],
      [
        labels.resultCarbon,
        `${formatNumber(results.annualCarbonSavings)} ${labels.pdfCarbonUnit}`,
      ],
    ],
    { ...tableOpts, startPage: page }
  ));

  pdf.setPage(page);
  y = drawWrapped(pdf, labels.net20YearSavingsAmcNote, MARGIN, y, CONTENT_W, 7, {
    color: [92, 107, 120],
    gap: 12,
  });

  if (!projection || projection.years.length === 0) {
    return;
  }

  pdf.setPage(page);
  const chartBlockH = 178 + 22 + SECTION_GAP;
  if (y + chartBlockH > BODY_BOTTOM) {
    pdf.addPage();
    page = pdf.getNumberOfPages();
    pdf.setPage(page);
    paintInnerPage(pdf, labels.title);
    y = BODY_TOP_INNER;
  } else {
    y += SECTION_GAP;
  }

  drawProjectionChart(pdf, y, {
    projection,
    title: labels.projectionChartHeading,
    paybackLabel: labels.projectionChartPayback,
    savingsLabel: labels.projectionChartSavings,
    investmentLabel: labels.projectionChartInvestment,
    yearLabel: labels.projectionChartYear,
    formatMoney,
    formatPaybackDuration,
  });
}

function buildDetailsPage(
  pdf: jsPDF,
  labels: RoiPdfLabels,
  market: RoiMarketProfile,
  inputRows: RoiPdfInputRow[],
  moduleCount: number,
  formatNumber: (n: number, d?: number) => string
): void {
  pdf.addPage();
  const detailsPage = pdf.getNumberOfPages();
  pdf.setPage(detailsPage);
  paintInnerPage(pdf, labels.title);

  let page = detailsPage;
  const tableOpts = {
    startPage: page,
    docTitle: labels.title,
    bottom: BODY_BOTTOM,
    topY: BODY_TOP_INNER,
    onNewPage: (p: number) => {
      page = p;
      pdf.setPage(p);
      paintInnerPage(pdf, labels.title);
    },
  };

  let y = BODY_TOP_INNER;
  pdf.setPage(page);
  y = drawSectionTitle(pdf, labels.inputs, y);
  ({ y, page } = drawKeyValueTable(
    pdf,
    y,
    [labels.parameter, labels.value],
    inputRows.map((r) => [r.label, r.value] as [string, string]),
    { ...tableOpts, startPage: page }
  ));

  pdf.setPage(page);
  y = drawSectionTitle(pdf, labels.assumptions, y, {
    topGap: DETAILS_SECTION_GAP,
  });
  const econ = market.economics;
  ({ y, page } = drawKeyValueTable(
    pdf,
    y,
    [labels.parameter, labels.value],
    [
      [labels.region, labels.regionName],
      [labels.assumptionModuleCount, formatNumber(moduleCount, 0)],
      [labels.assumptionCleaningCycles, formatNumber(econ.cleaningCyclesPerYear, 0)],
      [
        labels.assumptionWaterPerModule,
        `${formatNumber(econ.litresPerModulePerCycle)} L`,
      ],
      [
        labels.assumptionSpecificYield,
        `${formatNumber(econ.specificYieldKwhPerKw, 0)} kWh/kW`,
      ],
    ],
    { ...tableOpts, startPage: page }
  ));

  pdf.setPage(page);
  y = drawSectionTitle(pdf, labels.nextSteps, y, {
    topGap: DETAILS_SECTION_GAP,
  });
  y = drawWrapped(pdf, labels.nextStepsBody, MARGIN, y, CONTENT_W, 8, { gap: 12 });
  y = drawContactBox(pdf, y, {
    heading: labels.contactHeading,
    website: labels.contactWebsite,
    websiteUrl: labels.websiteUrl,
    email: labels.contactEmail,
    salesEmail: labels.salesEmail,
    phone: labels.contactPhone,
    salesPhone: labels.salesPhone,
  });

  pdf.setPage(page);
  y = drawSectionTitle(pdf, labels.disclaimerHeading, y, {
    topGap: DETAILS_SECTION_GAP,
  });
  drawWrapped(pdf, labels.disclaimerBody, MARGIN, y, CONTENT_W, 8, {
    color: [92, 107, 120],
    gap: 4,
  });
}

export function buildRoiPdfDocument(options: {
  pdf: jsPDF;
  autoTable: AutoTableFn;
  letterheads: TayproPdfLetterheadSet;
  labels: RoiPdfLabels;
  market: RoiMarketProfile;
  inputRows: RoiPdfInputRow[];
  results: RoiCalculatorPublicResult;
  projection: RoiProjectionSeries | null;
  moduleCount: number;
  formatMoney: (amount: number) => string;
  formatNumber: (value: number, maximumFractionDigits?: number) => string;
  formatPaybackDuration: (years: number) => string;
}): void {
  const {
    pdf,
    letterheads,
    labels,
    market,
    inputRows,
    results,
    projection,
    moduleCount,
    formatMoney,
    formatNumber,
    formatPaybackDuration,
  } = options;

  setActivePdfLetterheads(letterheads);

  buildCoverPage(
    pdf,
    labels,
    results,
    formatMoney,
    formatNumber,
    formatPaybackDuration
  );
  buildFinancialPage(
    pdf,
    labels,
    results,
    projection,
    formatMoney,
    formatNumber,
    formatPaybackDuration
  );
  buildDetailsPage(
    pdf,
    labels,
    market,
    inputRows,
    moduleCount,
    formatNumber
  );

  const total = pdf.getNumberOfPages();
  for (let p = 1; p <= total; p += 1) {
    pdf.setPage(p);
    drawPageFooter(pdf, p, total, labels.websiteUrl);
  }
}
