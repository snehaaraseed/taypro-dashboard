import Image from "next/image";
import { modelBCards } from "@/app/data";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import ProjectsCard from "@/app/components/ProjectsCard";
import ModelCards from "@/app/components/ModelCards";
import HeroSection from "@/app/components/Herosection";
import FeaturesSection from "@/app/components/FeaturesSection";
import ResourcesCard from "@/app/components/ResourcesCard";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Model-B | A pick-and-place type solar panel cleaning robot.",
  description:
    "Key Features Setting Taypro ApartThe Taypro Model-B is not just another cleaning device; it’s a result of meticulous study and analysis aimed at addressing prevalent issues in solar power plants. The innovative cleaning assembly and driving mechanism elevate its compatibility, making it suitable for fixed tilt, seasonal tilt, and horizontal single-axis trackers.",
  keywords:
    "semi-automatic solar robots, solar panel cleaning system, taypro model b, waterless cleaning technology, operation efficiency",
  openGraph: {
    title: "Model-B | A pick-and-place type solar panel cleaning robot",
    description:
      "Key Features Setting Taypro ApartThe Taypro Model-B is not just another cleaning device; it’s a result of meticulous study and analysis aimed at addressing prevalent issues in solar power plants. The innovative cleaning assembly and driving mechanism elevate its compatibility, making it suitable for fixed tilt, seasonal tilt, and horizontal single-axis trackers.",
    url: "http://localhost:3000/solar-robots/semi-automatic-solar-panel-cleaning-system",
    type: "website",
  },
};

const breadcrumbs = [
  { name: "Home", href: "/" },
  {
    name: "Solar Panel Cleaning Robots",
    href: "/solar-robots/solar-panel-cleaning-robot",
  },
  {
    name: "Model-B",
    href: "",
  },
];

export default function SemiAutomaticSolarPanelCleaningRobot() {
  const benefits = [
    "Waterless Cleaning Technology",
    "Long-lasting Battery Power",
    "Scratch-free Cleaning",
    "Fast Cleaning Speed",
    "Fastest ROI",
    "Easy Operation",
  ];
  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <div className="min-h-screen overflow-x-hidden px-4 sm:px-6 lg:px-0">
        <HeroSection
          title="Model-B"
          subtitle="A pick-and-place type solar panel cleaning robot."
          imgSrc="/tayprorobots/taypro-opex.jpg"
          imgAlt="Taypro Opex"
          ctaHref="/contact"
          ctaText="Request a quote"
        />

        <FeaturesSection
          headline={
            <>
              Key Features Setting
              <br />
              Taypro Apart
            </>
          }
          description={
            "The Taypro Model-B is not just another cleaning device; it’s a result of meticulous study and analysis aimed at addressing prevalent issues in solar power plants. The innovative cleaning assembly and driving mechanism elevate its compatibility, making it suitable for fixed tilt, seasonal tilt, and horizontal single-axis trackers. This adaptability extends to solar panel rows of any size, showcasing a device that thrives amidst irregularities and undulations."
          }
          benefits={benefits}
        />

        <section
          className="w-full py-5 pb-20 bg-white"
          style={{
            background: "url('/tayprobglayout/taypro-curves.png') repeat",
            backgroundSize: "auto",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-16">
            <div className="lg:w-1/2 flex flex-col items-center lg:items-start">
              <h1 className="text-[#052638] font-semibold text-4xl lg:text-5xl mb-12 text-center lg:text-left leading-tight">
                Elevating ROI through Efficient Cleaning
              </h1>
              <div className="relative w-full max-w-xs sm:max-w-sm lg:w-96 h-64 lg:h-80 mx-auto lg:mx-0">
                <Image
                  src="/tayproasset/taypro-robotImage.png"
                  alt="Taypro cleaning robot"
                  title="Taypro Cleaning Robot"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <div className="lg:w-1/2 space-y-6">
              <p className="text-[#6B7280] text-lg leading-relaxed">
                The impact of clean solar panels on the overall performance and
                efficiency of solar power plants cannot be overstated.
                Taypro&apos;s cutting-edge technology contributes to a
                significant increase in the rate of return, often exceeding 15%.
                This not only underscores the economic viability of solar energy
                but positions Taypro as a leader in optimizing the financial
                gains associated with solar panel maintenance.
              </p>

              <p className="text-[#6B7280] text-lg leading-relaxed">
                In the ever-evolving landscape of solar energy, Taypro 2.0 Basic
                emerges as a beacon of innovation, revolutionizing solar panel
                maintenance. Its water-less cleaning technology, long-lasting
                battery power, scratch-free cleaning mechanism, fast cleaning
                speed, and rapid ROI make it the undisputed choice for solar
                power plants. As the industry embraces the future, Taypro stands
                at the forefront, shaping the narrative of efficient and
                sustainable solar panel cleaning practices. If you are looking
                for a Fully Automated Solution, please have a look at TAYPRO
                AMS.
              </p>

              <p className="text-[#6B7280] text-lg leading-relaxed">
                If you don&apos;t want to own and invest in the Capex of the
                robots, we can provide you cleaning service which can help you
                to improve the energy generation of the plant.
              </p>
            </div>
          </div>
        </section>

        <ProjectsCard showHeader={true} headerText="Our Most Recent Projects" />

        <ResourcesCard />

        <section className="w-full min-h-[640px] bg-[#052C42] flex items-center">
          <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-16 w-full">
            <div className="lg:w-1/2 flex justify-center">
              <h2 className="text-white font-semibold text-5xl lg:text-6xl leading-tight">
                Transforming Solar Panel Cleaning Practices
              </h2>
            </div>

            <div className="lg:w-1/2">
              <p className="text-white text-lg lg:text-xl leading-relaxed">
                The solar panel cleaning landscape has evolved into a critical
                industry best practice. Taypro&apos;s commitment to providing
                the best cleaning solutions in India is evident across
                residential, industrial, and commercial rooftop installations,
                as well as ground-mounted solar power plants, whether on-grid,
                off-grid, or hybrid PV systems.
              </p>
            </div>
          </div>
        </section>

        <ModelCards title="Looking for more solutions?" cards={modelBCards} />

        <RequestEstimateForm />
      </div>
    </>
  );
}
