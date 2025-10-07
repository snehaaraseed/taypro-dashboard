// components/HeroSection.tsx

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

/**
 * A hero / hero-style section with left content and right image + decorative SVG.
 */
const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  imgSrc,
  imgAlt = "",
  ctaHref = "/contact",
  ctaText = "Request a quote",
  className = "",
}) => {
  return (
    <section
      className={`min-h-[600px] mx-20 flex flex-col lg:flex-row relative overflow-hidden ${className}`}
    >
      {/* LEFT - Content */}
      <div className="bg-[#052638] w-full lg:w-1/2 flex flex-col justify-center px-8 xl:px-24 py-16">
        <div className="text-5xl md:text-6xl font-semibold text-white mb-6 leading-tight">
          {title}
        </div>
        <div className="text-xl text-white leading-relaxed max-w-xl mb-9">
          {subtitle}
        </div>
        <a
          href={ctaHref}
          className="bg-[#A8C117] rounded-none w-full max-w-xl py-6 text-[#052638] font-medium text-xl text-center transition hover:bg-[#b3cf3d]"
        >
          {ctaText}
        </a>
      </div>
      {/* RIGHT - IMAGE */}
      <div className="relative w-full lg:w-3/4 h-[600px] mr-20">
        <Image
          alt={imgAlt}
          src={imgSrc}
          fill
          className="object-contain"
          quality={90}
          priority
        />
        <svg
          className="absolute right-0 top-0 w-full h-full pointer-events-none"
          viewBox="0 0 900 700"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
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
