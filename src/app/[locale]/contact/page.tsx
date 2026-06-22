"use client";

import { Link } from "@/i18n/navigation";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  Building2,
  Clock,
  Factory,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { ContactEmailLink } from "@/app/components/ContactEmailLink";
import { ContactPhoneLink } from "@/app/components/ContactPhoneLink";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { Container } from "@/app/components/Container";
import { FaqSection } from "@/app/components/FaqSection";
import {
  FAQPageSchema,
  LocalBusinessSchema,
} from "@/app/components/StructuredData";
import {
  TAYPRO_SALES_PHONE_DISPLAY,
  TAYPRO_SALES_PHONE_E164,
  TAYPRO_SALES_PHONE_TEL,
} from "@/lib/contact";

const Map = dynamic(() => import("@/app/components/Map"), { ssr: false });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

const HEADQUARTERS_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=T3-906+Kohinoor+World+Towers+Pimpri+Colony+Pune+411019";

const MFG_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=18.735204,73.8519138";

export default function ContactUsPage() {
  const t = useTranslations("ContactPage");
  const tCommon = useTranslations("Common");

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumbs.contact"), href: "" },
  ];

  const contactChannels = [
    {
      icon: Mail,
      label: t("channels.sales"),
      value: t("channels.emailLink"),
      emailMailbox: "sales" as const,
    },
    {
      icon: Phone,
      label: t("channels.phone"),
      value: TAYPRO_SALES_PHONE_DISPLAY,
      href: TAYPRO_SALES_PHONE_TEL,
    },
    {
      icon: Building2,
      label: t("channels.hq"),
      value: t("channels.hqValue"),
      href: HEADQUARTERS_MAPS_URL,
      external: true,
    },
    {
      icon: MapPin,
      label: t("channels.manufacturing"),
      value: t("channels.manufacturingValue"),
      href: MFG_MAPS_URL,
      external: true,
    },
    {
      icon: Clock,
      label: t("channels.hours"),
      value: t("channels.hoursValue"),
      href: undefined,
    },
  ] as const;

  const enquiryTips = [
    t("tips.tip0"),
    t("tips.tip1"),
    t("tips.tip2"),
    t("tips.tip3"),
    t("tips.tip4"),
  ];

  const contactFaqs = [
    { question: t("faq.q0"), answer: t("faq.a0") },
    { question: t("faq.q1"), answer: t("faq.a1") },
    { question: t("faq.q2"), answer: t("faq.a2") },
    { question: t("faq.q3"), answer: t("faq.a3") },
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <LocalBusinessSchema
        name={t("schema.businessName")}
        description={t("schema.businessDescription")}
        address={{
          streetAddress: "Plot No 87, Survey No 286/2, near Saint Gobain",
          addressLocality: "Chakan",
          addressRegion: "Pune, Maharashtra",
          postalCode: "410501",
          addressCountry: "IN",
        }}
        telephone={TAYPRO_SALES_PHONE_E164}
        url={`${siteUrl}/contact`}
        openingHours="Mo-Fr 09:00-18:00"
        priceRange="$$"
        image={`${siteUrl}/tayproasset/taypro-logo.png`}
        siteUrl={siteUrl}
      />
      <FAQPageSchema faqs={contactFaqs} />

      <div className="min-h-screen overflow-x-hidden">
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
              {t("hero.eyebrow")}
            </p>
            <h1 className="font-semibold text-[#052638] text-4xl md:text-5xl mb-6 leading-tight">
              {t("hero.titleLine1")}
              <br />
              {t("hero.titleLine2")}
            </h1>
            <p className="text-[#22405a] text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
              {t("hero.bodyBeforeLink")}{" "}
              <Link
                href="/solar-panel-cleaning-system"
                className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
              >
                {t("hero.bodyLink")}
              </Link>{" "}
              {t("hero.bodyAfterLink")}
            </p>
          </AnimateOnScroll>

          <div className="absolute bottom-0 left-0 right-0 z-20 overflow-hidden pointer-events-none">
            <svg
              className="w-full h-20 md:h-32"
              viewBox="0 0 1440 320"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path fill="#f4f7f9" d="M0,224L1440,96L1440,320L0,320Z" />
            </svg>
          </div>
        </section>

        <section
          className="w-full py-14 md:py-20 bg-[#f4f7f9]"
          aria-labelledby="contact-main-heading"
        >
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
              <div className="lg:col-span-5 space-y-6">
                <AnimateOnScroll animation="fadeInLeft">
                  <h2
                    id="contact-main-heading"
                    className="text-[#052638] font-semibold text-2xl md:text-3xl mb-4"
                  >
                    {t("main.heading")}
                  </h2>
                  <p className="text-[#27415c] text-lg leading-relaxed">
                    {t("main.bodyBeforeLink")}{" "}
                    <Link
                      href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app"
                      className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
                    >
                      {t("main.bodyLink")}
                    </Link>{" "}
                    {t("main.bodyAfterLink")}
                  </p>
                </AnimateOnScroll>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {contactChannels.map((channel, idx) => {
                    const Icon = channel.icon;
                    const inner = (
                      <div className="flex gap-4 p-5 rounded-xl border border-gray-200 bg-white shadow-sm hover:border-[#A8C117]/60 hover:shadow-md transition h-full">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#f0f7e0] text-[#5a8f00]">
                          <Icon className="h-6 w-6" aria-hidden />
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="text-[#5a8f00] text-sm font-medium mb-1">
                            {channel.label}
                          </p>
                          <p className="text-[#052638] font-medium leading-snug text-sm">
                            {channel.value}
                          </p>
                        </div>
                      </div>
                    );
                    return (
                      <AnimateOnScroll
                        key={channel.label}
                        animation="fadeInUp"
                        delay={idx * 60}
                      >
                        {"emailMailbox" in channel ? (
                          <ContactEmailLink
                            mailbox={channel.emailMailbox}
                            location="contact_page"
                            className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A8C117] rounded-xl"
                          >
                            {inner}
                          </ContactEmailLink>
                        ) : channel.href && !("external" in channel && channel.external) ? (
                          <ContactPhoneLink
                            location="contact_page"
                            className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A8C117] rounded-xl"
                          >
                            {inner}
                          </ContactPhoneLink>
                        ) : channel.href ? (
                          <a
                            href={channel.href}
                            {...("external" in channel && channel.external
                              ? {
                                  target: "_blank",
                                  rel: "noopener noreferrer",
                                }
                              : {})}
                            className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A8C117] rounded-xl"
                          >
                            {inner}
                          </a>
                        ) : (
                          inner
                        )}
                      </AnimateOnScroll>
                    );
                  })}
                </div>
              </div>

              <AnimateOnScroll
                animation="fadeInRight"
                delay={100}
                className="lg:col-span-7"
              >
                <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-6 sm:p-8 md:p-10">
                  <RequestEstimateForm
                    variant="embedded"
                    showEmbeddedHeading
                    eyebrow={t("form.eyebrow")}
                    title={t("form.title")}
                    submitLabel={t("form.submit")}
                    thankYouTitle={t("form.thankYouTitle")}
                    thankYouMessage={t("form.thankYouMessage")}
                    analyticsFormType="contact_form"
                    className="!shadow-none !rounded-none !p-0"
                    embeddedFlush
                  />
                </div>
              </AnimateOnScroll>
            </div>

            <AnimateOnScroll animation="fadeInUp" delay={150} className="mt-12 lg:mt-14">
              <div
                className="rounded-2xl border border-[#052638]/10 bg-[#052638] p-6 md:p-8 lg:p-10"
                aria-labelledby="enquiry-tips-heading"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
                  <div className="flex items-center gap-3">
                    <Factory className="h-7 w-7 text-[#A8C117] shrink-0" aria-hidden />
                    <h3
                      id="enquiry-tips-heading"
                      className="font-semibold text-lg md:text-xl text-white"
                    >
                      {t("tips.heading")}
                    </h3>
                  </div>
                  <Link
                    href="/solar-panel-cleaning-robot-price-calculator#calculator"
                    className="inline-flex items-center gap-2 brand-inline-link font-medium text-sm shrink-0"
                  >
                    {t("tips.roiLink")}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                  {enquiryTips.map((tip, index) => (
                    <li
                      key={tip}
                      className={`flex gap-3 rounded-lg border border-white/10 bg-white/5 p-4 md:p-5 ${
                        index < 3 ? "lg:col-span-2" : "lg:col-span-3"
                      }`}
                    >
                      <span className="text-[#A8C117] font-bold shrink-0" aria-hidden>
                        •
                      </span>
                      <span className="text-white/90 text-sm md:text-base leading-relaxed">
                        {tip}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 md:mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-3">
                  <Link
                    href="/projects"
                    className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-lg border border-white/30 text-white font-medium text-sm hover:bg-white/10 transition"
                  >
                    {t("tips.viewProjects")}
                  </Link>
                  <Link
                    href="/company"
                    className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-lg border border-white/30 text-white font-medium text-sm hover:bg-white/10 transition"
                  >
                    {t("tips.aboutTaypro")}
                  </Link>
                </div>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        <section
          className="w-full py-14 md:py-20 bg-white px-4 sm:px-6"
          aria-labelledby="locations-heading"
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="mb-10 max-w-3xl">
              <h2
                id="locations-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4"
              >
                {t("locations.heading")}
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                {t("locations.intro")}
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <AnimateOnScroll animation="fadeInUp" delay={80}>
                <div className="rounded-xl border border-gray-200 bg-[#f8fafb] p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <Building2 className="h-6 w-6 text-[#5a8f00]" aria-hidden />
                    <h3 className="text-[#052638] font-semibold text-xl">
                      {t("locations.hqTitle")}
                    </h3>
                  </div>
                  <p className="text-[#27415c] leading-relaxed">
                    {t("locations.hqAddress")}
                  </p>
                  <a
                    href={HEADQUARTERS_MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-[#5a8f00] font-medium hover:underline text-sm"
                  >
                    {t("locations.hqMaps")}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </a>
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll animation="fadeInUp" delay={160}>
                <div className="rounded-xl border border-gray-200 bg-[#f8fafb] p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <Factory className="h-6 w-6 text-[#5a8f00]" aria-hidden />
                    <h3 className="text-[#052638] font-semibold text-xl">
                      {t("locations.mfgTitle")}
                    </h3>
                  </div>
                  <p className="text-[#27415c] leading-relaxed mb-2">
                    {t("locations.mfgAddress")}
                  </p>
                  <p className="text-[#27415c] text-sm leading-relaxed">
                    {t("locations.mfgNote")}
                  </p>
                  <a
                    href={MFG_MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-[#5a8f00] font-medium hover:underline text-sm"
                  >
                    {t("locations.mfgMaps")}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </a>
                </div>
              </AnimateOnScroll>
            </div>

            <AnimateOnScroll animation="fadeInUp" delay={200}>
              <p className="text-[#27415c] text-sm mb-3">{t("locations.mapCaption")}</p>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fadeInUp" delay={100}>
              <div className="relative w-full h-[320px] sm:h-[400px] md:h-[440px] rounded-2xl overflow-hidden border border-gray-200 shadow-md ring-1 ring-black/5">
                <Map />
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        <FaqSection
          id="contact-faq-heading"
          title={t("faq.heading")}
          subtitle={t("faq.subheading")}
          faqs={contactFaqs}
          tone="muted"
        />
      </div>
    </>
  );
}
