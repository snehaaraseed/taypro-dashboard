"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { Container } from "@/app/components/Container";
import FAQAccordion from "@/app/components/FAQAccordion";

import ROICalculatorEmbed from "@/app/components/ROICalculatorEmbed";

const RequestEstimateForm = dynamic(
  () => import("@/app/components/RequestEstimateForm"),
  {
    loading: () => (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading form…</div>
      </div>
    ),
  }
);

const ClientsCard = dynamic(() => import("@/app/components/ClientsCard"), {
  loading: () => (
    <div className="min-h-[200px] flex items-center justify-center bg-white">
      <div className="animate-pulse text-gray-400">Loading clients…</div>
    </div>
  ),
});

interface HomePageInteractiveProps {
  features: Array<{ title: string; description: string }>;
  otherFeatures: Array<{ title: string; description: string }>;
  homeFaqs: Array<{ question: string; answer: string }>;
}

export default function HomePageInteractive({
  features,
  otherFeatures,
  homeFaqs,
}: HomePageInteractiveProps) {
  return (
    <>
      {/* Why Taypro */}
      <section
        className="py-14 md:py-20 bg-white"
        aria-labelledby="why-taypro-heading"
      >
        <Container>
          <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-3">
              Why utility-scale operators choose Taypro
            </p>
            <h2
              id="why-taypro-heading"
              className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4"
            >
              Waterless robots built for Indian solar plants
            </h2>
            <p className="text-[#27415c] text-lg leading-relaxed">
              From fixed-tilt fields to single-axis trackers—recover generation,
              cut water use, and replace labour-heavy washing with a fleet you can
              monitor on{" "}
              <Link
                href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app"
                className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
              >
                Taypro Console
              </Link>
              . See how{" "}
              <Link
                href="/cleaning-technology"
                className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
              >
                dual-pass dry cleaning
              </Link>{" "}
              works in the field.
            </p>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {features.map((feature, idx) => (
              <AnimateOnScroll
                key={feature.title}
                animation="fadeInUp"
                delay={idx * 80}
              >
                <article className="flex gap-4 rounded-xl border border-gray-200 bg-[#f8fafb] p-6 h-full">
                  <Check
                    className="w-6 h-6 text-[#5a8f00] shrink-0 mt-0.5"
                    aria-hidden
                  />
                  <div>
                    <h3 className="text-[#052638] font-semibold text-lg mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-[#27415c] text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </article>
              </AnimateOnScroll>
            ))}
          </div>
        </Container>
      </section>

      {/* Technology */}
      <section
        className="py-14 md:py-20 bg-[#052638]"
        aria-labelledby="technology-heading"
      >
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="space-y-6">
              <AnimateOnScroll animation="fadeInUp">
                <h2
                  id="technology-heading"
                  className="text-white font-semibold text-3xl md:text-4xl leading-tight"
                >
                  Advanced solar panel cleaning robot technology
                </h2>
                <p className="text-white/80 mt-4 text-lg leading-relaxed">
                  Patented hardware and connectivity designed for dusty,
                  utility-scale sites—documented across{" "}
                  <Link href="/projects" className="text-[#A8C117] hover:underline">
                    live deployments
                  </Link>
                  .
                </p>
              </AnimateOnScroll>
              {otherFeatures.map((feature, idx) => (
                <AnimateOnScroll
                  key={feature.title}
                  animation="fadeInLeft"
                  delay={idx * 80}
                  className="flex gap-4"
                >
                  <Check
                    className="w-5 h-5 text-[#A8C117] shrink-0 mt-1"
                    aria-hidden
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-white/85 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>

            <AnimateOnScroll animation="fadeInRight" delay={100}>
              <div className="relative w-full max-w-md mx-auto lg:max-w-none">
                <Image
                  src="/tayproasset/robots.png"
                  alt="Taypro automatic, semi-automatic, and tracker solar panel cleaning robots"
                  title="Taypro solar panel cleaning robot lineup"
                  width={600}
                  height={900}
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </AnimateOnScroll>
          </div>
        </Container>
      </section>

      {/* ROI teaser */}
      <section
        id="roi-calculator"
        className="py-14 md:py-20 bg-[#f4f7f9]"
        aria-labelledby="home-roi-heading"
      >
        <Container>
          <AnimateOnScroll animation="fadeInUp" className="text-center max-w-3xl mx-auto mb-8">
            <h2
              id="home-roi-heading"
              className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4"
            >
              Estimate robot payback for your plant
            </h2>
            <p className="text-[#27415c] text-lg leading-relaxed">
              Run a directional ROI on labour, water, and generation savings—or open
              the full calculator for PDF export and detailed assumptions.
            </p>
            <Link
              href="/solar-panel-cleaning-robot-price-calculator"
              className="inline-flex items-center gap-2 mt-4 text-[#5a8f00] font-semibold hover:underline"
            >
              Open full ROI &amp; price calculator
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fadeInUp" delay={100}>
            <ROICalculatorEmbed />
          </AnimateOnScroll>
        </Container>
      </section>

      <ClientsCard />

      {/* FAQ */}
      <section
        className="py-14 md:py-20 bg-white"
        aria-labelledby="home-faq-heading"
      >
        <Container size="narrow">
          <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
            <h2
              id="home-faq-heading"
              className="text-[#052638] font-semibold text-3xl md:text-4xl mb-3"
            >
              Frequently asked questions
            </h2>
            <p className="text-[#27415c] text-lg">
              Quick answers about Taypro cleaning robots in India.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeInUp" delay={80}>
            <FAQAccordion faqs={homeFaqs} variant="modern" />
          </AnimateOnScroll>
        </Container>
      </section>

      <section
        id="request-quote"
        className="py-16 md:py-20 bg-[#f4f7f9] border-t border-gray-200/80"
        aria-labelledby="home-quote-heading"
      >
        <Container size="narrow">
          <AnimateOnScroll animation="fadeInUp" className="text-center mb-8 md:mb-10">
            <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
              Get started
            </p>
            <h2
              id="home-quote-heading"
              className="text-[#052638] font-semibold text-3xl md:text-4xl mb-3"
            >
              Request a solar panel cleaning robot quote
            </h2>
            <p className="text-[#27415c] text-lg leading-relaxed max-w-xl mx-auto">
              Share plant capacity, layout, and procurement preference—our team will
              recommend the right cleaning robot or Opex model for your site.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeInUp" delay={80}>
            <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-md ring-1 ring-gray-200/80">
              <RequestEstimateForm
                variant="embedded"
                stackedEmbedded
                showEmbeddedHeading={false}
                submitLabel="Send request"
                messageLabel="Plant details & requirements"
                messagePlaceholder="e.g. 100 MW fixed tilt in Rajasthan, evaluating robots vs manual O&M…"
              />
            </div>
          </AnimateOnScroll>
        </Container>
      </section>
    </>
  );
}
