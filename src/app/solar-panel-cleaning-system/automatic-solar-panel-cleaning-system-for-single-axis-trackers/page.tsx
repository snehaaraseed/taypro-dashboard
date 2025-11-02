import Image from "next/image";
import { modelTCards } from "@/app/data";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import ProjectsCard from "@/app/components/ProjectsCard";
import ModelCards from "@/app/components/ModelCards";
import ClientsCard from "@/app/components/ClientsCard";
import HeroSection from "@/app/components/Herosection";
import EnergyResourceCard from "@/app/components/EnergyResourceCard";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  title: "Single-Axis Tracker Solar Panel Cleaning Robot | Model-T | Taypro",
  description:
    "Model-T: Autonomous Solar Panel Cleaning Robot designed specifically for single-axis tracker systems. Precision operation with individual and group commands, tailored cleaning based on seasonal data and tracker position. Optimized for maximum efficiency.",
  keywords: [
    "Single-Axis Tracker Solar Panel Cleaning Robot",
    "Model-T solar panel cleaning robot",
    "solar panel cleaning robot for trackers",
    "single-axis tracker cleaning robot",
    "automatic solar panel cleaning robot",
    "tracker solar panel cleaning",
    "taypro model T",
    "taypro single axis tracker",
    "solar tracker cleaning robot",
  ],
  openGraph: {
    title: "Single-Axis Tracker Solar Panel Cleaning Robot | Model-T | Taypro",
    description:
      "Model-T: Autonomous Solar Panel Cleaning Robot for single-axis trackers. Precision operation with tailored cleaning commands based on seasonal data.",
    url: `${siteUrl}/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/tayproasset/taypro-robotImage.png`,
        width: 1200,
        height: 630,
        alt: "Taypro Single-Axis Tracker Solar Panel Cleaning Robot Model-T",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Single-Axis Tracker Solar Panel Cleaning Robot | Model-T | Taypro",
    description:
      "Autonomous Solar Panel Cleaning Robot for single-axis trackers. Precision cleaning with tailored commands.",
    images: [`${siteUrl}/tayproasset/taypro-robotImage.png`],
  },
  alternates: {
    canonical: `${siteUrl}/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers`,
  },
};

const breadcrumbs = [
  { name: "Home", href: "/" },
  {
    name: "Solar Panel Cleaning Robots",
    href: "/solar-panel-cleaning-system",
  },
  {
    name: "Model-T",
    href: "",
  },
];

export default function AutomaticSolarPanelCleaningSystem() {
  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <div className="min-h-screen overflow-x-hidden px-4 sm:px-6 lg:px-0">
        <HeroSection
          title="Model-T"
          subtitle="Autonomous solar panel cleaning robot for single-axis trackers"
          imgSrc="/tayprorobots/taypro-modelT-img.png"
          imgAlt="Taypro Single-Axis Tracker Solar Panel Cleaning Robot Model-T - Autonomous robotic cleaning system for tracking solar panel installations"
          ctaHref="/contact"
          ctaText="Request a quote"
        />

        <section
          className="w-full py-30 bg-white px-4 sm:px-6 lg:px-0"
          style={{
            background: "url('/tayprobglayout/taypro-semi.png') repeat",
            backgroundSize: "auto",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0">
            <div className="text-center mb-12">
              <div className="text-[#A8C117] text-md font-medium mb-6">
                TAYPRO MODEL-T
              </div>
              <h3 className="text-[#052638] font-semibold text-3xl md:text-4xl lg:text-5xl leading-tight max-w-4xl mx-auto">
                AUTONOMOUS WATERLESS SOLAR PANEL CLEANING ROBOT FOR SINGLE AXIS
                TRACKER INSTALLATIONS
              </h3>
            </div>

            {/* Mobile Layout */}
            <div className="block lg:hidden">
              <div className="relative w-full h-[300px] sm:h-[400px] overflow-hidden">
                <Image
                  src="/tayprorobots/taypro-modelT-img.png"
                  alt="TAYPRO MODEL-T cleaning solar panels"
                  title="TAYPRO MODEL-T"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div className="bg-[#7da300] p-6 mx-4">
                <h4 className="text-white text-start text-xl sm:text-2xl mb-4">
                  The Innovation Behind the MODEL-T
                </h4>
                <p className="text-white text-start text-sm sm:text-base leading-relaxed">
                  The TAYPRO MODEL-T represents a synergy of cutting-edge
                  technologies meticulously engineered to address the challenges
                  of solar panel maintenance for Single Axis Tracker
                  installations. Powered by advanced sensors and machine
                  learning capabilities, the MODEL-T boasts truly autonomous
                  operation, devoid of any human intervention. Its cloud-based
                  management system enables remote monitoring and control,
                  ensuring optimal performance from anywhere, anytime.
                </p>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block relative w-full h-[700px] overflow-hidden">
              <Image
                src="/tayprorobots/taypro-modelT-img.png"
                alt="Taypro Single-Axis Tracker Solar Panel Cleaning Robot Model-T actively cleaning solar panels at utility-scale solar farm installation"
                title="Taypro Single-Axis Tracker Solar Panel Cleaning Robot Model-T"
                fill
                className="object-cover"
                priority
              />

              <div className="absolute right-10 top-1/2 transform -translate-y-1/2 bg-[#7da300] p-6 max-w-90 h-[450px]">
                <h3 className="text-white text-start text-2xl mb-4">
                  The Innovation Behind the MODEL-T
                </h3>
                <p className="text-white text-start text-md leading-relaxed">
                  The TAYPRO MODEL-T represents a synergy of cutting-edge
                  technologies meticulously engineered to address the challenges
                  of solar panel maintenance for Single Axis Tracker
                  installations. Powered by advanced sensors and machine
                  learning capabilities, the MODEL-T boasts truly autonomous
                  operation, devoid of any human intervention. Its cloud-based
                  management system enables remote monitoring and control,
                  ensuring optimal performance from anywhere, anytime.
                </p>
              </div>
            </div>
          </div>
        </section>

        <EnergyResourceCard />

        <ProjectsCard showHeader={true} headerText="" />

        <ClientsCard />

        <ModelCards title="Looking for more solutions?" cards={modelTCards} />

        <RequestEstimateForm />
      </div>
    </>
  );
}
