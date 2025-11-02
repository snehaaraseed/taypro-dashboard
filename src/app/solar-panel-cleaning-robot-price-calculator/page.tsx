"use client";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import ROITayproCalculator from "../components/ROICalculator";

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
      </div>
    </>
  );
}
