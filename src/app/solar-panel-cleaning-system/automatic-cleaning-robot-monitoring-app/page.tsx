"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  BarChart3,
  CloudSun,
  FileDown,
  Gauge,
  Headphones,
  LayoutDashboard,
  MapPin,
  Radio,
  Shield,
  Sliders,
  Ticket,
  Timer,
  Users,
} from "lucide-react";
import { modelBCards, tayproRobotConnectivitySummary } from "@/app/data";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import ProjectsCard from "@/app/components/ProjectsCard";
import ModelCards from "@/app/components/ModelCards";
import ClientsCard from "@/app/components/ClientsCard";
import EnergyResourceCard from "@/app/components/EnergyResourceCard";
import HeroSection from "@/app/components/Herosection";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import {
  SoftwareApplicationSchema,
  FAQPageSchema,
} from "@/app/components/StructuredData";
import { Container } from "@/app/components/Container";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";
const consoleProductPageUrl = `${siteUrl}/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app`;

const consoleFaqs = [
  {
    question: "What is Taypro Console?",
    answer:
      "Taypro Console is the secure web portal Taypro customers use to monitor and manage their Solar Panel Cleaning Robot fleets across one or many solar sites. It brings together live operational data, schedules, historical cleaning records, performance analytics, and support workflows — so plant and O&M teams can run robotic cleaning with the same rigour they expect from any critical plant system.",
  },
  {
    question: "How do we get access to Taypro Console?",
    answer:
      "Taypro provisions each client organisation with private access to the production portal. Your account team shares the login link, credentials, and onboarding pack outside this public site. For new deployments, start from our contact form; existing customers can request additional seats, sites, or password help via service@taypro.in.",
  },
  {
    question: "Which Taypro robots work with Taypro Console?",
    answer:
      "Taypro Console is the common fleet layer for Taypro autonomous and semi-automatic cleaning robots, including Model-A (fixed / seasonal tilt), Model-B (pick-and-place), and Model-T (single-axis trackers). The exact screens and commands available depend on your site layout, connectivity, and service package.",
  },
  {
    question: "Can we schedule cleaning from the portal?",
    answer:
      "Yes. Client teams can define and review block-wise automation schedules (timers) aligned with your plant’s operating rules and weather strategy. Execution still respects on-robot safety interlocks — the portal plans and requests; the fleet executes within engineered limits.",
  },
  {
    question: "What kind of reporting does Taypro Console provide?",
    answer:
      "Taypro Console surfaces site-level and block-wise cleaning coverage, robot battery and execution status, downloadable cleaning reports for audit and internal review, and statistics views for trends over time. Export formats and retention policies are aligned with your enterprise needs during onboarding.",
  },
  {
    question: "How does Taypro Console connect to robots in the field?",
    answer:
      `Depending on each plant’s network design, fleet telemetry and commands travel over secure links such as ${tayproRobotConnectivitySummary}. Taypro engineers size the gateway and backhaul architecture during deployment so Console stays responsive even on large, multi-block sites.`,
  },
  {
    question: "How do we get help if something looks wrong in the data?",
    answer:
      "Taypro Console includes structured ticketing so your site administrators can raise issues, attach evidence, and track resolution with Taypro’s service team. For urgent operational events, your contract may also include direct escalation channels outside the portal.",
  },
  {
    question: "Is Taypro Console a replacement for our plant SCADA?",
    answer:
      "No. Taypro Console is specialised for robotic solar cleaning — schedules, cleaning logs, robot health, and fleet analytics. It complements your existing energy SCADA and work-management tools; Taypro can advise on read-only integrations or export workflows where required.",
  },
];

const capabilityCards = [
  {
    icon: LayoutDashboard,
    title: "Site dashboards",
    body: "At-a-glance view of weather context, block-wise cleaning coverage, gateway connectivity, and robot battery readiness so operators can plan shifts with confidence.",
  },
  {
    icon: Sliders,
    title: "Robot configuration & device layout",
    body: "Structured visibility into deployed robots, block allocation, and permitted operating parameters — tuned by Taypro during commissioning, then monitored by your team.",
  },
  {
    icon: Timer,
    title: "Automation schedules",
    body: "Centralised view of block-wise timers and cleaning windows so night-time or post-production cycles stay aligned with plant rules and seasonal soiling patterns.",
  },
  {
    icon: FileDown,
    title: "Cleaning logs & exports",
    body: "Historical cleaning activity, downloadable reports for selected dates, and tabbed views for completed runs, in-progress work, errors, and offline assets — built for audit-ready O&M.",
  },
  {
    icon: BarChart3,
    title: "Statistics & trends",
    body: "Charts for area cleaned, blocks serviced, execution mix, and efficiency indicators — filterable by site, time range, and (where licensed) robot or block.",
  },
  {
    icon: Gauge,
    title: "Controlled robot commands",
    body: "A curated, permissioned command set for day-to-day operations — always confirmed, always logged. Deep engineering actions remain with Taypro service engineers.",
  },
  {
    icon: MapPin,
    title: "Fleet tracking context",
    body: "Live and last-known robot positioning on site layouts where available — ideal for coordination with security, O&M convoys, and incident response.",
  },
  {
    icon: Radio,
    title: "Gateway & field telemetry health",
    body: "Visibility into gateway and field-device status so you can distinguish a true robot fault from a communications brownout before dispatching crews.",
  },
  {
    icon: Ticket,
    title: "Tickets & service history",
    body: "Raise, comment on, and close Taypro service tickets with a full timeline — fewer ad-hoc email threads, more traceability for your internal governance.",
  },
  {
    icon: Users,
    title: "Users, roles & collaboration",
    body: "Invite the right mix of plant, central engineering, and finance stakeholders with scoped access. Optional chat channels keep operational conversations next to the data.",
  },
];

const breadcrumbs = [
  { name: "Home", href: "/" },
  {
    name: "Solar Panel Cleaning Robots",
    href: "/solar-panel-cleaning-system",
  },
  {
    name: "Cleaning Robot Monitoring App",
    href: "",
  },
];

export default function TayproConsolePage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <SoftwareApplicationSchema
        name="Taypro Console"
        description="Secure web application for monitoring and managing Taypro Solar Panel Cleaning Robot fleets: dashboards, weather context, schedules, cleaning logs and exports, statistics, gateway health, controlled robot commands, fleet tracking, support tickets, and role-based user management."
        image={`${siteUrl}/tayproasset/taypro-dashboard.png`}
        url={consoleProductPageUrl}
        applicationCategory="WebApplication"
        operatingSystem="Web browser"
      />
      <FAQPageSchema faqs={consoleFaqs} />

      <div className="min-h-screen overflow-x-hidden">
        <HeroSection
          title="Taypro Console — Solar Panel Cleaning Robot Fleet Portal"
          subtitle="The secure web command centre for your Taypro robot fleet — live dashboards, weather-aware context, schedules, cleaning logs, exportable reports, analytics, and support workflows. Login details and the customer portal link are shared privately by Taypro after contract onboarding."
          imgSrc="/tayproasset/taypro-dashboard.png"
          imgAlt="Taypro Console — Solar Panel Cleaning Robot monitoring and fleet control dashboard"
          ctaHref="/contact"
          ctaText="Request access"
        />

        <section className="bg-white pt-12 sm:pt-20 pb-8">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Fleet software for robotic solar cleaning
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl mb-6 leading-tight">
                What is Taypro Console?
              </h2>
              <div className="space-y-5 text-gray-600 text-base sm:text-lg leading-relaxed">
                <p>
                  Taypro Console is the{" "}
                  <strong>client operations portal</strong> behind every major
                  Taypro deployment. It translates raw robot telemetry into
                  decisions plant teams actually use: when to clean, which blocks
                  finished first, which assets need a closer look, and how last
                  night&apos;s run compared to the monthly cleaning plan.
                </p>
                <p>
                  The product is designed for{" "}
                  <strong>utility-scale transparency</strong> — multi-site
                  portfolios, multi-block plants, and mixed fleets of{" "}
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
                  , and{" "}
                  <Link
                    href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers"
                    className="text-[#A8C117] hover:underline"
                  >
                    Model-T
                  </Link>{" "}
                  robots. Detailed click-paths, security policies, and
                  configuration limits are covered in your{" "}
                  <strong>customer user guide</strong> — this page stays at the
                  product-story level so your competitive edge stays protected.
                </p>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* Capabilities grid */}
        <section className="w-full py-16 sm:py-20 bg-[#f4f1e9]">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Inside the portal
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight max-w-4xl mx-auto">
                What your teams can do in Taypro Console
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                High-level capability areas — your Taypro onboarding pack and
                user guide explain each screen in the depth your operators need.
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {capabilityCards.map((card) => {
                const Icon = card.icon;
                return (
                  <AnimateOnScroll
                    key={card.title}
                    animation="fadeInUp"
                    className="bg-white p-6 sm:p-7 rounded-lg shadow-sm flex flex-col items-start h-full"
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-[#A8C117]/15 rounded-md mb-4">
                      <Icon className="text-[#A8C117] w-6 h-6" />
                    </div>
                    <h3 className="text-[#052638] font-semibold text-lg mb-2">
                      {card.title}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      {card.body}
                    </p>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </Container>
        </section>

        {/* Security strip */}
        <section className="w-full py-16 sm:py-20 bg-white">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Enterprise-grade governance
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                Security, roles &amp; auditability — without publishing our playbook
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                Taypro Console is built for critical infrastructure customers:
                authenticated access, role-based permissions, encrypted transport,
                session safeguards, and tamper-evident activity history for
                privileged actions. Exact control matrices evolve with each
                software release — your security questionnaire receives precise
                answers under NDA from Taypro IT.
              </p>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Shield,
                  title: "Least-privilege access",
                  body: "Client admins invite only the stakeholders who need a given site or block — permissions can be tightened or revoked instantly.",
                },
                {
                  icon: CloudSun,
                  title: "Weather-smart operations",
                  body: "Dashboards surface the same environmental context your robots use so human and machine decisions stay aligned.",
                },
                {
                  icon: Headphones,
                  title: "Service-linked workflows",
                  body: "Tickets, chat, and logs live next to telemetry so Taypro support sees what your operators see — faster root cause, fewer loops.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <AnimateOnScroll
                    key={item.title}
                    animation="fadeInUp"
                    className="bg-[#f4f1e9] p-6 rounded-lg"
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

        {/* Visual + precision (preserved layout, copy tightened) */}
        <section
          className="w-full py-20 bg-white"
          style={{
            background: "url('/tayprobglayout/taypro-semi.png') repeat",
            backgroundSize: "auto",
          }}
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl lg:text-5xl leading-tight max-w-4xl mx-auto">
                From fleet overview to per-robot clarity
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mt-4">
                Search across sites, jump into a single robot context, compare
                blocks, and export evidence — without losing the thread of what
                happened on the plant overnight.
              </p>
            </AnimateOnScroll>

            <div className="block lg:hidden">
              <AnimateOnScroll animation="fadeInUp" delay={100}>
                <div className="relative w-full aspect-[16/10] overflow-hidden rounded-lg">
                  <Image
                    src="/tayproasset/taypro-console.png"
                    alt="Taypro Console dashboard — fleet and block-level solar cleaning robot monitoring"
                    title="Taypro Console"
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                </div>
                <div className="bg-[#7da300] p-6 mt-4 rounded-lg">
                  <h3 className="text-white text-start text-xl sm:text-2xl mb-4">
                    Precision without complexity
                  </h3>
                  <p className="text-white text-start text-sm sm:text-base leading-relaxed">
                    Console reflects how Taypro robots actually work in the field:
                    block-wise plans, seasonal cleaning strategy, and tracker-aware
                    context where Model-T is deployed. Your operators see the
                    signal; Taypro protects the underlying control logic.
                  </p>
                </div>
              </AnimateOnScroll>
            </div>

            <div className="hidden lg:block relative w-full aspect-[16/9] overflow-hidden rounded-lg">
              <Image
                src="/tayproasset/taypro-console.png"
                alt="Taypro Console dashboard — fleet and block-level solar cleaning robot monitoring"
                title="Taypro Console"
                fill
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 1200px"
              />
              <div className="absolute right-6 xl:right-10 top-1/2 -translate-y-1/2 bg-[#7da300] p-6 sm:p-8 max-w-[min(100%,360px)] rounded-lg shadow-lg">
                <h3 className="text-white text-2xl mb-4 text-center sm:text-left">
                  Precision without complexity
                </h3>
                <p className="text-white text-sm sm:text-base leading-relaxed text-center sm:text-left">
                  Console reflects how Taypro robots actually work in the field:
                  block-wise plans, seasonal cleaning strategy, and tracker-aware
                  context where Model-T is deployed. Your operators see the
                  signal; Taypro protects the underlying control logic.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* CTA */}
        <section className="w-full py-16 sm:py-20 bg-[#052638] border-t border-[#0c3c57]">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="w-full">
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-10 lg:gap-14 lg:items-start">
                <div className="min-w-0 text-center lg:text-left">
                  <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                    Console access
                  </div>
                  <h2 className="text-white font-semibold text-2xl sm:text-3xl md:text-4xl mb-4 leading-tight">
                    Ready to bring your fleet onto Taypro Console?
                  </h2>
                  <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    New deployments receive structured onboarding, training, and
                    the full customer user guide. Existing customers can request
                    additional seats or sites through their Taypro account
                    manager or{" "}
                    <a
                      href="mailto:service@taypro.in"
                      className="text-[#A8C117] hover:underline font-medium"
                    >
                      service@taypro.in
                    </a>
                    .
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4 w-full sm:justify-center lg:justify-start lg:w-auto lg:shrink-0 lg:pt-1">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center min-h-[48px] w-full sm:w-auto sm:min-w-[220px] bg-[#A8C117] text-[#052638] font-medium px-8 py-3.5 rounded-md hover:bg-[#b3cf3d] transition text-center"
                  >
                    Request Console access
                  </Link>
                  <a
                    href="mailto:service@taypro.in?subject=Taypro%20Console%20access%20%2F%20support"
                    className="inline-flex items-center justify-center min-h-[48px] w-full sm:w-auto sm:min-w-[220px] border-2 border-white text-white font-medium px-8 py-3.5 rounded-md hover:bg-white/10 transition text-center"
                  >
                    Email service@taypro.in
                  </a>
                </div>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* FAQs */}
        <section className="w-full py-16 sm:py-20 bg-white">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl mb-4">
                Frequently asked questions
              </h2>
              <p className="text-gray-600 text-base sm:text-lg">
                Product-level answers — detailed procedures live in your Taypro
                customer documentation.
              </p>
            </AnimateOnScroll>
            {consoleFaqs.map((faq, idx) => (
              <div
                key={faq.question}
                className="border-b border-gray-200 py-5"
              >
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

        <EnergyResourceCard />

        <ProjectsCard showHeader={true} headerText="Our Most Recent Projects" />

        <ClientsCard />

        <ModelCards title="Looking for more solutions?" cards={modelBCards} />

        <RequestEstimateForm />
      </div>
    </>
  );
}
