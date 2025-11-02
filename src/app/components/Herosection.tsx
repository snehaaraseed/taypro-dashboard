import Image from "next/image";
import React from "react";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  imgSrc: string;
  imgAlt?: string;
  ctaHref?: string;
  ctaText?: string;
  className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  imgSrc,
  imgAlt,
  ctaHref = "/contact",
  ctaText = "Request a quote",
  className = "",
}) => {
  // Generate SEO-friendly alt text if not provided
  const getAltText = () => {
    if (imgAlt) return imgAlt;
    // Generate alt text based on title
    if (title.toLowerCase().includes("model-t") || title.toLowerCase().includes("tracker")) {
      return "Taypro Single-Axis Tracker Solar Panel Cleaning Robot - Autonomous robotic cleaning system for tracking solar panel installations";
    }
    if (title.toLowerCase().includes("model-b") || title.toLowerCase().includes("semi")) {
      return "Taypro Semi-Automatic Solar Panel Cleaning Robot - Cost-effective pick-and-place robotic cleaning solution for solar farms";
    }
    if (title.toLowerCase().includes("model-a") || title.toLowerCase().includes("automatic")) {
      return "Taypro Automatic Solar Panel Cleaning Robot - AI-enabled autonomous cleaning system for utility-scale solar power plants";
    }
    if (title.toLowerCase().includes("console") || title.toLowerCase().includes("monitoring")) {
      return "Taypro Console - Solar Panel Cleaning Robot Monitoring and Control Dashboard for fleet management";
    }
    if (title.toLowerCase().includes("service") || title.toLowerCase().includes("opex")) {
      return "Taypro Solar Panel Cleaning Service - Professional robotic cleaning services using Solar Panel Cleaning Robot systems";
    }
    // Default fallback
    return `Taypro ${title} - Solar Panel Cleaning Robot system for efficient solar farm maintenance`;
  };

  return (
    <section
      className={`min-h-[600px] mx-4 sm:mx-20 flex flex-col lg:flex-row relative overflow-hidden ${className}`}
    >
      {/* LEFT - Content */}
      <div className="bg-[#052638] w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-8 xl:px-24 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold text-white mb-6 leading-tight">
          {title}
        </h1>
        <div className="text-base sm:text-xl text-white leading-relaxed max-w-full sm:max-w-xl mb-8 sm:mb-9">
          {subtitle}
        </div>
        <a
          href={ctaHref}
          className="bg-[#A8C117] rounded-none w-full max-w-xl py-4 sm:py-6 text-[#052638] font-medium text-base sm:text-xl text-center transition hover:bg-[#b3cf3d]"
        >
          {ctaText}
        </a>
      </div>

      {/* RIGHT - IMAGE */}
      <div className="relative w-full sm:w-300 lg:w-1/2 min-h-[240px] sm:min-h-[360px] lg:h-[600px] mr-0 sm:mr-20 mt-10 lg:mt-0">
        <Image
          alt={getAltText()}
          src={imgSrc}
          title={`${title} - Solar Panel Cleaning Robot by Taypro`}
          fill
          className="object-contain"
          priority
        />
        <svg
          className="absolute right-0 top-0 w-full h-full pointer-events-none"
          viewBox="0 0 900 700"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M700,90 Q990,160 990,400 Q990,680 510,700"
            stroke="#ede9df"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M740,140 Q970,230 970,430 Q970,680 530,670"
            stroke="#ede9df"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M740,140 Q970,230 970,430 Q970,680 530,670"
            stroke="#ede9df"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M740,140 Q970,230 970,430 Q970,680 530,670"
            stroke="#ede9df"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
