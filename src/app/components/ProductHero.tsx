"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { AnimateOnScroll } from "./AnimateOnScroll";
import OpenLeadModalButton from "./OpenLeadModalButton";
import { trackCtaClick } from "@/lib/analytics/track-event";
import { shouldServeImageUnoptimized } from "@/lib/site-images";
import type { LeadModalOpenOptions } from "./lead-modal-options";

const HERO_GRADIENT =
  "linear-gradient(to right, rgba(5,38,56,0.97) 0%, rgba(5,38,56,0.92) 32%, rgba(5,38,56,0.72) 55%, rgba(5,38,56,0.45) 78%, rgba(5,38,56,0.25) 100%)";

export type ProductHeroHighlight = {
  value: string;
  label: string;
};

export type ProductHeroSecondaryCta = {
  label: string;
  href: string;
};

export type ProductHeroBackgroundCredit = {
  title: string;
  href: string;
};

export interface ProductHeroProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  backgroundImage: string;
  backgroundAlt: string;
  backgroundCredit?: ProductHeroBackgroundCredit;
  ctaHref?: string;
  ctaText?: string;
  ctaTopic?: string;
  ctaTitle?: string;
  ctaSubtitle?: string;
  leadModal?: Omit<LeadModalOpenOptions, "topic" | "title" | "subtitle">;
  secondaryCta?: ProductHeroSecondaryCta;
  highlights?: ProductHeroHighlight[];
  badges?: string[];
  badge?: string;
  className?: string;
  waveFill?: string;
}

const ProductHero: React.FC<ProductHeroProps> = ({
  eyebrow,
  title,
  subtitle,
  backgroundImage,
  backgroundAlt,
  backgroundCredit,
  ctaHref = "/contact",
  ctaText = "Request a quote",
  ctaTopic,
  ctaTitle,
  ctaSubtitle,
  leadModal,
  secondaryCta,
  highlights = [],
  badges = [],
  badge,
  className = "",
  waveFill = "#ffffff",
}) => {
  const isInternal = ctaHref.startsWith("/");
  const isAnchor = ctaHref.startsWith("#");
  const opensModal = ctaHref === "/contact";
  const primaryCtaClass =
    "inline-flex flex-1 items-center justify-center min-h-[48px] bg-[#A8C117] text-[#052638] font-semibold px-5 py-3 text-sm rounded-lg hover:bg-[#b3cf3d] transition text-center sm:flex-none sm:min-w-[200px] sm:px-8 sm:text-base";
  const secondaryCtaClass =
    "inline-flex flex-1 items-center justify-center min-h-[48px] border-2 border-white/80 text-white font-medium px-5 py-3 text-sm rounded-lg hover:bg-white/10 transition text-center sm:flex-none sm:min-w-[200px] sm:px-8 sm:text-base";

  return (
    <section
      className={`relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden bg-[#052638] ${className}`}
    >
      <div className="relative min-h-[52vh] md:min-h-[58vh] lg:min-h-[62vh]">
        <Image
          src={backgroundImage}
          alt={backgroundAlt}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
          unoptimized={shouldServeImageUnoptimized(backgroundImage)}
        />
        <div
          className="absolute inset-0"
          style={{ background: HERO_GRADIENT }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(168,193,23,0.08)_0%,transparent_55%)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#052638]/90 via-transparent to-[#052638]/20"
          aria-hidden
        />

        {badge ? (
          <span className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 inline-flex items-center gap-2 rounded-full bg-[#A8C117] px-4 py-2 text-sm font-semibold text-[#052638] shadow-md">
            {badge}
          </span>
        ) : null}

        <AnimateOnScroll
          animation="fadeInUp"
          eager
          className="relative z-10 mx-auto flex h-full max-w-4xl flex-col justify-center px-6 py-24 md:px-8 md:py-28 lg:py-32"
        >
          {eyebrow ? (
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#A8C117] md:text-sm">
              {eyebrow}
            </p>
          ) : null}

          <h1 className="text-3xl font-semibold leading-[1.12] text-white sm:text-4xl md:text-5xl lg:text-[3.25rem]">
            {title}
          </h1>

          <div className="mt-5 max-w-3xl text-base leading-relaxed text-white/88 md:text-lg">
            {subtitle}
          </div>

          {badges.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {badges.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-7 flex w-full max-w-xl flex-row flex-wrap items-stretch justify-start gap-2 sm:gap-3">
            {opensModal ? (
              <OpenLeadModalButton
                className={primaryCtaClass}
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
                className={primaryCtaClass}
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
            ) : isAnchor ? (
              <a href={ctaHref} className={primaryCtaClass}>
                {ctaText}
              </a>
            ) : (
              <a href={ctaHref} className={primaryCtaClass}>
                {ctaText}
              </a>
            )}

            {secondaryCta ? (
              secondaryCta.href.startsWith("#") ? (
                <a href={secondaryCta.href} className={secondaryCtaClass}>
                  {secondaryCta.label}
                </a>
              ) : secondaryCta.href.startsWith("/") ? (
                <Link
                  href={secondaryCta.href}
                  className={secondaryCtaClass}
                  onClick={() =>
                    trackCtaClick({
                      ctaName: secondaryCta.label,
                      location: "hero",
                      destination: secondaryCta.href,
                    })
                  }
                >
                  {secondaryCta.label}
                </Link>
              ) : (
                <a href={secondaryCta.href} className={secondaryCtaClass}>
                  {secondaryCta.label}
                </a>
              )
            ) : null}
          </div>

          {highlights.length > 0 ? (
            <div
              className={`mt-6 grid grid-cols-1 gap-3 sm:gap-2 md:mt-8 ${
                highlights.length >= 4
                  ? "sm:grid-cols-2 lg:grid-cols-4 max-w-4xl"
                  : "sm:grid-cols-3 max-w-3xl"
              }`}
              aria-label="Product highlights"
            >
              {highlights.map((stat) => (
                <div
                  key={`${stat.value}-${stat.label}`}
                  className="hero-glass rounded-xl px-4 py-3 text-left"
                >
                  <p className="text-[#A8C117] font-semibold text-xl sm:text-2xl tabular-nums leading-none drop-shadow-sm">
                    {stat.value}
                  </p>
                  <p className="mt-1.5 text-white/85 text-xs sm:text-sm leading-snug">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {backgroundCredit ? (
            <p className="mt-4 text-xs text-white/50">
              Background:{" "}
              <Link
                href={backgroundCredit.href}
                className="underline underline-offset-2 hover:text-white/75"
              >
                {backgroundCredit.title}
              </Link>
            </p>
          ) : null}
        </AnimateOnScroll>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[1] overflow-hidden">
        <svg
          className="h-16 w-full md:h-24"
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path fill={waveFill} d="M0,224L1440,96L1440,320L0,320Z" />
        </svg>
      </div>
    </section>
  );
};

export default ProductHero;
