"use client";
import Image from "next/image";
import OpenLeadModalButton from "./OpenLeadModalButton";
import { getProjectHeroImageAlt } from "../utils/imageAlt";

interface ProjectOverviewSectionProps {
  image: string;
  imageAlt?: string;
  projectTitle: string;
  overviewText: string;
}

function ProjectOverviewSection({
  image,
  imageAlt,
  projectTitle,
  overviewText,
}: ProjectOverviewSectionProps) {
  const heroAlt = getProjectHeroImageAlt({
    title: projectTitle,
    imageAlt,
    description: overviewText,
  });
  return (
    <section
      className="w-full pb-16 sm:pb-20 lg:pb-30 bg-white overflow-x-hidden"
      style={{
        background: "url('/tayprobglayout/taypro-semi.png') repeat",
        backgroundSize: "auto",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[700px] overflow-hidden">
          <Image
            src={image}
            alt={heroAlt}
            title="Solar Panel Cleaning Robot Project Overview by Taypro"
            fill
            className="object-cover"
            priority
          />

          {/* Mobile: Bottom overlay, Desktop: Right overlay */}
          <div className="absolute bottom-4 left-4 right-4 lg:right-10 lg:top-1/2 lg:bottom-auto lg:left-auto lg:transform lg:-translate-y-1/2 bg-[#75AA00] p-4 sm:p-6 lg:w-90 lg:h-[350px] flex flex-col justify-center items-start lg:items-center text-left lg:text-center">
            <h3 className="text-white text-xl sm:text-2xl mb-3 sm:mb-4">
              Overview
            </h3>
            <h2 className="text-white text-sm sm:text-base lg:text-md leading-relaxed">
              {overviewText}
            </h2>
            <OpenLeadModalButton
              topic="Let's work together"
              title="Let's work together"
              subtitle="Tell us about your plant and our team will follow up with the right Solar Panel Cleaning Robot fit for your site."
              className="text-white text-lg sm:text-xl mt-4 sm:mt-6 lg:mt-8 border-b-2 border-[#e6ee9d] hover:text-[#e6ee9d] transition-colors duration-300"
            >
              Let&apos;s work together
            </OpenLeadModalButton>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProjectOverviewSection;
export { ProjectOverviewSection as AllProjectsOverviewSection };
