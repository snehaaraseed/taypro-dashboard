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
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import Product360Viewer from "@/app/components/Product360Viewer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

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
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-md font-medium mb-6">
                TAYPRO MODEL-T
              </div>
              <h3 className="text-[#052638] font-semibold text-3xl md:text-4xl lg:text-5xl leading-tight max-w-4xl mx-auto">
                AUTONOMOUS WATERLESS SOLAR PANEL CLEANING ROBOT FOR SINGLE AXIS
                TRACKER INSTALLATIONS
              </h3>
            </AnimateOnScroll>

            {/* Mobile Layout */}
            <div className="block lg:hidden">
              <AnimateOnScroll animation="fadeInUp" delay={100} className="mb-6">
                <div className="text-center mb-8">
                  <div className="text-[#A8C117] text-xl sm:text-2xl font-medium mb-2">
                    Interactive Product Tour
                  </div>
                  <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl mb-4">
                    360° View of Model-T
                  </h2>
                  <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
                    Drag left or right to rotate and explore our Single-Axis Tracker Solar Panel Cleaning Robot from every angle
                  </p>
                </div>
                <div className="w-full max-w-2xl mx-auto">
                  <Product360Viewer
                    imagePath="/360-degree-images/Model-T/0001-MT-2000-1224-"
                    imageCount={51}
                    imagePrefix=""
                    imageSuffix=".png"
                    startIndex={100}
                    width={600}
                    height={450}
                    className="mx-auto"
                  />
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll animation="fadeInUp" delay={200} className="bg-[#7da300] p-6 mx-4">
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
              </AnimateOnScroll>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block">
              <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
                <AnimateOnScroll animation="fadeInLeft" delay={100} className="flex-1 flex flex-col">
                  <div className="text-center mb-3">
                    <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl mb-2">
                      360° View of Model-T
                    </h2>
                    <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mb-4">
                      Drag left or right to rotate and explore our Single-Axis Tracker Solar Panel Cleaning Robot</p>
                  </div>
                  <div className="w-full max-w-2xl">
                    <Product360Viewer
                      imagePath="/360-degree-images/Model-T/0001-MT-2000-1224-"
                      imageCount={51}
                      imagePrefix=""
                      imageSuffix=".png"
                      startIndex={100}
                      width={700}
                      height={525}
                      className="mx-auto"
                    />
                  </div>
                </AnimateOnScroll>

                <AnimateOnScroll animation="fadeInRight" delay={200} className="flex-1 bg-[#7da300] p-6 max-w-lg h-fit self-center">
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
                </AnimateOnScroll>
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
