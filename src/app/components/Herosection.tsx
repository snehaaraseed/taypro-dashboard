"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { AnimateOnScroll } from "./AnimateOnScroll";
import { Container } from "./Container";

interface HeroSectionProps {
  title: React.ReactNode;
  subtitle: React.ReactNode;
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
  const titleString = typeof title === "string" ? title : "";

  // Generate SEO-friendly alt text if not provided
  const getAltText = () => {
    if (imgAlt) return imgAlt;
    const lower = titleString.toLowerCase();
    if (lower.includes("model-t") || lower.includes("tracker")) {
      return "Taypro Single-Axis Tracker Solar Panel Cleaning Robot - Autonomous robotic cleaning system for tracking solar panel installations";
    }
    if (lower.includes("model-b") || lower.includes("semi")) {
      return "Taypro Semi-Automatic Solar Panel Cleaning Robot - Cost-effective pick-and-place robotic cleaning solution for solar farms";
    }
    if (lower.includes("model-a") || lower.includes("automatic")) {
      return "Taypro Automatic Solar Panel Cleaning Robot - AI-enabled autonomous cleaning system for utility-scale solar power plants";
    }
    if (lower.includes("console") || lower.includes("monitoring")) {
      return "Taypro Console - Solar Panel Cleaning Robot Monitoring and Control Dashboard for fleet management";
    }
    if (lower.includes("service") || lower.includes("opex")) {
      return "Taypro Solar Panel Cleaning Service - Professional robotic cleaning services using Solar Panel Cleaning Robot systems";
    }
    return `Taypro ${titleString} - Solar Panel Cleaning Robot system for efficient solar farm maintenance`;
  };

  const titleAttr = titleString
    ? `${titleString} - Solar Panel Cleaning Robot by Taypro`
    : "Solar Panel Cleaning Robot by Taypro";

  const isInternal = ctaHref.startsWith("/");

  return (
    <section className={`bg-white ${className}`}>
      <Container className="py-12 sm:py-16">
        <div className="min-h-[600px] flex flex-col lg:flex-row relative overflow-hidden">
          {/* LEFT - Content */}
          <AnimateOnScroll
            animation="fadeInLeft"
            className="bg-[#052638] w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 py-12 sm:py-16"
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold text-white mb-6 leading-tight">
              {title}
            </h1>
            <div className="text-base sm:text-xl text-white leading-relaxed max-w-xl mb-8 sm:mb-9">
              {subtitle}
            </div>
            {isInternal ? (
              <Link
                href={ctaHref}
                className="bg-[#A8C117] inline-block w-full sm:w-auto sm:min-w-[240px] px-8 sm:px-12 py-4 sm:py-5 text-[#052638] font-medium text-base sm:text-xl text-center transition hover:bg-[#b3cf3d]"
              >
                {ctaText}
              </Link>
            ) : (
              <a
                href={ctaHref}
                className="bg-[#A8C117] inline-block w-full sm:w-auto sm:min-w-[240px] px-8 sm:px-12 py-4 sm:py-5 text-[#052638] font-medium text-base sm:text-xl text-center transition hover:bg-[#b3cf3d]"
              >
                {ctaText}
              </a>
            )}
          </AnimateOnScroll>

          {/* RIGHT - IMAGE */}
          <AnimateOnScroll
            animation="fadeInRight"
            delay={100}
            className="relative w-full lg:w-1/2 min-h-[240px] sm:min-h-[360px] lg:min-h-[600px] mt-10 lg:mt-0"
          >
            <Image
              alt={getAltText()}
              src={imgSrc}
              title={titleAttr}
              fill
              className="object-contain"
              priority
            />
            <svg
              className="hidden sm:block absolute right-0 top-0 w-full h-full pointer-events-none"
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
            </svg>
          </AnimateOnScroll>
        </div>
      </Container>
    </section>
  );
};

export default HeroSection;
