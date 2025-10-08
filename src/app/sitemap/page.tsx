import Link from "next/link";
import { additionalProjects, energyResourceCards } from "../data";
import { Breadcrumbs } from "../components/Breadcrumbs";
import SEO from "../components/SEO";

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
      <SEO
        title="Sitemap | Taypro"
        description="Taypro Website Links"
        keywords="sitemap-xml, sitemap taypro, taypro"
        url="http://localhost:3000/sitemap"
        breadcrumbs={breadcrumbs}
      />
      <Breadcrumbs items={breadcrumbs} />
      <section className="w-full pt-20 pb-5 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          {/* Centered Sitemap Title */}
          <h1 className="text-[#052638] text-6xl font-semibold text-center mb-16">
            Sitemap
          </h1>

          {/* Posts Section */}
          <div className="text-start">
            <h2 className="text-[#052638] text-4xl font-semibold mb-8">
              Posts
            </h2>

            {/* Bulleted List */}
            <ul className="space-y-1 list-disc list-inside">
              {energyResourceCards.map((card, idx) => (
                <li key={idx} className="text-lg">
                  <Link
                    href={card.href}
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
          {/* Pages Section */}
          <div className="text-start">
            <h3 className="text-[#052638] text-4xl font-semibold mb-8">
              Pages
            </h3>

            {/* Nested Bulleted List */}
            <ul className="space-y-1 list-disc list-inside text-lg">
              <li>
                <Link
                  href="/company"
                  className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                >
                  Blogs
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                >
                  Contact
                </Link>
                <ul className="mt-2 ml-6 space-y-2 list-circle list-inside text-base">
                  <li>
                    <Link
                      href="/contact/thank-you"
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
                  className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                >
                  Projects
                </Link>
              </li>
              <li>
                <Link
                  href="/solar-panel-cleaning-robot-price-calculator"
                  className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                >
                  ROI Calculator
                </Link>
              </li>
              <li>
                <Link
                  href="/sitemap"
                  className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                >
                  Sitemap
                </Link>
              </li>
              <li>
                <Link
                  href="/solar-robots/solar-panel-cleaning-robot"
                  className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                >
                  Solar Panel Cleaning Robots
                </Link>
                <ul className="mt-2 ml-6 space-y-2 list-circle list-inside text-base">
                  <li>
                    <Link
                      href="/solar-robots/automatic-solar-panel-cleaning-robot"
                      className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                    >
                      Automatic Solar Panel Cleaning Robot
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/solar-robots/semi-automatic-solar-panel-cleaning-system"
                      className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                    >
                      Model-B
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/solar-robots/automatic-solar-panel-cleaning-system-for-single-axis-trackers"
                      className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                    >
                      Model-T
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/solar-robots/solar-panel-cleaning-service"
                      className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                    >
                      Solar Panel Cleaning Service
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/solar-robots/automatic-cleaning-robot-monitoring-app"
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
          {/* Portfolio Section */}
          <div className="text-start">
            <h4 className="text-[#052638] text-4xl font-semibold mb-8">
              Portfolio
            </h4>

            {/* Bulleted List */}
            <ul className="space-y-1 list-disc list-inside">
              {additionalProjects.map((card, idx) => (
                <li key={idx} className="text-lg">
                  <Link
                    href={card.href}
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
