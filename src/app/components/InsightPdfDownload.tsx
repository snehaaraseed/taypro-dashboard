"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { loadTayproLetterheadsForPdf } from "@/lib/roi-calculator/pdf-letterhead";
import { parseReportHtmlForPdf } from "@/lib/insights/parse-report-html-for-pdf";
import {
  buildInsightPdfDocument,
  insightPdfFilename,
  type InsightPdfLabels,
} from "@/lib/insights/build-insight-pdf";
import { loadInsightHeroForPdf } from "@/lib/insights/insight-pdf-assets";
import type { InsightPdfDownloadLabels } from "@/lib/insights/insight-pdf-labels";
import { trackInsightReportPdf } from "@/lib/analytics/track-event";

type InsightPdfDownloadProps = {
  slug: string;
  title: string;
  description: string;
  contentHtml: string;
  pdfLabels: InsightPdfLabels;
  downloadLabels: InsightPdfDownloadLabels;
};

export function InsightPdfDownload({
  slug,
  title,
  description,
  contentHtml,
  pdfLabels,
  downloadLabels,
}: InsightPdfDownloadProps) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const parsed = parseReportHtmlForPdf(contentHtml);
      const [autoTableModule, letterheads, hero] = await Promise.all([
        import("jspdf-autotable"),
        loadTayproLetterheadsForPdf(),
        loadInsightHeroForPdf(),
      ]);
      const autoTable = autoTableModule.default;

      const pdf = await buildInsightPdfDocument({
        reportTitle: title,
        reportDescription: description,
        parsed,
        letterheads,
        autoTable,
        labels: pdfLabels,
        hero,
      });

      pdf.save(insightPdfFilename(slug));
      trackInsightReportPdf({ slug, pagePath: pathname });
    } catch (error) {
      console.error("[InsightPdfDownload]", error);
      alert(downloadLabels.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={() => void handleDownload()}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-[#052638] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0a3a52] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? downloadLabels.downloadLoading : downloadLabels.download}
      </button>
    </div>
  );
}
