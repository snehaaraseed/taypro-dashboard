"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import YouTubeEmbed from "@/app/components/YouTubeEmbed";

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

interface HomePageInteractiveProps {
  features: Array<{ title: string; description: string }>;
  otherFeatures: Array<{ title: string; description: string }>;
}

export default function HomePageInteractive({
  features,
  otherFeatures,
}: HomePageInteractiveProps) {
  return (
    <>
      {/* Video Section with YouTube Embed */}
      <section className="px-4 sm:px-8 lg:px-16 py-20 lg:py-40 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <AnimateOnScroll animation="fadeInUp" className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-[#052638] mb-4 px-4">
              How Our Solar Panel Cleaning Robot Drives Unstoppable Power Generation
            </h2>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <AnimateOnScroll animation="fadeInLeft" delay={100} className="order-2 lg:order-1">
              <YouTubeEmbed
                videoId="PiXJhQ_MYgk"
                title="TAYPRO - Robotic Solar Panel Cleaning"
                className="w-full max-w-lg lg:max-w-none mx-auto shadow-2xl rounded-lg"
              />
            </AnimateOnScroll>

            <div className="space-y-6 lg:space-y-8 order-1 lg:order-2">
              {features.map((feature, idx) => (
                <AnimateOnScroll key={idx} animation="fadeInRight" delay={idx * 100} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <svg
                      className="text-[#39D600] w-5 h-5 lg:w-6 lg:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
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

      {/* Advanced Technology Section */}
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
                    <svg
                      className="text-[#39D600] w-5 h-5 lg:w-6 lg:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
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
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ROI Calculator Section */}
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
    </>
  );
}

