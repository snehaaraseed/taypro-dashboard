import Image from "next/image";
import { Check } from "lucide-react";
import { robots, features, otherFeatures } from "@/app/data";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import { RobotCard } from "@/app/components/RobotCard";
import ClientsCard from "@/app/components/ClientsCard";
import SEO from "@/app/components/SEO";

export default function HomePage() {
  const breadcrumbs = [{ name: "Home", href: "/" }];
  return (
    <>
      <SEO
        title="Taypro is a Solar Panel Cleaning Company. We provide end to end ROI Solar Cleaning Service to improve Solar Plant Efficiency."
        description="Taypro is a Solar Panel Cleaning Company. We provide end to end ROI Solar Cleaning Service to improve Solar Plant Efficiency."
        keywords="solar panel cleaning robots, automatic solar robot, semi-automatic solar robots, capex, opex, cleaning robots, taypro"
        url="http://localhost:3000/solar-robots/solar-panel-cleaning-service"
        breadcrumbs={breadcrumbs}
      />
      <div className="min-h-screen overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 sm:px-8 lg:px-15 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center">
            {/* Left Content - Now takes 2/3 of the width */}
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

            {/* Right Content - Robot Image - Takes 1/3 of the width */}
            <div className="lg:col-span-1 flex justify-center lg:justify-end">
              {/* <div className="relative w-full max-w-xs sm:max-w-sm lg:max-w-full"> */}
              <Image
                src="/robot-hero.png"
                alt="Solar Panel Cleaning Robot"
                width={600}
                height={900}
                priority
                className="w-full h-auto"
              />
              {/* </div> */}
            </div>
          </div>
        </section>

        {/* Features Section with Video */}
        <section className="px-4 sm:px-8 lg:px-16 py-12 lg:py-24 bg-white relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-[#052638] mb-4 px-4">
                Driving Unstoppable Power Generation.
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Content - Video */}
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

              {/* Right Content - Features List */}
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

          {/* Background Decorative Elements */}
          <div className="absolute top-0 left-0 w-32 h-32 lg:w-64 lg:h-64 bg-[#39D600]/5 rounded-full blur-3xl -translate-x-16 lg:-translate-x-32 -translate-y-16 lg:-translate-y-32"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 lg:w-96 lg:h-96 bg-[#052638]/5 rounded-full blur-3xl translate-x-16 lg:translate-x-32 translate-y-16 lg:translate-y-32"></div>
        </section>

        {/* Third Section - Robotics Technology */}
        <section className="px-4 sm:px-8 lg:px-10 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Content - Features List */}
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

              {/* Right Content - Image */}
              <div className="order-1 lg:order-2 flex justify-center">
                <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-full">
                  <Image
                    src="/robots.png"
                    alt="Solar Panel Cleaning Robot"
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

        {/* Fourth Section - Robot Cards */}
        <section className="pt-12 lg:pt-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8 lg:mb-12">
              <h6 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">
                High-Tech Solar Cleaning Robots
              </h6>
            </div>

            {/* Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 place-items-center mb-4 lg:mb-6">
              {robots.slice(0, 3).map((robot) => (
                <div key={robot.model} className="w-full flex justify-center">
                  <RobotCard robot={robot} />
                </div>
              ))}
            </div>

            {/* Row 2 - ensure centered on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 place-items-center">
              {robots.slice(3).map((robot, idx, arr) => (
                <div
                  key={robot.model}
                  className={
                    arr.length === 1
                      ? "w-full flex justify-center lg:col-start-2"
                      : arr.length === 2 && idx === 0
                      ? "w-full flex justify-center lg:col-start-1"
                      : "w-full flex justify-center"
                  }
                >
                  <RobotCard robot={robot} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fifth Section - Calculate Savings */}
        <section className="py-12 lg:py-16 bg-white">
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
        </section>

        {/* Sixth Section - Clients */}
        <ClientsCard />

        {/* Seventh Section - Request Estimate */}
        <RequestEstimateForm />
      </div>
    </>
  );
}
