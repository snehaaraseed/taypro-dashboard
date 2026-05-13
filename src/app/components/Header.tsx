"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // const [isSolarMenuOpen, setIsSolarMenuOpen] = useState(true);
  const isSolarMenuOpen = true;
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Projects", href: "/projects" },
    {
      name: "ROI Calculator",
      href: "/solar-panel-cleaning-robot-price-calculator",
    },
    { name: "About Us", href: "/company" },
    { name: "Contact Us", href: "/contact" },
    { name: "Blogs", href: "/blog" },
  ];

  const solarMenu: {
    label: string;
    description?: string;
    href: string;
    isButton?: boolean;
  }[] = [
    {
      label: "Model-A",
      description: "Automatic solar cleaning robot",
      href: "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system",
    },
    {
      label: "Model-B",
      description: "Semi-automatic pick & place",
      href: "/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system",
    },
    {
      label: "Model-T",
      description: "Single-axis tracker cleaning",
      href: "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers",
    },
    {
      label: "Taypro Console",
      description: "Fleet monitoring & control",
      href: "/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app",
    },
    {
      label: "Taypro OPEX",
      description: "Robotic cleaning service",
      href: "/solar-panel-cleaning-system/solar-panel-cleaning-service",
    },
    {
      label: "View all robots",
      href: "/solar-panel-cleaning-system",
      isButton: true,
    },
  ];

  // fnc to check if current path matches the nav item
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const isSolarActive = () => {
    return pathname.startsWith("/solar-panel-cleaning-system");
  };

  return (
    <header className="sticky top-0 z-4 bg-[#052638]">
      <div className="p-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href={"/"}>
              <Image
                src="/tayproasset/taypro-logo.png"
                alt="Taypro Logo - Solar Panel Cleaning Robot Manufacturer"
                title="Taypro - Solar Panel Cleaning Robot Manufacturer Logo"
                width={160}
                height={50}
                style={{ width: "auto", height: "auto" }}
                priority
                quality={90}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 relative">
            {/* Home Link */}
            {navItems
              .filter((item) => item.name === "Home")
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
                Solar Panel Cleaning Robots
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
                <div className="absolute left-0 w-[22rem] max-w-[calc(100vw-2rem)] bg-white rounded-md shadow-lg z-10 p-2">
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
              .filter((item) => item.name !== "Home")
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
          <div className="hidden md:block">
            <Link
              href="tel:08043843569"
              title="Call us now"
              className="bg-[#A8C117] text-black px-7 py-3 rounded-md font-medium hover:bg-[#39D600] transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Call us now
            </Link>
          </div>

          {/* Mobile menu button and Call us now */}
          <div className="md:hidden flex items-center gap-3">
            <Link
              href="tel:08043843569"
              title="Call us now"
              className="bg-[#A8C117] text-black px-4 py-2 rounded-md font-medium text-sm hover:bg-[#39D600] transition-all duration-300 transform hover:scale-105"
            >
              Call us now
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-gray-300 focus:outline-none"
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
        <div className="md:hidden bg-[#052638] border-t border-gray-700">
          <div className="px-4 pt-4 pb-3 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                title="Nav Item"
                className={`text-white hover:text-gray-300 block px-3 py-2 text-base font-medium ${
                  isActive(item.href) ? "underline underline-offset-8" : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            {/* Solar Panel Cleaning Robots Parent */}
            <button
              className={`w-full text-left text-white hover:text-gray-300 block px-3 py-2 text-base font-medium flex justify-between items-center ${
                isSolarActive() ? "underline underline-offset-8" : ""
              }`}
            >
              Solar Panel Cleaning Robots
              <svg
                className={`h-4 w-4 transform transition-transform ${
                  isSolarMenuOpen ? "rotate-180" : "rotate-0"
                }`}
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
            </button>

            {/* Nested Solar Menu Links */}
            {isSolarMenuOpen &&
              solarMenu.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={
                    item.isButton
                      ? "block bg-[#A8C117] text-[#052638] px-4 py-2 rounded-md font-medium text-center hover:bg-[#39D600] transition-all duration-200 mx-auto my-2 text-sm w-fit"
                      : "ml-4 text-white hover:text-gray-300 block px-3 py-2"
                  }
                  onClick={() => setIsMenuOpen(false)}
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
        </div>
      )}
    </header>
  );
}
