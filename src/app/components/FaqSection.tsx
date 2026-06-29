"use client";

import type { ReactNode } from "react";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { Container } from "@/app/components/Container";
import FAQAccordion, { type FAQItem } from "@/app/components/FAQAccordion";

export interface FaqSectionProps {
  id: string;
  title: ReactNode;
  subtitle?: ReactNode;
  faqs: FAQItem[];
  /** @default "white" */
  tone?: "white" | "muted";
  footer?: ReactNode;
  className?: string;
  /** @default true — set false on article detail pages to avoid scroll-reveal flicker. */
  animate?: boolean;
}

const TONE_CLASS = {
  white: "bg-white",
  muted: "bg-[#f4f7f9]",
} as const;

export function FaqSection({
  id,
  title,
  subtitle,
  faqs,
  tone = "white",
  footer,
  className = "",
  animate = true,
}: FaqSectionProps) {
  const headingBlock = (
    <>
      <h2
        id={id}
        className="text-[#052638] font-semibold text-3xl md:text-4xl mb-3"
      >
        {title}
      </h2>
      {subtitle ? (
        <div className="text-[#27415c] text-lg leading-relaxed max-w-2xl mx-auto">
          {subtitle}
        </div>
      ) : null}
    </>
  );

  const accordionBlock = <FAQAccordion faqs={faqs} />;

  return (
    <section
      className={`w-full py-14 md:py-20 ${TONE_CLASS[tone]} ${className}`.trim()}
      aria-labelledby={id}
    >
      <Container size="narrow">
        {animate ? (
          <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
            {headingBlock}
          </AnimateOnScroll>
        ) : (
          <div className="text-center mb-10">{headingBlock}</div>
        )}
        {animate ? (
          <AnimateOnScroll animation="fadeInUp" delay={80}>
            {accordionBlock}
          </AnimateOnScroll>
        ) : (
          accordionBlock
        )}
        {footer ? (
          animate ? (
            <AnimateOnScroll animation="fadeInUp" delay={200} className="mt-10 text-center">
              {footer}
            </AnimateOnScroll>
          ) : (
            <div className="mt-10 text-center">{footer}</div>
          )
        ) : null}
      </Container>
    </section>
  );
}
