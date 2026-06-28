import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";

type CompanyPageHeroProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  bodyBeforeLink: string;
  bodyLink: string;
  bodyLinkHref?: string;
  bodyAfterLink: string;
  /** Optional content below the body paragraph (e.g. metadata chips). */
  footer?: ReactNode;
  /** SVG wave fill, should match the section directly below the hero. */
  waveFill?: string;
};

export function CompanyPageHero({
  eyebrow,
  title,
  subtitle,
  bodyBeforeLink,
  bodyLink,
  bodyLinkHref = "/solar-panel-cleaning-system",
  bodyAfterLink,
  footer,
  waveFill = "#f4f7f9",
}: CompanyPageHeroProps) {
  return (
    <section className="relative min-h-[44vh] flex flex-col items-center justify-start overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/tayprobglayout/taypro-project.png')",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-white/90 sm:bg-white/85"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/75"
        aria-hidden
      />

      <AnimateOnScroll
        animation="fadeInUp"
        eager
        className="relative z-10 pt-10 px-4 max-w-4xl mx-auto pb-24 text-center"
      >
        <p className="text-[#A8C117] text-[16px] mb-4 uppercase tracking-wide">
          {eyebrow}
        </p>
        <h1 className="font-semibold text-[#052638] text-4xl md:text-5xl mb-6 leading-tight">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-[#22405a] text-lg md:text-xl leading-relaxed max-w-3xl mx-auto mb-6 font-medium">
            {subtitle}
          </p>
        ) : null}
        <p className="text-[#22405a] text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
          {bodyBeforeLink}{" "}
          <Link
            href={bodyLinkHref}
            className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
          >
            {bodyLink}
          </Link>{" "}
          {bodyAfterLink}
        </p>
        {footer ? <div className="mt-8">{footer}</div> : null}
      </AnimateOnScroll>

      <div className="absolute bottom-0 left-0 right-0 z-20 overflow-hidden pointer-events-none">
        <svg
          className="w-full h-20 md:h-32"
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
}
