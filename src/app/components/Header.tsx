"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import LocaleSwitcher from "@/app/components/LocaleSwitcher";
import { TAYPRO_SALES_PHONE_TEL } from "@/lib/contact";
import {
  HARDWARE_PRODUCT_IDS,
  PRODUCT_CATALOG,
} from "@/lib/products/catalog";

export default function Header() {
  const t = useTranslations("Navigation");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSolarMenuOpen, setIsSolarMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: t("home"), href: "/" },
    { name: t("projects"), href: "/projects" },
    {
      name: t("roiCalculator"),
      href: "/solar-panel-cleaning-robot-price-calculator#calculator",
    },
    { name: t("aboutUs"), href: "/company" },
    { name: t("contactUs"), href: "/contact" },
    { name: t("blogs"), href: "/blog" },
  ];

  const solarMenu: {
    label: string;
    description?: string;
    href: string;
    isButton?: boolean;
  }[] = [
    ...HARDWARE_PRODUCT_IDS.map((id) => {
      const p = PRODUCT_CATALOG[id];
      return {
        label: t(id),
        description: t(`${id}Desc`),
        href: p.href,
      };
    }),
    {
      label: t("nectyr"),
      description: t("nectyrDesc"),
      href: "/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app",
    },
    {
      label: t("tayproOpex"),
      description: t("tayproOpexDesc"),
      href: "/solar-panel-cleaning-system/solar-panel-cleaning-service",
    },
    {
      label: t("miny"),
      description: t("minyDesc"),
      href: "/solar-panel-cleaning-system/miny-compact-rooftop-cleaning-robot",
    },
    {
      label: t("cradyl"),
      description: t("cradylDesc"),
      href: "/solar-panel-cleaning-system/cradyl-row-transfer-docking-station",
    },
    {
      label: t("orion"),
      description: t("orionDesc"),
      href: "/solar-panel-cleaning-system/orion-plant-intelligence-platform",
    },
    {
      label: t("viewAllRobots"),
      href: "/solar-panel-cleaning-system",
      isButton: true,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const isSolarActive = () => {
    return pathname.startsWith("/solar-panel-cleaning-system");
  };

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    setIsSolarMenuOpen(false);
  };

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSolarMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const nav = document.getElementById("mobile-nav");
    if (nav) nav.scrollTop = 0;
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen || !isSolarMenuOpen) return;
    const frame = requestAnimationFrame(() => {
      document
        .getElementById("mobile-solar-section")
        ?.scrollIntoView({ block: "nearest" });
    });
    return () => cancelAnimationFrame(frame);
  }, [isMenuOpen, isSolarMenuOpen]);

  return (
    <header
      className={`z-50 bg-[#052638] ${
        isMenuOpen
          ? "fixed inset-0 flex flex-col overflow-hidden lg:sticky lg:inset-auto lg:overflow-visible"
          : "sticky top-0"
      }`}
    >
      <div className="p-4 shrink-0">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href={"/"} onClick={closeMobileMenu} aria-label="Taypro home">
              <Image
                src="/tayproasset/taypro-logo.png"
                alt="Taypro Logo - Solar Panel Cleaning Robot Manufacturer"
                title="Taypro - Solar Panel Cleaning Robot Manufacturer Logo"
                width={3696}
                height={1002}
                className="h-10 w-auto sm:h-12"
                priority
                quality={90}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8 relative z-50">
            {navItems
              .filter((item) => item.href === "/")
              .map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  title="Nav Item"
                  className={`text-white px-3 py-2 text-md font-medium transition-all duration-300 hover:underline underline-offset-8 hover:text-[#39D600] ${
                    isActive(item.href) ? "underline" : ""
                  }`}
                >
                  {item.name}
                </Link>
              ))}

            <div
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <div
                title="Solar Panel Cleaning Robot"
                className={`text-white px-3 py-2 text-md font-medium cursor-pointer flex items-center transition-all duration-300 hover:underline underline-offset-8 hover:text-[#39D600] ${
                  isSolarActive() ? "underline" : ""
                }`}
              >
                {t("solarRobotsMenu")}
                <svg
                  className="ml-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
              {dropdownOpen && (
                <div className="absolute left-0 top-full pt-2 w-[22rem] max-w-[calc(100vw-2rem)] bg-white rounded-md shadow-xl ring-1 ring-black/5 z-50 p-2">
                  {solarMenu.map((item) => (
                    <Link
                      href={item.href}
                      key={item.label}
                      title={item.label}
                      className={
                        item.isButton
                          ? "block bg-[#A8C117] text-[#052638] font-medium hover:bg-[#39D600] text-center mx-auto mt-2 mb-1 px-4 py-2 text-sm rounded-md transition-all duration-200 w-fit"
                          : "block px-4 py-2.5 rounded-md text-[#052638] hover:bg-[#39D600]/15 transition-colors duration-200 group"
                      }
                    >
                      {item.isButton ? (
                        item.label
                      ) : (
                        <span className="flex flex-col">
                          <span className="text-base font-semibold leading-snug group-hover:text-[#052638]">
                            {item.label}
                          </span>
                          {item.description && (
                            <span className="text-xs text-gray-500 leading-snug mt-0.5">
                              {item.description}
                            </span>
                          )}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navItems
              .filter((item) => item.href !== "/")
              .map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  title="Nav Item"
                  className={`text-white px-3 py-2 text-md font-medium transition-all duration-300 hover:underline underline-offset-8 hover:text-[#39D600] ${
                    isActive(item.href) ? "underline" : ""
                  }`}
                >
                  {item.name}
                </Link>
              ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-4">
            <LocaleSwitcher />
            <Link
              href={TAYPRO_SALES_PHONE_TEL}
              title={t("callUs")}
              className="bg-[#A8C117] text-black px-7 py-3 rounded-md font-medium hover:bg-[#39D600] transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              {t("callUs")}
            </Link>
          </div>

          {/* Mobile menu button and Call us now */}
          <div className="lg:hidden flex items-center gap-2 sm:gap-3">
            <LocaleSwitcher />
            <Link
              href={TAYPRO_SALES_PHONE_TEL}
              title={t("callUs")}
              className="bg-[#A8C117] text-black px-3 sm:px-4 py-2 rounded-md font-medium text-sm hover:bg-[#39D600] transition-all duration-300"
            >
              {t("callUs")}
            </Link>
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label={isMenuOpen ? t("closeMenu") : t("openMenu")}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
              className="text-white hover:text-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A8C117] rounded-md p-2 min-w-11 min-h-11 flex items-center justify-center shrink-0"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <nav
          id="mobile-nav"
          className="lg:hidden flex-1 min-h-0 overflow-y-auto overscroll-contain bg-[#052638] border-t border-gray-700 [-webkit-overflow-scrolling:touch]"
          aria-label="Mobile navigation"
        >
          <div className="px-4 pt-4 pb-6 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                title="Nav Item"
                className={`text-white hover:text-gray-300 block px-3 py-2.5 text-base font-medium min-h-10 flex items-center ${
                  isActive(item.href) ? "underline underline-offset-8" : ""
                }`}
                onClick={closeMobileMenu}
              >
                {item.name}
              </Link>
            ))}

            <div id="mobile-solar-section">
            <button
              type="button"
              onClick={() => setIsSolarMenuOpen((open) => !open)}
              aria-expanded={isSolarMenuOpen}
              className={`w-full text-left text-white hover:text-gray-300 px-3 py-2.5 text-base font-medium flex justify-between items-center gap-3 min-h-10 ${
                isSolarActive() ? "underline underline-offset-8" : ""
              }`}
            >
              <span>{t("solarRobotsMenu")}</span>
              <svg
                className={`h-4 w-4 shrink-0 transform transition-transform ${
                  isSolarMenuOpen ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isSolarMenuOpen && (
              <div className="space-y-1 pb-2">
                {solarMenu.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={
                      item.isButton
                        ? "block bg-[#A8C117] text-[#052638] px-4 py-3 rounded-md font-medium text-center hover:bg-[#39D600] transition-all duration-200 mx-3 my-2 text-sm w-fit min-h-11"
                        : "ml-3 text-white hover:text-gray-300 block px-3 py-3 min-h-11"
                    }
                    onClick={closeMobileMenu}
                  >
                    {item.isButton ? (
                      item.label
                    ) : (
                      <span className="flex flex-col">
                        <span className="text-base font-medium leading-snug">
                          {item.label}
                        </span>
                        {item.description && (
                          <span className="text-xs text-gray-400 leading-snug mt-0.5">
                            {item.description}
                          </span>
                        )}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
