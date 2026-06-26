/**
 * Sends custom events directly to GA4 via gtag.js (no per-event GTM tags needed).
 * GTM still handles page views and other marketing tags.
 *
 * Mark `generate_lead` as a conversion in GA4 Admin → Events.
 */
import { sendGa4Event } from "./ga4-client";

export type AnalyticsLocation =
  | "header"
  | "footer"
  | "contact_page"
  | "legal_page"
  | "hero"
  | "modal"
  | "slide_in"
  | "product_page"
  | "projects_grid"
  | "blog_list"
  | "blog_similar"
  | "home_blog"
  | "compare_page"
  | "buyer_intent_page"
  | "not_found"
  | "calculator_page"
  | "navigation"
  | "breadcrumb"
  | "unknown";

type TrackEventParams = Record<string, string | number | boolean | undefined>;

function trackEvent(eventName: string, params?: TrackEventParams): void {
  sendGa4Event(eventName, params);
}

function slugFromHref(href: string, prefix: string): string {
  const path = href.split("?")[0]?.split("#")[0] ?? href;
  if (!path.startsWith(prefix)) return path;
  return path.slice(prefix.length).replace(/^\/+/, "") || path;
}

export function inferLinkType(href: string): string {
  const path = href.split("?")[0]?.split("#")[0] ?? href;
  if (path.startsWith("/blog/")) return "blog";
  if (path.startsWith("/compare/")) return "compare";
  if (path.startsWith("/projects/")) return "project";
  if (path.includes("calculator")) return "calculator";
  if (path.startsWith("/solar-panel-cleaning")) return "product";
  return "internal";
}

export function trackContentClick(options: {
  href: string;
  title?: string;
  location?: string;
  linkType?: string;
}): void {
  const linkType = options.linkType ?? inferLinkType(options.href);
  const base = {
    link_url: options.href,
    link_title: options.title,
    link_location: options.location ?? "unknown",
  };

  switch (linkType) {
    case "blog":
      trackEvent("blog_click", {
        ...base,
        blog_slug: slugFromHref(options.href, "/blog/"),
      });
      break;
    case "compare":
      trackEvent("compare_click", {
        ...base,
        compare_slug: slugFromHref(options.href, "/compare/"),
      });
      break;
    case "project":
      trackEvent("project_click", {
        ...base,
        project_slug: slugFromHref(options.href, "/projects/"),
        project_title: options.title,
      });
      break;
    case "calculator":
      trackEvent("calculator_click", base);
      break;
    case "product":
      trackEvent("product_click", base);
      break;
    default:
      trackEvent("internal_link_click", { ...base, link_type: linkType });
  }
}

export function trackBlogClick(options: {
  slug: string;
  title?: string;
  location?: string;
}): void {
  trackEvent("blog_click", {
    blog_slug: options.slug,
    link_title: options.title,
    link_location: options.location ?? "unknown",
    link_url: `/blog/${options.slug}`,
  });
}

export function trackCompareClick(options: {
  slug: string;
  title?: string;
  location?: string;
}): void {
  trackEvent("compare_click", {
    compare_slug: options.slug,
    link_title: options.title,
    link_location: options.location ?? "unknown",
    link_url: `/compare/${options.slug}`,
  });
}

export function trackPhoneClick(location: AnalyticsLocation): void {
  trackEvent("phone_click", { link_location: location });
}

export function trackEmailClick(
  location: AnalyticsLocation,
  mailbox?: string,
): void {
  trackEvent("email_click", { link_location: location, mailbox });
}

export function trackGenerateLead(options: {
  formType: string;
  pagePath?: string;
  source?: string;
  topic?: string;
}): void {
  trackEvent("generate_lead", {
    form_type: options.formType,
    page_path: options.pagePath,
    cta_source: options.source,
    cta_topic: options.topic,
  });
}

export function trackLeadModalOpen(options: {
  source?: string;
  topic?: string;
}): void {
  trackEvent("lead_modal_open", {
    cta_source: options.source,
    cta_topic: options.topic,
  });
}

export function trackVideoPlay(options: {
  videoId: string;
  title?: string;
  location?: AnalyticsLocation;
}): void {
  trackEvent("video_play", {
    video_id: options.videoId,
    video_title: options.title,
    link_location: options.location ?? "unknown",
  });
}

export function trackProjectClick(options: {
  projectSlug: string;
  projectTitle?: string;
}): void {
  trackEvent("project_click", {
    project_slug: options.projectSlug,
    project_title: options.projectTitle,
  });
}

export function trackOutboundClick(options: {
  url: string;
  platform?: string;
  location?: AnalyticsLocation;
}): void {
  trackEvent("outbound_click", {
    link_url: options.url,
    platform: options.platform,
    link_location: options.location ?? "unknown",
  });
}

export function trackCtaClick(options: {
  ctaName: string;
  location?: AnalyticsLocation;
  destination?: string;
}): void {
  trackEvent("cta_click", {
    cta_name: options.ctaName,
    link_location: options.location ?? "unknown",
    link_destination: options.destination,
  });
}

export function trackNavigationClick(options: {
  label: string;
  href: string;
  location?: string;
}): void {
  trackEvent("navigation_click", {
    nav_label: options.label,
    link_url: options.href,
    link_location: options.location ?? "navigation",
  });
}

export function trackLocaleChange(options: {
  fromLocale: string;
  toLocale: string;
  pagePath: string;
}): void {
  trackEvent("locale_change", {
    from_locale: options.fromLocale,
    to_locale: options.toLocale,
    page_path: options.pagePath,
  });
}

export function trackRoiCalculatorRun(options: {
  plantType: string;
  installationType: string;
  automationLevel: string;
  plantCapacityMw: number;
  marketId: string;
  roiTimelineYears: number;
  procurementModel?: string;
  pagePath?: string;
}): void {
  trackEvent("roi_calculator_run", {
    plant_type: options.plantType,
    installation_type: options.installationType,
    automation_level: options.automationLevel,
    plant_capacity_mw: options.plantCapacityMw,
    market_id: options.marketId,
    roi_timeline_years: options.roiTimelineYears,
    procurement_model: options.procurementModel,
    page_path: options.pagePath,
  });
}

export function trackRoiCalculatorPdf(options: {
  plantType: string;
  marketId: string;
  pagePath?: string;
}): void {
  trackEvent("roi_calculator_pdf", {
    plant_type: options.plantType,
    market_id: options.marketId,
    page_path: options.pagePath,
  });
}

export function trackNotFoundRecovery(options: {
  recoveryType: "did_you_mean" | "quick_link";
  destination: string;
  label?: string;
}): void {
  trackEvent("not_found_recovery", {
    recovery_type: options.recoveryType,
    link_url: options.destination,
    link_title: options.label,
  });
}

export function trackSlideInOpen(options: { pagePath: string }): void {
  trackEvent("slide_in_open", { page_path: options.pagePath });
}
