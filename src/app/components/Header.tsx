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
  const [isSolarMenuOpen, setIsSolarMenuOpen] = useState(true);
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Projects", href: "/projects" },
    {
      name: "ROI Calculator",
      href: "/solar-panel-cleaning-robot-price-calculator",
    },
    { name: "About Us", href: "/company" },
    { name: "Blogs", href: "/blog" },
  ];

  const solarMenu = [
    {
      label: "Automatic Solar Panel Cleaning Robot",
      href: "/solar-robots/automatic-solar-panel-cleaning-robot",
    },
    {
      label: "Model-B",
      href: "/solar-robots/semi-automatic-solar-panel-cleaning-system",
    },
    {
      label: "Model-T",
      href: "/solar-robots/automatic-solar-panel-cleaning-system-for-single-axis-trackers",
    },
    {
      label: "Taypro Console",
      href: "/solar-robots/automatic-cleaning-robot-monitoring-app",
    },
    {
      label: "Solar Panel Cleaning Service",
      href: "/solar-robots/solar-panel-cleaning-service",
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
    return pathname.startsWith("/solar-robots");
  };

  return (
    <header className="sticky top-0 z-4 bg-[#052638]">
      <div className="p-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Image
              src="/tayproasset/taypro-logo.png"
              alt="taypro-logo"
              title="Taypro Logo"
              width={160}
              height={50}
              style={{ width: "auto", height: "auto" }}
              priority
            />
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
                  className={`text-white px-3 py-2 text-md font-medium transition duration-800 hover:underline underline-offset-8 ${
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
              <Link
                href="/solar-robots/solar-panel-cleaning-robot"
                title="Solar Panel Cleaning Robot"
                className={`text-white px-3 py-2 text-md font-medium cursor-pointer flex items-center transition duration-800 hover:underline underline-offset-8 ${
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
              </Link>
              {dropdownOpen && (
                <div className="absolute left-0 w-[400px] h-[350px] bg-white rounded-md shadow-lg z-10 py-1">
                  {solarMenu.map((item) => (
                    <Link
                      href={item.href}
                      key={item.label}
                      title="Robot Type"
                      className="block px-5 py-5 text-[#052638] text-xl transition-colors duration-200 hover:bg-[#A8C117] hover:text-[#052638] rounded-md"
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
                  className={`text-white px-3 py-2 text-md font-medium transition duration-800 hover:underline underline-offset-8 ${
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
              href="/contact"
              title="Contact"
              className="bg-[#A8C117] text-black px-7 py-3 rounded-md font-medium hover:bg-lime-500 transition"
            >
              Get in touch
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-gray-300 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
              onClick={() => {
                setIsMenuOpen(false);
                router.push("/solar-robots/solar-panel-cleaning-robot");
              }}
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
                  className="ml-6 text-white hover:text-gray-300 block px-3 py-2 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  • {item.label}
                </Link>
              ))}

            <Link
              href="/contact"
              title="Contact"
              className="block bg-[#A8C117] text-black px-5 py-2 rounded-md font-medium text-center hover:bg-lime-500 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Get in touch
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
