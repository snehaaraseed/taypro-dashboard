"use client";

import Link from "next/link";
import { ArrowRight, Droplets, IndianRupee, TrendingUp } from "lucide-react";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { Container } from "@/app/components/Container";
import OpenLeadModalButton from "@/app/components/OpenLeadModalButton";
import ROICalculatorEmbed from "@/app/components/ROICalculatorEmbed";
import {
  FAQPageSchema,
  SoftwareApplicationSchema,
} from "@/app/components/StructuredData";
import { robots, tayproTrustedByStatsStrip } from "@/app/data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: "ROI & price calculator", href: "" },
];

const calculatorBenefits = [
  {
    icon: IndianRupee,
    title: "Labour & O&M savings",
    description:
      "Compare manual washing crews and downtime against automated dry-cleaning cycles scaled to your DC capacity.",
  },
  {
    icon: Droplets,
    title: "Water avoided",
    description:
      "Taypro robots are waterless—see estimated litres not consumed versus periodic wet washing on dusty sites.",
  },
  {
    icon: TrendingUp,
    title: "Generation recovered",
    description:
      "Model soiling loss against tariff to quantify annual energy gain from more consistent panel cleanliness.",
  },
] as const;

const howItWorksSteps = [
  {
    step: "01",
    title: "Enter plant inputs",
    description:
      "Ground-mount or rooftop, fixed tilt / seasonal tilt / trackers, automation level, MW or kW capacity, tariff, and module wattage.",
  },
  {
    step: "02",
    title: "Run the estimate",
    description:
      "The model applies Taypro deployment assumptions—cycle cadence, dual-pass dry cleaning, and representative Indian utility tariffs.",
  },
  {
    step: "03",
    title: "Download or talk to us",
    description:
      "Export a PDF summary for internal review, then share it with our applications team for a plant-specific quote and SLA draft.",
  },
] as const;

const calculatorFaqs = [
  {
    question:
      "Is this solar panel cleaning robot price calculator the same as a formal quote?",
    answer:
      "No. This tool gives a directional ROI and investment band based on typical Taypro deployments. A formal quote accounts for your exact row lengths, tracker brand, soiling study, procurement model (CAPEX vs Taypro Opex), and service scope. Use the results as a starting point, then contact Taypro or open the lead form with your plant details.",
  },
  {
    question: "What plant sizes does the ROI calculator support?",
    answer:
      "Ground-mount utility plants from 1 MW to 10 GW (model cap) and rooftop sites from 100 kW to 10 MW. Defaults assume utility-scale tariffs (~₹3/kWh ground, ~₹10/kWh rooftop) which you can override. For very large or multi-block sites, our team refines robot counts and pricing after layout review.",
  },
  {
    question:
      "Which Taypro robot models does the calculator assume?",
    answer:
      "Automation level maps to fully automatic (Model-A / Model-T class) versus semi-automatic (Model-B). Installation type adjusts multipliers for fixed tilt, seasonal tilt, or single-axis trackers. For model-by-model specifications, see Model-A, Model-B, and Model-T product pages linked below.",
  },
  {
    question: "Can I use Taypro Opex instead of buying robots outright?",
    answer:
      "Yes. Many developers choose Taypro Opex—pay per panel cleaned with Taypro operating the fleet. The calculator models CAPEX-style investment; for Opex economics, mention your preference when requesting a tailored quote and we will align the business case to your procurement model.",
  },
  {
    question: "How accurate are the water and carbon figures?",
    answer:
      "Water savings assume dry cleaning replaces a representative wet-wash schedule. Carbon figures use standard grid emission factors applied to recovered generation. Both are indicative; your site's actual numbers depend on cleaning frequency, soiling rate, and regional grid intensity.",
  },
];

const exploreLinks = [
  { label: "Solar cleaning robots overview", href: "/solar-panel-cleaning-system" },
  { label: "Cleaning technology & dual-pass", href: "/cleaning-technology" },
  { label: "Installation projects", href: "/projects" },
  { label: "Contact Taypro", href: "/contact" },
] as const;

export default function SolarPanelCleaningRobotPriceCalculatorPage() {
  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <SoftwareApplicationSchema
        name="Taypro Solar Panel Cleaning Robot ROI Calculator"
        description="Free online calculator to estimate solar panel cleaning robot investment, payback, labour savings, water avoided, and generation gain for utility-scale and commercial PV plants in India."
        image="/tayproasset/taypro-robotImage.png"
        applicationCategory="BusinessApplication"
        operatingSystem="Web"
        url={`${siteUrl}/solar-panel-cleaning-robot-price-calculator`}
        siteUrl={siteUrl}
      />
      <FAQPageSchema faqs={calculatorFaqs} />

      <div className="min-h-screen overflow-x-hidden">
        {/* Hero */}
        <section className="relative flex flex-col items-center justify-start overflow-hidden pb-6">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/tayprobglayout/taypro-roi-bg.png')",
            }}
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-white/92 sm:bg-white/88"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/55 to-[#f4f7f9]"
            aria-hidden
          />

          <AnimateOnScroll
            animation="fadeInUp"
            className="relative z-10 pt-10 px-4 max-w-4xl mx-auto pb-6 text-center"
          >
            <p className="text-[#A8C117] text-[16px] mb-4 uppercase tracking-wide font-medium">
              Free online tool
            </p>
            <h1 className="font-semibold text-[#052638] text-4xl md:text-5xl mb-6 leading-tight">
              Solar panel cleaning robot
              <br />
              price &amp; ROI calculator
            </h1>
            <p className="text-[#22405a] text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
              Estimate payback, annual savings, water avoided, and indicative
              investment for{" "}
              <Link
                href="/solar-panel-cleaning-system"
                className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
              >
                Taypro autonomous and semi-automatic cleaning robots
              </Link>{" "}
              on your plant—before you request a site-specific quote.
            </p>
          </AnimateOnScroll>


          <section
            id="calculator"
            className="relative z-10 w-full py-6 md:py-8 pb-16 md:pb-20"
            aria-labelledby="calculator-heading"
          >
            <Container>
              <h2 id="calculator-heading" className="sr-only">
                Solar panel cleaning robot ROI calculator
              </h2>
              <AnimateOnScroll animation="fadeInUp" delay={80}>
                <ROICalculatorEmbed />
                <p className="mt-4 text-center text-[#5c6f82] text-sm max-w-2xl mx-auto leading-relaxed">
                  <strong className="text-[#27415c]">Note:</strong> ROI is based on
                  representative assumptions for Indian utility-scale and commercial
                  plants. Actual payback varies with layout, soiling, cycle cadence,
                  and whether you choose CAPEX purchase or{" "}
                  <Link
                    href="/solar-panel-cleaning-system/solar-panel-cleaning-service"
                    className="text-[#5a8f00] hover:underline"
                  >
                    Taypro Opex
                  </Link>
                  .
                </p>
              </AnimateOnScroll>
            </Container>
          </section>

          <div className="absolute bottom-0 left-0 right-0 z-20 overflow-hidden pointer-events-none">
            <svg
              className="w-full h-20 md:h-32"
              viewBox="0 0 1440 320"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path fill="#052638" d="M0,224L1440,96L1440,320L0,320Z" />
            </svg>
          </div>
        </section>

        {/* Stats */}
        <section className="w-full py-12 md:py-14 bg-[#052638]">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-8">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
                Why operators model ROI
              </p>
              <h2 className="text-white font-semibold text-2xl md:text-3xl">
                Scale Taypro has already proven in the field
              </h2>
            </AnimateOnScroll>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 text-center">
              {[...tayproTrustedByStatsStrip].map((stat, idx) => (
                <AnimateOnScroll
                  key={stat.label}
                  animation="fadeInUp"
                  delay={idx * 80}
                  className="px-2"
                >
                  <div className="text-[#A8C117] font-semibold text-3xl sm:text-4xl mb-2">
                    {stat.value}
                  </div>
                  <div className="text-white/80 text-sm sm:text-base">
                    {stat.label}
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        {/* What you'll estimate */}
        <section
          className="w-full py-14 md:py-16 bg-white"
          aria-labelledby="benefits-heading"
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mb-10">
              <h2
                id="benefits-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4"
              >
                What this calculator estimates
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                Directional figures for developers, EPC teams, and O&amp;M leads
                evaluating robotic cleaning against manual labour and wet washing—
                not a binding price list.
              </p>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {calculatorBenefits.map((item, idx) => (
                <AnimateOnScroll
                  key={item.title}
                  animation="fadeInUp"
                  delay={idx * 100}
                >
                  <article className="h-full rounded-xl border border-gray-200 bg-[#f8fafb] p-6 shadow-sm">
                    <item.icon
                      className="w-10 h-10 text-[#5a8f00] mb-4"
                      aria-hidden
                    />
                    <h3 className="text-[#052638] font-semibold text-xl mb-3">
                      {item.title}
                    </h3>
                    <p className="text-[#27415c] leading-relaxed">
                      {item.description}
                    </p>
                  </article>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        {/* How it works */}
        <section
          className="w-full py-14 md:py-16 bg-white"
          aria-labelledby="how-it-works-heading"
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center max-w-2xl mx-auto mb-10">
              <h2
                id="how-it-works-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4"
              >
                How to use this tool
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                Three steps from rough estimate to a conversation with our
                applications team.
              </p>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {howItWorksSteps.map((step, idx) => (
                <AnimateOnScroll
                  key={step.step}
                  animation="fadeInUp"
                  delay={idx * 100}
                >
                  <div className="text-center md:text-left">
                    <span className="text-[#A8C117] font-bold text-4xl block mb-3">
                      {step.step}
                    </span>
                    <h3 className="text-[#052638] font-semibold text-xl mb-2">
                      {step.title}
                    </h3>
                    <p className="text-[#27415c] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        {/* Robot models */}
        <section
          className="w-full py-14 md:py-16 bg-[#f4f7f9]"
          aria-labelledby="models-heading"
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mb-10">
              <h2
                id="models-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4"
              >
                Match results to the right robot
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                The calculator&apos;s automation and installation inputs align with
                Taypro&apos;s product line. Explore specifications before you
                finalize procurement.
              </p>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {robots.slice(0, 4).map((robot, idx) => (
                <AnimateOnScroll
                  key={robot.model}
                  animation="fadeInUp"
                  delay={idx * 80}
                >
                  <Link
                    href={robot.href}
                    className="group flex flex-col h-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-[#A8C117] hover:shadow-md transition"
                  >
                    <h3 className="text-[#052638] font-semibold text-lg mb-2 group-hover:text-[#5a8f00] transition-colors">
                      {robot.model}
                    </h3>
                    <p className="text-[#27415c] text-sm leading-relaxed flex-1">
                      {robot.description}
                    </p>
                    <span className="mt-4 text-[#5a8f00] text-sm font-medium group-hover:underline inline-flex items-center gap-1">
                      View details
                      <ArrowRight className="w-4 h-4" aria-hidden />
                    </span>
                  </Link>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        {/* Methodology */}
        <section className="bg-[#052638] py-16 sm:py-20">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp">
              <p className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Methodology
              </p>
              <h2 className="text-white font-semibold text-3xl sm:text-4xl mb-6 leading-tight">
                What goes into the numbers
              </h2>
              <div className="space-y-5 text-white/85 text-base sm:text-lg leading-relaxed">
                <p>
                  The calculator converts plant size, per-kWh tariff, assumed
                  soiling recovery, and representative cleaning-cycle economics into
                  annual generation gain, water savings, labour avoided, and a
                  payback estimate. It reflects utility-scale conditions on Indian
                  plants where Taypro robots operate today—fixed-tilt or single-axis
                  tracker, dusty agricultural or arid environments, and roughly 3–10
                  dry cleaning cycles per month.
                </p>
                <p>
                  Final figures depend on your{" "}
                  <Link
                    href="/cleaning-technology"
                    className="text-[#A8C117] hover:underline"
                  >
                    cleaning technology and dual-pass methodology
                  </Link>
                  , the robot model for your layout (
                  <Link
                    href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system"
                    className="text-[#A8C117] hover:underline"
                  >
                    Model-A
                  </Link>
                  ,{" "}
                  <Link
                    href="/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system"
                    className="text-[#A8C117] hover:underline"
                  >
                    Model-B
                  </Link>
                  , or{" "}
                  <Link
                    href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers"
                    className="text-[#A8C117] hover:underline"
                  >
                    Model-T
                  </Link>
                  ), and CAPEX versus{" "}
                  <Link
                    href="/solar-panel-cleaning-system/solar-panel-cleaning-service"
                    className="text-[#A8C117] hover:underline"
                  >
                    Taypro Opex
                  </Link>
                  . Compare models on the{" "}
                  <Link
                    href="/solar-panel-cleaning-system"
                    className="text-[#A8C117] hover:underline"
                  >
                    solar panel cleaning robot overview
                  </Link>
                  .
                </p>
                <p>
                  Track fleet performance after deployment with{" "}
                  <Link
                    href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app"
                    className="text-[#A8C117] hover:underline"
                  >
                    Taypro Console
                  </Link>
                  . For real project economics, browse our{" "}
                  <Link href="/projects" className="text-[#A8C117] hover:underline">
                    installation case studies
                  </Link>
                  .
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <OpenLeadModalButton
                  topic="Solar Panel Cleaning Robot quote (ROI calculator)"
                  title="Get a tailored ROI quote"
                  subtitle="Share a few plant details — our team will turn the calculator estimate into a precise number for your site."
                  className="inline-flex items-center justify-center min-h-[48px] bg-[#A8C117] text-[#052638] font-medium px-8 py-3.5 rounded-md hover:bg-[#b3cf3d] transition text-center"
                >
                  Get a tailored ROI quote
                </OpenLeadModalButton>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center min-h-[48px] border-2 border-white/70 text-white font-medium px-8 py-3.5 rounded-md hover:bg-white/10 transition text-center"
                >
                  Contact Taypro
                </Link>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* FAQ */}
        <section
          className="w-full py-16 md:py-20 bg-white px-4 sm:px-6"
          aria-labelledby="calculator-faq-heading"
        >
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <h2
                id="calculator-faq-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-3"
              >
                Frequently asked questions
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                Common questions about robot pricing, payback, and how this tool
                relates to a formal Taypro proposal.
              </p>
            </AnimateOnScroll>
            <div className="space-y-6">
              {calculatorFaqs.map((faq, idx) => (
                <AnimateOnScroll
                  key={faq.question}
                  animation="fadeInUp"
                  delay={idx * 80}
                >
                  <article className="bg-[#f8fafb] rounded-xl border border-gray-200 p-6 shadow-sm">
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

        {/* Explore */}
        <section className="w-full py-14 md:py-16 bg-[#f4f7f9]">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-8">
              <h2 className="text-[#052638] font-semibold text-2xl md:text-3xl mb-3">
                Continue exploring
              </h2>
              <p className="text-[#27415c]">
                Deep-dive on technology, deployments, or speak with our team.
              </p>
            </AnimateOnScroll>
            <div className="flex flex-wrap justify-center gap-3">
              {exploreLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-[#052638] text-sm font-medium hover:border-[#A8C117] hover:text-[#5a8f00] transition shadow-sm"
                >
                  {link.label}
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
              ))}
            </div>
          </Container>
        </section>
      </div>
    </>
  );
}
