"use client";
import Image from "next/image";
import { clientLogos } from "../data";
import { AnimateOnScroll } from "./AnimateOnScroll";

interface ClientsCardProps {
  heading?: string;
  /** Plain template with `{index}` replaced per logo (default English). */
  logoAltTemplate?: string;
  logoTitleTemplate?: string;
  /** Prefer when using next-intl — avoids FORMATTING_ERROR on `{index}` placeholders. */
  resolveLogoAlt?: (index: number) => string;
  resolveLogoTitle?: (index: number) => string;
}

export default function ClientsCard({
  heading = "Our Esteemed Clients",
  logoAltTemplate = "Taypro Solar Panel Cleaning Robot Client {index} - Partner using Taypro robotic cleaning solutions",
  logoTitleTemplate = "Taypro Solar Panel Cleaning Robot Client {index}",
  resolveLogoAlt,
  resolveLogoTitle,
}: ClientsCardProps) {
  return (
    <section className="bg-white flex flex-col items-center py-20 px-4 md:px-0">
      <AnimateOnScroll animation="fadeInUp" className="text-5xl font-semibold text-[#052638] mb-12 text-center">
        <h2>{heading}</h2>
      </AnimateOnScroll>
      <div className="w-full flex justify-center">
        <div className="grid grid-cols-2 sm:grid-cols-4 grid-rows-2 w-full max-w-7xl mx-auto gap-4">
          {clientLogos.map((logoSrc, idx) => {
            const clientNum = idx + 1;
            const alt =
              resolveLogoAlt?.(clientNum) ??
              logoAltTemplate.replace("{index}", String(clientNum));
            const title =
              resolveLogoTitle?.(clientNum) ??
              logoTitleTemplate.replace("{index}", String(clientNum));

            return (
            <AnimateOnScroll
              key={idx}
              animation="scaleIn"
              delay={idx * 100}
              className="flex items-center justify-center border border-[#1c201f] bg-white h-[140px] sm:h-[210px] transition-all duration-300 hover:shadow-lg hover:border-[#39D600] transform hover:-translate-y-1"
            >
              <Image
                src={logoSrc}
                alt={alt}
                title={title}
                width={200}
                height={85}
                className="h-auto max-h-[120px] w-auto max-w-[80%] object-contain transition-transform duration-300 hover:scale-105"
                loading="lazy"
              />
            </AnimateOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
