"use client";

import Link from "next/link";
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
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { Container } from "@/app/components/Container";
import {
  FAQPageSchema,
  LocalBusinessSchema,
} from "@/app/components/StructuredData";

const Map = dynamic(() => import("@/app/components/Map"), { ssr: false });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: "Contact", href: "" },
];

const contactChannels = [
  {
    icon: Mail,
    label: "Sales enquiries",
    value: "sales@taypro.in",
    href: "mailto:sales@taypro.in",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "08043843569",
    href: "tel:08043843569",
  },
  {
    icon: Building2,
    label: "Headquarters",
    value:
      "T3-906, Kohinoor World Towers, Pimpri Colony, Pune, Maharashtra 411019",
    href: "https://www.google.com/maps/search/?api=1&query=T3-906+Kohinoor+World+Towers+Pimpri+Colony+Pune+411019",
    external: true,
  },
  {
    icon: MapPin,
    label: "Manufacturing hub",
    value: "Chakan, Pune, Maharashtra 410501",
    href: "https://www.google.com/maps/search/?api=1&query=18.735204,73.8519138",
    external: true,
  },
  {
    icon: Clock,
    label: "Working hours",
    value: "Monday – Friday, 9:00 AM – 6:00 PM IST",
    href: undefined,
  },
] as const;

const enquiryTips = [
  "DC capacity (MW) and state / region of the plant",
  "Array type: fixed tilt, seasonal tilt, rooftop, or single-axis trackers",
  "Soiling profile, water availability, and current cleaning approach",
  "Whether you are evaluating CAPEX purchase or Taypro Opex as a managed service",
] as const;

const contactFaqs = [
  {
    question: "How quickly will Taypro respond to my enquiry?",
    answer:
      "Our applications team typically responds within one business day with next steps—clarifying questions, scheduling a technical call, or requesting layout inputs. Urgent fleet or breakdown topics from existing customers are prioritised through the same sales line.",
  },
  {
    question: "What information helps you prepare an accurate robot recommendation?",
    answer:
      "Share block layouts, approximate row lengths, tracker brand (if applicable), desired cleaning frequency, and any water or labour constraints. Photos, single-line diagrams, or O&M reports accelerate the conversation. You can also start with the ROI calculator and bring those inputs to the call.",
  },
  {
    question: "Can developers or EPC teams visit the Chakan manufacturing facility?",
    answer:
      "Yes—site visits and factory walkthroughs can be arranged by appointment at our Chakan, Pune hub. Contact us with your preferred dates and the stakeholders attending (engineering, procurement, or O&M).",
  },
  {
    question: "Does Taypro support plants outside Maharashtra?",
    answer:
      "Taypro deploys and services robots pan-India. Manufacturing is in Chakan, Pune, with warehouses across India for spares, commissioning support, and field response—whether your plant is in Rajasthan, Karnataka, Gujarat, or elsewhere.",
  },
];

const HEADQUARTERS_ADDRESS =
  "T3-906, Kohinoor World Towers, Pimpri Colony, Pune, Maharashtra, India 411019";

const MANUFACTURING_ADDRESS =
  "Plot No 87, Survey No 286/2, near Saint Gobain, Chakan, Pune, Maharashtra, India 410501";

const HEADQUARTERS_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=T3-906+Kohinoor+World+Towers+Pimpri+Colony+Pune+411019";

export default function ContactUsPage() {
  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <LocalBusinessSchema
        name="Taypro Private Limited"
        description="Manufacturer of autonomous and semi-automatic solar panel cleaning robots for utility-scale and commercial PV plants in India."
        address={{
          streetAddress: "Plot No 87, Survey No 286/2, near Saint Gobain",
          addressLocality: "Chakan",
          addressRegion: "Pune, Maharashtra",
          postalCode: "410501",
          addressCountry: "IN",
        }}
        telephone="+918043843569"
        url={`${siteUrl}/contact`}
        openingHours="Mo-Fr 09:00-18:00"
        priceRange="$$"
        image={`${siteUrl}/tayproasset/taypro-logo.png`}
        siteUrl={siteUrl}
      />
      <FAQPageSchema faqs={contactFaqs} />

      <div className="min-h-screen overflow-x-hidden">
        {/* Hero */}
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
            className="relative z-10 pt-10 px-4 max-w-4xl mx-auto pb-24 text-center"
          >
            <p className="text-[#A8C117] text-[16px] mb-4 uppercase tracking-wide">
              Talk to our team
            </p>
            <h1 className="font-semibold text-[#052638] text-4xl md:text-5xl mb-6 leading-tight">
              Contact Taypro about
              <br />
              solar panel cleaning robots
            </h1>
            <p className="text-[#22405a] text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
              Request a quote, book a technical discussion, or plan a visit to our
              Chakan manufacturing hub. We help developers, IPPs, and O&amp;M teams
              match{" "}
              <Link
                href="/solar-panel-cleaning-system"
                className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
              >
                Model-A, Model-B, or Model-T
              </Link>{" "}
              robots—and Taypro Opex or Console—to your plant layout and procurement
              model.
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

        {/* Form + contact details */}
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
                    Reach our applications team
                  </h2>
                  <p className="text-[#27415c] text-lg leading-relaxed">
                    Share your plant details and we will recommend the right
                    robotic cleaning approach—hardware, operator-led Opex, or a
                    mixed fleet with{" "}
                    <Link
                      href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app"
                      className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
                    >
                      Taypro Console
                    </Link>{" "}
                    monitoring.
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
                        {channel.href ? (
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
                    eyebrow="Request a quote"
                    title="Tell us about your solar plant"
                    submitLabel="Send enquiry"
                    thankYouTitle="Thanks — we've received your enquiry"
                    thankYouMessage="Our applications team will respond within one business day."
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
                      What to include in your message
                    </h3>
                  </div>
                  <Link
                    href="/solar-panel-cleaning-robot-price-calculator"
                    className="inline-flex items-center gap-2 text-[#A8C117] font-medium text-sm hover:underline shrink-0"
                  >
                    Try the ROI calculator first
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {enquiryTips.map((tip) => (
                    <li
                      key={tip}
                      className="flex gap-3 rounded-lg border border-white/10 bg-white/5 p-4 md:p-5"
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
                    View projects
                  </Link>
                  <Link
                    href="/company"
                    className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-lg border border-white/30 text-white font-medium text-sm hover:bg-white/10 transition"
                  >
                    About Taypro
                  </Link>
                </div>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* Locations */}
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
                Our locations in Pune
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                Corporate headquarters in Pimpri and robot manufacturing in Chakan—both
                within the Pune region. Use the map below for the manufacturing hub, or
                open either address in Google Maps for directions.
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <AnimateOnScroll animation="fadeInUp" delay={80}>
                <div className="rounded-xl border border-gray-200 bg-[#f8fafb] p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <Building2 className="h-6 w-6 text-[#5a8f00]" aria-hidden />
                    <h3 className="text-[#052638] font-semibold text-xl">
                      Corporate headquarters
                    </h3>
                  </div>
                  <p className="text-[#27415c] leading-relaxed">{HEADQUARTERS_ADDRESS}</p>
                  <a
                    href={HEADQUARTERS_MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-[#5a8f00] font-medium hover:underline text-sm"
                  >
                    Open headquarters in Google Maps
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </a>
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll animation="fadeInUp" delay={160}>
                <div className="rounded-xl border border-gray-200 bg-[#f8fafb] p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <Factory className="h-6 w-6 text-[#5a8f00]" aria-hidden />
                    <h3 className="text-[#052638] font-semibold text-xl">
                      Manufacturing hub
                    </h3>
                  </div>
                  <p className="text-[#27415c] leading-relaxed mb-2">
                    {MANUFACTURING_ADDRESS}
                  </p>
                  <p className="text-[#27415c] text-sm leading-relaxed">
                    Factory visits and walkthroughs can be arranged by appointment.
                  </p>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=18.735204,73.8519138"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-[#5a8f00] font-medium hover:underline text-sm"
                  >
                    Open manufacturing hub in Google Maps
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </a>
                </div>
              </AnimateOnScroll>
            </div>

            <AnimateOnScroll animation="fadeInUp" delay={200}>
              <p className="text-[#27415c] text-sm mb-3">
                Map: corporate headquarters (Pimpri) and manufacturing hub
                (Chakan). Green pin = HQ, navy pin = factory.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fadeInUp" delay={100}>
              <div className="relative w-full h-[320px] sm:h-[400px] md:h-[440px] rounded-2xl overflow-hidden border border-gray-200 shadow-md ring-1 ring-black/5">
                <Map />
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* FAQ */}
        <section
          className="w-full py-16 md:py-20 bg-[#f4f7f9] px-4 sm:px-6"
          aria-labelledby="contact-faq-heading"
        >
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <h2
                id="contact-faq-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-3"
              >
                Frequently asked questions
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                Common questions before you submit an enquiry or visit our Pune
                facility.
              </p>
            </AnimateOnScroll>
            <div className="space-y-6">
              {contactFaqs.map((faq, idx) => (
                <AnimateOnScroll
                  key={faq.question}
                  animation="fadeInUp"
                  delay={idx * 80}
                >
                  <article className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-[#052638] font-semibold text-lg mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-[#27415c] leading-relaxed">{faq.answer}</p>
                  </article>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>
      </div>
    </>
  );
}
