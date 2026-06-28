import "server-only";

import type { PressReleaseData } from "@/lib/cms/pressReleaseService";
import type { PressTarget, PressTargetField } from "@/lib/press/press-targets";
import { SITE_URL } from "@/lib/seo/sitemap-config";

export const PRESS_RELEASES_PATH = "/press/releases";

export function pressReleasePublicUrl(slug: string): string {
  return `${SITE_URL}${PRESS_RELEASES_PATH}/${slug}`;
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/blockquote>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildSummary(release: PressReleaseData): string {
  return release.subhead || stripHtml(release.content).slice(0, 280);
}

function buildFullBody(release: PressReleaseData): string {
  const quoteBlock = release.quotes
    .map((q) => `"${q.text}"\n— ${q.attribution}`)
    .join("\n\n");
  const parts = [
    release.dateline,
    "",
    stripHtml(release.content),
    quoteBlock ? `\n${quoteBlock}` : "",
    "",
    release.boilerplate,
    "",
    `Official release: ${pressReleasePublicUrl(release.slug)}`,
  ];
  return parts.filter((p) => p !== undefined).join("\n").trim();
}

function buildFullHtmlBody(release: PressReleaseData): string {
  const quoteHtml = release.quotes
    .map(
      (q) =>
        `<blockquote><p>"${q.text}"</p><cite>— ${q.attribution}</cite></blockquote>`
    )
    .join("");
  return `${release.content}${quoteHtml}<p><strong>Official release:</strong> <a href="${pressReleasePublicUrl(release.slug)}">${pressReleasePublicUrl(release.slug)}</a></p>`;
}

export function mapReleaseField(
  release: PressReleaseData,
  field: PressTargetField
): string {
  switch (field) {
    case "title":
      return release.title;
    case "summary":
      return buildSummary(release);
    case "body":
      return buildFullBody(release);
    case "contactName":
      return release.contact.name;
    case "contactEmail":
      return release.contact.email;
    case "imageUrl":
      return release.featuredImage
        ? release.featuredImage.startsWith("http")
          ? release.featuredImage
          : `${SITE_URL}${release.featuredImage}`
        : `${SITE_URL}/tayproasset/taypro-logo.png`;
    default:
      return "";
  }
}

export type PressSiteExport = {
  targetId: string;
  targetName: string;
  submitUrl: string;
  method: "form" | "email";
  emailTo?: string;
  fields: Record<string, string>;
  plainText: string;
  htmlBody: string;
};

export function exportReleaseForTarget(
  release: PressReleaseData,
  target: PressTarget
): PressSiteExport {
  const fields: Record<string, string> = {};
  for (const field of target.fields) {
    fields[field] = mapReleaseField(release, field);
  }

  const fieldLines = target.fields
    .map((f) => `--- ${f.toUpperCase()} ---\n${fields[f] ?? ""}`)
    .join("\n\n");

  const emailHeader =
    target.method === "email" && target.emailTo
      ? `To: ${target.emailTo}\nSubject: ${release.title}\n\n`
      : "";

  return {
    targetId: target.id,
    targetName: target.name,
    submitUrl: target.submitUrl,
    method: target.method,
    emailTo: target.emailTo,
    fields,
    plainText: `${emailHeader}${fieldLines}\n\nSubmit at: ${target.submitUrl}`,
    htmlBody: buildFullHtmlBody(release),
  };
}

export function exportReleaseForAllTargets(
  release: PressReleaseData,
  targets: PressTarget[]
): PressSiteExport[] {
  return targets.map((t) => exportReleaseForTarget(release, t));
}

export function buildExportBundleText(
  release: PressReleaseData,
  exports: PressSiteExport[]
): string {
  const header = `PRESS RELEASE EXPORT — ${release.title}\nCanonical URL: ${pressReleasePublicUrl(release.slug)}\n${"=".repeat(60)}\n\n`;
  const sections = exports.map(
    (e) =>
      `## ${e.targetName} (${e.method})\nSubmit: ${e.submitUrl}${e.emailTo ? `\nEmail: ${e.emailTo}` : ""}\n\n${e.plainText}\n\n${"─".repeat(40)}\n`
  );
  return header + sections.join("\n");
}
