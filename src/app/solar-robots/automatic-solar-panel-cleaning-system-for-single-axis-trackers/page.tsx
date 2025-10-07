"use client";

import Image from "next/image";
import { modelTCards } from "@/app/data";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import ProjectsCard from "@/app/components/ProjectsCard";
import ModelCards from "@/app/components/ModelCards";
import ClientsCard from "@/app/components/ClientsCard";
import HeroSection from "@/app/components/Herosection";
import EnergyResourceCard from "@/app/components/EnergyResourceCard";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import SEO from "@/app/components/SEO";

const breadcrumbs = [
  { name: "Home", href: "/" },
  {
    name: "Solar Panel Cleaning Robots",
    href: "/solar-robots/solar-panel-cleaning-robot",
  },
  {
    name: "Model-T",
    href: "",
  },
];

export default function AutomaticSolarPanelCleaningSystem() {
  return (
    <>
      <SEO
        title="Model-T for Single Axis Tracker | Taypro"
        description="Single Axis Tracker Solar Cleaning Robot by Taypro. Call us Today!"
        url="http://localhost:3000/solar-robots/automatic-solar-panel-cleaning-system-for-single-axis-trackers"
        breadcrumbs={breadcrumbs}
      />
      <Breadcrumbs items={breadcrumbs} />
      <div className="min-h-screen">
        <HeroSection
          title="Model-T"
          subtitle="Autonomous solar panel cleaning robot for single-axis trackers"
          imgSrc="/taypro-modelT-img.png"
          imgAlt="Taypro Model-T"
          ctaHref="/contact"
          ctaText="Request a quote"
        />

        <section
          className="w-full py-30 bg-white"
          style={{
            background: "url('/taypro-semi.png') repeat",
            backgroundSize: "auto",
          }}
        >
          <div className="max-w-7xl mx-auto px-6">
            {/* Top badge and heading */}
            <div className="text-center mb-12">
              <h1 className="text-[#A8C117] text-md font-medium mb-6">
                TAYPRO MODEL-T
              </h1>
              <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl lg:text-5xl leading-tight max-w-4xl mx-auto">
                AUTONOMOUS WATERLESS SOLAR PANEL CLEANING ROBOT FOR SINGLE AXIS
                TRACKER INSTALLATIONS
              </h2>
            </div>

            {/* Image with overlay text box */}
            <div className="relative w-full h-[700px] overflow-hidden">
              <Image
                src="/taypro-modelT-img.png"
                alt="TAYPRO MODEL-T cleaning solar panels"
                fill
                className="object-cover"
                priority
              />

              {/* Overlay card inside image */}
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2 bg-[#7da300] p-6 w-90 h-[450px] flex flex-col justify-center items-center text-center">
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

        <ProjectsCard showHeader={true} headerText="Our Most Recent Projects" />

        <ClientsCard />

        <ModelCards title="Looking for more solutions?" cards={modelTCards} />

        <RequestEstimateForm />
      </div>
    </>
  );
}
