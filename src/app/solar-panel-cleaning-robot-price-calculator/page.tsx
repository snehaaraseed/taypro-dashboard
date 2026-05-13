"use client";
import Link from "next/link";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import ROITayproCalculator from "../components/ROICalculator";
import OpenLeadModalButton from "@/app/components/OpenLeadModalButton";

const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: "ROI Calculator", href: "" },
];

export default function ROICalculator() {
  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <div className="min-h-screen">
        <section
          className="bg-white min-h-[80vh] flex flex-col items-center justify-start relative"
          style={{
            background: "url('/tayprobglayout/taypro-roi-bg.png') no-repeat",
            backgroundSize: "cover",
          }}
        >
          <div className="pt-10 px-4">
            <h1 className="font-semibold text-[#052638] text-5xl md:text-7xl mb-7 text-center">
              Calculate How Much Can Solar
              <br />
              Cleaning Robots Save?
            </h1>
            <h2 className="text-green-700 my-10 text-xl text-center">
              Solar Cleaning robots not only increase the overall efficiency of
              the solar power plant but also save significant costs.
            </h2>

            <h3 className="text-gray-700 my-6 text-2xl text-center max-w-6xl px-4">
              Note: ROI is calculated based on certain assumptions and general
              real-life scenarios. The actual ROI may vary slightly after a
              detailed analysis of the plant and specific conditions.
            </h3>
          </div>

          <ROITayproCalculator />

          <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none">
            <svg
              className="w-full h-24 md:h-40"
              viewBox="0 0 1440 320"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path fill="#052638" d="M0,224L1440,96L1440,320L0,320Z" />
            </svg>
          </div>
        </section>

        {/* Methodology + internal links + CTA */}
        <section className="bg-[#052638] py-16 sm:py-20">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
              How this calculator works
            </div>
            <h2 className="text-white font-semibold text-3xl sm:text-4xl mb-6 leading-tight">
              What goes into the numbers
            </h2>
            <div className="space-y-5 text-white/85 text-base sm:text-lg leading-relaxed">
              <p>
                The Solar Panel Cleaning Robot ROI calculator above takes the
                size of your plant, the per-kWh tariff, the assumed soiling
                loss, and a representative cleaning cycle cost, and converts
                those into an annual generation gain, water savings, and a
                payback estimate. The model assumes utility-scale conditions
                similar to the Indian plants where Taypro robots are deployed
                today — fixed-tilt or single-axis tracker, dusty agricultural
                or arid environments, and 3–10 dry cleaning cycles per month.
              </p>
              <p>
                For a more accurate number, your final figures depend on the
                exact{" "}
                <Link
                  href="/cleaning-technology"
                  className="text-[#A8C117] hover:underline"
                >
                  cleaning technology and dual-pass methodology
                </Link>{" "}
                we apply, the robot model chosen for your layout (
                <Link
                  href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system"
                  className="text-[#A8C117] hover:underline"
                >
                  Model-A
                </Link>
                ,{" "}
                <Link
                  href="/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system"
                  className="text-[#A8C117] hover:underline"
                >
                  Model-B
                </Link>
                , or{" "}
                <Link
                  href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers"
                  className="text-[#A8C117] hover:underline"
                >
                  Model-T
                </Link>
                ), and whether you procure on CAPEX or as{" "}
                <Link
                  href="/solar-panel-cleaning-system/solar-panel-cleaning-service"
                  className="text-[#A8C117] hover:underline"
                >
                  Taypro OPEX (pay per panel cleaned)
                </Link>
                . If you&apos;re still deciding between models, our{" "}
                <Link
                  href="/solar-panel-cleaning-system"
                  className="text-[#A8C117] hover:underline"
                >
                  Solar Panel Cleaning Robot overview
                </Link>{" "}
                lays them side by side.
              </p>
              <p>
                Numbers shown by this tool are directional. A short call with
                our applications team turns them into a plant-specific quote —
                including soiling study scope, cycle cadence, and a draft SLA.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <OpenLeadModalButton
                topic="Solar Panel Cleaning Robot quote (ROI calculator)"
                title="Get a tailored ROI quote"
                subtitle="Share a few plant details — our team will turn the calculator estimate into a precise number for your site."
                className="inline-flex items-center justify-center min-h-[48px] bg-[#A8C117] text-[#052638] font-medium px-8 py-3.5 rounded-md hover:bg-[#b3cf3d] transition text-center"
              >
                Get a tailored ROI quote
              </OpenLeadModalButton>
              <Link
                href="/solar-panel-cleaning-system"
                className="inline-flex items-center justify-center min-h-[48px] border-2 border-white/70 text-white font-medium px-8 py-3.5 rounded-md hover:bg-white/10 transition text-center"
              >
                Compare Taypro robots
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
