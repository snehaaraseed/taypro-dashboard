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

export const metadata: Metadata = {
  title: "Automatic Cleaning Robot Monitoring App | Taypro",
  description:
    "Precision in Operation The TAYPRO CONSOLE goes beyond conventional cleaning methods. It allows for the application of individual and group commands, tailoring the cleaning approach based on seasonal data and the specific position of each table in the field.",
  keywords: "sitemap-xml, sitemap taypro, taypro",
  openGraph: {
    title: "Automatic Cleaning Robot Monitoring App | Taypro",
    description:
      "Precision in Operation The TAYPRO CONSOLE goes beyond conventional cleaning methods. It allows for the application of individual and group commands, tailoring the cleaning approach based on seasonal data and the specific position of each table in the field.",
    url: "http://localhost:3000/solar-robots/automatic-cleaning-robot-monitoring-app",
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
          imgAlt="Solar robot field"
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
              <h1 className="text-[#052638] font-semibold text-3xl md:text-4xl lg:text-5xl leading-tight max-w-4xl mx-auto">
                SEAMLESS CONNECTIVITY AND WEATHER INTEGRATION
              </h1>
            </div>

            <div className="relative w-full h-[700px] overflow-hidden">
              <Image
                src="/tayproasset/taypro-console.png"
                alt="TAYPRO MODEL-T cleaning solar panels"
                title="TAYPRO MODEL-T Solar Panels"
                fill
                className="object-cover"
                priority
              />

              {/* Overlay card inside image */}
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2 bg-[#7da300] p-6 w-90 h-[350px] flex flex-col justify-center items-center text-center">
                <h2 className="text-white text-start text-2xl mb-4">
                  Precision in Operation
                </h2>
                <p className="text-white text-start text-md leading-relaxed">
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
