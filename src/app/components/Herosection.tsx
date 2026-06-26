"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { AnimateOnScroll } from "./AnimateOnScroll";
import { Container } from "./Container";
import OpenLeadModalButton from "./OpenLeadModalButton";
import { trackCtaClick } from "@/lib/analytics/track-event";
import type { LeadModalOpenOptions } from "./lead-modal-options";

interface HeroSectionProps {
  title: React.ReactNode;
  subtitle: React.ReactNode;
  imgSrc: string;
  imgAlt?: string;
  /**
   * When unset or equal to `/contact`, the CTA opens the global lead-capture
   * modal so the user stays on the page. Pass an explicit href to override.
   */
  ctaHref?: string;
  ctaText?: string;
  /** Optional analytics topic surfaced on the lead modal chip. */
  ctaTopic?: string;
  /** Modal title when ctaHref opens the lead modal. */
  ctaTitle?: string;
  /** Modal subtitle when ctaHref opens the lead modal. */
  ctaSubtitle?: string;
  /** Extra lead-modal form options when the hero CTA opens the modal. */
  leadModal?: Omit<LeadModalOpenOptions, "topic" | "title" | "subtitle">;
  className?: string;
  /** Native width/height ratio, e.g. "1653 / 702" for tracker robots. */
  imageAspectRatio?: string;
  imagePresentation?: "robot-standard" | "robot-wide";
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  imgSrc,
  imgAlt,
  ctaHref = "/contact",
  ctaText = "Request a quote",
  ctaTopic,
  ctaTitle,
  ctaSubtitle,
  leadModal,
  className = "",
  imageAspectRatio,
  imagePresentation = "robot-standard",
}) => {
  const isWideHero = imagePresentation === "robot-wide";
  const titleString = typeof title === "string" ? title : "";

  // Generate SEO-friendly alt text if not provided
  const getAltText = () => {
    if (imgAlt) return imgAlt;
    const lower = titleString.toLowerCase();
    if (lower.includes("nyuma-x") || (lower.includes("nyuma") && lower.includes("tracker"))) {
      return "Taypro NYUMA-X PBT solar panel cleaning robot for single-axis trackers";
    }
    if (lower.includes("glyde-x") || (lower.includes("glyde") && lower.includes("tracker"))) {
      return "Taypro GLYDE-X dual-pass solar panel cleaning robot for single-axis trackers";
    }
    if (lower.includes("helyx") || lower.includes("semi")) {
      return "Taypro HELYX semi-automatic solar panel cleaning robot";
    }
    if (lower.includes("nyuma")) {
      return "Taypro NYUMA automatic PBT solar panel cleaning robot";
    }
    if (lower.includes("glyde") || lower.includes("automatic")) {
      return "Taypro GLYDE automatic dual-pass solar panel cleaning robot";
    }
    if (lower.includes("tracker")) {
      return "Taypro solar panel cleaning robot for single-axis trackers";
    }
    if (lower.includes("console") || lower.includes("monitoring")) {
      return "NECTYR - Solar Panel Cleaning Robot Monitoring and Control Dashboard for fleet management";
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
  const opensModal = ctaHref === "/contact";
  const ctaClass =
    "bg-[#A8C117] inline-block w-full sm:w-auto sm:min-w-[240px] px-8 sm:px-12 py-4 sm:py-5 text-[#052638] font-medium text-base sm:text-xl text-center transition hover:bg-[#b3cf3d]";

  return (
    <section className={`bg-white ${className}`}>
      <Container className="pt-0 pb-12 sm:pb-16">
        <div className="min-h-[600px] flex flex-col lg:flex-row relative overflow-hidden">
          {/* LEFT - Content */}
          <AnimateOnScroll
            animation="fadeInLeft"
            eager
            className="bg-[#052638] w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 py-12 sm:py-16"
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold text-white mb-6 leading-tight">
              {title}
            </h1>
            <div className="text-base sm:text-xl text-white leading-relaxed max-w-xl mb-8 sm:mb-9">
              {subtitle}
            </div>
            {opensModal ? (
              <OpenLeadModalButton
                className={ctaClass}
                topic={ctaTopic ?? ctaText}
                title={ctaTitle}
                subtitle={ctaSubtitle}
                source="hero"
                leadIntent={leadModal?.leadIntent ?? ctaTopic ?? ctaText}
                formPrompt={leadModal?.formPrompt}
                showMessageField={leadModal?.showMessageField}
                showCompanyField={leadModal?.showCompanyField}
                messageLabel={leadModal?.messageLabel}
                messagePlaceholder={leadModal?.messagePlaceholder}
                submitLabel={leadModal?.submitLabel ?? ctaText}
                thankYouTitle={leadModal?.thankYouTitle}
                thankYouMessage={leadModal?.thankYouMessage}
                analyticsFormType={leadModal?.analyticsFormType ?? "hero_quote"}
              >
                {ctaText}
              </OpenLeadModalButton>
            ) : isInternal ? (
              <Link
                href={ctaHref}
                className={ctaClass}
                onClick={() =>
                  trackCtaClick({
                    ctaName: ctaText,
                    location: "hero",
                    destination: ctaHref,
                  })
                }
              >
                {ctaText}
              </Link>
            ) : (
              <a href={ctaHref} className={ctaClass}>
                {ctaText}
              </a>
            )}
          </AnimateOnScroll>

          {/* RIGHT - IMAGE */}
          <AnimateOnScroll
            animation="fadeInRight"
            eager
            delay={100}
            className={`relative w-full lg:w-1/2 flex items-center justify-center mt-10 lg:mt-0 ${
              isWideHero
                ? "min-h-[200px] sm:min-h-[260px] lg:min-h-[600px] px-4 sm:px-6 lg:px-8"
                : "min-h-[280px] sm:min-h-[400px] lg:min-h-[600px]"
            }`}
          >
            <div
              className={`relative w-full max-w-full ${
                imageAspectRatio
                  ? ""
                  : isWideHero
                    ? "aspect-[2.2/1] max-h-[min(42vw,420px)]"
                    : "aspect-[4/3] max-h-[min(72vw,600px)]"
              }`}
              style={
                imageAspectRatio
                  ? {
                      aspectRatio: imageAspectRatio,
                      maxHeight: isWideHero ? "min(42vw, 420px)" : "min(72vw, 600px)",
                    }
                  : undefined
              }
            >
              <Image
                alt={getAltText()}
                src={imgSrc}
                title={titleAttr}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                fetchPriority="high"
              />
            </div>
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
