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

  const solarMenu = [
    {
      label: "Automatic Solar Panel Cleaning Robot",
      href: "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system",
    },
    {
      label: "Model-B",
      href: "/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system",
    },
    {
      label: "Model-T",
      href: "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers",
    },
    {
      label: "Taypro Console",
      href: "/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app",
    },
    {
      label: "Solar Panel Cleaning Service",
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
                <div className="absolute left-0 w-[400px] bg-white rounded-md shadow-lg z-10 py-1">
                  {solarMenu.map((item) => (
                    <Link
                      href={item.href}
                      key={item.label}
                      title="Robot Type"
                      className={
                        item.isButton
                          ? "block bg-[#A8C117] text-black font-medium hover:bg-[#39D600] text-center mx-auto my-1 px-3 py-2 text-xl rounded-md transition-all duration-300 w-fit"
                          : "block px-5 py-3 text-xl text-[#052638] hover:bg-[#39D600] hover:text-[#052638] rounded-md transition-all duration-300 transform hover:translate-x-1"
                      }
                    >
                      {item.label}
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
                      ? "block bg-[#A8C117] text-black px-3 py-1.5 rounded-md font-medium text-center hover:bg-[#39D600] transition-all duration-300 transform hover:scale-105 mx-auto my-1 text-base w-fit"
                      : "ml-6 text-white hover:text-gray-300 block px-3 py-2 text-base font-medium"
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.isButton ? item.label : `• ${item.label}`}
                </Link>
              ))}
          </div>
        </div>
      )}
    </header>
  );
}
