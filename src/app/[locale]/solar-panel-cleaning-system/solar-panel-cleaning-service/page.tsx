import {
  modelBCards,
  tayproRobotConnectivitySummary,
} from "@/app/data";
import {
  ClipboardList,
  Cpu,
  FileBarChart,
  Gauge,
  Handshake,
  Leaf,
  LineChart,
  MapPinned,
  Receipt,
  Route,
  ShieldCheck,
  Timer,
  TrendingUp,
  Users,
  UserCheck,
  Wallet,
  Warehouse,
} from "lucide-react";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import ModelCards from "@/app/components/ModelCards";
import ClientsCard from "@/app/components/ClientsCard";
import HeroSection from "@/app/components/Herosection";
import FeaturesSection from "@/app/components/FeaturesSection";
import CallbackCard from "@/app/components/CallbackCard";
import ResourcesCard from "@/app/components/ResourcesCard";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import ROICalculatorEmbed from "@/app/components/ROICalculatorEmbed";
import ProjectsCardServer from "@/app/components/ProjectsCardServer";
import FAQAccordion from "@/app/components/FAQAccordion";
import OpenLeadModalButton from "@/app/components/OpenLeadModalButton";
import {
  ServiceSchema,
  FAQPageSchema,
  HowToSchema,
} from "@/app/components/StructuredData";
import { Container } from "@/app/components/Container";
import Link from "next/link";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

const breadcrumbs = [
  { name: "Home", href: "/" },
  {
    name: "Solar Panel Cleaning Robots",
    href: "/solar-panel-cleaning-system",
  },
  {
    name: "Taypro OPEX — Solar Panel Cleaning Service",
    href: "",
  },
];

const opexServiceFaqs = [
  {
    question: "What is Taypro OPEX?",
    answer:
      "Taypro OPEX is a fully managed, robotic solar panel cleaning service from TAYPRO Private Limited. We place the right Taypro cleaning robot (Model-A automatic, Model-B semi-automatic pick-and-place, or Model-T for single-axis trackers) at your plant, operate it with dedicated trained manpower, and maintain peak plant performance — without you purchasing the robot fleet. You pay a predictable monthly fee based on the number of solar panels actually cleaned each billing period.",
  },
  {
    question: "How does billing work on Taypro OPEX?",
    answer:
      "Commercial terms are structured around verified panel-cleaning volume: you are charged for the number of panels cleaned in each monthly settlement cycle, aligned with Taypro Console telemetry and agreed reconciliation rules. This keeps your OPEX aligned directly to delivered cleaning outcomes rather than idle asset time.",
  },
  {
    question: "How do you decide how many cleaning cycles my plant needs each month?",
    answer:
      "Before mobilisation, Taypro engineers conduct a structured plant study covering soiling rate, local dust sources, seasonal wind and rain patterns, soil and geology type, module height and row geometry, tracker vs fixed-tilt behaviour, nearby construction or agricultural activity, and historical performance ratio trends. From that study we recommend a custom programme — typically between 3 and 10 waterless dry cleaning cycles per month — designed to maximise energy yield while avoiding unnecessary wear or operational conflict with generation.",
  },
  {
    question: "What deliverables do I receive beyond the cleaning itself?",
    answer:
      "Every Taypro OPEX engagement includes a written cleaning plan and standard operating procedure: when robots move, which arrays and paths they follow, where they pause in idle conditions, and where dedicated robot parking and charging / rest zones are located on site. You also receive detailed cleaning reports — available for each run and summarised monthly — through the Taypro Console, including cycle completion, route coverage, exceptions, and fleet health data where connectivity is provided via LTE, Wi-Fi, hybrid self-healing RF mesh, LoRa, or LoRaWAN.",
  },
  {
    question: "Which robot models can Taypro deploy under OPEX?",
    answer:
      "We match the robot platform to your plant architecture and economics. Fixed-tilt and large utility blocks typically use the Automatic Solar Panel Cleaning Robot (Model-A). Scattered blocks or pick-and-place workflows may use Model-B. Single-axis tracker sites use Model-T. The same Taypro Console stack is used across models for scheduling, reporting, and service coordination.",
  },
  {
    question: "Is Taypro OPEX only for very large plants?",
    answer:
      "Taypro OPEX is engineered primarily for utility-scale solar power plants — especially those from about 50 MW and upward — where robotic cleaning at scale and predictable monthly economics matter most. Smaller or distributed portfolios may still qualify; our team assesses feasibility, cycle count, and manpower footprint during the proposal stage.",
  },
  {
    question: "How is Taypro OPEX different from buying robots (capex)?",
    answer:
      "With capex you own the robots, spares inventory, and depreciation. With Taypro OPEX, TAYPRO Private Limited retains ownership and lifecycle risk for the deployed fleet while you consume cleaning as a service: agreed cycles, agreed reporting, and billing tied to panels cleaned. Many IPPs choose OPEX to move quickly, preserve balance sheet, and lock in operational outcomes with a single accountable vendor.",
  },
  {
    question: "What happens if a robot has a fault during the contract?",
    answer:
      "Taypro maintains a nationwide technical bench. Robots raise tickets automatically where configured, and our helpdesk provides remote diagnostics. Where a physical intervention is required, we target rapid on-site response consistent with your service-level agreement — including same-day breakdown resolution commitments on supported contracts.",
  },
];

const opexHowToSteps = [
  {
    name: "Plant study & soiling assessment",
    text: "Taypro engineers characterise your site: soiling patterns, environmental exposure, soil and dust type, module and row layout, tracker behaviour if applicable, nearby land use, and historical PR loss. This study drives the recommended monthly dry-cleaning cycle count (typically 3–10) and risk controls for each season.",
  },
  {
    name: "Robot selection & detailed cleaning plan",
    text: "We select Model-A, Model-B or Model-T (or a mixed fleet) and publish a detailed cleaning plan: when robots move, which paths they take across tables or blocks, idle behaviour, and dedicated parking / rest and charging locations so plant security and O&M always know where equipment is.",
  },
  {
    name: "Mobilisation & operator deployment",
    text: "Dedicated trained operators are stationed or rotated to your site to run the fleet safely alongside your existing O&M rhythm. They execute the approved SOP, coordinate with your control room, and escalate anomalies through Taypro Console.",
  },
  {
    name: "Execute scheduled waterless dry cleaning cycles",
    text: "Robots perform AI- and ML-informed dual-pass dry cleaning on the agreed calendar — timed to avoid meaningful generation loss and adapted using live weather intelligence where available.",
  },
  {
    name: "Reporting & monthly panel-cleaning reconciliation",
    text: "Each cycle produces structured telemetry and cleaning reports in Taypro Console (connectivity via LTE, Wi-Fi, hybrid self-healing RF mesh, LoRa, or LoRaWAN as designed for your site). At month-end, billable volume is reconciled against verified panels cleaned under the contract formula.",
  },
  {
    name: "Continuous optimisation",
    text: "As soiling drivers change — new construction nearby, harvest residue, monsoon onset, or tracker schedule shifts — Taypro revisits the study inputs and adjusts cycle density or routing within the agreed envelope so performance ratio stays protected year-round.",
  },
];

const plantStudyFactors = [
  {
    title: "Soiling rate & pattern",
    body: "On-site dust accumulation curves, directional soiling bias, and row-to-row variance inform how aggressively we must clean and which blocks lead the schedule.",
  },
  {
    title: "Environmental exposure",
    body: "Wind rose, humidity, dew point, rain probability, and seasonal haze or smoke events determine safe cleaning windows and when to skip or compress cycles.",
  },
  {
    title: "Soil & geology",
    body: "Local soil type, sand fraction, and soluble salts change how dust adheres to glass and anti-reflective coatings — tuning brush pressure, speed, and pass count.",
  },
  {
    title: "Plant layout & area",
    body: "Inter-row spacing, block count, module tilt or tracker brand, and distance to parking or staging areas drive path planning, bridge requirements, and idle/rest strategy.",
  },
  {
    title: "Nearby vicinity & land use",
    body: "Quarries, highways, agricultural burns, cement batching, or industrial stacks nearby are mapped so we can pre-empt soiling spikes instead of reacting after PR collapse.",
  },
  {
    title: "Performance & contractual context",
    body: "Historical SCADA PR, inverter clipping patterns, and PPA or dispatch obligations are folded in so cleaning intensity aligns with your revenue and compliance risk, not generic benchmarks.",
  },
];

export default function SolarPanelCleaningService() {
  const allFaqs = opexServiceFaqs;

  const benefits = [
    "Plant-specific soiling study & 3–10 dry cycles / month",
    "Billing based on panels cleaned each month",
    "Detailed SOP: timing, paths, idle & dedicated rest zones",
    "Daily cleaning reports & Taypro Console transparency",
    "Model-A, Model-B or Model-T matched to your site",
    "Dedicated operators + nationwide technical support",
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <ServiceSchema
        name="Taypro OPEX — Robotic Solar Panel Cleaning Service"
        description="Monthly robotic solar panel cleaning service for utility-scale plants: pay per panel cleaned, plant-specific soiling study, 3–10 recommended waterless dry cycles per month, detailed cleaning plans with paths and robot rest zones, daily reports via Taypro Console, deployment of Taypro Model-A, Model-B or Model-T robots with dedicated operators."
        image={`${siteUrl}/tayprosolarpanel/taypro-cleaning-service.png`}
        url={`${siteUrl}/solar-panel-cleaning-system/solar-panel-cleaning-service`}
        provider="TAYPRO Private Limited"
        serviceType="Solar panel cleaning service"
      />
      <FAQPageSchema faqs={allFaqs} />
      <HowToSchema
        name="How Taypro OPEX delivers robotic solar panel cleaning as a service"
        description="End-to-end methodology for Taypro OPEX: plant soiling study, robot selection, detailed cleaning plan with paths and rest zones, mobilisation, scheduled dry cycles, reporting, and monthly billing per panels cleaned."
        steps={opexHowToSteps}
        totalTime="P30D"
        image="/tayprosolarpanel/taypro-cleaning-service.png"
      />

      <div className="min-h-screen overflow-x-hidden">
        <HeroSection
          title="Taypro OPEX — Robotic Solar Panel Cleaning Service"
          subtitle={
            <>
              Pay only for the number of{" "}
              <strong>solar panels we clean each month</strong>. TAYPRO Private
              Limited deploys the right Taypro robot for your site —{" "}
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
              </Link>{" "}
              — engineers a plant-specific programme (typically{" "}
              <strong>3–10 waterless dry cleaning cycles per month</strong>),
              and hands you detailed plans, idle/rest zones, and daily cleaning
              reports through the{" "}
              <Link
                href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app"
                className="text-[#A8C117] hover:underline"
              >
                Taypro Console
              </Link>
              .
            </>
          }
          imgSrc="/tayprosolarpanel/taypro-cleaning-service.png"
          imgAlt="Taypro OPEX solar panel cleaning service — robotic waterless cleaning at utility-scale solar plant"
          ctaHref="/contact"
          ctaText="Request a quote"
        />

        {/* What is Taypro OPEX */}
        <section className="bg-white pt-12 sm:pt-20 pb-8">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Pay-per-outcome solar O&amp;M cleaning
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl mb-6 leading-tight">
                What is Taypro OPEX?
              </h2>
              <div className="space-y-5 text-gray-600 text-base sm:text-lg leading-relaxed">
                <p>
                  Taypro OPEX is how large solar plants consume{" "}
                  <strong>robotic solar panel cleaning as a service</strong>{" "}
                  instead of buying and maintaining their own fleet. Under a
                  Taypro OPEX contract, TAYPRO Private Limited supplies the
                  robots, spare parts philosophy, trained operators, remote
                  monitoring, and continuous optimisation — while you pay in
                  line with{" "}
                  <strong>verified panels cleaned each month</strong>, not
                  unused machine hours.
                </p>
                <p>
                  Every engagement begins with a disciplined{" "}
                  <strong>plant study</strong> that quantifies soiling drivers
                  and recommends an operating envelope — most utility sites land
                  on <strong>three to ten dry cleaning cycles per month</strong>{" "}
                  once meteorology, dust chemistry, and generation risk are
                  balanced. From that study we publish a{" "}
                  <strong>detailed cleaning plan</strong> that spells out when
                  robots move, which electrical blocks and tracker tables are
                  visited in sequence, where robots dwell in idle, and where the
                  <strong> dedicated parking / rest area</strong> sits relative
                  to roads, substations, and fire lanes.
                </p>
                <p>
                  During operations, your team receives{" "}
                  <strong>granular cleaning reports</strong> — per shift, per
                  day, or per cycle depending on your governance needs — via
                  Taypro Console, with fleet telemetry carried over{" "}
                  {tayproRobotConnectivitySummary} as designed for your site.
                </p>
                <p>
                  Further reading:{" "}
                  <Link
                    href="/blog/cost-benefit-analysis-of-solar-panel-cleaning-services-in-india"
                    className="text-[#A8C117] hover:underline"
                  >
                    cost–benefit of cleaning services in India
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/blog/why-solar-power-plants-need-robotic-cleaning-for-maximum-roi"
                    className="text-[#A8C117] hover:underline"
                  >
                    why plants adopt robotic cleaning for ROI
                  </Link>
                  .
                </p>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* Billing highlight */}
        <section className="bg-[#f4f1e9] py-16 sm:py-20">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp" className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-white shadow-sm mb-6">
                <Receipt className="w-8 h-8 text-[#A8C117]" />
              </div>
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Commercial model
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight mb-6">
                Billing tied to panels cleaned — not capex
              </h2>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto mb-8">
                Your monthly invoice is anchored to the count of modules
                actually cleaned in the period, cross-checked against Taypro
                Console logs and the mutually agreed measurement protocol. That
                keeps plant leadership, finance and O&amp;M aligned on one
                simple question: did we restore transmissivity to the contracted
                panel population this month?
              </p>
              <OpenLeadModalButton
                topic="Taypro OPEX"
                title="Talk to our OPEX team"
                subtitle="Tell us about your plant and our OPEX team will get back with a pay-per-panel cleaning proposal."
                className="inline-block bg-[#A8C117] text-[#052638] font-medium px-8 sm:px-12 py-4 sm:py-5 rounded-md hover:bg-[#b3cf3d] transition text-base sm:text-lg"
              >
                Talk to our OPEX team
              </OpenLeadModalButton>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* Plant study */}
        <section className="bg-white py-16 sm:py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Engineering-first programme design
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight max-w-4xl mx-auto">
                What goes into the Taypro OPEX plant study?
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                We do not guess cycle counts from a brochure. Each proposal is
                built from structured field and desk analytics so your cleaning
                calendar matches real soiling physics and commercial risk.
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plantStudyFactors.map((item) => (
                <AnimateOnScroll
                  key={item.title}
                  animation="fadeInUp"
                  className="bg-[#f4f1e9] p-6 rounded-lg border border-transparent hover:border-[#A8C117]/30 transition"
                >
                  <Cpu className="w-8 h-8 text-[#A8C117] mb-3" />
                  <h3 className="text-[#052638] font-semibold text-lg mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    {item.body}
                  </p>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        {/* Deliverables */}
        <section className="bg-[#052638] py-16 sm:py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                What you receive on day one
              </div>
              <h2 className="text-white font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                Cleaning plan, paths, rest zones &amp; reports
              </h2>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  icon: Route,
                  title: "Movement & path design",
                  body: "Time-of-day rules, block sequencing, tracker parking collaboration (where relevant), and row-by-row path sheets so every shift knows exactly where robots should be.",
                },
                {
                  icon: Warehouse,
                  title: "Idle, staging & dedicated rest",
                  body: "Documented idle behaviour on modules, staging points between blocks, and a dedicated robot parking / charging enclave that satisfies your HSE, security, and fire access rules.",
                },
                {
                  icon: FileBarChart,
                  title: "Cleaning reports",
                  body: "Cycle-level and daily summaries delivered through Taypro Console: distance travelled, blocks completed, anomalies, operator notes, and exportable files for your internal performance review boards.",
                },
                {
                  icon: ShieldCheck,
                  title: "Safety & module-care governance",
                  body: "Written risk assessments, edge-case playbooks, and alignment with your module warranty and O&M insurance requirements — backed by Taypro’s lab-tested cleaning physics.",
                },
              ].map((card) => {
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

        {/* Methodology */}
        <section className="bg-white py-16 sm:py-20">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Methodology
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl mb-6 leading-tight">
                Built for utility-scale performance
              </h2>
              <div className="space-y-5 text-gray-600 text-base sm:text-lg leading-relaxed border-l-4 border-[#A8C117] pl-6 sm:pl-8">
                <p>
                  At <strong>TAYPRO Private Limited</strong>, we treat solar
                  module transmissivity as a first-class production input —
                  especially for <strong>50 MW and larger</strong> plants where
                  even a single percentage point of performance ratio shows up
                  immediately in your revenue line.
                </p>
                <p>
                  <strong>Taypro OPEX</strong> is our dedicated monthly cleaning
                  service built around that reality: a recommended schedule of{" "}
                  <strong>custom three to ten waterless dry cleaning cycles</strong>{" "}
                  each calendar month, tuned from the plant study above, executed
                  by Taypro robots and operators, and{" "}
                  <strong>
                    strategically planned to maximise energy generation while
                    minimising downtime
                  </strong>{" "}
                  for your operations and finance teams.
                </p>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        <FeaturesSection
          headline={
            <>
              Why plants choose
              <br />
              Taypro OPEX
            </>
          }
          description={
            <>
              Taypro OPEX combines the same{" "}
              <strong>waterless, AI- and ML-driven</strong> robotics trusted on
              gigawatts of Indian solar with a service wrapper: you get outcomes
              and transparency — we carry fleet risk, manpower scheduling, and
              continuous programme tuning.
            </>
          }
          benefits={benefits}
        />

        <section className="w-full pt-10 pb-24 bg-white">
          <Container>
            <AnimateOnScroll animation="fadeInUp">
              <h2 className="font-semibold text-3xl sm:text-4xl md:text-5xl text-[#052638] mb-6">
                How Taypro operates the fleet on your site
            </h2>
              <p className="mb-12 text-start text-lg text-gray-600 max-w-3xl">
                These pillars sit underneath every OPEX contract — whether we
                are running Model-A, Model-B, Model-T, or a blended deployment.
              </p>
            </AnimateOnScroll>
            <div className="grid gap-10 md:grid-cols-2">
              {[
                {
                  icon: Users,
                  title: "Dedicated skilled manpower",
                  body: "Trained Taypro operators remain accountable for safe robot deployment, daily checklists, and coordination with your control room so modules never see experimental handling.",
                },
                {
                  icon: LineChart,
                  title: "Weather-aware scheduling",
                  body: "Wind, rain, humidity, and dust forecasts feed the live cleaning calendar so we clean when physics says it will help — not when a static calendar says we must.",
                },
                {
                  icon: ClipboardList,
                  title: "Same-day breakdown discipline",
                  body: "Automated ticketing, remote diagnostics, and a nationwide field bench mean faults get triaged immediately — with same-day resolution targets on qualifying service plans.",
                },
                {
                  icon: MapPinned,
                  title: "Dual-pass dry physics",
                  body: "Patented dual-pass waterless cleaning removes loose dust then tackles adhered film without water chemistry — preserving anti-reflective coatings and keeping discharge compliance simple.",
                },
              ].map((block) => {
                const Icon = block.icon;
                return (
                  <AnimateOnScroll
                    key={block.title}
                    animation="fadeInUp"
                    className="border border-gray-200 rounded-xl p-6 sm:p-8"
                  >
                    <Icon className="w-9 h-9 text-[#A8C117] mb-3" />
                    <h3 className="text-xl font-semibold text-[#052638] mb-3">
                      {block.title}
              </h3>
                    <p className="text-gray-600 text-base leading-relaxed">
                      {block.body}
                    </p>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </Container>
        </section>

        <CallbackCard
          headerText={<>Schedule a Taypro OPEX solar panel cleaning consultation</>}
        />

        {/* OPEX vs Capex */}
        <section className="w-full py-16 bg-[#f4f1e9]">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl">
                Taypro OPEX vs buying robots (capex)
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mt-4">
                Both routes use the same Taypro hardware DNA — the question is who
                carries asset risk and how you want to recognise cost.
              </p>
            </AnimateOnScroll>
            <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
              <table className="w-full text-left text-sm sm:text-base">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 sm:px-6 font-semibold text-[#052638]">
                      Topic
                    </th>
                    <th className="py-3 px-4 sm:px-6 font-semibold text-[#A8C117]">
                      Taypro OPEX
                    </th>
                    <th className="py-3 px-4 sm:px-6 font-semibold text-[#052638]">
                      Robot purchase (capex)
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[#052638]">
                  {[
                    {
                      t: "Capital outlay",
                      opex: "Low — robots stay on Taypro balance sheet",
                      capex: "High — full robot + spare parts capitalisation",
                    },
                    {
                      t: "Billing model",
                      opex: "Per panels cleaned per month (contracted formula)",
                      capex: "Sunk cost + O&M to operate your own fleet",
                    },
                    {
                      t: "Programme design",
                      opex: "Taypro-led plant study & 3–10 cycle recommendation",
                      capex: "Your engineering team sets cycle strategy",
                    },
                    {
                      t: "Risk ownership",
                      opex: "Fleet, manpower surge, upgrade path with Taypro",
                      capex: "Asset depreciation, obsolescence, inventory risk",
                    },
                  ].map((row) => (
                    <tr key={row.t} className="border-t border-gray-200">
                      <td className="py-3 px-4 sm:px-6 font-medium align-top">
                        {row.t}
                      </td>
                      <td className="py-3 px-4 sm:px-6 align-top">{row.opex}</td>
                      <td className="py-3 px-4 sm:px-6 text-gray-600 align-top">
                        {row.capex}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center text-gray-600 mt-8 text-sm sm:text-base">
              Explore hardware directly:{" "}
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
              ,{" "}
              <Link
                href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers"
                className="text-[#A8C117] hover:underline"
              >
                Model-T
              </Link>
              , or{" "}
              <Link
                href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app"
                className="text-[#A8C117] hover:underline"
              >
                Taypro Console
              </Link>
              .
            </p>
          </Container>
        </section>

        <section
          className="py-14 md:py-20 bg-[#f4f7f9]"
          aria-labelledby="opex-roi-heading"
        >
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-8">
              <h2
                id="opex-roi-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4"
              >
                Calculate ROI &amp; savings on Taypro Opex
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed text-center">
                Model how much additional generation and avoided manual cost you
                unlock when soiling is removed systematically instead of
                episodically.
              </p>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fadeInUp" delay={100}>
              <ROICalculatorEmbed />
            </AnimateOnScroll>
          </Container>
        </section>

        <section className="w-full py-24 bg-white bg-center">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <h2 className="font-semibold text-[#052638] text-3xl sm:text-4xl md:text-5xl mb-4">
                Frequently asked questions
              </h2>
              <p className="text-gray-600 text-base sm:text-lg">
                Taypro OPEX service questions — plus broader Taypro programme
                FAQs below.
              </p>
            </AnimateOnScroll>
            <FAQAccordion faqs={allFaqs} variant="classic" />
          </Container>
        </section>

        <ClientsCard />

        <ProjectsCardServer useFileProjects showHeader headerText="Our Projects" />

        {/* Advantages */}
        <section className="w-full py-16 sm:py-20 bg-white">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Why solar plants choose Taypro OPEX
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                Advantages of Taypro OPEX solar cleaning
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                Outcome-based cleaning with robotics, transparency, and no
                surprise asset ownership.
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  icon: UserCheck,
                  title: "Expert handling for best results",
                  body: "Trained Taypro technicians supervise every robotic cycle so AI decisions stay inside safe envelopes for your modules and trackers.",
                },
                {
                  icon: ShieldCheck,
                  title: "Maintaining panel safety",
                  body: "Waterless dual-pass systems and frame-riding kinematics are chosen specifically to protect glass, ARC, and tracker mechanics.",
                },
                {
                  icon: TrendingUp,
                  title: "Enhanced efficiency",
                  body: "Cleaning calendars are revisited whenever soiling drivers shift — keeping performance ratio closer to nameplate across seasons.",
                },
                {
                  icon: Leaf,
                  title: "Eco-friendly operation",
                  body: "Zero water consumption for module washing means no tanker queues, no discharge risk, and simpler environmental compliance.",
                },
                {
                  icon: Handshake,
                  title: "Hassle-free for your O&M",
                  body: "Single vendor accountability: robots, connectivity, manpower, reporting, and billing tied to panels cleaned.",
                },
                {
                  icon: Wallet,
                  title: "Value for money",
                  body: "You fund cleaning outcomes, not stranded capital — ideal when you want predictable monthly OPEX lines and rapid scale-out.",
                },
              ].map((row) => {
                const Icon = row.icon;
                return (
                  <AnimateOnScroll
                    key={row.title}
                    animation="fadeInUp"
                    className="bg-[#f4f1e9] p-6 sm:p-7 rounded-lg flex flex-col items-start h-full"
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-[#A8C117]/15 rounded-md mb-4">
                      <Icon className="text-[#A8C117] w-6 h-6" />
                    </div>
                    <h3 className="text-[#052638] font-semibold text-lg sm:text-xl mb-2">
                      {row.title}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      {row.body}
                    </p>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </Container>
        </section>

        {/* Duration & ROI — two-up cards */}
        <section className="w-full py-16 sm:py-20 bg-[#f4f1e9]">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                The economics &amp; cadence
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                Cleaning cadence &amp; return on investment
              </h2>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <AnimateOnScroll
                animation="fadeInUp"
                className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col"
              >
                <div className="w-14 h-14 flex items-center justify-center bg-[#A8C117]/15 rounded-xl mb-5">
                  <Timer className="text-[#A8C117] w-7 h-7" />
                </div>
                <h3 className="text-[#052638] font-semibold text-2xl sm:text-3xl mb-4 leading-snug">
                  How long does a Taypro OPEX cleaning cycle take?
                </h3>
                <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6">
                  Robotic passes typically run at{" "}
                  <strong>10–15 metres per minute</strong> with a maximum
                  autonomous range of up to <strong>2.2 km</strong> per charge,
                  depending on the deployed model. Under Taypro OPEX, the{" "}
                  <strong>monthly programme</strong> is not a single visit — it
                  is the agreed <strong>3–10 dry cleaning cycles</strong>{" "}
                  derived from your plant study, spaced to maximise generation
                  and minimise operational conflict. Night-time or
                  post-production windows are preferred so cleaning never
                  competes with your peak irradiance hours.
                </p>
                <div className="mt-auto grid grid-cols-3 gap-3 text-center">
                  {[
                    { value: "10–15", label: "m/min" },
                    { value: "2.2 km", label: "per charge" },
                    { value: "3–10", label: "cycles / month" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-[#f4f1e9] rounded-md py-3 px-2"
                    >
                      <div className="text-[#052638] font-semibold text-lg sm:text-xl">
                        {stat.value}
                      </div>
                      <div className="text-gray-500 text-xs sm:text-sm">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll
                animation="fadeInUp"
                delay={100}
                className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col"
              >
                <div className="w-14 h-14 flex items-center justify-center bg-[#A8C117]/15 rounded-xl mb-5">
                  <Gauge className="text-[#A8C117] w-7 h-7" />
              </div>
                <h3 className="text-[#052638] font-semibold text-2xl sm:text-3xl mb-4 leading-snug">
                  What is the ROI of Taypro OPEX?
                </h3>
                <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6">
                  Soiling can erode{" "}
                  <strong>10–25% of practical output</strong> on aggressive
                  sites. Taypro OPEX converts that hidden loss into a managed
                  service line item with measurable before / after performance
                  ratio lift — letting you compare a clean, contracted O&amp;M
                  cost against unpredictable manual washing or
                  under-cleaned baseline scenarios.
                </p>
                <div className="mt-auto flex flex-wrap gap-3 items-center">
                  <Link
                    href="/solar-panel-cleaning-robot-price-calculator"
                    className="inline-flex items-center bg-[#A8C117] text-[#052638] font-medium px-6 py-3 rounded-md hover:bg-[#b3cf3d] transition"
                  >
                    Open the ROI calculator
                  </Link>
                  <OpenLeadModalButton
                    topic="Taypro OPEX"
                    title="Talk to our OPEX team"
                    subtitle="Tell us about your plant and our OPEX team will get back with a pay-per-panel cleaning proposal."
                    className="inline-flex items-center border border-[#052638] text-[#052638] font-medium px-6 py-3 rounded-md hover:bg-[#052638] hover:text-white transition"
                  >
                    Talk to OPEX team
                  </OpenLeadModalButton>
                </div>
              </AnimateOnScroll>
            </div>
          </Container>
        </section>

        <ResourcesCard />

        <section className="w-full bg-white py-20 relative overflow-hidden min-h-[480px]">
          <div className="absolute top-7 left-0 right-0 mx-auto w-[98%] h-[85%] bg-[#f4f1e9] rounded-[36px] z-0" />

          <Container className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 items-center min-h-[380px]">
            <div className="flex flex-col justify-center h-full">
              <h2 className="text-[#052638] font-semibold text-4xl md:text-5xl lg:text-6xl mb-2">
                Skillful operation <br /> for optimal results
              </h2>
            </div>
            <div className="flex flex-col justify-center h-full relative">
              <p className="text-[#052638] text-lg md:text-xl leading-relaxed max-w-xl ml-auto">
                Taypro OPEX pairs soft, lab-validated contact materials with
                disciplined operator oversight — so panels stay clean, warranty
                exposure stays controlled, and your team always knows who is on
                site, why, and what was achieved each shift.
              </p>
              <svg
                className="hidden md:block absolute top-0 right-0 h-48 w-72 -z-0 opacity-50"
                viewBox="0 0 320 180"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d="M10,30 Q80,80 180,40 Q250,10 300,100"
                  stroke="#e0e0d2"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  d="M0,70 Q100,130 250,60 Q310,50 320,140"
                  stroke="#e0e0d2"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
          </Container>
        </section>

        <ModelCards title="Looking for more solutions?" cards={modelBCards} />

        <RequestEstimateForm />
      </div>
    </>
  );
}
