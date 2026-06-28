import type { jsPDF } from "jspdf";
import { pdfSetFont } from "@/lib/roi-calculator/pdf-fonts";
import type { TayproPdfLetterheadSet } from "@/lib/roi-calculator/pdf-letterhead";
import type { RoiProjectionSeries } from "@/lib/roi-calculator/roi-types";

/** A4 portrait, points (72 dpi). */
export const PAGE_W = 595.28;
export const PAGE_H = 841.89;
export const MARGIN = 37;
export const CONTENT_W = PAGE_W - MARGIN * 2;

/** Content band, below gradient title + letterhead logo row (cover page). */
export const BODY_TOP = 142;
/** Page 2+, minimal letterhead allows starting higher. */
export const BODY_TOP_INNER = 124;
/** Page 1: stop above universal letterhead footer art. */
export const BODY_BOTTOM_P1 = 638;
/** Page 2+, stop above footer text. */
export const BODY_BOTTOM = 752;
export const FOOTER_Y = PAGE_H - 34;

/** Gradient doctype title, 16.3 mm + 5 mm nudge. */
const DOCTYPE_Y = 46 + (5 * 72) / 25.4;

const NAVY: [number, number, number] = [0, 51, 73];
const GREEN: [number, number, number] = [140, 198, 63];
const TEAL: [number, number, number] = [15, 74, 92];
const TEXT: [number, number, number] = [45, 62, 74];
const MUTED: [number, number, number] = [92, 107, 120];
const PANEL: [number, number, number] = [241, 245, 247];
const BORDER: [number, number, number] = [196, 206, 214];

const GRADIENT = [
  "#c9dc3f",
  "#aecd3a",
  "#8cc63f",
  "#6b9a45",
  "#4a7a52",
  "#2d5f5f",
  "#164a5c",
  "#003349",
] as const;

export const SAVINGS_CHART_COLORS = {
  labour: NAVY,
  water: TEAL,
  energy: GREEN,
} as const;

let letterheads: TayproPdfLetterheadSet | null = null;

export function setActivePdfLetterheads(next: TayproPdfLetterheadSet): void {
  letterheads = next;
}

export function setActivePdfDocTitle(_title: string): void {
  /* title passed per paint call */
}

function lh(fontSize: number, factor = 1.35): number {
  return fontSize * factor;
}

function hexRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function requireLetterheads(): TayproPdfLetterheadSet {
  if (!letterheads) throw new Error("PDF letterheads not loaded");
  return letterheads;
}

const LETTERHEAD_IMAGE_ALIASES = {
  universal: "taypro-lh-universal",
  minimal: "taypro-lh-minimal",
} as const;

function paintBackground(pdf: jsPDF, variant: "universal" | "minimal"): void {
  const src =
    variant === "universal"
      ? requireLetterheads().universal
      : requireLetterheads().minimal;
  const alias = LETTERHEAD_IMAGE_ALIASES[variant];
  const format = src.startsWith("data:image/png") ? "PNG" : "JPEG";
  pdf.addImage(src, format, 0, 0, PAGE_W, PAGE_H, alias, "MEDIUM");
}

export function paintGradientTitle(pdf: jsPDF, title: string): void {
  const text = title.toUpperCase().trim();
  const chars = [...text];
  const rightX = PAGE_W - MARGIN;
  let fontSize = 16;

  pdfSetFont(pdf, "bold");
  pdf.setFontSize(fontSize);
  let totalW = chars.reduce((s, c) => s + pdf.getTextWidth(c), 0);
  while (totalW > CONTENT_W && fontSize > 11) {
    fontSize -= 1;
    pdf.setFontSize(fontSize);
    totalW = chars.reduce((s, c) => s + pdf.getTextWidth(c), 0);
  }

  let x = rightX - totalW;
  chars.forEach((ch, i) => {
    const gi =
      chars.length > 1
        ? Math.round((i * (GRADIENT.length - 1)) / (chars.length - 1))
        : 0;
    pdf.setTextColor(...hexRgb(GRADIENT[gi]));
    pdf.text(ch, x, DOCTYPE_Y);
    x += pdf.getTextWidth(ch);
  });
}

export function paintCoverPage(pdf: jsPDF, docTitle: string): void {
  paintBackground(pdf, "universal");
  paintGradientTitle(pdf, docTitle);
}

export function paintInnerPage(pdf: jsPDF, docTitle: string): void {
  paintBackground(pdf, "minimal");
  paintGradientTitle(pdf, docTitle);
}

export function drawPageFooter(
  pdf: jsPDF,
  page: number,
  total: number,
  website: string
): void {
  pdfSetFont(pdf, "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(...NAVY);
  const site = website.replace(/^https?:\/\//, "");
  pdf.text(site, MARGIN, FOOTER_Y);
  pdf.text(`Page ${page} / ${total}`, PAGE_W - MARGIN, FOOTER_Y, {
    align: "right",
  });
}

/** Wrapped body text; returns Y after last line + gap. */
export function drawWrapped(
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  width: number,
  fontSize: number,
  options: {
    bold?: boolean;
    color?: [number, number, number];
    gap?: number;
    maxLines?: number;
  } = {}
): number {
  pdfSetFont(pdf, options.bold ? "bold" : "normal");
  pdf.setFontSize(fontSize);
  pdf.setTextColor(...(options.color ?? TEXT));
  let lines = pdf.splitTextToSize(text, width);
  if (options.maxLines && lines.length > options.maxLines) {
    lines = lines.slice(0, options.maxLines);
    const last = lines[options.maxLines - 1];
    lines[options.maxLines - 1] =
      last.length > 3 ? `${last.slice(0, last.length - 3)}…` : last;
  }
  const step = lh(fontSize);
  lines.forEach((line: string, i: number) => pdf.text(line, x, y + i * step));
  return y + lines.length * step + (options.gap ?? 8);
}

export function drawRule(pdf: jsPDF, y: number): number {
  pdf.setDrawColor(...NAVY);
  pdf.setLineWidth(0.75);
  pdf.line(MARGIN, y, PAGE_W - MARGIN, y);
  return y + 12;
}

/** Extra space between stacked sections. */
export const SECTION_GAP = 14;
/** @deprecated Use SECTION_GAP */
export const DETAILS_SECTION_GAP = SECTION_GAP;

export function drawSectionTitle(
  pdf: jsPDF,
  title: string,
  y: number,
  options?: { topGap?: number }
): number {
  y += options?.topGap ?? 0;
  pdfSetFont(pdf, "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(...NAVY);
  pdf.text(title, MARGIN, y);
  pdf.setDrawColor(...NAVY);
  pdf.setLineWidth(0.5);
  pdf.line(MARGIN, y + 4, PAGE_W - MARGIN, y + 4);
  return y + 22;
}

/** Plant name + optional type/capacity + meta stacked full-width; returns Y below rule. */
export function drawPlantHeader(
  pdf: jsPDF,
  plantName: string,
  plantDetail: string,
  generatedOn: string,
  regionLine: string
): number {
  let y = BODY_TOP;

  pdfSetFont(pdf, "bold");
  pdf.setFontSize(14);
  pdf.setTextColor(...NAVY);
  const plantLines = pdf.splitTextToSize(plantName, CONTENT_W);
  const plantStep = lh(14, 1.3);
  plantLines.forEach((line: string, i: number) => {
    pdf.text(line, MARGIN, y + i * plantStep);
  });
  y += plantLines.length * plantStep + (plantDetail ? 4 : 8);

  if (plantDetail) {
    pdfSetFont(pdf, "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(...NAVY);
    const detailLines = pdf.splitTextToSize(plantDetail, CONTENT_W);
    const detailStep = lh(10, 1.3);
    detailLines.forEach((line: string, i: number) => {
      pdf.text(line, MARGIN, y + i * detailStep);
    });
    y += detailLines.length * detailStep + 8;
  }

  pdfSetFont(pdf, "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(...MUTED);
  const meta = `${generatedOn}  ·  ${regionLine}`;
  const metaLines = pdf.splitTextToSize(meta, CONTENT_W);
  const metaStep = lh(8, 1.4);
  metaLines.forEach((line: string, i: number) => {
    pdf.text(line, MARGIN, y + i * metaStep);
  });
  y += metaLines.length * metaStep + 10;

  return drawRule(pdf, y);
}

export function drawNotice(pdf: jsPDF, notice: string, y: number): number {
  pdfSetFont(pdf, "bold");
  pdf.setFontSize(6.5);
  pdf.setTextColor(...NAVY);
  pdf.text("NOTICE:", MARGIN, y);
  return drawWrapped(pdf, notice, MARGIN, y + 10, CONTENT_W, 6.5, {
    color: MUTED,
    gap: 14,
  });
}

export function drawKpiRow(
  pdf: jsPDF,
  y: number,
  cards: { label: string; value: string }[]
): number {
  const gap = 6;
  const cardW = (CONTENT_W - gap * (cards.length - 1)) / cards.length;
  const pad = 7;
  const innerW = cardW - pad * 2;
  const labelSize = 6.5;
  const valueSize = 10;
  const labelStep = lh(labelSize, 1.3);
  const valueStep = lh(valueSize, 1.25);

  let cardH = 50;
  const measured = cards.map((card) => {
    pdfSetFont(pdf, "normal");
    pdf.setFontSize(labelSize);
    const labels = pdf.splitTextToSize(card.label, innerW);
    pdfSetFont(pdf, "bold");
    pdf.setFontSize(valueSize);
    const values = pdf.splitTextToSize(card.value, innerW);
    const h = 10 + labels.length * labelStep + 3 + values.length * valueStep + 8;
    return { ...card, labels, values, h };
  });
  cardH = Math.max(cardH, ...measured.map((c) => c.h));

  measured.forEach((card, i) => {
    const x = MARGIN + i * (cardW + gap);
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(...BORDER);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(x, y, cardW, cardH, 3, 3, "FD");
    pdf.setFillColor(...GREEN);
    pdf.rect(x, y, cardW, 2, "F");

    pdfSetFont(pdf, "normal");
    pdf.setFontSize(labelSize);
    pdf.setTextColor(...MUTED);
    card.labels.forEach((line: string, li: number) =>
      pdf.text(line, x + pad, y + 11 + li * labelStep)
    );

    pdfSetFont(pdf, "bold");
    pdf.setFontSize(valueSize);
    pdf.setTextColor(...NAVY);
    const valueY = y + 11 + card.labels.length * labelStep + 4;
    card.values.forEach((line: string, vi: number) =>
      pdf.text(line, x + pad, valueY + vi * valueStep)
    );
  });

  return y + cardH + 14;
}

export function drawSummaryBox(pdf: jsPDF, text: string, y: number): number {
  pdfSetFont(pdf, "normal");
  pdf.setFontSize(9);
  const lines = pdf.splitTextToSize(text, CONTENT_W - 24);
  const maxLines = 5;
  const shown = lines.slice(0, maxLines);
  const boxH = shown.length * lh(9) + 16;
  pdf.setFillColor(...PANEL);
  pdf.setDrawColor(...BORDER);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(MARGIN, y, CONTENT_W, boxH, 4, 4, "FD");
  pdf.setFillColor(...GREEN);
  pdf.rect(MARGIN, y + 6, 3, boxH - 12, "F");
  pdf.setTextColor(...TEXT);
  shown.forEach((line: string, i: number) =>
    pdf.text(line, MARGIN + 12, y + 12 + i * lh(9))
  );
  return y + boxH + 12;
}

export function drawPaybackBlock(
  pdf: jsPDF,
  y: number,
  title: string,
  paybackYears: number,
  horizonYears: number,
  paybackFormatted: string,
  yearsUnit: string,
  paybackLabel: string,
  horizonLabel: string,
  formatNumber: (n: number) => string
): number {
  const h = 54;
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(...BORDER);
  pdf.roundedRect(MARGIN, y, CONTENT_W, h, 4, 4, "FD");

  pdfSetFont(pdf, "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...NAVY);
  pdf.text(title, MARGIN + 10, y + 14);

  const tx = MARGIN + 10;
  const ty = y + 24;
  const tw = CONTENT_W - 20;
  pdf.setFillColor(220, 228, 234);
  pdf.roundedRect(tx, ty, tw, 8, 3, 3, "F");
  const capped = Math.min(Math.max(paybackYears, 0), horizonYears);
  const fillW = (capped / horizonYears) * tw;
  if (fillW > 0) {
    pdf.setFillColor(...GREEN);
    pdf.roundedRect(tx, ty, Math.max(fillW, 4), 8, 3, 3, "F");
  }

  pdfSetFont(pdf, "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...NAVY);
  pdf.text(
    `${paybackLabel}: ${paybackFormatted}`,
    tx,
    y + 44
  );
  pdfSetFont(pdf, "normal");
  pdf.setTextColor(...MUTED);
  pdf.text(`${horizonLabel}: ${horizonYears} ${yearsUnit}`, tx + tw, y + 44, {
    align: "right",
  });
  return y + h + 12;
}

export type SavingsSegment = {
  label: string;
  amount: number;
  color: [number, number, number];
};

export function drawSavingsBlock(
  pdf: jsPDF,
  y: number,
  title: string,
  segments: SavingsSegment[],
  total: number,
  formatMoney: (n: number) => string
): number {
  const legW = (CONTENT_W - 20) / 3;
  const legY = 40;
  let maxLegBottom = legY + 24;

  pdfSetFont(pdf, "normal");
  pdf.setFontSize(7);
  for (const seg of segments) {
    const pct = total > 0 ? Math.round((seg.amount / total) * 100) : 0;
    const amt = pdf.splitTextToSize(
      `${formatMoney(seg.amount)} (${pct}%)`,
      legW - 14
    );
    maxLegBottom = Math.max(maxLegBottom, legY + 16 + amt.length * lh(7));
  }

  const h = Math.max(86, maxLegBottom + 10);
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(...BORDER);
  pdf.roundedRect(MARGIN, y, CONTENT_W, h, 4, 4, "FD");

  pdfSetFont(pdf, "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...NAVY);
  pdf.text(title, MARGIN + 10, y + 14);

  const bx = MARGIN + 10;
  const by = y + 22;
  const bw = CONTENT_W - 20;
  pdf.setFillColor(220, 228, 234);
  pdf.roundedRect(bx, by, bw, 10, 3, 3, "F");
  if (total > 0) {
    let off = 0;
    for (const seg of segments) {
      const w = (seg.amount / total) * bw;
      if (w <= 0) continue;
      pdf.setFillColor(...seg.color);
      pdf.rect(bx + off, by, w, 10, "F");
      off += w;
    }
  }

  const absLegY = y + legY;
  segments.forEach((seg, i) => {
    const lx = MARGIN + 10 + i * legW;
    pdf.setFillColor(...seg.color);
    pdf.rect(lx, absLegY, 8, 8, "F");
    pdfSetFont(pdf, "bold");
    pdf.setFontSize(7);
    pdf.setTextColor(...NAVY);
    pdf.text(seg.label, lx + 12, absLegY + 7);
    pdfSetFont(pdf, "normal");
    pdf.setTextColor(...MUTED);
    const pct = total > 0 ? Math.round((seg.amount / total) * 100) : 0;
    const amt = pdf.splitTextToSize(
      `${formatMoney(seg.amount)} (${pct}%)`,
      legW - 14
    );
    amt.forEach((line: string, li: number) =>
      pdf.text(line, lx + 12, absLegY + 16 + li * lh(7))
    );
  });
  return y + h + 12;
}

const PROJECTION_SAVINGS: [number, number, number] = [168, 193, 23];
const PROJECTION_INVESTMENT: [number, number, number] = [245, 158, 11];
const PROJECTION_GRID: [number, number, number] = [220, 228, 234];

function pdfScaleLinear(
  value: number,
  domain: [number, number],
  range: [number, number]
): number {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  if (d1 === d0) return (r0 + r1) / 2;
  return r0 + ((value - d0) / (d1 - d0)) * (r1 - r0);
}

function projectionValueAtPayback(
  projection: RoiProjectionSeries,
  accessor: (year: number, savings: number, cost: number) => number
): number {
  const { years, paybackYear } = projection;
  if (paybackYear == null || years.length === 0) return 0;
  const y0 = Math.max(0, Math.min(20, Math.floor(paybackYear)));
  const y1 = Math.min(20, y0 + 1);
  const p0 = years.find((p) => p.year === y0) ?? years[0];
  const p1 = years.find((p) => p.year === y1) ?? years[years.length - 1];
  const t = paybackYear - y0;
  const v0 = accessor(p0.year, p0.cumulativeSavings, p0.cumulativeCost);
  const v1 = accessor(p1.year, p1.cumulativeSavings, p1.cumulativeCost);
  return v0 + (v1 - v0) * t;
}

export function drawProjectionChart(
  pdf: jsPDF,
  y: number,
  options: {
    projection: RoiProjectionSeries;
    title: string;
    paybackLabel: string;
    savingsLabel: string;
    investmentLabel: string;
    yearLabel: string;
    formatMoney: (n: number) => string;
    formatPaybackDuration: (years: number) => string;
  }
): number {
  const {
    projection,
    title,
    paybackLabel,
    savingsLabel,
    investmentLabel,
    yearLabel,
    formatMoney,
    formatPaybackDuration,
  } = options;
  const { years, paybackYear } = projection;

  const boxH = 178;
  const pad = 10;
  const plotPad = { left: 40, right: 8, top: 52, bottom: 24 };
  const plotW = CONTENT_W - pad * 2 - plotPad.left - plotPad.right;
  const plotH = boxH - plotPad.top - plotPad.bottom;

  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(...BORDER);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(MARGIN, y, CONTENT_W, boxH, 4, 4, "FD");

  pdfSetFont(pdf, "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...NAVY);
  pdf.text(title, MARGIN + pad, y + 14);

  if (paybackYear != null) {
    pdfSetFont(pdf, "normal");
    pdf.setFontSize(7);
    pdf.setTextColor(...MUTED);
    pdf.text(
      `${paybackLabel}: ${formatPaybackDuration(paybackYear)}`,
      MARGIN + pad,
      y + 24
    );
  }

  const legY = y + 30;
  pdf.setFillColor(...PROJECTION_SAVINGS);
  pdf.rect(MARGIN + pad, legY, 10, 3, "F");
  pdfSetFont(pdf, "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(...TEXT);
  pdf.text(savingsLabel, MARGIN + pad + 14, legY + 3);

  const invLegX = MARGIN + pad + 130;
  pdf.setFillColor(...PROJECTION_INVESTMENT);
  pdf.rect(invLegX, legY, 10, 3, "F");
  pdf.text(investmentLabel, invLegX + 14, legY + 3);

  const plotX0 = MARGIN + pad + plotPad.left;
  const plotY0 = y + plotPad.top;
  const plotX1 = plotX0 + plotW;
  const plotY1 = plotY0 + plotH;

  const moneyMax = Math.max(
    ...years.flatMap((p) => [p.cumulativeSavings, p.cumulativeCost]),
    1
  );

  const xForYear = (year: number) =>
    plotX0 + pdfScaleLinear(year, [0, 20], [0, plotW]);
  const yMoney = (value: number) =>
    plotY1 - pdfScaleLinear(value, [0, moneyMax], [0, plotH]);

  const moneyTicks = 4;
  pdf.setDrawColor(...PROJECTION_GRID);
  pdf.setLineWidth(0.25);
  for (let i = 0; i <= moneyTicks; i += 1) {
    const gy = plotY0 + (plotH / moneyTicks) * i;
    pdf.line(plotX0, gy, plotX1, gy);
    const tickValue = moneyMax - (moneyMax / moneyTicks) * i;
    pdfSetFont(pdf, "normal");
    pdf.setFontSize(6);
    pdf.setTextColor(...MUTED);
    const tickText = formatMoney(tickValue);
    pdf.text(tickText, plotX0 - 4, gy + 2, { align: "right" });
  }

  pdf.setDrawColor(...BORDER);
  pdf.setLineWidth(0.4);
  pdf.line(plotX0, plotY1, plotX1, plotY1);
  pdf.line(plotX0, plotY0, plotX0, plotY1);

  for (const year of [0, 5, 10, 15, 20]) {
    pdfSetFont(pdf, "normal");
    pdf.setFontSize(6);
    pdf.setTextColor(...MUTED);
    pdf.text(String(year), xForYear(year), plotY1 + 12, { align: "center" });
  }

  const drawSeries = (
    accessor: (p: (typeof years)[number]) => number,
    color: [number, number, number]
  ) => {
    pdf.setDrawColor(...color);
    pdf.setLineWidth(1.4);
    for (let i = 1; i < years.length; i += 1) {
      const prev = years[i - 1];
      const curr = years[i];
      pdf.line(
        xForYear(prev.year),
        yMoney(accessor(prev)),
        xForYear(curr.year),
        yMoney(accessor(curr))
      );
    }
  };

  drawSeries((p) => p.cumulativeCost, PROJECTION_INVESTMENT);
  drawSeries((p) => p.cumulativeSavings, PROJECTION_SAVINGS);

  if (paybackYear != null) {
    const px = xForYear(paybackYear);
    pdf.setDrawColor(...NAVY);
    pdf.setLineWidth(0.6);
    pdf.line(px, plotY0, px, plotY1);

    const savingsY = yMoney(
      projectionValueAtPayback(projection, (_y, savings) => savings)
    );
    const investmentY = yMoney(
      projectionValueAtPayback(projection, (_y, _s, cost) => cost)
    );

    pdf.setFillColor(...PROJECTION_SAVINGS);
    pdf.circle(px, savingsY, 2.5, "F");
    pdf.setFillColor(...PROJECTION_INVESTMENT);
    pdf.circle(px, investmentY, 2.5, "F");

    pdfSetFont(pdf, "bold");
    pdf.setFontSize(7);
    pdf.setTextColor(...NAVY);
    pdf.text("ROI", px, plotY0 - 4, { align: "center" });
    pdfSetFont(pdf, "normal");
    pdf.setFontSize(6);
    pdf.text(formatPaybackDuration(paybackYear), px, plotY0 - 11, {
      align: "center",
    });
  }

  const year20 = years.find((p) => p.year === 20) ?? years[years.length - 1];
  if (year20) {
    pdfSetFont(pdf, "normal");
    pdf.setFontSize(6.5);
    pdf.setTextColor(...MUTED);
    const footnote = `${yearLabel} ${year20.year}, ${savingsLabel}: ${formatMoney(
      year20.cumulativeSavings
    )}  ·  ${investmentLabel}: ${formatMoney(year20.cumulativeCost)}`;
    const footLines = pdf.splitTextToSize(footnote, CONTENT_W - pad * 2);
    footLines.forEach((line: string, i: number) => {
      pdf.text(line, MARGIN + pad, y + boxH - 8 + i * lh(6.5));
    });
  }

  return y + boxH + 12;
}

export function drawEnvRow(
  pdf: jsPDF,
  y: number,
  cards: { shortLabel: string; value: string; detail: string }[]
): number {
  const gap = 10;
  const cardW = (CONTENT_W - gap) / 2;
  const pad = 10;
  const innerW = cardW - pad * 2;

  let cardH = 58;
  const measured = cards.map((card) => {
    pdfSetFont(pdf, "bold");
    pdf.setFontSize(12);
    const vals = pdf.splitTextToSize(card.value, innerW);
    pdfSetFont(pdf, "normal");
    pdf.setFontSize(7);
    const details = pdf.splitTextToSize(card.detail, innerW);
    const h = 16 + vals.length * lh(12, 1.2) + 4 + details.length * lh(7) + 8;
    return { ...card, vals, details, h };
  });
  cardH = Math.max(cardH, ...measured.map((c) => c.h));

  measured.forEach((card, i) => {
    const x = MARGIN + i * (cardW + gap);
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(...BORDER);
    pdf.roundedRect(x, y, cardW, cardH, 4, 4, "FD");
    pdf.setFillColor(...GREEN);
    pdf.rect(x, y, cardW, 2.5, "F");

    pdfSetFont(pdf, "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(...GREEN);
    pdf.text(card.shortLabel, x + pad, y + 14);

    pdfSetFont(pdf, "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(...NAVY);
    card.vals.forEach((line: string, li: number) =>
      pdf.text(line, x + pad, y + 28 + li * lh(12, 1.2))
    );

    pdfSetFont(pdf, "normal");
    pdf.setFontSize(7);
    pdf.setTextColor(...MUTED);
    const dy = y + 28 + card.vals.length * lh(12, 1.2) + 4;
    card.details.forEach((line: string, li: number) =>
      pdf.text(line, x + pad, dy + li * lh(7))
    );
  });
  return y + cardH + 10;
}

export function drawContactBox(
  pdf: jsPDF,
  y: number,
  opts: {
    heading: string;
    website: string;
    websiteUrl: string;
    email: string;
    salesEmail: string;
    phone: string;
    salesPhone: string;
  }
): number {
  const h = 48;
  pdf.setFillColor(...NAVY);
  pdf.roundedRect(MARGIN, y, CONTENT_W, h, 4, 4, "F");
  pdf.setFillColor(...GREEN);
  pdf.rect(MARGIN, y, 3, h, "F");

  pdfSetFont(pdf, "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255);
  pdf.text(opts.heading, MARGIN + 10, y + 13);

  const mid = MARGIN + CONTENT_W / 2;
  pdfSetFont(pdf, "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(210, 220, 228);
  pdf.text(`${opts.website}: ${opts.websiteUrl}`, MARGIN + 10, y + 26);
  pdf.text(`${opts.email}: ${opts.salesEmail}`, MARGIN + 10, y + 37);
  pdf.setTextColor(...GREEN);
  pdfSetFont(pdf, "bold");
  pdf.text(opts.phone, mid, y + 28);
  pdfSetFont(pdf, "normal");
  pdf.setTextColor(255, 255, 255);
  pdf.text(opts.salesPhone, mid, y + 39);
  return y + h + 12;
}

/** Read autotable end position and restore active page. */
export function tableBottom(pdf: jsPDF): number {
  const last = (
    pdf as jsPDF & { lastAutoTable: { finalY: number; pageNumber: number } }
  ).lastAutoTable;
  pdf.setPage(last.pageNumber);
  return last.finalY;
}

const TABLE_HEAD: [number, number, number] = [0, 51, 73];
const TABLE_ALT: [number, number, number] = [248, 250, 251];

/** Simple two-column table, no autotable, explicit Y cursor. */
export function drawKeyValueTable(
  pdf: jsPDF,
  y: number,
  head: [string, string],
  rows: [string, string][],
  options: {
    startPage: number;
    docTitle: string;
    bottom: number;
    topY?: number;
    onNewPage: (page: number) => void;
  }
): { y: number; page: number } {
  const col1W = 210;
  const col2W = CONTENT_W - col1W;
  const padX = 4;
  const padY = 4;
  const fontSize = 8;
  const step = lh(fontSize, 1.35);
  let page = options.startPage;
  const topY = options.topY ?? BODY_TOP;

  const ensure = (needed: number) => {
    pdf.setPage(page);
    if (y + needed > options.bottom) {
      pdf.addPage();
      page += 1;
      pdf.setPage(page);
      options.onNewPage(page);
      y = topY;
    }
  };

  const drawRow = (
    cells: [string, string],
    opts: { header?: boolean; alt?: boolean }
  ) => {
    pdf.setPage(page);
    pdfSetFont(pdf, opts.header ? "bold" : "normal");
    pdf.setFontSize(fontSize);
    const left = pdf.splitTextToSize(cells[0], col1W - padX * 2);
    const right = pdf.splitTextToSize(cells[1], col2W - padX * 2);
    const rowH = Math.max(left.length, right.length) * step + padY * 2;
    ensure(rowH);

    if (opts.header) {
      pdf.setFillColor(...TABLE_HEAD);
      pdf.setTextColor(255, 255, 255);
    } else if (opts.alt) {
      pdf.setFillColor(...TABLE_ALT);
      pdf.setTextColor(...TEXT);
    } else {
      pdf.setFillColor(255, 255, 255);
      pdf.setTextColor(...TEXT);
    }
    pdf.setDrawColor(...BORDER);
    pdf.setLineWidth(0.2);
    pdf.rect(MARGIN, y, CONTENT_W, rowH, "FD");
    pdf.line(MARGIN + col1W, y, MARGIN + col1W, y + rowH);

    left.forEach((line: string, i: number) => {
      pdf.text(line, MARGIN + padX, y + padY + (i + 1) * step - 2);
    });
    const rightX = MARGIN + col1W + col2W - padX;
    right.forEach((line: string, i: number) => {
      pdf.text(line, rightX, y + padY + (i + 1) * step - 2, { align: "right" });
    });
    y += rowH;
  };

  drawRow(head, { header: true });
  rows.forEach((row, i) => drawRow(row, { alt: i % 2 === 1 }));
  return { y: y + 12, page };
}
