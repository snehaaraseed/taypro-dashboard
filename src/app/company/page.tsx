"use client";
import Link from "next/link";
import Image from "next/image";
import {
  founders,
  items,
  metrics,
  robots,
  tayproMarketingImpactStats,
  tayproTrustedByStatsStrip,
} from "../data";
import { Linkedin } from "lucide-react";
import CallbackCard from "../components/CallbackCard";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { AnimateOnScroll } from "../components/AnimateOnScroll";
import { Container } from "../components/Container";
import { FAQPageSchema } from "../components/StructuredData";

const partnerSteps = [
  {
    step: "01",
    title: "Understand your plant",
    description:
      "Share layout (fixed tilt, rooftop, or trackers), DC capacity, soiling profile, and whether you prefer CAPEX ownership or Taypro Opex as a managed service.",
  },
  {
    step: "02",
    title: "Technical fit and ROI",
    description:
      "We map Model-A, Model-B, or Model-T plus Console monitoring to your blocks, align on cleaning frequency, and use ROI tools to quantify water and labour savings.",
  },
  {
    step: "03",
    title: "Deploy and commission",
    description:
      "Robots are manufactured in Chakan, Pune and shipped through our warehouse network. Commissioning crews install, train your O&M team, and connect fleets to Taypro Console.",
  },
  {
    step: "04",
    title: "Operate with continuity",
    description:
      "Nationwide spares, predictive maintenance workflows, and same-day breakdown response keep fleets productive. Case studies under Projects document outcomes at utility scale.",
  },
] as const;

const breadcrumbs = [
  { name: "Home", href: "/" },
  {
    name: "About Us",
    href: "",
  },
];

export default function AboutUsPage() {
  const resources = [
    {
      title: "The Complete Guide to Solar Panel Maintenance",
      imgSrc: "/tayproenergyresource/taypro-energy-resource1.webp",
      date: "July 27, 2025",
      href: "/blog/the-complete-guide-to-solar-panel-maintenance",
    },
    {
      title: "New Solar Panel Technologies 2025",
      imgSrc: "/tayproenergyresource/taypro-energy-resource2.webp",
      date: "July 23, 2025",
      href: "/blog/new-solar-panel-technologies-2025",
    },
  ];

  const companyFaqs = [
    {
      question: "What does Taypro manufacture?",
      answer:
        "Taypro Private Limited builds autonomous and semi-automatic solar panel cleaning robots for utility-scale and commercial solar plants in India—including Model-A (autonomous waterless cleaning), Model-B (portable dry cleaning), Model-T for single-axis trackers, Taypro Opex as an operator-led cleaning service, and Taypro Console for fleet monitoring and scheduling.",
    },
    {
      question: "Where is Taypro based and where do you operate?",
      answer:
        "Taypro is headquartered and manufactures from Chakan, Pune, Maharashtra, with a warehouse network across India to support spare parts, commissioning, and same-day breakdown response for deployed robots.",
    },
    {
      question: "Why is waterless robotic cleaning important for solar plants?",
      answer:
        "Water scarcity and logistics make manual or wet washing expensive and inconsistent. Taypro’s patented dual-pass method first clears dry dust, then finishes with microfiber contact—helping plants save millions of litres annually while stabilising performance ratio through repeatable, weather-aware cleaning cycles.",
    },
    {
      question: "How can developers or O&M teams evaluate Taypro?",
      answer:
        "Start with your plant layout (fixed tilt, rooftop, or trackers), capacity, and cleaning goals. Explore the solar panel cleaning system pages for technical specifications, case studies under Projects, or contact Taypro for a site-specific discussion, ROI inputs, and deployment planning.",
    },
    {
      question: "Which Taypro robot fits fixed-tilt vs single-axis tracker plants?",
      answer:
        "Model-A targets autonomous waterless cleaning on fixed and seasonal-tilt arrays. Model-B is portable for scattered blocks. Model-T is engineered for single-axis trackers with a flexible bridge. Many sites combine models by block—our team maps robots to each array during site assessment.",
    },
    {
      question: "Can we buy robots (CAPEX) or use an operator-led service (Opex)?",
      answer:
        "Both. CAPEX customers purchase robots with Taypro commissioning and spare support. Taypro Opex delivers operator-led cleaning without upfront robot capital—useful when you want predictable O&M costs and Taypro accountability for uptime.",
    },
    {
      question: "What role does Taypro Console play after installation?",
      answer:
        "Taypro Console is the cloud dashboard for scheduling cleaning cycles, monitoring robot health, reviewing connectivity, and auditing fleet performance across blocks—helping O&M leads document cleaning history for performance ratio discussions with asset owners.",
    },
  ];

  return (
    <>
      <FAQPageSchema faqs={companyFaqs} />
      <Breadcrumbs items={breadcrumbs} />
      <div className="min-h-screen overflow-x-hidden">
        <section className="relative min-h-[50vh] flex flex-col items-center justify-start overflow-hidden">
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
            className="relative z-10 pt-10 px-4 max-w-4xl mx-auto pb-28"
          >
            <p className="text-[#A8C117] text-center text-[16px] mb-4 uppercase tracking-wide">
              About Taypro
            </p>
            <h1 className="font-semibold text-[#052638] text-4xl md:text-5xl mb-6 text-center leading-tight">
              Engineers of a
              <br />
              sustainable future
            </h1>
            <p className="text-[#22405a] text-center text-lg md:text-xl leading-relaxed">
              Taypro Private Limited is a Made-in-India manufacturer of autonomous and
              semi-automatic{" "}
              <Link
                href="/solar-panel-cleaning-system"
                className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
              >
                solar panel cleaning robots
              </Link>{" "}
              for utility-scale, commercial, and rooftop PV. From our manufacturing hub in
              Chakan, Pune, we ship waterless dual-pass systems, pan-India spare logistics, and
              the Taypro Console fleet dashboard—so developers and O&amp;M teams can protect
              yield, safety, and water without compromising uptime.
            </p>
          </AnimateOnScroll>

          {/* Add curve SVG or image beneath the form */}
          <div className="absolute bottom-0 left-0 right-0 z-20 overflow-hidden pointer-events-none">
            <svg
              className="w-full h-24 md:h-40"
              viewBox="0 0 1440 320"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path fill="#052638" d="M0,224L1440,96L1440,320L0,320Z" />
            </svg>
          </div>
        </section>

        <section className="w-full py-14 md:py-16 bg-[#052638]">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
                At a glance
              </p>
              <h2 className="text-white font-semibold text-2xl md:text-3xl">
                Manufacturing scale and field footprint
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
                  <div className="text-white/80 text-sm sm:text-base">{stat.label}</div>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        <section className="w-full py-16 bg-[#073448] flex justify-center">
          <div className="max-w-6xl w-full mx-4 md:mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Card: Brand Values */}
            <AnimateOnScroll animation="fadeInLeft" delay={0} className="bg-white px-10 py-10 flex flex-col justify-between shadow-lg min-h-[600px]">
              <div>
                <h3 className="text-[#073448] font-semibold text-2xl mb-8">
                  Our Brand Values
                </h3>
                <ul className="space-y-5 text-lg text-[#245165] mb-10">
                  {[
                    "Innovative",
                    "Powerful",
                    "Consistent",
                    "Agile",
                    "Dependable",
                    "Empathetic",
                    "Excellence",
                  ].map((val) => (
                    <li className="flex items-center gap-2" key={val}>
                      <svg width="24" height="24" fill="none" aria-hidden="true">
                        <path
                          d="M20 6L9 17l-5-5"
                          stroke="#7be117"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {val}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/solar-panel-cleaning-system"
                title="Solar Panel Cleaning Robot"
              >
                <button className="bg-[#96DB00] text-[#073448] text-lg font-medium p-4 rounded-md hover:bg-[#91bc00] hover:text-white transition mt-4 cursor-pointer">
                  Explore Our Solutions
                </button>
              </Link>
            </AnimateOnScroll>
            {/* Middle Card: Sustainability Block */}
            <AnimateOnScroll animation="fadeInUp" delay={100} className="bg-[#75AA00] px-8 py-10 flex flex-col justify-center text-white min-h-[600px]">
              <div className="mb-12">
                <h3 className="mb-3 text-2xl flex leading-relaxed">
                  For our company,
                  <br /> diversity &amp; sustainability
                  <br /> are not just words.
                </h3>
                <p className="text-white/95 text-base leading-relaxed mb-4">
                  Every deployment replaces labour-intensive washing, cuts diesel and water
                  intensity, and returns cleaner megawatt-hours to the grid. See how operating
                  teams quantify savings across live plants.
                </p>
                <Link href="/projects" title="Solar Project">
                  <div className="hover:text-[#caed7f] text-lg underline underline-offset-4 mb-2 cursor-pointer">
                    Explore Projects
                  </div>
                </Link>
              </div>
              <div className="mt-4 mb-6">
                <div className="text-6xl font-semibold mb-2">
                  {tayproMarketingImpactStats.waterSavedAnnually.value}
                </div>
                <div className="text-lg">
                  {tayproMarketingImpactStats.waterSavedAnnually.label}
                </div>
              </div>
              <div>
                <div className="text-5xl font-semibold mb-2">
                  {tayproMarketingImpactStats.co2ReducedAnnually.value}
                </div>
                <div className="text-lg">
                  {tayproMarketingImpactStats.co2ReducedAnnually.label}
                </div>
              </div>
            </AnimateOnScroll>
            {/* Right Card: Image + Community Text */}
            <AnimateOnScroll animation="fadeInRight" delay={200} className="bg-white flex flex-col shadow-lg min-h-[600px] overflow-hidden">
              <div className="w-full h-[360px] relative">
                <Image
                  src="/tayprorobots/taypro-modelT-img.png"
                  alt="Taypro Single-Axis Tracker Solar Panel Cleaning Robot Model-T operating on solar panel array"
                  title="Taypro Single-Axis Tracker Solar Panel Cleaning Robot Model-T"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="px-10 py-10 flex flex-col justify-start flex-grow">
                <div className="text-[#75AA00] font-semibold text-lg mb-2">
                  Community
                </div>
                <h3 className="text-[#073448] text-xl font-medium leading-relaxed">
                  Sustainable energy is our corporate responsibility and obligation to society.
                </h3>
                <p className="mt-4 text-[#245165] text-base leading-relaxed">
                  We design for communities that depend on affordable power—and for the field
                  teams who keep plants running through dust storms, monsoons, and peak summer
                  loads.
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        <section
          className="w-full py-16 md:py-24 bg-white px-4 sm:px-6 lg:px-0 overflow-x-hidden"
          aria-labelledby="company-story-heading"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-0">
            <AnimateOnScroll animation="fadeInUp" className="mb-12 md:mb-16">
              <h2
                id="company-story-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-3"
              >
                Company story, vision, and mission
              </h2>
              <p className="text-[#27415c] text-lg max-w-3xl leading-relaxed">
                Taypro unifies hardware engineering, manufacturing discipline, and field service
                so solar investors get a single accountable partner for robotic cleaning at
                scale.
              </p>
            </AnimateOnScroll>
            {items.map((item, idx) => (
              <AnimateOnScroll
                key={item.label}
                animation="fadeInUp"
                delay={idx * 100}
                className={`grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 items-start mb-10 ${
                  idx !== items.length - 1 ? "border-b border-gray-200 pb-10" : ""
                }`}
              >
                <div className="md:col-span-1 text-[#b2cb19] text-xl font-medium pt-1 md:pt-3">
                  {item.label}
                </div>
                <div className="md:col-span-4">
                  <h3 className="text-[#052638] font-semibold text-2xl sm:text-3xl md:text-4xl leading-tight">
                    {item.heading}
                  </h3>
                  <p className="mt-4 text-[#27415c] text-base md:text-lg leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </section>

        <section
          className="w-full py-16 md:py-20 bg-[#f4f7f9] px-4 sm:px-6"
          aria-labelledby="company-solutions-heading"
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mb-10">
              <h2
                id="company-solutions-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4"
              >
                Robots, services, and fleet software
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                Taypro is a single vendor for hardware, operator-led cleaning, and cloud
                monitoring. Explore each platform for specifications, or read{" "}
                <Link
                  href="/cleaning-technology"
                  className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
                >
                  how our cleaning technology works
                </Link>
                .
              </p>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {robots.map((robot, idx) => (
                <AnimateOnScroll key={robot.model} animation="fadeInUp" delay={idx * 80}>
                  <Link
                    href={robot.href}
                    className="group flex flex-col h-full rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm hover:border-[#A8C117] hover:shadow-md transition"
                  >
                    <div className="relative h-44 w-full bg-[#f0f4f6]">
                      <Image
                        src={robot.imgPath}
                        alt={`${robot.model} - Taypro solar panel cleaning robot`}
                        fill
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-[#052638] font-semibold text-lg mb-2 group-hover:text-[#5a8f00] transition-colors">
                        {robot.model}
                      </h3>
                      <p className="text-[#27415c] text-sm leading-relaxed flex-1">
                        {robot.description}
                      </p>
                      <span className="mt-4 text-[#5a8f00] font-medium text-sm group-hover:underline">
                        View {robot.model} →
                      </span>
                    </div>
                  </Link>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        <section className="w-full py-30 bg-white px-4 sm:px-6 lg:px-0 overflow-x-hidden">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: Image */}
            <AnimateOnScroll animation="fadeInLeft" delay={100} className="flex justify-center items-center">
              <div className="w-[520px] h-[460px] relative overflow-hidden shadow-md">
                <Image
                  src="/tayprosolarpanel/taypro-about1.jpg"
                  alt="Taypro autonomous solar panel cleaning robot operating on a utility-scale PV array"
                  title="Taypro Solar Panel Cleaning Robot Technology"
                  fill
                  sizes="sm"
                  className="object-cover"
                  priority
                />
              </div>
            </AnimateOnScroll>
            {/* Right: Content */}
            <AnimateOnScroll animation="fadeInRight" delay={100} className="flex flex-col justify-center items-center md:items-start text-center md:text-left">
              <h2 className="text-[#b2cb19] text-2xl font-medium mb-4">
                Built for real-world solar sites
              </h2>
              <p className="text-[#27415c] text-lg max-w-xl leading-relaxed mb-4">
                Years of co-development with plant operators taught us that “works in a lab” is
                not enough. Taypro robots are engineered for uneven terrain, tracker curvature,
                RF-dark pockets, and the pace of utility-scale O&amp;M—where every hour of
                downtime matters.
              </p>
              <p className="text-[#27415c] text-lg max-w-xl leading-relaxed">
                Patented dual-pass cleaning, AI-assisted scheduling, LTE/Wi-Fi/mesh connectivity,
                and predictive maintenance workflows come together in platforms such as{" "}
                <Link
                  href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system"
                  className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
                >
                  Model-A
                </Link>{" "}
                and{" "}
                <Link
                  href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers"
                  className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
                >
                  Model-T
                </Link>
                , giving asset managers measurable control over soiling loss.
              </p>
            </AnimateOnScroll>
          </div>
        </section>

        <section className="w-full py-30 bg-white px-4 sm:px-6 lg:px-0 overflow-x-hidden">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: Image */}

            <AnimateOnScroll animation="fadeInLeft" delay={100} className="flex flex-col justify-center items-center md:items-start text-center md:text-left order-2 md:order-1">
              <h2 className="text-[#b2cb19] text-2xl font-medium mb-4">
                Collaboration from design to dispatch
              </h2>
              <p className="text-[#27415c] text-lg max-w-xl leading-relaxed mb-4">
                Taypro partners with tier-one component suppliers, specialist manufacturers, and
                on-ground commissioning crews so every robot leaves our line ready for harsh
                field duty—not a science project awaiting custom fixes on site.
              </p>
              <p className="text-[#27415c] text-lg max-w-xl leading-relaxed">
                That ecosystem mindset is how we scale to{" "}
                <span className="whitespace-nowrap">{metrics[1].value}</span>{" "}
                robots per month of manufacturing capacity, stock{" "}
                <span className="whitespace-nowrap">{metrics[2].value}</span>{" "}
                warehouses across India, and honour commitments like same-day breakdown support
                for fleets monitored in{" "}
                <Link
                  href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app"
                  className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
                >
                  Taypro Console
                </Link>
                .
              </p>
            </AnimateOnScroll>

            {/* Right: Content */}
            <AnimateOnScroll animation="fadeInRight" delay={100} className="flex justify-center items-center order-1 md:order-2">
              <div className="w-[520px] h-[460px] relative overflow-hidden shadow-md">
                <Image
                  src="/tayprosolarpanel/taypro-about2.webp"
                  alt="Taypro engineering and manufacturing collaboration for solar panel cleaning robot production"
                  title="Taypro Solar Panel Cleaning Robot Collaborative Development"
                  fill
                  sizes="sm"
                  className="object-cover"
                  priority
                />
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        <section
          className="w-full py-16 md:py-20 bg-[#052638] px-4 sm:px-6"
          aria-labelledby="partner-journey-heading"
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mx-auto text-center mb-12">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
                How we engage
              </p>
              <h2
                id="partner-journey-heading"
                className="text-white font-semibold text-3xl md:text-4xl mb-4"
              >
                From first conversation to fleet operations
              </h2>
              <p className="text-white/85 text-lg leading-relaxed">
                Developers, IPPs, and O&amp;M teams typically follow a structured path with Taypro—
                whether you are evaluating a single block or a multi-hundred-megawatt portfolio.
              </p>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {partnerSteps.map((step, idx) => (
                <AnimateOnScroll key={step.step} animation="fadeInUp" delay={idx * 100}>
                  <article className="rounded-lg border border-white/15 bg-white/5 p-6 md:p-8 h-full">
                    <span className="text-[#A8C117] font-semibold text-2xl mb-3 block">
                      {step.step}
                    </span>
                    <h3 className="text-white font-semibold text-xl mb-3">{step.title}</h3>
                    <p className="text-white/80 leading-relaxed">{step.description}</p>
                  </article>
                </AnimateOnScroll>
              ))}
            </div>
            <AnimateOnScroll animation="fadeInUp" delay={400} className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center min-h-[48px] border border-white/60 text-white font-medium px-6 py-3 rounded-lg hover:bg-white/10 transition"
              >
                View projects
              </Link>
              <Link
                href="/solar-panel-cleaning-robot-price-calculator"
                className="inline-flex items-center justify-center min-h-[48px] bg-[#b2cb19] text-[#22405a] font-medium px-6 py-3 rounded-lg hover:bg-lime-500 transition"
              >
                ROI calculator
              </Link>
            </AnimateOnScroll>
          </Container>
        </section>

        <section className="w-full py-16 md:py-24 bg-white px-4 sm:px-6 lg:px-0 overflow-x-hidden">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl mb-3">
              Scale you can spec with confidence
            </h2>
            <p className="text-[#27415c] text-lg leading-relaxed">
              Benchmarks reflect our manufacturing investments, nationwide logistics footprint, and
              obsession with repeatable cleaning performance across India&apos;s diverse solar
              geographies.
            </p>
          </div>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 text-center">
            {metrics.map((stat, idx) => (
              <AnimateOnScroll key={stat.label} animation="scaleIn" delay={idx * 150} className="flex flex-col items-center">
                <span className="text-[#b2cb19] font-semibold text-6xl mb-2">
                  {stat.value}
                </span>
                <span className="text-[#b2cb19] text-lg">{stat.label}</span>
              </AnimateOnScroll>
            ))}
          </div>
        </section>

        <section className="w-full py-30 px-4 sm:px-6 lg:px-0 overflow-x-hidden bg-[#073448]">
          <div className="max-w-7xl mx-auto">
            <AnimateOnScroll animation="fadeInUp" className="text-white mb-8">
              <h2 className="font-semibold text-4xl mb-3">Leadership team</h2>
              <p className="text-white/90 text-lg max-w-3xl font-normal leading-relaxed">
                Meet the executives guiding Taypro&apos;s product roadmap, manufacturing scale, and
                customer partnerships across India&apos;s solar sector.
              </p>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 team-cards-container">
              {founders.map((f, idx) => (
                <AnimateOnScroll key={f.name} animation="scaleIn" delay={idx * 150}>
                <div
                  className="team-card relative group overflow-hidden shadow-2xl flex flex-col bg-white items-center rounded-lg hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
                  style={{ willChange: 'transform, opacity' }}
                >
                  {/* Vignette overlay for entire card - radial gradient effect */}
                  <div 
                    className="absolute inset-0 z-10 pointer-events-none rounded-lg transition-opacity group-hover:opacity-90"
                    style={{
                      background: 'radial-gradient(circle at center, transparent 0%, transparent 50%, rgba(0,0,0,0.12) 100%)',
                      transitionDuration: '600ms',
                      transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  ></div>
                  {/* Subtle border frame effect for entire card */}
                  <div 
                    className="absolute inset-0 z-10 border-4 border-white/40 rounded-lg pointer-events-none transition-all group-hover:border-white/60"
                    style={{
                      transitionDuration: '600ms',
                      transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  ></div>
                  
                  <div className="relative h-[280px] w-full flex justify-center items-center overflow-hidden bg-gradient-to-b from-gray-50 to-white">
                    <Image
                      src={f.img}
                      alt={`${f.name} - ${f.role} at Taypro, leading Solar Panel Cleaning Robot manufacturer`}
                      title={`${f.name} - ${f.role} at Taypro`}
                      height={280}
                      width={220}
                      className="object-cover object-center transition-transform group-hover:scale-110 relative z-0"
                      style={{ 
                        willChange: 'transform',
                        transitionDuration: '600ms',
                        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                      }}
                    />
                    {/* Additional bottom vignette for depth on image */}
                    <div 
                      className="absolute inset-0 z-10 bg-gradient-to-t from-black/15 via-transparent to-transparent pointer-events-none opacity-70 group-hover:opacity-50 transition-opacity"
                      style={{
                        transitionDuration: '600ms',
                        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    ></div>
                    {/* Corner vignette effects on image */}
                    <div className="absolute inset-0 z-10 bg-gradient-to-br from-black/10 via-transparent to-transparent pointer-events-none opacity-50"></div>
                    <div className="absolute inset-0 z-10 bg-gradient-to-tl from-black/10 via-transparent to-transparent pointer-events-none opacity-50"></div>
                  </div>
                  <div 
                    className="relative z-20 w-full flex flex-col items-center px-4 pb-4 pt-4 transition-transform group-hover:-translate-y-2"
                    style={{
                      transitionDuration: '600ms',
                      transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                  >
                    <div 
                      className="font-semibold text-xl mb-1 text-center text-[#052638] transition-all group-hover:text-2xl group-hover:mb-2"
                      style={{
                        transitionDuration: '600ms',
                        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                      }}
                    >{f.name}</div>
                    <div 
                      className="text-[#7be117] text-base mb-3 text-center transition-all group-hover:text-lg group-hover:mb-4"
                      style={{
                        transitionDuration: '600ms',
                        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                      }}
                    >
                      {f.role}
                    </div>
                    <a
                      href={f.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                opacity-100 pointer-events-auto translate-y-0
                md:opacity-0 md:pointer-events-none md:translate-y-4 
                md:group-hover:opacity-100 md:group-hover:pointer-events-auto md:group-hover:translate-y-0 
                transition-all flex items-center gap-2 text-[#7be117] hover:text-[#a8ef17]"
                      style={{
                        transitionDuration: '600ms',
                        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                      }}
                      aria-label={`LinkedIn of ${f.name}`}
                    >
                      <Linkedin 
                        size={20} 
                        className="transition-transform group-hover:scale-[1.8] md:group-hover:scale-[1.8]"
                        style={{
                          transitionDuration: '600ms',
                          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                      />
                    </a>
                  </div>
                  {/* Corner vignette effects for entire card */}
                  <div 
                    className="absolute inset-0 z-10 bg-gradient-to-br from-black/8 via-transparent to-transparent pointer-events-none opacity-60 rounded-lg transition-opacity group-hover:opacity-40"
                    style={{
                      transitionDuration: '600ms',
                      transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  ></div>
                  <div 
                    className="absolute inset-0 z-10 bg-gradient-to-tl from-black/8 via-transparent to-transparent pointer-events-none opacity-60 rounded-lg transition-opacity group-hover:opacity-40"
                    style={{
                      transitionDuration: '600ms',
                      transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  ></div>
                </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-16 bg-white overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row justify-between items-start gap-10">
            {/* Left: Title, description, button */}
            <AnimateOnScroll animation="fadeInLeft" delay={0} className="flex flex-col w-full lg:w-2/5">
              <h2 className="text-[#052638] font-semibold text-4xl sm:text-5xl mb-5">
                Resources
              </h2>
              <p className="text-[#22405a] text-lg sm:text-xl mt-4 leading-relaxed">
                Deep dives on soiling science, maintenance economics, and emerging PV technologies
                help finance, engineering, and O&amp;M leaders align on what robotic cleaning can
                unlock. Bookmark these guides or browse the full archive for procurement-ready
                insights.
              </p>
              <Link href="/blog" title="blog">
                <button className="mt-6 inline-block w-full sm:w-auto bg-[#b2cb19] text-[#22405a] text-xl text-center py-2 px-4 rounded-lg hover:bg-lime-500 transition cursor-pointer">
                  View all resources
                </button>
              </Link>
            </AnimateOnScroll>

            {/* Right: Card resources (stack on mobile, row on desktop) */}
            <div className="w-full lg:w-3/5">
              <div className="flex flex-col md:flex-row gap-8">
                {resources.map((r, idx) => (
                  <AnimateOnScroll key={r.title} animation="fadeInRight" delay={idx * 200}>
                  <div
                    key={r.title}
                    className="flex-1 border-2 border-gray-300 bg-white rounded-sm overflow-hidden shadow-sm min-w-[320px] max-w-[400px] transition hover:shadow-xl"
                  >
                    <Link
                      title="Energy Resources"
                      href={r.href}
                      className="block w-full h-full p-0 overflow-hidden group relative"
                    >
                      {/* Image with overlay title */}
                      <div className="relative w-full h-[360px]">
                        <Image
                          src={r.imgSrc}
                          alt={`${r.title} - Solar Panel Cleaning Robot technology and solar energy resource article by Taypro`}
                          title={`${r.title} - Solar Panel Cleaning Robot Energy Resource`}
                          fill
                          sizes="sm"
                          className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-105"
                          priority
                        />
                        <h3 className="absolute bottom-4 left-4 text-white text-sm font-semibold bg-opacity-30 px-3 py-1 transition-transform duration-300 transform translate-y-4 group-hover:translate-y-0">
                          {r.title}
                        </h3>
                      </div>
                      {/* Date overlay */}
                      <div className="absolute bottom-4 right-4 text-white text-xs bg-black bg-opacity-30 px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {r.date}
                      </div>
                    </Link>
                  </div>
                  </AnimateOnScroll>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 bg-white px-4 sm:px-6 border-t border-gray-100">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center max-w-3xl mx-auto">
              <h2 className="text-[#052638] font-semibold text-2xl md:text-3xl mb-4">
                Continue exploring Taypro
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed mb-8">
                Dive into live deployments, technical deep-dives, and tools to model savings on
                your plant.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { label: "Installation projects", href: "/projects" },
                  { label: "Cleaning technology", href: "/cleaning-technology" },
                  { label: "All robot models", href: "/solar-panel-cleaning-system" },
                  { label: "Contact sales", href: "/contact" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-lg border border-[#052638] text-[#052638] font-medium hover:bg-[#052638] hover:text-white transition"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        <section
          className="w-full py-16 md:py-20 bg-[#f4f7f9] px-4 sm:px-6 overflow-x-hidden"
          aria-labelledby="company-faq-heading"
        >
          <div className="max-w-3xl mx-auto">
            <AnimateOnScroll animation="fadeInUp">
              <h2
                id="company-faq-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-3 text-center"
              >
                Frequently asked questions
              </h2>
              <p className="text-[#27415c] text-center text-lg mb-10 leading-relaxed">
                Quick answers for partners evaluating Taypro as their solar cleaning robotics vendor.
              </p>
            </AnimateOnScroll>
            <div className="space-y-6">
              {companyFaqs.map((faq, idx) => (
                <AnimateOnScroll key={faq.question} animation="fadeInUp" delay={idx * 80}>
                  <article className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-[#052638] font-semibold text-lg mb-3">{faq.question}</h3>
                    <p className="text-[#27415c] leading-relaxed">{faq.answer}</p>
                  </article>
                </AnimateOnScroll>
              ))}
            </div>
            <AnimateOnScroll animation="fadeInUp" delay={200} className="mt-10 text-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center min-h-[48px] bg-[#b2cb19] text-[#22405a] font-medium px-8 py-3 rounded-lg hover:bg-lime-500 transition"
              >
                Talk to our team
              </Link>
            </AnimateOnScroll>
          </div>
        </section>

        <CallbackCard headerText={""} />
      </div>
    </>
  );
}
