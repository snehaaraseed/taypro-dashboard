import { getTranslations } from "next-intl/server";
import FooterTrackedLinks, {
  type FooterLink,
} from "@/app/components/FooterTrackedLinks";

export default async function Footer() {
  const t = await getTranslations("Footer");
  const currentYear = new Date().getFullYear();

  const importantLinks: FooterLink[] = [
    { name: t("aboutUs"), href: "/company" },
    { name: t("investors"), href: "/company#investors" },
    { name: t("projects"), href: "/projects" },
    { name: t("blogs"), href: "/blog" },
    { name: t("contact"), href: "/contact" },
    { name: t("sitemap"), href: "/site-map" },
    { name: t("ourTechnology"), href: "/cleaning-technology" },
    { name: t("aiIntelligence"), href: "/technology/ai-intelligence" },
    { name: t("privacyPolicy"), href: "/privacy-policy" },
    { name: t("cookiePolicy"), href: "/cookie-policy" },
    { name: t("termsOfService"), href: "/terms-of-service" },
    {
      name: t("performanceMethodology"),
      href: "/performance-and-test-methodology",
    },
    {
      name: t("utilityOperations"),
      href: "/utility-scale-solar-operations",
    },
    {
      name: t("ourSolutions"),
      href: "/solar-panel-cleaning-system",
    },
    {
      name: t("cleaningService"),
      href: "/solar-panel-cleaning-system/solar-panel-cleaning-service",
    },
    {
      name: t("robotPriceGuide"),
      href: "/solar-panel-cleaning-robot-price-india",
    },
    {
      name: t("regionalGuides"),
      href: "/solar-panel-cleaning-system#state-guides",
    },
    {
      name: t("robotVsManual"),
      href: "/compare/solar-panel-cleaning-robot-vs-manual-cleaning",
    },
    {
      name: t("cleaningMachine"),
      href: "/solar-panel-cleaning-machine",
    },
    {
      name: t("press"),
      href: "/press",
    },
    {
      name: t("careers"),
      href: "/careers",
    },
    {
      name: t("roiCalculator"),
      href: "/solar-panel-cleaning-robot-price-calculator#calculator",
    },
  ];

  const importantLinksMid = Math.ceil(importantLinks.length / 2);
  const importantLinksLeft = importantLinks.slice(0, importantLinksMid);
  const importantLinksRight = importantLinks.slice(importantLinksMid);

  const exploreProducts: FooterLink[] = [
    {
      name: "Semi-Automatic Solar Panel Cleaning Robot",
      href: "/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system",
    },
    {
      name: "Automatic Solar Panel Cleaning Robot",
      href: "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system",
    },
    {
      name: "Single-Axis Tracker Solar Panel Cleaning Robot",
      href: "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers",
    },
  ];

  return (
    <footer className="bg-[#052638]">
      <FooterTrackedLinks
        mailLabel={t("mail")}
        phoneLabel={t("phone")}
        emailLinkText={t("emailLink")}
        importantLinksLeft={importantLinksLeft}
        importantLinksRight={importantLinksRight}
        exploreProducts={exploreProducts}
        copyright={t("copyright").replace("{year}", String(currentYear))}
      />
    </footer>
  );
}
