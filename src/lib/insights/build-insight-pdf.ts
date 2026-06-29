import type { jsPDF } from "jspdf";
import type { TayproPdfLetterheadSet } from "@/lib/roi-calculator/pdf-letterhead";
import { registerRoiPdfFonts, pdfSetFont } from "@/lib/roi-calculator/pdf-fonts";
import { sanitizePdfText } from "@/lib/roi-calculator/pdf-text-sanitize";
import {
  BODY_TOP_INNER,
  CONTENT_W,
  drawContactBox,
  drawKpiRow,
  drawPageFooter,
  drawSectionTitle,
  drawWrapped,
  FOOTER_Y,
  MARGIN,
  PAGE_H,
  PAGE_W,
  paintInnerPage,
  SECTION_GAP,
  setActivePdfLetterheads,
} from "@/lib/roi-calculator/pdf-visuals";
import type {
  InsightPdfBlock,
  InsightPdfSection,
  ParsedInsightReport,
} from "@/lib/insights/parse-report-html-for-pdf";
import type {
  InsightCoverBackground,
  InsightHeroPdfAsset,
  InsightPdfLogo,
  InsightPdfLogoRaster,
} from "@/lib/insights/insight-pdf-assets";
import {
  loadInsightPdfLogoForPdf,
  rasterizeHeroCoverForPdf,
  rasterizeInsightLogoForPdf,
  rasterizeNavyCoverForPdf,
} from "@/lib/insights/insight-pdf-assets";

export type InsightPdfLabels = {
  docTitle: string;
  eyebrow: string;
  publishedOn: string;
  disclaimerShort: string;
  disclaimerHeading: string;
  disclaimerBody: string;
  websiteUrl: string;
  tocHeading: string;
  aboutHeading: string;
  aboutBody: string;
  statCapacityLabel: string;
  statCapacityValue: string;
  statSitesLabel: string;
  statSitesValue: string;
  statWaterLabel: string;
  statWaterValue: string;
  nextStepsHeading: string;
  nextStepsBody: string;
  contactHeading: string;
  contactWebsite: string;
  contactEmail: string;
  contactPhone: string;
  salesEmail: string;
  salesPhone: string;
};

type AutoTableFn = (doc: jsPDF, options: Record<string, unknown>) => void;

const NAVY: [number, number, number] = [5, 38, 56];
const LIME: [number, number, number] = [168, 193, 23];
const WHITE: [number, number, number] = [255, 255, 255];
const MUTED_WHITE: [number, number, number] = [220, 228, 234];

const COVER_LOGO_H = 76;
const COVER_LOGO_GAP = 40;
const COVER_LOGO_MAX_W = CONTENT_W;

function getCoverLogoDimensions(logo: InsightPdfLogo): { width: number; height: number } {
  const aspect = logo.width / logo.height;
  let h = COVER_LOGO_H;
  let w = h * aspect;
  if (w > COVER_LOGO_MAX_W) {
    w = COVER_LOGO_MAX_W;
    h = w / aspect;
  }
  return { width: w, height: h };
}

function drawCoverLogo(
  pdf: jsPDF,
  logo: InsightPdfLogoRaster,
  centerX: number,
  topY: number
): number {
  pdf.addImage(
    logo.dataUrl,
    logo.format,
    centerX - logo.widthPt / 2,
    topY,
    logo.widthPt,
    logo.heightPt,
    "insight-cover-logo",
    "SLOW"
  );
  return topY + logo.heightPt;
}

function getCoverLogoLayout(logo: InsightPdfLogo | InsightPdfLogoRaster): {
  width: number;
  height: number;
} {
  if ("widthPt" in logo) {
    return { width: logo.widthPt, height: logo.heightPt };
  }
  return getCoverLogoDimensions(logo);
}

function drawCoverBackground(pdf: jsPDF, background: InsightCoverBackground): void {
  pdf.addImage(
    background.dataUrl,
    background.format,
    0,
    0,
    PAGE_W,
    PAGE_H,
    "insight-cover-bg",
    "FAST"
  );
}

const COVER_TEXT_W = CONTENT_W - 40;
const COVER_CENTER_X = PAGE_W / 2;
const COVER_EYEBROW_SIZE = 12;
const COVER_TITLE_SIZE = 26;
const COVER_TITLE_STEP = 32;
const COVER_DESC_SIZE = 13;
const COVER_PUBLISHED_SIZE = 11;
const COVER_DISCLAIMER_SIZE = 9;

function wrappedLineStep(fontSize: number): number {
  return fontSize * 1.35;
}

function splitWrappedLines(
  pdf: jsPDF,
  text: string,
  width: number,
  fontSize: number,
  bold = false
): string[] {
  pdfSetFont(pdf, bold ? "bold" : "normal");
  pdf.setFontSize(fontSize);
  return pdf.splitTextToSize(sanitizePdfText(text), width);
}

function drawCenteredWrapped(
  pdf: jsPDF,
  text: string,
  y: number,
  fontSize: number,
  options: {
    bold?: boolean;
    color?: [number, number, number];
    gap?: number;
    width?: number;
  } = {}
): number {
  const width = options.width ?? COVER_TEXT_W;
  pdfSetFont(pdf, options.bold ? "bold" : "normal");
  pdf.setFontSize(fontSize);
  pdf.setTextColor(...(options.color ?? WHITE));
  const lines = pdf.splitTextToSize(sanitizePdfText(text), width);
  const step = wrappedLineStep(fontSize);
  lines.forEach((line: string, i: number) => {
    pdf.text(line, COVER_CENTER_X, y + i * step, { align: "center" });
  });
  return y + lines.length * step + (options.gap ?? 8);
}

/** ROI PDF uses 752; footer baseline is ~808 — use space down to ~18pt above footer. */
const INSIGHT_BODY_BOTTOM = FOOTER_Y - 18;
const INSIGHT_TABLE_BOTTOM_MARGIN = PAGE_H - INSIGHT_BODY_BOTTOM;

function ensureSpace(
  pdf: jsPDF,
  y: number,
  needed: number,
  docTitle: string
): number {
  if (y + needed > INSIGHT_BODY_BOTTOM) {
    pdf.addPage();
    paintInnerPage(pdf, docTitle);
    return BODY_TOP_INNER;
  }
  return y;
}

function estimateBlockHeight(block: InsightPdfBlock, pdf: jsPDF): number {
  switch (block.type) {
    case "paragraph":
      return pdf.splitTextToSize(block.text, CONTENT_W).length * 12 + 8;
    case "heading":
      return block.level === 3 ? 28 : 22;
    case "list":
      return block.items.length * 14 + 8;
    case "table":
      return 24 + block.rows.length * 16;
    default:
      return 20;
  }
}

function drawBlocks(
  pdf: jsPDF,
  autoTable: AutoTableFn,
  blocks: InsightPdfBlock[],
  y: number,
  docTitle: string
): number {
  for (const block of blocks) {
    y = ensureSpace(pdf, y, estimateBlockHeight(block, pdf), docTitle);

    if (block.type === "paragraph") {
      y = drawWrapped(pdf, block.text, MARGIN, y, CONTENT_W, 9.5, { gap: 6 });
    } else if (block.type === "heading") {
      y = drawWrapped(pdf, block.text, MARGIN, y, CONTENT_W, block.level === 3 ? 10.5 : 9.5, {
        bold: true,
        gap: 4,
      });
    } else if (block.type === "list") {
      for (let i = 0; i < block.items.length; i += 1) {
        const prefix = block.ordered ? `${i + 1}. ` : "• ";
        y = ensureSpace(pdf, y, 16, docTitle);
        y = drawWrapped(
          pdf,
          `${prefix}${block.items[i]}`,
          MARGIN + 8,
          y,
          CONTENT_W - 8,
          9,
          { gap: 4 }
        );
      }
      y += 4;
    } else if (block.type === "table") {
      y = ensureSpace(pdf, y, 40 + block.rows.length * 14, docTitle);
      autoTable(pdf, {
        startY: y,
        margin: {
          left: MARGIN,
          right: MARGIN,
          bottom: INSIGHT_TABLE_BOTTOM_MARGIN,
        },
        head: [block.headers],
        body: block.rows,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
        headStyles: { fillColor: [0, 51, 73], textColor: 255 },
        tableWidth: CONTENT_W,
      });
      y =
        ((pdf as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
          ?.finalY ?? y + 40) + SECTION_GAP;
    }
  }
  return y;
}

function buildCoverPage(
  pdf: jsPDF,
  labels: InsightPdfLabels,
  reportTitle: string,
  reportDescription: string,
  coverBackground: InsightCoverBackground,
  logo: InsightPdfLogoRaster | null
): void {
  drawCoverBackground(pdf, coverBackground);

  const titleLines = splitWrappedLines(pdf, reportTitle, COVER_TEXT_W, COVER_TITLE_SIZE, true);
  const descLines = splitWrappedLines(pdf, reportDescription, COVER_TEXT_W, COVER_DESC_SIZE);
  const disclaimerLines = splitWrappedLines(
    pdf,
    labels.disclaimerShort,
    COVER_TEXT_W,
    COVER_DISCLAIMER_SIZE
  );

  const titleStep = COVER_TITLE_STEP;
  const logoBlockHeight = logo
    ? getCoverLogoLayout(logo).height + COVER_LOGO_GAP
    : 0;
  const blockHeight =
    logoBlockHeight +
    32 +
    titleLines.length * titleStep +
    16 +
    descLines.length * wrappedLineStep(COVER_DESC_SIZE) +
    12 +
    wrappedLineStep(COVER_PUBLISHED_SIZE) +
    26 +
    18 +
    disclaimerLines.length * wrappedLineStep(COVER_DISCLAIMER_SIZE) +
    8;

  const coverTop = 48;
  const coverBottom = PAGE_H - 52;
  let y = coverTop + Math.max(0, (coverBottom - coverTop - blockHeight) / 2);

  if (logo) {
    y = drawCoverLogo(pdf, logo, COVER_CENTER_X, y) + COVER_LOGO_GAP;
  }

  pdfSetFont(pdf, "bold");
  pdf.setFontSize(COVER_EYEBROW_SIZE);
  pdf.setTextColor(...LIME);
  pdf.text(labels.eyebrow.toUpperCase(), COVER_CENTER_X, y, { align: "center" });
  y += 32;

  pdfSetFont(pdf, "bold");
  pdf.setFontSize(COVER_TITLE_SIZE);
  pdf.setTextColor(...WHITE);
  titleLines.forEach((line: string, i: number) => {
    pdf.text(line, COVER_CENTER_X, y + i * titleStep, { align: "center" });
  });
  y += titleLines.length * titleStep + 16;

  y = drawCenteredWrapped(pdf, reportDescription, y, COVER_DESC_SIZE, {
    gap: 12,
    color: WHITE,
  });

  pdfSetFont(pdf, "normal");
  pdf.setFontSize(COVER_PUBLISHED_SIZE);
  pdf.setTextColor(...MUTED_WHITE);
  pdf.text(labels.publishedOn, COVER_CENTER_X, y, { align: "center" });
  y += 26;

  const dividerW = Math.min(COVER_TEXT_W, 320);
  pdf.setDrawColor(...LIME);
  pdf.setLineWidth(1);
  pdf.line(COVER_CENTER_X - dividerW / 2, y, COVER_CENTER_X + dividerW / 2, y);
  y += 18;

  drawCenteredWrapped(pdf, labels.disclaimerShort, y, COVER_DISCLAIMER_SIZE, {
    gap: 10,
    color: MUTED_WHITE,
  });
}

function buildTocPage(
  pdf: jsPDF,
  labels: InsightPdfLabels,
  sections: InsightPdfSection[],
  backMatterTitles: string[]
): void {
  const entries = [
    ...sections.map((section) => section.title),
    ...backMatterTitles,
  ];
  if (!entries.length) return;

  pdf.addPage();
  paintInnerPage(pdf, labels.docTitle);
  let y = BODY_TOP_INNER;

  y = drawSectionTitle(pdf, labels.tocHeading, y, { topGap: 0 });
  y += 10;

  const numX = MARGIN;
  const textX = MARGIN + 28;
  const textW = CONTENT_W - 28;
  const lineStep = 14;

  entries.forEach((title, index) => {
    const lines = pdf.splitTextToSize(sanitizePdfText(title), textW);
    const blockH = Math.max(lineStep, lines.length * lineStep);
    y = ensureSpace(pdf, y, blockH + 8, labels.docTitle);

    pdfSetFont(pdf, "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(...NAVY);
    pdf.text(`${index + 1}.`, numX, y);

    pdfSetFont(pdf, "normal");
    pdf.setTextColor(45, 62, 74);
    lines.forEach((line: string, lineIndex: number) => {
      pdf.text(line, textX, y + lineIndex * lineStep);
    });

    y += blockH + 8;
  });
}

function buildBodyPages(
  pdf: jsPDF,
  autoTable: AutoTableFn,
  labels: InsightPdfLabels,
  parsed: ParsedInsightReport
): void {
  pdf.addPage();
  paintInnerPage(pdf, labels.docTitle);
  let y = BODY_TOP_INNER;

  if (parsed.intro.length) {
    y = drawBlocks(pdf, autoTable, parsed.intro, y, labels.docTitle);
    y += SECTION_GAP;
  }

  for (const section of parsed.sections) {
    y = ensureSpace(pdf, y, 40, labels.docTitle);
    y = drawSectionTitle(pdf, section.title, y, { topGap: SECTION_GAP });
    y = drawBlocks(pdf, autoTable, section.blocks, y, labels.docTitle);
  }
}

function buildBackMatterPages(pdf: jsPDF, labels: InsightPdfLabels): void {
  pdf.addPage();
  paintInnerPage(pdf, labels.docTitle);
  let y = BODY_TOP_INNER;

  y = drawSectionTitle(pdf, labels.aboutHeading, y, { topGap: 0 });
  y = drawWrapped(pdf, labels.aboutBody, MARGIN, y, CONTENT_W, 9, { gap: 10 });
  y += 8;
  y = drawKpiRow(pdf, y, [
    { label: labels.statCapacityLabel, value: labels.statCapacityValue },
    { label: labels.statSitesLabel, value: labels.statSitesValue },
    { label: labels.statWaterLabel, value: labels.statWaterValue },
  ]);
  y += SECTION_GAP;

  y = ensureSpace(pdf, y, 100, labels.docTitle);
  y = drawSectionTitle(pdf, labels.nextStepsHeading, y, { topGap: SECTION_GAP });
  y = drawWrapped(pdf, labels.nextStepsBody, MARGIN, y, CONTENT_W, 9, { gap: 10 });
  y += 8;

  y = ensureSpace(pdf, y, 60, labels.docTitle);
  y = drawContactBox(pdf, y, {
    heading: labels.contactHeading,
    website: labels.contactWebsite,
    websiteUrl: labels.websiteUrl,
    email: labels.contactEmail,
    salesEmail: labels.salesEmail,
    phone: labels.contactPhone,
    salesPhone: labels.salesPhone,
  });

  y = ensureSpace(pdf, y, 80, labels.docTitle);
  y = drawSectionTitle(pdf, labels.disclaimerHeading, y, { topGap: SECTION_GAP });
  drawWrapped(pdf, labels.disclaimerBody, MARGIN, y, CONTENT_W, 8, {
    color: [92, 107, 120],
    gap: 4,
  });
}

function backMatterTocTitles(labels: InsightPdfLabels): string[] {
  return [labels.aboutHeading, labels.nextStepsHeading, labels.disclaimerHeading];
}

export async function buildInsightPdfDocument(options: {
  reportTitle: string;
  reportDescription: string;
  parsed: ParsedInsightReport;
  labels: InsightPdfLabels;
  letterheads: TayproPdfLetterheadSet;
  autoTable: AutoTableFn;
  hero?: InsightHeroPdfAsset | null;
}): Promise<jsPDF> {
  const { default: jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "pt", format: "a4" });

  await registerRoiPdfFonts(pdf);
  setActivePdfLetterheads(options.letterheads);

  const [coverBackground, logoRaw] = await Promise.all([
    options.hero
      ? rasterizeHeroCoverForPdf(options.hero, PAGE_W, PAGE_H)
      : Promise.resolve(rasterizeNavyCoverForPdf(PAGE_W, PAGE_H)),
    loadInsightPdfLogoForPdf(),
  ]);

  let logo: InsightPdfLogoRaster | null = null;
  if (logoRaw) {
    const { width, height } = getCoverLogoDimensions(logoRaw);
    logo = await rasterizeInsightLogoForPdf(logoRaw, width, height);
  }

  buildCoverPage(
    pdf,
    options.labels,
    options.reportTitle,
    options.reportDescription,
    coverBackground,
    logo
  );
  buildTocPage(
    pdf,
    options.labels,
    options.parsed.sections,
    backMatterTocTitles(options.labels)
  );
  buildBodyPages(pdf, options.autoTable, options.labels, options.parsed);
  buildBackMatterPages(pdf, options.labels);

  const total = pdf.getNumberOfPages();
  for (let page = 1; page <= total; page += 1) {
    if (page === 1) continue;
    pdf.setPage(page);
    drawPageFooter(pdf, page, total, options.labels.websiteUrl);
  }

  return pdf;
}

export function insightPdfFilename(slug: string): string {
  const safe = slug.replace(/[^a-z0-9-]+/gi, "-").replace(/-+/g, "-");
  return `taypro-insights-${safe}.pdf`;
}
