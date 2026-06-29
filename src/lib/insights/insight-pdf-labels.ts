import type { InsightPdfLabels } from "@/lib/insights/build-insight-pdf";
import { getTayproEmailAddress, TAYPRO_SALES_PHONE_DISPLAY } from "@/lib/contact";
import { SITE_URL } from "@/lib/seo/sitemap-config";

type InsightDetailTranslate = (
  key: string,
  values?: Record<string, string | number | Date>,
) => string;

export type InsightPdfDownloadLabels = {
  download: string;
  downloadLoading: string;
  error: string;
};

/** Hero download button copy — resolved on the server (same as PDF body labels). */
export function buildInsightPdfDownloadLabels(
  t: InsightDetailTranslate,
): InsightPdfDownloadLabels {
  return {
    download: t("pdf.download"),
    downloadLoading: t("pdf.downloadLoading"),
    error: t("pdf.error"),
  };
}

/** Resolve PDF copy on the server so labels are not tied to client-side namespace cache. */
export function buildInsightPdfLabels(options: {
  t: InsightDetailTranslate;
  publishedDateLabel: string;
}): InsightPdfLabels {
  const { t, publishedDateLabel } = options;

  return {
    docTitle: t("pdf.docTitle"),
    eyebrow: t("eyebrowResearch"),
    publishedOn: t("pdf.publishedOn", { date: publishedDateLabel }),
    disclaimerShort: t("pdf.disclaimerShort"),
    disclaimerHeading: t("pdf.disclaimerHeading"),
    disclaimerBody: t("pdf.disclaimerBody"),
    websiteUrl: SITE_URL.replace(/^https?:\/\//, ""),
    tocHeading: t("contents"),
    aboutHeading: t("pdf.aboutHeading"),
    aboutBody: t("pdf.aboutBody"),
    statCapacityLabel: t("pdf.statCapacityLabel"),
    statCapacityValue: t("pdf.statCapacityValue"),
    statSitesLabel: t("pdf.statSitesLabel"),
    statSitesValue: t("pdf.statSitesValue"),
    statWaterLabel: t("pdf.statWaterLabel"),
    statWaterValue: t("pdf.statWaterValue"),
    nextStepsHeading: t("pdf.nextStepsHeading"),
    nextStepsBody: t("pdf.nextStepsBody"),
    contactHeading: t("pdf.contactHeading"),
    contactWebsite: t("pdf.contactWebsite"),
    contactEmail: t("pdf.contactEmail"),
    contactPhone: t("pdf.contactPhone"),
    salesEmail: getTayproEmailAddress("sales"),
    salesPhone: TAYPRO_SALES_PHONE_DISPLAY,
  };
}
