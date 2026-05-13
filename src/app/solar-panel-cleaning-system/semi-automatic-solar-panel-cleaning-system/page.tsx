import Link from "next/link";
import {
  Droplet,
  Dumbbell,
  LineChart,
  Hand,
  Brush,
  Move,
  ShieldCheck,
  Wrench,
  Headset,
  Wifi,
  BatteryCharging,
  Sun,
  Settings,
} from "lucide-react";
import { modelBCards, tayproTrustedByStatsStrip } from "@/app/data";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import ProjectsCardServer from "@/app/components/ProjectsCardServer";
import FAQAccordion from "@/app/components/FAQAccordion";
import ModelCards from "@/app/components/ModelCards";
import ResourcesCard from "@/app/components/ResourcesCard";
import CallbackCard from "@/app/components/CallbackCard";
import HeroSection from "@/app/components/Herosection";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import Product360Viewer from "@/app/components/Product360Viewer";
import {
  ProductSchema,
  FAQPageSchema,
  HowToSchema,
} from "@/app/components/StructuredData";
import { Container } from "@/app/components/Container";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

const breadcrumbs = [
  { name: "Home", href: "/" },
  {
    name: "Solar Panel Cleaning Robots",
    href: "/solar-panel-cleaning-system",
  },
  {
    name: "Semi-Automatic Solar Panel Cleaning Robot",
    href: "",
  },
];

const modelBUsps = [
  {
    icon: Hand,
    title: "Pick-and-Place Deployment",
    description:
      "Lift-and-shift design lets a two-person team deploy Model-B across multiple arrays simultaneously — ideal for scattered, irregular or multi-block solar plants.",
  },
  {
    icon: Droplet,
    title: "100% Waterless Single-Pass Cleaning",
    description:
      "Dual counter-rotating PBT brushes lift over 99% of accumulated dust in a single pass — no water, no detergent, no run-off.",
  },
  {
    icon: Brush,
    title: "UV-Stable PBT Brush System",
    description:
      "Industrial-grade UV-stable polybutylene terephthalate brushes are engineered for long brush life, stable bristle stiffness and panel-safe contact even under continuous outdoor cleaning cycles.",
  },
  {
    icon: Dumbbell,
    title: "Ergonomic 39 kg Chassis",
    description:
      "Light-but-rigid 39 kg construction with integrated fixed handles enables effortless installation, retrieval and inter-row transfer — without any lifting equipment.",
  },
  {
    icon: Move,
    title: "Edge-Detection Safety",
    description:
      "On-board edge-detection prevents accidental falls from the module edge — protecting the robot, the plant and the operator throughout every cleaning cycle.",
  },
  {
    icon: BatteryCharging,
    title: "Up to 3 km Range Per Charge",
    description:
      "A high-capacity lithium-ion pack delivers up to 3 km of cleaning range on a single charge — enough to clean a 1 MW solar plant in under 2 hours.",
  },
  {
    icon: Settings,
    title: "Operator-Centric Onboard Controls",
    description:
      "Simple onboard controls let any site personnel operate Model-B with zero specialised training, eliminating dependency on skilled labour for daily cleaning.",
  },
  {
    icon: ShieldCheck,
    title: "TÜV NORD Certified Build",
    description:
      "Independently certified by TÜV NORD for IP55 protection, validated under simulated sandstorms (10 g/m²) and tested for damp-heat and dry-heat extremes.",
  },
];

const modelBFeatures = [
  {
    title: "Counter-Rotating PBT Brush System",
    icon: Brush,
    body:
      "Two counter-rotating UV-stable PBT brushes work in opposing directions to lift loose dust upward while sweeping fine particulates outward — eliminating over 99% of soiling in a single forward pass. The PBT bristles are non-abrasive, panel-safe and engineered for long life under continuous outdoor cleaning.",
  },
  {
    title: "Cleans a 1 MW Plant in Under 2 Hours",
    icon: LineChart,
    body:
      "A cleaning speed of 10–15 metres per minute means a typical 1 MW utility-scale block is fully cleaned in less than 2 hours — making daily or alternate-day cleaning operationally viable even on large solar farms with constrained labour windows.",
  },
  {
    title: "Up to 3 km Range on a Single Charge",
    icon: BatteryCharging,
    body:
      "The high-density lithium-ion battery delivers a maximum operational range of up to 3 km per charge, with a recommended range of 1.6 km for sustained daily duty cycles. One unit can comfortably finish several arrays before needing to recharge at the docking station.",
  },
  {
    title: "Pick-and-Place Multi-Array Deployment",
    icon: Hand,
    body:
      "Built around a true lift-and-shift workflow, Model-B is moved between arrays by the operator using factory-fitted ergonomic handles. Inter-row traversal is supported by purpose-designed bridge kits supplied and installed by Taypro, letting one robot service multiple rows without dedicated rails or panel modifications.",
  },
  {
    title: "Edge-Detection & Fall-Prevention",
    icon: ShieldCheck,
    body:
      "Onboard edge-detection sensors continuously scan the module boundary and stop the robot at the panel edge — preventing falls, panel damage and operator risk. A precision-engineered drive system holds the robot stable even at maximum module tilt of 45°.",
  },
  {
    title: "Rapid Field Serviceability",
    icon: Wrench,
    body:
      "Critical components (brushes, drive wheels, battery, controllers) can be accessed and replaced without dismantling the main assembly. Most field service operations are completed in minutes, not hours — minimising planned and unplanned downtime.",
  },
  {
    title: "Reinforced Heavy-Duty Chassis",
    icon: Dumbbell,
    body:
      "The reinforced chassis withstands daily lifting, transport and outdoor exposure across the full 20-year design life. The corrosion-resistance class C3 finish protects against typical industrial atmospheres found on Indian utility-scale plants.",
  },
  {
    title: "Sealed Body, IP65 Protection",
    icon: Sun,
    body:
      "All electrical components, wiring harnesses and connectors are fully enclosed within the sealed device body — providing IP65-rated protection against dust, moisture and environmental contaminants in extreme field conditions.",
  },
];

const modelBSpecs = [
  { label: "Cleaning Method", value: "Waterless, Single-Pass" },
  { label: "Cleaning Material", value: "UV-Stable PBT Brush" },
  { label: "Cleaning Speed", value: "10–15 Metres/Minute" },
  { label: "Maximum Operational Range", value: "Up to 3 km" },
  { label: "Recommended Operational Range", value: "1.6 km" },
  { label: "Operation Mode", value: "Semi-Automatic (Manual Deployment)" },
  { label: "Battery Technology", value: "Lithium-Ion" },
  { label: "Overall Dimensions", value: "750 mm × 4800 mm" },
  { label: "Operating Weight", value: "39 kg" },
  { label: "Design Life", value: "20 Years" },
  { label: "Corrosion Resistance Class", value: "C3" },
  { label: "IP Protection Rating", value: "IP65" },
  { label: "Wind Resistance (In Operation)", value: "40 km/hr" },
  { label: "Wind Resistance (At Docking Station)", value: "180 km/hr" },
  { label: "Maximum Module Undulation", value: "+20 mm (UVPBT)" },
  { label: "Maximum Module Tilt", value: "45°" },
  { label: "Maximum East–West Terrain Slope", value: "15°" },
  { label: "Maximum Operating Temperature", value: "90°C" },
];

const modelBSteps = [
  {
    name: "Lift and place the robot on the first solar row",
    text: "Using the factory-fitted ergonomic handles, two operators lift the 39 kg Model-B Solar Panel Cleaning Robot onto the leading edge of the first solar panel row. The compact, balanced chassis is designed for tool-free placement without any cranes or forklifts.",
  },
  {
    name: "Activate the onboard controls",
    text: "The operator powers on the robot and selects a cleaning cycle from the intuitive onboard controls. No specialised training is required — the interface is designed for any site personnel and starts a single forward cleaning pass along the row.",
  },
  {
    name: "Counter-rotating PBT brushes lift dust waterless",
    text: "Two counter-rotating UV-stable PBT brushes engage the module surface, lifting and sweeping over 99% of accumulated dust in a single dry pass at a cleaning speed of 10–15 metres per minute — without water, detergent or operator supervision.",
  },
  {
    name: "Edge-detection prevents falls at row ends",
    text: "Precision edge-detection sensors continuously scan the panel boundary and automatically stop the robot at the end of the row, preventing falls and protecting both the robot and the solar modules.",
  },
  {
    name: "Move the robot to the next row via bridge kit or lift-and-shift",
    text: "Operators retrieve the robot using the integrated handles and transfer it to the next row using Taypro's purpose-designed bridge kits — or lift-and-shift it directly across short inter-row gaps. The same robot can clean multiple arrays in sequence.",
  },
  {
    name: "Recharge and review performance",
    text: "After completing the assigned arrays (up to 3 km per charge), the robot is returned to its docking station for lithium-ion recharging. Cleaning telemetry and operational health data are available via the Taypro Console portal for fleet-wide review.",
  },
];

const modelBFaqs = [
  {
    question:
      "What is a Semi-Automatic Solar Panel Cleaning Robot, and how does Taypro Model-B work?",
    answer:
      "A semi-automatic Solar Panel Cleaning Robot is a portable robotic cleaner that is manually deployed by an operator onto a row of solar panels, after which it cleans autonomously along that row. Taypro Model-B is a pick-and-place, lift-and-shift type robot: the operator places it on the first row using factory-fitted handles, starts the cleaning cycle via onboard controls, and the robot uses two counter-rotating UV-stable PBT brushes to sweep over 99% of dust off the module surface in a single pass. Once the row is complete, the operator moves the robot to the next row using Taypro's bridge kits or by lift-and-shift.",
  },
  {
    question:
      "How is Model-B different from the Model-A Automatic Solar Panel Cleaning Robot?",
    answer:
      "Model-A is a fully autonomous robot that is permanently assigned to a specific array and runs daily cleaning cycles without any human intervention — ideal for large utility-scale plants where labour is the bottleneck. Model-B is a semi-automatic, pick-and-place robot operated by a small two-person team across multiple arrays — ideal for scattered, irregular, smaller or rooftop plants where the capex of a per-array robot isn't justified. Both robots are waterless, AI-driven and managed from the same Taypro Console portal.",
  },
  {
    question: "How big a solar plant can Model-B clean in a day?",
    answer:
      "A single Model-B can clean approximately 1 MW of solar capacity in under 2 hours, which translates to several MW per shift depending on plant layout, inter-row distance and operator workflow. Most semi-automatic deployments use multiple Model-B units in parallel to cover utility-scale plants on a daily or alternate-day cleaning cycle.",
  },
  {
    question: "Does Model-B require water for cleaning solar panels?",
    answer:
      "No. Taypro Model-B is a 100% waterless solar panel cleaning robot. It uses a pair of counter-rotating UV-stable PBT brushes that physically lift and sweep dust off the module surface in a single dry pass — eliminating water consumption, detergent costs, run-off contamination and the logistics of water tankers entirely.",
  },
  {
    question: "Is the PBT brush safe for solar modules and Anti-Reflective Coating (ARC)?",
    answer:
      "Yes. The UV-stable PBT brush system is engineered to be panel-safe and non-abrasive. Every robot is independently tested for micro-crack formation, optical reflectance loss and ARC preservation under simulated daily cleaning cycles by accredited solar-sector testing laboratories. Model-B is also TÜV NORD certified for IP55 protection and validated for damp-heat and dry-heat performance.",
  },
  {
    question:
      "What types of solar plants is Model-B suitable for — rooftop, ground-mounted, fixed tilt or tracker?",
    answer:
      "Model-B is built for fixed-tilt, seasonal-tilt and horizontal single-axis tracker plants. It supports module tilts up to 45° and east–west terrain slopes of up to 15°, making it compatible with most utility-scale, commercial and industrial rooftop, and ground-mounted installations. For dedicated single-axis tracker plants we recommend Model-T; for fully autonomous large utility-scale plants we recommend Model-A.",
  },
  {
    question:
      "How much does the Taypro Model-B Semi-Automatic Solar Panel Cleaning Robot cost?",
    answer:
      "The price of a Model-B Semi-Automatic Solar Panel Cleaning Robot depends on the number of units, plant layout, bridge-kit requirements and AMC scope. Most customers achieve a fast payback because Model-B replaces recurring water, labour and tanker costs with a single capex investment. Contact our team for a site-specific quote and a detailed ROI calculation.",
  },
  {
    question:
      "How many people are needed to operate a Taypro Model-B robot?",
    answer:
      "Just two. The 39 kg optimised weight with factory-fitted ergonomic handles allows a compact two-person site team to lift, place, operate and relocate Model-B across multiple arrays without any forklifts, cranes or heavy lifting equipment. Operators do not require specialised training — the onboard controls are designed for any site personnel.",
  },
  {
    question:
      "Does Model-B work in extreme Indian climatic conditions like dust storms, heat and monsoon?",
    answer:
      "Yes. Model-B is engineered for harsh Indian utility-scale field conditions: maximum operating temperature of 90°C, IP65-rated sealed enclosure, TÜV NORD-certified IP55 protection and field-validated under 12 simulated sandstorm cycles per year at 10 g/m² sand loading. The robot can clean in winds up to 40 km/hr and locks securely at its docking station up to 180 km/hr.",
  },
  {
    question: "What kind of after-sales support does Taypro provide for Model-B?",
    answer:
      "Every Model-B deployment is backed by Taypro's pan-India service model: pre-scheduled preventive and corrective maintenance, immediate remote diagnostics upon incident notification, and same-day on-site breakdown resolution targets — anywhere in India. Annual maintenance contracts (AMC) are available for long-term operations.",
  },
];

export default function SemiAutomaticSolarPanelCleaningRobot() {
  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <ProductSchema
        name="Semi-Automatic Solar Panel Cleaning Robot - Model-B"
        description="Taypro Model-B is a 39 kg pick-and-place, semi-automatic Solar Panel Cleaning Robot. Counter-rotating UV-stable PBT brushes remove 99%+ dust in a single pass, clean a 1 MW plant in under 2 hours, run up to 3 km on a single charge, TÜV NORD certified, and built for fixed tilt, seasonal tilt and horizontal single-axis tracker plants."
        image={`${siteUrl}/tayprorobots/taypro-modelBcopy.png`}
        brand="Taypro"
        sku="MODEL-B"
        offers={{
          price: "Contact for pricing",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
        }}
      />
      <FAQPageSchema faqs={modelBFaqs} />
      <HowToSchema
        name="How to clean solar panels with the Taypro Model-B Semi-Automatic Solar Panel Cleaning Robot"
        description="Step-by-step deployment of the Taypro Model-B pick-and-place semi-automatic solar panel cleaning robot — from lifting the robot onto the first row through recharging at the docking station."
        steps={modelBSteps}
        totalTime="PT2H"
        image="/tayprorobots/taypro-modelBcopy.png"
      />

      <div className="min-h-screen overflow-x-hidden">
        <HeroSection
          title="Semi-Automatic Solar Panel Cleaning Robot — Model-B"
          subtitle={
            <>
              A 39 kg pick-and-place, waterless Solar Panel Cleaning Robot
              engineered for utility-scale solar power plants. Dual
              counter-rotating UV-stable PBT brushes lift over{" "}
              <strong>99% of dust in a single pass</strong>, cleaning a 1 MW
              block in under 2 hours and running up to 3 km on a single
              charge — operable by any two-person site team.
            </>
          }
          imgSrc="/tayprorobots/taypro-modelBcopy.png"
          imgAlt="Taypro Model-B — Semi-Automatic Solar Panel Cleaning Robot, pick-and-place waterless cleaner for utility-scale solar plants"
          ctaHref="/contact"
          ctaText="Request a quote"
        />

        {/* PRODUCT OVERVIEW / SEO INTRO */}
        <section className="bg-white pt-8 sm:pt-14 pb-4">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Pick-and-Place Solar Cleaning Robot for Utility-Scale Plants
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl mb-6 leading-tight">
                What is Taypro Model-B?
              </h2>
              <div className="space-y-5 text-gray-600 text-base sm:text-lg leading-relaxed">
                <p>
                  Taypro Model-B is a{" "}
                  <strong>
                    semi-automatic, pick-and-place type Solar Panel Cleaning
                    Robot
                  </strong>{" "}
                  purpose-built for utility-scale solar installations. It is
                  capable of cleaning a 1 MW solar power plant in{" "}
                  <strong>under 2 hours</strong>, substantially improving energy
                  yield by reducing soiling losses through increased cleaning
                  frequency.
                </p>
                <p>
                  The robot deploys a pair of{" "}
                  <strong>counter-rotating UV-stable PBT brushes</strong> that
                  eliminate over <strong>99% of accumulated dust</strong> from
                  panel surfaces in a single pass, covering{" "}
                  <strong>up to 3 km of solar modules</strong> on a single
                  charge. Cleaning operations are best scheduled
                  post-energy-production hours to ensure zero disruption to
                  generation cycles.
                </p>
                <p>
                  Equipped with precision{" "}
                  <strong>edge-detection technology</strong> to prevent
                  accidental falls, Model-B can be manually deployed by
                  operators across multiple arrays simultaneously. Inter-row
                  traversal is facilitated via purpose-designed{" "}
                  <strong>bridge kits</strong> supplied and installed by Taypro,
                  letting one robot service many rows without rails or
                  modifications to your modules.
                </p>
                <p>
                  Model-B is a strong fit for{" "}
                  <strong>fixed-tilt, seasonal-tilt and horizontal
                  single-axis tracker</strong>{" "}
                  installations where the capex of a per-array automatic robot
                  is not justified — including rooftop, ground-mounted and
                  multi-block utility-scale plants. For fully autonomous,
                  always-on cleaning we recommend{" "}
                  <Link
                    href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system"
                    className="text-[#A8C117] hover:underline"
                  >
                    Model-A
                  </Link>
                  ; for dedicated single-axis tracker plants we recommend{" "}
                  <Link
                    href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers"
                    className="text-[#A8C117] hover:underline"
                  >
                    Model-T
                  </Link>
                  .
                </p>
                <p>
                  Further reading:{" "}
                  <Link
                    href="/blog/what-are-the-different-methods-used-for-solar-panel-cleaning"
                    className="text-[#A8C117] hover:underline"
                  >
                    methods used for solar panel cleaning
                  </Link>{" "}
                  (where semi-automatic robots fit) and related guides on the{" "}
                  <Link href="/blog" className="text-[#A8C117] hover:underline">
                    Taypro blog
                  </Link>
                  .
                </p>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* 360 Viewer */}
        <section className="bg-gradient-to-b from-white to-gray-50 py-16">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-8">
              <div className="text-[#A8C117] text-xl sm:text-2xl font-medium mb-2">
                Interactive Product Tour
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl mb-4">
                360° View of Model-B
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
                Drag left or right to rotate and explore the Semi-Automatic Solar Panel Cleaning Robot from every angle.
              </p>
            </AnimateOnScroll>
            <AnimateOnScroll
              animation="fadeInUp"
              delay={100}
              className="flex justify-center"
            >
              <div className="w-full max-w-4xl">
                <Product360Viewer
                  imagePath="/360-degree-images/Model-B/0001-MB-2000-1224-"
                  imageCount={51}
                  imagePrefix=""
                  imageSuffix=".png"
                  startIndex={100}
                  width={800}
                  height={600}
                  className="mx-auto"
                  productLabel="Taypro Model-B — Semi-Automatic Solar Panel Cleaning Robot"
                />
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* HOW DOES MODEL-B WORK */}
        <section className="w-full bg-white py-20">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Step-by-Step Deployment
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                How Does the Model-B Solar Panel Cleaning Robot Work?
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                Model-B is engineered around a simple, repeatable
                pick-and-place workflow that any site team can execute. A full
                cleaning cycle on a 1 MW block typically takes under 2 hours
                from first lift to dock.
              </p>
            </AnimateOnScroll>

            <ol className="space-y-6">
              {modelBSteps.map((step, idx) => (
                <AnimateOnScroll
                  key={step.name}
                  animation="fadeInUp"
                  className="flex gap-5 bg-[#f4f1e9] p-6 rounded-lg"
                >
                  <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-[#A8C117] text-white font-semibold text-lg rounded-full">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-[#052638] font-semibold text-xl mb-2">
                      {step.name}
                    </h3>
                    <p className="text-gray-600 text-base leading-relaxed">
                      {step.text}
                    </p>
                  </div>
                </AnimateOnScroll>
              ))}
            </ol>
          </Container>
        </section>

        {/* USP GRID */}
        <section className="w-full py-20 bg-[#f4f1e9]">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Why Choose Taypro Model-B
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                Engineered for Real-World Solar Operations
              </h2>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {modelBUsps.map((usp) => {
                const Icon = usp.icon;
                return (
                  <AnimateOnScroll
                    key={usp.title}
                    animation="fadeInUp"
                    className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-start"
                  >
                    <div className="w-15 h-15 flex items-center justify-center bg-[#A8C117]/10 rounded-md mb-4">
                      <Icon className="text-[#A8C117] w-7 h-7" />
                    </div>
                    <h3 className="text-[#052638] font-semibold text-lg mb-2">
                      {usp.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {usp.description}
                    </p>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </Container>
        </section>

        {/* DETAILED FEATURES */}
        <section className="w-full bg-white py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Key Features Setting Taypro Apart
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                Inside the Model-B Semi-Automatic Cleaning Robot
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                Every sub-system on Model-B — from the brush head to the
                chassis — is engineered for high uptime, fast deployment and
                long-term panel safety on utility-scale solar power plants.
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
              {modelBFeatures.map((f) => {
                const Icon = f.icon;
                return (
                  <AnimateOnScroll
                    key={f.title}
                    animation="fadeInUp"
                    className="flex gap-5"
                  >
                    <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-[#A8C117]/10 rounded-md">
                      <Icon className="text-[#A8C117] w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-[#052638] font-semibold text-xl mb-2">
                        {f.title}
                      </h3>
                      <p className="text-gray-600 text-base leading-relaxed">
                        {f.body}
                      </p>
                    </div>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </Container>
        </section>

        {/* CERTIFICATIONS */}
        <section className="w-full bg-[#f4f1e9] py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Independently Tested &amp; Certified
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                Certifications &amp; Field-Validated Testing
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                Taypro&rsquo;s cleaning solutions are subjected to rigorous
                field and laboratory validation, simulating daily cleaning
                cycles under realistic outdoor conditions, conducted by
                accredited solar-sector testing laboratories.
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-8">
              {[
                {
                  title: "TÜV NORD Certified",
                  body:
                    "Independently tested and certified by TÜV NORD for IP55 protection and validated under extreme damp-heat and dry-heat performance conditions.",
                },
                {
                  title: "Simulated Sandstorm Testing",
                  body:
                    "Validated under 12 sandstorm events per year at a sand loading of 10 g/m² per cycle — the toughest desert-climate cleaning protocol.",
                },
                {
                  title: "Panel-Safe Verified",
                  body:
                    "Tested for micro-crack analysis, full electrical parameter evaluation, optical reflectance and ARC (Anti-Reflective Coating) preservation.",
                },
              ].map((c) => (
                <AnimateOnScroll
                  key={c.title}
                  animation="fadeInUp"
                  className="bg-white p-6 rounded-lg shadow-sm"
                >
                  <ShieldCheck className="text-[#A8C117] w-9 h-9 mb-3" />
                  <h3 className="text-[#052638] font-semibold text-xl mb-2">
                    {c.title}
                  </h3>
                  <p className="text-gray-600 text-base leading-relaxed">
                    {c.body}
                  </p>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        {/* TRUST STATS STRIP */}
        <section className="w-full bg-[#052638] py-16">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Proven at Scale
              </div>
              <h2 className="text-white font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                Trusted by India&rsquo;s Leading Solar Operators
              </h2>
            </AnimateOnScroll>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 text-center">
              {[...tayproTrustedByStatsStrip].map((stat) => (
                <AnimateOnScroll
                  key={stat.label}
                  animation="fadeInUp"
                  className="px-4"
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

        {/* SERVICE & MAINTENANCE PROMISE */}
        <section className="w-full bg-white py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Operating Confidence, Every Day
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                Service &amp; Maintenance Promise
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                Every Model-B deployment is backed by a structured service
                model designed to keep your fleet running at peak uptime
                across India.
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  icon: Wrench,
                  title: "Pre-Scheduled Preventive Maintenance",
                  body:
                    "All preventive and corrective maintenance activities are executed on a pre-scheduled basis — designed to eliminate unplanned downtime and sustain peak operational performance across the robot's 20-year lifecycle.",
                },
                {
                  icon: Wifi,
                  title: "Immediate Remote Diagnostics",
                  body:
                    "Taypro provides immediate remote diagnostics and troubleshooting upon incident notification — most issues are resolved without requiring a physical site visit.",
                },
                {
                  icon: Headset,
                  title: "Same-Day On-Site Intervention",
                  body:
                    "When on-site work is required, Taypro targets same-day on-site breakdown resolution, available pan-India, with immediate remote diagnostics from Taypro Console.",
                },
              ].map((p) => {
                const Icon = p.icon;
                return (
                  <AnimateOnScroll
                    key={p.title}
                    animation="fadeInUp"
                    className="bg-[#f4f1e9] p-6 rounded-lg"
                  >
                    <Icon className="text-[#A8C117] w-9 h-9 mb-3" />
                    <h3 className="text-[#052638] font-semibold text-xl mb-2">
                      {p.title}
                    </h3>
                    <p className="text-gray-600 text-base leading-relaxed">
                      {p.body}
                    </p>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </Container>
        </section>

        <CallbackCard
          headerText={
            <>
              Schedule Online Demo For Semi-Automatic Solar <br /> Panel
              Cleaning Robots
            </>
          }
        />

        {/* SPECIFICATIONS */}
        <section
          id="model-b-specs"
          className="w-full bg-white pt-20 pb-10 scroll-mt-24"
        >
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="font-semibold text-[#052638] text-center text-3xl sm:text-5xl md:text-6xl mb-12 sm:mb-15"
            >
              <h2>
                Semi-Automatic Solar Panel Cleaning Robot <br /> Model-B Specifications
              </h2>
            </AnimateOnScroll>
            <div className="w-full bg-white shadow-md overflow-x-auto">
              <table className="w-full text-left border border-gray-300 text-sm sm:text-base">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-4 px-6 font-semibold text-base md:text-xl text-[#052638]">
                      Specification
                    </th>
                    <th className="py-4 px-6 font-semibold text-base md:text-xl text-[#052638]">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[#052638]">
                  {modelBSpecs.map((row) => (
                    <tr key={row.label}>
                      <td className="py-3 px-6 border-t text-base font-medium">
                        {row.label}
                      </td>
                      <td className="py-3 px-6 border-t text-base">
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Container>
        </section>

        {/* ROBOTIC vs MANUAL CLEANING */}
        <section className="w-full bg-[#f4f1e9] py-20">
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="text-center mb-10 sm:mb-14"
            >
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Robotic vs Manual Solar Cleaning
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                Why Choose a Semi-Automatic Cleaning Robot Over Manual
                Cleaning?
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                Manual cleaning crews, water tankers and ad-hoc schedules
                can&rsquo;t keep up with daily soiling losses on utility-scale
                solar plants. Even a small fleet of Model-B robots transforms
                solar O&amp;M economics overnight.
              </p>
            </AnimateOnScroll>

            <div className="overflow-x-auto">
              <table className="w-full text-left border border-gray-200 text-sm sm:text-base bg-white">
                <thead>
                  <tr className="bg-white">
                    <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#052638]">
                      Criterion
                    </th>
                    <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#052638]">
                      Manual Cleaning
                    </th>
                    <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#A8C117]">
                      Taypro Model-B
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[#052638]">
                  {[
                    {
                      criterion: "Cleaning Frequency",
                      manual: "Weekly or fortnightly, weather-permitting",
                      modelB:
                        "Daily or alternate-day cycles by a 2-person team",
                    },
                    {
                      criterion: "Water Consumption",
                      manual:
                        "1.5–3 litres of water per module per wash",
                      modelB: "Zero — fully waterless single-pass dry cleaning",
                    },
                    {
                      criterion: "Cleaning Quality",
                      manual: "Inconsistent, operator-dependent",
                      modelB:
                        "99%+ dust removal in a single automated pass, every cycle",
                    },
                    {
                      criterion: "Speed",
                      manual:
                        "Many hours per MW, constrained by daylight and labour",
                      modelB:
                        "Cleans a 1 MW plant in under 2 hours",
                    },
                    {
                      criterion: "Labour & Safety",
                      manual:
                        "Large crews, panel damage risk, night-shift safety risk",
                      modelB:
                        "2 operators, ergonomic 39 kg lift, edge-detection safety",
                    },
                    {
                      criterion: "Performance Ratio Impact",
                      manual:
                        "Soiling losses of 5–25% accumulate between washes",
                      modelB:
                        "Frequent cleaning sustains peak PR, lifting plant yield 4–8%",
                    },
                    {
                      criterion: "Panel Safety",
                      manual:
                        "Risk of micro-cracks, ARC abrasion and scratches",
                      modelB:
                        "Panel-safe UV-stable PBT brushes, lab-tested for ARC preservation",
                    },
                    {
                      criterion: "Total Cost of Ownership",
                      manual:
                        "Recurring water, labour, tanker, equipment and downtime costs",
                      modelB:
                        "One-time capex, replaces recurring opex, 20-year design life",
                    },
                  ].map((row) => (
                    <tr key={row.criterion}>
                      <td className="py-3 px-4 sm:px-6 border-t text-base font-medium align-top">
                        {row.criterion}
                      </td>
                      <td className="py-3 px-4 sm:px-6 border-t text-base text-gray-600 align-top">
                        {row.manual}
                      </td>
                      <td className="py-3 px-4 sm:px-6 border-t text-base align-top">
                        {row.modelB}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Container>
        </section>

        {/* MODEL-A vs MODEL-B COMPARISON */}
        <section className="w-full bg-white py-20">
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="text-center mb-10 sm:mb-14"
            >
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Choosing the Right Taypro Robot
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                Model-B vs Model-A: Which Solar Cleaning Robot Is Right for You?
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                Both robots use waterless dry cleaning and are managed from
                the same Taypro Console. The choice depends on plant size,
                labour availability and capex appetite.
              </p>
            </AnimateOnScroll>

            <div className="overflow-x-auto">
              <table className="w-full text-left border border-gray-200 text-sm sm:text-base">
                <thead>
                  <tr className="bg-[#f4f1e9]">
                    <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#052638]">
                      Criterion
                    </th>
                    <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#A8C117]">
                      Model-B (Semi-Automatic)
                    </th>
                    <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#052638]">
                      Model-A (Fully Automatic)
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[#052638]">
                  {[
                    {
                      criterion: "Operation Mode",
                      modelB: "Semi-automatic, pick-and-place (manual deployment)",
                      modelA: "Fully autonomous, permanently assigned to array",
                    },
                    {
                      criterion: "Best For",
                      modelB:
                        "Multi-block, scattered, smaller or rooftop plants",
                      modelA:
                        "Large utility-scale plants with daily cleaning needs",
                    },
                    {
                      criterion: "Cleaning Mechanism",
                      modelB:
                        "Counter-rotating UV-stable PBT brushes, single-pass",
                      modelA:
                        "Self-cleaning rotating microfiber drum, dual-pass",
                    },
                    {
                      criterion: "Cleaning Speed",
                      modelB: "10–15 m/min — cleans 1 MW in under 2 hours",
                      modelA: "10–15 m/min — runs daily, after production hours",
                    },
                    {
                      criterion: "Range Per Charge",
                      modelB: "Up to 3 km / 1.6 km recommended",
                      modelA: "Up to 3,600 modules per charge",
                    },
                    {
                      criterion: "Labour Requirement",
                      modelB: "2 operators move robot between arrays",
                      modelA: "Zero — runs unattended after install",
                    },
                    {
                      criterion: "Capex Profile",
                      modelB: "Lower per-MW capex, scales with operator team",
                      modelA: "Higher per-MW capex, near-zero opex",
                    },
                    {
                      criterion: "Max Module Tilt",
                      modelB: "45°",
                      modelA: "Designed for utility-scale tilt range",
                    },
                  ].map((row) => (
                    <tr key={row.criterion}>
                      <td className="py-3 px-4 sm:px-6 border-t text-base font-medium align-top">
                        {row.criterion}
                      </td>
                      <td className="py-3 px-4 sm:px-6 border-t text-base align-top">
                        {row.modelB}
                      </td>
                      <td className="py-3 px-4 sm:px-6 border-t text-base text-gray-600 align-top">
                        {row.modelA}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <AnimateOnScroll animation="fadeInUp" className="text-center mt-10">
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto">
                Cleaning a single-axis tracker plant? Look at{" "}
                <Link
                  href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers"
                  className="text-[#A8C117] hover:underline"
                >
                  Model-T
                </Link>
                . Prefer outsourcing cleaning entirely? Explore the{" "}
                <Link
                  href="/solar-panel-cleaning-system/solar-panel-cleaning-service"
                  className="text-[#A8C117] hover:underline"
                >
                  Taypro OPEX cleaning service
                </Link>
                .
              </p>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* BUILT FOR INDIAN CONDITIONS */}
        <section className="w-full bg-[#052638] py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Engineered for Indian Conditions
              </div>
              <h2 className="text-white font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                Built for Indian Solar Plants — From Rooftop to Utility Scale
              </h2>
              <p className="text-white/80 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                Rajasthan dust storms, Gujarat heat, Karnataka humidity and
                Tamil Nadu monsoons — Taypro Model-B is engineered, tested and
                deployed for the realities of large-scale Indian solar
                O&amp;M.
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              {[
                {
                  title: "High-Soiling Region Performance",
                  body:
                    "Increased cleaning frequency is the only economical way to neutralise the 8–25% soiling losses typical of Indian utility-scale plants. Model-B's 1 MW-in-2-hours cleaning rate makes daily or alternate-day cycles operationally affordable.",
                },
                {
                  title: "Temperature & Humidity Tolerance",
                  body:
                    "Validated for operating temperatures up to 90°C and TÜV NORD certified for damp-heat and dry-heat performance — proven across Indian summer, monsoon and post-monsoon cycles.",
                },
                {
                  title: "Waterless — Critical for Water-Scarce States",
                  body:
                    "Many Indian solar farms are in water-stressed districts. Model-B's waterless cleaning removes water tankers from your O&M plan entirely, freeing water and logistics for higher-priority site use.",
                },
                {
                  title: "Pan-India Service Network",
                  body:
                    "Same-day on-site breakdown resolution across India, with immediate remote diagnostics from Taypro Console — backed by regional spare inventory and structured AMC programs.",
                },
              ].map((card) => (
                <AnimateOnScroll
                  key={card.title}
                  animation="fadeInUp"
                  className="bg-white/5 border border-white/10 p-6 sm:p-7 rounded-lg"
                >
                  <h3 className="text-white font-semibold text-xl mb-3">
                    {card.title}
                  </h3>
                  <p className="text-white/80 text-base leading-relaxed">
                    {card.body}
                  </p>
                </AnimateOnScroll>
              ))}
            </div>

            <AnimateOnScroll animation="fadeInUp" className="text-center mt-12">
              <p className="text-white/80 text-base sm:text-lg max-w-3xl mx-auto">
                Looking at adjacent solar O&amp;M needs? Explore the{" "}
                <Link
                  href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system"
                  className="text-[#A8C117] hover:underline"
                >
                  fully-automatic Model-A robot
                </Link>
                , the{" "}
                <Link
                  href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers"
                  className="text-[#A8C117] hover:underline"
                >
                  Model-T robot for single-axis trackers
                </Link>
                , the{" "}
                <Link
                  href="/solar-panel-cleaning-system/solar-panel-cleaning-service"
                  className="text-[#A8C117] hover:underline"
                >
                  Taypro OPEX cleaning service
                </Link>{" "}
                or the{" "}
                <Link
                  href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app"
                  className="text-[#A8C117] hover:underline"
                >
                  Taypro Console monitoring app
                </Link>
                .
              </p>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* PROJECTS — dynamic */}
        <ProjectsCardServer useFileProjects showHeader headerText="" />

        {/* FAQs */}
        <section className="w-full bg-white py-20">
          <Container size="narrow">
            <AnimateOnScroll
              animation="fadeInUp"
              className="font-semibold text-center text-[#052638] text-3xl sm:text-5xl md:text-5xl mb-8"
            >
              <h2>Frequently Asked Questions</h2>
            </AnimateOnScroll>
            <p className="text-center text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mb-10">
              Common questions about the Taypro Model-B Semi-Automatic Solar
              Panel Cleaning Robot.
            </p>
            <FAQAccordion faqs={modelBFaqs} variant="modern" />
          </Container>
        </section>

        <ResourcesCard />

        <ModelCards title="Looking for more solutions?" cards={modelBCards} />

        <RequestEstimateForm />
      </div>
    </>
  );
}
