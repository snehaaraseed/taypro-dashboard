"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { Check } from "lucide-react";
import { robots, features, otherFeatures } from "@/app/data";
import { RobotCard } from "@/app/components/RobotCard";
import { VideoObjectSchema, ProductSchema } from "@/app/components/StructuredData";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";

// Lazy load heavy components
const ROITayproCalculator = dynamic(() => import("@/app/components/ROICalculator"), {
  loading: () => <div className="min-h-[400px] flex items-center justify-center"><div className="animate-pulse text-gray-400">Loading calculator...</div></div>,
  ssr: false, // ROI Calculator uses client-side libraries
});

const RequestEstimateForm = dynamic(() => import("@/app/components/RequestEstimateForm"), {
  loading: () => <div className="min-h-[300px] flex items-center justify-center"><div className="animate-pulse text-gray-400">Loading form...</div></div>,
});

const ClientsCard = dynamic(() => import("@/app/components/ClientsCard"), {
  loading: () => <div className="min-h-[200px] flex items-center justify-center"><div className="animate-pulse text-gray-400">Loading clients...</div></div>,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export default function HomePage() {
  return (
    <>
      <VideoObjectSchema
        name="TAYPRO - Robotic Solar Panel Cleaning - Solar Panel Cleaning Robot"
        description="Watch how Taypro's Solar Panel Cleaning Robot autonomously cleans solar panels at utility-scale solar farms. Our waterless robotic cleaning system increases efficiency up to 30% with AI-powered scheduling."
        thumbnailUrl="https://img.youtube.com/vi/PiXJhQ_MYgk/maxresdefault.jpg"
        uploadDate="2024-01-01"
        embedUrl="https://www.youtube.com/embed/PiXJhQ_MYgk"
        contentUrl="https://www.youtube.com/watch?v=PiXJhQ_MYgk"
      />
      <ProductSchema
        name="Solar Panel Cleaning Robot - Model A"
        description="Autonomous waterless Solar Panel Cleaning Robot with AI-powered scheduling. Increases solar plant efficiency up to 30% with highest uptime guarantee."
        image={`${siteUrl}/tayproasset/taypro-robotImage.png`}
        brand="Taypro"
        sku="MODEL-A"
        offers={{
          price: "Contact for pricing",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
        }}
        siteUrl={siteUrl}
      />
      <div className="min-h-screen overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 sm:px-8 lg:px-15 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center">
            <AnimateOnScroll animation="fadeInRight" delay={0} className="text-white space-y-6 lg:space-y-12 lg:col-span-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-semibold">
                Delivering{" "}
                <span className="text-[#39D600]">
                  Solar Panel Cleaning Robots With
                </span>
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                Highest Up-Time Guarantee.
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed max-w-full lg:max-w-3xl">
                Our autonomous Solar Panel Cleaning Robot delivers greater plant performance ratio, unstoppable power generation and intelligent AI & ML driven robotic cleaning for solar farms.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fadeInLeft" delay={100} className="lg:col-span-1 flex justify-center lg:justify-end">
              <Image
                src="/tayprorobots/robot-hero.png"
                alt="Taypro Autonomous Solar Panel Cleaning Robot - Waterless robotic cleaning system for solar farms"
                title="Solar Panel Cleaning Robot by Taypro"
                width={600}
                height={900}
                priority
                quality={85}
                className="w-full h-auto"
              />
            </AnimateOnScroll>
          </div>
        </section>

        <section className="px-4 sm:px-8 lg:px-16 py-20 lg:py-40 bg-white relative">
          <div className="max-w-7xl mx-auto">
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-[#052638] mb-4 px-4">
                How Our Solar Panel Cleaning Robot Drives Unstoppable Power Generation
              </h2>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <AnimateOnScroll animation="fadeInLeft" delay={100} className="order-2 lg:order-1">
                <div className="aspect-video w-full max-w-lg lg:max-w-none mx-auto overflow-hidden shadow-2xl rounded-lg">
                  <iframe
                    src="https://www.youtube.com/embed/PiXJhQ_MYgk?si=69CgiggHsM73CRl_&loading=lazy"
                    title="TAYPRO - Robotic Solar Panel Cleaning"
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                </div>
              </AnimateOnScroll>

              <div className="space-y-6 lg:space-y-8 order-1 lg:order-2">
                {features.map((feature, idx) => (
                  <AnimateOnScroll key={idx} animation="fadeInRight" delay={idx * 100} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <Check
                        className="text-[#39D600] w-5 h-5 lg:w-6 lg:h-6"
                        strokeWidth={2}
                      />
                    </div>
                    <div>
                      <div className="text-lg sm:text-xl font-semibold text-[#052638] italic">
                        {feature.title}
                      </div>
                      <span className="text-sm sm:text-base text-gray-600 leading-relaxed italic">
                        {feature.description}
                      </span>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute top-0 left-0 w-32 h-32 lg:w-64 lg:h-64 bg-[#39D600]/5 rounded-full blur-3xl -translate-x-16 lg:-translate-x-32 -translate-y-16 lg:-translate-y-32"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 lg:w-96 lg:h-96 bg-[#052638]/5 rounded-full blur-3xl translate-x-16 lg:translate-x-32 translate-y-16 lg:translate-y-32"></div>
        </section>

        <section className="px-4 sm:px-8 lg:px-10 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="space-y-6 lg:space-y-8 order-2 lg:order-1">
                <AnimateOnScroll animation="fadeInUp">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white text-center lg:text-left lg:ml-25">
                    Advanced Solar Panel Cleaning Robot Technology
                  </h2>
                </AnimateOnScroll>
                {otherFeatures.map((feature, idx) => (
                  <AnimateOnScroll key={idx} animation="fadeInLeft" delay={idx * 100} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <Check
                        className="text-[#39D600] w-5 h-5 lg:w-6 lg:h-6"
                        strokeWidth={2}
                      />
                    </div>
                    <div>
                      <div className="text-lg sm:text-xl font-semibold text-white">
                        {feature.title}
                      </div>
                      <span className="text-sm sm:text-base text-white/90 leading-relaxed">
                        {feature.description}
                      </span>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>

              <AnimateOnScroll animation="fadeInRight" delay={100} className="order-1 lg:order-2 flex justify-center">
                <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-full">
                  <Image
                    src="/tayproasset/robots.png"
                    alt="Taypro Solar Panel Cleaning Robot Models - Automatic and Semi-Automatic robotic cleaning systems"
                    title="Solar Panel Cleaning Robot Models by Taypro"
                    width={600}
                    height={900}
                    loading="lazy"
                    className="w-full h-auto"
                  />
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        <section className="pt-12 lg:pt-40 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-8 lg:mb-12">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">
                High-Tech Solar Panel Cleaning Robots
              </h3>
            </AnimateOnScroll>

            <div className="flex flex-col sm:flex-row justify-center items-center space-y-6 sm:space-y-0 sm:space-x-6 px-4 sm:px-0">
              {robots.slice(0, 3).map((robot, idx) => (
                <AnimateOnScroll key={robot.model} animation="scaleIn" delay={idx * 150}>
                  <RobotCard robot={robot} />
                </AnimateOnScroll>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center space-y-6 sm:space-y-0 sm:space-x-6 px-4 sm:px-0 mt-8">
              {robots.slice(3).map((robot, idx) => (
                <AnimateOnScroll key={robot.model} animation="scaleIn" delay={(idx + 3) * 150}>
                  <RobotCard robot={robot} />
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 lg:pt-40 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <AnimateOnScroll animation="fadeInUp" className="text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold leading-tight mb-4">
                Calculate How Much Can Our Solar Panel Cleaning Robot{" "}
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>Save You?
              </h2>
              <h5 className="text-gray-700 my-4 lg:my-6 text-base sm:text-lg px-4">
                Our Solar Panel Cleaning Robot not only increases the overall efficiency
                of the solar power plant but also saves significant{" "}
                <br className="hidden lg:block" />
                <div className="lg:hidden"> </div>operational costs through automated cleaning.
              </h5>
            </AnimateOnScroll>
          </div>

          <ROITayproCalculator />
        </section>

        <ClientsCard />

        <RequestEstimateForm />
      </div>
    </>
  );
}
