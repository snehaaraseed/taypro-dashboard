"use client";

import Image from "next/image";
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
import { faqs, modelCards } from "@/app/data";
import { useState } from "react";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import CallbackCard from "@/app/components/CallbackCard";
import ProjectsCard from "@/app/components/ProjectsCard";
import ModelCards from "@/app/components/ModelCards";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import ROITayproCalculator from "@/app/components/ROICalculator";
import { ProductSchema } from "@/app/components/StructuredData";
import Link from "next/link";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import Product360Viewer from "@/app/components/Product360Viewer";
import { Container } from "@/app/components/Container";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

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
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <ProductSchema
        name="Automatic Solar Panel Cleaning Robot - Model A"
        description="Model-A: Fully automatic Solar Panel Cleaning Robot with AI-enabled technology. Removes up to 100% dust and debris. Autonomous waterless cleaning for utility-scale solar power plants."
        image={`${siteUrl}/tayproasset/taypro-robotImage.png`}
        brand="Taypro"
        sku="MODEL-A"
        offers={{
          price: "Contact for pricing",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
        }}
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
                  Automatic Solar Panel Cleaning Robot: <br /> MODEL-A
                </h1>
                <div className="text-base sm:text-xl text-white leading-relaxed max-w-xl mb-8 sm:mb-9">
                  Autonomous Waterless Solar Panel Cleaning Robot for Utility
                  Scale Solar Power Plants
                </div>
                <Link
                  href="/contact"
                  className="bg-[#A8C117] inline-block w-full sm:w-auto sm:min-w-[240px] px-8 sm:px-12 py-4 sm:py-5 text-[#052638] font-medium text-base sm:text-xl text-center transition hover:bg-[#b3cf3d]"
                >
                  Request a quote
                </Link>
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
                { Icon: Cloud, label: "Cloud-Based Remote Monitoring" },
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

        <ProjectsCard />

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
                AI-Enabled Waterless Cleaning Model-A
              </h3>
            </AnimateOnScroll>

            <div className="text-gray-600 my-6 text-base sm:text-xl">
              Model-A uses AI-enabled technology to perform highly efficient
              cleaning cycles. It removes up to 100% dust and debris.
            </div>

            <AnimateOnScroll animation="fadeInUp" delay={200}>
              <h3 className="mt-8 sm:mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
                Extended Cleaning Range
              </h3>
            </AnimateOnScroll>

            <div className="text-gray-600 my-6 text-base sm:text-xl">
              Model A can clean up to 2.2km of solar panels on a single charge.
              The robot has a high-speed cleaning rate of 14 meters per minute.
              The robot’s dual pass mechanism makes it more efficient and
              effective in its cleaning cycles.
            </div>

            <AnimateOnScroll animation="fadeInUp" delay={300}>
              <h3 className="mt-8 sm:mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
                Smart Weather Optimization
              </h3>
            </AnimateOnScroll>

            <div className="text-gray-600 my-6 text-base sm:text-xl">
              Model-A comes with advanced AI-driven weather analysis that
              smartly adjusts the cleaning schedule. The automatic solar
              cleaning robot senses wind speed, rain probability, and dust
              storms and schedules its cleaning cycles accordingly.
            </div>

            <AnimateOnScroll animation="fadeInUp" delay={400}>
              <h3 className="mt-8 sm:mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
                Advanced Remote Monitoring
              </h3>
            </AnimateOnScroll>

            <div className="text-gray-600 my-6 text-base sm:text-xl">
              Model-A comes with a fully automated operation that allows
              real-time tracking and scheduling. The cloud-based remote
              monitoring portal allows tracking and greater control over the
              operations.
            </div>

            <AnimateOnScroll animation="fadeInUp" delay={500}>
              <h3 className="mt-8 sm:mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
                Edge & Obstacle Detection Technology
              </h3>
            </AnimateOnScroll>

            <div className="text-gray-600 my-6 text-base sm:text-xl">
              Model-A built-in advanced high-precision edge detection sensors
              that detect the panel edges. These sensors can detect uneven
              surfaces and other potential hazards.
            </div>
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
                    750 mm × 8800 mm (Max)
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
                    14 Meters/Minute
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
                    55 km/hr
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
                    +-25 mm
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
                    C5
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    Battery Type
                  </td>
                  <td className="py-3 px-6 border-t text-base md:text-lg">
                    Lithium
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

        <section
          className="w-full py-24 bg-[#052638] bg-center"
          style={{
            backgroundImage: "url('/tayproasset/taypro-spiral.png')",
            backgroundRepeat: "no-repeat",
          }}
        >
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
              <h2>How Does Automatic Solar Panel Cleaning Robot Work?</h2>
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
            {faqs.map((faq, idx) => (
              <div key={idx} className="border-b border-gray-300">
                <button
                  className={`flex items-center w-full py-2 text-base sm:text-xl font-medium transition-colors duration-200 text-[#052638] hover:text-[#A8C117] cursor-pointer`}
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                >
                  <span className="flex items-center justify-center w-6 h-6 bg-[#052638] text-white font-semibold rounded-sm mr-4 text-xl select-none">
                    {openIndex === idx ? "-" : "+"}
                  </span>
                  <h3>{faq.question}</h3>
                </button>
                <div
                  className={`grid pl-16 pr-4 text-sm sm:text-base text-[#052638] transition-all duration-200 ${
                    openIndex === idx
                      ? "grid-rows-[1fr] opacity-100 pb-6"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">{faq.answer}</div>
                </div>
              </div>
            ))}
          </Container>
        </section>

        <ModelCards title="Looking for more solutions?" cards={modelCards} />

        <RequestEstimateForm />
      </div>
    </>
  );
}
