"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import LocaleSwitcher from "@/app/components/LocaleSwitcher";
import { TAYPRO_SALES_PHONE_TEL } from "@/lib/contact";
import { trackNavigationClick, trackPhoneClick } from "@/lib/analytics/track-event";
import {
  HARDWARE_PRODUCT_IDS,
  PRODUCT_CATALOG,
} from "@/lib/products/catalog";

const HOME_HERO_DARK_NAV_OFFSET = 64;

export default function Header() {
  const t = useTranslations("Navigation");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSolarMenuOpen, setIsSolarMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isHomeHeroTransparent = isHomePage && !isScrolled && !isMenuOpen;

  const trackNav = (label: string, href: string, location = "header") => {
    trackNavigationClick({ label, href, location });
  };

  const navItems = [
    { name: t("home"), href: "/" },
    { name: t("projects"), href: "/projects" },
    {
      name: t("roiCalculator"),
      href: "/solar-panel-cleaning-robot-price-calculator#calculator",
    },
    { name: t("aboutUs"), href: "/company" },
    { name: t("careers"), href: "/careers" },
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
    if (!isHomePage) {
      setIsScrolled(false);
      return;
    }

    const updateScroll = () => {
      setIsScrolled(window.scrollY > HOME_HERO_DARK_NAV_OFFSET);
    };

    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, [isHomePage]);

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

  const headerPositionClass = isMenuOpen
    ? "fixed inset-0 flex flex-col overflow-hidden lg:sticky lg:inset-auto lg:overflow-visible"
    : isHomePage
      ? "fixed inset-x-0 top-0"
      : "sticky top-0";

  return (
    <header
      className={`z-50 transition-colors duration-300 ${headerPositionClass} ${
        isHomeHeroTransparent ? "bg-transparent" : "bg-[#052638]"
      }`}
    >
      <div className="shrink-0 px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex h-14 min-w-0 flex-nowrap items-center justify-between gap-2 sm:gap-3 lg:grid lg:h-16 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-3 xl:gap-4">
          {/* Logo — left */}
          <div className="shrink-0 justify-self-start">
            <Link href={"/"} onClick={closeMobileMenu} aria-label="Taypro home">
              <Image
                src="/tayproasset/taypro-logo.webp"
                alt="Taypro Logo - Solar Panel Cleaning Robot Manufacturer"
                title="Taypro - Solar Panel Cleaning Robot Manufacturer Logo"
                width={400}
                height={108}
                sizes="(max-width: 640px) 160px, 200px"
                className="h-9 w-auto sm:h-10 lg:h-10 xl:h-11 2xl:h-12"
                priority={!isHomePage}
                fetchPriority={isHomePage ? "low" : undefined}
                loading={isHomePage ? "lazy" : undefined}
                quality={75}
              />
            </Link>
          </div>

          {/* Desktop navigation — centered */}
          <nav
            className="relative z-50 hidden min-w-0 flex-nowrap items-center justify-center gap-0.5 justify-self-center lg:flex lg:gap-1 2xl:gap-2"
            aria-label="Main navigation"
          >
            {navItems
              .filter((item) => item.href === "/")
              .map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  title="Nav Item"
                  onClick={() => trackNav(item.name, item.href)}
                  className={`whitespace-nowrap px-2 py-2 text-sm font-medium text-white transition-all duration-300 hover:text-[#39D600] hover:underline underline-offset-8 2xl:px-3 2xl:text-base ${
                    isActive(item.href) ? "underline" : ""
                  }`}
                >
                  {item.name}
                </Link>
              ))}

            <div
              className="relative shrink-0"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <div
                title={t("solutionsTitle")}
                className={`flex cursor-pointer items-center whitespace-nowrap px-2 py-2 text-sm font-medium text-white transition-all duration-300 hover:text-[#39D600] hover:underline underline-offset-8 2xl:px-3 2xl:text-base ${
                  isSolarActive() ? "underline" : ""
                }`}
              >
                {t("solutions")}
                <svg
                  className="ml-1 h-4 w-4 shrink-0 2xl:ml-2"
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
                <div className="absolute left-1/2 top-full z-50 w-[22rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 pt-2">
                  <div className="rounded-md bg-white p-2 shadow-xl ring-1 ring-black/5">
                    {solarMenu.map((item) => (
                      <Link
                        href={item.href}
                        key={item.label}
                        title={item.label}
                        onClick={() => trackNav(item.label, item.href, "header_solutions")}
                        className={
                          item.isButton
                            ? "mx-auto mb-1 mt-2 block w-fit rounded-md bg-[#A8C117] px-4 py-2 text-center text-sm font-medium text-[#052638] transition-all duration-200 hover:bg-[#39D600]"
                            : "group block rounded-md px-4 py-2.5 text-[#052638] transition-colors duration-200 hover:bg-[#39D600]/15"
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
                              <span className="mt-0.5 text-xs leading-snug text-gray-500">
                                {item.description}
                              </span>
                            )}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
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
                  onClick={() => trackNav(item.name, item.href)}
                  className={`whitespace-nowrap px-2 py-2 text-sm font-medium text-white transition-all duration-300 hover:text-[#39D600] hover:underline underline-offset-8 2xl:px-3 2xl:text-base ${
                    isActive(item.href) ? "underline" : ""
                  }`}
                >
                  {item.name}
                </Link>
              ))}
          </nav>

          {/* Language + Talk to Expert (+ mobile menu) — right */}
          <div className="flex shrink-0 items-center justify-end gap-2 justify-self-end sm:gap-3">
            <LocaleSwitcher />
            <Link
              href={TAYPRO_SALES_PHONE_TEL}
              title={t("callUs")}
              onClick={() => trackPhoneClick("header")}
              className="whitespace-nowrap rounded-md bg-[#A8C117] px-3 py-2 text-sm font-medium text-black transition-all duration-300 hover:bg-[#39D600] sm:px-4 lg:hover:scale-105 lg:hover:shadow-lg 2xl:px-6 2xl:py-2.5 2xl:text-base"
            >
              {t("callUs")}
            </Link>
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label={isMenuOpen ? t("closeMenu") : t("openMenu")}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
              className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md p-2 text-white hover:text-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A8C117] lg:hidden"
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
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain border-t border-gray-700 bg-[#052638] [-webkit-overflow-scrolling:touch] lg:hidden"
          aria-label="Mobile navigation"
        >
          <div className="px-4 pt-4 pb-6 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                title="Nav Item"
                onClick={() => {
                  trackNav(item.name, item.href, "mobile_nav");
                  closeMobileMenu();
                }}
                className={`text-white hover:text-gray-300 block px-3 py-2.5 text-base font-medium min-h-10 flex items-center ${
                  isActive(item.href) ? "underline underline-offset-8" : ""
                }`}
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
              <span>{t("solutions")}</span>
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
                    onClick={() => {
                      trackNav(item.label, item.href, "mobile_solutions");
                      closeMobileMenu();
                    }}
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
