"use client";
import { Facebook, Instagram, Linkedin, Youtube, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ContactEmailLink } from "@/app/components/ContactEmailLink";
import { ContactPhoneLink } from "@/app/components/ContactPhoneLink";
import { trackOutboundClick } from "@/lib/analytics/track-event";
import { useState, useEffect } from "react";

export default function Footer() {
  const t = useTranslations("Footer");
  const pathnameHook = usePathname();
  const [pathname, setPathname] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  
  // Only set pathname after component mounts to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    setPathname(pathnameHook);
  }, [pathnameHook]);

  const currentYear = new Date().getFullYear();

  const importantLinks = [
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
      name: t("roiCalculator"),
      href: "/solar-panel-cleaning-robot-price-calculator#calculator",
    },
  ];

  const importantLinksMid = Math.ceil(importantLinks.length / 2);
  const importantLinksLeft = importantLinks.slice(0, importantLinksMid);
  const importantLinksRight = importantLinks.slice(importantLinksMid);

  return (
    <footer className="bg-[#052638]">
      {/* Top Bar - Mail, Phone, Social Icons */}
      <div className="max-w-7xl mx-auto px-12 sm:px-12 lg:px-20 py-4 border-[#17405c]">
        <div className="flex flex-col md:flex-row justify-between w-full gap-20">
          <div className="md:w-1/2">
            <div className="flex flex-col sm:flex-row items-start gap-4 text-white text-2xl">
              <span>
                {t("mail")}:{" "}
                <ContactEmailLink className="hover:text-[#A8C117]" location="footer">
                  {t("emailLink")}
                </ContactEmailLink>
              </span>
              <span className="hidden sm:block mx-2"></span>
              <span>
                {t("phone")}:{" "}
                <ContactPhoneLink location="footer" className="hover:text-[#A8C117]" />
              </span>
            </div>
          </div>
          <div className="flex justify-between md:w-1/3">
            <div className="flex items-center gap-2">
          <a
            href="https://www.facebook.com/taypro.official"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Taypro on Facebook"
            onClick={() =>
              trackOutboundClick({
                url: "https://www.facebook.com/taypro.official",
                platform: "facebook",
                location: "footer",
              })
            }
          >
            <div className="bg-[#F1EFE6] p-2 rounded-md flex items-center justify-center hover:bg-[#e6e8F1] transition-colors">
              <Facebook className="text-[#052638] w-6 h-6" />
            </div>
          </a>
          <a
            href="https://x.com/taypro_official"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Taypro on X"
            onClick={() =>
              trackOutboundClick({
                url: "https://x.com/taypro_official",
                platform: "x",
                location: "footer",
              })
            }
          >
            <div className="bg-[#F1EFE6] p-2 rounded-md flex items-center justify-center hover:bg-[#e6e8F1] transition-colors">
              <X className="text-[#052638] w-6 h-6" />
            </div>
          </a>
          <a
            href="https://www.instagram.com/taypro_official/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Taypro on Instagram"
            onClick={() =>
              trackOutboundClick({
                url: "https://www.instagram.com/taypro_official/",
                platform: "instagram",
                location: "footer",
              })
            }
          >
            <div className="bg-[#F1EFE6] p-2 rounded-md flex items-center justify-center hover:bg-[#e6e8F1] transition-colors">
              <Instagram className="text-[#052638] w-6 h-6" />
            </div>
          </a>
          <a
            href="https://www.linkedin.com/company/taypro"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Taypro on LinkedIn"
            onClick={() =>
              trackOutboundClick({
                url: "https://www.linkedin.com/company/taypro",
                platform: "linkedin",
                location: "footer",
              })
            }
          >
            <div className="bg-[#F1EFE6] p-2 rounded-md flex items-center justify-center hover:bg-[#e6e8F1] transition-colors">
              <Linkedin className="text-[#052638] w-6 h-6" />
            </div>
          </a>
          <a
            href="https://www.youtube.com/c/taypro"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Taypro on YouTube"
            onClick={() =>
              trackOutboundClick({
                url: "https://www.youtube.com/c/taypro",
                platform: "youtube",
                location: "footer",
              })
            }
          >
            <div className="bg-[#F1EFE6] p-2 rounded-md flex items-center justify-center hover:bg-[#e6e8F1] transition-colors">
              <Youtube className="text-[#052638] w-6 h-6" />
            </div>
          </a>
            </div>
          </div>
        </div>
      </div>

      <div className=" max-w-7xl mx-auto px-12 sm:px-12 lg:px-20 py-10 mb-4">
        {/* Main Footer Content */}
        <div className="  flex flex-col md:flex-row justify-between w-full mb-8 gap-20">
          {/* Company Info (Explore) */}
          <div className="md:w-1/2 ">
            <div className="text-lg text-white mb-4">Explore</div>
            <div className="space-y-5">
              {[
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
              ].map((item) => {
                // Only check active state after mount to avoid hydration mismatch
                const active = mounted && pathname === item.href;
                return (
                  <div className="group cursor-pointer" key={item.name}>
                    <hr
                      className={`border-white mb-4 transition-colors duration-300 ${
                        active
                          ? "border-[#A8C117]"
                          : "group-hover:border-[#A8C117]"
                      }`}
                    />
                    <a
                      href={item.href}
                      className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
                        active
                          ? "text-[#A8C117]"
                          : "text-white group-hover:text-[#A8C117]"
                      }`}
                    >
                      {item.name}
                    </a>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Links */}
          <div className="flex justify-between  md:w-1/3">
            {/* Left Column */}
            <div>
              <div className="text-lg text-white mb-4">Important Links</div>
              <ul className="space-y-2">
                {importantLinksLeft.map((link) => {
                  const active = mounted && pathname === link.href;
                  return (
                    <li key={link.name} className="relative">
                      <Link
                        href={link.href}
                        className={`transition duration-200 relative inline-block group ${
                          active
                            ? "text-[#A8C117]"
                            : "text-gray-300 hover:text-[#A8C117]"
                        }`}
                      >
                        {link.name}
                        <span
                          className={`absolute left-0 bottom-0 h-0.5 bg-[#A8C117] transition-all duration-300 ease-out origin-left ${
                            active ? "w-full" : "w-0 group-hover:w-full"
                          }`}
                        ></span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Right Column */}
            <div>
              <div className="text-lg text-white mb-4 invisible">
                Important Links
              </div>
              <ul className="space-y-2">
                {importantLinksRight.map((link) => {
                  const active = mounted && pathname === link.href;
                  return (
                    <li key={link.name} className="relative">
                      <Link
                        href={link.href}
                        className={`transition duration-200 relative inline-block group ${
                          active
                            ? "text-[#A8C117]"
                            : "text-gray-300 hover:text-[#A8C117]"
                        }`}
                      >
                        {link.name}
                        <span
                          className={`absolute left-0 bottom-0 h-0.5 bg-[#A8C117] transition-all duration-300 ease-out origin-left ${
                            active ? "w-full" : "w-0 group-hover:w-full"
                          }`}
                        ></span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="pt-5">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-lg">
              {t("copyright", { year: currentYear })}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
