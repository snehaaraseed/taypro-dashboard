"use client";

import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { approvedModuleManufacturers } from "@/app/data/moduleManufacturers";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { Container } from "@/app/components/Container";

export default function ModuleManufacturerTrust() {
  const t = useTranslations("ModuleManufacturerTrust");

  return (
    <section
      className="py-14 md:py-20 bg-[#f4f7f9] border-y border-[#052638]/8"
      aria-labelledby="module-manufacturer-trust-heading"
    >
      <Container>
        <AnimateOnScroll
          animation="fadeInUp"
          className="max-w-3xl mx-auto text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#052638]/10 text-[#052638] mb-4">
            <ShieldCheck className="w-6 h-6" aria-hidden />
          </div>
          <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
            {t("eyebrow")}
          </p>
          <h2
            id="module-manufacturer-trust-heading"
            className="text-[#052638] font-semibold text-2xl md:text-3xl mb-4"
          >
            {t("heading")}
          </h2>
          <p className="text-[#27415c] text-lg leading-relaxed">{t("body")}</p>
        </AnimateOnScroll>

        <ul
          className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto"
          role="list"
          aria-label={t("manufacturerListAria")}
        >
          {approvedModuleManufacturers.map((name, idx) => (
            <li key={name} role="listitem">
              <AnimateOnScroll animation="scaleIn" delay={idx * 60}>
                <span className="inline-flex items-center justify-center min-h-[48px] px-5 py-2.5 rounded-md border border-[#052638]/15 bg-white text-[#052638] font-semibold text-base sm:text-lg shadow-sm">
                  {name}
                </span>
              </AnimateOnScroll>
            </li>
          ))}
        </ul>

        <p className="text-center text-[#27415c]/80 text-sm max-w-2xl mx-auto mt-8 leading-relaxed">
          {t("disclaimer")}
        </p>
      </Container>
    </section>
  );
}
