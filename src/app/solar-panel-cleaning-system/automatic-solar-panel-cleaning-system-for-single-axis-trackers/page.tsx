"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Brain,
  Cloud,
  RotateCcw,
  Droplet,
  ShieldCheck,
  Wrench,
  Headset,
  Wifi,
  BatteryCharging,
  Sun,
  Move,
  Compass,
} from "lucide-react";
import { modelTCards, tayproRobotConnectivitySummary } from "@/app/data";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import ProjectsCard from "@/app/components/ProjectsCard";
import ModelCards from "@/app/components/ModelCards";
import ClientsCard from "@/app/components/ClientsCard";
import HeroSection from "@/app/components/Herosection";
import EnergyResourceCard from "@/app/components/EnergyResourceCard";
import CallbackCard from "@/app/components/CallbackCard";
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
    name: "Solar Panel Cleaning Robot for Single-Axis Trackers",
    href: "",
  },
];

const modelTUsps = [
  {
    icon: Compass,
    title: "Purpose-Built for Single-Axis Trackers",
    description:
      "Engineered from the ground up for tracker-based solar farms — compatible with NEXTracker, Gamechanger and other leading single-axis tracker manufacturers.",
  },
  {
    icon: Move,
    title: "Flexible ±15° Body Articulation",
    description:
      "Flexes its body up to 15° to accommodate angle differences between adjacent tables, ensuring safe and reliable movement over panels and inter-table bridges.",
  },
  {
    icon: RotateCcw,
    title: "Wide Module Tilt Range (-52° to +52°)",
    description:
      "Cleans modules across the full operational tilt range of a single-axis tracker — from steep morning angle through flat noon position to steep evening angle.",
  },
  {
    icon: Droplet,
    title: "100% Waterless Dual-Pass Cleaning",
    description:
      "Two-pass dry cleaning lifts over 99% of dust from module surfaces using microfiber or PBT — no water, no detergent, no run-off contamination.",
  },
  {
    icon: Brain,
    title: "AI- and ML-Driven Autonomy",
    description:
      "Advanced edge, obstacle and angle detection lets Model-T move safely across panels without risk of falling — continuously tracking path and surface undulations along each row.",
  },
  {
    icon: Cloud,
    title: "Cloud-Connected Remote Monitoring",
    description:
      `Supported connectivity includes ${tayproRobotConnectivitySummary}, feeding real-time telemetry into the Taypro Console — schedule cleaning, adjust settings, track performance and receive weather alerts from any device.`,
  },
  {
    icon: BatteryCharging,
    title: "Up to 2.2 km / 3,600 Modules Per Charge",
    description:
      "A single Model-T cleans up to 2.2 km of tracker run on a single charge — typically around 3,600 modules — before self-docking and recharging at its shadow-free dock.",
  },
  {
    icon: ShieldCheck,
    title: "TÜV NORD Certified Build",
    description:
      "Independently tested and certified by TÜV NORD for IP55 protection and validated under simulated sandstorm and damp-heat/dry-heat extremes.",
  },
];

const modelTFeatures = [
  {
    title: "Flexible Body Bridge for Tracker Tables",
    icon: Move,
    body:
      "Tracker plants rarely sit perfectly aligned across rows — slight angle differences between adjacent tables are the norm. Model-T's body flexes up to 15° to safely traverse these inter-table angle deviations, working in tandem with purpose-designed bridge kits to maintain continuous cleaning across the row.",
  },
  {
    title: "NEXTracker and Gamechanger Compatibility",
    icon: Compass,
    body:
      "Model-T is engineered for the dominant single-axis tracker platforms in utility-scale solar — compatible with NEXTracker, Gamechanger and equivalent trackers. The robot integrates with existing tracker structures with no modifications to your modules or tracker mounting hardware.",
  },
  {
    title: "Edge, Obstacle & Angle Detection",
    icon: ShieldCheck,
    body:
      "On-board sensors continuously detect module edges, surface obstacles and inter-table angle changes. Motor performance is adjusted in real time as the robot tracks path and surface undulations — preserving consistent cleaning quality and preventing accidental falls.",
  },
  {
    title: "Dual-Pass Cleaning — Microfiber or PBT",
    icon: Droplet,
    body:
      "A dual-pass cleaning cycle lifts over 99% of accumulated dust from the module surface. Cleaning material can be specified as either rotating microfiber (best for fine-dust regions) or UV-stable PBT brush (best for high-particulate sand and arid sites) depending on plant location.",
  },
  {
    title: "Real-Time Weather-Aware Scheduling",
    icon: Cloud,
    body:
      "The Taypro Console pulls live weather data to optimise the cleaning schedule, push alerts for critical conditions and skip cycles when not needed. All schedule changes are reflected automatically on the portal — no manual intervention required at the plant.",
  },
  {
    title: "Self-Docking Charging Station",
    icon: BatteryCharging,
    body:
      "After each cleaning cycle, Model-T returns to a secure docking station placed beside the modules — positioned to avoid casting shadows on the array. The integrated charging system needs no external power. Battery level, charging status and health are visible in real time on the remote portal.",
  },
  {
    title: "Battery-Aware Return Safety",
    icon: BatteryCharging,
    body:
      "The system monitors battery levels in real time and only commits to a cleaning distance it can complete safely, ensuring the robot returns to its docking station without stopping midway on the tracker row.",
  },
  {
    title: "Sealed IP65 Body, Wind-Safe at Dock",
    icon: Sun,
    body:
      "All electrical components and wiring are fully enclosed within the sealed IP65 device body. While docked, the robot is securely locked and can withstand wind speeds of up to 180 km/hr, with operational cleaning permitted up to 40 km/hr wind.",
  },
];

const modelTSpecs = [
  { label: "Cleaning Method", value: "Waterless, Dual-Pass" },
  { label: "Cleaning Material", value: "Microfiber or PBT" },
  { label: "Cleaning Speed", value: "10–15 Metres/Minute" },
  { label: "Maximum Operational Range", value: "Up to 2.2 km" },
  { label: "Recommended Operational Range", value: "1.6 km" },
  { label: "Operation Mode", value: "Automatic" },
  { label: "Battery Technology", value: "Lithium-Ion" },
  { label: "Overall Dimensions", value: "450 mm × 2700 mm" },
  { label: "Operating Weight", value: "25 kg" },
  { label: "Design Life", value: "20 Years" },
  { label: "Corrosion Resistance Class", value: "C3" },
  { label: "IP Protection Rating", value: "IP65" },
  { label: "Wind Resistance (In Operation)", value: "40 km/hr" },
  { label: "Wind Resistance (At Docking Station)", value: "180 km/hr" },
  { label: "Maximum Module Undulation", value: "+20 mm" },
  { label: "Maximum Module Tilt", value: "-52° to +52°" },
  { label: "Maximum East–West Terrain Slope", value: "15°" },
  { label: "Maximum Operating Temperature", value: "90°C" },
  {
    label: "Connectivity (Taypro Console)",
    value: tayproRobotConnectivitySummary,
  },
  { label: "Tracker Compatibility", value: "NEXTracker, Gamechanger and equivalent single-axis trackers" },
];

const modelTSteps = [
  {
    name: "Robot is assigned to a specific tracker array",
    text: "Each Model-T is permanently assigned to a single-axis tracker array and lives at a shadow-free docking station beside the row — no daily transport, no operator handling, no external power.",
  },
  {
    name: "AI scheduler selects the optimal cleaning window",
    text: "The Taypro Console pulls real-time weather data and tracker production schedules to automatically pick the best post-production cleaning window — typically at night or during low-irradiance periods — without disrupting energy generation.",
  },
  {
    name: "Self-deploys onto the tracker row",
    text: "At the scheduled time, Model-T undocks autonomously and moves onto the tracker row. Edge, obstacle and angle-detection sensors continuously map the path and surface undulations ahead of the robot.",
  },
  {
    name: "Dual-pass waterless cleaning across the row",
    text: "Counter-rotating microfiber or UV-stable PBT cleaning heads execute a dual-pass cleaning cycle, lifting over 99% of accumulated dust at 10–15 metres per minute. The flexible body articulates up to ±15° to safely cross inter-table angle deviations on NEXTracker, Gamechanger and equivalent trackers.",
  },
  {
    name: "Battery-aware return to docking station",
    text: "The robot monitors battery levels continuously and only commits to a cleaning distance it can complete safely. At cycle end it returns autonomously to the docking station and locks securely — wind-safe up to 180 km/hr.",
  },
  {
    name: "Recharge and cloud telemetry sync",
    text: `Lithium-ion charging starts automatically. Battery level, charging status, cycle telemetry and overall performance are continuously synced to the Taypro Console over ${tayproRobotConnectivitySummary} for fleet-wide visibility.`,
  },
];

const modelTFaqs = [
  {
    question:
      "What is a Solar Panel Cleaning Robot for Single-Axis Trackers, and how does Model-T work?",
    answer:
      "A solar cleaning robot for single-axis trackers is an autonomous robotic cleaner purpose-built to operate on tracker-based solar power plants — where modules tilt across the day and where rows often have small angle deviations between adjacent tables. Taypro Model-T is permanently assigned to a tracker array; at scheduled cleaning windows it self-deploys, executes a waterless dual-pass cleaning cycle across the row, articulates its body up to ±15° to safely cross inter-table angle deviations, and returns to a shadow-free docking station to recharge — all without human intervention.",
  },
  {
    question:
      "Which tracker manufacturers and platforms is Taypro Model-T compatible with?",
    answer:
      "Model-T is compatible with the leading single-axis tracker platforms used in utility-scale solar, including NEXTracker and Gamechanger. The robot integrates with existing tracker mounting structures without modifications to your modules, torque tubes or tracker hardware. For any non-standard tracker platform, our team will validate compatibility as part of the site assessment.",
  },
  {
    question: "How is Model-T different from Model-A and Model-B?",
    answer:
      "Model-A is a fully autonomous robot for fixed-tilt utility-scale plants. Model-B is a semi-automatic pick-and-place robot for scattered, smaller or rooftop plants. Model-T is the only Taypro robot purpose-built for single-axis tracker plants — it supports module tilts from -52° to +52°, flexes ±15° between tables, and is engineered for NEXTracker / Gamechanger style trackers. All three are waterless, AI-driven and managed from the same Taypro Console portal.",
  },
  {
    question:
      "How many solar modules can Model-T clean on a single charge?",
    answer:
      "Model-T can clean up to 2.2 km of tracker running length — approximately 3,600 solar modules — on a single lithium-ion charge. The recommended sustained operational range is 1.6 km per cycle, ensuring a safe return to the docking station with battery headroom in every cycle.",
  },
  {
    question:
      "Does Model-T require water or external power to clean tracker panels?",
    answer:
      "No. Model-T is 100% waterless — a dual-pass cleaning cycle lifts over 99% of dust using rotating microfiber or UV-stable PBT cleaning heads without any water, detergent or run-off. The docking station is fitted with an integrated lithium-ion charging system and does not require any external power source.",
  },
  {
    question: "Is the Model-T cleaning cycle safe for solar modules and ARC?",
    answer:
      "Yes. Model-T moves along the frame of the solar modules — with binders that distribute load and preserve panel integrity. Every robot is independently tested for micro-crack formation, optical reflectance loss, full electrical parameter evaluation and Anti-Reflective Coating (ARC) preservation under simulated daily cleaning cycles by accredited solar-sector testing laboratories. Model-T is also TÜV NORD certified for IP55 protection.",
  },
  {
    question:
      "How does Model-T handle inter-table angle differences on tracker rows?",
    answer:
      "Tracker rows rarely sit perfectly co-planar across adjacent tables. Model-T's flexible body articulates up to 15° to safely cross these inter-table angle deviations and works in conjunction with Taypro-supplied flexible bridges between tables — ensuring smooth, continuous cleaning across the entire row regardless of small terrain or tracker misalignment.",
  },
  {
    question:
      "How much does the Taypro Model-T Single-Axis Tracker Cleaning Robot cost?",
    answer:
      "Pricing for Model-T depends on the tracker platform, plant size, terrain and the level of integration with your existing SCADA and monitoring stack. Most tracker plant deployments achieve full ROI within 12–18 months through higher generation, eliminated water consumption and removed manual cleaning overhead. Contact our team for a site-specific quote and detailed ROI calculation.",
  },
  {
    question:
      "Does Model-T work in extreme Indian climatic conditions like dust storms, heat and monsoon?",
    answer:
      "Yes. Model-T is engineered for harsh Indian utility-scale tracker field conditions: maximum operating temperature of 90°C, IP65 sealed enclosure, TÜV NORD certified IP55 protection, and field-validated under 12 simulated sandstorm cycles per year at 10 g/m² sand loading. It can clean in winds up to 40 km/hr and locks securely at its docking station up to 180 km/hr.",
  },
  {
    question:
      "How is Model-T monitored and controlled across a large tracker plant?",
    answer:
      `All Model-T robots connect to the Taypro Console using ${tayproRobotConnectivitySummary}. The portal provides a unified interface to schedule cleaning, adjust settings, monitor battery levels, view cycle telemetry, receive weather alerts and roll up performance across hundreds of robots and plants — from any device, anywhere.`,
  },
];

export default function ModelTPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <ProductSchema
        name="Solar Panel Cleaning Robot for Single-Axis Trackers - Model-T"
        description={`Taypro Model-T is an AI- and ML-powered autonomous, waterless Solar Panel Cleaning Robot purpose-built for single-axis tracker installations. Dual-pass dry cleaning removes 99%+ dust per cycle, cleans up to 3,600 modules per charge, flexes ±15° between tables, connects via ${tayproRobotConnectivitySummary}, is compatible with NEXTracker and Gamechanger, supports module tilts from -52° to +52°, TÜV NORD certified.`}
        image={`${siteUrl}/tayprorobots/taypro-modelT-img.png`}
        brand="Taypro"
        sku="MODEL-T"
        offers={{
          price: "Contact for pricing",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
        }}
      />
      <FAQPageSchema faqs={modelTFaqs} />
      <HowToSchema
        name="How does the Taypro Model-T Single-Axis Tracker Solar Panel Cleaning Robot clean tracker plants?"
        description="Step-by-step autonomous cleaning cycle of the Taypro Model-T solar panel cleaning robot for single-axis tracker installations — from AI-scheduled deployment through self-docking and cloud telemetry sync."
        steps={modelTSteps}
        totalTime="PT2H"
        image="/tayprorobots/taypro-modelT-img.png"
      />

      <div className="min-h-screen overflow-x-hidden">
        <HeroSection
          title="Solar Panel Cleaning Robot for Single-Axis Trackers — Model-T"
          subtitle={
            <>
              An AI- and ML-powered, waterless autonomous Solar Panel Cleaning
              Robot purpose-built for single-axis tracker solar farms. Cleans
              up to 3,600 modules per charge,{" "}
              <strong>flexes ±15° between tables</strong>, supports module
              tilts from -52° to +52°, and is compatible with NEXTracker,
              Gamechanger and equivalent trackers.
            </>
          }
          imgSrc="/tayprorobots/taypro-modelT-img.png"
          imgAlt="Taypro Single-Axis Tracker Solar Panel Cleaning Robot Model-T - Autonomous robotic cleaning system for tracking solar panel installations"
          ctaHref="/contact"
          ctaText="Request a quote"
        />

        {/* PRODUCT OVERVIEW / SEO INTRO */}
        <section className="bg-white pt-12 sm:pt-20 pb-4">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Solar Panel Cleaning Robot for Single-Axis Tracker Plants
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl mb-6 leading-tight">
                What is Taypro Model-T?
              </h2>
              <div className="space-y-5 text-gray-600 text-base sm:text-lg leading-relaxed">
                <p>
                  Taypro Model-T is an{" "}
                  <strong>
                    AI- and ML-powered, autonomous Solar Panel Cleaning Robot
                  </strong>{" "}
                  purpose-built for daily cleaning of{" "}
                  <strong>single-axis tracker solar power plants</strong>. The
                  robot removes over <strong>99% of dust in a single
                  automated run</strong>, covering up to{" "}
                  <strong>2.2 km — around 3,600 modules — on a single
                  charge</strong>. Cleaning is best scheduled after energy
                  production hours and is managed end-to-end through the Taypro
                  Console remote monitoring app. Supported fleet links are{" "}
                  <strong>{tayproRobotConnectivitySummary}</strong> — pick the
                  best path per block based on coverage and bandwidth needs.
                </p>
                <p>
                  Compatible with <strong>NEXTracker</strong> and{" "}
                  <strong>Gamechanger</strong> single-axis tracker platforms,
                  Model-T can{" "}
                  <strong>flex its body up to 15°</strong> to accommodate angle
                  deviations between adjacent tracker tables — ensuring safe
                  and reliable movement across panels and inter-table bridges.
                  The robot supports module tilts across the full operational
                  tracker range of <strong>-52° to +52°</strong>.
                </p>
                <p>
                  Model-T operates autonomously using advanced{" "}
                  <strong>
                    edge, obstacle and angle detection
                  </strong>{" "}
                  to move safely across panels without risk of falling. It
                  continuously tracks the path and surface undulations along
                  each row, adjusting motor performance as needed for
                  consistent cleaning. After each cleaning cycle, Model-T
                  returns to a secure, shadow-free docking station and locks
                  in — wind-safe up to 180 km/hr.
                </p>
                <p>
                  Operating a fixed-tilt utility-scale plant? Choose the
                  fully-autonomous{" "}
                  <Link
                    href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system"
                    className="text-[#A8C117] hover:underline"
                  >
                    Model-A
                  </Link>
                  . Cleaning smaller or scattered plants? Use the
                  semi-automatic pick-and-place{" "}
                  <Link
                    href="/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system"
                    className="text-[#A8C117] hover:underline"
                  >
                    Model-B
                  </Link>
                  .
                </p>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* 360° + Innovation panel — preserved from old design */}
        <section
          className="w-full py-20 bg-white"
          style={{
            background: "url('/tayprobglayout/taypro-semi.png') repeat",
            backgroundSize: "auto",
          }}
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-md font-medium mb-6">
                TAYPRO MODEL-T
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl lg:text-5xl leading-tight max-w-4xl mx-auto">
                Autonomous Waterless Solar Panel Cleaning Robot for Single-Axis Tracker Installations
              </h2>
            </AnimateOnScroll>

            {/* Mobile Layout */}
            <div className="block lg:hidden">
              <AnimateOnScroll animation="fadeInUp" delay={100} className="mb-6">
                <div className="text-center mb-8">
                  <div className="text-[#A8C117] text-xl sm:text-2xl font-medium mb-2">
                    Interactive Product Tour
                  </div>
                  <h3 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl mb-4">
                    360° View of Model-T
                  </h3>
                  <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
                    Drag left or right to rotate and explore our Single-Axis
                    Tracker Solar Panel Cleaning Robot from every angle.
                  </p>
                </div>
                <div className="w-full max-w-2xl mx-auto">
                  <Product360Viewer
                    imagePath="/360-degree-images/Model-T/0001-MT-2000-1224-"
                    imageCount={51}
                    imagePrefix=""
                    imageSuffix=".png"
                    startIndex={100}
                    width={600}
                    height={450}
                    className="mx-auto"
                  />
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll
                animation="fadeInUp"
                delay={200}
                className="bg-[#7da300] p-6"
              >
                <h3 className="text-white text-start text-xl sm:text-2xl mb-4">
                  The Innovation Behind the MODEL-T
                </h3>
                <p className="text-white text-start text-sm sm:text-base leading-relaxed">
                  The Taypro Model-T represents a synergy of cutting-edge
                  technologies meticulously engineered to address the
                  challenges of solar panel maintenance for single-axis tracker
                  installations. Powered by advanced sensors and machine
                  learning capabilities, Model-T delivers truly autonomous
                  operation devoid of any human intervention. Its cloud-based
                  management system enables remote monitoring and control,
                  ensuring optimal performance from anywhere, anytime.
                </p>
              </AnimateOnScroll>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block">
              <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
                <AnimateOnScroll
                  animation="fadeInLeft"
                  delay={100}
                  className="flex-1 flex flex-col"
                >
                  <div className="text-center mb-3">
                    <h3 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl mb-2">
                      360° View of Model-T
                    </h3>
                    <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mb-4">
                      Drag left or right to rotate and explore our Single-Axis
                      Tracker Solar Panel Cleaning Robot.
                    </p>
                  </div>
                  <div className="w-full max-w-2xl">
                    <Product360Viewer
                      imagePath="/360-degree-images/Model-T/0001-MT-2000-1224-"
                      imageCount={51}
                      imagePrefix=""
                      imageSuffix=".png"
                      startIndex={100}
                      width={700}
                      height={525}
                      className="mx-auto"
                    />
                  </div>
                </AnimateOnScroll>

                <AnimateOnScroll
                  animation="fadeInRight"
                  delay={200}
                  className="flex-1 bg-[#7da300] p-6 max-w-lg h-fit self-center"
                >
                  <h3 className="text-white text-start text-2xl mb-4">
                    The Innovation Behind the MODEL-T
                  </h3>
                  <p className="text-white text-start text-md leading-relaxed">
                    The Taypro Model-T represents a synergy of cutting-edge
                    technologies meticulously engineered to address the
                    challenges of solar panel maintenance for single-axis
                    tracker installations. Powered by advanced sensors and
                    machine learning capabilities, Model-T delivers truly
                    autonomous operation devoid of any human intervention. Its
                    cloud-based management system enables remote monitoring and
                    control, ensuring optimal performance from anywhere,
                    anytime.
                  </p>
                </AnimateOnScroll>
              </div>
            </div>
          </Container>
        </section>

        {/* HOW DOES MODEL-T WORK */}
        <section className="w-full bg-white py-20">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Step-by-Step Autonomous Cleaning Cycle
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                How Does Model-T Clean Single-Axis Tracker Plants?
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                Model-T executes a fully autonomous cleaning cycle from
                AI-scheduled deployment through self-docking and cloud
                telemetry sync — without any operator on site.
              </p>
            </AnimateOnScroll>

            <ol className="space-y-6">
              {modelTSteps.map((step, idx) => (
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
                Why Choose Taypro Model-T
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                Engineered for Tracker-Based Solar Farms
              </h2>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {modelTUsps.map((usp) => {
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
                Inside the Model-T Tracker Cleaning Robot
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                From flexible bridge articulation to weather-aware AI
                scheduling, every Model-T sub-system is engineered for the
                realities of single-axis tracker O&amp;M at utility scale.
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
              {modelTFeatures.map((f) => {
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

        {/* TRUST STATS */}
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
              {[
                { value: "5 GW+", label: "Robot Capacity Deployed" },
                { value: "100+", label: "Plant Installations" },
                { value: "4 Billion+", label: "Litres of Water Saved" },
                { value: "500+", label: "Robots Manufactured / Month" },
              ].map((stat) => (
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

        {/* SERVICE & MAINTENANCE */}
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
                Every Model-T deployment is backed by a structured service
                model designed to keep your tracker-plant cleaning fleet
                running at peak uptime across India.
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
                    "Taypro provides immediate remote diagnostics and troubleshooting upon incident notification — most tracker-plant issues are resolved without a physical site visit.",
                },
                {
                  icon: Headset,
                  title: "72-Hour On-Site Intervention SLA",
                  body:
                    "When on-site work is required, Taypro guarantees technical intervention within 72 hours of breakdown, available pan-India.",
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
              Schedule Online Demo For Single-Axis Tracker <br /> Solar Panel
              Cleaning Robots
            </>
          }
        />

        {/* SPECIFICATIONS */}
        <section
          id="model-t-specs"
          className="w-full bg-white pt-20 pb-10 scroll-mt-24"
        >
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="font-semibold text-[#052638] text-center text-3xl sm:text-5xl md:text-6xl mb-12 sm:mb-15"
            >
              <h2>
                Solar Panel Cleaning Robot for Single-Axis Trackers <br />
                Model-T Specifications
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
                  {modelTSpecs.map((row) => (
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

        {/* ROBOTIC vs MANUAL TRACKER CLEANING */}
        <section className="w-full bg-[#f4f1e9] py-20">
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="text-center mb-10 sm:mb-14"
            >
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Robotic vs Manual Tracker Cleaning
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                Why Robotic Cleaning Is Essential for Single-Axis Tracker Plants
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                Tracker plants compound every challenge of manual cleaning —
                moving modules, larger row lengths and tighter inter-row
                spacing. Robotic cleaning isn&rsquo;t a premium choice for
                trackers; it&rsquo;s the only way to economically sustain peak
                Performance Ratio.
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
                      Manual Cleaning of Trackers
                    </th>
                    <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#A8C117]">
                      Taypro Model-T
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[#052638]">
                  {[
                    {
                      criterion: "Cleaning Frequency",
                      manual:
                        "Weekly or fortnightly — limited by tracker production schedule and labour windows",
                      modelT:
                        "Daily autonomous cycles, weather-aware AI scheduling",
                    },
                    {
                      criterion: "Water Consumption",
                      manual:
                        "1.5–3 litres of water per module per wash, plus tanker logistics",
                      modelT:
                        "Zero — fully waterless dual-pass dry cleaning",
                    },
                    {
                      criterion: "Tracker Movement Compatibility",
                      manual:
                        "Tracker must be parked flat, taking arrays offline during the day",
                      modelT:
                        "Cleans post-production hours; supports the full -52° to +52° tilt range",
                    },
                    {
                      criterion: "Inter-Table Angle Tolerance",
                      manual:
                        "Manual crews work around small misalignments slowly and inconsistently",
                      modelT:
                        "Flexes body ±15° to cross inter-table angle deviations safely",
                    },
                    {
                      criterion: "Cleaning Quality",
                      manual: "Inconsistent, operator-dependent",
                      modelT:
                        "99%+ dust removal per dual-pass cycle, every cleaning run",
                    },
                    {
                      criterion: "Labour & Safety",
                      manual:
                        "Large crews; tracker-row safety risk; uneven ground access risk",
                      modelT:
                        "Zero manual intervention — runs autonomously after install",
                    },
                    {
                      criterion: "Performance Ratio Impact",
                      manual:
                        "Soiling losses of 5–25% accumulate between washes",
                      modelT:
                        "Daily cleaning sustains peak PR, lifting plant yield 4–8%",
                    },
                    {
                      criterion: "Total Cost of Ownership",
                      manual:
                        "Recurring water, labour, tanker, downtime and tracker-parking costs",
                      modelT:
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
                        {row.modelT}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Container>
        </section>

        {/* MODEL-T vs MODEL-A COMPARISON */}
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
                Model-T vs Model-A: Which Robot Suits Your Solar Plant?
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                Both robots are fully autonomous and waterless, both run on
                the same Taypro Console. The choice is dictated by your
                mounting structure — tracker vs fixed-tilt.
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
                      Model-T (Tracker)
                    </th>
                    <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#052638]">
                      Model-A (Fixed-Tilt)
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[#052638]">
                  {[
                    {
                      criterion: "Mounting Structure",
                      modelT:
                        "Single-axis trackers (NEXTracker, Gamechanger and equivalent)",
                      modelA: "Fixed-tilt and seasonal-tilt utility-scale plants",
                    },
                    {
                      criterion: "Module Tilt Range",
                      modelT: "-52° to +52° (full tracker range)",
                      modelA: "Designed for fixed-tilt and seasonal-tilt range",
                    },
                    {
                      criterion: "Inter-Table Flex",
                      modelT: "±15° body articulation between adjacent tables",
                      modelA: "Not required — fixed-tilt rows are co-planar",
                    },
                    {
                      criterion: "Cleaning Mechanism",
                      modelT: "Waterless dual-pass — microfiber or PBT brush",
                      modelA: "Waterless dual-pass — self-cleaning microfiber drum",
                    },
                    {
                      criterion: "Range Per Charge",
                      modelT: "Up to 2.2 km / ~3,600 modules",
                      modelA: "Up to 3,600 modules per charge",
                    },
                    {
                      criterion: "Operating Weight",
                      modelT: "25 kg (most compact)",
                      modelA: "Heavier — designed for fixed-tilt utility-scale",
                    },
                    {
                      criterion: "Cleaning Mode",
                      modelT: "Fully autonomous, AI-scheduled",
                      modelA: "Fully autonomous, AI-scheduled",
                    },
                    {
                      criterion: "Cloud Monitoring",
                      modelT: `Taypro Console via ${tayproRobotConnectivitySummary}`,
                      modelA: `Taypro Console via ${tayproRobotConnectivitySummary}`,
                    },
                  ].map((row) => (
                    <tr key={row.criterion}>
                      <td className="py-3 px-4 sm:px-6 border-t text-base font-medium align-top">
                        {row.criterion}
                      </td>
                      <td className="py-3 px-4 sm:px-6 border-t text-base align-top">
                        {row.modelT}
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
                Cleaning smaller or scattered plants? Look at the
                semi-automatic{" "}
                <Link
                  href="/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system"
                  className="text-[#A8C117] hover:underline"
                >
                  Model-B
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

        {/* BUILT FOR INDIAN TRACKER PLANTS */}
        <section className="w-full bg-[#052638] py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Engineered for Indian Conditions
              </div>
              <h2 className="text-white font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                Built for Indian Single-Axis Tracker Plants
              </h2>
              <p className="text-white/80 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                Rajasthan dust storms, Gujarat heat, Karnataka humidity and
                Tamil Nadu monsoons — Taypro Model-T is engineered, tested and
                deployed for the realities of large Indian tracker O&amp;M,
                not generic Western field conditions.
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              {[
                {
                  title: "Designed for High-Soiling Tracker Regions",
                  body:
                    "Daily autonomous cleaning is the only economical way to neutralise 8–25% soiling losses on tracker plants in Rajasthan, Gujarat, Madhya Pradesh and Maharashtra — exactly where most NEXTracker and Gamechanger installations sit.",
                },
                {
                  title: "Temperature & Humidity Tolerance",
                  body:
                    "Validated for operating temperatures up to 90°C and TÜV NORD certified for damp-heat and dry-heat performance — proven across Indian summer, monsoon and post-monsoon cycles.",
                },
                {
                  title: "Waterless — Critical for Water-Scarce Districts",
                  body:
                    "Many tracker plants are in water-stressed districts where water allocations for module washing are tightening. Model-T removes water from your O&M plan entirely, freeing tanker logistics for higher-priority site needs.",
                },
                {
                  title: "Pan-India Service Network",
                  body:
                    "On-site technical intervention within 72 hours of breakdown, anywhere in India, with immediate remote diagnostics from the Taypro Console — the fastest robotic-cleaning SLA in the country for tracker plants.",
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
                  href="/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system"
                  className="text-[#A8C117] hover:underline"
                >
                  semi-automatic Model-B robot
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

        <EnergyResourceCard />

        <ProjectsCard showHeader={true} headerText="" />

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
              Common questions about the Taypro Model-T Solar Panel Cleaning
              Robot for single-axis tracker installations.
            </p>
            {modelTFaqs.map((faq, idx) => (
              <div
                key={faq.question}
                className="border-b border-gray-200 py-5"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenIndex(openIndex === idx ? null : idx)
                  }
                  className="w-full flex justify-between items-start text-left"
                  aria-expanded={openIndex === idx}
                >
                  <h3 className="text-[#052638] font-medium text-lg sm:text-xl pr-6">
                    {faq.question}
                  </h3>
                  <span className="text-[#A8C117] text-2xl leading-none shrink-0">
                    {openIndex === idx ? "−" : "+"}
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                    openIndex === idx ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
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

        <ClientsCard />

        <ModelCards title="Looking for more solutions?" cards={modelTCards} />

        <RequestEstimateForm />
      </div>
    </>
  );
}
