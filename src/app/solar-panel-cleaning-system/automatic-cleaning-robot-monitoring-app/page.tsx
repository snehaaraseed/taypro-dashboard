import Image from "next/image";
import { modelBCards } from "@/app/data";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import ProjectsCard from "@/app/components/ProjectsCard";
import ModelCards from "@/app/components/ModelCards";
import ClientsCard from "@/app/components/ClientsCard";
import EnergyResourceCard from "@/app/components/EnergyResourceCard";
import HeroSection from "@/app/components/Herosection";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  title: "Taypro Console - Solar Panel Cleaning Robot Monitoring App | Taypro",
  description:
    "Taypro Console: Remote monitoring and control portal for autonomous Solar Panel Cleaning Robot fleet. Monitor, control, and manage your solar panel cleaning robots with precision. Individual and group commands, tailored cleaning based on seasonal data and tracker positions.",
  keywords: [
    "Solar Panel Cleaning Robot monitoring",
    "solar panel cleaning robot control app",
    "Taypro Console",
    "solar cleaning robot monitoring app",
    "robotic solar cleaning monitoring",
    "solar panel cleaning robot management",
    "autonomous cleaning robot monitoring",
    "solar farm cleaning robot control",
    "taypro monitoring app",
  ],
  openGraph: {
    title: "Taypro Console - Solar Panel Cleaning Robot Monitoring App | Taypro",
    description:
      "Remote monitoring and control portal for Solar Panel Cleaning Robot fleet. Monitor, control, and manage with precision commands based on seasonal data.",
    url: `${siteUrl}/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/tayproasset/taypro-dashboard.png`,
        width: 1200,
        height: 630,
        alt: "Taypro Console - Solar Panel Cleaning Robot Monitoring App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Taypro Console - Solar Panel Cleaning Robot Monitoring App",
    description:
      "Remote monitoring and control portal for Solar Panel Cleaning Robot fleet management.",
    images: [`${siteUrl}/tayproasset/taypro-dashboard.png`],
  },
  alternates: {
    canonical: `${siteUrl}/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app`,
  },
};

const breadcrumbs = [
  { name: "Home", href: "/" },
  {
    name: "Solar Panel Cleaning Robots",
    href: "/solar-panel-cleaning-system",
  },
  {
    name: "Taypro Console",
    href: "",
  },
];

export default function AutomaticCleaningRobotMonitoringApp() {
  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <div className="min-h-screen">
        <HeroSection
          title="Taypro Console"
          subtitle="A remote monitoring portal to monitor and control autonomous waterless solar panel cleaning robots."
          imgSrc="/tayproasset/taypro-dashboard.png"
          imgAlt="Taypro Console - Solar Panel Cleaning Robot Monitoring Dashboard for fleet management and remote control"
          ctaHref="/contact"
          ctaText="Request a quote"
        />

        <section
          className="w-full py-30 bg-white"
          style={{
            background: "url('/tayprobglayout/taypro-semi.png') repeat",
            backgroundSize: "auto",
          }}
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h3 className="text-[#052638] font-semibold text-3xl md:text-4xl lg:text-5xl leading-tight max-w-4xl mx-auto">
                SEAMLESS CONNECTIVITY AND WEATHER INTEGRATION
              </h3>
            </div>

            {/* Mobile Layout */}
            <div className="block lg:hidden">
              <div className="relative w-full h-[300px] sm:h-[400px] overflow-hidden">
                <Image
                  src="/tayproasset/taypro-console.png"
                  alt="Taypro Console - Solar Panel Cleaning Robot Monitoring Dashboard Interface showing fleet management and control panel"
                  title="Taypro Console - Solar Panel Cleaning Robot Monitoring Dashboard"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="bg-[#7da300] p-6 mx-4 -mt-20 relative">
                <h4 className="text-white text-start text-xl sm:text-2xl mb-4">
                  Precision in Operation
                </h4>
                <p className="text-white text-start text-sm sm:text-base leading-relaxed">
                  The TAYPRO CONSOLE goes beyond conventional cleaning methods.
                  It allows for the application of individual and group
                  commands, tailoring the cleaning approach based on seasonal
                  data and the specific position of each table in the field.
                  This level of precision ensures the most efficient working
                  method for each robot, enhancing overall cleaning performance.
                </p>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block relative w-full h-[700px] overflow-hidden">
              <Image
                src="/tayproasset/taypro-console.png"
                alt="Taypro Console - Solar Panel Cleaning Robot Monitoring Dashboard Interface showing fleet management and control panel"
                title="Taypro Console - Solar Panel Cleaning Robot Monitoring Dashboard"
                fill
                className="object-cover"
                priority
              />

              {/* Overlay card */}
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2 bg-[#7da300] p-6 w-90 h-[350px] flex flex-col justify-center items-center text-center">
                <div className="text-white text-2xl mb-4">
                  Precision in Operation
                </div>
                <p className="text-white text-md leading-relaxed">
                  The TAYPRO CONSOLE goes beyond conventional cleaning methods.
                  It allows for the application of individual and group
                  commands, tailoring the cleaning approach based on seasonal
                  data and the specific position of each table in the field.
                  This level of precision ensures the most efficient working
                  method for each robot, enhancing overall cleaning performance.
                </p>
              </div>
            </div>
          </div>
        </section>

        <EnergyResourceCard />

        <ProjectsCard showHeader={true} headerText="Our Most Recent Projects" />

        <ClientsCard />

        <ModelCards title="Looking for more solutions?" cards={modelBCards} />

        <RequestEstimateForm />
      </div>
    </>
  );
}
