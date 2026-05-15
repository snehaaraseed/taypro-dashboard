import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "../components/Breadcrumbs";
import {
  PERFORMANCE_METHODOLOGY_PATH,
  PERFORMANCE_METHODOLOGY_TITLE,
} from "@/lib/seo/performance-methodology";
import { SITE_URL } from "@/lib/seo/sitemap-config";

const siteUrl = SITE_URL;
const lastUpdated = "May 15, 2026";

export const metadata: Metadata = {
  title: PERFORMANCE_METHODOLOGY_TITLE,
  description:
    "How Taypro defines, tests, and reports 99%+ dust-removal claims, soiling-related generation recovery, and platform-specific performance for solar cleaning robots in India.",
  openGraph: {
    title: `${PERFORMANCE_METHODOLOGY_TITLE} | Taypro`,
    description:
      "Definitions, test context, and site-dependent qualifiers for Taypro solar cleaning robot performance figures.",
    url: `${siteUrl}${PERFORMANCE_METHODOLOGY_PATH}`,
    type: "article",
  },
  alternates: {
    canonical: `${siteUrl}${PERFORMANCE_METHODOLOGY_PATH}`,
  },
};

const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: PERFORMANCE_METHODOLOGY_TITLE, href: "" },
];

export default function PerformanceAndTestMethodologyPage() {
  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <div className="min-h-screen">
        <section className="w-full bg-white py-12 md:py-16">
          <div className="max-w-3xl mx-auto px-6">
            <h1 className="text-[#052638] font-semibold text-4xl md:text-5xl mb-4 text-center">
              {PERFORMANCE_METHODOLOGY_TITLE}
            </h1>
            <p className="text-[#5a7a8f] text-center text-sm mb-12">
              Last updated: {lastUpdated}
            </p>

            <section className="mb-10">
              <h2 className="text-[#052638] font-semibold text-2xl mb-4">
                Purpose
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                This page explains how Taypro Private Limited defines, measures,
                and communicates performance figures on taypro.in — including
                &ldquo;99%+&rdquo; dust-removal statements and references to
                generation or performance ratio recovery. It is intended for asset
                owners, EPC teams, and O&amp;M leads evaluating robotic dry
                cleaning for utility-scale PV in India.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[#052638] font-semibold text-2xl mb-4">
                What &ldquo;99%+ dust removal&rdquo; means
              </h2>
              <ul className="list-disc list-inside space-y-2 text-[#27415c] text-lg leading-relaxed pl-1">
                <li>
                  <strong>Dust removal</strong> is the fraction of loose surface
                  particulate removed from the module glass in one completed
                  cleaning pass (Model-B) or automated dual-pass cycle (Model-A,
                  Model-T), under defined test or field conditions.
                </li>
                <li>
                  It does <strong>not</strong> mean the solar panel converts 99%
                  of sunlight to electricity, nor that the plant will gain 99% more
                  energy output.
                </li>
                <li>
                  Figures are <strong>platform-dependent</strong>: brush-based
                  semi-automatic paths (Model-B) and dual-pass autonomous paths
                  (Model-A / Model-T) use different mechanics and are quoted per
                  pass or per cycle accordingly.
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-[#052638] font-semibold text-2xl mb-4">
                Generation recovery vs. module efficiency
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                Soiling on Indian utility plants can suppress usable output when
                washing is infrequent — industry discussions often cite roughly{" "}
                <strong>8–25%</strong> seasonal soiling loss depending on region,
                tilt, and O&amp;M practice. Robotic dry cleaning aims to{" "}
                <strong>recover energy that would otherwise be lost to dust</strong>
                , not to raise nameplate module efficiency.
              </p>
              <p className="text-[#27415c] text-lg leading-relaxed mt-4">
                Actual MWh recovered depends on your baseline soiling, cleaning
                cadence, tariff, and weather. Taypro does not publish a single
                universal &ldquo;efficiency increase %&rdquo; for all sites. Use
                the{" "}
                <Link
                  href="/solar-panel-cleaning-robot-price-calculator"
                  className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
                >
                  ROI calculator
                </Link>{" "}
                for directional economics, then request a plant-specific
                assessment from our applications team.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[#052638] font-semibold text-2xl mb-4">
                How we test and validate
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed mb-4">
                Taypro validates cleaning performance through a combination of:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-[#27415c] text-lg leading-relaxed pl-1">
                <li>
                  <strong>Controlled bench and field trials</strong> on
                  representative module types, using standardised artificial and
                  natural dust loads where applicable.
                </li>
                <li>
                  <strong>Visual and gravimetric checks</strong> (before/after
                  surface condition and mass of removed dust) on deployed platforms.
                </li>
                <li>
                  <strong>Operational data</strong> from live fleets — cycle
                  completion, route coverage, and performance ratio trends where
                  customers share SCADA or IV data under NDA.
                </li>
                <li>
                  <strong>Third-party review</strong> — selected platforms are TÜV
                  NORD certified; certification scope is stated on product
                  datasheets and proposals.
                </li>
              </ol>
              <p className="text-[#5a7a8f] text-base leading-relaxed mt-4">
                Results vary with dust type (agricultural film, sand, pollen,
                post-storm mix), module tilt, tracker motion, and whether one or two
                passes are completed in a cycle.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[#052638] font-semibold text-2xl mb-4">
                Platform summary
              </h2>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead className="bg-[#052638] text-white">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Platform</th>
                      <th className="px-4 py-3 font-semibold">
                        Typical quoted metric
                      </th>
                      <th className="px-4 py-3 font-semibold">Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white text-[#27415c]">
                    <tr>
                      <td className="px-4 py-3 font-medium text-[#052638]">
                        Model-A (automatic)
                      </td>
                      <td className="px-4 py-3">
                        99%+ dust per automated dual-pass cycle
                      </td>
                      <td className="px-4 py-3">
                        Airflow + microfiber drum; autonomous row run
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-[#052638]">
                        Model-B (semi-automatic)
                      </td>
                      <td className="px-4 py-3">
                        99%+ dust per single forward pass
                      </td>
                      <td className="px-4 py-3">
                        Counter-rotating PBT brushes; operator placement per row
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-[#052638]">
                        Model-T (trackers)
                      </td>
                      <td className="px-4 py-3">
                        99%+ dust per dual-pass cycle on tracker tables
                      </td>
                      <td className="px-4 py-3">
                        Dual-pass dry cleaning with flexible bridge; tracker
                        compatibility per site assessment
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-[#052638] font-semibold text-2xl mb-4">
                Uptime and service commitments
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                Marketing references to &ldquo;highest uptime&rdquo; or
                &ldquo;same-day breakdown&rdquo; response describe Taypro service{" "}
                <strong>targets</strong> backed by pan-India spares, Taypro Console
                remote diagnostics, and AMC programs. Contractual SLAs are defined
                in customer agreements, not on this page.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[#052638] font-semibold text-2xl mb-4">
                Plant-specific documentation
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                For tenders, lender diligence, or internal technical review, Taypro
                can provide site-specific cleaning plans, cycle assumptions, and —
                where available — anonymised field outcomes from comparable
                deployments.{" "}
                <Link
                  href="/contact"
                  className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
                >
                  Contact our applications team
                </Link>{" "}
                with plant capacity, layout, and location.
              </p>
            </section>

            <section className="rounded-xl border border-gray-200 bg-[#f8fafb] px-5 py-4 text-base text-[#27415c]">
              <p>
                Related:{" "}
                <Link
                  href="/cleaning-technology"
                  className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
                >
                  Cleaning technology
                </Link>
                ,{" "}
                <Link
                  href="/solar-panel-cleaning-system"
                  className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
                >
                  Solar panel cleaning systems
                </Link>
                ,{" "}
                <Link
                  href="/terms-of-service"
                  className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
                >
                  Terms of Service
                </Link>
                .
              </p>
            </section>
          </div>
        </section>
      </div>
    </>
  );
}
