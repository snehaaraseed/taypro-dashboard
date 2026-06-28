import "server-only";

import type { CategoryPulseMetrics } from "@/lib/insights/category-pulse-data";
import { generateTranslationJson } from "@/lib/translation/gemini-call";

type PulseNarrativeResponse = {
  overview: string;
  queryMovementIntro: string;
  pageMovementIntro: string;
  strikingDistanceIntro: string;
  actionsIntro: string;
  methodologyNote: string;
};

function formatDelta(value: number | null, suffix = ""): string {
  if (value == null) return "-";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}${suffix}`;
}

function renderQueryTable(metrics: CategoryPulseMetrics): string {
  const rows = metrics.topQueries
    .map((q) => {
      const ctrPct = (q.ctr * 100).toFixed(1);
      return `<tr>
  <td>${escapeHtml(q.query)}</td>
  <td>${q.impressions}</td>
  <td>${q.clicks}</td>
  <td>${ctrPct}%</td>
  <td>${q.position.toFixed(1)}</td>
  <td>${formatDelta(q.impressionsDelta)}</td>
  <td>${formatDelta(q.positionDelta != null ? q.positionDelta : null)}</td>
</tr>`;
    })
    .join("\n");

  return `<table>
<thead>
<tr><th>Query</th><th>Impressions</th><th>Clicks</th><th>CTR</th><th>Position</th><th>Imp. Δ</th><th>Pos. Δ</th></tr>
</thead>
<tbody>
${rows}
</tbody>
</table>`;
}

function renderPageTable(metrics: CategoryPulseMetrics): string {
  if (metrics.keyPages.length === 0) {
    return "<p>No key landing pages recorded impressions in this lookback window.</p>";
  }
  const rows = metrics.keyPages
    .map((p) => {
      const ctrPct = (p.ctr * 100).toFixed(1);
      return `<tr>
  <td>${escapeHtml(p.path)}</td>
  <td>${p.impressions}</td>
  <td>${p.clicks}</td>
  <td>${ctrPct}%</td>
  <td>${p.position.toFixed(1)}</td>
  <td>${formatDelta(p.impressionsDelta)}</td>
</tr>`;
    })
    .join("\n");

  return `<table>
<thead>
<tr><th>Page</th><th>Impressions</th><th>Clicks</th><th>CTR</th><th>Position</th><th>Imp. Δ</th></tr>
</thead>
<tbody>
${rows}
</tbody>
</table>`;
}

function renderStrikingList(metrics: CategoryPulseMetrics): string {
  if (metrics.strikingDistance.length === 0) {
    return "<p>No striking-distance opportunities identified this period.</p>";
  }
  const items = metrics.strikingDistance
    .map(
      (o) =>
        `<li><strong>${escapeHtml(o.query)}</strong>, position ${o.position.toFixed(1)}, ${o.impressions} impressions, ${(o.ctr * 100).toFixed(1)}% CTR (${o.reason.replace(/_/g, " ")})</li>`
    )
    .join("\n");
  return `<ul>${items}</ul>`;
}

function renderActionsList(metrics: CategoryPulseMetrics): string {
  const items = metrics.recommendedActions
    .map(
      (a) =>
        `<li><strong>${escapeHtml(a.action)}</strong>, ${escapeHtml(a.rationale)}</li>`
    )
    .join("\n");
  return `<ol>${items}</ol>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildGeminiPrompt(metrics: CategoryPulseMetrics): string {
  return `You write concise editorial prose for Taypro's monthly Category Pulse report on utility-scale solar cleaning search visibility in India.

Use ONLY the JSON metrics below. Do NOT invent statistics, rankings, or market share figures.

Return JSON with these string fields (each 1-3 sentences, plain text, no HTML):
- overview
- queryMovementIntro
- pageMovementIntro
- strikingDistanceIntro
- actionsIntro
- methodologyNote (mention ${metrics.lookbackDays}-day GSC lookback and weekly sync)

Metrics:
${JSON.stringify(metrics, null, 2)}`;
}

function defaultNarrative(metrics: CategoryPulseMetrics): PulseNarrativeResponse {
  const momNote = metrics.hasPriorSnapshot
    ? `Compared against the ${metrics.priorPeriod} snapshot.`
    : "Baseline month, no prior snapshot for month-over-month comparison.";

  return {
    overview: `This Category Pulse summarizes Google Search Console performance for solar cleaning and robotic O&M queries on ${metrics.siteUrl}. ${momNote} We tracked ${metrics.summary.categoryQueriesTracked} category queries with ${metrics.summary.totalImpressions} total impressions and ${metrics.summary.totalClicks} clicks in the last ${metrics.lookbackDays} days.`,
    queryMovementIntro:
      "The table below lists top category queries by impressions. Delta columns compare against the prior monthly snapshot when available.",
    pageMovementIntro:
      "Key Taypro commercial and educational landing pages, hub, service, calculator, price guide, and state guides.",
    strikingDistanceIntro: `${metrics.summary.strikingDistanceCount} queries sit in striking distance (positions 8–15) where content and internal linking can move rankings quickly.`,
    actionsIntro:
      "Prioritized actions derived from query and page movement this period:",
    methodologyNote: `Data pulled from Google Search Console using a rolling ${metrics.lookbackDays}-day window. Taypro syncs GSC weekly for blog and SEO automation. Figures are directional, not financial or fleet performance claims.`,
  };
}

function wrapParagraph(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("<")) return trimmed;
  return `<p>${escapeHtml(trimmed)}</p>`;
}

export async function generateCategoryPulseContent(
  metrics: CategoryPulseMetrics
): Promise<string> {
  let narrative: PulseNarrativeResponse;
  try {
    narrative = await generateTranslationJson<PulseNarrativeResponse>(
      buildGeminiPrompt(metrics)
    );
  } catch (error) {
    console.warn(
      "[category-pulse] Gemini narrative failed, using template:",
      error instanceof Error ? error.message : error
    );
    narrative = defaultNarrative(metrics);
  }

  const baselineNote = metrics.hasPriorSnapshot
    ? `<p>Month-over-month deltas compare to the ${escapeHtml(metrics.priorPeriod ?? "")} snapshot.</p>`
    : `<p><em>Baseline month, no prior snapshot. Month-over-month deltas will appear from next month.</em></p>`;

  return [
    wrapParagraph(narrative.overview),
    baselineNote,
    `<h2>Overview</h2>`,
    `<p>Category queries tracked: <strong>${metrics.summary.categoryQueriesTracked}</strong>. Total impressions: <strong>${metrics.summary.totalImpressions}</strong>. Total clicks: <strong>${metrics.summary.totalClicks}</strong>.</p>`,
    `<h2>Query movement</h2>`,
    wrapParagraph(narrative.queryMovementIntro),
    renderQueryTable(metrics),
    `<h2>Landing page movement</h2>`,
    wrapParagraph(narrative.pageMovementIntro),
    renderPageTable(metrics),
    `<h2>Striking distance</h2>`,
    wrapParagraph(narrative.strikingDistanceIntro),
    renderStrikingList(metrics),
    `<h2>Recommended actions</h2>`,
    wrapParagraph(narrative.actionsIntro),
    renderActionsList(metrics),
    `<h2>Methodology note</h2>`,
    wrapParagraph(narrative.methodologyNote),
  ].join("\n");
}

export function buildCategoryPulseDescription(
  metrics: CategoryPulseMetrics
): string {
  return `Google Search Console category pulse for ${metrics.period}: ${metrics.summary.totalImpressions} impressions across ${metrics.summary.categoryQueriesTracked} solar cleaning queries (${metrics.lookbackDays}-day window).`;
}
