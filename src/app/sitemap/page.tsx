import Link from "next/link";
import { additionalProjects, energyResourceCards } from "../data";
import { Breadcrumbs } from "../components/Breadcrumbs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sitemap | Taypro – Complete Website Navigation",
  description:
    "Browse Taypro’s sitemap to quickly access all website sections, including projects, services, and company information.",
  keywords: "sitemap-xml, sitemap taypro, taypro",
  openGraph: {
    title: "Sitemap | Taypro – Complete Website Navigation",
    description:
      "Browse Taypro’s sitemap to quickly access all website sections, including projects, services, and company information.",
    url: "https://taypro-dashboard.vercel.app/sitemap",
    type: "website",
  },
};

const breadcrumbs = [
  { name: "Home", href: "/" },
  {
    name: "Sitemap",
    href: "",
  },
];

export default function Blog() {
  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <section className="w-full pt-20 pb-5 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <h1 className="text-[#052638] text-6xl font-semibold text-center mb-16">
            Sitemap
          </h1>

          <div className="text-start">
            <h3 className="text-[#052638] text-4xl font-semibold mb-8">
              Posts
            </h3>

            <ul className="space-y-1 list-disc list-inside">
              {energyResourceCards.map((card, idx) => (
                <li key={idx} className="text-lg">
                  <Link
                    href={card.href}
                    title="Energy Resources"
                    className="text-[#7CB342] hover:text-[#689F38] transition-colors duration-200 font-medium"
                  >
                    {card.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="w-full pt-10 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="text-start">
            <h3 className="text-[#052638] text-4xl font-semibold mb-8">
              Pages
            </h3>

            <ul className="space-y-1 list-disc list-inside text-lg">
              <li>
                <Link
                  href="/company"
                  title="About Us"
                  className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  title="Blog"
                  className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                >
                  Blogs
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  title="Contact"
                  className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                >
                  Contact
                </Link>
                <ul className="mt-2 ml-6 space-y-2 list-circle list-inside text-base">
                  <li>
                    <Link
                      href="/contact/thank-you"
                      title="Thank You Page"
                      className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                    >
                      Thank You
                    </Link>
                  </li>
                </ul>
              </li>
              <li>
                <Link
                  href="/"
                  title="Home"
                  className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  title="Privacy Policy"
                  className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  title="Projects"
                  className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                >
                  Projects
                </Link>
              </li>
              <li>
                <Link
                  href="/solar-panel-cleaning-robot-price-calculator"
                  title="ROI Calculator"
                  className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                >
                  ROI Calculator
                </Link>
              </li>
              <li>
                <Link
                  href="/sitemap"
                  title="Sitemap"
                  className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                >
                  Sitemap
                </Link>
              </li>
              <li>
                <Link
                  href="/solar-panel-cleaning-system"
                  title="Solar Robots Solar Panel Cleaning Robot"
                  className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                >
                  Solar Panel Cleaning Robots
                </Link>
                <ul className="mt-2 ml-6 space-y-2 list-circle list-inside text-base">
                  <li>
                    <Link
                      href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system"
                      title="Automatic Solar Panel CLeaning Robot"
                      className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                    >
                      Automatic Solar Panel Cleaning Robot
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system"
                      title="Semi-automatic Solar Panel Cleaning System"
                      className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                    >
                      Model-B
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers"
                      title="Model-T"
                      className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                    >
                      Model-T
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/solar-panel-cleaning-system/solar-panel-cleaning-service"
                      title="Solar Panel Cleanign Service"
                      className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                    >
                      Solar Panel Cleaning Service
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app"
                      title="Automatic Cleaning Robot App"
                      className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                    >
                      Taypro Console
                    </Link>
                  </li>
                </ul>
              </li>
              <li>
                <Link
                  href="/cleaning-technology"
                  title="Cleaning Technology"
                  className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                >
                  The Technology Behind Taypro
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="w-full pt-10 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="text-start">
            <h3 className="text-[#052638] text-4xl font-semibold mb-8">
              Portfolio
            </h3>

            <ul className="space-y-1 list-disc list-inside">
              {additionalProjects.map((card, idx) => (
                <li key={idx} className="text-lg">
                  <Link
                    href={card.href}
                    title="Solar Project"
                    className="text-[#7CB342] hover:text-[#689F38] transition-colors duration-200 font-medium"
                  >
                    {card.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
