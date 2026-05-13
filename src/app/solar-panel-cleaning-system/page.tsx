"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  BadgeCheck,
  BatteryCharging,
  Check,
  ChevronRight,
  Cog,
  Droplets,
  Factory,
  Gauge,
  LayoutDashboard,
  LifeBuoy,
  MapPin,
  Sparkles,
  Sun,
  Wrench,
} from "lucide-react";

import CallbackCard from "@/app/components/CallbackCard";
import ClientsCard from "@/app/components/ClientsCard";
import { RobotCard } from "@/app/components/RobotCard";
import {
  additionalProjects,
  robotFeatures,
  robotProducts,
  robotSolutions,
  robotsAdvantages,
  tayproRobotConnectivitySummary,
  toDoFeatures,
} from "@/app/data";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import ROITayproCalculator from "@/app/components/ROICalculator";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { Container } from "@/app/components/Container";
import {
  CollectionPageSchema,
  FAQPageSchema,
  ItemListSchema,
} from "@/app/components/StructuredData";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: "Solar Panel Cleaning Robots", href: "" },
];

const robotProductHighlights: Record<
  string,
  { eyebrow: string; bullets: string[] }
> = {
  "Model-A": {
    eyebrow: "Fully Autonomous · CAPEX",
    bullets: [
      "Dual-pass waterless cleaning (air + microfiber)",
      "Up to 3,600 modules per charge, AI/ML scheduling",
      "Best for fixed / seasonal-tilt utility-scale plants",
    ],
  },
  "Model-B": {
    eyebrow: "Semi-Automatic · Pick & Place",
    bullets: [
      "1 MW cleaned in ~2 hours, portable across blocks",
      "Lowest cost-per-MW for distributed plants",
      "Ideal for scattered or constrained layouts",
    ],
  },
  "Model-T": {
    eyebrow: "Tracker-Ready · Autonomous",
    bullets: [
      "Patented 360° flexible rotational bridge",
      "Works across NEXTracker, Gamechanger & more",
      "Built for single-axis tracker plants",
    ],
  },
};

const robotSolutionHighlights: Record<
  string,
  { eyebrow: string; bullets: string[] }
> = {
  "Taypro Opex": {
    eyebrow: "Service · Pay Per Panel Cleaned",
    bullets: [
      "No CAPEX — monthly OPEX, billed by panels cleaned",
      "Plant soiling study + 3–10 cycles per month",
      "Operated by TAYPRO Private Limited",
    ],
  },
  "Taypro Console": {
    eyebrow: "Software · Fleet Portal",
    bullets: [
      "Site dashboards, schedules, logs & exports",
      "Gateway and robot health visibility",
      "Role-based access, support tickets, chat",
    ],
  },
};

const decisionGuide = [
  {
    icon: Sun,
    title: "Fixed / seasonal-tilt utility plants",
    body: "Daily, fully autonomous cleaning on every row, every night. Choose Model-A for the highest cleaning uptime and lowest manual intervention.",
    cta: { label: "See Model-A", href: "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system" },
  },
  {
    icon: Factory,
    title: "Scattered or distributed plants",
    body: "Multiple smaller blocks, rooftops or constrained layouts where one robot per row is overkill. Model-B moves block-to-block and cleans 1 MW in roughly 2 hours.",
    cta: { label: "See Model-B", href: "/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system" },
  },
  {
    icon: Cog,
    title: "Single-axis tracker plants",
    body: "Tracker structures need a tracker-aware robot. Model-T's 360° rotational bridge handles NEXTracker, Gamechanger and other popular trackers out of the box.",
    cta: { label: "See Model-T", href: "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers" },
  },
  {
    icon: BatteryCharging,
    title: "Prefer outcomes, not assets?",
    body: "If you'd rather not own the hardware, Taypro OPEX delivers robotic cleaning as a monthly service, with reports surfaced in Taypro Console.",
    cta: { label: "See Taypro OPEX", href: "/solar-panel-cleaning-system/solar-panel-cleaning-service" },
  },
];

const comparisonRows: { criterion: string; modelA: string; modelB: string; modelT: string }[] = [
  {
    criterion: "Plant type",
    modelA: "Fixed / seasonal-tilt utility-scale",
    modelB: "Distributed, scattered or constrained",
    modelT: "Single-axis tracker plants",
  },
  {
    criterion: "Autonomy",
    modelA: "Fully autonomous (one robot per row)",
    modelB: "Semi-automatic (operator-assisted pick & place)",
    modelT: "Fully autonomous with tracker handover",
  },
  {
    criterion: "Cleaning method",
    modelA: "Waterless dual-pass — airflow + microfiber",
    modelB: "Waterless dry cleaning, portable arm",
    modelT: "Waterless dual-pass with flexible 360° bridge",
  },
  {
    criterion: "Cleaning rate",
    modelA: "Up to 3,600 modules per charge",
    modelB: "~1 MW in ~2 hours per unit",
    modelT: "Row-by-row, tracker-synchronised",
  },
  {
    criterion: "Commercial model",
    modelA: "CAPEX + AMC, 12–18 month payback typical",
    modelB: "CAPEX + AMC, lowest cost-per-MW",
    modelT: "CAPEX + AMC, tracker plant economics",
  },
  {
    criterion: "Connectivity to Taypro Console",
    modelA: tayproRobotConnectivitySummary,
    modelB: "Operator-led with Console reporting",
    modelT: tayproRobotConnectivitySummary,
  },
];

const indianConditions = [
  {
    icon: Droplets,
    title: "Waterless — for water-scarce states",
    body: "Indian utility plants increasingly sit in water-stressed districts. Taypro's waterless dual-pass cleaning removes module washing from your water plan entirely.",
  },
  {
    icon: Sun,
    title: "High-soiling region performance",
    body: "Daily or near-daily robotic cycles are the only economical way to neutralise the 8–25% soiling losses common across Rajasthan, Gujarat, MP and Maharashtra.",
  },
  {
    icon: Gauge,
    title: "Temperature & humidity tested",
    body: "Validated for operating temperatures up to 90°C and TÜV NORD certified for damp-heat / dry-heat — proven across summer, monsoon and post-monsoon cycles.",
  },
  {
    icon: LifeBuoy,
    title: "72-hour pan-India service SLA",
    body: "On-site technical intervention within 72 hours anywhere in India, with immediate remote diagnostics from Taypro Console — the fastest robotic-cleaning SLA in the country.",
  },
];

const whyTaypro = [
  {
    icon: Factory,
    title: "Made-in-India manufacturing",
    body: "Designed, manufactured and serviced by TAYPRO Private Limited — engineered for the realities of Indian utility-scale solar O&M.",
  },
  {
    icon: BadgeCheck,
    title: "Certified & patented technology",
    body: "TÜV NORD certified hardware, ISO-aligned processes, and patented dual-pass cleaning and RF mesh communications.",
  },
  {
    icon: MapPin,
    title: "Deployed across India",
    body: "Robotic cleaning live at multi-megawatt plants across Maharashtra, Madhya Pradesh, Karnataka and beyond — including 50–250 MW projects.",
  },
  {
    icon: Wrench,
    title: "Same-day breakdown support",
    body: "Dedicated service engineers, remote diagnostics on Console, and a 72-hour on-site SLA so a robot down doesn't mean a row down for long.",
  },
];

const hubFaqs = [
  {
    question: "What is a Solar Panel Cleaning Robot and why do solar plants need one?",
    answer:
      "A Solar Panel Cleaning Robot is an automated machine that removes dust, bird droppings and other soiling from PV modules without water and without manual labour. For Indian utility-scale plants, soiling can cut generation by 8–25%, which directly hits PPA performance and DISCOM penalties. Robotic cleaning recovers that lost yield, removes water from your O&M plan, and gives you predictable cleaning every cycle — far more consistent than manual wash teams.",
  },
  {
    question: "Which is the best Solar Panel Cleaning Robot for utility-scale plants in India?",
    answer:
      "For most large fixed or seasonal-tilt plants, the Taypro Model-A Automatic Solar Panel Cleaning Robot is the right answer — fully autonomous, waterless dual-pass cleaning, AI/ML scheduling, and built for Indian heat and dust. For single-axis tracker plants, Model-T is the tracker-aware option. For scattered or smaller blocks, Model-B's semi-automatic pick-and-place model gives the lowest cost-per-MW.",
  },
  {
    question: "Are Taypro's Solar Panel Cleaning Robots fully automatic?",
    answer:
      "Model-A and Model-T are fully autonomous — they run on pre-scheduled cycles, return to their docking station, and report status to Taypro Console without daily operator effort. Model-B is semi-automatic and operator-assisted, which keeps it portable across blocks. Across all three, the Taypro Console fleet portal lets your team monitor health, schedule cleaning, and pull cleaning reports remotely.",
  },
  {
    question: "Do Solar Panel Cleaning Robots use water?",
    answer:
      "No. All Taypro robots are waterless. They use a patented dual-pass dry cleaning method — first airflow to lift dust, then a soft microfiber cloth for a deep wipe. There's no water tanker logistics, no module thermal-shock risk, and no consumption of scarce water in dry districts.",
  },
  {
    question: "How much does a Solar Panel Cleaning Robot cost in India and what's the ROI?",
    answer:
      "Pricing depends on plant size, model (Model-A / B / T), site layout and commercial structure (CAPEX vs OPEX). Typical CAPEX deployments target a 12–18 month payback driven by yield recovery, reduced water and labour, and lower DISCOM penalties. Use the Taypro Solar Panel Cleaning Robot ROI Calculator on our website for a quick plant-specific estimate, then contact us for a detailed quote.",
  },
  {
    question: "Can I buy robotic cleaning as a service instead of CAPEX?",
    answer:
      "Yes. Taypro OPEX is our pay-per-panel-cleaned monthly service for utility-scale plants (typically 50 MW+). Taypro deploys Model-A, Model-B or Model-T as the site requires, runs 3–10 cycles per month based on a soiling study, and bills only for panels cleaned. You see every cycle and report on Taypro Console without owning the hardware.",
  },
  {
    question: "How are the robots monitored after installation?",
    answer:
      "Every Taypro deployment is monitored through Taypro Console — the secure customer portal for fleet dashboards, schedules, cleaning logs, exports, and support tickets. Fleet connectivity uses LTE, Wi-Fi, hybrid self-healing RF mesh, LoRa and LoRaWAN, designed and sized by Taypro engineers during commissioning.",
  },
  {
    question: "What support does Taypro provide if a robot breaks down?",
    answer:
      "Taypro provides a 72-hour on-site service SLA across India along with immediate remote diagnostics from Taypro Console, plus AMC packages for ongoing preventive maintenance. Dedicated technicians, an in-house manufacturing line, and a structured ticketing workflow on Console keep MTTR predictable.",
  },
  {
    question: "Is Taypro a manufacturer or a reseller of Solar Panel Cleaning Robots?",
    answer:
      "Taypro is a Made-in-India manufacturer. TAYPRO Private Limited designs, builds, deploys and services its own Solar Panel Cleaning Robots, with patented dual-pass cleaning and RF mesh communications, TÜV NORD certified hardware, and a pan-India service network.",
  },
  {
    question: "How often should solar panels be cleaned in India?",
    answer:
      "Frequency depends on dust load, agricultural residue events (such as crop burning in Punjab and Haryana), monsoon patterns and PPA performance targets. Most Indian utility-scale plants benefit from cleaning every 1–3 days during dry months and faster cycles after dust storms. Taypro starts every project with a plant soiling study to recommend the right cleaning cadence per block.",
  },
];

const heroStats = [
  { value: "50 MW+", label: "Typical plant size deployed" },
  { value: "72 hr", label: "Pan-India service SLA" },
  { value: "TÜV NORD", label: "Certified hardware" },
  { value: "Waterless", label: "Dual-pass cleaning" },
];

const allProductsForSchema = [...robotProducts, ...robotSolutions];

export default function SolarPanelCleaningRobot() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <CollectionPageSchema
        name="Solar Panel Cleaning Robots by Taypro"
        description="Category of Solar Panel Cleaning Robots from Taypro: Automatic (Model-A), Semi-Automatic (Model-B), Tracker-Ready (Model-T), Taypro OPEX cleaning service, and Taypro Console fleet portal."
        url={`${siteUrl}/solar-panel-cleaning-system`}
      />
      <ItemListSchema
        name="Taypro Solar Panel Cleaning Robots — Product Line"
        description="Complete line of Taypro Solar Panel Cleaning Robots and related software / service offerings."
        items={allProductsForSchema.map((r) => ({
          name: `${r.model} — Solar Panel Cleaning Robot`,
          url: r.href,
          description: r.description,
          image: r.imgPath,
        }))}
      />
      <FAQPageSchema faqs={hubFaqs} />

      <div className="min-h-screen overflow-x-hidden">
        {/* HERO */}
        <section className="bg-white">
          <Container className="py-10 sm:py-14">
            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12 items-stretch">
              <AnimateOnScroll
                animation="fadeInLeft"
                className="bg-[#052638] text-white px-6 sm:px-10 py-10 sm:py-14 flex flex-col justify-center rounded-lg"
              >
                <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                  Solar Panel Cleaning Robots · Made in India
                </div>
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold leading-tight mb-5">
                  Solar Panel Cleaning Robots for Utility-Scale Solar Plants
                </h1>
                <p className="text-white/85 text-base sm:text-lg leading-relaxed mb-7 max-w-2xl">
                  Taypro designs, manufactures and services{" "}
                  <strong>Solar Panel Cleaning Robots</strong> for India&rsquo;s
                  utility-scale solar plants — fully{" "}
                  <strong>Automatic (Model-A)</strong>, semi-automatic
                  pick-and-place <strong>(Model-B)</strong>, and tracker-ready{" "}
                  <strong>(Model-T)</strong>. Waterless dual-pass cleaning,
                  AI/ML scheduling, TÜV NORD certified hardware, and a 72-hour
                  pan-India service SLA — available as CAPEX or as a monthly{" "}
                  <Link
                    href="/solar-panel-cleaning-system/solar-panel-cleaning-service"
                    className="text-[#A8C117] hover:underline font-medium"
                  >
                    pay-per-panel-cleaned service
                  </Link>
                  .
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center min-h-[48px] sm:min-w-[200px] bg-[#A8C117] text-[#052638] font-medium px-7 py-3.5 rounded-md hover:bg-[#b3cf3d] transition"
                  >
                    Request a quote
                  </Link>
                  <Link
                    href="/solar-panel-cleaning-robot-price-calculator"
                    className="inline-flex items-center justify-center min-h-[48px] sm:min-w-[200px] border-2 border-white/70 text-white font-medium px-7 py-3.5 rounded-md hover:bg-white/10 transition"
                  >
                    Calculate ROI
                  </Link>
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll
                animation="fadeInRight"
                className="relative min-h-[280px] sm:min-h-[360px] lg:min-h-[480px]"
              >
                <Image
                  src="/tayproasset/taypro-robotImage.png"
                  alt="Taypro Solar Panel Cleaning Robots — Model-A automatic, Model-B semi-automatic, Model-T tracker for utility-scale solar plants in India"
                  title="Solar Panel Cleaning Robots by Taypro"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain"
                />
              </AnimateOnScroll>
            </div>

            {/* Hero stat strip */}
            <div className="mt-8 sm:mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-[#f4f1e9] rounded-lg px-4 py-4 text-center"
                >
                  <div className="text-[#052638] font-semibold text-xl sm:text-2xl">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 text-xs sm:text-sm mt-1 leading-snug">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* INTRO / PILLAR COPY */}
        <section className="bg-white pt-2 pb-12 sm:pb-16">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Why robotic cleaning, why Taypro
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight mb-6">
                The category leader for{" "}
                <span className="whitespace-nowrap">Solar Panel Cleaning Robots</span>{" "}
                in India
              </h2>
              <div className="space-y-5 text-gray-600 text-base sm:text-lg leading-relaxed">
                <p>
                  Dust, agricultural residue and bird droppings can cut PV
                  generation by <strong>8–25%</strong> across Indian utility
                  plants. Manual washing is expensive, water-hungry, and never
                  consistent across rows or shifts. A purpose-built{" "}
                  <strong>Solar Panel Cleaning Robot</strong> recovers that lost
                  yield, cleans every panel the same way every night, and
                  removes water from your O&amp;M plan entirely.
                </p>
                <p>
                  Taypro is a <strong>Made-in-India manufacturer</strong> of
                  robotic cleaning systems. Our line spans the fully{" "}
                  <Link
                    href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system"
                    className="text-[#A8C117] hover:underline"
                  >
                    Automatic Solar Panel Cleaning Robot (Model-A)
                  </Link>
                  , the semi-automatic pick-and-place{" "}
                  <Link
                    href="/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system"
                    className="text-[#A8C117] hover:underline"
                  >
                    Model-B
                  </Link>{" "}
                  for scattered plants, and the tracker-ready{" "}
                  <Link
                    href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers"
                    className="text-[#A8C117] hover:underline"
                  >
                    Model-T
                  </Link>{" "}
                  for single-axis tracker layouts. Every robot is monitored
                  through the{" "}
                  <Link
                    href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app"
                    className="text-[#A8C117] hover:underline"
                  >
                    Taypro Console
                  </Link>{" "}
                  fleet portal and can be deployed as CAPEX or as a monthly{" "}
                  <Link
                    href="/solar-panel-cleaning-system/solar-panel-cleaning-service"
                    className="text-[#A8C117] hover:underline"
                  >
                    Taypro OPEX
                  </Link>{" "}
                  service.
                </p>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* PRODUCT GRID */}
        <section className="pt-4 pb-16 sm:pb-20 bg-white">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Our robot line-up
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                Choose your Solar Panel Cleaning Robot
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-5">
                Three robot platforms, one fleet portal, two commercial models —
                pick the one engineered for your plant.
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 justify-items-center">
              {robotProducts.map((robot, idx) => {
                const highlight = robotProductHighlights[robot.model];
                return (
                  <AnimateOnScroll
                    key={robot.model}
                    animation="scaleIn"
                    delay={idx * 100}
                    className="w-full flex justify-center"
                  >
                    <div className="flex flex-col w-80 max-w-full">
                      <RobotCard robot={robot} priority={idx === 0} />
                      {highlight && (
                        <div className="bg-white border border-gray-200 border-t-0 rounded-b-md px-5 pt-4 pb-5 -mt-1">
                          <div className="text-[#A8C117] text-xs font-semibold uppercase tracking-wide mb-2">
                            {highlight.eyebrow}
                          </div>
                          <ul className="space-y-1.5">
                            {highlight.bullets.map((b) => (
                              <li
                                key={b}
                                className="flex items-start gap-2 text-gray-700 text-sm leading-snug"
                              >
                                <Check className="w-4 h-4 text-[#A8C117] mt-0.5 shrink-0" />
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AnimateOnScroll>
                );
              })}
            </div>

            <div className="mt-16">
              <AnimateOnScroll animation="fadeInUp" className="text-center mb-8">
                <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                  Software &amp; services
                </div>
                <h2 className="text-[#052638] font-semibold text-2xl sm:text-3xl md:text-4xl leading-tight">
                  Buy as a product or consume as a service
                </h2>
              </AnimateOnScroll>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 justify-items-center">
                {robotSolutions.map((robot, idx) => {
                  const highlight = robotSolutionHighlights[robot.model];
                  return (
                    <AnimateOnScroll
                      key={robot.model}
                      animation="scaleIn"
                      delay={idx * 100}
                      className="w-full flex justify-center"
                    >
                      <div className="flex flex-col w-80 max-w-full">
                        <RobotCard robot={robot} />
                        {highlight && (
                          <div className="bg-white border border-gray-200 border-t-0 rounded-b-md px-5 pt-4 pb-5 -mt-1">
                            <div className="text-[#A8C117] text-xs font-semibold uppercase tracking-wide mb-2">
                              {highlight.eyebrow}
                            </div>
                            <ul className="space-y-1.5">
                              {highlight.bullets.map((b) => (
                                <li
                                  key={b}
                                  className="flex items-start gap-2 text-gray-700 text-sm leading-snug"
                                >
                                  <Check className="w-4 h-4 text-[#A8C117] mt-0.5 shrink-0" />
                                  <span>{b}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </AnimateOnScroll>
                  );
                })}
              </div>
            </div>
          </Container>
        </section>

        {/* DECISION GUIDE */}
        <section className="bg-[#f4f1e9] py-16 sm:py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Decision guide
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                Which Solar Panel Cleaning Robot fits your plant?
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-5">
                A quick guide to picking the right Taypro platform. Final
                recommendation is always confirmed with a plant soiling study
                and site walkthrough.
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {decisionGuide.map((item) => {
                const Icon = item.icon;
                return (
                  <AnimateOnScroll
                    key={item.title}
                    animation="fadeInUp"
                    className="bg-white p-6 rounded-lg shadow-sm flex flex-col h-full"
                  >
                    <div className="w-11 h-11 flex items-center justify-center bg-[#A8C117]/15 rounded-md mb-4">
                      <Icon className="w-6 h-6 text-[#A8C117]" />
                    </div>
                    <h3 className="text-[#052638] font-semibold text-lg mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed flex-1">
                      {item.body}
                    </p>
                    <Link
                      href={item.cta.href}
                      className="mt-4 inline-flex items-center gap-1 text-[#A8C117] font-medium text-sm hover:underline"
                    >
                      {item.cta.label}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </Container>
        </section>

        {/* COMPARISON TABLE */}
        <section className="bg-white py-16 sm:py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Side-by-side
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                Model-A vs Model-B vs Model-T
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-5">
                Quick comparison of Taypro&rsquo;s three Solar Panel Cleaning
                Robot platforms across plant fit, cleaning method, autonomy and
                commercial model.
              </p>
            </AnimateOnScroll>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left min-w-[760px]">
                <thead className="bg-[#052638] text-white">
                  <tr>
                    <th className="py-4 px-5 text-sm sm:text-base font-semibold w-1/4">
                      Criteria
                    </th>
                    <th className="py-4 px-5 text-sm sm:text-base font-semibold">
                      Model-A
                    </th>
                    <th className="py-4 px-5 text-sm sm:text-base font-semibold">
                      Model-B
                    </th>
                    <th className="py-4 px-5 text-sm sm:text-base font-semibold">
                      Model-T
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, idx) => (
                    <tr
                      key={row.criterion}
                      className={idx % 2 === 0 ? "bg-white" : "bg-[#f4f1e9]/60"}
                    >
                      <td className="py-3 px-5 text-sm sm:text-base font-medium text-[#052638] align-top">
                        {row.criterion}
                      </td>
                      <td className="py-3 px-5 text-sm sm:text-base text-gray-700 align-top">
                        {row.modelA}
                      </td>
                      <td className="py-3 px-5 text-sm sm:text-base text-gray-700 align-top">
                        {row.modelB}
                      </td>
                      <td className="py-3 px-5 text-sm sm:text-base text-gray-700 align-top">
                        {row.modelT}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <AnimateOnScroll animation="fadeInUp" className="text-center mt-10">
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto">
                Not sure which platform fits? Share your plant details and our
                team will recommend the right Solar Panel Cleaning Robot mix
                after a quick soiling study.{" "}
                <Link href="/contact" className="text-[#A8C117] hover:underline">
                  Talk to Taypro
                </Link>
                .
              </p>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* INDIAN CONDITIONS */}
        <section className="w-full bg-[#052638] py-16 sm:py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Engineered for Indian solar
              </div>
              <h2 className="text-white font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                Built for Indian utility-scale conditions
              </h2>
              <p className="text-white/80 text-base sm:text-lg max-w-3xl mx-auto mt-5">
                Rajasthan dust storms, Gujarat heat, Karnataka humidity, Tamil
                Nadu monsoons — Taypro&rsquo;s Solar Panel Cleaning Robots are
                designed, tested and serviced for the realities of large-scale
                Indian solar O&amp;M.
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {indianConditions.map((card) => {
                const Icon = card.icon;
                return (
                  <AnimateOnScroll
                    key={card.title}
                    animation="fadeInUp"
                    className="bg-white/5 border border-white/10 p-6 sm:p-7 rounded-lg"
                  >
                    <Icon className="w-8 h-8 text-[#A8C117] mb-3" />
                    <h3 className="text-white font-semibold text-xl mb-2">
                      {card.title}
                    </h3>
                    <p className="text-white/80 text-base leading-relaxed">
                      {card.body}
                    </p>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </Container>
        </section>

        {/* WHY TAYPRO */}
        <section className="bg-white py-16 sm:py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Why Taypro
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                A trusted Solar Panel Cleaning Robot manufacturer
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-5">
                Designed, manufactured and serviced by TAYPRO Private Limited —
                with patented technology, certified hardware, and pan-India
                deployments behind us.
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyTaypro.map((item) => {
                const Icon = item.icon;
                return (
                  <AnimateOnScroll
                    key={item.title}
                    animation="fadeInUp"
                    className="bg-[#f4f1e9] p-6 rounded-lg flex flex-col h-full"
                  >
                    <Icon className="w-9 h-9 text-[#A8C117] mb-3" />
                    <h3 className="text-[#052638] font-semibold text-lg mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      {item.body}
                    </p>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </Container>
        </section>

        {/* PROOF / DEPLOYMENTS */}
        <section className="bg-[#f4f1e9] py-16 sm:py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Deployed at utility scale
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                Solar Panel Cleaning Robots already at work across India
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-5">
                Taypro robots clean panels at multi-megawatt plants across
                Maharashtra, Madhya Pradesh, Karnataka and beyond. A small
                sample of recent installations is below.
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {additionalProjects.map((project, idx) => (
                <AnimateOnScroll
                  key={project.id}
                  animation="fadeInUp"
                  delay={idx * 80}
                  className="bg-white rounded-lg overflow-hidden shadow-sm flex flex-col h-full"
                >
                  <Link
                    href={project.href}
                    title={`${project.title} — Solar Panel Cleaning Robot deployment`}
                    className="relative aspect-[4/3] w-full overflow-hidden block"
                  >
                    <Image
                      src={project.img}
                      alt={`${project.title} — Solar Panel Cleaning Robot deployment by Taypro`}
                      title={project.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-[#052638] font-semibold text-base sm:text-lg leading-snug mb-2">
                      <Link
                        href={project.href}
                        className="hover:text-[#A8C117] transition-colors"
                      >
                        {project.title}
                      </Link>
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.details.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center text-xs font-medium bg-[#A8C117]/15 text-[#052638] px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={project.href}
                      className="mt-auto inline-flex items-center gap-1 text-[#A8C117] font-medium text-sm hover:underline"
                    >
                      View case study
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>

            <AnimateOnScroll animation="fadeInUp" className="text-center mt-10">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center bg-[#052638] text-white font-medium px-7 py-3.5 rounded-md hover:bg-[#0c3d56] transition"
              >
                See all solar projects
              </Link>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* ROI CALCULATOR */}
        <section className="py-12 lg:py-16 bg-white">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold leading-tight mb-4 text-[#052638]">
                Calculate how much a Solar Panel Cleaning Robot can save your plant
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
                Plug in your plant size and tariff for an instant payback
                estimate. Real proposals are tuned after a plant soiling study.
              </p>
            </AnimateOnScroll>
          </Container>
          <ROITayproCalculator />
        </section>

        <CallbackCard headerText={""} />

        <ClientsCard />

        {/* FEATURES */}
        <section className="py-16 sm:py-24">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="space-y-6 sm:space-y-8">
                <AnimateOnScroll animation="fadeInUp">
                  <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-2">
                    Inside every Taypro robot
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-semibold text-white">
                    Features of Taypro&rsquo;s Solar Panel Cleaning Robots
                  </h2>
                </AnimateOnScroll>
                {robotFeatures.map((feature, idx) => (
                  <AnimateOnScroll
                    key={feature.title}
                    animation="fadeInLeft"
                    delay={idx * 80}
                    className="flex items-start space-x-3 sm:space-x-4"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <Check className="text-[#39D600]" strokeWidth={2} />
                    </div>
                    <div>
                      <div className="text-lg sm:text-xl font-semibold text-white">
                        {feature.title}
                      </div>
                      <span className="leading-relaxed text-white/90 text-sm sm:text-base">
                        {feature.description}
                      </span>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
              <AnimateOnScroll animation="fadeInRight" delay={100}>
                <Image
                  src="/tayproasset/taypro-robotFeature.jpg"
                  alt="Taypro Solar Panel Cleaning Robot features — autonomous waterless dual-pass cleaning with AI/ML scheduling for Indian solar farms"
                  title="Solar Panel Cleaning Robot Features by Taypro"
                  width={400}
                  height={600}
                  className="w-full h-auto rounded-lg"
                />
              </AnimateOnScroll>
            </div>
          </Container>
        </section>

        {/* ADVANTAGES */}
        <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="text-center mb-10 sm:mb-16"
            >
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Why operators love it
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#052638] mb-3 sm:mb-4">
                Advantages of using Solar Panel Cleaning Robots
              </h2>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <AnimateOnScroll animation="fadeInLeft" delay={100}>
                <Image
                  src="/tayprosolarpanel/taypro-solar-panel.jpg"
                  alt="Solar Panel Cleaning Robot operating at a utility-scale solar farm in India — boosting efficiency up to 30%"
                  title="Solar Panel Cleaning Robot by Taypro at a utility-scale plant"
                  width={400}
                  height={400}
                  className="w-full h-auto rounded-lg"
                />
              </AnimateOnScroll>

              <div className="space-y-5 sm:space-y-8">
                {robotsAdvantages.map((feature, idx) => (
                  <AnimateOnScroll
                    key={feature.title}
                    animation="fadeInRight"
                    delay={idx * 80}
                    className="flex items-start space-x-3 sm:space-x-4"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <Check className="text-[#39D600]" strokeWidth={2} />
                    </div>
                    <div>
                      <div className="text-lg sm:text-xl font-semibold text-[#052638]">
                        {feature.title}
                      </div>
                      <span className="leading-relaxed text-gray-600 text-sm sm:text-base">
                        {feature.description}
                      </span>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
            </div>
          </Container>

          <div className="hidden sm:block absolute top-0 left-0 w-64 h-64 bg-[#39D600]/5 rounded-full blur-3xl -translate-x-32 -translate-y-32 pointer-events-none"></div>
          <div className="hidden sm:block absolute bottom-0 right-0 w-96 h-96 bg-[#052638]/5 rounded-full blur-3xl translate-x-32 translate-y-32 pointer-events-none"></div>
        </section>

        {/* CONSOLE BAND */}
        <section className="w-full bg-[#052638] py-14 sm:py-16">
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-8 lg:gap-12 items-center"
            >
              <div className="text-center lg:text-left">
                <div className="flex items-center gap-2 justify-center lg:justify-start text-[#A8C117] text-sm font-medium mb-3">
                  <LayoutDashboard className="w-4 h-4" />
                  Taypro Console — fleet portal
                </div>
                <h2 className="text-white font-semibold text-2xl sm:text-3xl md:text-4xl leading-tight mb-3">
                  One portal to monitor every Solar Panel Cleaning Robot in your plant
                </h2>
                <p className="text-white/80 text-base sm:text-lg max-w-2xl">
                  Site dashboards, weather context, block-wise schedules,
                  cleaning logs, exports, gateway and robot health, and support
                  tickets — all role-based and ready for utility-scale O&amp;M
                  governance.
                </p>
              </div>
              <Link
                href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app"
                className="inline-flex items-center justify-center min-h-[48px] sm:min-w-[200px] bg-[#A8C117] text-[#052638] font-medium px-7 py-3.5 rounded-md hover:bg-[#b3cf3d] transition shrink-0"
              >
                Explore Taypro Console
              </Link>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* THINGS TO KEEP IN MIND */}
        <section className="w-full bg-white py-16 sm:py-20">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Field-tested practices
              </div>
              <h2 className="text-[#052638] font-semibold text-2xl sm:text-4xl md:text-5xl leading-tight mb-6">
                Things to keep in mind while cleaning solar panels with robots
              </h2>
              <p className="text-gray-600 text-base sm:text-lg mb-8">
                Whether you operate a 50 MW or a 250 MW plant, a few simple
                practices keep robotic cleaning consistent, safe and
                audit-ready.
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {toDoFeatures.map((feature, idx) => (
                <AnimateOnScroll
                  key={feature.title}
                  animation="fadeInUp"
                  delay={idx * 60}
                  className="flex items-start space-x-3 bg-[#f4f1e9] p-4 sm:p-5 rounded-lg"
                >
                  <Sparkles className="w-5 h-5 text-[#A8C117] mt-0.5 shrink-0" />
                  <p className="text-[#052638] text-sm sm:text-base leading-relaxed">
                    {feature.title}
                  </p>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        {/* FAQS */}
        <section className="w-full py-16 sm:py-20 bg-white">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl mb-4">
                Solar Panel Cleaning Robot — FAQs
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
                Quick answers to the questions plant owners and EPC teams ask
                most often. For plant-specific recommendations,{" "}
                <Link href="/contact" className="text-[#A8C117] hover:underline">
                  contact Taypro
                </Link>
                .
              </p>
            </AnimateOnScroll>

            {hubFaqs.map((faq, idx) => (
              <div key={faq.question} className="border-b border-gray-200 py-5">
                <button
                  type="button"
                  onClick={() =>
                    setOpenFaqIndex(openFaqIndex === idx ? null : idx)
                  }
                  className="w-full flex justify-between items-start text-left gap-4"
                  aria-expanded={openFaqIndex === idx}
                >
                  <h3 className="text-[#052638] font-medium text-lg sm:text-xl">
                    {faq.question}
                  </h3>
                  <span className="text-[#A8C117] text-2xl leading-none shrink-0">
                    {openFaqIndex === idx ? "−" : "+"}
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                    openFaqIndex === idx ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-gray-600 text-base sm:text-lg leading-relaxed pt-4">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </Container>
        </section>

        {/* FINAL CTA */}
        <section className="w-full py-16 sm:py-20 bg-[#052638] border-t border-[#0c3c57]">
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-8 lg:gap-12 lg:items-center"
            >
              <div className="text-center lg:text-left">
                <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                  Ready to deploy?
                </div>
                <h2 className="text-white font-semibold text-2xl sm:text-3xl md:text-4xl mb-3 leading-tight">
                  Bring robotic solar panel cleaning to your plant
                </h2>
                <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0">
                  Share your plant details — Taypro will recommend the right
                  Solar Panel Cleaning Robot mix and commercial model after a
                  short soiling study.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 shrink-0 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center min-h-[48px] sm:min-w-[200px] bg-[#A8C117] text-[#052638] font-medium px-7 py-3.5 rounded-md hover:bg-[#b3cf3d] transition"
                >
                  Request a quote
                </Link>
                <Link
                  href="/solar-panel-cleaning-robot-price-calculator"
                  className="inline-flex items-center justify-center min-h-[48px] sm:min-w-[200px] border-2 border-white text-white font-medium px-7 py-3.5 rounded-md hover:bg-white/10 transition"
                >
                  Calculate ROI
                </Link>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        <RequestEstimateForm />
      </div>
    </>
  );
}
