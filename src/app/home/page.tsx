import Image from "next/image";
import { Check } from "lucide-react";
import { robots, features, otherFeatures } from "@/app/data";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import { RobotCard } from "@/app/components/RobotCard";
import ClientsCard from "@/app/components/ClientsCard";
import ROITayproCalculator from "@/app/components/ROICalculator";

export default function HomePage() {
  return (
    <>
      <div className="min-h-screen overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 sm:px-8 lg:px-15 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center">
            <div className="text-white space-y-6 lg:space-y-12 lg:col-span-2">
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-semibold">
                Delivering{" "}
                <span className="text-[#39D600]">
                  Solar Cleaning Robots With
                </span>
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                Highest Up-Time Guarantee.
              </div>

              <p className="text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed max-w-full lg:max-w-3xl">
                For Greater Plant Performance Ratio, Unstoppable Power
                Generation and Intelligent AI & ML Driven Robotics.
              </p>
            </div>

            <div className="lg:col-span-1 flex justify-center lg:justify-end">
              <Image
                src="/tayprorobots/robot-hero.png"
                alt="Solar Panel Cleaning Robot"
                title="Solar Panel Cleaning Robot"
                width={600}
                height={900}
                priority
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-8 lg:px-16 py-20 lg:py-40 bg-white relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-[#052638] mb-4 px-4">
                Driving Unstoppable Power Generation.
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="aspect-video w-full max-w-lg lg:max-w-none mx-auto overflow-hidden shadow-2xl rounded-lg">
                  <iframe
                    src="https://www.youtube.com/embed/PiXJhQ_MYgk?si=69CgiggHsM73CRl_"
                    title="TAYPRO - Robotic Solar Panel Cleaning"
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>

              <div className="space-y-6 lg:space-y-8 order-1 lg:order-2">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-start space-x-4">
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
                  </div>
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
                <h5 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white text-center lg:text-left lg:ml-25">
                  Our Robotics technology
                </h5>
                {otherFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-start space-x-4">
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
                  </div>
                ))}
              </div>

              <div className="order-1 lg:order-2 flex justify-center">
                <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-full">
                  <Image
                    src="/tayproasset/robots.png"
                    alt="Solar Panel Cleaning Robot"
                    title="Solar Panel Cleaning Robot"
                    width={600}
                    height={900}
                    priority
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-12 lg:pt-40 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8 lg:mb-12">
              <h6 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">
                High-Tech Solar Cleaning Robots
              </h6>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center space-y-6 sm:space-y-0 sm:space-x-6 px-4 sm:px-0">
              {robots.slice(0, 3).map((robot) => (
                <RobotCard key={robot.model} robot={robot} />
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center space-y-6 sm:space-y-0 sm:space-x-6 px-4 sm:px-0 mt-8">
              {robots.slice(3).map((robot) => (
                <RobotCard key={robot.model} robot={robot} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 lg:pt-40 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold leading-tight mb-4">
                Calculate How Much Can Solar Cleaning{" "}
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>Robots Save?
              </h1>
              <h3 className="text-gray-700 my-4 lg:my-6 text-base sm:text-lg px-4">
                Solar Cleaning robots not only increase the overall efficiency
                of the solar power plant but also save significant{" "}
                <br className="hidden lg:block" />
                <span className="lg:hidden"> </span>costs.
              </h3>
            </div>
          </div>

          <ROITayproCalculator />
        </section>

        <ClientsCard />

        <RequestEstimateForm />
      </div>
    </>
  );
}
