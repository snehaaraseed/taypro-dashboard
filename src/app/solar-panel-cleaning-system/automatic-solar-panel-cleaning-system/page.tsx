import Image from "next/image";
import Link from "next/link";
import {
  Droplet,
  Dumbbell,
  LineChart,
  RotateCcw,
  Hand,
  Cloud,
  Brain,
  CheckCheck,
} from "lucide-react";
import {
  faqs,
  modelCards,
  tayproRobotConnectivitySummary,
  tayproTrustedByStatsStrip,
} from "@/app/data";
import { ShieldCheck, Wrench, Headset, Wifi, BatteryCharging, Sun } from "lucide-react";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import CallbackCard from "@/app/components/CallbackCard";
import ProjectsCardServer from "@/app/components/ProjectsCardServer";
import ModelCards from "@/app/components/ModelCards";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import ROITayproCalculator from "@/app/components/ROICalculator";
import FAQAccordion from "@/app/components/FAQAccordion";
import OpenLeadModalButton from "@/app/components/OpenLeadModalButton";
import {
  ProductSchema,
  FAQPageSchema,
  HowToSchema,
} from "@/app/components/StructuredData";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import Product360Viewer from "@/app/components/Product360Viewer";
import { Container } from "@/app/components/Container";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

const modelASpecificFaqs = [
  {
    question:
      "How much does an Automatic Solar Panel Cleaning Robot like Model-A cost?",
    answer:
      "Pricing for the Taypro Model-A Automatic Solar Panel Cleaning Robot depends on plant size, panel layout, terrain and the level of integration with your existing monitoring stack. For most utility-scale projects, the robotic cleaning investment pays back inside 12–18 months through higher generation, lower water consumption and reduced manual labour costs. Request a quote from our team to receive a site-specific cost estimate and a detailed ROI calculation.",
  },
  {
    question:
      "What is the ROI of installing an Automatic Solar Panel Cleaning Robot?",
    answer:
      "Robotic dry cleaning typically lifts solar plant performance ratio (PR) by 4–8% on dusty sites by maintaining higher module transmissivity day-on-day. Combined with the elimination of water tankers, manual labour and unsafe night-shift cleaning, most Taypro Model-A deployments achieve full ROI within 12–18 months and continue to compound returns through the 20-year design life of the robot.",
  },
  {
    question:
      "What is the difference between Model-A, Model-B and Model-T?",
    answer:
      "Model-A is a fully autonomous Solar Panel Cleaning Robot for utility-scale fixed-tilt and seasonal-tilt installations. Model-B is a semi-automatic, pick-and-place portable robot for scattered or smaller plants. Model-T is purpose-built for single-axis tracker installations with a flexible 360° rotational bridge. All three are waterless, AI-driven, and managed from the same Taypro Console portal.",
  },
  {
    question: "Is robotic solar panel cleaning safe for the modules?",
    answer:
      "Yes. Taypro Model-A moves only along the module frame so no load is ever applied to the glass or solar cells. The rotating microfiber drum is non-abrasive, and every robot is independently tested for micro-crack formation, optical reflectance loss and Anti-Reflective Coating (ARC) preservation under simulated daily cleaning cycles by accredited solar-sector testing laboratories.",
  },
  {
    question: "How often should solar panels be cleaned with Model-A?",
    answer:
      "For most Indian utility-scale plants, a daily automated cleaning cycle delivers the best performance-ratio outcome — Model-A is designed to run every night or post-production-hours without consuming water or manpower. Sites in extremely dusty regions or near construction zones may schedule additional cycles, while sites with frequent rainfall can dynamically reduce cycles via the weather-aware scheduler in the Taypro Console.",
  },
  {
    question:
      "Does Taypro Model-A work in Indian monsoon, summer heat and dust-storm conditions?",
    answer:
      "Yes. Model-A is engineered for harsh Indian utility-scale conditions: operating temperatures up to 90°C, IP65 sealed enclosure, TÜV NORD-certified IP55 protection, and field-validated under simulated sandstorm cycles of 10 g/m² per event for 12 events per year. The robot self-docks and locks securely at wind gusts of up to 180 km/hr and pauses cleaning at unsafe wind speeds in operation.",
  },
  {
    question:
      "Can Model-A be retrofitted to existing solar plants without modifying the panels?",
    answer:
      "Yes. Model-A requires no additional railings, no modification to the existing solar module mounting structure, and no external power supply. Each robot is assigned to a specific array, runs on its own lithium-ion battery and self-charging docking station, and can be deployed across different panel inclinations and seasonal tilts with minimal site disruption.",
  },
];

const modelAHowToSteps = [
  {
    name: "Assign each Automatic Solar Panel Cleaning Robot to a dedicated array",
    text: "Each Taypro Model-A unit is permanently assigned to a specific solar array and paired with a shadow-free docking station beside the row. The integrated lithium-ion charging system requires no external power connection — the robot is self-contained for daily autonomous operation.",
  },
  {
    name: "Schedule cleaning from the Taypro Console with AI- and ML-driven logic",
    text: "Operators use the Taypro Console remote monitoring app to schedule cleaning cycles outside energy production hours. AI- and ML-driven scheduling combines real-time weather data with plant performance signals to optimise frequency, skip unnecessary runs during rain, and push alerts for critical conditions.",
  },
  {
    name: "Robot self-deploys onto the module row",
    text: "At the scheduled time, the Automatic Solar Panel Cleaning Robot undocks autonomously and moves onto the solar panel row along the module frame. Advanced edge and obstacle detection continuously map the path ahead so the robot never applies load to the glass or cells.",
  },
  {
    name: "Dual-pass waterless cleaning with a self-cleaning microfiber drum",
    text: "A rotating, self-cleaning microfiber drum executes a dual-pass dry cleaning cycle that removes over 99% of accumulated dust per automated run at 10–15 metres per minute — with zero water, detergent or manual labour.",
  },
  {
    name: "Battery-aware return to the docking station",
    text: "Real-time battery monitoring ensures the Automatic Solar Panel Cleaning Robot only commits to a distance it can complete safely, then autonomously returns to the docking station and locks securely — rated for wind gusts up to 180 km/hr while docked.",
  },
  {
    name: "Sync telemetry and fleet health to the cloud",
    text: `After each cycle, battery level, charging status, cycle telemetry and overall fleet performance are synced to the Taypro Console over ${tayproRobotConnectivitySummary} — pick the link that best fits each site — for audit-ready reporting across every deployed Automatic Solar Panel Cleaning Robot.`,
  },
];

const breadcrumbs = [
  { name: "Home", href: "/" },
  {
    name: "Solar Panel Cleaning Robots",
    href: "/solar-panel-cleaning-system",
  },
  {
    name: "Automatic Solar Panel Cleaning Robot",
    href: "",
  },
];

export default function AutomaticSolarPanelCleaningRobot() {
  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <ProductSchema
        name="Automatic Solar Panel Cleaning Robot — Model-A (Taypro)"
        description={`Taypro Model-A is a fully autonomous Automatic Solar Panel Cleaning Robot for utility-scale solar power plants. Waterless AI- and ML-driven dual-pass dry cleaning removes over 99% of dust per cycle, cleans up to 3,600 modules on a single charge, connects to Taypro Console via ${tayproRobotConnectivitySummary}, and is field-validated and TÜV NORD certified.`}
        image={`${siteUrl}/tayproasset/taypro-robotImage.png`}
        brand="Taypro"
        sku="MODEL-A"
        offers={{
          price: "Contact for pricing",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
        }}
      />
      <FAQPageSchema faqs={[...faqs, ...modelASpecificFaqs]} />
      <HowToSchema
        name="How an Automatic Solar Panel Cleaning Robot cleans a utility-scale solar plant (Taypro Model-A)"
        description="Step-by-step autonomous cleaning cycle of the Taypro Model-A Automatic Solar Panel Cleaning Robot — from array assignment and AI scheduling through dual-pass waterless cleaning, self-docking, and cloud telemetry."
        steps={modelAHowToSteps}
        totalTime="PT2H"
        image="/tayproasset/taypro-robotImage.png"
      />
      <div className="min-h-screen">
        <section className="bg-white">
          <Container className="py-12 sm:py-16">
            <div className="min-h-[600px] flex flex-col lg:flex-row relative overflow-hidden">
          {/* LEFT - Content */}
          <AnimateOnScroll
            animation="fadeInLeft"
                className="bg-[#052638] w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 py-12 sm:py-16"
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold text-white mb-6 leading-tight">
                  Automatic Solar Panel Cleaning Robot — <br />
                  Model-A by Taypro
            </h1>
                <div className="text-base sm:text-xl text-white leading-relaxed max-w-xl mb-8 sm:mb-9">
                  The Taypro Model-A is an{" "}
                  <strong>Automatic Solar Panel Cleaning Robot</strong> for
                  utility-scale solar power plants: autonomous, waterless
                  dual-pass cleaning, AI- and ML-driven scheduling, up to 3,600
                  modules per charge, with fleet connectivity via{" "}
                  {tayproRobotConnectivitySummary}, and a TÜV NORD–validated
                  build for maximum uptime.
            </div>
                <OpenLeadModalButton
                  topic="Model-A quote"
                  title="Request a Model-A quote"
                  subtitle="Tell us about your plant and our team will follow up with Model-A sizing, configuration, and commercial options."
                  className="bg-[#A8C117] inline-block w-full sm:w-auto sm:min-w-[240px] px-8 sm:px-12 py-4 sm:py-5 text-[#052638] font-medium text-base sm:text-xl text-center transition hover:bg-[#b3cf3d]"
            >
              Request a quote
                </OpenLeadModalButton>
          </AnimateOnScroll>
          {/* RIGHT - IMAGE */}
          <AnimateOnScroll
            animation="fadeInRight"
            delay={100}
                className="relative w-full lg:w-1/2 min-h-[240px] sm:min-h-[360px] mt-10 lg:mt-0"
          >
            <Image
              alt="Taypro Automatic Solar Panel Cleaning Robot Model-A cleaning solar panels at utility-scale solar farm"
              src="/tayprosolarpanel/solar-panel.jpg"
              title="Automatic Solar Panel Cleaning Robot Model-A by Taypro"
              fill
              className="object-contain"
              priority
            />
              </AnimateOnScroll>
            </div>
          </Container>
        </section>

        {/* Product overview / SEO intro */}
        <section className="bg-white pt-12 sm:pt-20 pb-4">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Automatic Solar Panel Cleaning Robot for Utility-Scale Plants
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl mb-6 leading-tight">
                What is the Taypro Model-A Automatic Solar Panel Cleaning Robot?
              </h2>
              <div className="space-y-5 text-gray-600 text-base sm:text-lg leading-relaxed">
                <p>
                  The <strong>Automatic Solar Panel Cleaning Robot</strong>{" "}
                  category describes fully autonomous, waterless robots that
                  clean solar modules without tankers or night crews. Taypro
                  Model-A is a fully autonomous unit engineered for reliable
                  daily cleaning of utility-scale solar power plants. A single
                  automated run removes over{" "}
                  <strong>99% of dust</strong> from the module surface using a
                  rotating, self-cleaning microfiber drum, driving consistent
                  performance ratio gains across the plant.
                </p>
                <p>
                  On a single charge, Model-A cleans up to{" "}
                  <strong>2.2 km of running length — approximately 3,600
                  solar modules</strong>. Cleaning cycles are best scheduled
                  outside energy production hours and can be programmed
                  remotely, ensuring zero impact on plant generation.
                </p>
                <p>
                  Advanced edge and obstacle detection allow Model-A to traverse
                  panels safely without risk of falling, while continuous
                  surface-undulation tracking adjusts motor performance row-by-row
                  for consistent cleaning quality. Real-time battery monitoring
                  guarantees the robot only covers what it can complete and
                  returns safely to its docking station — never stranded
                  mid-array. Lightweight bridges enable seamless movement from
                  one table to the next, keeping coverage uninterrupted across
                  the entire site.
                </p>
                <p>
                  Further reading:{" "}
                  <Link
                    href="/blog/how-does-a-solar-panel-cleaning-robot-work-"
                    className="text-[#A8C117] hover:underline"
                  >
                    how an automatic cleaning robot works on modules
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/blog/benefits-of-using-solar-panel-cleaning-robot-in-a-solar-plant"
                    className="text-[#A8C117] hover:underline"
                  >
                    benefits of robotic cleaning at utility scale
                  </Link>
                  .
                </p>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* How an Automatic Solar Panel Cleaning Robot works — HowTo + SEO */}
        <section className="bg-[#f4f1e9] py-16 sm:py-20">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Autonomous Cleaning Cycle
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                How Does an Automatic Solar Panel Cleaning Robot Work?
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                Model-A runs end-to-end without operators on the row. Below is
                the same workflow encoded in our HowTo structured data for
                search engines — and the daily reality at every deployed plant.
              </p>
            </AnimateOnScroll>

            <ol className="space-y-6">
              {modelAHowToSteps.map((step, idx) => (
                <AnimateOnScroll
                  key={step.name}
                  animation="fadeInUp"
                  className="flex gap-5 bg-white p-6 rounded-lg shadow-sm"
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

        {/* 360-Degree Product Viewer Section */}
        <section className="bg-gradient-to-b from-white to-gray-50 py-20">
          <Container>
          <AnimateOnScroll animation="fadeInUp" className="text-center mb-8">
            <div className="text-[#A8C117] text-xl sm:text-2xl font-medium mb-2">
              Interactive Product Tour
            </div>
            <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl mb-4">
              360° View of Model-A
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
              Drag left or right to rotate and explore our Automatic Solar Panel
              Cleaning Robot from every angle
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll
            animation="fadeInUp"
            delay={100}
            className="flex justify-center"
          >
            <div className="w-full max-w-4xl">
              <Product360Viewer
                imagePath="/360-degree-images/Model-A/MODEL-A-"
                imageCount={61}
                imagePrefix=""
                imageSuffix=".png"
                startIndex={100}
                width={800}
                height={600}
                className="mx-auto"
                productLabel="Taypro Model-A — Automatic Solar Panel Cleaning Robot"
              />
            </div>
          </AnimateOnScroll>
          </Container>
        </section>

        <section className="bg-white py-20 sm:pt-32">
          <Container>
          <AnimateOnScroll
            animation="fadeInUp"
            className="text-center text-[#A8C117] text-2xl font-medium mb-2"
          >
            <div>MODEL A – Automatic Solar Panel Cleaning Robot</div>
          </AnimateOnScroll>
          <AnimateOnScroll
            animation="fadeInUp"
            delay={100}
              className="text-center text-[#052638] font-semibold text-5xl sm:text-6xl mb-14"
          >
              <h2>USPs</h2>
          </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-6 justify-items-center sm:justify-items-start">
              {[
                { Icon: Droplet, label: "Superior Cleaning Efficiency" },
                { Icon: Dumbbell, label: "Robust & Durable Design" },
                { Icon: LineChart, label: "Greater Coverage" },
                { Icon: RotateCcw, label: "High-Speed Cleaning" },
                { Icon: Hand, label: "Advanced Edge & Obstacle Detection" },
                {
                  Icon: Cloud,
                  label: "Multi-Link Remote Monitoring (LTE / Wi-Fi / RF mesh / LoRa)",
                },
                { Icon: Brain, label: "Self-Cleaning Technology" },
                { Icon: CheckCheck, label: "Certified & Tested for Harsh Conditions" },
              ].map(({ Icon, label }, idx) => (
            <AnimateOnScroll
                  key={label}
              animation="fadeInUp"
                  delay={150 + idx * 50}
                  className="flex items-center gap-4 w-full max-w-xs sm:max-w-none"
            >
                  <span className="flex items-center justify-center w-15 h-15 shrink-0 border-2 border-[#6ad10b] rounded-xl">
                    <Icon size={40} className="text-[#052638]" />
              </span>
              <span className="text-[#052638] text-xl font-semibold">
                    {label}
              </span>
            </AnimateOnScroll>
              ))}
          </div>
          </Container>
        </section>

        <section className="pt-24 pb-5 bg-white">
          <Container>
          <AnimateOnScroll animation="fadeInUp" className="text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-6xl font-semibold">
              Automatic Solar Panel Cleaning Robot Cost <br /> & ROI Calculation
            </h2>
            <div className="text-gray-600 my-6 text-base sm:text-xl">
              Calculate How Effective A{" "}
              <span style={{ color: "#A8C117" }}>
                Solar Panel Cleaning Robot
              </span>{" "}
              Can Be And How Much It Can Save.
            </div>
          </AnimateOnScroll>
          </Container>
          <ROITayproCalculator />
        </section>

        <section className="pt-10 pb-1 bg-white">
          <Container>
          <AnimateOnScroll animation="fadeInUp" className="text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-6xl font-semibold">
              Projects with MODEL A – Automatic <br /> Solar Panel Cleaning
              Robot
              <br />
              Installations
            </h2>
              <div className="text-gray-600 my-6 text-base sm:text-xl italic">
              We have ensured quick installation and dedicated technical support
              with a promise of same-day breakdown resolution.
            </div>
          </AnimateOnScroll>
          </Container>
        </section>

        <ProjectsCardServer useFileProjects showHeader headerText="Our Most Recent Projects" />

        {/* Trust stats strip */}
        <section className="w-full bg-[#052638] py-16 sm:py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Why Solar Plants Choose Taypro
              </div>
              <h2 className="text-white font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                Trusted by India&rsquo;s Leading Solar Operators
              </h2>
              <p className="text-white/80 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                Over the past decade, Taypro has driven performance-ratio
                improvement across more than 5,000 MW of solar power plant
                capacity for leading independent power producers and
                utility-scale plants across India.
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              {[...tayproTrustedByStatsStrip].map((stat, idx) => (
                <AnimateOnScroll
                  key={stat.label}
                  animation="fadeInUp"
                  delay={100 + idx * 80}
                  className="text-center"
                >
                  <div className="text-[#A8C117] font-semibold text-3xl sm:text-4xl md:text-5xl mb-2">
                    {stat.value}
                  </div>
                  <div className="text-white/90 text-sm sm:text-base">
                    {stat.label}
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        {/* Service & Maintenance promise */}
        <section className="w-full bg-white py-16 sm:py-24">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Operating Confidence, Every Day
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                Service & Maintenance Promise
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                Every Taypro Model-A deployment is backed by a planned
                maintenance programme and a guaranteed response SLA so your
                plant stays at peak performance ratio.
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  Icon: Wrench,
                  title: "Scheduled Preventive Maintenance",
                  body:
                    "All preventive and corrective maintenance activities are executed on a pre-scheduled basis, designed to eliminate unplanned downtime and sustain peak operational performance throughout the robot's lifecycle.",
                },
                {
                  Icon: Headset,
                  title: "Immediate Remote Diagnostics",
                  body:
                    "On incident notification, Taypro engineers begin remote diagnostics and troubleshooting immediately via the Taypro Console portal — most issues are resolved over-the-air with no site visit required.",
                },
                {
                  Icon: BatteryCharging,
                  title: "Same-Day On-Site Intervention",
                  body:
                    "When physical attention is needed, Taypro targets same-day on-site breakdown resolution — available pan-India through Taypro's field service network, with immediate remote diagnostics from Taypro Console.",
                },
              ].map(({ Icon, title, body }, idx) => (
                <AnimateOnScroll
                  key={title}
                  animation="fadeInUp"
                  delay={150 + idx * 100}
                  className="bg-[#f4f1e9] p-6 sm:p-8 rounded-lg h-full"
                >
                  <span className="flex items-center justify-center w-12 h-12 bg-white rounded-lg mb-4">
                    <Icon size={28} className="text-[#052638]" />
                  </span>
                  <h3 className="text-[#052638] font-semibold text-xl mb-2">
                    {title}
                  </h3>
                  <p className="text-gray-600 text-base leading-relaxed">{body}</p>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        <CallbackCard
          headerText={
            <>
              Schedule Online Demo For Automatic Solar <br /> Panel Cleaning
              Robots
            </>
          }
        />

        <section className="pt-24 pb-5 bg-white">
          <Container>
            <AnimateOnScroll animation="fadeInUp">
              <h2 className="text-2xl sm:text-3xl lg:text-6xl font-semibold">
                Features of Taypro&rsquo;s Automatic Solar Panel <br /> Cleaning
                Robots: Model-A
              </h2>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fadeInUp" delay={100}>
              <h3 className="mt-8 sm:mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
                AI-Enabled Waterless Dual-Pass Cleaning
              </h3>
            </AnimateOnScroll>

            <div className="text-gray-600 my-6 text-base sm:text-xl">
              Model-A uses AI- and ML-driven cleaning logic with a patented
              dual-pass mechanism — the first pass loosens dry dust while the
              second sweeps away sticky residue. The result: over{" "}
              <strong>99% dust removal in a single automated run</strong>,
              without a drop of water and without abrasive contact on the
              cells or glass.
            </div>

            <AnimateOnScroll animation="fadeInUp" delay={150}>
              <h3 className="mt-8 sm:mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
                Self-Cleaning Microfiber Drum
              </h3>
            </AnimateOnScroll>

            <div className="text-gray-600 my-6 text-base sm:text-xl">
              The rotating microfiber cloth is engineered to self-clean as it
              operates, maintaining peak cleaning efficiency across thousands
              of modules and extending consumable life. The robot moves along
              the module frame so no load is ever applied to the glass or
              solar cells, preserving panel longevity and power output.
            </div>

            <AnimateOnScroll animation="fadeInUp" delay={200}>
              <h3 className="mt-8 sm:mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
                Extended Cleaning Range
              </h3>
            </AnimateOnScroll>

            <div className="text-gray-600 my-6 text-base sm:text-xl">
              Model-A cleans up to <strong>2.2 km of running length</strong> —
              roughly <strong>3,600 modules</strong> — on a single charge, at
              cleaning speeds of 10–15 m/min. With its lithium-ion battery and
              integrated charging system, each robot is assigned to a specific
              array and is deployed quickly without additional railings,
              across a wide range of panel inclinations and seasonal tilts.
            </div>

            <AnimateOnScroll animation="fadeInUp" delay={250}>
              <h3 className="mt-8 sm:mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
                Battery-Aware Autonomy
              </h3>
            </AnimateOnScroll>

            <div className="text-gray-600 my-6 text-base sm:text-xl">
              Model-A monitors battery level in real time and only commits to
              a cleaning run it can complete, safely returning to its docking
              station every cycle. The robot stays securely locked when docked
              and is designed to withstand wind gusts of up to{" "}
              <strong>180 km/hr</strong> at the docking position.
            </div>

            <AnimateOnScroll animation="fadeInUp" delay={300}>
              <h3 className="mt-8 sm:mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
                Smart Weather Optimization
              </h3>
            </AnimateOnScroll>

            <div className="text-gray-600 my-6 text-base sm:text-xl">
              The cleaning schedule is continuously optimised against
              real-time weather data — wind speed, rain probability, humidity
              and dust events — so cycles run when they will be most
              effective. Critical-condition alerts are pushed to the remote
              portal automatically so plant operators never need to react
              manually.
            </div>

            <AnimateOnScroll animation="fadeInUp" delay={350}>
              <h3 className="mt-8 sm:mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
                Cloud-Connected Remote Monitoring
              </h3>
            </AnimateOnScroll>

            <div className="text-gray-600 my-6 text-base sm:text-xl">
              Every Model-A robot connects to the Taypro Console using{" "}
              <strong>{tayproRobotConnectivitySummary}</strong>. Deployments
              can use LTE or Wi-Fi for high-bandwidth telemetry, a{" "}
              <strong>hybrid self-healing RF mesh</strong> for resilient
              plant-wide backhaul, or <strong>LoRa / LoRaWAN</strong> where
              low-power, long-range links suit remote blocks. Schedule cleaning
              cycles, adjust operating parameters and track fleet-wide
              performance from any device, with docking-station telemetry
              (battery, charging status, faults) available in real time.
            </div>

            <AnimateOnScroll animation="fadeInUp" delay={400}>
              <h3 className="mt-8 sm:mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
                Edge & Obstacle Detection Technology
              </h3>
            </AnimateOnScroll>

            <div className="text-gray-600 my-6 text-base sm:text-xl">
              High-precision edge-detection sensors map every panel boundary
              and continuously scan for obstacles, eliminating any risk of
              fall. Surface-undulation tracking modulates motor performance
              row-by-row for consistent cleaning quality even on imperfect
              installations.
            </div>

            <AnimateOnScroll animation="fadeInUp" delay={450}>
              <h3 className="mt-8 sm:mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
                Sealed, Field-Hardened Build
              </h3>
            </AnimateOnScroll>

            <div className="text-gray-600 my-6 text-base sm:text-xl">
              All electrical components, wiring harnesses and connectors are
              fully enclosed within a sealed device body, providing robust
              protection against moisture, dust and environmental
              contaminants in harsh utility-scale environments.
          </div>
          </Container>
        </section>

        {/* Certifications & Testing — trust block */}
        <section className="w-full bg-[#f4f1e9] py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Independently Tested & Certified
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                Certifications & Field-Validated Testing
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                Every Taypro Model-A is subjected to rigorous laboratory and
                field validation by accredited solar-sector testing
                laboratories, simulating real plant conditions to guarantee
                long-term reliability.
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  Icon: ShieldCheck,
                  title: "TÜV NORD Certified",
                  body:
                    "Independently tested and certified for IP55 protection and validated for extreme damp-heat and dry-heat performance by TÜV NORD.",
                },
                {
                  Icon: Sun,
                  title: "Sandstorm-Endurance Tested",
                  body:
                    "Validated under simulated outdoor cleaning cycles, including 12 sandstorm events per year at a sand loading of 10 g/m² per cycle.",
                },
                {
                  Icon: CheckCheck,
                  title: "Panel-Safe Cleaning",
                  body:
                    "Testing covers micro-crack analysis, optical reflectance measurements, full electrical parameter evaluation and Anti-Reflective Coating (ARC) preservation.",
                },
              ].map(({ Icon, title, body }, idx) => (
                <AnimateOnScroll
                  key={title}
                  animation="fadeInUp"
                  delay={150 + idx * 100}
                  className="bg-white p-6 sm:p-8 rounded-lg shadow-sm h-full"
                >
                  <span className="flex items-center justify-center w-12 h-12 bg-[#A8C117]/15 rounded-lg mb-4">
                    <Icon size={28} className="text-[#052638]" />
                  </span>
                  <h3 className="text-[#052638] font-semibold text-xl mb-2">
                    {title}
                  </h3>
                  <p className="text-gray-600 text-base leading-relaxed">{body}</p>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        {/* Automatic vs Manual Cleaning comparison */}
        <section className="w-full bg-white pt-24 pb-10">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10 sm:mb-14">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Robotic vs Manual Solar Cleaning
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                Why Choose an Automatic Solar Panel Cleaning Robot Over Manual Cleaning?
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                Manual cleaning crews, water tankers and ad-hoc schedules
                cannot keep up with the daily soiling losses on utility-scale
                solar power plants. An automatic robotic solar cleaning
                solution is no longer a premium — it&rsquo;s a
                performance-ratio essential.
              </p>
            </AnimateOnScroll>

            <div className="overflow-x-auto">
              <table className="w-full text-left border border-gray-200 text-sm sm:text-base">
                <thead>
                  <tr className="bg-[#f4f1e9]">
                    <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#052638]">
                      Criterion
                    </th>
                    <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#052638]">
                      Manual Cleaning
                    </th>
                    <th className="py-4 px-4 sm:px-6 font-semibold text-base md:text-lg text-[#A8C117]">
                      Taypro Model-A
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[#052638]">
                  {[
                    {
                      criterion: "Cleaning Frequency",
                      manual: "Weekly or fortnightly, weather-permitting",
                      modelA:
                        "Daily automated cycles, weather-aware scheduling",
                    },
                    {
                      criterion: "Water Consumption",
                      manual:
                        "High — 1.5 to 3 litres of water per module per wash",
                      modelA: "Zero — fully waterless dual-pass dry cleaning",
                    },
                    {
                      criterion: "Cleaning Quality",
                      manual: "Inconsistent, operator-dependent",
                      modelA:
                        "99%+ dust removal in a single automated run, every time",
                    },
                    {
                      criterion: "Labour & Safety",
                      manual:
                        "High labour cost, panel damage risk, night-shift safety risk",
                      modelA:
                        "Autonomous after-hours operation, no manual intervention",
                    },
                    {
                      criterion: "Performance Ratio Impact",
                      manual: "Soiling losses of 5–25% accumulate between washes",
                      modelA:
                        "Daily cleaning sustains peak PR, lifting plant yield 4–8%",
                    },
                    {
                      criterion: "Panel Safety",
                      manual:
                        "Risk of micro-cracks, ARC abrasion and scratches",
                      modelA:
                        "Robot rides on the module frame — no load on glass or cells",
                    },
                    {
                      criterion: "Monitoring & Reporting",
                      manual: "No telemetry, no cleaning audit trail",
                      modelA:
                        `Taypro Console via ${tayproRobotConnectivitySummary}; full audit trail`,
                    },
                    {
                      criterion: "Total Cost of Ownership",
                      manual:
                        "Recurring water, labour, equipment and downtime costs",
                      modelA:
                        "One-time investment, 12–18 month payback, 20-year design life",
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
                        {row.modelA}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Container>
        </section>

        {/* Built for Indian Utility-Scale Solar Conditions */}
        <section className="w-full bg-[#052638] py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                Engineered for Indian Conditions
              </div>
              <h2 className="text-white font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                Built for Indian Utility-Scale Solar Plants
              </h2>
              <p className="text-white/80 text-base sm:text-lg max-w-3xl mx-auto mt-6">
                Rajasthan dust storms, Gujarat heat, Karnataka humidity and
                Tamil Nadu monsoons — Taypro Model-A is engineered, tested and
                deployed for the realities of large-scale Indian solar O&amp;M,
                not generic Western field conditions.
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              {[
                {
                  title: "High-Soiling Region Performance",
                  body:
                    "Daily robotic cleaning is the only economical way to neutralise the soiling losses (often 8–25%) typical of Indian utility-scale plants in Rajasthan, Gujarat, Madhya Pradesh and Maharashtra.",
                },
                {
                  title: "Temperature & Humidity Tolerance",
                  body:
                    "Validated for operating temperatures up to 90°C and certified by TÜV NORD for damp-heat and dry-heat performance — proven across Indian summer, monsoon and post-monsoon cycles.",
                },
                {
                  title: "Waterless — Even in Water-Scarce States",
                  body:
                    "Many Indian solar farms are in water-stressed districts where allocations for module washing are tightening. Model-A&rsquo;s waterless dual-pass cleaning removes water entirely from your O&amp;M plan and frees water tankers for higher-priority use.",
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
                  href="/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system"
                  className="text-[#A8C117] hover:underline"
                >
                  Semi-Automatic Solar Cleaning Robot (Model-B)
                </Link>
                , the{" "}
                <Link
                  href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers"
                  className="text-[#A8C117] hover:underline"
                >
                  Single-Axis Tracker Cleaning Robot (Model-T)
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

        <section className="w-full bg-white pt-24 pb-10">
          <Container>
          <AnimateOnScroll
            animation="fadeInUp"
            className="font-semibold text-[#052638] text-center text-3xl sm:text-5xl md:text-6xl mb-12 sm:mb-15"
          >
            <h2>
              Automatic Solar Panel Cleaning Robot <br /> Model-A Specifications
            </h2>
          </AnimateOnScroll>
          {/* Specifications Table Container */}
            <div className="w-full bg-white shadow-md overflow-x-auto">
            <table className="w-full text-left border border-gray-300 text-sm sm:text-base">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-4 px-6 font-semibold text-base md:text-xl text-[#052638]">
                    Specification
                  </th>
                  <th className="py-4 px-6 font-semibold text-base md:text-xl text-[#052638]">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    Dimensions
                  </td>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    750 mm × 4800 mm
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    Cleaning Method
                  </td>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    Waterless
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    Cleaning Type
                  </td>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    Dual-Pass Cleaning
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    Cleaning Material
                  </td>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    Microfiber Cloth
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    Cleaning Speed
                  </td>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    10–15 Metres/Minute
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    Max. Running Length
                  </td>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    Up to 2.2 km
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    Recommended Running Length
                  </td>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    1.6 km
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    Wind Speed Resistance at Docking
                  </td>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    180 km/hr
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    Wind Speed Resistance in Operation
                  </td>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    40 km/hr
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    Max. Module Tilt
                  </td>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    45°
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    Max. Operating Temperature
                  </td>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    90°C
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    Max. East-West Slope
                  </td>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    15°
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    Max. Module Undulation
                  </td>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    +20 mm
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    IP Rating
                  </td>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    IP65
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    Corrosion Class
                  </td>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    C3
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    Battery Type
                  </td>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    Lithium-Ion
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    Connectivity (Taypro Console)
                  </td>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    {tayproRobotConnectivitySummary}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    Design Life
                  </td>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    20 Years
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    Weight
                  </td>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    45 Kg
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          </Container>
        </section>

        <section className="pt-24 pb-5 bg-white">
          <Container>
            <AnimateOnScroll animation="fadeInUp">
              <h2 className="text-2xl sm:text-3xl lg:text-6xl font-semibold">
                Advantages of Using Automatic Solar Panel <br /> Cleaning Robots
              </h2>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fadeInUp" delay={100}>
              <h3 className="mt-8 sm:mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
                Increased Energy Efficiency
              </h3>
            </AnimateOnScroll>

            <div className="text-gray-600 my-6 text-base sm:text-xl">
              Automatic solar panel cleaning robots can significantly increase
              the efficiency of solar power plants. By cleaning the dust and
              debris consistently, the overall power generation is improved.
            </div>

            <AnimateOnScroll animation="fadeInUp" delay={200}>
              <h3 className="mt-8 sm:mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
                Waterless Cleaning
              </h3>
            </AnimateOnScroll>

            <div className="text-gray-600 my-6 text-base sm:text-xl">
              Model-A removes up to 99.5% dust and debris without water
              requirement. This makes it a perfect option in the regions where
              there is greater water scarcity.
            </div>

            <AnimateOnScroll animation="fadeInUp" delay={300}>
              <h3 className="mt-8 sm:mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
                Fully Autonomous & Smart Operation
              </h3>
            </AnimateOnScroll>

            <div className="text-gray-600 my-6 text-base sm:text-xl">
              Model-A is a fully autonomous robot with integrated AI-ML
              technology that gives smart operation. There is no human
              intervention required to operate the robots.
            </div>

            <AnimateOnScroll animation="fadeInUp" delay={400}>
              <h3 className="mt-8 sm:mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
                Cost-Effective Solution
              </h3>
            </AnimateOnScroll>

            <div className="text-gray-600 my-6 text-base sm:text-xl">
              Model-A eliminates the recurring labour and operation costs and
              gives maximum return on investment. Its efficient cleaning
              technology ensures long-term savings.
            </div>

            <AnimateOnScroll animation="fadeInUp" delay={500}>
              <h3 className="mt-8 sm:mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
                Safe and Reliable Operation
              </h3>
            </AnimateOnScroll>

            <div className="text-gray-600 my-6 text-base sm:text-xl">
              Model-A built-in advanced high-precision edge detection sensors
              that detect the panel edges. These sensors can detect uneven
              surfaces and other potential hazards.
            </div>
          </Container>
        </section>

        <section className="w-full py-24 bg-[#052638]">
          <Container size="narrow">
            <AnimateOnScroll
              animation="fadeInUp"
              className="text-white font-semibold text-3xl sm:text-5xl text-start mb-16"
            >
              <h2>
                How Long Does It Take to Install the Automated Solar Panel
                Cleaning Robots?
              </h2>
            </AnimateOnScroll>
            <p className="text-white/90 mb-7 text-start text-base sm:text-lg">
              The installation of the Solar Panel Cleaning Robot requires no
              modifications to the existing solar plant layout. The Model-A
              Automated Solar Panel Cleaning Robot is designed to operate
              directly on the panel frame.
            </p>
            <p className="text-white/90 mb-7 text-start text-base sm:text-lg">
              The installation typically takes a few hours to a couple of days
              depending on the size of the solar plant. The solar panel cleaning
              robot installation process involves the placement of a docking
              station, configuration and calibration, and system integration.
            </p>
            <p className="text-white/90 mb-7 text-start text-base sm:text-lg">
              For large-scale solar power plants, the installation may take from
              a few days to a week depending on the complexity of the layout.
              After the installation, the robots operate autonomously and do not
              need any manual intervention. TAYPRO provides complete dedicated
              support and assures the same-day breakdown resolution.
            </p>
            <p className="text-white/90 text-start text-base sm:text-lg">
              TAYPRO Model-A robots offer cost-effective and scalable solutions
              for solar power plants with easy installations and safe
              operations.
            </p>
          </Container>
        </section>

        <section className="w-full pt-24 pb-2 bg-white bg-center">
          <Container size="narrow">
            <AnimateOnScroll
              animation="fadeInUp"
              className="font-semibold text-3xl sm:text-5xl md:text-5xl text-start mb-16"
            >
              <h2>
                What Is the ROI for Installing the Automatic Solar Panel
                Cleaning Robot Model-A?
              </h2>
            </AnimateOnScroll>
            <p className="mb-7 text-start text-base sm:text-lg">
              TAYPRO&rsquo;s Model A Automatic Solar Panel Cleaning Robot
              delivers a high return on investment ROI by significantly
              increasing power generation.
            </p>
            <p className="mb-7 text-start text-base sm:text-lg">
              Also, Model A reduces operational cleaning costs and offers
              long-term financial benefits. The initial investment is quickly
              recovered within one year, making it an effective and sustainable
              investment. You can calculate the ROI on Solar Panel Cleaning
              Robots by using the
              <Link
                href="/solar-panel-cleaning-robot-price-calculator"
                passHref
              >
                <span style={{ color: "#A8C117", cursor: "pointer" }}>
                  ROI Calculator
                </span>
              </Link>
            </p>
          </Container>
        </section>

        <section className="w-full pt-24 pb-5 bg-white bg-center">
          <Container size="narrow">
            <AnimateOnScroll
              animation="fadeInUp"
              className="font-semibold text-3xl sm:text-5xl md:text-5xl text-start mb-16"
            >
              <h2>Inside a Model-A cleaning cycle — step by step</h2>
            </AnimateOnScroll>
            <p className="mb-7 text-start text-base sm:text-lg">
              ⦿ The robot initialises its sensors on the activation and performs
              the system checks connectivity with the central monitoring system
            </p>
            <p className="mb-7 text-start text-base sm:text-lg">
              ⦿ The cleaning schedule is pre-set via a remote monitoring portal
              which enables fully automated operation
            </p>
            <p className="mb-7 text-start text-base sm:text-lg">
              ⦿ The locomotion motor powers the movement and guides the robot
              along the solar panel frames
            </p>
            <p className="mb-7 text-start text-base sm:text-lg">
              ⦿ The cleaning brush motor starts and enables the waterless
              dual-pass cleaning technology with a microfiber cloth
            </p>
            <p className="mb-7 text-start text-base sm:text-lg">
              ⦿ The edge detection sensors continually scan the surroundings
              which prevents the robot from overshooting the panel edges
            </p>
            <p className="mb-7 text-start text-base sm:text-lg">
              ⦿ Users can adjust the cleaning speed and direction from the
              TAYPRO console
            </p>
            <p className="mb-7 text-start text-base sm:text-lg">
              ⦿ Once the cleaning cycle is complete, the robot returns to its
              docking station, where it recharges using solar energy and remains
              idle until the next scheduled cycle.
            </p>
            <p className="mb-7 text-start text-base sm:text-lg">
              ⦿ Advanced fault detection systems continuously analyse the robot
              parameters and if in case of any
            </p>
            <p className="mb-7 text-start text-base sm:text-lg">
              ⦿ The system ensures safe and efficient operations with features
              like obstacle detection, self-cleaning microfiber and adaptive
              navigation.
            </p>
          </Container>
        </section>

        <section className="w-full py-16 bg-white">
          <Container size="narrow">
          <AnimateOnScroll
            animation="fadeInUp"
            className="font-semibold text-center text-[#052638] text-3xl sm:text-5xl md:text-5xl mb-8"
          >
              <h2>FAQs</h2>
          </AnimateOnScroll>
            <FAQAccordion
              faqs={[...faqs, ...modelASpecificFaqs]}
              variant="classic"
            />
          </Container>
        </section>

        <ModelCards title="Looking for more solutions?" cards={modelCards} />

        <RequestEstimateForm />
      </div>
    </>
  );
}
